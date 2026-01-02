/*
  # Remove verification code system

  1. Changes
    - Drop verification_codes table as it's no longer needed with Google OAuth
    - Add user_id column to jobs table to link jobs with authenticated users
    - Update RLS policies to use auth.uid() instead of verification codes
  
  2. Security
    - Maintain RLS on jobs table
    - Allow authenticated users to manage their own jobs
*/

-- Add user_id to jobs table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE jobs ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Create index on user_id for performance
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);

-- Drop old verification codes table if exists
DROP TABLE IF EXISTS verification_codes CASCADE;

-- Update RLS policies for jobs table
DROP POLICY IF EXISTS "Anyone can view published jobs" ON jobs;
DROP POLICY IF EXISTS "Anyone can insert jobs" ON jobs;
DROP POLICY IF EXISTS "Users can update own jobs with edit token" ON jobs;
DROP POLICY IF EXISTS "Users can delete own jobs with edit token" ON jobs;

-- Create new RLS policies based on Google auth
CREATE POLICY "Anyone can view published jobs"
  ON jobs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
