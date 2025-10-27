import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getUserSubscription } from '@/lib/subscription';
import OpenAI from 'openai';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB for Pro users
const WHISPER_MAX_SIZE = 25 * 1024 * 1024; // 25MB Whisper limit
const CHUNK_SIZE = 24 * 1024 * 1024; // 24MB chunks

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;

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
    const file = formData.get('file') as File;
    const meetingTitle = formData.get('meetingTitle') as string;
    const needsChunking = formData.get('needsChunking') === 'true';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    console.log(`📤 Processing: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
    console.log(`📊 Needs chunking: ${needsChunking}`);

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save temporarily
    const tempDir = '/tmp';
    const extension = file.name.split('.').pop() || 'mp3';
    const tempFileName = `${randomUUID()}.${extension}`;
    tempFilePath = join(tempDir, tempFileName);
    
    await writeFile(tempFilePath, buffer);
    console.log(`💾 Saved temp file: ${tempFilePath}`);

    let finalTranscript: string;

    if (needsChunking && file.size > WHISPER_MAX_SIZE) {
      // Process in chunks
      console.log('🔪 File needs chunking...');
      finalTranscript = await transcribeInChunks(buffer, extension);
    } else {
      // Process as single file
      console.log('🎤 Transcribing as single file...');
      const fs = await import('fs');
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: 'whisper-1',
        language: 'en',
        response_format: 'verbose_json',
      });
      finalTranscript = transcription.text;
    }

    console.log(`✅ Transcription complete: ${finalTranscript.length} characters`);

    // Clean up temp file
    try {
      await unlink(tempFilePath);
      console.log(`🗑️ Cleaned up temp file`);
    } catch (err) {
      console.error('Failed to delete temp file:', err);
    }

    // Log usage
    try {
      const { supabase } = await import('@/lib/supabase');
      await supabase.from('usage_logs').insert({
        user_id: user.id,
        action: 'audio_transcribed',
        details: {
          file_name: file.name,
          file_size: file.size,
          was_chunked: needsChunking && file.size > WHISPER_MAX_SIZE,
          meeting_title: meetingTitle,
          plan: subscription.plan,
        },
      });
    } catch (logError) {
      console.error('Failed to log usage:', logError);
    }

    return NextResponse.json({
      success: true,
      transcript: finalTranscript,
      meetingTitle: meetingTitle || file.name.replace(/\.[^/.]+$/, ''),
    });

  } catch (error) {
    console.error('❌ Transcription error:', error);

    // Clean up temp file on error
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch (err) {
        console.error('Failed to delete temp file on error:', err);
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

async function transcribeInChunks(buffer: Buffer, extension: string): Promise<string> {
  const numChunks = Math.ceil(buffer.length / CHUNK_SIZE);
  console.log(`📦 Splitting into ${numChunks} chunks...`);

  const transcripts: Array<{ index: number; text: string }> = [];
  const fs = await import('fs');
  const tempDir = '/tmp';

  for (let i = 0; i < numChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, buffer.length);
    const chunkBuffer = buffer.slice(start, end);
    
    // Save chunk temporarily
    const chunkFileName = `chunk-${randomUUID()}.${extension}`;
    const chunkPath = join(tempDir, chunkFileName);
    
    try {
      await writeFile(chunkPath, chunkBuffer);
      
      console.log(`  Transcribing chunk ${i + 1}/${numChunks} (${(chunkBuffer.length / (1024 * 1024)).toFixed(2)}MB)...`);
      
      // Transcribe chunk
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(chunkPath),
        model: 'whisper-1',
        language: 'en',
        response_format: 'text',
      });
      
      transcripts.push({
        index: i,
        text: transcription,
      });
      
      console.log(`  ✅ Chunk ${i + 1} done`);
      
      // Clean up chunk file
      await unlink(chunkPath);
      
    } catch (error) {
      console.error(`  ❌ Chunk ${i + 1} failed:`, error);
      // Try to clean up
      try {
        await unlink(chunkPath);
      } catch {}
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