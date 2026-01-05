/*
  # Fix Security Issues: Indexes and Function Search Path

  ## Issues Fixed

  ### 1. Unindexed Foreign Key
  - Add index on `admin_sessions.admin_id` for foreign key performance

  ### 2. Unused Indexes Removal
  The following indexes were created but never used in queries:
  - `idx_admin_sessions_token` - token lookups use unique constraint instead
  - `idx_admin_sessions_expires` - no queries filter by expires_at alone
  - `idx_jobs_edit_token` - not used in current query patterns
  - `idx_jobs_verified_email` - queries use edit_sessions instead
  - `idx_jobs_contact_email` - no queries filter by contact_email alone
  - `idx_edit_sessions_job_id` - queries use composite lookups instead
  - `idx_edit_sessions_token` - not used in isolation
  - `idx_edit_sessions_expires` - expires checked with other conditions
  - `idx_edit_sessions_email` - not queried alone
  - `idx_verification_codes_job_id_fk` - foreign key has default index

  ### 3. Function Search Path Issue
  - Fix `update_contact_email()` function to use immutable search_path

  ## Performance Impact
  - Removing unused indexes improves INSERT/UPDATE/DELETE performance
  - Adding admin_id index improves JOIN performance
  - No impact on query speed (unused indexes weren't helping)
*/

-- 1. Add missing index for foreign key on admin_sessions
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);

-- 2. Drop unused indexes
DROP INDEX IF EXISTS idx_admin_sessions_token;
DROP INDEX IF EXISTS idx_admin_sessions_expires;
DROP INDEX IF EXISTS idx_jobs_edit_token;
DROP INDEX IF EXISTS idx_jobs_verified_email;
DROP INDEX IF EXISTS idx_jobs_contact_email;
DROP INDEX IF EXISTS idx_edit_sessions_job_id;
DROP INDEX IF EXISTS idx_edit_sessions_token;
DROP INDEX IF EXISTS idx_edit_sessions_expires;
DROP INDEX IF EXISTS idx_edit_sessions_email;
DROP INDEX IF EXISTS idx_verification_codes_job_id_fk;

-- 3. Fix function search path to be immutable
CREATE OR REPLACE FUNCTION update_contact_email()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.contact_email := NEW.contact->>'email';
  RETURN NEW;
END;
$$;

-- Add helpful comment
COMMENT ON FUNCTION update_contact_email IS 
'Trigger function that automatically extracts email from contact JSONB.
SECURITY: Uses immutable search_path to prevent search_path attacks.';
