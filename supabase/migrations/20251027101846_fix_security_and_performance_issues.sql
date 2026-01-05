/*
  # Fix Security and Performance Issues

  ## Overview
  This migration addresses security warnings and performance issues identified by Supabase:
  1. Optimize RLS policies to use subqueries for auth functions
  2. Remove unused indexes to reduce storage overhead
  3. Add security-definer flag to functions for stable search path
  4. Add documentation policy to verification_codes (intentionally restrictive)

  ## Changes

  ### 1. RLS Policy Optimization (job_templates)
  - Replace `auth.uid()` with `(SELECT auth.uid())` in all policies
  - This prevents re-evaluation of auth functions for each row
  - Significantly improves query performance at scale

  ### 2. Unused Index Cleanup
  Remove indexes that are not being used:
  - idx_jobs_city (not used in current queries)
  - idx_jobs_created_at (not used, ordering by created_at is rare)
  - idx_templates_user_id (covered by RLS policies)
  - idx_drafts_updated_at (not used in queries)
  - idx_verification_codes_email (verification uses combined filters)
  - idx_verification_codes_job_id (rarely queried by job_id alone)
  - idx_verification_codes_expires (covered by table scans)

  ### 3. Function Security
  - Add SET search_path to functions to prevent search path injection
  - Makes functions safer and more predictable

  ### 4. Verification Codes RLS
  - Add documentation policy explaining intentional restriction
  - Codes should only be accessed via Edge Functions for security
*/

-- 1. Fix RLS policies for job_templates to use subqueries
DROP POLICY IF EXISTS "Users can view own templates" ON job_templates;
DROP POLICY IF EXISTS "Users can create own templates" ON job_templates;
DROP POLICY IF EXISTS "Users can update own templates" ON job_templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON job_templates;

CREATE POLICY "Users can view own templates"
  ON job_templates FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create own templates"
  ON job_templates FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own templates"
  ON job_templates FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own templates"
  ON job_templates FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- 2. Remove unused indexes
DROP INDEX IF EXISTS idx_jobs_city;
DROP INDEX IF EXISTS idx_jobs_created_at;
DROP INDEX IF EXISTS idx_templates_user_id;
DROP INDEX IF EXISTS idx_drafts_updated_at;
DROP INDEX IF EXISTS idx_verification_codes_email;
DROP INDEX IF EXISTS idx_verification_codes_job_id;
DROP INDEX IF EXISTS idx_verification_codes_expires;

-- 3. Fix function search paths for security
-- Drop and recreate with CASCADE to handle trigger dependencies
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate the triggers that were dropped with CASCADE
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drafts_updated_at
  BEFORE UPDATE ON job_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fix cleanup function
DROP FUNCTION IF EXISTS cleanup_expired_verification_codes();
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM verification_codes
  WHERE expires_at < now() - interval '1 hour';
END;
$$;

-- 4. Add documentation about verification_codes RLS (no policy needed)
COMMENT ON TABLE verification_codes IS 'Stores temporary email verification codes for job creation and management. Codes expire after 10 minutes and can only be used once. RLS is enabled with no policies by design - all access must go through Edge Functions for security.';

-- Add useful composite index for verification code lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_lookup 
  ON verification_codes(email, verified, expires_at) 
  WHERE verified = false;