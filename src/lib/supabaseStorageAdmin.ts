// src/lib/supabaseStorageAdmin.ts
// SERVER-SIDE ONLY - Do not import in client components!

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

/**
 * Download file from storage using admin privileges
 * SERVER-SIDE ONLY
 */
export async function downloadFromStorageAdmin(
  filePath: string
): Promise<{ success: boolean; data?: Blob; error?: string }> {
  try {
    console.log(`📥 [Admin] Downloading: ${BUCKET_NAME}/${filePath}`);

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .download(filePath);

    if (error) throw error;
    if (!data) throw new Error('No data received');

    console.log('✅ [Admin] Download successful');

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('❌ [Admin] Download failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Download failed',
    };
  }
}

/**
 * Delete file from storage using admin privileges
 * SERVER-SIDE ONLY
 */
export async function deleteFromStorageAdmin(
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`🗑️  [Admin] Deleting: ${BUCKET_NAME}/${filePath}`);

    const { error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) throw error;

    console.log('✅ [Admin] File deleted');

    return { success: true };
  } catch (error) {
    console.error('❌ [Admin] Deletion failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Deletion failed',
    };
  }
}

/**
 * Delete all files older than specified hours
 * SERVER-SIDE ONLY - For cron job
 */
export async function cleanupOldFilesAdmin(olderThanHours: number = 24): Promise<{
  success: boolean;
  deleted: number;
  error?: string;
}> {
  try {
    console.log(`🧹 [Admin] Cleaning up files older than ${olderThanHours} hours...`);

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

    console.log(`✅ [Admin] Deleted ${filesToDelete.length} old files`);

    return {
      success: true,
      deleted: filesToDelete.length,
    };
  } catch (error) {
    console.error('❌ [Admin] Cleanup failed:', error);
    return {
      success: false,
      deleted: 0,
      error: error instanceof Error ? error.message : 'Cleanup failed',
    };
  }
}