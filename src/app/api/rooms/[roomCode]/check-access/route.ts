import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ 
        hasAccess: false, 
        error: 'Not authenticated' 
      }, { status: 401 });
    }

    const { roomCode } = await params;
    const userEmail = user.emailAddresses[0]?.emailAddress;

    // Get room
    const { data: room } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_code', roomCode)
      .single();

    if (!room) {
      return NextResponse.json({ 
        hasAccess: false, 
        error: 'Room not found' 
      }, { status: 404 });
    }

    // Check if user is the creator
    if (room.created_by === user.id) {
      return NextResponse.json({ hasAccess: true, isOwner: true });
    }

    // Check if user is invited
    const { data: membership } = await supabase
      .from('room_members')
      .select('*')
      .eq('room_id', room.id)
      .eq('user_email', userEmail)
      .single();

    if (membership) {
      return NextResponse.json({ 
        hasAccess: true, 
        isOwner: false,
        accessLevel: membership.access_level 
      });
    }

    return NextResponse.json({ 
      hasAccess: false, 
      error: 'Not invited to this room' 
    });

  } catch (error) {
    return NextResponse.json({ 
      hasAccess: false, 
      error: 'Failed to check access' 
    }, { status: 500 });
  }
}