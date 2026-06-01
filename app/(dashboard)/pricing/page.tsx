'use client';

import { useTransition } from 'react';
import { createCheckoutSession } from '@/app/actions';
import { toast } from 'sonner';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['5 reports per month', 'Basic Grok analysis', 'Trend alerts (1)', 'Export to Markdown'],
    cta: 'Current Plan',
    current: true,
    planKey: null as 'pro' | null,
  },
  // Note: New users automatically get a 7-day trial with 12 reports upon signing up
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    features: [
      'Unlimited reports',
      'Deep research mode with live 10-agent visualization',
      'Unlimited trend alerts',
      'Priority Grok Heavy access',
      'Full professional PDF exports',
      '+ One-time setup fee: $397 (range $297–$497)'
    ],
    cta: 'Get Pro Access',
    popular: true,
    planKey: 'pro' as const,
  },
];

export default function PricingPage() {
  const [isPending, startTransition] = useTransition();

  const handleCheckout = (plan: 'pro') => {
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
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-semibold tracking-tighter">Simple, transparent pricing</h1>
        <p className="text-[#a1a1aa] mt-2">Start free. Scale when you need real power.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
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
        Includes the full live 10-agent visualization and professional PDF exports. The one-time setup fee covers onboarding and customization.
      </p>
    </div>
  );
}
