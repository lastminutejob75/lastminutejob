#!/usr/bin/env node

/**
 * Script pour créer toutes les tables manquantes (clients, candidates, applications)
 */

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://gywhqtlebvvauxzmdavb.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY n\'est pas définie');
  process.exit(1);
}

// SQL pour créer la table clients
const createClientsSQL = `
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text,
  phone text,
  company_name text,
  created_at timestamptz DEFAULT now(),
  last_active_at timestamptz,
  internal_tags text[] DEFAULT '{}',
  acquisition_source text
);

CREATE INDEX IF NOT EXISTS clients_email_idx ON public.clients(email);
CREATE INDEX IF NOT EXISTS clients_auth_user_id_idx ON public.clients(auth_user_id);
CREATE INDEX IF NOT EXISTS clients_created_at_idx ON public.clients(created_at DESC);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read clients" ON public.clients;
CREATE POLICY "Public can read clients"
  ON public.clients
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own client record" ON public.clients;
CREATE POLICY "Users can insert their own client record"
  ON public.clients
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_user_id OR auth_user_id IS NULL);

DROP POLICY IF EXISTS "Users can update their own client record" ON public.clients;
CREATE POLICY "Users can update their own client record"
  ON public.clients
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id OR auth_user_id IS NULL)
  WITH CHECK (auth.uid() = auth_user_id OR auth_user_id IS NULL);
`;

// SQL pour créer la table candidates (si pas déjà fait)
const createCandidatesSQL = `
CREATE TABLE IF NOT EXISTS public.candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name text,
  last_name text,
  email text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now(),
  last_application_at timestamptz,
  internal_tags text[] DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS candidates_email_idx ON public.candidates(email);
CREATE INDEX IF NOT EXISTS candidates_auth_user_id_idx ON public.candidates(auth_user_id);
CREATE INDEX IF NOT EXISTS candidates_last_application_at_idx ON public.candidates(last_application_at DESC) WHERE last_application_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS candidates_created_at_idx ON public.candidates(created_at DESC);

ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read candidates" ON public.candidates;
CREATE POLICY "Public can read candidates"
  ON public.candidates
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own candidate record" ON public.candidates;
CREATE POLICY "Users can insert their own candidate record"
  ON public.candidates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_user_id OR auth_user_id IS NULL);

DROP POLICY IF EXISTS "Users can update their own candidate record" ON public.candidates;
CREATE POLICY "Users can update their own candidate record"
  ON public.candidates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id OR auth_user_id IS NULL)
  WITH CHECK (auth.uid() = auth_user_id OR auth_user_id IS NULL);
`;

// SQL pour créer la table applications (si pas déjà fait)
const createApplicationsSQL = `
CREATE TABLE IF NOT EXISTS public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs (id) ON DELETE CASCADE,
  candidate_id uuid REFERENCES public.candidates (id) ON DELETE SET NULL,
  candidate_name text,
  candidate_email text,
  candidate_phone text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'seen', 'shortlisted', 'rejected', 'hired')),
  message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS applications_job_id_idx ON public.applications (job_id);
CREATE INDEX IF NOT EXISTS applications_candidate_id_idx ON public.applications (candidate_id) WHERE candidate_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS applications_status_idx ON public.applications (status);
CREATE INDEX IF NOT EXISTS applications_created_at_idx ON public.applications (created_at DESC);

CREATE OR REPLACE FUNCTION update_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_applications_updated_at ON public.applications;
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION update_applications_updated_at();

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read applications for published jobs" ON public.applications;
CREATE POLICY "Public can read applications for published jobs"
  ON public.applications
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = applications.job_id
      AND jobs.status = 'published'
    )
  );

DROP POLICY IF EXISTS "Authenticated users can read all applications" ON public.applications;
CREATE POLICY "Authenticated users can read all applications"
  ON public.applications
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can create applications" ON public.applications;
CREATE POLICY "Anyone can create applications"
  ON public.applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update applications" ON public.applications;
CREATE POLICY "Authenticated users can update applications"
  ON public.applications
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete applications" ON public.applications;
CREATE POLICY "Authenticated users can delete applications"
  ON public.applications
  FOR DELETE
  TO authenticated
  USING (true);
`;

async function executeSQL(sql, description) {
  const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  
  if (!projectId) {
    throw new Error('Impossible d\'extraire le project ID de l\'URL');
  }
  
  const response = await fetch(`https://api.supabase.com/v1/projects/${projectId}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey
    },
    body: JSON.stringify({
      query: sql
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} ${response.statusText}\n${errorText}`);
  }

  return await response.json();
}

async function createAllTables() {
  console.log('🚀 Création de toutes les tables manquantes...\n');
  
  try {
    // Étape 1: Créer la table clients
    console.log('📋 Étape 1: Création de la table clients...');
    await executeSQL(createClientsSQL, 'clients');
    console.log('✅ Table clients créée\n');
    
    // Étape 2: Créer la table candidates
    console.log('📋 Étape 2: Création de la table candidates...');
    await executeSQL(createCandidatesSQL, 'candidates');
    console.log('✅ Table candidates créée\n');
    
    // Étape 3: Créer la table applications
    console.log('📋 Étape 3: Création de la table applications...');
    await executeSQL(createApplicationsSQL, 'applications');
    console.log('✅ Table applications créée\n');
    
    console.log('✅ Toutes les tables ont été créées avec succès!');
    console.log('\n💡 Vous pouvez maintenant utiliser le dashboard admin.');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error.message);
    process.exit(1);
  }
}

createAllTables();

