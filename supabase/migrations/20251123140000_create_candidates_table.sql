/*
  # Create Candidates Table
  
  Table pour stocker les profils de candidats / freelances créés via le wizard
*/

-- Créer la table
CREATE TABLE IF NOT EXISTS public.candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),

  -- texte original du candidat
  prompt_text text,

  -- métier principal
  job_key text,           -- ex: 'cook', 'server', 'web_developer'

  -- résumé / titre & bio
  headline text,
  bio text,

  -- infos profil
  location text,
  availability text,      -- ex: "Soirs et week-end"
  experience_level text,  -- 'Junior' | 'Intermédiaire' | 'Senior'
  contract_type text,     -- 'Extra' | 'CDD' | 'CDI' | 'Freelance'
  remote_preference text, -- 'Sur place' | 'Remote' | 'Hybride'

  -- futur : lien utilisateur / auth
  user_id uuid
);

-- Index pour les requêtes par métier
CREATE INDEX IF NOT EXISTS candidates_job_key_idx
  ON public.candidates (job_key);

-- Index pour les requêtes par localisation
CREATE INDEX IF NOT EXISTS candidates_location_idx
  ON public.candidates (location)
  WHERE location IS NOT NULL;

-- Index pour les requêtes par type de contrat
CREATE INDEX IF NOT EXISTS candidates_contract_type_idx
  ON public.candidates (contract_type)
  WHERE contract_type IS NOT NULL;

-- RLS (Row Level Security)
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- Politique : Lecture publique (pour le matching), écriture via Edge Function
CREATE POLICY "Anyone can read candidates"
  ON public.candidates
  FOR SELECT
  TO public
  USING (true);

-- Politique : Seul le service role peut insérer (via Edge Function)
CREATE POLICY "Service role can insert candidates"
  ON public.candidates
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Commentaires pour documentation
COMMENT ON TABLE public.candidates IS 'Profils de candidats / freelances créés via le wizard';
COMMENT ON COLUMN public.candidates.job_key IS 'Clé du métier principal (ex: cook, server, web_developer)';
COMMENT ON COLUMN public.candidates.headline IS 'Titre du profil (ex: "Développeur React freelance")';
COMMENT ON COLUMN public.candidates.bio IS 'Description / présentation du candidat';
COMMENT ON COLUMN public.candidates.availability IS 'Disponibilités (ex: "Soirs et week-ends")';
COMMENT ON COLUMN public.candidates.experience_level IS 'Niveau: Junior, Intermédiaire, Senior';
COMMENT ON COLUMN public.candidates.contract_type IS 'Type: Extra, CDD, CDI, Freelance, Stage';
COMMENT ON COLUMN public.candidates.remote_preference IS 'Préférence: Sur place, Remote, Hybride';

