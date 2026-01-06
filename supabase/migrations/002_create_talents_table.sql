-- Migration : Création de la table talents pour le matching automatique
-- Date : 2026-01-06
-- Description : Table pour stocker les profils talents disponibles pour les missions

-- Créer la table talents
CREATE TABLE IF NOT EXISTS talents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Métier & compétences
  job_keys TEXT[] NOT NULL,  -- ["server", "bartender", "cook"]
  skills TEXT[],  -- ["service", "cocktails", "caisse", "haccp"]
  experience_years INTEGER,
  languages TEXT[],  -- ["fr", "en", "ar"]

  -- Localisation
  city TEXT NOT NULL,
  lat DECIMAL(10, 8),  -- Latitude pour calcul distance
  lng DECIMAL(11, 8),  -- Longitude pour calcul distance
  mobility_radius_km INTEGER DEFAULT 10,  -- Rayon de mobilité

  -- Disponibilité
  available_from TIMESTAMP,  -- Disponible à partir de
  available_to TIMESTAMP,    -- Disponible jusqu'à
  available_days TEXT[],     -- ["lundi", "mardi", "mercredi", ...]
  available_hours JSONB,     -- { "lundi": ["9h-18h"], "mardi": ["14h-23h"] }

  -- Préférences tarifaires
  min_hourly_rate DECIMAL(10, 2),
  max_hourly_rate DECIMAL(10, 2),
  preferred_contract_types TEXT[],  -- ["extra", "cdd", "cdi"]

  -- Réputation
  rating DECIMAL(3, 2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  total_missions INTEGER DEFAULT 0,
  completed_missions INTEGER DEFAULT 0,
  cancellation_rate DECIMAL(5, 2) DEFAULT 0.0,

  -- Contact
  email TEXT,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,

  -- Statut
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),

  -- Préférences notifications
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": false}'::jsonb,

  -- Métadonnées
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_talents_job_keys ON talents USING GIN(job_keys);
CREATE INDEX IF NOT EXISTS idx_talents_city ON talents(city);
CREATE INDEX IF NOT EXISTS idx_talents_available_from ON talents(available_from);
CREATE INDEX IF NOT EXISTS idx_talents_status ON talents(status);
CREATE INDEX IF NOT EXISTS idx_talents_rating ON talents(rating);
CREATE INDEX IF NOT EXISTS idx_talents_location ON talents(lat, lng);
CREATE INDEX IF NOT EXISTS idx_talents_user_id ON talents(user_id);

-- Index composite pour requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_talents_active_city ON talents(status, city) WHERE status = 'active';

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_talents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_talents_updated_at
  BEFORE UPDATE ON talents
  FOR EACH ROW
  EXECUTE FUNCTION update_talents_updated_at();

-- RLS (Row Level Security) - À ajuster selon votre politique
ALTER TABLE talents ENABLE ROW LEVEL SECURITY;

-- Policy : Les talents peuvent voir et modifier leur propre profil
CREATE POLICY talents_own_profile ON talents
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy : Tous peuvent voir les talents actifs (pour le matching)
CREATE POLICY talents_public_read ON talents
  FOR SELECT
  USING (status = 'active');

