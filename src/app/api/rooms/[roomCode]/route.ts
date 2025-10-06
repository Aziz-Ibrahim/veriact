import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { roomCode } = await params;

    const { data: room } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_code', roomCode)
      .single();

    if (!room) {
      return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
    }

    const { data: actionItems } = await supabase
      .from('room_action_items')
      .select('*')
      .eq('room_id', room.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      room,
      actionItems: actionItems || [],
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to load room' }, { status: 500 });
  }
}