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

    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      );
    }

    // Fetch rooms created by this user
    const { data: createdRooms, error: createdError } = await supabase
      .from('rooms')
      .select(`
        *,
        room_action_items(count)
      `)
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    if (createdError) {
      console.error('Error fetching created rooms:', createdError);
      throw new Error('Failed to fetch created rooms');
    }

    // Fetch rooms where user is a member (invited to)
    const { data: memberships, error: memberError } = await supabase
      .from('room_members')
      .select(`
        room_id,
        access_level,
        invited_at,
        rooms (
          id,
          room_code,
          title,
          created_by,
          created_at,
          expires_at,
          room_action_items(count)
        )
      `)
      .eq('user_email', userEmail)
      .order('invited_at', { ascending: false });

    if (memberError) {
      console.error('Error fetching member rooms:', memberError);
      // Don't fail the entire request, just log the error
    }

    // Combine both lists and remove duplicates
    const allRooms: any[] = [];
    const roomIds = new Set<string>();

    // Add created rooms first
    if (createdRooms) {
      createdRooms.forEach(room => {
        if (!roomIds.has(room.id)) {
          allRooms.push({
            ...room,
            user_role: 'owner',
            is_owner: true,
          });
          roomIds.add(room.id);
        }
      });
    }

    // Add member rooms (where user was invited)
    if (memberships) {
      memberships.forEach(membership => {
        const room = (membership as any).rooms;
        if (room && !roomIds.has(room.id)) {
          allRooms.push({
            ...room,
            user_role: membership.access_level,
            is_owner: false,
            invited_at: membership.invited_at,
          });
          roomIds.add(room.id);
        }
      });
    }

    // Sort by most recent (created_at or invited_at)
    allRooms.sort((a, b) => {
      const dateA = new Date(a.invited_at || a.created_at);
      const dateB = new Date(b.invited_at || b.created_at);
      return dateB.getTime() - dateA.getTime();
    });

    return NextResponse.json({
      success: true,
      rooms: allRooms,
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