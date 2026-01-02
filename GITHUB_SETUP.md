# 🚀 Instructions pour publier sur GitHub

## Étape 1 : Créer un nouveau dépôt sur GitHub

1. Allez sur [GitHub.com](https://github.com)
2. Cliquez sur le bouton **"New"** ou **"+"** → **"New repository"**
3. Configurez le dépôt :
   - **Nom** : `lastminutejob` (ou le nom de votre choix)
   - **Description** : "Plateforme de recrutement rapide pour emplois temporaires"
   - **Visibilité** : Privé ou Public (selon votre préférence)
   - **NE PAS** cocher "Initialize with README" (le projet en a déjà un)
4. Cliquez sur **"Create repository"**

## Étape 2 : Connecter le dépôt local à GitHub

Une fois le dépôt créé, GitHub vous donnera des instructions. Exécutez ces commandes dans le terminal :

```bash
cd /Users/actera/Downloads/lastminutejob-restored

# Ajouter le remote GitHub (votre username: lastminutejob75)
git remote add origin https://github.com/lastminutejob75/lastminutejob.git

# Ou si vous utilisez SSH :
# git remote add origin git@github.com:lastminutejob75/lastminutejob.git

# Vérifier que le remote est bien configuré
git remote -v
```

## Étape 3 : Pousser le code sur GitHub

```bash
# Renommer la branche principale en 'main' (si nécessaire)
git branch -M main

# Pousser le code sur GitHub
git push -u origin main
```

## Étape 4 : Vérification

1. Rafraîchissez la page de votre dépôt sur GitHub
2. Vous devriez voir tous les fichiers du projet
3. Le README.md devrait s'afficher automatiquement

## 🔐 Configuration des secrets (optionnel)

Si vous souhaitez utiliser GitHub Actions ou protéger certaines informations :

1. Allez dans **Settings** → **Secrets and variables** → **Actions**
2. Ajoutez les secrets nécessaires :
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`

## 📝 Commandes Git utiles

```bash
# Voir le statut des fichiers
git status

# Ajouter des fichiers modifiés
git add .

# Créer un commit
git commit -m "Description des changements"

# Pousser les changements
git push

# Voir l'historique des commits
git log

# Créer une nouvelle branche
git checkout -b nom-de-la-branche

# Revenir à la branche main
git checkout main
```

## ⚠️ Important

- **Ne jamais** commiter le fichier `.env.local` (déjà dans `.gitignore`)
- **Ne jamais** commiter les `node_modules` (déjà dans `.gitignore`)
- Vérifiez toujours avec `git status` avant de commiter

## 🆘 En cas de problème

Si vous avez des erreurs lors du push :

1. **Erreur d'authentification** :
   - Configurez votre authentification GitHub : https://docs.github.com/en/authentication
   - Ou utilisez GitHub Desktop pour une interface graphique

2. **Conflits** :
   - Si le dépôt GitHub a déjà des fichiers, utilisez :
   ```bash
   git pull origin main --allow-unrelated-histories
   git push -u origin main
   ```

3. **Changer l'URL du remote** :
   ```bash
   git remote set-url origin https://github.com/lastminutejob75/nouveau-nom.git
   ```

---

✅ Une fois ces étapes terminées, votre projet LastMinuteJob sera disponible sur GitHub !

