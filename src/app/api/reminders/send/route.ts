// src/app/api/reminders/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateReminderEmail } from '@/lib/email-templates';

// Security: Only allow requests with correct authorization
const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-key-change-this';

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔔 Starting reminder job...');

    // Get all active rooms (not expired)
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .gt('expires_at', new Date().toISOString());

    if (roomsError) throw roomsError;

    if (!rooms || rooms.length === 0) {
      console.log('No active rooms found');
      return NextResponse.json({ 
        success: true, 
        message: 'No active rooms',
        sent: 0 
      });
    }

    console.log(`📋 Found ${rooms.length} active rooms`);

    let emailsSent = 0;
    let errors = 0;

    // Process each room
    for (const room of rooms) {
      try {
        // Get action items for this room
        const { data: actionItems, error: itemsError } = await supabase
          .from('room_action_items')
          .select('*')
          .eq('room_id', room.id)
          .in('status', ['pending', 'in-progress']);

        if (itemsError) throw itemsError;

        // Skip if no pending items
        if (!actionItems || actionItems.length === 0) {
          console.log(`⏭️  Skipping room ${room.room_code} - no pending items`);
          continue;
        }

        // Get all members for this room
        const { data: members, error: membersError } = await supabase
          .from('room_members')
          .select('*')
          .eq('room_id', room.id);

        if (membersError) throw membersError;

        // Add room owner to the list
        const allRecipients = [
          ...(members || []),
          // Also send to room creator (owner)
          { user_email: room.created_by_email, access_level: 'owner' }
        ];

        // In development, filter to only verified email to avoid Resend restrictions
        let recipientsToEmail = allRecipients;
        
        if (process.env.NODE_ENV === 'development') {
          const verifiedEmail = process.env.RESEND_TEST_EMAIL; // Your verified email
          if (verifiedEmail) {
            recipientsToEmail = allRecipients.filter(m => m.user_email === verifiedEmail);
            console.log(`🔧 Development mode: Only sending to verified email (${verifiedEmail})`);
          }
        }

        console.log(`📧 Sending to ${recipientsToEmail.length} members in ${room.room_code}`);

        // Send email to ALL room members (everyone sees all action items)
        for (const member of recipientsToEmail) {
          try {
            // Safety check for user_email
            if (!member.user_email) {
              console.log('⏭️  Skipping member with no email');
              continue;
            }

            // Generate email content (all action items in the room)
            const roomLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?room=${room.room_code}`;
            
            // Safe username extraction
            const userName = member.user_email?.split('@')[0] || 'Team Member';
            
            const { subject, html, text } = generateReminderEmail({
              userName,
              roomTitle: room.title,
              roomCode: room.room_code,
              actionItems: actionItems, // Send ALL items, not just member's items
              roomLink,
            });

            // Send email
            const fromEmail = process.env.NODE_ENV === 'production'
              ? `reminders@${process.env.RESEND_DOMAIN || 'resend.dev'}`
              : 'onboarding@resend.dev';

            // Use fetch instead of SDK to avoid React Email dependency
            const response = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: fromEmail,
                to: member.user_email,
                subject,
                html,
                text,
              }),
            });

            const responseData = await response.json();
            
            if (!response.ok) {
              throw new Error(`Resend API error: ${JSON.stringify(responseData)}`);
            }

            emailsSent++;
            console.log(`✅ Sent to ${member.user_email}`);

            // Small delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 100));

          } catch (emailError) {
            console.error(`❌ Failed to send to ${member.user_email}:`, emailError);
            // Log more details for debugging
            if (emailError instanceof Error) {
              console.error('Error details:', emailError.message);
            }
            errors++;
          }
        }

      } catch (roomError) {
        console.error(`❌ Error processing room ${room.room_code}:`, roomError);
        errors++;
      }
    }

    console.log(`✨ Reminder job complete: ${emailsSent} sent, ${errors} errors`);

    return NextResponse.json({
      success: true,
      emailsSent,
      errors,
      roomsProcessed: rooms.length,
    });

  } catch (error) {
    console.error('❌ Reminder job failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send reminders' 
      },
      { status: 500 }
    );
  }
}

// Allow manual trigger from dashboard (for testing)
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  // Call the POST handler
  const mockRequest = new NextRequest(request.url, {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${CRON_SECRET}`,
    },
  });

  return POST(mockRequest);
}