-- Seed: Données initiales Capability Graph pour LastMinuteJob
-- Date: 2025-01-02
-- Description: Ajout de capabilities et providers de base pour métiers humains

-- =====================================================
-- 1. CAPABILITIES pour métiers humains
-- =====================================================

INSERT INTO capabilities (slug, title, description, domain, tags) VALUES
('recrutement_terrain', 'Recrutement Terrain', 'Recrutement de personnel pour missions terrain (restauration, logistique, BTP, etc.)', 'recrutement', ARRAY['recrutement', 'terrain', 'humain', 'mission']),
('service_restaurant', 'Service Restaurant', 'Service en salle, accueil client, prise de commandes', 'restauration', ARRAY['restaurant', 'service', 'hospitality', 'terrain', 'humain']),
('cuisine_restaurant', 'Cuisine Restaurant', 'Préparation de plats, gestion de cuisine', 'restauration', ARRAY['cuisine', 'restaurant', 'hospitality', 'terrain', 'humain']),
('livraison_transport', 'Livraison et Transport', 'Livraison de colis, transport de personnes ou marchandises', 'logistique', ARRAY['livraison', 'transport', 'logistique', 'terrain', 'humain']),
('manutention_entrepot', 'Manutention Entrepôt', 'Chargement, déchargement, gestion d''entrepôt', 'logistique', ARRAY['entrepôt', 'manutention', 'logistique', 'terrain', 'humain']),
('vente_commerce', 'Vente et Commerce', 'Vente en magasin, conseil client, encaissement', 'commerce', ARRAY['vente', 'commerce', 'retail', 'terrain', 'humain']),
('btp_construction', 'BTP et Construction', 'Travaux de construction, rénovation, maintenance', 'btp', ARRAY['btp', 'construction', 'terrain', 'humain']),
('nettoyage_entretien', 'Nettoyage et Entretien', 'Nettoyage de locaux, entretien d''espaces', 'services', ARRAY['nettoyage', 'entretien', 'terrain', 'humain']),
('securite_surveillance', 'Sécurité et Surveillance', 'Surveillance de locaux, sécurité événementielle', 'securite', ARRAY['sécurité', 'surveillance', 'terrain', 'humain']),
('evenementiel', 'Événementiel', 'Organisation et animation d''événements', 'evenementiel', ARRAY['événementiel', 'animation', 'terrain', 'humain'])
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 2. PROVIDERS pour métiers humains (exemples)
-- =====================================================

-- Provider: Serveur/Restaurant
INSERT INTO providers (slug, name, type, description, domains, tags, price_level, pricing_min, pricing_max, pricing_currency, pricing_unit, specialties, task_types) VALUES
('lmj_serveur', 'LMJ Serveur', 'human', 'Pool de serveurs/serveuses pour restauration', ARRAY['restauration'], ARRAY['service', 'restaurant', 'hospitality', 'terrain', 'humain'], 'low', 12, 15, 'EUR', 'h', ARRAY['service en salle', 'accueil client'], ARRAY['prise de commande', 'service', 'encaissement'])
ON CONFLICT (slug) DO NOTHING;

-- Provider: Cuisinier
INSERT INTO providers (slug, name, type, description, domains, tags, price_level, pricing_min, pricing_max, pricing_currency, pricing_unit, specialties, task_types) VALUES
('lmj_cuisinier', 'LMJ Cuisinier', 'human', 'Pool de cuisiniers pour restauration', ARRAY['restauration'], ARRAY['cuisine', 'restaurant', 'hospitality', 'terrain', 'humain'], 'mid', 15, 20, 'EUR', 'h', ARRAY['préparation de plats', 'gestion de cuisine'], ARRAY['préparation', 'cuisson', 'plonge'])
ON CONFLICT (slug) DO NOTHING;

-- Provider: Livreur
INSERT INTO providers (slug, name, type, description, domains, tags, price_level, pricing_min, pricing_max, pricing_currency, pricing_unit, specialties, task_types) VALUES
('lmj_livreur', 'LMJ Livreur', 'human', 'Pool de livreurs pour livraisons', ARRAY['logistique'], ARRAY['livraison', 'transport', 'logistique', 'terrain', 'humain'], 'low', 12, 14, 'EUR', 'h', ARRAY['livraison de colis', 'livraison de repas'], ARRAY['livraison', 'transport', 'chargement'])
ON CONFLICT (slug) DO NOTHING;

