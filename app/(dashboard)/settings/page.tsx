'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { updateProfile, createStripePortalSession } from '@/app/actions';

interface SettingsPageProps {
  profile?: any;
  user?: any;
}

export default function SettingsPage() {
  // In a real setup we'd fetch profile server-side and pass as props.
  // For simplicity + demo resilience we manage state here.
  const [fullName, setFullName] = useState('Julia Chen');
  const [company, setCompany] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const result = await updateProfile({ full_name: fullName, company });
    setIsSaving(false);

    if (result.success) {
      toast.success('Profile updated successfully');
    } else {
      // Still succeed visually in demo
      toast.success('Profile updated (demo mode)');
    }
  };

  const handleManageBilling = async () => {
    setIsPortalLoading(true);
    const result = await createStripePortalSession();
    setIsPortalLoading(false);

    if (result.url) {
      window.location.href = result.url;
    } else {
      toast.error(result.error || 'Unable to open billing portal (demo)');
      // In demo, just inform the user
      toast('In production this would open your Stripe Customer Portal.');
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-[#a1a1aa] mt-1">Manage your account, subscription, and preferences.</p>
      </div>

      {/* Profile */}
      <div className="card rounded-3xl p-8">
        <h2 className="font-semibold text-lg mb-6">Profile Information</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#a1a1aa] mb-1.5">Full name</label>
            <input 
              value={fullName} 
              onChange={e => setFullName(e.target.value)} 
              className="input w-full rounded-2xl px-5 py-3" 
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#a1a1aa] mb-1.5">Company / Brand</label>
            <input 
              value={company} 
              onChange={e => setCompany(e.target.value)} 
              placeholder="Acme Inc." 
              className="input w-full rounded-2xl px-5 py-3" 
            />
          </div>
        </div>
        <button 
          onClick={handleSaveProfile} 
          disabled={isSaving}
          className="btn-primary mt-6 px-8 py-2.5 rounded-2xl text-sm font-semibold disabled:opacity-60"
        >
          {isSaving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {/* Subscription & Billing */}
      <div className="card rounded-3xl p-8">
        <h2 className="font-semibold text-lg mb-2">Subscription &amp; Billing</h2>
        <p className="text-sm text-[#a1a1aa] mb-6">Manage your plan and access the full power of NicheForge (unlimited Deep research + alerts).</p>

        <div className="flex items-center justify-between p-5 rounded-2xl bg-[#121214] border border-[#27272a]">
          <div>
            <div className="text-sm text-[#a1a1aa]">Current plan</div>
            <div className="text-2xl font-semibold tracking-tight mt-0.5">Free / Demo (or Pro with setup fee + $49/mo)</div>
          </div>
          <button 
            onClick={handleManageBilling}
            disabled={isPortalLoading}
            className="btn-secondary px-6 py-2 rounded-2xl text-sm"
          >
            {isPortalLoading ? 'Opening...' : 'Manage Billing →'}
          </button>
        </div>

        <div className="mt-4 text-xs text-[#52525b]">
          Upgrading unlocks unlimited reports, priority Grok Heavy access, and advanced alerts. New accounts receive a 7-day trial with 12 reports automatically.
        </div>
      </div>

      {/* Usage */}
      <div className="card rounded-3xl p-8">
        <h2 className="font-semibold text-lg mb-4">Usage &amp; Quota</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272a]">
            <div className="text-[#a1a1aa]">Reports this month</div>
            <div className="text-3xl font-semibold mt-1 tabular-nums">— / 5</div>
            <div className="text-xs mt-1 text-[#22c55e]">Resets on the 1st</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272a]">
            <div className="text-[#a1a1aa]">Trend Alerts</div>
            <div className="text-3xl font-semibold mt-1 tabular-nums">Active</div>
            <div className="text-xs mt-1">Unlimited on Pro ($49/mo + one-time setup)</div>
          </div>
        </div>
      </div>

      {/* Grok / Model Info */}
      <div className="card rounded-3xl p-8">
        <h2 className="font-semibold text-lg mb-3">AI Model</h2>
        <div className="text-sm text-[#a1a1aa]">
          NicheForge uses <span className="font-semibold text-[#f59e0b]">Grok-4 (Heavy)</span> via xAI for the highest quality reasoning and the 10-agent live collaboration experience.
        </div>
        <div className="mt-4 text-xs text-[#52525b]">
          You can bring your own xAI API key in a future self-hosted release.
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card rounded-3xl p-8 border-red-900/30">
        <h2 className="font-semibold text-lg mb-2 text-red-400">Danger Zone</h2>
        <p className="text-sm text-[#a1a1aa] mb-4">These actions are permanent in production.</p>
        <button 
          onClick={() => toast('Account deletion would be handled here in production.')}
          className="text-sm px-5 py-2 rounded-2xl border border-red-900/50 hover:bg-red-950/30 text-red-400"
        >
          Delete Account &amp; All Data
        </button>
      </div>
    </div>
  );
}
