/*
  # Create Job Detection Logs Table
  
  Table pour stocker les logs de détection de métiers pour analyse et amélioration.
  Le logging ne doit jamais casser l'UX - cette table est utilisée uniquement par l'Edge Function.
*/

-- Créer la table
CREATE TABLE IF NOT EXISTS public.job_detection_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),

  -- prompt brut utilisateur
  prompt_text text NOT NULL,

  -- détection moteur
  primary_job_key text,
  primary_confidence numeric,
  secondary_jobs jsonb,           -- [{ jobKey, confidence }]

  -- readiness
  readiness_score integer,
  readiness_status text,          -- 'incomplete' | 'almost_ready' | 'ready'
  readiness_missing text[],       -- ['métier', 'lieu', ...]

  -- contexte
  location text,
  duration text,                  -- 'one_day' | 'short' | 'long'
  urgency text,                   -- 'low' | 'medium' | 'high'

  -- LLM
  used_llm boolean DEFAULT false,

  -- métadonnées client
  user_agent text,
  path text,

  -- logs bruts optionnels (debug)
  raw jsonb
);

-- Index pour les requêtes par date (tri décroissant pour les logs récents)
CREATE INDEX IF NOT EXISTS job_detection_logs_created_at_idx
  ON public.job_detection_logs (created_at DESC);

-- Index pour les requêtes par métier principal
CREATE INDEX IF NOT EXISTS job_detection_logs_primary_job_key_idx
  ON public.job_detection_logs (primary_job_key)
  WHERE primary_job_key IS NOT NULL;

-- Index pour les requêtes par statut de readiness
CREATE INDEX IF NOT EXISTS job_detection_logs_readiness_status_idx
  ON public.job_detection_logs (readiness_status)
  WHERE readiness_status IS NOT NULL;

-- Index pour les requêtes par utilisation LLM
CREATE INDEX IF NOT EXISTS job_detection_logs_used_llm_idx
  ON public.job_detection_logs (used_llm)
  WHERE used_llm = true;

-- RLS (Row Level Security) : Seule l'Edge Function (service role) peut insérer
-- Personne ne peut lire (sauf via l'admin)
ALTER TABLE public.job_detection_logs ENABLE ROW LEVEL SECURITY;

-- Politique : Seul le service role peut insérer (via Edge Function)
CREATE POLICY "Service role can insert job detection logs"
  ON public.job_detection_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Politique : Les admins peuvent lire (pour analyse)
-- Note: Vous devrez créer une politique pour les admins si vous avez un système d'admin
-- Pour l'instant, seul le service role peut lire
CREATE POLICY "Service role can read job detection logs"
  ON public.job_detection_logs
  FOR SELECT
  TO service_role
  USING (true);

-- Personne d'autre ne peut accéder à cette table
-- (anon et authenticated ne peuvent rien faire)

-- Commentaires pour documentation
COMMENT ON TABLE public.job_detection_logs IS 'Logs de détection de métiers pour analyse et amélioration du système UWi';
COMMENT ON COLUMN public.job_detection_logs.prompt_text IS 'Prompt brut saisi par l''utilisateur';
COMMENT ON COLUMN public.job_detection_logs.primary_job_key IS 'Clé du métier principal détecté (ex: "server", "cook")';
COMMENT ON COLUMN public.job_detection_logs.primary_confidence IS 'Score de confiance du métier principal (0-1)';
COMMENT ON COLUMN public.job_detection_logs.secondary_jobs IS 'Métiers secondaires détectés avec leurs scores';
COMMENT ON COLUMN public.job_detection_logs.readiness_score IS 'Score de complétude de la mission (0-100)';
COMMENT ON COLUMN public.job_detection_logs.readiness_status IS 'Statut de préparation: incomplete, almost_ready, ready';
COMMENT ON COLUMN public.job_detection_logs.readiness_missing IS 'Liste des informations manquantes';
COMMENT ON COLUMN public.job_detection_logs.used_llm IS 'Indique si un LLM a été utilisé pour améliorer la détection';

