import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe() {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    });
  }
  return _stripe;
}

// Price IDs - set these in your Stripe dashboard and .env
// New pricing: $29 Basic (limited), $59 Pro (more + customization), $99 Unlimited
export const PRICES = {
  basicMonthly: process.env.STRIPE_PRICE_BASIC_MONTHLY || '',    // $29/month
  proMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',        // $59/month
  unlimitedMonthly: process.env.STRIPE_PRICE_UNLIMITED_MONTHLY || '', // $99/month
} as const;

export type Plan = 'basic' | 'pro' | 'unlimited';
