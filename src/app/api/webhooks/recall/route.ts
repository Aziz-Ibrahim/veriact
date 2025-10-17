import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

// Recall.ai webhook secret for verification
const RECALL_WEBHOOK_SECRET = process.env.RECALL_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-recall-signature');
    
    // Verify webhook signature
    if (RECALL_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', RECALL_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');
      
      if (!signature || signature !== expectedSignature) {
        console.error('❌ Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    
    console.log('🔥 Recall.ai webhook received:', payload.event);

    // Handle different webhook events
    switch (payload.event) {
      case 'bot.status_change':
        await handleBotStatusChange(payload.data);
        break;
      
      case 'bot.joined_meeting':
        await handleBotJoinedMeeting(payload.data);
        break;
      
      case 'recording.ready':
        await handleRecordingReady(payload.data);
        break;

      case 'bot.error':
        await handleBotError(payload.data);
        break;
      
      default:
        console.log('ℹ️ Unhandled event:', payload.event);
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

async function handleBotStatusChange(data: { bot_id: string; status: string }) {
  const { bot_id, status } = data;
  
  console.log(`🤖 Bot ${bot_id} status: ${status}`);

  try {
    // Update meeting bot request status
    const { error } = await supabase
      .from('meeting_bot_requests')
      .update({ 
        status: mapRecallStatus(status),
        updated_at: new Date().toISOString()
      })
      .eq('recall_bot_id', bot_id);

    if (error) {
      console.error('Failed to update bot status:', error);
    }
  } catch (error) {
    console.error('Error in handleBotStatusChange:', error);
  }
}

async function handleBotJoinedMeeting(data: any) {
  const { bot_id, meeting_url } = data;
  
  console.log(`✅ Bot ${bot_id} joined meeting: ${meeting_url}`);

  try {
    await supabase
      .from('meeting_bot_requests')
      .update({ 
        status: 'recording',
        updated_at: new Date().toISOString()
      })
      .eq('recall_bot_id', bot_id);
  } catch (error) {
    console.error('Error in handleBotJoinedMeeting:', error);
  }
}

async function handleBotError(data: any) {
  const { bot_id, error_message } = data;
  
  console.error(`❌ Bot ${bot_id} error: ${error_message}`);

  try {
    await supabase
      .from('meeting_bot_requests')
      .update({ 
        status: 'failed',
        error_message: error_message,
        updated_at: new Date().toISOString()
      })
      .eq('recall_bot_id', bot_id);
  } catch (error) {
    console.error('Error in handleBotError:', error);
  }
}

async function handleRecordingReady(data: { bot_id: string; recording_url: string; transcript: string }) {
  const { bot_id, recording_url, transcript } = data;
  
  console.log(`📹 Recording ready for bot ${bot_id}`);

  try {
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

    // Update with recording URL
    await supabase
      .from('meeting_bot_requests')
      .update({ 
        recording_url: recording_url,
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', botRequest.id);

    // Process transcript to extract action items
    if (transcript && transcript.length > 0) {
      await processTranscriptAndCreateRoom(botRequest, transcript);
    } else {
      // Fetch transcript if not included in webhook
      await fetchAndProcessTranscript(botRequest, bot_id);
    }
  } catch (error) {
    console.error('Error in handleRecordingReady:', error);
  }
}

async function fetchAndProcessTranscript(botRequest: any, botId: string) {
  try {
    console.log('📥 Fetching transcript from Recall.ai...');

    const response = await fetch(`https://api.recall.ai/api/v1/bot/${botId}/transcript/`, {
      headers: {
        'Authorization': `Token ${process.env.RECALL_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch transcript');
    }

    const transcriptData = await response.json();
    const transcript = transcriptData.words?.map((w: any) => w.text).join(' ') || '';

    if (transcript) {
      await processTranscriptAndCreateRoom(botRequest, transcript);
    }
  } catch (error) {
    console.error('Failed to fetch transcript:', error);
  }
}

async function processTranscriptAndCreateRoom(botRequest: { 
  id: string; 
  requested_by: string; 
  organization_id: string 
}, transcript: string) {
  try {
    console.log('📄 Processing transcript for bot request:', botRequest.id);

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
      
      // Update status even if no items found
      await supabase
        .from('meeting_bot_requests')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', botRequest.id);
      
      return;
    }

    // Generate room code
    const { data: roomCodeData } = await supabase.rpc('generate_room_code');
    const roomCode = roomCodeData;

    if (!roomCode) {
      throw new Error('Failed to generate room code');
    }

    // Create room
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .insert({
        room_code: roomCode,
        title: `Bot Meeting - ${new Date().toLocaleDateString()}`,
        created_by: botRequest.requested_by,
      })
      .select()
      .single();

    if (roomError || !room) {
      throw new Error('Failed to create room');
    }

    // Insert action items
    const roomActionItems = actionItems.map((item: { 
      task: string; 
      assignee: string; 
      deadline: string | null 
    }) => ({
      room_id: room.id,
      task: item.task,
      assignee: item.assignee || 'Unassigned',
      deadline: item.deadline,
      status: 'pending',
    }));

    await supabase.from('room_action_items').insert(roomActionItems);

    // Update bot request with room ID
    await supabase
      .from('meeting_bot_requests')
      .update({ 
        room_id: room.id,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', botRequest.id);

    // Get all organization members
    const { data: members } = await supabase
      .from('organization_members')
      .select('user_email, user_id')
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

      // TODO: Send email notifications to all org members
      console.log(`📧 Should notify ${members.length} members about room ${roomCode}`);
    }

    console.log('✅ Room created successfully:', room.room_code);

  } catch (error) {
    console.error('❌ Failed to process transcript:', error);
    
    // Update status to failed
    await supabase
      .from('meeting_bot_requests')
      .update({ 
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Processing failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', botRequest.id);
  }
}

function mapRecallStatus(recallStatus: string): string {
  const statusMap: Record<string, string> = {
    'ready': 'pending',
    'joining': 'joining',
    'in_waiting_room': 'waiting',
    'in_call_not_recording': 'joined',
    'in_call_recording': 'recording',
    'call_ended': 'processing',
    'done': 'completed',
    'fatal': 'failed',
    'analysis_done': 'completed',
  };
  
  return statusMap[recallStatus] || 'pending';
}