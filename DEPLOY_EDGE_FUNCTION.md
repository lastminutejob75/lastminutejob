# 🚀 Déploiement de l'Edge Function `uwi-announce`

## ❌ Problème détecté

Le test de connexion montre que l'Edge Function n'est **pas déployée** :
```
Status HTTP: 404 Not Found
{"code":"NOT_FOUND","message":"Requested function was not found"}
```

## ✅ Solution : Déployer l'Edge Function

### Option 1 : Via Supabase CLI (Recommandé)

```bash
# 1. Installer Supabase CLI si pas déjà fait
npm install -g supabase

# 2. Se connecter à Supabase
supabase login

# 3. Lier le projet (remplacer PROJECT_ID par votre ID)
supabase link --project-ref gywhqtlebvvauxzmdavb

# 4. Déployer l'Edge Function
supabase functions deploy uwi-announce
```

### Option 2 : Via Supabase Dashboard

1. **Aller sur** : https://supabase.com/dashboard
2. **Sélectionner votre projet**
3. **Edge Functions** → **New Function**
4. **Nom** : `uwi-announce`
5. **Copier le contenu** de `supabase/functions/uwi-announce/index.ts`
6. **Déployer**

### Configuration de la clé OpenAI

**IMPORTANT** : Après le déploiement, configurer la clé API :

1. **Dashboard Supabase** → **Edge Functions** → **Settings** → **Secrets**
2. **Ajouter** :
   ```
   OPENAI_API_KEY=sk-votre-clé-api-openai
   ```
3. **Sauvegarder**

### Vérification

Après déploiement, relancer le test :
```bash
node test-llm-connection.js
```

Vous devriez voir :
```
✅ Réponse reçue!
🎉 CONNEXION LLM RÉUSSIE!
```

## 📝 Notes

- L'Edge Function doit être déployée sur le même projet Supabase que celui utilisé dans `VITE_SUPABASE_URL`
- La clé `OPENAI_API_KEY` doit être configurée comme **Secret** dans Supabase (pas dans `.env`)
- Le fallback simple fonctionnera même sans LLM, mais les annonces seront moins intelligentes

