import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { checkFeatureAccess } from '@/lib/subscription';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user has access to meeting bot feature
    const hasAccess = await checkFeatureAccess(user.id, 'canUseMeetingBot');
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Meeting bot feature requires Enterprise plan' },
        { status: 403 }
      );
    }

    const { meetingUrl, platform, scheduledTime } = await request.json();

    if (!meetingUrl) {
      return NextResponse.json({ error: 'Meeting URL required' }, { status: 400 });
    }

    // Get user's organization
    const { data: orgMember } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!orgMember || !orgMember.organization_id) {
      return NextResponse.json(
        { error: 'You must be part of an organization to use meeting bot' },
        { status: 403 }
      );
    }

    // Call Recall.ai API to create bot
    const recallResponse = await fetch('https://api.recall.ai/api/v1/bot/', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.RECALL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        meeting_url: meetingUrl,
        bot_name: 'VeriAct',
        transcription_options: {
          provider: 'assembly_ai',
        },
        automatic_leave: {
          waiting_room_timeout: 600, // 10 minutes
          noone_joined_timeout: 300, // 5 minutes
        },
        recording_mode: 'speaker_view',
      }),
    });

    if (!recallResponse.ok) {
      const error = await recallResponse.json();
      console.error('Recall.ai API error:', error);
      throw new Error('Failed to create meeting bot');
    }

    const recallData = await recallResponse.json();

    // Save bot request to database
    const { data: botRequest, error: dbError } = await supabase
      .from('meeting_bot_requests')
      .insert({
        organization_id: orgMember.organization_id,
        requested_by: user.id,
        meeting_url: meetingUrl,
        meeting_platform: platform || detectPlatform(meetingUrl),
        scheduled_time: scheduledTime || null,
        recall_bot_id: recallData.id,
        status: 'pending',
      })
      .select()
      .single();

    if (dbError || !botRequest) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save bot request');
    }

    return NextResponse.json({
      success: true,
      botRequest: {
        id: botRequest.id,
        recallBotId: recallData.id,
        status: botRequest.status,
        joinUrl: recallData.join_at || meetingUrl,
      },
    });

  } catch (error) {
    console.error('Error requesting meeting bot:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to request bot' },
      { status: 500 }
    );
  }
}

function detectPlatform(url: string): string {
  if (url.includes('zoom.us')) return 'zoom';
  if (url.includes('meet.google.com')) return 'google_meet';
  if (url.includes('teams.microsoft.com')) return 'teams';
  return 'zoom'; // default
}