# Configuration des Variables d'Environnement

## 🚀 Démarrage Rapide

1. **Copiez le fichier d'exemple** :
   ```bash
   cp .env.example .env.local
   ```

2. **Remplissez les valeurs** avec vos clés Supabase

3. **C'est tout !** L'application utilisera automatiquement ces variables

## 📋 Variables Obligatoires

### Frontend (Vite)

Ces variables doivent être définies dans `.env.local` pour le développement local :

| Variable | Description | Où la trouver |
|----------|-------------|---------------|
| `VITE_SUPABASE_URL` | URL de votre projet Supabase | Dashboard Supabase > Settings > API > Project URL |
| `VITE_SUPABASE_ANON_KEY` | Clé anonyme (publique) | Dashboard Supabase > Settings > API > anon public key |

### Backend (Supabase Edge Functions)

Ces variables sont **automatiquement configurées** par Supabase. Vous n'avez rien à faire !

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Disponible automatiquement dans les Edge Functions |
| `SUPABASE_SERVICE_ROLE_KEY` | Disponible automatiquement dans les Edge Functions |
| `SUPABASE_ANON_KEY` | Disponible automatiquement dans les Edge Functions |

## 🔐 Variables Optionnelles

### OpenAI API Key

Si vous voulez utiliser l'extraction OpenAI dans `uwi-extract` :

1. Allez dans **Supabase Dashboard** > **Edge Functions** > **Settings**
2. Cliquez sur **Secrets**
3. Ajoutez : `OPENAI_API_KEY=sk-votre-clé`

### Twilio (SMS)

Si vous voulez utiliser Twilio pour l'envoi de SMS :

1. Allez dans **Supabase Dashboard** > **Edge Functions** > **Settings**
2. Cliquez sur **Secrets**
3. Ajoutez :
   - `TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - `TWILIO_AUTH_TOKEN=votre-auth-token`
   - `TWILIO_PHONE_NUMBER=+33612345678`

## 🌍 Environnements

### Développement Local

Utilisez `.env.local` (ignoré par Git) :
```env
VITE_SUPABASE_URL=https://votre-projet-dev.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-dev
```

### Production (Vercel)

Configurez les variables dans **Vercel Dashboard** > **Settings** > **Environment Variables** :

1. `VITE_SUPABASE_URL` → Production
2. `VITE_SUPABASE_ANON_KEY` → Production

## ✅ Vérification

Pour vérifier que vos variables sont bien configurées :

```bash
# Vérifier les variables locales
npm run dev
# L'application devrait se lancer sans erreur

# Vérifier les types TypeScript
npm run typecheck
```

## ⚠️ Sécurité

- ❌ **NE COMMITEZ JAMAIS** `.env.local` ou `.env` dans Git
- ✅ Le fichier `.env.example` est sûr à commiter (pas de vraies clés)
- ✅ Utilisez des clés différentes pour dev/prod
- ✅ Régénérez les clés si elles sont compromises

## 🆘 Dépannage

### Erreur : "Missing Supabase environment variables"

**Solution** : Vérifiez que `.env.local` existe et contient les bonnes variables.

### Erreur : "Invalid API key"

**Solution** : Vérifiez que vous utilisez la bonne clé (anon key, pas service role key).

### Les Edge Functions ne fonctionnent pas

**Solution** : Vérifiez que les secrets sont bien configurés dans Supabase Dashboard.

