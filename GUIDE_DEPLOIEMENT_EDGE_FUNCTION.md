# 🚀 Guide de Déploiement - Edge Function `uwi-announce`

## ✅ Prérequis vérifiés

- ✅ Supabase CLI installé (via npx)
- ✅ Code de l'Edge Function présent dans `supabase/functions/uwi-announce/`

## 📋 Étapes de déploiement

### Étape 1 : Connexion à Supabase

Ouvrez votre terminal et exécutez :

```bash
cd "/Users/actera/Downloads/project 8"
npx supabase login
```

Cela va :
- Ouvrir votre navigateur
- Vous demander de vous connecter à Supabase
- Autoriser l'accès CLI

**⏸️ Attendez que cette étape soit terminée avant de continuer**

---

### Étape 2 : Lier le projet Supabase

Une fois connecté, liez votre projet :

```bash
npx supabase link --project-ref gywhqtlebvvauxzmdavb
```

**Note** : Si vous avez un autre projet Supabase, remplacez `gywhqtlebvvauxzmdavb` par votre project ref.

Vous pouvez trouver votre project ref dans :
- Dashboard Supabase → Settings → General → Reference ID

---

### Étape 3 : Déployer l'Edge Function

Déployez la fonction `uwi-announce` :

```bash
npx supabase functions deploy uwi-announce
```

Cela va :
- Compiler et déployer l'Edge Function
- Afficher l'URL de la fonction déployée

**⏸️ Attendez que le déploiement soit terminé**

---

### Étape 4 : Configurer la clé OpenAI

**IMPORTANT** : Sans cette étape, l'Edge Function ne pourra pas appeler OpenAI.

1. **Allez sur** : https://supabase.com/dashboard
2. **Sélectionnez votre projet** (celui avec le ref `gywhqtlebvvauxzmdavb`)
3. **Edge Functions** → **Settings** → **Secrets**
4. **Cliquez sur "Add new secret"**
5. **Nom** : `OPENAI_API_KEY`
6. **Valeur** : `sk-votre-clé-api-openai` (remplacez par votre vraie clé)
7. **Sauvegarder**

**Où trouver votre clé OpenAI ?**
- https://platform.openai.com/api-keys
- Créez une nouvelle clé si nécessaire

---

### Étape 5 : Vérifier le déploiement

Testez la connexion :

```bash
node test-llm-connection.js
```

**Résultat attendu** :
```
✅ Réponse reçue!
🎉 CONNEXION LLM RÉUSSIE!
```

Si vous voyez cela, **tout fonctionne !** 🎉

---

## 🔍 Dépannage

### Erreur : "Function not found"
- Vérifiez que le déploiement s'est bien terminé
- Vérifiez que vous êtes sur le bon projet Supabase

### Erreur : "OPENAI_API_KEY not configured"
- Vérifiez que vous avez bien ajouté le secret dans Supabase Dashboard
- Le nom doit être exactement : `OPENAI_API_KEY` (en majuscules)

### Erreur : "Authentication failed"
- Relancez `npx supabase login`
- Vérifiez que vous avez les permissions sur le projet

---

## 📝 Commandes rapides

```bash
# Connexion
npx supabase login

# Lier le projet
npx supabase link --project-ref gywhqtlebvvauxzmdavb

# Déployer
npx supabase functions deploy uwi-announce

# Tester
node test-llm-connection.js
```

---

## ✅ Checklist finale

- [ ] Connecté à Supabase (`npx supabase login`)
- [ ] Projet lié (`npx supabase link`)
- [ ] Edge Function déployée (`npx supabase functions deploy`)
- [ ] Clé OpenAI configurée dans Supabase Dashboard
- [ ] Test réussi (`node test-llm-connection.js`)

Une fois toutes les cases cochées, votre LLM est opérationnel ! 🚀

