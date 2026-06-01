'use server';

import { createClient } from '@/lib/supabase/server';
import { generateGrokReport } from '@/lib/grok';
import { NicheReport } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function generateAndSaveReport(
  topic: string,
  depth: 'quick' | 'standard' | 'deep' = 'standard',
  customInstructions: string = '',
  researchStyle: string = 'corporate',
  reportLength: string = 'medium'
): Promise<{ success: boolean; report?: NicheReport; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const cookieStore = await cookies();
    const isTestMode = cookieStore.get('researchforge-test-mode')?.value === 'true';
    const hasDemoLogin = cookieStore.get('researchforge-demo-login')?.value === 'true';

    // Fully functional Demo Login + Test Mode: 
    // - Explicit demo login cookie (the "actual login" bypass)
    // - Old test mode cookie
    // - No Supabase configured
    const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || isTestMode || hasDemoLogin;

    if (!user && !isDemoMode) {
      return { success: false, error: 'You must be logged in to generate reports.' };
    }

    // Pass empty custom instructions for now (can be extended with a textarea in the UI)
    // Use a single strong call on the best available model for reliability + quality.
    // The beautiful 10-agent visualization is handled client-side.
    const reportData = await generateGrokReport(topic, depth, customInstructions || '', researchStyle, reportLength);

    if (isDemoMode) {
      // Pure Test Mode / no Supabase: return rich demo report.
      // Actual persistence to history happens client-side in new-report page (localStorage).
      const demoReport: NicheReport = {
        ...reportData,
        id: 'demo-' + Date.now(),
        created_at: new Date().toISOString(),
        researchStyle: researchStyle as any,
        reportLength: reportLength as any,
      };

      return { success: true, report: demoReport };
    }

    // Real authenticated mode - Trial + Quota system (production ready)
    const { data: profile } = await supabase
      .from('profiles')
      .select('report_quota_used, report_quota_limit, subscription_tier, trial_ends_at, trial_started_at')
      .eq('id', user!.id)
      .single();

    const now = new Date();
    const trialEnd = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : null;
    const isTrialActive = !!trialEnd && trialEnd > now;
    const tier = profile?.subscription_tier || 'free';
    const isPaid = ['basic', 'pro', 'unlimited'].includes(tier);

    // Determine effective limit based on new pricing
    let effectiveLimit = profile?.report_quota_limit ?? 5;
    let isWithinTrial = false;

    if (tier === 'unlimited') {
      effectiveLimit = 9999;
    } else if (tier === 'pro') {
      effectiveLimit = 100;
    } else if (tier === 'basic') {
      effectiveLimit = 20;
    } else if (isTrialActive) {
      effectiveLimit = 12; // 7-day trial
      isWithinTrial = true;
    }

    const used = profile?.report_quota_used ?? 0;

    if (used >= effectiveLimit) {
      const message = isWithinTrial
        ? `You've used all ${effectiveLimit} trial reports. Your 7-day trial ends soon — upgrade to continue.`
        : `Monthly quota reached (${used}/${effectiveLimit}). Upgrade to a higher plan for more reports.`;
      
      return { success: false, error: message };
    }

    // Real mode - save to database
    const { data, error } = await supabase
      .from('reports')
      .insert({
        user_id: user!.id,
        topic: reportData.topic || reportData.niche || 'Research Topic',
        niche: reportData.niche || reportData.topic || null, // legacy compat (can be null)
        research_style: reportData.researchStyle || researchStyle || 'corporate',
        report_length: reportData.reportLength || reportLength || 'medium',
        score: reportData.score,
        depth: reportData.depth,
        summary: reportData.summary,
        metrics: reportData.metrics,
        insights: reportData.insights,
        competitors: reportData.competitors || [],
        playbook: reportData.playbook || [],
        related: reportData.related || [],
        full_data: {
          ...reportData,
          researchStyle: researchStyle,
          reportLength: reportLength,
        },
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return { success: false, error: 'Failed to save report.' };
    }

    // Increment quota (paid users are unlimited; trial users consume from the trial bucket)
    const shouldIncrementQuota = profile && !isPaid;
    if (shouldIncrementQuota) {
      await supabase
        .from('profiles')
        .update({ 
          report_quota_used: used + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', user!.id);
    }

    const savedReport: NicheReport = {
      ...reportData,
      id: data.id,
      created_at: data.created_at,
    };

    revalidatePath('/dashboard');
    revalidatePath('/reports');

    return { success: true, report: savedReport };
  } catch (err: any) {
    console.error('generateAndSaveReport error:', err);
    return {
      success: false,
      error: err.message || 'Failed to generate report. Please try again.',
    };
  }
}

export async function deleteReport(reportId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', reportId)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/reports');
  return { success: true };
}

export async function getUserReports() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  // In demo mode the dummy client returns no data
  try {
    const { data } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    return (data || []) as any[];
  } catch {
    return [];
  }
}

