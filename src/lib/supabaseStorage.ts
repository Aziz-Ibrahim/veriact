import { supabase } from './supabase';
import { createClient } from '@supabase/supabase-js';

// Admin client for server-side operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
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
 * Initialize the storage bucket (run once during setup)
 */
export async function initializeBucket() {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

    if (!bucketExists) {
      // Create bucket
      const { data, error } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: BUCKET_CONFIG.fileSizeLimit,
        allowedMimeTypes: BUCKET_CONFIG.allowedMimeTypes,
      });

      if (error) throw error;
      console.log('✅ Bucket created:', BUCKET_NAME);
    } else {
      console.log('✅ Bucket already exists:', BUCKET_NAME);
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Failed to initialize bucket:', error);
    return { success: false, error };
  }
}

/**
 * Upload file to temporary storage
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

/**
 * Download file from storage (server-side only)
 */
export async function downloadFromStorage(
  filePath: string
): Promise<{ success: boolean; data?: Blob; error?: string }> {
  try {
    console.log(`📥 Downloading: ${BUCKET_NAME}/${filePath}`);

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .download(filePath);

    if (error) throw error;
    if (!data) throw new Error('No data received');

    console.log('✅ Download successful');

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('❌ Download failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Download failed',
    };
  }
}

/**
 * Delete file from storage
 */
export async function deleteFromStorage(
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`🗑️  Deleting: ${BUCKET_NAME}/${filePath}`);

    const { error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) throw error;

    console.log('✅ File deleted');

    return { success: true };
  } catch (error) {
    console.error('❌ Deletion failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Deletion failed',
    };
  }
}

/**
 * Delete all files older than specified hours
 * Run this as a cron job to clean up abandoned uploads
 */
export async function cleanupOldFiles(olderThanHours: number = 24): Promise<{
  success: boolean;
  deleted: number;
  error?: string;
}> {
  try {
    console.log(`🧹 Cleaning up files older than ${olderThanHours} hours...`);

    // List all files in the bucket
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'asc' },
      });

    if (listError) throw listError;
    if (!files || files.length === 0) {
      console.log('No files to clean up');
      return { success: true, deleted: 0 };
    }

    const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);
    const filesToDelete: string[] = [];

    // Check each file's age
    for (const file of files) {
      if (file.created_at) {
        const fileTime = new Date(file.created_at).getTime();
        if (fileTime < cutoffTime) {
          filesToDelete.push(file.name);
        }
      }
    }

    if (filesToDelete.length === 0) {
      console.log('No old files found');
      return { success: true, deleted: 0 };
    }

    // Delete old files
    const { error: deleteError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove(filesToDelete);

    if (deleteError) throw deleteError;

    console.log(`✅ Deleted ${filesToDelete.length} old files`);

    return {
      success: true,
      deleted: filesToDelete.length,
    };
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    return {
      success: false,
      deleted: 0,
      error: error instanceof Error ? error.message : 'Cleanup failed',
    };
  }
}

/**
 * Get signed URL for temporary access (expires in 1 hour)
 */
export async function getSignedUrl(
  filePath: string,
  expiresIn: number = 3600 // 1 hour
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, expiresIn);

    if (error) throw error;
    if (!data.signedUrl) throw new Error('No signed URL generated');

    return {
      success: true,
      url: data.signedUrl,
    };
  } catch (error) {
    console.error('❌ Signed URL generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'URL generation failed',
    };
  }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(filePath: string) {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .list(filePath.split('/')[0], {
        search: filePath.split('/').pop(),
      });

    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    console.error('Failed to get file metadata:', error);
    return null;
  }
}