/*
  # Create Job Publications Table
  
  Table pour gérer les publications de missions sur différents canaux (LinkedIn, Facebook, etc.)
*/

-- Créer la table
CREATE TABLE IF NOT EXISTS public.job_publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),

  job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE,
  channel text NOT NULL,           -- 'uwi' | 'linkedin' | 'facebook' | 'email' | 'leboncoin'
  status text NOT NULL,            -- 'pending' | 'prepared' | 'posted' | 'error'
  payload jsonb,                   -- texte pré-généré, liens, etc.
  error_message text
);

-- Index pour les requêtes par job
CREATE INDEX IF NOT EXISTS job_publications_job_id_idx
  ON public.job_publications (job_id);

-- Index pour les requêtes par canal et statut
CREATE INDEX IF NOT EXISTS job_publications_channel_status_idx
  ON public.job_publications (channel, status)
  WHERE status IN ('pending', 'prepared');

-- RLS (Row Level Security)
ALTER TABLE public.job_publications ENABLE ROW LEVEL SECURITY;

-- Politique : Seul le service role peut insérer/lire (via Edge Function)
CREATE POLICY "Service role can manage job publications"
  ON public.job_publications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Commentaires pour documentation
COMMENT ON TABLE public.job_publications IS 'Publications de missions sur différents canaux de diffusion';
COMMENT ON COLUMN public.job_publications.channel IS 'Canal de diffusion: uwi, linkedin, facebook, email, leboncoin';
COMMENT ON COLUMN public.job_publications.status IS 'Statut: pending, prepared, posted, error';
COMMENT ON COLUMN public.job_publications.payload IS 'Contenu pré-généré pour la publication (titre, corps, hashtags, URL)';

