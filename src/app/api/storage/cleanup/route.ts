import { NextRequest, NextResponse } from 'next/server';
import { cleanupOldFiles } from '@/lib/supabaseStorage';

// Security: Only allow requests with correct authorization
const CRON_SECRET = process.env.CRON_SECRET;

if (!CRON_SECRET) {
  throw new Error('CRON_SECRET must be set in environment variables');
}

/**
 * Cron job to clean up abandoned files from storage
 * 
 * Setup in Vercel/Railway:
 * 1. Add CRON_SECRET to environment variables
 * 2. Configure cron job to hit this endpoint every hour
 * 3. Example cron expression: 0 * * * * (every hour)
 * 
 * For Vercel Cron:
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/storage/cleanup",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      console.error('❌ Unauthorized cleanup attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🧹 Starting storage cleanup job...');

    // Clean up files older than 24 hours
    const result = await cleanupOldFiles(24);

    if (result.success) {
      console.log(`✅ Cleanup complete: ${result.deleted} files deleted`);
      
      return NextResponse.json({
        success: true,
        deleted: result.deleted,
        message: `Successfully cleaned up ${result.deleted} old files`,
      });
    } else {
      console.error('❌ Cleanup failed:', result.error);
      
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Storage cleanup job failed:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Cleanup job failed' 
      },
      { status: 500 }
    );
  }
}

// Allow manual trigger in development
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  console.log('🧪 Manual cleanup trigger (development only)');

  // Call the POST handler with proper auth
  const mockRequest = new NextRequest(request.url, {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${CRON_SECRET}`,
    },
  });

  return POST(mockRequest);
}