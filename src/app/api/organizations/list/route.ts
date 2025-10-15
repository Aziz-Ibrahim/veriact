import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 1. Fetch all memberships and join the organization details
    const { data: memberships, error: memberError } = await supabase
      .from('organization_members')
      .select('organization_id, role, organizations(id, name, organization_token)')
      .eq('user_id', user.id);

    if (memberError) {
      console.error('Supabase member query error:', memberError);
      // Throwing an error here will lead to the outer catch block (500)
      throw new Error('Failed to query memberships from DB.');
    }

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ organizations: [] });
    }

    // 2. Process memberships and fetch member counts, filtering out errors/nulls
    const organizations = await Promise.all(
      memberships.map(async (membership) => {
        try {
          // Access the joined organization data
          const org = (membership as any).organizations;
          
          // CRITICAL FIX 1: Explicitly check for null/missing organization record
          if (!org || !org.id) {
            console.warn(`Skipping orphaned or incomplete membership for ID: ${membership.organization_id}`);
            return null; 
          }

          // Fetch member count for the valid organization
          const { data: members, error: memberCountError } = await supabase
            .from('organization_members')
            .select('id')
            .eq('organization_id', org.id);

          if (memberCountError) {
               console.error('Error fetching member count for org:', org.id, memberCountError);
               // Do not crash the entire endpoint, just proceed with memberCount 0
          }

          return {
            id: org.id,
            name: org.name,
            token: org.organization_token,
            role: membership.role,
            memberCount: members?.length || 0,
          };
        } catch (innerError) {
          // CRITICAL FIX 2: Catch any runtime error within the map function
          console.error('Runtime error processing single membership:', innerError);
          return null;
        }
      })
    );

    // 3. Filter out null entries (orphaned or failed memberships)
    const validOrganizations = organizations.filter(org => org !== null);

    return NextResponse.json({ organizations: validOrganizations });

  } catch (error) {
    console.error('Fatal Error listing organizations:', error);
    return NextResponse.json(
      { error: 'Failed to list organizations due to a server error' },
      { status: 500 }
    );
  }
}