import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { itemId, status } = await request.json();

    if (!itemId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending', 'in-progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update the action item
    const { data, error } = await supabase
      .from('room_action_items')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      console.error('Error updating action item:', error);
      throw new Error('Failed to update action item');
    }

    return NextResponse.json({
      success: true,
      actionItem: data,
    });

  } catch (error) {
    console.error('Error in update-item API:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to update action item',
        success: false 
      },
      { status: 500 }
    );
  }
}