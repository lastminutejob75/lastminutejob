/*
  # Fix Remaining Security Issues

  ## Overview
  This migration addresses the final security warnings:
  1. Add covering index for foreign key on verification_codes.job_id
  2. Add explicit restrictive policy documentation for verification_codes

  ## Changes

  ### 1. Foreign Key Index
  - Add index on verification_codes(job_id) to optimize foreign key lookups
  - This prevents suboptimal query performance when cascading deletes occur
  - The index will be used when jobs are deleted and related verification codes are removed

  ### 2. Verification Codes RLS Policy
  - verification_codes table intentionally has NO policies
  - This is a security feature, not a bug
  - All access must go through Edge Functions using service role key
  - Direct client access is blocked to prevent code enumeration attacks
  - Add explicit "deny all" policy as documentation of this design choice

  ## Security Rationale
  
  Verification codes should NEVER be accessible from the client:
  - Prevents brute force attacks on verification codes
  - Prevents code enumeration
  - Ensures codes can only be checked server-side with rate limiting
  - Edge Functions use service role key to bypass RLS intentionally
*/

-- 1. Add index for foreign key to optimize cascade deletes and joins
CREATE INDEX IF NOT EXISTS idx_verification_codes_job_id_fk 
  ON verification_codes(job_id);

-- 2. Add explicit restrictive policies to document security design
-- These policies deny all direct client access by design

CREATE POLICY "Block all direct SELECT access"
  ON verification_codes FOR SELECT
  USING (false);

CREATE POLICY "Block all direct INSERT access"
  ON verification_codes FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Block all direct UPDATE access"
  ON verification_codes FOR UPDATE
  USING (false);

CREATE POLICY "Block all direct DELETE access"
  ON verification_codes FOR DELETE
  USING (false);

-- Update table comment to reflect the security design
COMMENT ON TABLE verification_codes IS 
'Stores temporary email verification codes for job creation and management. 
Codes expire after 10 minutes and can only be used once. 

SECURITY DESIGN:
- RLS is enabled with DENY ALL policies
- No client access is permitted (all policies return false)
- All access must go through Edge Functions using service role key
- This prevents code enumeration and brute force attacks
- Edge Functions implement rate limiting and validation logic';
