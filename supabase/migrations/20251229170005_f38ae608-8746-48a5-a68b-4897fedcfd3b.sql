-- Add new columns to ads table for enhanced ad management
ALTER TABLE public.ads
ADD COLUMN IF NOT EXISTS ad_type text NOT NULL DEFAULT 'video',
ADD COLUMN IF NOT EXISTS placement text[] NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS link_url text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS priority integer NOT NULL DEFAULT 0;

-- Add check constraint for ad_type
ALTER TABLE public.ads
ADD CONSTRAINT ads_type_check CHECK (ad_type IN ('video', 'image', 'banner', 'link'));

-- Create index for faster placement queries
CREATE INDEX IF NOT EXISTS idx_ads_placement ON public.ads USING GIN(placement);
CREATE INDEX IF NOT EXISTS idx_ads_active_type ON public.ads(is_active, ad_type);
CREATE INDEX IF NOT EXISTS idx_ads_priority ON public.ads(priority DESC);

-- Update RLS policy to allow admins to manage all ad fields
-- (existing policies already cover this)