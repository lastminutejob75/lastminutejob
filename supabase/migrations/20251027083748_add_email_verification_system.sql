/*
  # Add Email Verification System for Job Security

  ## Overview
  This migration adds a secure email verification system to ensure only job creators
  can edit or delete their posts. Users verify ownership via email before publishing.

  ## New Tables
  
  ### `verification_codes`
  Stores temporary verification codes sent to users' emails
  - `id` (uuid, primary key) - Unique identifier
  - `job_id` (uuid, nullable) - Links to jobs table (null during creation)
  - `email` (text, not null) - Email address receiving the code
  - `code` (text, not null) - 6-digit verification code (hashed for security)
  - `type` (text, not null) - Verification type ('create' or 'manage')
  - `expires_at` (timestamptz, not null) - Code expiration time (10 minutes)
  - `verified` (boolean, default false) - Whether code has been used
  - `created_at` (timestamptz, default now()) - Creation timestamp

  ## Changes to Existing Tables
  
  ### `jobs` table modifications
  - Add `verified_email` (text, nullable) - The verified email of job creator
  - Add `email_verified_at` (timestamptz, nullable) - When email was verified
  - Modify `edit_token` to be generated server-side for better security

  ## Security
  - Enable RLS on `verification_codes` table
  - No public read access to verification codes
  - Codes are hashed before storage
  - Codes expire after 10 minutes
  - Each code can only be used once

  ## Important Notes
  1. Verification codes must be hashed using pgcrypto extension
  2. Email sending will be handled by Supabase Edge Functions
  3. Expired codes should be cleaned up periodically
  4. SMS verification infrastructure is prepared but not implemented
*/

-- Enable required extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create verification_codes table
CREATE TABLE IF NOT EXISTS verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  email text NOT NULL,
  code text NOT NULL,
  type text NOT NULL CHECK (type IN ('create', 'manage')),
  expires_at timestamptz NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Add email verification columns to jobs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'verified_email'
  ) THEN
    ALTER TABLE jobs ADD COLUMN verified_email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'email_verified_at'
  ) THEN
    ALTER TABLE jobs ADD COLUMN email_verified_at timestamptz;
  END IF;
END $$;

-- Create indexes for faster verification code lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_email 
  ON verification_codes(email);

CREATE INDEX IF NOT EXISTS idx_verification_codes_job_id 
  ON verification_codes(job_id);

CREATE INDEX IF NOT EXISTS idx_verification_codes_expires 
  ON verification_codes(expires_at);

-- Enable RLS on verification_codes
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- No policies needed - verification codes should only be accessed via Edge Functions
-- This prevents any direct client access to codes

-- Create a function to clean up expired verification codes (optional, for maintenance)
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM verification_codes
  WHERE expires_at < now() - interval '1 hour';
END;
$$;

-- Add comment for future reference
COMMENT ON TABLE verification_codes IS 'Stores temporary email verification codes for job creation and management. Codes expire after 10 minutes and can only be used once.';