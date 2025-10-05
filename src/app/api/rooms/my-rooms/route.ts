import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch rooms created by this user
    const { data: rooms, error } = await supabase
      .from('rooms')
      .select('*, room_action_items(count)')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching rooms:', error);
      throw new Error('Failed to fetch rooms');
    }

    return NextResponse.json({
      success: true,
      rooms: rooms || [],
    });

  } catch (error) {
    console.error('Error in my-rooms API:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch rooms',
        success: false 
      },
      { status: 500 }
    );
  }
}