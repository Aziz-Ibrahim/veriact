import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;

export async function loadFFmpeg(onProgress?: (progress: number) => void): Promise<FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance;

  const ffmpeg = new FFmpeg();
  
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
  
  // Listen to progress
  if (onProgress) {
    ffmpeg.on('progress', ({ progress }) => {
      onProgress(Math.round(progress * 100));
    });
  }

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  ffmpegInstance = ffmpeg;
  return ffmpeg;
}

export async function extractAudioFromVideo(
  videoFile: File,
  onProgress?: (progress: number) => void
): Promise<File> {
  try {
    console.log('🎬 Starting audio extraction from video...');

    const ffmpeg = await loadFFmpeg(onProgress);

    const inputFileName = 'input' + getFileExtension(videoFile.name);
    const outputFileName = 'output.mp3';

    await ffmpeg.writeFile(inputFileName, await fetchFile(videoFile));

    console.log('📝 Extracting audio...');

    await ffmpeg.exec([
      '-i', inputFileName,
      '-vn',
      '-acodec', 'libmp3lame',
      '-ar', '16000',
      '-ac', '1',
      '-b:a', '32k',
      outputFileName
    ]);

    console.log('✅ Audio extracted');

    // Read and safely convert output
    const data = await ffmpeg.readFile(outputFileName);
    const uint8 = new Uint8Array(data as any); // force Uint8Array copy

    // Clean up
    await ffmpeg.deleteFile(inputFileName);
    await ffmpeg.deleteFile(outputFileName);

    // Blob creation
    const audioBlob = new Blob([uint8], { type: 'audio/mpeg' });
    const audioFile = new File([audioBlob], 'extracted-audio.mp3', { type: 'audio/mpeg' });

    console.log(`🎵 Audio file created: ${(audioFile.size / (1024 * 1024)).toFixed(2)}MB`);

    return audioFile;
  } catch (error) {
    console.error('❌ Audio extraction failed:', error);
    throw new Error('Failed to extract audio from video');
  }
}


export async function compressAudio(
  audioFile: File,
  onProgress?: (progress: number) => void
): Promise<File> {
  try {
    console.log('🔊 Compressing audio...');

    const ffmpeg = await loadFFmpeg(onProgress);

    const inputFileName = 'input' + getFileExtension(audioFile.name);
    const outputFileName = 'compressed.mp3';

    await ffmpeg.writeFile(inputFileName, await fetchFile(audioFile));

    await ffmpeg.exec([
      '-i', inputFileName,
      '-acodec', 'libmp3lame',
      '-ar', '16000',
      '-ac', '1',
      '-b:a', '32k',
      outputFileName
    ]);

    const data = await ffmpeg.readFile(outputFileName);
    const uint8 = new Uint8Array(data as any); // force proper type

    await ffmpeg.deleteFile(inputFileName);
    await ffmpeg.deleteFile(outputFileName);

    const compressedBlob = new Blob([uint8], { type: 'audio/mpeg' });
    const compressedFile = new File([compressedBlob], 'compressed-audio.mp3', { type: 'audio/mpeg' });

    console.log(`✅ Compressed: ${(audioFile.size / (1024 * 1024)).toFixed(2)}MB → ${(compressedFile.size / (1024 * 1024)).toFixed(2)}MB`);

    return compressedFile;
  } catch (error) {
    console.error('❌ Audio compression failed:', error);
    throw new Error('Failed to compress audio');
  }
}



function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? '.' + parts[parts.length - 1] : '';
}

// Check if file is video
export function isVideoFile(file: File): boolean {
  const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv'];
  const extension = file.name.split('.').pop()?.toLowerCase();
  return videoExtensions.includes(extension || '');
}

// Check if file needs compression
export function needsCompression(file: File): boolean {
  // Compress if larger than 10MB or if it's not already MP3 at low bitrate
  return file.size > 10 * 1024 * 1024 || !file.name.toLowerCase().endsWith('.mp3');
}