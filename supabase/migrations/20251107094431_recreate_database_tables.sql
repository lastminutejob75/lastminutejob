/*
  # Recreate database tables
  
  1. New Tables
    - jobs: Job listings with approval workflow
    - job_drafts: Auto-saved job drafts
  
  2. Security
    - Enable RLS on all tables
    - Public can read approved jobs
    - Anyone can create jobs and drafts
*/

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  edit_token text UNIQUE NOT NULL,
  title text NOT NULL DEFAULT 'Annonce',
  body text DEFAULT '',
  parsed jsonb DEFAULT '{"role":"","city":"","date":"","duration":"","hourly":""}'::jsonb,
  contact jsonb DEFAULT '{"company":"","name":"","email":"","phone":""}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  source text DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Public can read approved jobs
CREATE POLICY "Public can read approved jobs"
  ON jobs FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- Anyone can read any job
CREATE POLICY "Anyone can read jobs"
  ON jobs FOR SELECT
  TO anon, authenticated
  USING (true);

-- Anyone can create jobs
CREATE POLICY "Anyone can create jobs"
  ON jobs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anyone can update jobs
CREATE POLICY "Anyone can update jobs"
  ON jobs FOR UPDATE
  TO anon, authenticated
  USING (true);

-- Anyone can delete jobs
CREATE POLICY "Anyone can delete jobs"
  ON jobs FOR DELETE
  TO anon, authenticated
  USING (true);

-- Job drafts table
CREATE TABLE IF NOT EXISTS job_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  draft_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE job_drafts ENABLE ROW LEVEL SECURITY;

-- Anyone can manage drafts
CREATE POLICY "Anyone can read drafts"
  ON job_drafts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert drafts"
  ON job_drafts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update drafts"
  ON job_drafts FOR UPDATE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can delete drafts"
  ON job_drafts FOR DELETE
  TO anon, authenticated
  USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_edit_token ON jobs(edit_token);
CREATE INDEX IF NOT EXISTS idx_drafts_session_id ON job_drafts(session_id);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drafts_updated_at
  BEFORE UPDATE ON job_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
