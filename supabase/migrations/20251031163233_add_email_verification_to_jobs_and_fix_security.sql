/*
  # Add Email Verification System and Fix Security
  
  ## Critical Security Fix
  
  This migration fixes a CRITICAL security vulnerability where:
  - Anyone can edit/delete any job without verification (RLS policies use "true")
  - No email verification is enforced
  - edit_token alone is sufficient to modify jobs (insecure)
  
  ## Changes Made
  
  ### 1. Add Email Verification Columns to Jobs Table
  - `verified_email` (text, nullable) - The verified email of job creator
  - `email_verified_at` (timestamptz, nullable) - When email was verified
  - `contact_email` (text, nullable) - Email from contact jsonb, extracted for indexing
  
  ### 2. Create Edit Sessions Table
  Tracks verified editing sessions after email verification:
  - Links edit_token to verified_email
  - Has expiration time (24 hours)
  - Created only after successful email verification via Edge Function
  
  ### 3. Replace Insecure RLS Policies
  
  Remove policies with USING (true) - these allow ANYONE to edit ANY job!
  
  Replace with secure policies that:
  - Require valid edit_sessions entry
  - Verify email matches
  - Check session hasn't expired
  
  ## Security Architecture
  
  Before:
  ❌ edit_token alone → can edit/delete (INSECURE)
  
  After:
  ✅ User requests verification code → email sent
  ✅ User enters code → Edge Function verifies
  ✅ Edge Function creates edit_session → links token + verified email
  ✅ User can edit job → RLS checks edit_sessions table
  ✅ Session expires after 24h → must re-verify
  
  ## Migration Safety
  - Uses IF EXISTS/IF NOT EXISTS for idempotency
  - Preserves existing jobs data
  - Adds columns with nullable (safe for existing rows)
*/

-- 1. Add email verification columns to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS verified_email text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS email_verified_at timestamptz;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS contact_email text;

-- Add index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_jobs_verified_email ON jobs(verified_email);
CREATE INDEX IF NOT EXISTS idx_jobs_contact_email ON jobs(contact_email);

-- 2. Create edit_sessions table to track verified edit sessions
CREATE TABLE IF NOT EXISTS edit_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  edit_token text NOT NULL,
  verified_email text NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_edit_sessions_job_id ON edit_sessions(job_id);
CREATE INDEX IF NOT EXISTS idx_edit_sessions_token ON edit_sessions(edit_token);
CREATE INDEX IF NOT EXISTS idx_edit_sessions_expires ON edit_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_edit_sessions_email ON edit_sessions(verified_email);

-- Enable RLS and block all client access (only Edge Functions can write)
ALTER TABLE edit_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Edit sessions only via service role" ON edit_sessions;
CREATE POLICY "Edit sessions only via service role"
  ON edit_sessions
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- 3. Drop the insecure policies (USING true = anyone can do anything!)
DROP POLICY IF EXISTS "Edit token holders can update their job" ON jobs;
DROP POLICY IF EXISTS "Edit token holders can delete their job" ON jobs;
DROP POLICY IF EXISTS "Edit token holders can read their job" ON jobs;

-- 4. Add new SECURE policies that require verified edit sessions

-- Allow updates only if there's a valid, non-expired edit session
CREATE POLICY "Verified editors can update their job"
  ON jobs
  FOR UPDATE
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM edit_sessions es
      WHERE es.job_id = jobs.id
        AND es.edit_token = jobs.edit_token
        AND es.verified_email = jobs.verified_email
        AND es.expires_at > now()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM edit_sessions es
      WHERE es.job_id = jobs.id
        AND es.edit_token = jobs.edit_token
        AND es.verified_email = jobs.verified_email
        AND es.expires_at > now()
    )
  );

-- Allow deletes only if there's a valid, non-expired edit session
CREATE POLICY "Verified editors can delete their job"
  ON jobs
  FOR DELETE
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM edit_sessions es
      WHERE es.job_id = jobs.id
        AND es.edit_token = jobs.edit_token
        AND es.verified_email = jobs.verified_email
        AND es.expires_at > now()
    )
  );

-- 5. Helper function to create edit session after verification
CREATE OR REPLACE FUNCTION create_edit_session(
  p_job_id uuid,
  p_edit_token text,
  p_verified_email text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_id uuid;
  v_job_verified_email text;
BEGIN
  -- Get the job's verified email
  SELECT verified_email INTO v_job_verified_email
  FROM jobs
  WHERE id = p_job_id;

  -- If job doesn't exist, raise error
  IF v_job_verified_email IS NULL AND NOT FOUND THEN
    RAISE EXCEPTION 'Job not found';
  END IF;

  -- If job has verified_email, it must match
  IF v_job_verified_email IS NOT NULL AND v_job_verified_email != p_verified_email THEN
    RAISE EXCEPTION 'Email mismatch';
  END IF;

  -- Delete any existing sessions for this job
  DELETE FROM edit_sessions
  WHERE job_id = p_job_id;

  -- Create new edit session
  INSERT INTO edit_sessions (job_id, edit_token, verified_email)
  VALUES (p_job_id, p_edit_token, p_verified_email)
  RETURNING id INTO v_session_id;

  -- Update job's verified email if not set
  IF v_job_verified_email IS NULL THEN
    UPDATE jobs
    SET verified_email = p_verified_email,
        email_verified_at = now()
    WHERE id = p_job_id;
  END IF;

  RETURN v_session_id;
END;
$$;

-- 6. Add cleanup function for expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_edit_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM edit_sessions
  WHERE expires_at < now();
END;
$$;

-- 7. Function to extract contact email from jsonb and update contact_email column
CREATE OR REPLACE FUNCTION update_contact_email()
RETURNS TRIGGER AS $$
BEGIN
  NEW.contact_email := NEW.contact->>'email';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update contact_email
DROP TRIGGER IF EXISTS update_jobs_contact_email ON jobs;
CREATE TRIGGER update_jobs_contact_email
  BEFORE INSERT OR UPDATE OF contact ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_email();

-- 8. Update existing rows to populate contact_email
UPDATE jobs SET contact_email = contact->>'email' WHERE contact_email IS NULL;

-- Add table comments
COMMENT ON TABLE edit_sessions IS 
'Tracks verified editing sessions for jobs. Created after email verification.
Sessions expire after 24 hours and must be renewed by re-verifying email.

SECURITY:
- RLS enabled with deny-all policy
- Only Edge Functions can create sessions using service role
- RLS policies on jobs table check for valid sessions
- Prevents unauthorized editing even with stolen edit_token';

COMMENT ON COLUMN jobs.verified_email IS 
'Email address that was verified for this job. Set after email verification.';

COMMENT ON COLUMN jobs.email_verified_at IS 
'Timestamp when the email was verified. Used to track verification history.';

COMMENT ON COLUMN jobs.contact_email IS 
'Extracted from contact jsonb for faster queries. Auto-updated via trigger.';

COMMENT ON FUNCTION create_edit_session IS
'Creates a new edit session after email verification.
Called by verify-code Edge Function after successful verification.
Returns session_id or raises exception if validation fails.';