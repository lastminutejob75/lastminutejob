/*
  # Fix function search_path security warning

  1. Changes
    - Add SECURITY DEFINER and search_path to update_updated_at_column function
    - This prevents search_path manipulation attacks
  
  2. Security
    - Function now has immutable search_path
    - Follows PostgreSQL security best practices
*/

-- Drop and recreate function with proper security settings
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
