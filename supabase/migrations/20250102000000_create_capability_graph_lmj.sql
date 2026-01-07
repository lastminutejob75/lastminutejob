-- Migration: Capability Graph pour LastMinuteJob
-- Date: 2025-01-02
-- Description: Création du Capability Graph spécifique aux métiers humains pour LastMinuteJob
-- ⚠️ IMPORTANT : Ce Supabase est séparé de celui d'UWi (gywhqtlebvvauxzmdavb)

-- =====================================================
-- 1. TABLE: INTENTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS intentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  example_prompts TEXT[] DEFAULT '{}',
  expected_results TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_intentions_slug ON intentions(slug);
CREATE INDEX IF NOT EXISTS idx_intentions_tags ON intentions USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_intentions_example_prompts ON intentions USING GIN(example_prompts);

-- =====================================================
-- 2. TABLE: CAPABILITIES
-- =====================================================

CREATE TABLE IF NOT EXISTS capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  domain TEXT,
  tags TEXT[] DEFAULT '{}',
  input_schema JSONB DEFAULT '{}',
  output_schema JSONB DEFAULT '{}',
  prerequisites TEXT[] DEFAULT '{}',
  expected_outputs TEXT[] DEFAULT '{}',
  use_cases TEXT[] DEFAULT '{}',
  example_prompts TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_capabilities_slug ON capabilities(slug);
CREATE INDEX IF NOT EXISTS idx_capabilities_domain ON capabilities(domain);
CREATE INDEX IF NOT EXISTS idx_capabilities_tags ON capabilities USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_capabilities_prerequisites ON capabilities USING GIN(prerequisites);
CREATE INDEX IF NOT EXISTS idx_capabilities_expected_outputs ON capabilities USING GIN(expected_outputs);
CREATE INDEX IF NOT EXISTS idx_capabilities_use_cases ON capabilities USING GIN(use_cases);

-- =====================================================
-- 3. TABLE: PROVIDERS (Métiers humains uniquement)
-- =====================================================

CREATE TABLE IF NOT EXISTS providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('saas', 'agent', 'human', 'robot')),
  description TEXT,
  domains TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  website_url TEXT,
  api_available BOOLEAN DEFAULT FALSE,
  integration_type TEXT DEFAULT 'none' CHECK (integration_type IN ('none', 'api', 'webhook', 'manual')),
  price_level TEXT DEFAULT 'mid' CHECK (price_level IN ('free', 'low', 'mid', 'high', 'enterprise')),
  setup_time TEXT DEFAULT 'medium' CHECK (setup_time IN ('instant', 'short', 'medium', 'long')),
  languages TEXT[] DEFAULT '{}',
  geo TEXT[] DEFAULT '{}',
  reliability_score NUMERIC DEFAULT 0.5 CHECK (reliability_score >= 0 AND reliability_score <= 1),
  -- Métadonnées enrichies pour métiers humains
  specialties TEXT[] DEFAULT '{}',
  pricing_min NUMERIC,
  pricing_max NUMERIC,
  pricing_currency TEXT DEFAULT 'EUR',
  pricing_unit TEXT DEFAULT 'h', -- Par défaut tarif horaire pour métiers humains
  delivery_time_min INTEGER,
  delivery_time_max INTEGER,
  service_areas TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  task_types TEXT[] DEFAULT '{}',
  example_prompts TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_providers_slug ON providers(slug);
CREATE INDEX IF NOT EXISTS idx_providers_type ON providers(type);
CREATE INDEX IF NOT EXISTS idx_providers_tags ON providers USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_providers_specialties ON providers USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_providers_task_types ON providers USING GIN(task_types);
CREATE INDEX IF NOT EXISTS idx_providers_service_areas ON providers USING GIN(service_areas);
CREATE INDEX IF NOT EXISTS idx_providers_certifications ON providers USING GIN(certifications);
CREATE INDEX IF NOT EXISTS idx_providers_pricing_min ON providers(pricing_min);
CREATE INDEX IF NOT EXISTS idx_providers_pricing_max ON providers(pricing_max);

-- =====================================================
-- 4. TABLE: CAPABILITY_PROVIDERS
-- =====================================================

CREATE TABLE IF NOT EXISTS capability_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  strength NUMERIC DEFAULT 0.5 CHECK (strength >= 0 AND strength <= 1),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(capability_id, provider_id)
);

