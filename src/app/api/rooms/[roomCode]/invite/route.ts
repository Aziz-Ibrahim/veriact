import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { roomCode } = await params;
    const { email, accessLevel } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Get room
    const { data: room } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_code', roomCode)
      .single();

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Check if user is the room creator
    if (room.created_by !== user.id) {
      return NextResponse.json({ error: 'Only room creator can invite' }, { status: 403 });
    }

    // Add member
    const { error: insertError } = await supabase
      .from('room_members')
      .insert({
        room_id: room.id,
        user_email: email.toLowerCase(),
        invited_by: user.id,
        access_level: accessLevel || 'editor',
      });

    if (insertError) {
      if (insertError.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'User already invited' }, { status: 400 });
      }
      throw insertError;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error inviting member:', error);
    return NextResponse.json({ error: 'Failed to invite member' }, { status: 500 });
  }
}