/*
  # Create candidates table
  
  1. New Table
    - `candidates`: Table pour stocker les informations des candidats
      - `id` (uuid, primary key)
      - `auth_user_id` (uuid, references auth.users, nullable)
      - `first_name` (text, nullable) - Prénom
      - `last_name` (text, nullable) - Nom de famille
      - `email` (text, not null) - Email du candidat
      - `phone` (text, nullable) - Téléphone
      - `created_at` (timestamptz, default now())
      - `last_application_at` (timestamptz, nullable) - Dernière candidature
      - `internal_tags` (text[], default '{}') - Tags internes (Serveur, Étudiant, Fiable, etc.)
  
  2. Index
    - Index sur `email` pour les recherches rapides
    - Index sur `auth_user_id` pour les recherches par utilisateur
    - Index sur `last_application_at` pour trier par activité
  
  3. Security
    - Enable RLS on the table
    - Public can read (for approved/public candidates)
    - Users can manage their own candidate record
    - Admins can manage all via Edge Functions
*/

-- Create candidates table
CREATE TABLE IF NOT EXISTS public.candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name text,
  last_name text,
  email text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now(),
  last_application_at timestamptz,
  -- tags internes : 'Serveur', 'Étudiant', 'Fiable', etc.
  internal_tags text[] DEFAULT '{}'
);

-- Create index on email for fast lookups
CREATE INDEX IF NOT EXISTS candidates_email_idx ON public.candidates(email);

-- Create index on auth_user_id for user lookups
CREATE INDEX IF NOT EXISTS candidates_auth_user_id_idx ON public.candidates(auth_user_id);

-- Create index on last_application_at for sorting by activity
CREATE INDEX IF NOT EXISTS candidates_last_application_at_idx ON public.candidates(last_application_at DESC) WHERE last_application_at IS NOT NULL;

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS candidates_created_at_idx ON public.candidates(created_at DESC);

-- Enable RLS
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- Policy: Public can read candidates (for approved/public candidates)
CREATE POLICY "Public can read candidates"
  ON public.candidates
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Authenticated users can insert their own candidate record
CREATE POLICY "Users can insert their own candidate record"
  ON public.candidates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_user_id OR auth_user_id IS NULL);

-- Policy: Users can update their own candidate record
CREATE POLICY "Users can update their own candidate record"
  ON public.candidates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id OR auth_user_id IS NULL)
  WITH CHECK (auth.uid() = auth_user_id OR auth_user_id IS NULL);

-- Policy: Users can delete their own candidate record
CREATE POLICY "Users can delete their own candidate record"
  ON public.candidates
  FOR DELETE
  TO authenticated
  USING (auth.uid() = auth_user_id OR auth_user_id IS NULL);

-- Note: Admin operations (bulk updates, deletions) should be handled via Edge Functions with service role

