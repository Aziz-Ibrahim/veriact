import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('⚠️ Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
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
  const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId);

  // Update or create subscription in database
  if (organizationId && organizationId !== '') {
    // Enterprise subscription
    await supabase
      .from('subscriptions')
      .upsert({
        organization_id: organizationId,
        plan,
        status: subscriptionResponse.status,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscriptionId,
        current_period_start: new Date((subscriptionResponse as any).current_period_start * 1000).toISOString(),
        current_period_end: new Date((subscriptionResponse as any).current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'organization_id'
      });

    console.log('✅ Enterprise subscription created for org:', organizationId);
  } else if (userId && userId !== '') {
    // Pro subscription
    await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan,
        status: subscriptionResponse.status,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscriptionId,
        current_period_start: new Date((subscriptionResponse as any).current_period_start * 1000).toISOString(),
        current_period_end: new Date((subscriptionResponse as any).current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    console.log('✅ Pro subscription created for user:', userId);
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