# 🔒 Séparation des bases de données Supabase

## ✅ Configuration finale

### UWi (projet principal)
- **URL Supabase** : `https://gywhqtlebvvauxzmdavb.supabase.co`
- **Statut** : ✅ **GARDÉ** - Continue d'utiliser ce Supabase

### LastMinuteJob (projet restauré)
- **URL Supabase** : `https://[NOUVEAU_PROJECT_REF].supabase.co` 🆕
- **Statut** : ⚠️ **À CRÉER** - Nouveau Supabase à créer et configurer

## 🚀 Actions requises pour LastMinuteJob

### 1. Créer un nouveau projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet nommé `lastminutejob`
3. Notez la nouvelle URL et les clés

### 2. Migrer le Capability Graph

Le Capability Graph de LastMinuteJob (métiers humains uniquement) doit être migré vers le nouveau Supabase.

Voir `MIGRATION_NOUVEAU_SUPABASE.md` pour les détails.

### 3. Configurer les variables d'environnement

#### Développement local (`.env.local`)

```bash
# Nouveau Supabase LastMinuteJob
VITE_SUPABASE_URL=https://[NOUVEAU_PROJECT_REF].supabase.co
VITE_SUPABASE_ANON_KEY=[NOUVELLE_ANON_KEY]
```

#### Production (Vercel)

Mettre à jour dans Vercel Dashboard → Settings → Environment Variables :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

#### Edge Functions (Secrets Supabase)

Dans le Dashboard Supabase du nouveau projet → Edge Functions → Settings → Secrets :
- `LMJ_SUPABASE_URL` (ou `SUPABASE_URL`) : URL du nouveau projet
- `LMJ_SUPABASE_SERVICE_ROLE_KEY` (ou `SUPABASE_SERVICE_ROLE_KEY`) : SERVICE_ROLE_KEY du nouveau projet
- `OPENAI_API_KEY` : Clé OpenAI

## ⚠️ Vérifications de sécurité

Le code vérifie maintenant que :

1. **L'URL Supabase ne pointe PAS vers UWi** (`gywhqtlebvvauxzmdavb`)
2. **Les variables d'environnement sont configurées** (pas de fallback vers UWi)
3. **Les Edge Functions utilisent le bon Supabase** (via variables LMJ_*)

## 📋 Checklist

- [ ] Nouveau projet Supabase créé pour LastMinuteJob
- [ ] Capability Graph migré vers le nouveau Supabase
- [ ] Variables `.env.local` configurées avec le nouveau Supabase
- [ ] Variables Vercel mises à jour
- [ ] Secrets Edge Functions configurés
- [ ] Tests effectués avec le nouveau Supabase
- [ ] Vérification que l'ancien Supabase (UWi) n'est plus utilisé

## 🔍 Comment vérifier

```bash
# Vérifier que les variables pointent vers le nouveau Supabase
echo $VITE_SUPABASE_URL
# Ne doit PAS contenir "gywhqtlebvvauxzmdavb"

# Tester la connexion
node scripts/check-capability-graph.js
# Doit se connecter au nouveau Supabase
```

---

**✅ Une fois la migration terminée, UWi et LastMinuteJob seront complètement séparés.**