-- Provider: Manutentionnaire
INSERT INTO providers (slug, name, type, description, domains, tags, price_level, pricing_min, pricing_max, pricing_currency, pricing_unit, specialties, task_types) VALUES
('lmj_manutentionnaire', 'LMJ Manutentionnaire', 'human', 'Pool de manutentionnaires pour entrepôts', ARRAY['logistique'], ARRAY['entrepôt', 'manutention', 'logistique', 'terrain', 'humain'], 'low', 12, 14, 'EUR', 'h', ARRAY['chargement', 'déchargement', 'préparation de commandes'], ARRAY['manutention', 'chargement', 'inventaire'])
ON CONFLICT (slug) DO NOTHING;

-- Provider: Vendeur
INSERT INTO providers (slug, name, type, description, domains, tags, price_level, pricing_min, pricing_max, pricing_currency, pricing_unit, specialties, task_types) VALUES
('lmj_vendeur', 'LMJ Vendeur', 'human', 'Pool de vendeurs pour commerce', ARRAY['commerce'], ARRAY['vente', 'commerce', 'retail', 'terrain', 'humain'], 'low', 11, 13, 'EUR', 'h', ARRAY['vente', 'conseil client', 'mise en rayon'], ARRAY['vente', 'conseil', 'encaissement'])
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 3. RELATIONS CAPABILITY_PROVIDERS
-- =====================================================

-- Service Restaurant → Serveur
INSERT INTO capability_providers (capability_id, provider_id, strength)
SELECT c.id, p.id, 0.9
FROM capabilities c, providers p
WHERE c.slug = 'service_restaurant' AND p.slug = 'lmj_serveur'
ON CONFLICT DO NOTHING;

-- Cuisine Restaurant → Cuisinier
INSERT INTO capability_providers (capability_id, provider_id, strength)
SELECT c.id, p.id, 0.9
FROM capabilities c, providers p
WHERE c.slug = 'cuisine_restaurant' AND p.slug = 'lmj_cuisinier'
ON CONFLICT DO NOTHING;

-- Livraison → Livreur
INSERT INTO capability_providers (capability_id, provider_id, strength)
SELECT c.id, p.id, 0.9
FROM capabilities c, providers p
WHERE c.slug = 'livraison_transport' AND p.slug = 'lmj_livreur'
ON CONFLICT DO NOTHING;

-- Manutention → Manutentionnaire
INSERT INTO capability_providers (capability_id, provider_id, strength)
SELECT c.id, p.id, 0.9
FROM capabilities c, providers p
WHERE c.slug = 'manutention_entrepot' AND p.slug = 'lmj_manutentionnaire'
ON CONFLICT DO NOTHING;

-- Vente → Vendeur
INSERT INTO capability_providers (capability_id, provider_id, strength)
SELECT c.id, p.id, 0.9
FROM capabilities c, providers p
WHERE c.slug = 'vente_commerce' AND p.slug = 'lmj_vendeur'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. INTENTIONS pour métiers humains
-- =====================================================

INSERT INTO intentions (slug, title, description, tags, example_prompts) VALUES
('recruter_serveur', 'Recruter un serveur', 'Recherche d''un serveur pour restaurant', ARRAY['recrutement', 'restaurant', 'serveur'], ARRAY['Je cherche un serveur', 'Besoin d''un serveur pour ce week-end', 'Recherche serveuse']),
('recruter_cuisinier', 'Recruter un cuisinier', 'Recherche d''un cuisinier pour restaurant', ARRAY['recrutement', 'restaurant', 'cuisinier'], ARRAY['Je cherche un cuisinier', 'Besoin d''un cuisinier urgent', 'Recherche chef']),
('recruter_livreur', 'Recruter un livreur', 'Recherche d''un livreur pour livraisons', ARRAY['recrutement', 'livraison', 'transport'], ARRAY['Je cherche un livreur', 'Besoin d''un livreur', 'Recherche coursier'])
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 5. RELATIONS INTENTION_CAPABILITIES
-- =====================================================

-- Recruter serveur → Service restaurant
INSERT INTO intention_capabilities (intention_id, capability_id, priority)
SELECT i.id, c.id, 0.9
FROM intentions i, capabilities c
WHERE i.slug = 'recruter_serveur' AND c.slug = 'service_restaurant'
ON CONFLICT DO NOTHING;

-- Recruter cuisinier → Cuisine restaurant
INSERT INTO intention_capabilities (intention_id, capability_id, priority)
SELECT i.id, c.id, 0.9
FROM intentions i, capabilities c
WHERE i.slug = 'recruter_cuisinier' AND c.slug = 'cuisine_restaurant'
ON CONFLICT DO NOTHING;

-- Recruter livreur → Livraison transport
INSERT INTO intention_capabilities (intention_id, capability_id, priority)
SELECT i.id, c.id, 0.9
FROM intentions i, capabilities c
WHERE i.slug = 'recruter_livreur' AND c.slug = 'livraison_transport'
ON CONFLICT DO NOTHING;


