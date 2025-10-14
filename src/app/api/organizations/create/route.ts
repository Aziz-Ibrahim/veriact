import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { organizationName, domain } = await request.json();

    if (!organizationName) {
      return NextResponse.json({ error: 'Organization name required' }, { status: 400 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // Generate organization token
    const { data: tokenData, error: tokenError } = await supabase
      .rpc('generate_org_token');

    if (tokenError || !tokenData) {
      throw new Error('Failed to generate organization token');
    }

    const orgToken = tokenData;

    // Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: organizationName,
        domain: domain || null,
        organization_token: orgToken,
        owner_id: user.id,
      })
      .select()
      .single();

    if (orgError || !org) {
      console.error('Organization creation error:', orgError);
      throw new Error('Failed to create organization');
    }

    // Add creator as owner
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: org.id,
        user_id: user.id,
        user_email: userEmail,
        role: 'owner',
      });

    if (memberError) {
      console.error('Failed to add owner as member:', memberError);
      // Rollback
      await supabase.from('organizations').delete().eq('id', org.id);
      throw new Error('Failed to add owner as member');
    }

    // Create free subscription initially (will upgrade after payment)
    const { error: subError } = await supabase
      .from('subscriptions')
      .insert({
        organization_id: org.id,
        plan: 'free',
        status: 'active',
      });

    if (subError) {
      console.error('Failed to create subscription:', subError);
      // Don't rollback, subscription can be created later
    }

    return NextResponse.json({
      success: true,
      organization: {
        id: org.id,
        name: org.name,
        token: org.organization_token,
      },
    });

  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create organization' },
      { status: 500 }
    );
  }
}