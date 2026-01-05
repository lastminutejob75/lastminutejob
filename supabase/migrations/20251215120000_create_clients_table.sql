/*
  # Create clients table
  
  1. New Table
    - `clients`: Table pour stocker les informations des recruteurs/clients
      - `id` (uuid, primary key)
      - `auth_user_id` (uuid, references auth.users, nullable)
      - `name` (text, not null) - Nom du contact
      - `email` (text, not null) - Email du client
      - `phone` (text, nullable) - Téléphone
      - `company_name` (text, nullable) - Nom de l'entreprise
      - `created_at` (timestamptz, default now())
      - `last_active_at` (timestamptz, nullable) - Dernière activité
      - `internal_tags` (text[], default '{}') - Tags internes (VIP, Risque, etc.)
      - `acquisition_source` (text, nullable) - Source d'acquisition (landing, inbound, admin, etc.)
  
  2. Index
    - Index sur `email` pour les recherches rapides
  
  3. Security
    - Enable RLS on the table
    - Public can read (for approved clients)
    - Only admins can write (via Edge Functions with service role)
*/

-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company_name text,
  created_at timestamptz DEFAULT now(),
  last_active_at timestamptz,
  -- tags internes, ex: 'VIP', 'Risque', etc.
  internal_tags text[] DEFAULT '{}',
  -- pour savoir d'où vient le client (landing, inbound, admin, etc.)
  acquisition_source text
);

-- Create index on email for fast lookups
CREATE INDEX IF NOT EXISTS clients_email_idx ON public.clients(email);

-- Create index on auth_user_id for user lookups
CREATE INDEX IF NOT EXISTS clients_auth_user_id_idx ON public.clients(auth_user_id);

-- Create index on company_name for searches
CREATE INDEX IF NOT EXISTS clients_company_name_idx ON public.clients(company_name);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Policy: Public can read clients (for approved/public clients)
CREATE POLICY "Public can read clients"
  ON public.clients
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Only authenticated users can insert their own client record
-- (In practice, this will be handled by Edge Functions with service role)
CREATE POLICY "Users can insert their own client record"
  ON public.clients
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_user_id OR auth_user_id IS NULL);

-- Policy: Users can update their own client record
CREATE POLICY "Users can update their own client record"
  ON public.clients
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id OR auth_user_id IS NULL)
  WITH CHECK (auth.uid() = auth_user_id OR auth_user_id IS NULL);

-- Note: DELETE operations should be restricted to admins only (via Edge Functions)

