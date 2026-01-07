# 📦 Guide de Migration du Capability Graph pour LastMinuteJob

## 🎯 Objectif

Créer le Capability Graph dans le nouveau Supabase LastMinuteJob (`lsukxdglogtgfukdqqti`) avec uniquement les métiers humains.

## 📋 Prérequis

- ✅ Nouveau Supabase créé : `https://lsukxdglogtgfukdqqti.supabase.co`
- ✅ ANON_KEY configurée : `sb_publishable_8lYvOVlfCNTdJaYB0SYfnw_5PapFvCO`
- ✅ SERVICE_ROLE_KEY disponible (pour les Edge Functions)

## 🚀 Étapes de migration

### Étape 1 : Accéder au SQL Editor

1. Allez sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez le projet **LastMinuteJob** (`lsukxdglogtgfukdqqti`)
3. Allez dans **SQL Editor** → **New Query**

### Étape 2 : Exécuter la migration de création des tables

1. Ouvrez le fichier : `supabase/migrations/20250102000000_create_capability_graph_lmj.sql`
2. **Copiez tout le contenu** du fichier
3. **Collez** dans le SQL Editor Supabase
4. Cliquez sur **"Run"** (ou F5)
5. Attendez la confirmation de succès

Cette migration crée :
- ✅ Table `intentions`
- ✅ Table `capabilities`
- ✅ Table `providers` (avec colonnes pour métiers humains)
- ✅ Table `capability_providers`
- ✅ Table `intention_capabilities`
- ✅ Tables de relations enrichies (prérequis, compléments, alternatives)
- ✅ Indexes et politiques RLS

### Étape 3 : Exécuter le seed (données initiales)

1. Ouvrez le fichier : `supabase/migrations/20250102000001_seed_capability_graph_lmj.sql`
2. **Copiez tout le contenu** du fichier
3. **Collez** dans le SQL Editor Supabase
4. Cliquez sur **"Run"**
5. Attendez la confirmation de succès

Ce seed ajoute :
- ✅ 10 capabilities de base (restauration, logistique, commerce, BTP, etc.)
- ✅ 5 providers exemple (serveur, cuisinier, livreur, manutentionnaire, vendeur)
- ✅ Relations capability_providers
- ✅ 3 intentions de base
- ✅ Relations intention_capabilities

### Étape 4 : Vérifier la migration

```bash
node scripts/check-capability-graph.js
```

**Résultat attendu** :
```
✅ Tables existantes: 5/5
✅ capabilities: X enregistrements
✅ providers: X enregistrements
✅ capability_providers: X enregistrements
✅ intentions: X enregistrements
✅ intention_capabilities: X enregistrements
```

## 📊 Données créées

### Capabilities (10)
- `recrutement_terrain` : Recrutement Terrain
- `service_restaurant` : Service Restaurant
- `cuisine_restaurant` : Cuisine Restaurant
- `livraison_transport` : Livraison et Transport
- `manutention_entrepot` : Manutention Entrepôt
- `vente_commerce` : Vente et Commerce
- `btp_construction` : BTP et Construction
- `nettoyage_entretien` : Nettoyage et Entretien
- `securite_surveillance` : Sécurité et Surveillance
- `evenementiel` : Événementiel

### Providers (5 exemples)
- `lmj_serveur` : LMJ Serveur (12-15€/h)
- `lmj_cuisinier` : LMJ Cuisinier (15-20€/h)
- `lmj_livreur` : LMJ Livreur (12-14€/h)
- `lmj_manutentionnaire` : LMJ Manutentionnaire (12-14€/h)
- `lmj_vendeur` : LMJ Vendeur (11-13€/h)

### Intentions (3)
- `recruter_serveur` : Recruter un serveur
- `recruter_cuisinier` : Recruter un cuisinier
- `recruter_livreur` : Recruter un livreur

## 🔍 Vérification manuelle

Dans le SQL Editor Supabase, exécutez :

```sql
-- Vérifier les capabilities
SELECT COUNT(*) FROM capabilities;
-- Doit retourner 10

-- Vérifier les providers (uniquement type "human")
SELECT COUNT(*) FROM providers WHERE type = 'human';
-- Doit retourner 5

-- Vérifier les relations
SELECT COUNT(*) FROM capability_providers;
-- Doit retourner 5

-- Vérifier les intentions
SELECT COUNT(*) FROM intentions;
-- Doit retourner 3
```

## 📝 Enrichir le Capability Graph

Une fois la migration de base effectuée, vous pouvez enrichir le Capability Graph :

1. **Ajouter plus de providers** via SQL ou l'interface Supabase
2. **Ajouter plus de capabilities** pour d'autres métiers
3. **Créer plus de relations** entre capabilities et providers

## ⚠️ Notes importantes

- ✅ **Tous les providers** doivent être de type `"human"`
- ✅ **Les tarifs** sont en €/h (pricing_unit = 'h')
- ✅ **Les données** sont spécifiques à LastMinuteJob
- ✅ **Séparé** du Capability Graph d'UWi

## 🆘 Dépannage

### Erreur "table already exists"

Si une table existe déjà, la migration utilise `CREATE TABLE IF NOT EXISTS`, donc c'est normal.

### Erreur "permission denied"

Vérifiez que vous utilisez bien le SQL Editor avec les bonnes permissions, ou utilisez la SERVICE_ROLE_KEY.

### Tables créées mais vides

Exécutez le seed (`20250102000001_seed_capability_graph_lmj.sql`) pour ajouter les données initiales.

---

**✅ Une fois la migration terminée, le Capability Graph sera prêt pour LastMinuteJob !**

