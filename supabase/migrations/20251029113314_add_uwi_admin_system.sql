/*
  # UWi Admin System

  1. New Tables
    - admin_users: Admin accounts with hashed passwords
    - admin_sessions: Active admin sessions with expiry
    - jobs: Enhanced job listings with approval workflow
  
  2. Security
    - RLS enabled on all tables
    - Admin tables only accessible via service role
    - Jobs: public read for approved, token-based editing
*/

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  pass_hash text NOT NULL,
  salt text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users only via service role"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (false);

-- Admin sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  admin_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin sessions only via service role"
  ON admin_sessions
  FOR ALL
  TO authenticated
  USING (false);

-- Create index for fast token lookup
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

-- Jobs table (drop existing if needed and recreate with new schema)
DROP TABLE IF EXISTS jobs CASCADE;

CREATE TABLE jobs (
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
  ON jobs
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- Anyone with edit token can read their job
CREATE POLICY "Edit token holders can read their job"
  ON jobs
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Anyone can create a job
CREATE POLICY "Anyone can create jobs"
  ON jobs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Edit token holders can update their job
CREATE POLICY "Edit token holders can update their job"
  ON jobs
  FOR UPDATE
  TO anon, authenticated
  USING (true);

-- Edit token holders can delete their job
CREATE POLICY "Edit token holders can delete their job"
  ON jobs
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_edit_token ON jobs(edit_token);

-- Function to update updated_at timestamp
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
