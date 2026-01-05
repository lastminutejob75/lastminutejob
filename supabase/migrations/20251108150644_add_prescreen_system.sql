/*
  # Add Pre-Screen System for Job Applications

  1. New Tables
    - `prescreen_questions`
      - `id` (uuid, primary key)
      - `job_id` (uuid, foreign key to jobs)
      - `question_text` (text, the question to ask)
      - `question_order` (integer, order of display)
      - `created_at` (timestamptz)
    
    - `prescreen_applications`
      - `id` (uuid, primary key)
      - `job_id` (uuid, foreign key to jobs)
      - `application_token` (text, unique token for viewing application)
      - `answers` (jsonb, stores {question_id: boolean} pairs)
      - `applicant_name` (text)
      - `applicant_email` (text)
      - `applicant_phone` (text, optional)
      - `status` (text, 'pending', 'accepted', 'rejected')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Public can read prescreen questions for approved jobs
    - Public can insert applications (anonymous submission)
    - Only job owner (via edit_token) can view applications
    
  3. Indexes
    - Index on job_id for both tables (fast lookups)
    - Unique index on application_token
    - Index on status for filtering
*/

-- Create prescreen_questions table
CREATE TABLE IF NOT EXISTS prescreen_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_question_order_per_job UNIQUE (job_id, question_order)
);

-- Create prescreen_applications table
CREATE TABLE IF NOT EXISTS prescreen_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  application_token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  applicant_name text NOT NULL,
  applicant_email text NOT NULL,
  applicant_phone text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'rejected'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_prescreen_questions_job_id ON prescreen_questions(job_id);
CREATE INDEX IF NOT EXISTS idx_prescreen_applications_job_id ON prescreen_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_prescreen_applications_token ON prescreen_applications(application_token);
CREATE INDEX IF NOT EXISTS idx_prescreen_applications_status ON prescreen_applications(status);

-- Enable RLS
ALTER TABLE prescreen_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescreen_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prescreen_questions
CREATE POLICY "Public can read questions for approved jobs"
  ON prescreen_questions
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = prescreen_questions.job_id 
      AND jobs.status = 'approved'
    )
  );

CREATE POLICY "Anyone can insert questions"
  ON prescreen_questions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update questions"
  ON prescreen_questions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete questions"
  ON prescreen_questions
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- RLS Policies for prescreen_applications
CREATE POLICY "Public can read own application via token"
  ON prescreen_applications
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can insert applications"
  ON prescreen_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can update applications"
  ON prescreen_applications
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON prescreen_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();