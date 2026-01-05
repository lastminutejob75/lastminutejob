/*
  # Create needs table for storing ParsedNeed
  
  1. New Table
    - needs: Stores parsed user needs (ParsedNeed structure)
  
  2. Security
    - Enable RLS
    - Anyone can create needs
    - Public read for orchestration (future)
*/

CREATE TABLE IF NOT EXISTS public.needs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- ParsedNeed structure
  raw_prompt text NOT NULL,
  job_candidates jsonb NOT NULL DEFAULT '[]'::jsonb,  -- DetectedJob[]
  primary_job jsonb,                                    -- DetectedJob | null
  context jsonb NOT NULL DEFAULT '{}'::jsonb,         -- JobContext
  direction text NOT NULL CHECK (direction IN ('demande_de_ressource', 'offre_de_competence', 'unknown')),
  readiness jsonb NOT NULL DEFAULT '{"score":0,"status":"incomplete","missing":[]}'::jsonb, -- MissionReadiness
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.needs ENABLE ROW LEVEL SECURITY;

-- Anyone can create needs
CREATE POLICY "Anyone can create needs"
  ON public.needs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Public can read needs (for orchestration)
CREATE POLICY "Public can read needs"
  ON public.needs
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_needs_direction ON public.needs(direction);
CREATE INDEX IF NOT EXISTS idx_needs_created_at ON public.needs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_needs_primary_job ON public.needs USING GIN (primary_job);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_needs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_needs_updated_at
  BEFORE UPDATE ON public.needs
  FOR EACH ROW
  EXECUTE FUNCTION update_needs_updated_at();

COMMENT ON TABLE public.needs IS 'Stores parsed user needs (ParsedNeed) for orchestration';

