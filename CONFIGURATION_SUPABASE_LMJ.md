# ✅ Configuration Supabase LastMinuteJob

## 📊 URLs Supabase

### UWi (projet principal)
- **URL** : `https://gywhqtlebvvauxzmdavb.supabase.co`
- **Statut** : ✅ Gardé pour UWi

### LastMinuteJob (projet restauré)
- **URL** : `https://lsukxdglogtgfukdqqti.supabase.co` 🆕
- **Project Ref** : `lsukxdglogtgfukdqqti`
- **Statut** : ✅ Nouveau Supabase configuré

## 🔑 Variables d'environnement requises

### Développement local (`.env.local`)

```bash
# Supabase LastMinuteJob
VITE_SUPABASE_URL=https://lsukxdglogtgfukdqqti.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_8lYvOVlfCNTdJaYB0SYfnw_5PapFvCO
```

### Production (Vercel)

Dans Vercel Dashboard → Settings → Environment Variables :

```
VITE_SUPABASE_URL=https://lsukxdglogtgfukdqqti.supabase.co
VITE_SUPABASE_ANON_KEY=[VOTRE_ANON_KEY_LMJ]
```

### Edge Functions (Secrets Supabase)

Dans le Dashboard Supabase LastMinuteJob → Edge Functions → Settings → Secrets :

```
LMJ_SUPABASE_URL=https://lsukxdglogtgfukdqqti.supabase.co
LMJ_SUPABASE_SERVICE_ROLE_KEY=[VOTRE_SERVICE_ROLE_KEY_LMJ]
OPENAI_API_KEY=[VOTRE_CLE_OPENAI]
```

**OU** (si les variables LMJ_ ne sont pas définies) :

```
SUPABASE_URL=https://lsukxdglogtgfukdqqti.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[VOTRE_SERVICE_ROLE_KEY_LMJ]
OPENAI_API_KEY=[VOTRE_CLE_OPENAI]
```

## 🔍 Où trouver les clés

1. Allez sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez le projet **LastMinuteJob** (`lsukxdglogtgfukdqqti`)
3. Allez dans **Settings** → **API**
4. Vous trouverez :
   - **Project URL** : `https://lsukxdglogtgfukdqqti.supabase.co`
   - **anon public** key : Pour `VITE_SUPABASE_ANON_KEY`
   - **service_role secret** key : Pour `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Ne jamais exposer côté client)

## ✅ Vérification

Pour vérifier que la configuration est correcte :

```bash
# Vérifier que l'URL est correcte
echo $VITE_SUPABASE_URL
# Doit afficher : https://lsukxdglogtgfukdqqti.supabase.co

# Tester la connexion
node scripts/check-capability-graph.js
```

## ⚠️ Important

- ✅ **UWi continue d'utiliser** : `gywhqtlebvvauxzmdavb.supabase.co`
- ✅ **LastMinuteJob utilise maintenant** : `lsukxdglogtgfukdqqti.supabase.co`
- ✅ **Les deux projets sont maintenant complètement séparés**

## 📋 Prochaines étapes

1. ✅ URL Supabase configurée : `lsukxdglogtgfukdqqti.supabase.co`
2. ⏳ Configurer `VITE_SUPABASE_ANON_KEY` dans `.env.local`
3. ⏳ Migrer le Capability Graph vers le nouveau Supabase
4. ⏳ Configurer les secrets Edge Functions
5. ⏳ Tester l'intégration

