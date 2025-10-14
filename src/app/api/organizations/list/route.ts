import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get organizations user is a member of
    const { data: memberships, error: memberError } = await supabase
      .from('organization_members')
      .select('organization_id, role, organizations(id, name, organization_token)')
      .eq('user_id', user.id);

    if (memberError) {
      throw memberError;
    }

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ organizations: [] });
    }

    // Get member counts for each organization
    const organizations = await Promise.all(
      memberships.map(async (membership) => {
        const org = (membership as any).organizations;
        
        const { data: members } = await supabase
          .from('organization_members')
          .select('id')
          .eq('organization_id', membership.organization_id);

        return {
          id: org.id,
          name: org.name,
          token: org.organization_token,
          role: membership.role,
          memberCount: members?.length || 0,
        };
      })
    );

    return NextResponse.json({ organizations });

  } catch (error) {
    console.error('Error listing organizations:', error);
    return NextResponse.json(
      { error: 'Failed to list organizations' },
      { status: 500 }
    );
  }
}