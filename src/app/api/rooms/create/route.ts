import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, actionItems, agreedToPrivacy } = await request.json();

    // Validate privacy agreement
    if (!agreedToPrivacy) {
      return NextResponse.json(
        { error: 'You must agree to the privacy terms to create a shared room' },
        { status: 400 }
      );
    }

    if (!title || !actionItems || !Array.isArray(actionItems)) {
      return NextResponse.json(
        { error: 'Invalid room data' },
        { status: 400 }
      );
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      );
    }

    // Generate unique room code
    const { data: roomCodeData, error: roomCodeError } = await supabase
      .rpc('generate_room_code');

    if (roomCodeError || !roomCodeData) {
      throw new Error('Failed to generate room code');
    }

    const roomCode = roomCodeData;

    // Create room
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .insert({
        room_code: roomCode,
        title,
        created_by: user.id,
      })
      .select()
      .single();

    if (roomError || !room) {
      console.error('Room creation error:', roomError);
      throw new Error('Failed to create room');
    }

    // Auto-add room creator as a member (with editor access)
    const { error: memberError } = await supabase
      .from('room_members')
      .insert({
        room_id: room.id,
        user_email: userEmail,
        invited_by: user.id,
        access_level: 'editor',
      });

    if (memberError) {
      console.error('Failed to add creator as member:', memberError);
      // Rollback: delete the room if adding creator fails
      await supabase.from('rooms').delete().eq('id', room.id);
      throw new Error('Failed to add creator as member');
    }

    // Insert action items
    const roomActionItems = actionItems.map((item: any) => ({
      room_id: room.id,
      task: item.task,
      assignee: item.assignee,
      deadline: item.deadline,
      status: item.status || 'pending',
      meeting_title: item.meetingTitle || title,
    }));

    const { error: itemsError } = await supabase
      .from('room_action_items')
      .insert(roomActionItems);

    if (itemsError) {
      console.error('Action items insertion error:', itemsError);
      // Rollback: delete the room and member
      await supabase.from('rooms').delete().eq('id', room.id);
      throw new Error('Failed to create action items');
    }

    return NextResponse.json({
      success: true,
      room: {
        id: room.id,
        roomCode: room.room_code,
        title: room.title,
        expiresAt: room.expires_at,
      },
    });

  } catch (error) {
    console.error('Error in create room API:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create room',
        success: false 
      },
      { status: 500 }
    );
  }
}