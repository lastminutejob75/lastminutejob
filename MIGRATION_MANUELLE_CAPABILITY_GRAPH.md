# 🚀 Migration Manuelle du Capability Graph - LastMinuteJob

## 📋 Configuration actuelle

- **Supabase LastMinuteJob** : `https://lsukxdglogtgfukdqqti.supabase.co`
- **ANON_KEY** : `sb_publishable_8lYvOVlfCNTdJaYB0SYfnw_5PapFvCO`

## ✅ Étapes de migration

### Étape 1 : Accéder au SQL Editor

1. Allez sur : https://supabase.com/dashboard/project/lsukxdglogtgfukdqqti/sql/new
2. Vous êtes maintenant dans le SQL Editor

### Étape 2 : Créer les tables (Migration 1)

1. **Ouvrez** le fichier : `supabase/migrations/20250102000000_create_capability_graph_lmj.sql`
2. **Copiez tout le contenu** (Ctrl+A, Ctrl+C)
3. **Collez** dans le SQL Editor Supabase
4. Cliquez sur **"Run"** (ou appuyez sur F5)
5. Attendez le message de succès : `Success. No rows returned`

**Cette migration crée toutes les tables nécessaires.**

### Étape 3 : Ajouter les données initiales (Migration 2)

1. **Ouvrez** le fichier : `supabase/migrations/20250102000001_seed_capability_graph_lmj.sql`
2. **Copiez tout le contenu**
3. **Collez** dans le SQL Editor Supabase (nouvelle requête)
4. Cliquez sur **"Run"**
5. Attendez le message de succès

**Cette migration ajoute les données de base (capabilities, providers, relations).**

### Étape 4 : Vérifier

Dans le SQL Editor, exécutez :

```sql
-- Vérifier les tables créées
SELECT 
  'capabilities' as table_name, COUNT(*) as count FROM capabilities
UNION ALL
SELECT 'providers', COUNT(*) FROM providers WHERE type = 'human'
UNION ALL
SELECT 'capability_providers', COUNT(*) FROM capability_providers
UNION ALL
SELECT 'intentions', COUNT(*) FROM intentions
UNION ALL
SELECT 'intention_capabilities', COUNT(*) FROM intention_capabilities;
```

**Résultat attendu** :
- capabilities : 10
- providers : 5
- capability_providers : 5
- intentions : 3
- intention_capabilities : 3

### Étape 5 : Vérifier avec le script

```bash
node scripts/check-capability-graph.js
```

**Résultat attendu** :
```
✅ Tables existantes: 5/5
✅ Le Capability Graph est complet!
```

## 📊 Contenu des migrations

### Migration 1 : Création des tables
- Tables principales (intentions, capabilities, providers, etc.)
- Indexes pour performance
- Politiques RLS (Row Level Security)
- Tables de relations enrichies

### Migration 2 : Données initiales
- 10 capabilities (restauration, logistique, commerce, BTP, etc.)
- 5 providers exemple (serveur, cuisinier, livreur, etc.)
- Relations entre capabilities et providers
- Intentions de base

## ⚠️ Important

- ✅ Tous les providers sont de type `"human"`
- ✅ Les tarifs sont en €/h
- ✅ Les données sont spécifiques à LastMinuteJob
- ✅ Séparé du Supabase d'UWi

## 🎯 Prochaines étapes après migration

1. ✅ Capability Graph créé
2. ⏳ Configurer les secrets Edge Functions
3. ⏳ Tester l'intégration LLM + Capability Graph
4. ⏳ Enrichir avec plus de providers selon vos besoins

---

**📝 Les fichiers SQL sont dans : `supabase/migrations/`**

