/*
  # Add unique constraint to job_drafts.session_id
  
  1. Changes
    - Add UNIQUE constraint on session_id column in job_drafts table
    - This allows upsert operations using ON CONFLICT(session_id)
  
  2. Notes
    - This ensures only one draft per session
    - Enables proper draft saving and loading functionality
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'job_drafts_session_id_key'
    AND conrelid = 'job_drafts'::regclass
  ) THEN
    ALTER TABLE job_drafts
    ADD CONSTRAINT job_drafts_session_id_key UNIQUE (session_id);
  END IF;
END $$;
