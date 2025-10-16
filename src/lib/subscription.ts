// src/lib/subscription.ts
import { createClient } from '@supabase/supabase-js';

// Use service role key for admin operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export type Plan = 'free' | 'pro' | 'enterprise';

export interface SubscriptionInfo {
  plan: Plan;
  status: string;
  isActive: boolean;
  organizationId?: string;
  organizationName?: string;
  features: {
    canCreateRooms: boolean;
    canInviteMembers: boolean;
    canUseMeetingBot: boolean;
    canReceiveReminders: boolean;
    extractionLimit: number | null; // null = unlimited
  };
}

export async function getUserSubscription(userId: string): Promise<SubscriptionInfo> {
  // Check if user is part of an organization
  const { data: orgMember } = await supabaseAdmin
    .from('organization_members')
    .select('organization_id, organizations(name, id)')
    .eq('user_id', userId)
    .single();

  if (orgMember && orgMember.organization_id) {
    // Check organization subscription
    const { data: orgSub } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('organization_id', orgMember.organization_id)
      .eq('status', 'active')
      .single();

    if (orgSub && orgSub.plan === 'enterprise') {
      return {
        plan: 'enterprise',
        status: orgSub.status,
        isActive: true,
        organizationId: orgMember.organization_id,
        organizationName: (orgMember.organizations as any)?.name,
        features: {
          canCreateRooms: true,
          canInviteMembers: true,
          canUseMeetingBot: true,
          canReceiveReminders: true,
          extractionLimit: null,
        },
      };
    }
  }

  // Check individual subscription
  const { data: userSub } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (userSub && userSub.status === 'active') {
    if (userSub.plan === 'pro') {
      return {
        plan: 'pro',
        status: userSub.status,
        isActive: true,
        features: {
          canCreateRooms: true,
          canInviteMembers: true,
          canUseMeetingBot: false,
          canReceiveReminders: true,
          extractionLimit: null,
        },
      };
    }
  }

  // Default: Free plan
  return {
    plan: 'free',
    status: 'active',
    isActive: true,
    features: {
      canCreateRooms: false,
      canInviteMembers: false,
      canUseMeetingBot: false,
      canReceiveReminders: false,
      extractionLimit: 5, // 5 per month
    },
  };
}

export async function checkFeatureAccess(
  userId: string,
  feature: keyof SubscriptionInfo['features']
): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  return subscription.features[feature] as boolean;
}

export async function logUsage(
  userId: string,
  action: string,
  details?: any
): Promise<void> {
  // Get user's organization if any
  const { data: orgMember } = await supabaseAdmin
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', userId)
    .single();

  await supabaseAdmin.from('usage_logs').insert({
    user_id: userId,
    organization_id: orgMember?.organization_id || null,
    action,
    details,
  });
}

export async function getMonthlyUsage(userId: string): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data, error } = await supabaseAdmin
    .from('usage_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('action', 'extraction')
    .gte('created_at', startOfMonth.toISOString());

  return data?.length || 0;
}