CREATE INDEX IF NOT EXISTS idx_capability_providers_capability ON capability_providers(capability_id);
CREATE INDEX IF NOT EXISTS idx_capability_providers_provider ON capability_providers(provider_id);
CREATE INDEX IF NOT EXISTS idx_capability_providers_strength ON capability_providers(strength DESC);

-- =====================================================
-- 5. TABLE: INTENTION_CAPABILITIES
-- =====================================================

CREATE TABLE IF NOT EXISTS intention_capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intention_id UUID NOT NULL REFERENCES intentions(id) ON DELETE CASCADE,
  capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
  priority NUMERIC DEFAULT 0.5 CHECK (priority >= 0 AND priority <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(intention_id, capability_id)
);

CREATE INDEX IF NOT EXISTS idx_intention_capabilities_intention ON intention_capabilities(intention_id);
CREATE INDEX IF NOT EXISTS idx_intention_capabilities_capability ON intention_capabilities(capability_id);
CREATE INDEX IF NOT EXISTS idx_intention_capabilities_priority ON intention_capabilities(priority DESC);

-- =====================================================
-- 6. TABLES DE RELATIONS ENRICHIES (optionnel)
-- =====================================================

-- Table: capability_prerequisites
CREATE TABLE IF NOT EXISTS capability_prerequisites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
  prerequisite_capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
  required BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(capability_id, prerequisite_capability_id),
  CHECK (capability_id != prerequisite_capability_id)
);

CREATE INDEX IF NOT EXISTS idx_capability_prerequisites_capability ON capability_prerequisites(capability_id);
CREATE INDEX IF NOT EXISTS idx_capability_prerequisites_prerequisite ON capability_prerequisites(prerequisite_capability_id);

-- Table: capability_complements
CREATE TABLE IF NOT EXISTS capability_complements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
  complement_capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
  synergy_score NUMERIC DEFAULT 0.5 CHECK (synergy_score >= 0 AND synergy_score <= 1),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(capability_id, complement_capability_id),
  CHECK (capability_id != complement_capability_id)
);

CREATE INDEX IF NOT EXISTS idx_capability_complements_capability ON capability_complements(capability_id);
CREATE INDEX IF NOT EXISTS idx_capability_complements_complement ON capability_complements(complement_capability_id);

-- Table: provider_alternatives
CREATE TABLE IF NOT EXISTS provider_alternatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  alternative_provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  similarity_score NUMERIC DEFAULT 0.5 CHECK (similarity_score >= 0 AND similarity_score <= 1),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider_id, alternative_provider_id),
  CHECK (provider_id != alternative_provider_id)
);

CREATE INDEX IF NOT EXISTS idx_provider_alternatives_provider ON provider_alternatives(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_alternatives_alternative ON provider_alternatives(alternative_provider_id);

-- =====================================================
-- 7. POLITIQUE RLS (Row Level Security)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE intentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE capability_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE intention_capabilities ENABLE ROW LEVEL SECURITY;

-- Politique : Lecture publique pour toutes les tables
CREATE POLICY "Public read access" ON intentions FOR SELECT USING (true);
CREATE POLICY "Public read access" ON capabilities FOR SELECT USING (true);
CREATE POLICY "Public read access" ON providers FOR SELECT USING (true);
CREATE POLICY "Public read access" ON capability_providers FOR SELECT USING (true);
CREATE POLICY "Public read access" ON intention_capabilities FOR SELECT USING (true);

-- =====================================================
-- 8. COMMENTAIRES
-- =====================================================

COMMENT ON TABLE intentions IS 'Intentions utilisateur pour LastMinuteJob (métiers humains)';
COMMENT ON TABLE capabilities IS 'Capacités disponibles pour LastMinuteJob (métiers humains)';
COMMENT ON TABLE providers IS 'Providers pour LastMinuteJob - Uniquement type "human"';
COMMENT ON TABLE capability_providers IS 'Relations entre capabilities et providers';
COMMENT ON TABLE intention_capabilities IS 'Relations entre intentions et capabilities';

COMMENT ON COLUMN providers.type IS 'Type de provider - LastMinuteJob utilise uniquement "human"';
COMMENT ON COLUMN providers.pricing_unit IS 'Unité de prix - Par défaut "h" (heure) pour métiers humains';
COMMENT ON COLUMN providers.specialties IS 'Spécialités du provider (ex: restauration, logistique, BTP)';
COMMENT ON COLUMN providers.task_types IS 'Types de tâches supportés (ex: service, livraison, installation)';


