/*
  # Fix Security Issues and Remove Unused Indexes

  1. Security Fixes
    - Add restrictive RLS policies for `admin_users` table
      - Service role only access (no public access)
    - Add restrictive RLS policies for `admin_sessions` table
      - Service role only access (no public access)

  2. Index Cleanup
    - Remove unused indexes that are not being used:
      - `idx_prescreen_applications_token` (UNIQUE constraint already provides index)
      - `idx_prescreen_applications_status` (not used in queries)
      - `idx_admin_sessions_admin_id` (low cardinality, not needed)
      - `idx_admin_sessions_expires_at` (not used in queries)
      - `idx_admin_users_email` (UNIQUE constraint already provides index)

  3. Notes
    - Admin tables are only accessible via Edge Functions using service role
    - RLS policies deny all public access to admin tables
    - Keeping only essential indexes that are actually used
*/

-- Drop unused indexes
DROP INDEX IF EXISTS idx_prescreen_applications_token;
DROP INDEX IF EXISTS idx_prescreen_applications_status;
DROP INDEX IF EXISTS idx_admin_sessions_admin_id;
DROP INDEX IF EXISTS idx_admin_sessions_expires_at;
DROP INDEX IF EXISTS idx_admin_users_email;

-- Add restrictive RLS policies for admin_users
-- Deny all access to anon and authenticated users
CREATE POLICY "Service role only access to admin users"
  ON admin_users
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- Add restrictive RLS policies for admin_sessions
-- Deny all access to anon and authenticated users
CREATE POLICY "Service role only access to admin sessions"
  ON admin_sessions
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);
