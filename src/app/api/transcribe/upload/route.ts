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
const SUPPORTED_AUDIO = ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac'];
const SUPPORTED_VIDEO = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
const ALL_SUPPORTED = [...SUPPORTED_AUDIO, ...SUPPORTED_VIDEO];

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

    // Check subscription - must be Pro or Enterprise
    const subscription = await getUserSubscription(user.id);
    
    if (subscription.plan === 'free') {
      return NextResponse.json(
        { 
          error: 'Audio/Video upload requires Pro or Enterprise plan',
          currentPlan: subscription.plan,
          upgradeUrl: '/checkout?plan=pro'
        },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const meetingTitle = formData.get('meetingTitle') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Validate file type
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !ALL_SUPPORTED.includes(extension)) {
      return NextResponse.json(
        { error: `Unsupported file type. Supported: ${ALL_SUPPORTED.join(', ')}` },
        { status: 400 }
      );
    }

    console.log(`📤 Processing upload: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`);

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save temporarily (Whisper API needs a file path)
    const tempDir = '/tmp'; // Use /tmp in production (Vercel)
    const tempFileName = `${randomUUID()}.${extension}`;
    tempFilePath = join(tempDir, tempFileName);
    
    await writeFile(tempFilePath, buffer);

    console.log(`💾 Saved temp file: ${tempFilePath}`);

    // For video files, we need to extract audio first
    let audioFilePath = tempFilePath;
    if (SUPPORTED_VIDEO.includes(extension)) {
      // Note: In production, you'd use ffmpeg to extract audio
      // For now, we'll try to send the video directly (Whisper might handle it)
      console.log(`🎥 Video file detected, attempting transcription...`);
    }

    // Transcribe with OpenAI Whisper
    console.log('🎤 Starting transcription with Whisper API...');
    
    const transcription = await openai.audio.transcriptions.create({
      file: await import('fs').then(fs => fs.createReadStream(audioFilePath)),
      model: 'whisper-1',
      language: 'en', // Can be auto-detected by omitting this
      response_format: 'verbose_json', // Get timestamps and more metadata
    });

    console.log(`✅ Transcription complete: ${transcription.text.length} characters`);

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
          duration: transcription.duration || 0,
          meeting_title: meetingTitle,
          plan: subscription.plan,
        },
      });
    } catch (logError) {
      console.error('Failed to log usage:', logError);
    }

    return NextResponse.json({
      success: true,
      transcript: transcription.text,
      duration: transcription.duration,
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

    // Handle specific OpenAI errors
    if (error instanceof Error && error.message.includes('file size')) {
      return NextResponse.json(
        { error: 'File too large for transcription. Please use a smaller file.' },
        { status: 400 }
      );
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

// Configuration for Next.js to handle large files
export const config = {
  api: {
    bodyParser: false,
  },
};