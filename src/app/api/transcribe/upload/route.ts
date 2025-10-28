import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getUserSubscription } from '@/lib/subscription';
import OpenAI from 'openai';
import { 
  downloadFromStorage, 
  deleteFromStorage,
  uploadToTempStorage 
} from '@/lib/supabaseStorage';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB for Pro users
const WHISPER_MAX_SIZE = 25 * 1024 * 1024; // 25MB Whisper limit
const CHUNK_SIZE = 24 * 1024 * 1024; // 24MB chunks

export async function POST(request: NextRequest) {
  let storagePath: string | null = null;

  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check subscription
    const subscription = await getUserSubscription(user.id);
    
    if (subscription.plan === 'free') {
      return NextResponse.json(
        { 
          error: 'Audio/Video upload requires Pro or Enterprise plan',
          upgradeUrl: '/checkout?plan=pro'
        },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const meetingTitle = formData.get('meetingTitle') as string;
    const needsChunking = formData.get('needsChunking') === 'true';
    
    // Check if it's a storage path or actual file
    const storagePathParam = formData.get('storagePath') as string | null;
    const fileParam = formData.get('file') as File | null;

    if (!storagePathParam && !fileParam) {
      return NextResponse.json(
        { error: 'No file or storage path provided' },
        { status: 400 }
      );
    }

    let fileToProcess: Blob;
    let fileName: string;
    let fileSize: number;

    if (storagePathParam) {
      // File already uploaded to Supabase - download it
      console.log('📥 Downloading from storage:', storagePathParam);
      storagePath = storagePathParam;

      const downloadResult = await downloadFromStorage(storagePathParam);
      if (!downloadResult.success || !downloadResult.data) {
        throw new Error(downloadResult.error || 'Failed to download file');
      }

      fileToProcess = downloadResult.data;
      fileSize = downloadResult.data.size;
      fileName = storagePathParam.split('/').pop() || 'recording';
    } else if (fileParam) {
      // Direct file upload (legacy path)
      fileToProcess = fileParam;
      fileSize = fileParam.size;
      fileName = fileParam.name;
    } else {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    console.log(`📤 Processing: ${fileName} (${(fileSize / (1024 * 1024)).toFixed(2)}MB)`);
    console.log(`📊 Needs chunking: ${needsChunking}`);

    let finalTranscript: string;

    if (needsChunking && fileSize > WHISPER_MAX_SIZE) {
      // Process in chunks
      console.log('🔪 File needs chunking...');
      finalTranscript = await transcribeInChunks(fileToProcess, fileName);
    } else {
      // Process as single file
      console.log('🎤 Transcribing as single file...');
      
      // Convert Blob to File for OpenAI API
      const file = new File([fileToProcess], fileName, { type: fileToProcess.type });
      
      const transcription = await openai.audio.transcriptions.create({
        file,
        model: 'whisper-1',
        language: 'en',
        response_format: 'verbose_json',
      });
      
      finalTranscript = transcription.text;
    }

    console.log(`✅ Transcription complete: ${finalTranscript.length} characters`);

    // Clean up: Delete file from storage
    if (storagePath) {
      console.log('🗑️  Deleting file from storage...');
      const deleteResult = await deleteFromStorage(storagePath);
      if (deleteResult.success) {
        console.log('✅ Storage cleaned up');
      } else {
        console.warn('⚠️  Failed to delete from storage:', deleteResult.error);
        // Don't fail the request if cleanup fails
      }
    }

    // Log usage
    try {
      const { supabase } = await import('@/lib/supabase');
      await supabase.from('usage_logs').insert({
        user_id: user.id,
        action: 'audio_transcribed',
        details: {
          file_name: fileName,
          file_size: fileSize,
          was_chunked: needsChunking && fileSize > WHISPER_MAX_SIZE,
          meeting_title: meetingTitle,
          plan: subscription.plan,
          used_storage: !!storagePath,
        },
      });
    } catch (logError) {
      console.error('Failed to log usage:', logError);
    }

    return NextResponse.json({
      success: true,
      transcript: finalTranscript,
      meetingTitle: meetingTitle || fileName.replace(/\.[^/.]+$/, ''),
    });

  } catch (error) {
    console.error('❌ Transcription error:', error);

    // Clean up storage on error
    if (storagePath) {
      try {
        await deleteFromStorage(storagePath);
        console.log('✅ Cleaned up storage after error');
      } catch (cleanupError) {
        console.error('Failed to cleanup storage:', cleanupError);
      }
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Transcription failed',
        success: false 
      },
      { status: 500 }
    );
  }
}

async function transcribeInChunks(blob: Blob, originalFileName: string): Promise<string> {
  const numChunks = Math.ceil(blob.size / CHUNK_SIZE);
  console.log(`📦 Splitting into ${numChunks} chunks...`);

  const transcripts: Array<{ index: number; text: string }> = [];

  for (let i = 0; i < numChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, blob.size);
    const chunkBlob = blob.slice(start, end, blob.type);
    
    // Create File from Blob
    const extension = originalFileName.split('.').pop() || 'mp3';
    const chunkFile = new File([chunkBlob], `chunk-${i}.${extension}`, { 
      type: blob.type 
    });
    
    try {
      console.log(`  Transcribing chunk ${i + 1}/${numChunks} (${(chunkBlob.size / (1024 * 1024)).toFixed(2)}MB)...`);
      
      // Transcribe chunk
      const transcription = await openai.audio.transcriptions.create({
        file: chunkFile,
        model: 'whisper-1',
        language: 'en',
        response_format: 'text',
      });
      
      transcripts.push({
        index: i,
        text: transcription,
      });
      
      console.log(`  ✅ Chunk ${i + 1} done`);
      
    } catch (error) {
      console.error(`  ❌ Chunk ${i + 1} failed:`, error);
      throw error;
    }
  }

  // Merge transcripts
  console.log('🔗 Merging transcripts...');
  const sorted = transcripts.sort((a, b) => a.index - b.index);
  const merged = sorted
    .map(t => t.text.trim())
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return merged;
}