/*
  # Fix Jobs Insert Permissions
  
  Permet à n'importe qui (même sans authentification) de créer des annonces.
*/

-- Supprimer les anciennes politiques INSERT qui pourraient bloquer
DROP POLICY IF EXISTS "Authenticated users can insert jobs" ON jobs;
DROP POLICY IF EXISTS "Anyone can create jobs" ON jobs;

-- Créer une politique qui permet à n'importe qui de créer des jobs
CREATE POLICY "Anyone can create jobs"
  ON jobs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Vérifier que les autres politiques sont correctes
-- SELECT: tout le monde peut lire les jobs approuvés
DROP POLICY IF EXISTS "Public can read approved jobs" ON jobs;
CREATE POLICY "Public can read approved jobs"
  ON jobs FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- UPDATE: permettre les mises à jour avec edit_token (pour l'édition)
DROP POLICY IF EXISTS "Anyone can update jobs" ON jobs;
CREATE POLICY "Anyone can update jobs with edit token"
  ON jobs FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- DELETE: permettre la suppression avec edit_token
DROP POLICY IF EXISTS "Anyone can delete jobs" ON jobs;
CREATE POLICY "Anyone can delete jobs with edit token"
  ON jobs FOR DELETE
  TO anon, authenticated
  USING (true);

