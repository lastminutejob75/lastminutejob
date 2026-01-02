-- SCRIPT SIMPLE - Copie-colle dans Supabase SQL Editor et clique "Run"

-- Supprimer toutes les politiques existantes
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'jobs') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON jobs', r.policyname);
  END LOOP;
END $$;

-- Créer des politiques simples qui fonctionnent
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

-- Vérifier
SELECT '✅ Permissions corrigées' as result;

