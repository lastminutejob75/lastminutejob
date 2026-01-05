-- SCRIPT SIMPLE POUR CORRIGER LES PERMISSIONS
-- Copie-colle ce script dans Supabase SQL Editor et clique sur "Run"

-- 1. Supprimer TOUTES les anciennes politiques sur jobs
DROP POLICY IF EXISTS "Anyone can create jobs" ON jobs;
DROP POLICY IF EXISTS "Authenticated users can insert jobs" ON jobs;
DROP POLICY IF EXISTS "Public can read approved jobs" ON jobs;
DROP POLICY IF EXISTS "Anyone can read jobs" ON jobs;
DROP POLICY IF EXISTS "Anyone can view published jobs" ON jobs;
DROP POLICY IF EXISTS "Anyone can update jobs" ON jobs;
DROP POLICY IF EXISTS "Anyone can update jobs with edit token" ON jobs;
DROP POLICY IF EXISTS "Users can update own jobs" ON jobs;
DROP POLICY IF EXISTS "Anyone can delete jobs" ON jobs;
DROP POLICY IF EXISTS "Anyone can delete jobs with edit token" ON jobs;
DROP POLICY IF EXISTS "Users can delete own jobs" ON jobs;

-- 2. Créer des politiques SIMPLES qui fonctionnent

-- SELECT: Tout le monde peut lire les jobs approuvés
CREATE POLICY "Public can read approved jobs"
  ON jobs FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- INSERT: N'importe qui peut créer des jobs (même sans compte)
CREATE POLICY "Anyone can create jobs"
  ON jobs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- UPDATE: N'importe qui peut modifier avec edit_token
CREATE POLICY "Anyone can update jobs"
  ON jobs FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- DELETE: N'importe qui peut supprimer avec edit_token
CREATE POLICY "Anyone can delete jobs"
  ON jobs FOR DELETE
  TO anon, authenticated
  USING (true);

-- 3. Vérifier que ça fonctionne
SELECT 
  policyname, 
  cmd, 
  roles
FROM pg_policies 
WHERE tablename = 'jobs'
ORDER BY cmd, policyname;

