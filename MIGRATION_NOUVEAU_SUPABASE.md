# 🆕 Migration vers un nouveau Supabase pour LastMinuteJob

## 📋 Situation actuelle

- **UWi** : Garde `https://gywhqtlebvvauxzmdavb.supabase.co` ✅
- **LastMinuteJob** : Doit migrer vers un **nouveau Supabase** 🆕

## 🚀 Étapes de migration

### Étape 1 : Créer un nouveau projet Supabase pour LastMinuteJob

1. Allez sur [supabase.com](https://supabase.com)
2. Cliquez sur **"New Project"**
3. Configurez le projet :
   - **Name** : `lastminutejob` (ou `lmj-production`)
   - **Database Password** : Choisissez un mot de passe fort
   - **Region** : Choisissez la région la plus proche (ex: Europe West)
4. Cliquez sur **"Create new project"**
5. Attendez que le projet soit créé (2-3 minutes)

### Étape 2 : Noter les nouvelles informations

Une fois le projet créé, notez :

- **Project URL** : `https://[NOUVEAU_PROJECT_REF].supabase.co`
- **Project Ref** : Le code dans l'URL (ex: `abc123xyz`)
- **ANON KEY** : Trouvable dans Settings → API → `anon` `public` key
- **SERVICE_ROLE_KEY** : Trouvable dans Settings → API → `service_role` `secret` key

### Étape 3 : Migrer le Capability Graph vers le nouveau Supabase

Le Capability Graph de LastMinuteJob doit être migré vers le nouveau projet.

#### Option A : Exporter depuis l'ancien Supabase et importer dans le nouveau

1. **Dans l'ancien Supabase** (`gywhqtlebvvauxzmdavb`) :
   - Allez dans SQL Editor
   - Exécutez pour exporter les données :
   ```sql
   -- Exporter les tables du Capability Graph
   COPY (SELECT * FROM capabilities WHERE type = 'human' OR type IS NULL) TO STDOUT WITH CSV HEADER;
   COPY (SELECT * FROM providers WHERE type = 'human') TO STDOUT WITH CSV HEADER;
   COPY (SELECT * FROM capability_providers) TO STDOUT WITH CSV HEADER;
   ```

2. **Dans le nouveau Supabase** :
   - Créez d'abord les tables (voir migrations SQL)
   - Importez les données

#### Option B : Recréer le Capability Graph spécifique LastMinuteJob

Puisque LastMinuteJob ne concerne que les métiers humains, vous pouvez créer un Capability Graph simplifié :

1. **Créer les tables** dans le nouveau Supabase
2. **Ajouter uniquement les providers "human"** pertinents pour LastMinuteJob
3. **Créer les capabilities** pour les métiers terrain

### Étape 4 : Mettre à jour les variables d'environnement

#### Dans `.env.local` (développement local)

```bash
# Ancien (à remplacer)
# VITE_SUPABASE_URL=https://gywhqtlebvvauxzmdavb.supabase.co

# Nouveau Supabase LastMinuteJob
VITE_SUPABASE_URL=https://[NOUVEAU_PROJECT_REF].supabase.co
VITE_SUPABASE_ANON_KEY=[NOUVELLE_ANON_KEY]
```

#### Dans Vercel (production)

1. Allez sur Vercel Dashboard → Votre projet LastMinuteJob
2. Settings → Environment Variables
3. Mettez à jour :
   - `VITE_SUPABASE_URL` → Nouvelle URL
   - `VITE_SUPABASE_ANON_KEY` → Nouvelle ANON_KEY

#### Dans Supabase Edge Functions (secrets)

1. Allez sur Supabase Dashboard → Edge Functions → Settings → Secrets
2. Mettez à jour :
   - `LMJ_SUPABASE_URL` → Nouvelle URL (ou `SUPABASE_URL`)
   - `LMJ_SUPABASE_SERVICE_ROLE_KEY` → Nouvelle SERVICE_ROLE_KEY (ou `SUPABASE_SERVICE_ROLE_KEY`)

### Étape 5 : Mettre à jour le code

Le code de LastMinuteJob doit pointer vers le nouveau Supabase :

1. **`src/lib/supabaseClient.ts`** : Mettre à jour le fallback URL
2. **Scripts de test** : Mettre à jour les URLs par défaut
3. **Documentation** : Mettre à jour toutes les références

### Étape 6 : Vérifier la migration

```bash
# Vérifier que le nouveau Supabase est utilisé
node scripts/check-capability-graph.js

# Tester l'intégration
node scripts/test-capability-graph-integration.js
```

## 📝 Checklist de migration

- [ ] Nouveau projet Supabase créé
- [ ] Capability Graph migré vers le nouveau Supabase
- [ ] Variables `.env.local` mises à jour
- [ ] Variables Vercel mises à jour
- [ ] Secrets Supabase Edge Functions mis à jour
- [ ] Code mis à jour (fallback URLs)
- [ ] Tests effectués et validés
- [ ] Documentation mise à jour

## ⚠️ Important

- **UWi continue d'utiliser** : `https://gywhqtlebvvauxzmdavb.supabase.co`
- **LastMinuteJob utilise maintenant** : `https://[NOUVEAU_PROJECT_REF].supabase.co`
- **Les deux projets sont maintenant complètement séparés** ✅

## 🔍 Vérification

Pour vérifier que tout fonctionne :

1. **Vérifier l'URL utilisée** :
   ```bash
   # Dans LastMinuteJob
   echo $VITE_SUPABASE_URL
   # Doit afficher la nouvelle URL, pas gywhqtlebvvauxzmdavb
   ```

2. **Tester la connexion** :
   ```bash
   node scripts/check-capability-graph.js
   # Doit se connecter au nouveau Supabase
   ```

3. **Vérifier les données** :
   - Le Capability Graph doit être présent dans le nouveau Supabase
   - Les providers doivent être de type "human" uniquement

