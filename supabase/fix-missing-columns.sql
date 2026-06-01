-- =====================================================
-- Quick Fix: Add Missing ResearchForge Columns
-- Run this in Supabase SQL Editor if you get 
-- "column research_style does not exist" or similar
-- =====================================================

-- Add the new columns to the reports table (safe - won't drop data)
ALTER TABLE public.reports 
  ADD COLUMN IF NOT EXISTS topic text,
  ADD COLUMN IF NOT EXISTS research_style text,
  ADD COLUMN IF NOT EXISTS report_length text,
  ADD COLUMN IF NOT EXISTS full_data jsonb;

-- Add sensible defaults for existing rows (optional but recommended)
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

-- Add check constraints (will fail if invalid data exists, which is good for data integrity)
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

-- Make topic not null if possible (after backfill)
ALTER TABLE public.reports 
  ALTER COLUMN topic SET NOT NULL;

-- Add index for performance (useful for filtering by style/length)
CREATE INDEX IF NOT EXISTS idx_reports_style_length 
  ON public.reports (research_style, report_length);

-- Optional: If you want to deprecate the old "niche" column eventually
-- COMMENT ON COLUMN public.reports.niche IS 'DEPRECATED - use topic instead. Kept for backward compatibility.';

-- After running this, you should be able to insert reports with research_style and report_length.
