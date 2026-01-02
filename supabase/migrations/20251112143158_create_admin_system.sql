/*
  # Create Admin System

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `pass_hash` (text, not null) - SHA-256 hashed password
      - `salt` (text, not null) - Unique salt for password hashing
      - `created_at` (timestamptz, default now())
    
    - `admin_sessions`
      - `id` (uuid, primary key)
      - `token` (text, unique, not null)
      - `admin_id` (uuid, references admin_users)
      - `created_at` (timestamptz, default now())
      - `expires_at` (timestamptz, not null)

  2. Security
    - Enable RLS on both tables
    - No public access - only accessible via Edge Functions with service role
    - Sessions expire after 7 days

  3. Notes
    - Admin authentication is handled entirely by Edge Functions
    - First admin can register without authentication
    - Subsequent admins require valid admin token
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  pass_hash text NOT NULL,
  salt text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create admin_sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  admin_id uuid REFERENCES admin_users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- No policies needed - only Edge Functions with service role can access these tables

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);