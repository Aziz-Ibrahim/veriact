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
      return NextResponse.json({ 
        error: 'Not authenticated',
        hasAccess: false 
      }, { status: 401 });
    }

    const { roomCode } = await params;
    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return NextResponse.json({ 
        error: 'User email not found',
        hasAccess: false 
      }, { status: 400 });
    }

    // Get room
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_code', roomCode.toUpperCase())
      .single();

    if (roomError || !room) {
      return NextResponse.json({ 
        error: 'Room not found',
        hasAccess: false 
      }, { status: 404 });
    }

    // Check if room has expired
    if (new Date(room.expires_at) < new Date()) {
      return NextResponse.json({ 
        error: 'This room has expired',
        hasAccess: false 
      }, { status: 410 });
    }

    // Check if user is the creator
    const isOwner = room.created_by === user.id;

    // Check if user is already a member (invited)
    const { data: existingMember } = await supabase
      .from('room_members')
      .select('*')
      .eq('room_id', room.id)
      .eq('user_email', userEmail)
      .single();

    let accessLevel = 'viewer';
    let wasAlreadyMember = false;

    if (existingMember) {
      // User was already invited - just confirm access
      accessLevel = existingMember.access_level;
      wasAlreadyMember = true;
      console.log(`✅ User ${userEmail} confirmed access to room ${roomCode} (already member as ${accessLevel})`);
    } else if (!isOwner) {
      // User is joining publicly (not invited) - add them as viewer
      const { data: newMember, error: insertError } = await supabase
        .from('room_members')
        .insert({
          room_id: room.id,
          user_email: userEmail,
          invited_by: room.created_by,
          access_level: 'viewer',
        })
        .select()
        .single();

      if (insertError) {
        console.error('Failed to add member:', insertError);
        return NextResponse.json({ 
          error: 'Failed to join room',
          hasAccess: false 
        }, { status: 500 });
      }

      accessLevel = 'viewer';
      console.log(`✅ User ${userEmail} added to room ${roomCode} as viewer`);
    } else {
      accessLevel = 'owner';
    }

    // Log the join action
    try {
      await supabase.from('usage_logs').insert({
        user_id: user.id,
        action: wasAlreadyMember ? 'room_accessed' : 'room_joined',
        details: {
          room_id: room.id,
          room_code: roomCode,
          is_owner: isOwner,
          access_level: isOwner ? 'owner' : accessLevel,
          was_invited: wasAlreadyMember,
        },
      });
    } catch (logError) {
      console.error('Failed to log join action:', logError);
    }

    return NextResponse.json({ 
      hasAccess: true,
      isOwner,
      accessLevel: isOwner ? 'owner' : accessLevel,
      wasInvited: wasAlreadyMember,
      room: {
        id: room.id,
        code: room.room_code,
        title: room.title,
      }
    });

  } catch (error) {
    console.error('Error in join room API:', error);
    return NextResponse.json({ 
      error: 'Failed to join room',
      hasAccess: false 
    }, { status: 500 });
  }
}