// Trend Alerts Actions
export async function getUserAlerts() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  try {
    const { data } = await supabase
      .from('trend_alerts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    return data || [];
  } catch {
    return [];
  }
}

export async function createTrendAlert(keyword: string, frequency: 'weekly' | 'monthly' = 'monthly', minScore = 70) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not logged in' };

  try {
    const { error } = await supabase.from('trend_alerts').insert({
      user_id: user.id,
      keyword,
      frequency,
      min_score: minScore,
      is_active: true,
    });
    if (error) throw error;
    revalidatePath('/alerts');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteTrendAlert(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  await supabase.from('trend_alerts').delete().eq('id', id).eq('user_id', user.id);
  revalidatePath('/alerts');
  return { success: true };
}

export async function updateProfile(data: { full_name?: string; company?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not logged in' };

  const { error } = await supabase
    .from('profiles')
    .update({ 
      full_name: data.full_name, 
      company: data.company,
      updated_at: new Date().toISOString() 
    })
    .eq('id', user.id);

  if (error) return { success: false, error: error.message };
  
  revalidatePath('/settings');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function createStripePortalSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'You must be logged in' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return { error: 'No billing customer found. Please subscribe first.' };
  }

  const stripeClient = getStripe();
  const session = await stripeClient.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/settings`,
  });

  return { url: session.url };
}

export async function getTrialStatus() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { isDemo: true, isTrialActive: false, daysLeft: 0, used: 0, limit: 999 };

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, trial_ends_at, trial_started_at, report_quota_used, report_quota_limit')
    .eq('id', user.id)
    .single();

  if (!profile) return { isDemo: false, isTrialActive: false, daysLeft: 0, used: 0, limit: 5 };

  const tier = profile.subscription_tier || 'free';
  const isPaid = ['basic', 'pro', 'unlimited'].includes(tier);
  const trialEnd = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null;
  const now = new Date();
  const isTrialActive = !!trialEnd && trialEnd > now && !isPaid;

  let daysLeft = 0;
  if (isTrialActive && trialEnd) {
    daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 3600 * 24)));
  }

  const limit = tier === 'unlimited' ? 9999 : (tier === 'pro' ? 100 : (tier === 'basic' ? 20 : (isTrialActive ? 12 : (profile.report_quota_limit || 5))));

  return {
    isDemo: false,
    isTrialActive,
    daysLeft,
    used: profile.report_quota_used || 0,
    limit,
    tier,
  };
}

// ============================================
// STRIPE CHECKOUT ACTIONS
// ============================================

import { getStripe, PRICES } from '@/lib/stripe';

export async function createCheckoutSession(plan: 'basic' | 'pro' | 'unlimited') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  const stripeClient = getStripe();

  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripeClient.customers.create({
      email: user.email!,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id);
  }

  // New pure monthly pricing
  let monthlyPriceId: string;
  let planName = plan;

  if (plan === 'basic') {
    monthlyPriceId = PRICES.basicMonthly;
  } else if (plan === 'pro') {
    monthlyPriceId = PRICES.proMonthly;
  } else {
    monthlyPriceId = PRICES.unlimitedMonthly;
  }

  if (!monthlyPriceId) {
    return { error: 'Payment configuration is incomplete. Please contact support or try again later.' };
  }

  const lineItems = [
    {
      price: monthlyPriceId,
      quantity: 1,
    },
  ];

  const session = await stripeClient.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'subscription', // Primary is subscription; one-time is added as line item
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/pricing?canceled=true`,
    metadata: {
      supabase_user_id: user.id,
      plan: planName,
    },
    subscription_data: {
      metadata: {
        supabase_user_id: user.id,
        plan: planName,
      },
    },
  });

  return { url: session.url };
}
