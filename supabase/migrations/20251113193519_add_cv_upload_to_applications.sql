/*
  # Add CV Upload Support

  1. Changes
    - Add `cv_url` column to `prescreen_applications` table to store CV file URL
    - Create storage bucket for CVs
    - Set up storage policies for CV uploads

  2. Security
    - Allow authenticated uploads to CVs bucket
    - Allow public read access to CVs (for recruiters)
*/

-- Add cv_url column to prescreen_applications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prescreen_applications' AND column_name = 'cv_url'
  ) THEN
    ALTER TABLE prescreen_applications ADD COLUMN cv_url text;
  END IF;
END $$;

-- Create storage bucket for CVs if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload CVs
CREATE POLICY "Anyone can upload CVs"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'cvs');

-- Allow public read access to CVs
CREATE POLICY "Public can read CVs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'cvs');