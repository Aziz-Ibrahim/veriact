import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Recall.ai webhook secret for verification
const RECALL_WEBHOOK_SECRET = process.env.RECALL_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (Recall.ai sends this)
    const signature = request.headers.get('x-recall-signature');
    
    if (!signature || signature !== RECALL_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = await request.json();
    
    console.log('📥 Recall.ai webhook received:', payload.event);

    // Handle different webhook events
    switch (payload.event) {
      case 'bot.status_change':
        await handleBotStatusChange(payload.data);
        break;
      
      case 'recording.ready':
        await handleRecordingReady(payload.data);
        break;
      
      default:
        console.log('Unhandled event:', payload.event);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Recall webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleBotStatusChange(data: any) {
  const { bot_id, status } = data;
  
  console.log(`🤖 Bot ${bot_id} status: ${status}`);

  // Update meeting bot request status
  await supabase
    .from('meeting_bot_requests')
    .update({ 
      status: mapRecallStatus(status),
      updated_at: new Date().toISOString()
    })
    .eq('recall_bot_id', bot_id);
}

async function handleRecordingReady(data: any) {
  const { bot_id, recording_url, transcript } = data;
  
  console.log(`📝 Recording ready for bot ${bot_id}`);

  // Get the meeting bot request
  const { data: botRequest, error: requestError } = await supabase
    .from('meeting_bot_requests')
    .select('*, organizations(name)')
    .eq('recall_bot_id', bot_id)
    .single();

  if (requestError || !botRequest) {
    console.error('Bot request not found:', bot_id);
    return;
  }

  // Update with transcript URL
  await supabase
    .from('meeting_bot_requests')
    .update({ 
      transcript_url: recording_url,
      status: 'completed',
      updated_at: new Date().toISOString()
    })
    .eq('id', botRequest.id);

  // Process transcript to extract action items
  if (transcript && transcript.length > 0) {
    await processTranscriptAndCreateRoom(botRequest, transcript);
  }
}

async function processTranscriptAndCreateRoom(botRequest: any, transcript: string) {
  try {
    console.log('🔄 Processing transcript for bot request:', botRequest.id);

    // Call your existing AI extraction API
    const extractionResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: transcript,
        meetingTitle: `Meeting - ${new Date().toLocaleDateString()}`,
      }),
    });

    if (!extractionResponse.ok) {
      throw new Error('Failed to extract action items');
    }

    const { actionItems } = await extractionResponse.json();

    if (!actionItems || actionItems.length === 0) {
      console.log('⚠️ No action items found');
      return;
    }

    // Generate room code
    const { data: roomCodeData } = await supabase.rpc('generate_room_code');
    const roomCode = roomCodeData;

    // Create room
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .insert({
        room_code: roomCode,
        title: `Meeting - ${new Date().toLocaleDateString()}`,
        created_by: botRequest.requested_by,
      })
      .select()
      .single();

    if (roomError || !room) {
      throw new Error('Failed to create room');
    }

    // Insert action items
    const roomActionItems = actionItems.map((item: any) => ({
      room_id: room.id,
      task: item.task,
      assignee: item.assignee,
      deadline: item.deadline,
      status: 'pending',
    }));

    await supabase.from('room_action_items').insert(roomActionItems);

    // Update bot request with room ID
    await supabase
      .from('meeting_bot_requests')
      .update({ room_id: room.id })
      .eq('id', botRequest.id);

    // Get all organization members
    const { data: members } = await supabase
      .from('organization_members')
      .select('user_email')
      .eq('organization_id', botRequest.organization_id);

    // Add all org members to the room
    if (members && members.length > 0) {
      const memberInserts = members.map(member => ({
        room_id: room.id,
        user_email: member.user_email,
        invited_by: botRequest.requested_by,
        access_level: 'editor',
      }));

      await supabase.from('room_members').insert(memberInserts);
    }

    console.log('✅ Room created successfully:', room.room_code);

    // TODO: Send email to all org members with room code

  } catch (error) {
    console.error('❌ Failed to process transcript:', error);
  }
}

function mapRecallStatus(recallStatus: string): string {
  const statusMap: Record<string, string> = {
    'ready': 'pending',
    'joining': 'joined',
    'in_call': 'recording',
    'done': 'completed',
    'fatal': 'failed',
  };
  
  return statusMap[recallStatus] || 'pending';
}