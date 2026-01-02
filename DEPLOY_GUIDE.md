# 🚀 Guide de Déploiement Simple

## Problème résolu
Le fichier `admin.html` est maintenant dans le dossier `public/` et sera automatiquement inclus dans le build.

## Option 1 : Déploiement Vercel (RECOMMANDÉ)

### Via le Dashboard Vercel

1. **Connectez-vous** à [vercel.com](https://vercel.com)

2. **Cliquez sur "Add New Project"**

3. **Si pas encore sur GitHub** :
   ```bash
   # Depuis votre terminal local ou Bolt
   git init
   git add .
   git commit -m "Initial commit"
   ```
   Puis créez un nouveau repo sur GitHub et suivez les instructions

4. **Importez votre projet GitHub** dans Vercel

5. **Configuration automatique** :
   - Framework : Vite (détecté automatiquement)
   - Build Command : `npm run build`
   - Output Directory : `dist`
   - Install Command : `npm install`

6. **Variables d'environnement** (IMPORTANT) :
   ```
   VITE_SUPABASE_URL=https://wxxansemobnyvvdnhmyg.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4eGFuc2Vtb2JueXZ2ZG5obXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NjQ2NzksImV4cCI6MjA3NzA0MDY3OX0.CLsOgFLYR5xF91JeZZCWb_dD4YAuKVtfZ2vUJdj0_VE
   ```

7. **Cliquez sur "Deploy"**

8. **Attendez 2-3 minutes**

9. **Votre site est en ligne !** 🎉

### URLs disponibles après déploiement
- Application principale : `https://votre-projet.vercel.app/`
- Admin manager : `https://votre-projet.vercel.app/admin.html`

## Option 2 : Netlify

1. **Connectez-vous** à [netlify.com](https://netlify.com)
2. **Glissez-déposez** le dossier `dist/` dans Netlify Drop
3. **Ou connectez votre repo GitHub** et configurez :
   - Build command : `npm run build`
   - Publish directory : `dist`
4. **Ajoutez les variables d'environnement** dans Site Settings

## Option 3 : Depuis Bolt.new (Si vous êtes sur Bolt)

### Méthode A : Export vers GitHub puis Vercel

1. **Dans Bolt**, cliquez sur le bouton **"Push to GitHub"** (icône GitHub en haut)
2. Suivez les instructions pour créer un nouveau repo
3. Une fois sur GitHub, allez sur [vercel.com](https://vercel.com)
4. Importez votre repo GitHub
5. Ajoutez les variables d'environnement
6. Déployez

### Méthode B : Télécharger et déployer manuellement

1. **Dans Bolt**, cliquez sur **"Download Project"** ou le bouton de téléchargement
2. Extrayez le fichier ZIP sur votre ordinateur
3. Ouvrez un terminal dans le dossier extrait
4. Vérifiez que `admin.html` est dans `public/`
5. Installez les dépendances :
   ```bash
   npm install
   ```
6. Buildez le projet :
   ```bash
   npm run build
   ```
7. Le dossier `dist/` contient tout votre site
8. Glissez-déposez `dist/` sur Netlify Drop : [app.netlify.com/drop](https://app.netlify.com/drop)

## Vérification post-déploiement

✅ **Checklist** :
- [ ] Site accessible sur l'URL Vercel/Netlify
- [ ] Page d'accueil charge correctement
- [ ] Admin accessible sur `/admin.html`
- [ ] Création d'annonce fonctionne
- [ ] Verification email fonctionne
- [ ] Liste des annonces s'affiche

## Configuration Supabase Edge Functions

Les Edge Functions sont déjà déployées. Pour activer l'extraction AI avec OpenAI :

1. Allez sur [supabase.com](https://supabase.com/dashboard)
2. Ouvrez votre projet
3. Allez dans **Edge Functions** → **Settings**
4. Ajoutez un secret : `OPENAI_API_KEY` = `sk-...votre-clé`

## Problèmes courants

### 1. "Site shows blank page"
- Vérifiez que les variables d'environnement sont ajoutées
- Vérifiez la console du navigateur (F12)
- Les variables doivent commencer par `VITE_`

### 2. "Admin page not found"
- Vérifiez que `admin.html` est dans `public/` (pas à la racine)
- Rebuildez le projet : `npm run build`
- Le fichier doit apparaître dans `dist/admin.html`

### 3. "Database connection error"
- Vérifiez que `VITE_SUPABASE_URL` est correct
- Vérifiez que `VITE_SUPABASE_ANON_KEY` est correct
- Assurez-vous qu'il n'y a pas d'espaces avant/après les valeurs

### 4. "Build fails on Vercel"
- Vérifiez que `package.json` est complet
- Node version : doit être >= 18
- Vérifiez les logs de build sur Vercel

## Support

**Fichiers utiles** :
- `ADMIN_API.md` : Documentation API admin
- `DEPLOYMENT.md` : Guide de déploiement détaillé
- `README.md` : Documentation générale

**Vérifier les logs** :
- Console navigateur (F12)
- Logs Vercel (dans le dashboard)
- Logs Supabase (section Logs)

---

## 🎯 Quick Start (le plus rapide)

1. Push sur GitHub depuis Bolt
2. Import sur Vercel
3. Ajoutez les 2 variables d'environnement
4. Deploy
5. Ouvrez `/admin.html` pour créer votre compte admin

**Temps total : 5 minutes** ⚡
