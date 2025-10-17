import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user's organization
    const { data: orgMember } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!orgMember || !orgMember.organization_id) {
      return NextResponse.json({ success: true, requests: [] });
    }

    // Get all bot requests for this organization
    const { data: requests, error } = await supabase
      .from('meeting_bot_requests')
      .select(`
        *,
        rooms (
          room_code,
          title
        )
      `)
      .eq('organization_id', orgMember.organization_id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Failed to fetch bot requests:', error);
      return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      requests: requests || [],
    });

  } catch (error) {
    console.error('Error fetching bot requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bot requests' },
      { status: 500 }
    );
  }
}