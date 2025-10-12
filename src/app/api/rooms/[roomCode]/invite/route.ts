import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { generateInviteEmail } from '@/lib/email-templates';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { roomCode } = await params;
    const { email, accessLevel } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const inviterEmail = user.emailAddresses[0]?.emailAddress;
    const inviterName = user.firstName || user.emailAddresses[0]?.emailAddress.split('@')[0] || 'A team member';

    // Get room
    const { data: room } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_code', roomCode)
      .single();

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Check if user is the room creator
    if (room.created_by !== user.id) {
      return NextResponse.json({ error: 'Only room creator can invite' }, { status: 403 });
    }

    // Add member
    const { error: insertError } = await supabase
      .from('room_members')
      .insert({
        room_id: room.id,
        user_email: email.toLowerCase(),
        invited_by: user.id,
        access_level: accessLevel || 'editor',
      });

    if (insertError) {
      if (insertError.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'User already invited' }, { status: 400 });
      }
      throw insertError;
    }

    // Send invitation email
    try {
      const signInUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sign-in`;
      const inviteeName = email.split('@')[0]; // Use email username as name
      
      const { subject, html, text } = generateInviteEmail({
        inviteeName,
        inviterName,
        roomTitle: room.title,
        roomCode: room.room_code,
        signInUrl,
        accessLevel: accessLevel || 'editor',
      });

      // Determine from email based on environment
      const fromEmail = process.env.NODE_ENV === 'production'
        ? `invites@${process.env.RESEND_DOMAIN || 'resend.dev'}`
        : 'onboarding@resend.dev';

      // Check if we should skip email in development (if not the verified email)
      const shouldSendEmail = process.env.NODE_ENV === 'production' || 
                             !process.env.RESEND_TEST_EMAIL || 
                             email.toLowerCase() === process.env.RESEND_TEST_EMAIL?.toLowerCase();

      if (shouldSendEmail) {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: email,
            subject,
            html,
            text,
          }),
        });

        const responseData = await response.json();
        
        if (!response.ok) {
          console.error('Failed to send invite email:', responseData);
          // Don't fail the invitation if email fails
          return NextResponse.json({ 
            success: true,
            emailSent: false,
            message: 'Invitation created but email failed to send'
          });
        }

        console.log(`✅ Invite email sent to ${email}`);
      } else {
        console.log(`⏭️  Skipped email to ${email} (not verified in development)`);
      }

    } catch (emailError) {
      console.error('Error sending invite email:', emailError);
      // Don't fail the invitation if email fails
    }

    return NextResponse.json({ 
      success: true,
      emailSent: true 
    });

  } catch (error) {
    console.error('Error inviting member:', error);
    return NextResponse.json({ error: 'Failed to invite member' }, { status: 500 });
  }
}