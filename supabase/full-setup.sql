-- =====================================================
-- ResearchForge - COMPLETE SUPABASE SETUP
-- Run this entire file in Supabase SQL Editor
-- =====================================================

-- STEP 1: Main Schema
-- =====================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- REPORTS TABLE
create table if not exists public.reports (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  topic text not null,
  niche text,
  research_style text default 'corporate' check (research_style in ('corporate','legal','medical','academic','personal')),
  report_length text default 'medium' check (report_length in ('short','medium','long')),
  score integer not null check (score >= 0 and score <= 100),
  depth text not null check (depth in ('quick', 'standard', 'deep')),
  summary text not null,
  metrics jsonb not null,
  insights jsonb not null,
  competitors jsonb,
  playbook jsonb not null,
  related jsonb,
  full_data jsonb,
  created_at timestamptz default now() not null
);

alter table public.reports enable row level security;

create policy "Users can view their own reports" on public.reports for select using (auth.uid() = user_id);
create policy "Users can insert their own reports" on public.reports for insert with check (auth.uid() = user_id);
create policy "Users can delete their own reports" on public.reports for delete using (auth.uid() = user_id);

create index if not exists reports_user_id_created_at_idx on public.reports (user_id, created_at desc);

-- TREND ALERTS TABLE
create table if not exists public.trend_alerts (
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

create policy "Users can manage their own alerts" on public.trend_alerts using (auth.uid() = user_id);
create index if not exists trend_alerts_user_id_idx on public.trend_alerts (user_id);

-- PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  company text,
  avatar_url text,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'basic', 'pro', 'unlimited')),
  stripe_customer_id text,
  stripe_subscription_id text,
  report_quota_used integer default 0,
  report_quota_limit integer default 5,
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  logo_url text,
  company_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile + 7-day trial on signup
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
    trial_ends_at,
    subscription_tier,
    report_quota_limit
  )
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    now(),
    now() + interval '7 days',
    'free',
    5
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- SUBSCRIPTIONS TABLE (for Stripe)
create table if not exists public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  stripe_subscription_id text,
  stripe_price_id text,
  status text,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

alter table public.subscriptions enable row level security;
create policy "Users can view own subscriptions" on public.subscriptions for select using (auth.uid() = user_id);

-- =====================================================
-- STEP 2: Upgrade / Latest Columns
-- =====================================================

ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_subscription_tier_check 
CHECK (subscription_tier IN ('free', 'basic', 'pro', 'unlimited'));

COMMENT ON COLUMN public.profiles.subscription_tier IS 
'free (5/mo + trial), basic ($29/mo - 20 reports), pro ($59/mo - 100 + customization), unlimited ($99/mo)';

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS company_name text;

COMMENT ON COLUMN public.reports.full_data IS 
'JSON containing researchStyle, reportLength, customization options (colors, coverTitle, logo, etc.), agent log, sources, etc.';

CREATE INDEX IF NOT EXISTS reports_style_length_idx 
ON public.reports (research_style, report_length);

-- =====================================================
-- STEP 3: Fix Missing Columns (Safe to run)
-- =====================================================

ALTER TABLE public.reports 
  ADD COLUMN IF NOT EXISTS topic text,
  ADD COLUMN IF NOT EXISTS research_style text,
  ADD COLUMN IF NOT EXISTS report_length text,
  ADD COLUMN IF NOT EXISTS full_data jsonb;

UPDATE public.reports 
SET 
  topic = COALESCE(topic, niche, 'Research Topic'),
  research_style = COALESCE(research_style, 'corporate'),
  report_length = COALESCE(report_length, 'medium'),
  full_data = COALESCE(full_data, '{}'::jsonb)
WHERE 
  topic IS NULL 
  OR research_style IS NULL 
  OR report_length IS NULL;

ALTER TABLE public.reports 
  DROP CONSTRAINT IF EXISTS reports_research_style_check;

ALTER TABLE public.reports 
  ADD CONSTRAINT reports_research_style_check 
  CHECK (research_style IN ('corporate','legal','medical','academic','personal'));

ALTER TABLE public.reports 
  DROP CONSTRAINT IF EXISTS reports_report_length_check;

ALTER TABLE public.reports 
  ADD CONSTRAINT reports_report_length_check 
  CHECK (report_length IN ('short','medium','long'));

ALTER TABLE public.reports 
  ALTER COLUMN topic SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reports_style_length 
  ON public.reports (research_style, report_length);

-- =====================================================
-- DONE
-- =====================================================
-- After running this, go to Authentication → URL Configuration
-- and add your Netlify domain.
