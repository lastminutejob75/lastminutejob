/*
  # Create admin_notes table
  
  1. New Table
    - `admin_notes`: Table pour stocker les notes internes des admins
      - `id` (uuid, primary key)
      - `admin_id` (uuid, references auth.users, not null, cascade on delete) - Admin qui a créé la note
      - `job_id` (uuid, references jobs, nullable, cascade on delete) - Note sur un job
      - `client_id` (uuid, references clients, nullable, cascade on delete) - Note sur un client
      - `candidate_id` (uuid, references candidates, nullable, cascade on delete) - Note sur un candidat
      - `content` (text, not null) - Contenu de la note
      - `created_at` (timestamptz, default now()) - Date de création
  
  2. Constraints
    - Au moins un des champs job_id, client_id, candidate_id doit être renseigné
    - Un seul de ces champs peut être renseigné à la fois (ou tous null pour notes générales)
  
  3. Index
    - Index sur `job_id` pour les recherches par job
    - Index sur `client_id` pour les recherches par client
    - Index sur `candidate_id` pour les recherches par candidat
    - Index sur `admin_id` pour les recherches par admin
    - Index sur `created_at` pour trier par date
  
  4. Security
    - Enable RLS on the table
    - Only admins can read/write (via Edge Functions with service role)
    - Public access should be denied
*/

-- Create admin_notes table
CREATE TABLE IF NOT EXISTS public.admin_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  candidate_id uuid REFERENCES public.candidates(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  -- Constraint: Au moins un des champs job_id, client_id, candidate_id doit être renseigné
  CONSTRAINT admin_notes_target_check CHECK (
    (job_id IS NOT NULL)::int + 
    (client_id IS NOT NULL)::int + 
    (candidate_id IS NOT NULL)::int >= 1
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS admin_notes_job_id_idx ON public.admin_notes(job_id) WHERE job_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS admin_notes_client_id_idx ON public.admin_notes(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS admin_notes_candidate_id_idx ON public.admin_notes(candidate_id) WHERE candidate_id IS NOT NULL;

-- Create index on admin_id for admin lookups
CREATE INDEX IF NOT EXISTS admin_notes_admin_id_idx ON public.admin_notes(admin_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS admin_notes_created_at_idx ON public.admin_notes(created_at DESC);

-- Enable RLS
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Deny all public access by default
-- Only admins can access via Edge Functions with service role
CREATE POLICY "Deny all public access to admin notes"
  ON public.admin_notes
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- Note: All operations (SELECT, INSERT, UPDATE, DELETE) should be handled via Edge Functions
-- with service role and admin authentication validation
-- The policy above denies all access, ensuring only Edge Functions can access this table

-- Comment for documentation
COMMENT ON TABLE public.admin_notes IS 'Notes internes des admins sur les jobs, clients et candidats - accès restreint aux admins uniquement';
COMMENT ON COLUMN public.admin_notes.admin_id IS 'Admin qui a créé la note - cascade delete si l''admin est supprimé';
COMMENT ON COLUMN public.admin_notes.job_id IS 'Note associée à un job spécifique (nullable)';
COMMENT ON COLUMN public.admin_notes.client_id IS 'Note associée à un client spécifique (nullable)';
COMMENT ON COLUMN public.admin_notes.candidate_id IS 'Note associée à un candidat spécifique (nullable)';
COMMENT ON COLUMN public.admin_notes.content IS 'Contenu de la note - texte libre pour les commentaires internes';
COMMENT ON CONSTRAINT admin_notes_target_check ON public.admin_notes IS 'Au moins un des champs job_id, client_id, candidate_id doit être renseigné';

