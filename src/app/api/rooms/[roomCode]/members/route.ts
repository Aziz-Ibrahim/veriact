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
        error: 'Not authenticated' 
      }, { status: 401 });
    }

    const { roomCode } = await params;

    // Get room
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_code', roomCode)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ 
        error: 'Room not found' 
      }, { status: 404 });
    }

    // Check if user is the room creator
    if (room.created_by !== user.id) {
      return NextResponse.json({ 
        error: 'Only room creator can view members' 
      }, { status: 403 });
    }

    // Get all members for this room
    const { data: members, error: membersError } = await supabase
      .from('room_members')
      .select('*')
      .eq('room_id', room.id)
      .order('invited_at', { ascending: false });

    if (membersError) {
      throw membersError;
    }

    return NextResponse.json({ 
      success: true, 
      members: members || [] 
    });

  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch members' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Not authenticated' 
      }, { status: 401 });
    }

    const { roomCode } = await params;
    const { memberId } = await request.json();

    if (!memberId) {
      return NextResponse.json({ 
        error: 'Member ID required' 
      }, { status: 400 });
    }

    // Get room
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_code', roomCode)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ 
        error: 'Room not found' 
      }, { status: 404 });
    }

    // Check if user is the room creator
    if (room.created_by !== user.id) {
      return NextResponse.json({ 
        error: 'Only room creator can remove members' 
      }, { status: 403 });
    }

    // Delete member
    const { error: deleteError } = await supabase
      .from('room_members')
      .delete()
      .eq('id', memberId)
      .eq('room_id', room.id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ 
      success: true,
      message: 'Member removed successfully' 
    });

  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json({ 
      error: 'Failed to remove member' 
    }, { status: 500 });
  }
}