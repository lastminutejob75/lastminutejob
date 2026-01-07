# 🔍 Comparaison des URLs Supabase : UWi vs LastMinuteJob

## 📊 URLs Supabase trouvées

### LastMinuteJob (projet restauré)
- **URL** : `https://gywhqtlebvvauxzmdavb.supabase.co`
- **Project Ref** : `gywhqtlebvvauxzmdavb`
- **Usage** : Projet principal LastMinuteJob

### UWi (projet principal)
D'après les fichiers de configuration du projet UWi (`project 8`), plusieurs URLs apparaissent :

1. **URL principale trouvée** : `https://gywhqtlebvvauxzmdavb.supabase.co`
   - Utilisée dans : `CONFIGURER_VARIABLES_VERCEL.md`, `DEPANNAGE_DEPLOIEMENT.md`, `scripts/checkCacheStatus.ts`
   - **⚠️ ATTENTION** : C'est la même URL que LastMinuteJob !

2. **Autres URLs trouvées dans les archives** :
   - `https://wxxansemobnyvvdnhmyg.supabase.co` (dans `archive_lmj_uwi_legacy`)
   - `https://dxslenzfyqqtxylotcmm.supabase.co` (dans `archive_lmj_uwi_legacy`)

## ✅ Configuration actuelle

**Les deux projets utilisent actuellement la même URL Supabase, mais cela va changer :**

- **UWi** : `https://gywhqtlebvvauxzmdavb.supabase.co` ✅ **À GARDER** (projet principal)
- **LastMinuteJob** : `https://gywhqtlebvvauxzmdavb.supabase.co` ⚠️ **À REMPLACER** (utilise actuellement celui d'UWi)

**📋 Action requise : Créer un nouveau Supabase pour LastMinuteJob**

## 🔧 Solution recommandée

### Option 1 : Vérifier l'URL réelle d'UWi

Pour connaître l'URL Supabase réelle d'UWi, vérifiez :

1. **Dans le projet UWi** :
   ```bash
   cd "/Users/actera/Downloads/project 8"
   cat .env.local | grep SUPABASE_URL
   ```

2. **Ou dans Vercel** :
   - Allez sur le dashboard Vercel du projet UWi
   - Settings → Environment Variables
   - Vérifiez `NEXT_PUBLIC_SUPABASE_URL` ou `SUPABASE_URL`

### Option 2 : Créer un nouveau projet Supabase pour UWi

Si les deux projets utilisent effectivement le même Supabase, il faut :

1. **Créer un nouveau projet Supabase** pour UWi
2. **Migrer les données** du Capability Graph vers le nouveau projet
3. **Mettre à jour les variables d'environnement** d'UWi

### Option 3 : Utiliser des variables d'environnement distinctes

Si vous voulez garder le même Supabase mais séparer les données :

1. **Créer des schémas séparés** dans le même Supabase :
   - Schéma `lmj` pour LastMinuteJob
   - Schéma `uwi` pour UWi

2. **Adapter le code** pour utiliser les bons schémas

## 📝 URLs trouvées dans les archives

Dans `archive_lmj_uwi_legacy`, plusieurs URLs différentes apparaissent :

| URL | Fichier | Contexte |
|-----|---------|----------|
| `gywhqtlebvvauxzmdavb.supabase.co` | Plusieurs fichiers | LastMinuteJob |
| `wxxansemobnyvvdnhmyg.supabase.co` | `test-resend.html`, `DEBUGGING.md` | Ancien projet ? |
| `dxslenzfyqqtxylotcmm.supabase.co` | `test-publish.html`, `VERCEL_ENV_SETUP.md` | Ancien projet ? |

## ✅ Action immédiate recommandée

1. **Vérifier l'URL Supabase réelle d'UWi** :
   ```bash
   # Dans le projet UWi
   grep -r "SUPABASE_URL" .env.local 2>/dev/null || echo "Fichier .env.local non trouvé"
   ```

2. **Si c'est la même URL** :
   - ⚠️ **CRITIQUE** : Les deux projets partagent la même base de données
   - Il faut créer un nouveau Supabase pour l'un des deux projets
   - Ou utiliser des schémas séparés

3. **Si ce sont des URLs différentes** :
   - ✅ Tout est OK
   - Mettre à jour la documentation pour clarifier

## 🔍 Comment vérifier

### Dans LastMinuteJob
```bash
cd /Users/actera/Downloads/lastminutejob-restored
echo "LastMinuteJob Supabase:"
grep -h "supabase.co" src/lib/supabaseClient.ts | head -1
```

### Dans UWi
```bash
cd /Users/actera/Downloads/project\ 8
echo "UWi Supabase:"
# Vérifier .env.local si disponible
# Ou vérifier les variables Vercel
```

## 📋 Résumé

| Projet | URL Supabase | Statut |
|--------|--------------|--------|
| **LastMinuteJob** | `https://gywhqtlebvvauxzmdavb.supabase.co` | ✅ Confirmé |
| **UWi** | `https://gywhqtlebvvauxzmdavb.supabase.co` | ✅ Confirmé |

**🚨 PROBLÈME : Les deux projets partagent actuellement la même base de données !**

## 🔧 Solution : Créer un nouveau Supabase pour LastMinuteJob

### Plan d'action

1. **✅ GARDER** le Supabase actuel (`gywhqtlebvvauxzmdavb`) pour **UWi**
2. **🆕 CRÉER** un nouveau projet Supabase pour **LastMinuteJob**
3. **📦 MIGRER** le Capability Graph de LastMinuteJob vers le nouveau Supabase
4. **⚙️ METTRE À JOUR** les variables d'environnement de LastMinuteJob

### Étapes détaillées

#### Étape 1 : Créer un nouveau projet Supabase pour LastMinuteJob

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Nom du projet : `lastminutejob` (ou similaire)
4. Notez la nouvelle URL : `https://[NOUVEAU_PROJECT_REF].supabase.co`
5. Notez la nouvelle `ANON_KEY` et `SERVICE_ROLE_KEY`

#### Étape 2 : Migrer le Capability Graph vers le nouveau Supabase

Le Capability Graph de LastMinuteJob doit être migré vers le nouveau projet :

```sql
-- Dans le nouveau Supabase LastMinuteJob
-- Exécutez les migrations du Capability Graph
-- (tables: capabilities, providers, capability_providers, intentions, etc.)
```

#### Étape 3 : Mettre à jour les variables d'environnement

Dans LastMinuteJob, mettre à jour :
- `.env.local` (développement local)
- Variables Vercel (production)
- Secrets Supabase Edge Functions

