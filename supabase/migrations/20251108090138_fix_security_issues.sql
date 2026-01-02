/*
  # Fix Security Issues
  
  1. Remove Unused Indexes
    - Drop `idx_jobs_created_at` (unused, already have `jobs_pkey` for queries)
    - Drop `idx_jobs_edit_token` (unused, already have unique constraint `jobs_edit_token_key`)
  
  2. Fix Multiple Permissive Policies
    - Drop conflicting SELECT policies
    - Create single restrictive SELECT policy (approved jobs only for public)
  
  3. Fix Function Search Path
    - Recreate `update_updated_at_column` function with secure search_path
    - Handle dependent triggers properly
  
  4. Security Notes
    - RLS remains enabled on all tables
    - Only approved jobs are publicly visible
    - Function now has immutable search_path for security
*/

-- Drop unused indexes
DROP INDEX IF EXISTS idx_jobs_created_at;
DROP INDEX IF EXISTS idx_jobs_edit_token;

-- Drop conflicting SELECT policies
DROP POLICY IF EXISTS "Anyone can read jobs" ON jobs;
DROP POLICY IF EXISTS "Public can read approved jobs" ON jobs;

-- Create single SELECT policy for approved jobs only
CREATE POLICY "Public can read approved jobs"
  ON jobs
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- Recreate function with secure search_path (CASCADE to handle triggers)
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers that were dropped
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drafts_updated_at
  BEFORE UPDATE ON job_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
