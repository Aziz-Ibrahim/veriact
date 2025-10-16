// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Use service role key for admin operations (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    let event: Stripe.Event;

    // In development, skip signature verification if using Stripe CLI
    if (process.env.NODE_ENV === 'development' && process.env.SKIP_STRIPE_SIGNATURE === 'true') {
      const body = await request.json();
      event = body as Stripe.Event;
      console.log('🔧 Dev mode: Skipping signature verification');
    } else {
      // Production: Verify signature
      const buf = await request.arrayBuffer();
      const body = Buffer.from(buf).toString('utf8');
      const signature = request.headers.get('stripe-signature');

      if (!signature) {
        console.error('❌ No signature header');
        return NextResponse.json({ error: 'No signature' }, { status: 400 });
      }

      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        console.error('⚠️ Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    console.log('✅ Stripe webhook received:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('❌ Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('💳 Checkout completed:', session.id);

  const userId = session.metadata?.userId;
  const organizationId = session.metadata?.organizationId;
  const plan = session.metadata?.plan as 'pro' | 'enterprise';

  if (!plan) {
    console.error('No plan in metadata');
    return;
  }

  // Get subscription details
  const subscriptionId = session.subscription as string;
  
  if (!subscriptionId) {
    console.error('No subscription ID in session');
    return;
  }

  try {
    const subscription: any = await stripe.subscriptions.retrieve(subscriptionId);

    const periodStart = subscription.current_period_start 
      ? new Date(subscription.current_period_start * 1000).toISOString()
      : new Date().toISOString();
    
    const periodEnd = subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // +30 days

    // Update or create subscription in database
    if (organizationId && organizationId !== '') {
      // Enterprise subscription
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          organization_id: organizationId,
          plan,
          status: subscription.status,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscriptionId,
          current_period_start: periodStart,
          current_period_end: periodEnd,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'organization_id'
        });

      if (error) {
        console.error('Database error (org):', error);
      } else {
        console.log('✅ Enterprise subscription created for org:', organizationId);
      }
    } else if (userId && userId !== '') {
      // Pro subscription
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan,
          status: subscription.status,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscriptionId,
          current_period_start: periodStart,
          current_period_end: periodEnd,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Database error (user):', error);
      } else {
        console.log('✅ Pro subscription created for user:', userId);
      }
    }
  } catch (error) {
    console.error('Error processing subscription:', error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('📝 Subscription created:', subscription.id);
  // Usually handled by checkout.session.completed
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 Subscription updated:', subscription.id);

  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('❌ Subscription deleted:', subscription.id);

  await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('💰 Payment succeeded:', invoice.id);

  const subscriptionId = (invoice as any).subscription;
  if (subscriptionId) {
    await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId as string);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('⚠️ Payment failed:', invoice.id);

  const subscriptionId = (invoice as any).subscription;
  if (subscriptionId) {
    await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId as string);
  }
}