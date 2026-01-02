# Configuration des Variables d'Environnement sur Vercel

Pour que l'application fonctionne correctement sur Vercel, vous devez configurer les variables d'environnement suivantes:

## Étapes de Configuration

1. **Accédez aux paramètres de votre projet Vercel:**
   - Allez sur https://vercel.com/dashboard
   - Sélectionnez votre projet
   - Cliquez sur "Settings" (Paramètres)
   - Cliquez sur "Environment Variables" (Variables d'environnement)

2. **Ajoutez les variables suivantes:**

### Variables Supabase (OBLIGATOIRES)

```
VITE_SUPABASE_URL
```
Valeur: `https://dxslenzfyqqtxylotcmm.supabase.co`

```
VITE_SUPABASE_ANON_KEY
```
Valeur: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4c2xlbnpmeXFxdHh5bG90Y21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNjY5NjksImV4cCI6MjA3Nzg0Mjk2OX0.WdMVAT26M2pHfXqa2i4wmojv6dBAOfxa8yC9LOz55Ug`

### Variables Twilio (OPTIONNELLES)

```
VITE_TWILIO_ACCOUNT_SID
```
Valeur: `VOTRE_ACCOUNT_SID_TWILIO`

```
VITE_TWILIO_AUTH_TOKEN
```
Valeur: `VOTRE_AUTH_TOKEN_TWILIO`

```
VITE_TWILIO_PHONE_NUMBER
```
Valeur: `VOTRE_NUMERO_TWILIO`

### Variable Google OAuth (OPTIONNELLE)

```
VITE_GOOGLE_CLIENT_ID
```
Valeur: (Laissez vide si non utilisé)

3. **Sauvegardez et redéployez:**
   - Après avoir ajouté toutes les variables, cliquez sur "Save"
   - Redéployez votre application en allant dans l'onglet "Deployments"
   - Cliquez sur les trois points "..." du dernier déploiement
   - Sélectionnez "Redeploy"

## Vérification

Après le redéploiement, l'application devrait fonctionner correctement. Si vous rencontrez toujours des problèmes:

1. Vérifiez la console du navigateur pour voir les erreurs
2. Assurez-vous que toutes les variables commencent par `VITE_`
3. Vérifiez qu'il n'y a pas d'espaces avant ou après les valeurs

## Environnements

N'oubliez pas de configurer les variables pour tous les environnements:
- Production
- Preview
- Development
