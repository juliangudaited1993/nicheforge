-- =====================================================
-- NicheForge AI - Supabase Database Schema
-- Run this in Supabase SQL Editor (or via migrations)
-- =====================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =====================================================
-- REPORTS TABLE
-- =====================================================
create table public.reports (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  niche text not null,
  score integer not null check (score >= 0 and score <= 100),
  depth text not null check (depth in ('quick', 'standard', 'deep')),
  summary text not null,
  metrics jsonb not null,
  insights jsonb not null,
  competitors jsonb not null,
  playbook jsonb not null,
  related jsonb not null,
  full_data jsonb, -- full raw response from Grok if needed
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.reports enable row level security;

-- Policies
create policy "Users can view their own reports"
  on public.reports for select
  using (auth.uid() = user_id);

create policy "Users can insert their own reports"
  on public.reports for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own reports"
  on public.reports for delete
  using (auth.uid() = user_id);

-- Index for performance
create index reports_user_id_created_at_idx on public.reports (user_id, created_at desc);

-- =====================================================
-- TREND ALERTS TABLE
-- =====================================================
create table public.trend_alerts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  keyword text not null,
  frequency text not null default 'monthly' check (frequency in ('weekly', 'monthly')),
  min_score integer default 70,
  is_active boolean default true,
  last_sent_at timestamptz,
  created_at timestamptz default now() not null
);

alter table public.trend_alerts enable row level security;

create policy "Users can manage their own alerts"
  on public.trend_alerts
  using (auth.uid() = user_id);

create index trend_alerts_user_id_idx on public.trend_alerts (user_id);

-- =====================================================
-- USER PROFILES / SETTINGS (optional extension of auth.users)
-- =====================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  company text,
  avatar_url text,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'pro')),
  -- 'pro' = $49/month + one-time $297-$497 setup fee
  stripe_customer_id text,
  stripe_subscription_id text,
  report_quota_used integer default 0,
  report_quota_limit integer default 5, -- free tier
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id, 
    full_name,
    trial_started_at,
    trial_ends_at
  )
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    now(),
    now() + interval '7 days'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================================================
-- SUBSCRIPTIONS / PAYMENTS LOG (optional but useful)
-- =====================================================
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  stripe_subscription_id text,
  stripe_price_id text,
  status text,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- =====================================================
-- Row Level Security notes
-- =====================================================
-- Make sure to turn on RLS for all tables above.
-- The policies above are the minimum required for a secure SaaS.

-- Recommended: Add a "usage" table later for detailed quota tracking.
