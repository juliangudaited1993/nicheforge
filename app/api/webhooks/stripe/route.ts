import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  const stripeClient = getStripe();
  try {
    event = stripeClient.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables for webhook');
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const plan = session.metadata?.plan as 'basic' | 'pro' | 'unlimited';

        if (userId && plan) {
          let quotaLimit = 20;
          if (plan === 'pro') quotaLimit = 100;
          if (plan === 'unlimited') quotaLimit = 9999;

          const updates: any = {
            subscription_tier: plan,
            report_quota_limit: quotaLimit,
          };

          if (session.subscription) {
            updates.stripe_subscription_id = session.subscription;
          }

          await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId);
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          const isActive = subscription.status === 'active' || subscription.status === 'trialing';
          // Determine quota based on metadata or default
          const plan = subscription.metadata?.plan as 'basic' | 'pro' | 'unlimited' | undefined;
          let quota = 5;
          if (isActive) {
            if (plan === 'unlimited') quota = 9999;
            else if (plan === 'pro') quota = 100;
            else if (plan === 'basic') quota = 20;
            else quota = 9999; // fallback
          }

          await supabase
            .from('profiles')
            .update({
              subscription_tier: isActive ? (plan || 'pro') : 'free',
              report_quota_limit: quota,
            })
            .eq('id', profile.id);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
