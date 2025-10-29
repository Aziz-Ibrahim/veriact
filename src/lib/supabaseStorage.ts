import { createClient } from '@supabase/supabase-js';

// Client for authenticated user operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const BUCKET_NAME = 'temp-recordings';

// Bucket configuration
export const BUCKET_CONFIG = {
  public: false, // Private bucket
  allowedMimeTypes: [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/m4a',
    'audio/aac',
    'audio/ogg',
    'audio/flac',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
    'video/webm',
  ],
  fileSizeLimit: 500 * 1024 * 1024, // 500MB
};

/**
 * Upload file to temporary storage (CLIENT-SIDE)
 * Returns the file path in the bucket
 */
export async function uploadToTempStorage(
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    // Generate unique file path: userId/timestamp-filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${userId}/${timestamp}-${sanitizedFileName}`;

    console.log(`📤 Uploading to: ${BUCKET_NAME}/${filePath}`);

    // Upload file using client (authenticated user)
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    console.log('✅ Upload successful:', data.path);

    return {
      success: true,
      path: data.path,
    };
  } catch (error) {
    console.error('❌ Upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

// Note: Download, delete, and cleanup functions are in supabaseStorageAdmin.ts
// Those require server-side admin privileges