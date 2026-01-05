-- SCRIPT COMPLET - Crée toutes les tables nécessaires
-- Copie-colle dans Supabase SQL Editor et clique "Run"

-- 1. Créer la table jobs
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  edit_token text UNIQUE NOT NULL,
  title text NOT NULL DEFAULT 'Annonce',
  body text DEFAULT '',
  parsed jsonb DEFAULT '{"role":"","city":"","date":"","duration":"","hourly":""}'::jsonb,
  contact jsonb DEFAULT '{"company":"","name":"","email":"","phone":""}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  source text DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Activer RLS sur jobs
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- 3. Supprimer toutes les anciennes politiques
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'jobs') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON jobs', r.policyname);
  END LOOP;
END $$;

-- 4. Créer les politiques pour jobs
CREATE POLICY "read_approved_jobs"
  ON jobs FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY "insert_jobs"
  ON jobs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "update_jobs"
  ON jobs FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "delete_jobs"
  ON jobs FOR DELETE
  TO anon, authenticated
  USING (true);

-- 5. Créer la table prescreen_questions
CREATE TABLE IF NOT EXISTS prescreen_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_question_order_per_job UNIQUE (job_id, question_order)
);

-- 6. Activer RLS sur prescreen_questions
ALTER TABLE prescreen_questions ENABLE ROW LEVEL SECURITY;

-- 7. Supprimer les anciennes politiques de prescreen_questions
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'prescreen_questions') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON prescreen_questions', r.policyname);
  END LOOP;
END $$;

-- 8. Créer les politiques pour prescreen_questions
CREATE POLICY "read_questions"
  ON prescreen_questions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "insert_questions"
  ON prescreen_questions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "update_questions"
  ON prescreen_questions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "delete_questions"
  ON prescreen_questions FOR DELETE
  TO anon, authenticated
  USING (true);

-- 9. Créer les index pour performance
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_edit_token ON jobs(edit_token);
CREATE INDEX IF NOT EXISTS idx_prescreen_questions_job_id ON prescreen_questions(job_id);

-- 10. Créer la fonction pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Créer le trigger pour updated_at
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 12. Vérifier
SELECT '✅ Toutes les tables créées avec succès!' as result;

