-- =====================================================
-- ResearchForge Upgrade SQL (Run this in Supabase SQL Editor)
-- This updates the schema for the finalized general research platform
-- with new pricing tiers and PDF customization support.
-- =====================================================

-- 1. Update profiles table for new subscription tiers
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_subscription_tier_check 
CHECK (subscription_tier IN ('free', 'basic', 'pro', 'unlimited'));

-- Update default comment
COMMENT ON COLUMN public.profiles.subscription_tier IS 
'free (5/mo + trial), basic ($29/mo - 20 reports), pro ($59/mo - 100 + customization), unlimited ($99/mo)';

-- 2. Add optional columns for user branding (for premium logo storage reference)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS company_name text;

-- 3. Ensure reports table has full_data for storing custom PDF options per report
-- (This should already exist, but this makes it explicit)
COMMENT ON COLUMN public.reports.full_data IS 
'JSON containing researchStyle, reportLength, customization options (colors, coverTitle, logo, etc.), agent log, sources, etc.';

-- 4. Optional: Add index for better querying by style/length
CREATE INDEX IF NOT EXISTS reports_style_length_idx 
ON public.reports (research_style, report_length);

-- 5. Update RLS if needed (usually already fine)
-- The existing policies should cover new fields.

-- 6. (Optional but recommended) Create a storage bucket for user logos
-- Go to Storage in Supabase dashboard and create a bucket named "user-logos"
-- with public access or appropriate policies for premium users.

-- After running this, update your .env with the new Stripe price IDs for the 3 tiers.