-- Seed : Données de test (à supprimer en production)
INSERT INTO talents (
  job_keys,
  city,
  lat,
  lng,
  status,
  available_from,
  skills,
  rating,
  total_missions,
  completed_missions,
  first_name,
  last_name,
  email,
  phone
) VALUES
  (
    ARRAY['server'],
    'Paris',
    48.8566,
    2.3522,
    'active',
    NOW(),
    ARRAY['service', 'caisse'],
    4.8,
    25,
    24,
    'Sophie',
    'Martin',
    'sophie.m@example.com',
    '+33612345678'
  ),
  (
    ARRAY['server', 'bartender'],
    'Paris',
    48.8606,
    2.3376,
    'active',
    NOW(),
    ARRAY['service', 'cocktails', 'bar'],
    4.6,
    18,
    17,
    'Lucas',
    'Dubois',
    'lucas.d@example.com',
    '+33623456789'
  ),
  (
    ARRAY['server'],
    'Paris',
    48.8499,
    2.3518,
    'active',
    NOW(),
    ARRAY['service', 'vin', 'sommelier'],
    4.9,
    32,
    32,
    'Emma',
    'Laurent',
    'emma.l@example.com',
    '+33634567890'
  ),
  (
    ARRAY['cook'],
    'Lyon',
    45.7640,
    4.8357,
    'active',
    NOW(),
    ARRAY['cuisine', 'pâtisserie', 'haccp'],
    4.7,
    15,
    14,
    'Marc',
    'Bernard',
    'marc.b@example.com',
    '+33645678901'
  ),
  (
    ARRAY['bartender'],
    'Lille',
    50.6292,
    3.0573,
    'active',
    NOW(),
    ARRAY['bar', 'cocktails', 'mixologie'],
    4.5,
    12,
    11,
    'Julie',
    'Petit',
    'julie.p@example.com',
    '+33656789012'
  ),
  (
    ARRAY['server'],
    'Marseille',
    43.2965,
    5.3698,
    'active',
    NOW(),
    ARRAY['service', 'langues'],
    4.3,
    8,
    8,
    'Thomas',
    'Robert',
    'thomas.r@example.com',
    '+33667890123'
  ),
  (
    ARRAY['server', 'host'],
    'Lyon',
    45.7578,
    4.8320,
    'active',
    NOW(),
    ARRAY['accueil', 'service', 'réservation'],
    4.9,
    28,
    27,
    'Marie',
    'Richard',
    'marie.r@example.com',
    '+33678901234'
  ),
  (
    ARRAY['cook'],
    'Paris',
    48.8534,
    2.3488,
    'active',
    NOW(),
    ARRAY['cuisine', 'végétarien', 'bio'],
    4.6,
    20,
    19,
    'Alex',
    'Moreau',
    'alex.m@example.com',
    '+33689012345'
  ),
  (
    ARRAY['bartender'],
    'Paris',
    48.8738,
    2.2950,
    'active',
    NOW(),
    ARRAY['bar', 'cocktails', 'flair'],
    4.8,
    22,
    21,
    'Camille',
    'Simon',
    'camille.s@example.com',
    '+33690123456'
  ),
  (
    ARRAY['server'],
    'Bordeaux',
    44.8378,
    -0.5792,
    'active',
    NOW(),
    ARRAY['service', 'vin', 'gastronomie'],
    4.7,
    16,
    16,
    'Pierre',
    'Laurent',
    'pierre.l@example.com',
    '+33601234567'
  ),
  (
    ARRAY['delivery'],
    'Paris',
    48.8566,
    2.3522,
    'active',
    NOW(),
    ARRAY['livraison', 'vélo', 'scooter'],
    4.4,
    45,
    43,
    'Karim',
    'Ahmed',
    'karim.a@example.com',
    '+33612345679'
  ),
  (
    ARRAY['sales'],
    'Nice',
    43.7102,
    7.2620,
    'active',
    NOW(),
    ARRAY['vente', 'conseil', 'caisse'],
    4.5,
    14,
    13,
    'Laura',
    'Blanc',
    'laura.b@example.com',
    '+33623456780'
  ),
  (
    ARRAY['cleaning'],
    'Toulouse',
    43.6047,
    1.4442,
    'active',
    NOW(),
    ARRAY['ménage', 'désinfection'],
    4.6,
    30,
    29,
    'Fatima',
    'Hassan',
    'fatima.h@example.com',
    '+33634567891'
  ),
  (
    ARRAY['warehouse'],
    'Strasbourg',
    48.5734,
    7.7521,
    'active',
    NOW(),
    ARRAY['logistique', 'cariste', 'manutention'],
    4.3,
    10,
    9,
    'Jean',
    'Leroy',
    'jean.l@example.com',
    '+33645678902'
  ),
  (
    ARRAY['cashier'],
    'Nantes',
    47.2184,
    -1.5536,
    'active',
    NOW(),
    ARRAY['caisse', 'encaissement', 'accueil'],
    4.7,
    19,
    19,
    'Isabelle',
    'Girard',
    'isabelle.g@example.com',
    '+33656789013'
  );

-- Commentaires pour documentation
COMMENT ON TABLE talents IS 'Profils des talents disponibles pour matching automatique';
COMMENT ON COLUMN talents.job_keys IS 'Liste des métiers maîtrisés par le talent';
COMMENT ON COLUMN talents.mobility_radius_km IS 'Rayon de mobilité en km autour de la ville';
COMMENT ON COLUMN talents.rating IS 'Note moyenne (0-5) basée sur les évaluations';
COMMENT ON COLUMN talents.status IS 'Statut du talent : active, inactive, suspended';
