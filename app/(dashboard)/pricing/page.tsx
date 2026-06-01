'use client';

import { useTransition } from 'react';
import { createCheckoutSession } from '@/app/actions';
import { toast } from 'sonner';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      '5 reports per month',
      'Basic analysis',
      'Trend alerts (limited)',
      'Markdown export',
    ],
    cta: 'Current Plan',
    current: true,
    planKey: null as 'basic' | 'pro' | 'unlimited' | null,
  },
  // Note: New users get 7-day trial (12 reports) automatically on signup
  {
    name: 'Basic',
    price: '$29',
    period: '/month',
    features: [
      '20 reports per month',
      'Deep research mode',
      'Live agent visualization',
      'PDF exports',
      'Trend alerts',
    ],
    cta: 'Start Basic',
    planKey: 'basic' as const,
  },
  {
    name: 'Pro',
    price: '$59',
    period: '/month',
    features: [
      '100 reports per month',
      'Everything in Basic',
      'Full PDF customization',
      'Priority Grok access',
      'Unlimited trend alerts',
      'Advanced exports & history',
    ],
    cta: 'Get Pro',
    popular: true,
    planKey: 'pro' as const,
  },
  {
    name: 'Unlimited',
    price: '$99',
    period: '/month',
    features: [
      'Unlimited reports',
      'Everything in Pro',
      'Highest priority',
      'Custom branding options',
      'Team sharing (coming soon)',
      'Dedicated support',
    ],
    cta: 'Go Unlimited',
    planKey: 'unlimited' as const,
  },
];

export default function PricingPage() {
  const [isPending, startTransition] = useTransition();

  const handleCheckout = (plan: 'basic' | 'pro' | 'unlimited') => {
    startTransition(async () => {
      const result = await createCheckoutSession(plan);
      if (result.url) {
        window.location.href = result.url;
      } else {
        toast.error(result.error || 'Something went wrong');
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-semibold tracking-tighter">Simple, transparent pricing</h1>
        <p className="text-[#a1a1aa] mt-2">Start free with a 7-day trial. Choose the plan that fits your research needs.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div key={plan.name} className={`card rounded-3xl p-8 flex flex-col ${plan.popular ? 'border-[#f59e0b] ring-1 ring-[#f59e0b]/30' : ''}`}>
            <div>
              <div className="font-semibold text-xl">{plan.name}</div>
              <div className="mt-4 flex items-baseline">
                <span className="text-5xl font-semibold tracking-tighter">{plan.price}</span>
                <span className="text-[#a1a1aa] ml-1">{plan.period}</span>
              </div>
            </div>

            <ul className="mt-8 space-y-3 text-sm flex-1">
              {plan.features.map((f, i) => (
                <li key={i} className="flex gap-2">✓ {f}</li>
              ))}
            </ul>

            <button
              disabled={plan.current || isPending}
              onClick={() => plan.planKey && handleCheckout(plan.planKey)}
              className={`mt-8 h-12 rounded-2xl font-semibold w-full transition ${plan.current ? 'bg-[#27272a] text-[#a1a1aa] cursor-default' : 'btn-primary disabled:opacity-70'}`}
            >
              {isPending ? 'Redirecting...' : plan.cta}
            </button>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-[#a1a1aa] mt-10">
        All paid plans include the full live multi-agent visualization, professional PDF exports, and style/length customization. New users get a 7-day trial with 12 reports automatically.
      </p>
    </div>
  );
}
