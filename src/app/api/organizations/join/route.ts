import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { organizationToken } = await request.json();

    if (!organizationToken) {
      return NextResponse.json({ error: 'Organization token required' }, { status: 400 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // Find organization by token
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('organization_token', organizationToken.toUpperCase())
      .single();

    if (orgError || !org) {
      return NextResponse.json({ error: 'Invalid organization token' }, { status: 404 });
    }

    // Check if domain matches (if domain is set)
    if (org.domain) {
      const emailDomain = userEmail.split('@')[1];
      if (emailDomain !== org.domain) {
        return NextResponse.json(
          { error: `You must use an @${org.domain} email address to join this organization` },
          { status: 403 }
        );
      }
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', org.id)
      .eq('user_id', user.id)
      .single();

    if (existingMember) {
      return NextResponse.json({ error: 'Already a member of this organization' }, { status: 400 });
    }

    // Add user as member
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: org.id,
        user_id: user.id,
        user_email: userEmail,
        role: 'member',
      });

    if (memberError) {
      if (memberError.code === '23505') {
        return NextResponse.json({ error: 'Already a member' }, { status: 400 });
      }
      throw memberError;
    }

    return NextResponse.json({
      success: true,
      organization: {
        id: org.id,
        name: org.name,
      },
    });

  } catch (error) {
    console.error('Error joining organization:', error);
    return NextResponse.json(
      { error: 'Failed to join organization' },
      { status: 500 }
    );
  }
}