export const WHISPER_MAX_SIZE = 25 * 1024 * 1024; // 25MB
export const CHUNK_SIZE = 24 * 1024 * 1024; // 24MB to be safe

export interface AudioChunk {
  blob: Blob;
  index: number;
  startTime: number; // Estimated start time in seconds
  duration: number; // Estimated duration in seconds
}

/**
 * Split audio file into chunks that Whisper API can handle
 * This is a simple byte-based split - for better results, use audio-aware splitting
 */
export async function chunkAudioFile(file: File): Promise<AudioChunk[]> {
  const chunks: AudioChunk[] = [];
  const totalSize = file.size;
  const numChunks = Math.ceil(totalSize / CHUNK_SIZE);
  
  console.log(`📦 Splitting ${(totalSize / (1024 * 1024)).toFixed(2)}MB into ${numChunks} chunks...`);
  
  // Estimate audio duration based on file size (rough estimate)
  // Assuming ~1MB per minute for 32kbps MP3
  const estimatedTotalDuration = (totalSize / (1024 * 1024)) * 60;
  const chunkDuration = estimatedTotalDuration / numChunks;
  
  for (let i = 0; i < numChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, totalSize);
    const chunkBlob = file.slice(start, end, file.type);
    
    chunks.push({
      blob: chunkBlob,
      index: i,
      startTime: i * chunkDuration,
      duration: chunkDuration,
    });
    
    console.log(`  Chunk ${i + 1}/${numChunks}: ${(chunkBlob.size / (1024 * 1024)).toFixed(2)}MB`);
  }
  
  return chunks;
}

/**
 * Check if file needs chunking
 */
export function needsChunking(file: File): boolean {
  return file.size > WHISPER_MAX_SIZE;
}

/**
 * Merge transcripts from multiple chunks
 */
export function mergeTranscripts(transcripts: Array<{ index: number; text: string }>): string {
  // Sort by index to ensure correct order
  const sorted = transcripts.sort((a, b) => a.index - b.index);
  
  // Join with spaces, removing duplicate spaces and extra whitespace
  return sorted
    .map(t => t.text.trim())
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Create a File from Blob for API upload
 */
export function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: blob.type });
}

/**
 * Estimate processing time for user
 */
export function estimateProcessingTime(file: File, isChunked: boolean): string {
  const sizeMB = file.size / (1024 * 1024);
  
  if (isChunked) {
    const numChunks = Math.ceil(file.size / CHUNK_SIZE);
    // Each chunk processes in ~30 seconds, but they're sequential
    const minutes = Math.ceil((numChunks * 0.5)); // 30 seconds per chunk
    return `${minutes}-${minutes + 2} minutes`;
  }
  
  // Single file: ~1 minute per 10MB
  const minutes = Math.ceil(sizeMB / 10);
  return `${minutes}-${minutes + 1} minutes`;
}