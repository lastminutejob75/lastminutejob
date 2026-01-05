# Deployment Guide - LastMinuteJob

## Quick Start

Your application is now ready to deploy! Follow these steps:

## 1. Vercel Deployment (Recommended)

### A. Using Vercel CLI (Fastest)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (first time)
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (Select your account)
# - Link to existing project? No
# - Project name? (Press enter for default or type a name)
# - Directory? ./ (Press enter)
# - Override settings? No

# After initial setup, configure environment variables:
vercel env add VITE_SUPABASE_URL production
# Paste: https://wxxansemobnyvvdnhmyg.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Paste your Supabase anon key

# Deploy to production
vercel --prod
```

### B. Using Vercel Dashboard (Easiest)

1. **Push to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to https://vercel.com/new
   - Click "Import Project"
   - Select your GitHub repository
   - Configure:
     - Framework Preset: **Vite**
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

3. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add:
     ```
     VITE_SUPABASE_URL = https://wxxansemobnyvvdnhmyg.supabase.co
     VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4eGFuc2Vtb2JueXZ2ZG5obXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NjQ2NzksImV4cCI6MjA3NzA0MDY3OX0.CLsOgFLYR5xF91JeZZCWb_dD4YAuKVtfZ2vUJdj0_VE
     ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at: `https://your-project.vercel.app`

## 2. Alternative Platforms

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod

# When prompted:
# - Build command: npm run build
# - Publish directory: dist
```

Add environment variables in Netlify Dashboard under Site Settings > Environment Variables.

### AWS Amplify

1. Go to AWS Amplify Console
2. Connect your repository
3. Build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```
4. Add environment variables in Amplify Console

## 3. Environment Variables

Your application requires these environment variables:

```env
VITE_SUPABASE_URL=https://wxxansemobnyvvdnhmyg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4eGFuc2Vtb2JueXZ2ZG5obXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NjQ2NzksImV4cCI6MjA3NzA0MDY3OX0.CLsOgFLYR5xF91JeZZCWb_dD4YAuKVtfZ2vUJdj0_VE
```

## 4. Admin Manager Access

### Première connexion admin

1. **Ouvrez** : `https://votre-domaine.com/admin.html`

2. **Premier compte admin** (aucune authentification requise) :
   - Email : `admin@lastminutejob.pro`
   - Mot de passe : minimum 6 caractères
   - Cliquez sur "S'inscrire"

3. **Admins suivants** :
   - Doivent être créés par un admin connecté
   - Même interface, mais nécessite une session active

### Fonctionnalités Admin

- ✅ Voir toutes les annonces (pending/approved/rejected)
- ✅ Approuver les annonces
- ✅ Rejeter les annonces
- ✅ Supprimer définitivement
- ✅ Multi-admin support

**Note** : Le fichier `admin.html` est automatiquement déployé avec l'application.

## 5. Post-Deployment Checklist

- [ ] Application loads without errors
- [ ] Can create new job postings
- [ ] Email verification works
- [ ] Job listings are visible
- [ ] Admin manager accessible at `/admin.html`
- [ ] First admin account created successfully
- [ ] Search functionality works
- [ ] Social sharing buttons work
- [ ] Mobile responsive design displays correctly

## 6. Custom Domain (Optional)

### On Vercel:
1. Go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Configure DNS records as instructed

## 7. Monitoring

- **Vercel Analytics**: Automatically enabled
- **Supabase Dashboard**: Monitor database usage and edge function logs
- Check browser console for any client-side errors

## Troubleshooting

### Build Fails
- Verify all dependencies are in package.json
- Check Node.js version compatibility
- Review build logs for specific errors

### Environment Variables Not Working
- Ensure variables start with `VITE_` prefix
- Redeploy after adding/changing environment variables
- Clear cache and rebuild

### Database Connection Issues
- Verify Supabase URL and anon key are correct
- Check Supabase project is active
- Verify RLS policies are configured correctly

## Support

For issues or questions:
1. Check browser console for errors
2. Review Vercel deployment logs
3. Check Supabase dashboard for function logs
4. Verify all environment variables are set correctly

---

**Your application is ready to deploy!** 🚀

Choose Vercel Dashboard method for the easiest deployment experience.
