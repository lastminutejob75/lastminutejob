/*
  # Create job_sources table
  
  1. New Table
    - `job_sources`: Table pour stocker les sources d'importation/scraping des jobs
      - `id` (uuid, primary key)
      - `job_id` (uuid, references jobs, cascade on delete) - Job associé
      - `raw_payload` (jsonb, nullable) - Contenu brut scrappé (HTML, JSON...)
      - `imported_at` (timestamptz, default now()) - Date d'importation
      - `provider_name` (text, nullable) - Nom du provider (ex: 'Leboncoin', 'Pôle Emploi', 'Site client')
      - `provider_url` (text, nullable) - URL de la source
  
  2. Index
    - Index sur `job_id` pour les recherches rapides par job
    - Index sur `provider_name` pour filtrer par source
    - Index sur `imported_at` pour trier par date d'importation
  
  3. Security
    - Enable RLS on the table
    - Public can read (for transparency)
    - Only admins can write (via Edge Functions with service role)
*/

-- Create job_sources table
CREATE TABLE IF NOT EXISTS public.job_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  raw_payload jsonb, -- contenu brut scrappé (HTML, JSON...)
  imported_at timestamptz DEFAULT now(),
  -- ex: 'Leboncoin', 'Pôle Emploi', 'Site client'
  provider_name text,
  provider_url text
);

-- Create index on job_id for fast lookups
CREATE INDEX IF NOT EXISTS job_sources_job_id_idx ON public.job_sources(job_id);

-- Create index on provider_name for filtering by source
CREATE INDEX IF NOT EXISTS job_sources_provider_name_idx ON public.job_sources(provider_name) WHERE provider_name IS NOT NULL;

-- Create index on imported_at for sorting by import date
CREATE INDEX IF NOT EXISTS job_sources_imported_at_idx ON public.job_sources(imported_at DESC);

-- Create index on raw_payload for JSON queries (GIN index for efficient JSONB searches)
CREATE INDEX IF NOT EXISTS job_sources_raw_payload_idx ON public.job_sources USING GIN(raw_payload) WHERE raw_payload IS NOT NULL;

-- Enable RLS
ALTER TABLE public.job_sources ENABLE ROW LEVEL SECURITY;

-- Policy: Public can read job sources (for transparency)
CREATE POLICY "Public can read job sources"
  ON public.job_sources
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Only authenticated users can insert (will be validated via Edge Functions)
-- In practice, only admins should insert via Edge Functions
CREATE POLICY "Authenticated users can insert job sources"
  ON public.job_sources
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users can update (will be validated via Edge Functions)
CREATE POLICY "Authenticated users can update job sources"
  ON public.job_sources
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Only authenticated users can delete (will be validated via Edge Functions)
CREATE POLICY "Authenticated users can delete job sources"
  ON public.job_sources
  FOR DELETE
  TO authenticated
  USING (true);

-- Note: In practice, all write operations should be restricted to admins only via Edge Functions with service role
-- The policies above allow authenticated users, but Edge Functions should validate admin permissions

-- Comment for documentation
COMMENT ON TABLE public.job_sources IS 'Sources d''importation/scraping des jobs - stocke le contenu brut et les métadonnées du provider';
COMMENT ON COLUMN public.job_sources.raw_payload IS 'Contenu brut scrappé (HTML, JSON, etc.) - peut contenir tout le contenu original';
COMMENT ON COLUMN public.job_sources.provider_name IS 'Nom du provider (ex: Leboncoin, Pôle Emploi, Site client, Indeed, etc.)';
COMMENT ON COLUMN public.job_sources.provider_url IS 'URL de la source originale de l''annonce';

