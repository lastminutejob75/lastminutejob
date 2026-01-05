/*
  # Restructure jobs table with new schema
  
  1. New Types
    - `job_status` enum: 'draft', 'pending', 'published', 'archived'
    - `job_source` enum: 'client', 'admin', 'scraped'
  
  2. Restructured Table
    - Drop existing jobs table (if exists) and recreate with new schema
    - Link to clients table via `client_id`
    - Track admin who created/modified via `created_by_admin_id`
    - Enhanced fields: description, city, country, address, coordinates
    - External source tracking for scraped jobs
    - Salary range and contract type
    - Publication and expiration dates
    - Urgency flag
  
  3. Indexes
    - Index on status for filtering
    - Index on city for location searches
    - Index on client_id for client lookups
  
  4. Security
    - Enable RLS
    - Public can read published jobs
    - Admins can manage all jobs via Edge Functions
*/

-- Create enum types
CREATE TYPE IF NOT EXISTS job_status AS ENUM ('draft', 'pending', 'published', 'archived');
CREATE TYPE IF NOT EXISTS job_source AS ENUM ('client', 'admin', 'scraped');

-- Drop existing jobs table if it exists (this will cascade to dependent objects)
-- Note: This is destructive - make sure to backup data if needed
DROP TABLE IF EXISTS public.jobs CASCADE;

-- Create new jobs table with enhanced schema
CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  -- si tu veux savoir quel admin a créé/modifié
  created_by_admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  city text,
  country text,
  address text,
  latitude double precision,
  longitude double precision,
  status job_status DEFAULT 'pending',
  source job_source DEFAULT 'client',
  -- si c'est une annonce importée/scrapée
  external_source_name text, -- ex: 'Leboncoin', 'Indeed'
  external_source_url text,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- infos pratiques
  salary_min numeric,
  salary_max numeric,
  salary_currency text DEFAULT 'EUR',
  contract_type text, -- CDD, CDI, extra, freelance...
  is_urgent boolean DEFAULT false
);

-- Create indexes
CREATE INDEX IF NOT EXISTS jobs_status_idx ON public.jobs(status);
CREATE INDEX IF NOT EXISTS jobs_city_idx ON public.jobs(city);
CREATE INDEX IF NOT EXISTS jobs_client_id_idx ON public.jobs(client_id);

-- Create index on country for international searches
CREATE INDEX IF NOT EXISTS jobs_country_idx ON public.jobs(country);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS jobs_created_at_idx ON public.jobs(created_at DESC);

-- Create index on published_at for active jobs
CREATE INDEX IF NOT EXISTS jobs_published_at_idx ON public.jobs(published_at DESC) WHERE status = 'published';

-- Create index on expires_at for expired jobs cleanup
CREATE INDEX IF NOT EXISTS jobs_expires_at_idx ON public.jobs(expires_at) WHERE expires_at IS NOT NULL;

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Policy: Public can read published jobs
CREATE POLICY "Public can read published jobs"
  ON public.jobs
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- Policy: Authenticated users can read their own jobs (via client_id)
CREATE POLICY "Users can read their own jobs"
  ON public.jobs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = jobs.client_id
      AND clients.auth_user_id = auth.uid()
    )
  );

-- Policy: Anyone can create jobs (will be validated via Edge Functions)
CREATE POLICY "Anyone can create jobs"
  ON public.jobs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Users can update their own jobs (via client_id)
CREATE POLICY "Users can update their own jobs"
  ON public.jobs
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = jobs.client_id
      AND clients.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = jobs.client_id
      AND clients.auth_user_id = auth.uid()
    )
  );

-- Note: DELETE operations should be restricted to admins only (via Edge Functions)
-- Note: Status changes (especially to 'published') should be validated via Edge Functions

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

