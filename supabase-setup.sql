-- ============================================================================
-- Supabase Database Setup Script
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Enable the pg_trgm extension for similarity search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create businesses table
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  registration_number TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('verified', 'provisionally_verified', 'unverified', 'under_review')),
  registration_date DATE NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  website TEXT,
  sector TEXT,
  region TEXT,
  authenticity_score INTEGER DEFAULT 0,
  certificate_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index on registration_number
CREATE UNIQUE INDEX IF NOT EXISTS businesses_registration_number_idx 
  ON public.businesses (registration_number);

-- Create index on name for faster searches
CREATE INDEX IF NOT EXISTS businesses_name_idx 
  ON public.businesses USING gin (name gin_trgm_ops);

-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  reporter_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewer_id UUID
);

-- Create verification_events table
CREATE TABLE IF NOT EXISTS public.verification_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  description TEXT,
  verifier_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on business_id for faster queries
CREATE INDEX IF NOT EXISTS verification_events_business_id_idx 
  ON public.verification_events (business_id);

-- Create audit_log table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  changes JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create function to search businesses by name using similarity
CREATE OR REPLACE FUNCTION public.search_businesses_by_name(
  search_term TEXT,
  similarity_threshold FLOAT DEFAULT 0.2
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  registration_number TEXT,
  status TEXT,
  registration_date DATE,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  sector TEXT,
  region TEXT,
  authenticity_score INTEGER,
  certificate_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  similarity_score FLOAT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    b.id,
    b.name,
    b.registration_number,
    b.status,
    b.registration_date,
    b.address,
    b.phone,
    b.email,
    b.website,
    b.sector,
    b.region,
    b.authenticity_score,
    b.certificate_url,
    b.created_at,
    b.updated_at,
    similarity(b.name, search_term) AS similarity_score
  FROM public.businesses b
  WHERE b.name % search_term
    AND similarity(b.name, search_term) >= similarity_threshold
  ORDER BY similarity_score DESC
  LIMIT 20;
$$;

-- Create function to find similar business names (for fraud detection)
CREATE OR REPLACE FUNCTION public.find_similar_business_names(
  business_name TEXT
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  registration_number TEXT,
  similarity_score FLOAT,
  risk_level TEXT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    b.id,
    b.name,
    b.registration_number,
    similarity(b.name, business_name) AS similarity_score,
    CASE 
      WHEN similarity(b.name, business_name) > 0.8 THEN 'high'
      WHEN similarity(b.name, business_name) > 0.6 THEN 'medium'
      ELSE 'low'
    END AS risk_level
  FROM public.businesses b
  WHERE b.name % business_name
    AND similarity(b.name, business_name) >= 0.3
  ORDER BY similarity_score DESC
  LIMIT 10;
$$;

-- Enable Row Level Security (RLS)
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies for businesses table (allow public read, authenticated write)
CREATE POLICY "Allow public read access to businesses"
  ON public.businesses FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated users to insert businesses"
  ON public.businesses FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update businesses"
  ON public.businesses FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Create policies for reports table
CREATE POLICY "Allow public to create reports"
  ON public.reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read reports"
  ON public.reports FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update reports"
  ON public.reports FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Create policies for verification_events table
CREATE POLICY "Allow public read access to verification events"
  ON public.verification_events FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated users to insert verification events"
  ON public.verification_events FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create policies for audit_log table
CREATE POLICY "Allow authenticated users to read audit logs"
  ON public.audit_log FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert audit logs"
  ON public.audit_log FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Add this to your supabase-setup.sql or run in Supabase SQL Editor

-- Create inspections table
CREATE TABLE IF NOT EXISTS public.inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  inspector_name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on business_id for faster queries
CREATE INDEX IF NOT EXISTS inspections_business_id_idx 
  ON public.inspections (business_id);

-- Create index on scheduled_date
CREATE INDEX IF NOT EXISTS inspections_scheduled_date_idx 
  ON public.inspections (scheduled_date);

-- Enable Row Level Security
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

-- Create policies for inspections table
CREATE POLICY "Allow authenticated users to read inspections"
  ON public.inspections FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert inspections"
  ON public.inspections FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update inspections"
  ON public.inspections FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete inspections"
  ON public.inspections FOR DELETE
  USING (auth.role() = 'authenticated');

  -- ============================================================================
-- Add Missing Columns to Businesses Table
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Add missing columns to match the edit form
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS tax_id TEXT,
ADD COLUMN IF NOT EXISTS year_founded INTEGER,
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS contact_person TEXT,
ADD COLUMN IF NOT EXISTS additional_notes TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '[]'::jsonb;

-- Update the search function to include new columns
CREATE OR REPLACE FUNCTION public.search_businesses_by_name(
  search_term TEXT,
  similarity_threshold FLOAT DEFAULT 0.2
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  registration_number TEXT,
  status TEXT,
  registration_date DATE,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  sector TEXT,
  region TEXT,
  authenticity_score INTEGER,
  certificate_url TEXT,
  tax_id TEXT,
  year_founded INTEGER,
  documents JSONB,
  contact_person TEXT,
  additional_notes TEXT,
  website_url TEXT,
  social_links JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  similarity_score FLOAT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    b.id,
    b.name,
    b.registration_number,
    b.status,
    b.registration_date,
    b.address,
    b.phone,
    b.email,
    b.website,
    b.sector,
    b.region,
    b.authenticity_score,
    b.certificate_url,
    b.tax_id,
    b.year_founded,
    b.documents,
    b.contact_person,
    b.additional_notes,
    b.website_url,
    b.social_links,
    b.created_at,
    b.updated_at,
    similarity(b.name, search_term) AS similarity_score
  FROM public.businesses b
  WHERE b.name % search_term
    AND similarity(b.name, search_term) >= similarity_threshold
  ORDER BY similarity_score DESC
  LIMIT 20;
$$;

-- Create a trigger function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for businesses table
DROP TRIGGER IF EXISTS update_businesses_updated_at ON public.businesses;
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for inspections table
DROP TRIGGER IF EXISTS update_inspections_updated_at ON public.inspections;
CREATE TRIGGER update_inspections_updated_at
  BEFORE UPDATE ON public.inspections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for business documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('business-documents', 'business-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for business-documents bucket
CREATE POLICY "Allow authenticated users to upload documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'business-documents');

CREATE POLICY "Allow public read access to documents"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'business-documents');

CREATE POLICY "Allow authenticated users to update their documents"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'business-documents')
WITH CHECK (bucket_id = 'business-documents');

CREATE POLICY "Allow authenticated users to delete their documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'business-documents');

-- Verify all columns exist
DO $$ 
BEGIN
  RAISE NOTICE '✅ All missing columns have been added to the businesses table';
  RAISE NOTICE '✅ Storage bucket "business-documents" is ready';
  RAISE NOTICE '✅ Updated triggers for automatic timestamp updates';
END $$;