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
// New hybrid model: $297-$497 one-time setup fee + $49/month subscription
export const PRICES = {
  setupFee: process.env.STRIPE_PRICE_SETUP_FEE || '',      // One-time: $397 (range $297-$497)
  proMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',   // Recurring: $49 / month
} as const;

export type Plan = 'free' | 'pro';
