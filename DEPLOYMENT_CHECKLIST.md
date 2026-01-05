# Checklist de Déploiement Vercel

## ✅ Configuration Vercel Dashboard

### 1. Framework Preset
- **Framework** : `Vite`
- **Build Command** : `npm run build`
- **Output Directory** : `dist`
- **Install Command** : `npm install`
- **Root Directory** : `.` (racine du projet)

### 2. Variables d'Environnement
Assurez-vous que les variables suivantes sont configurées dans Vercel Dashboard :

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key (optionnel)
```

### 3. Configuration Git
- **Repository** : `https://github.com/lastminutejob75/lastminutejob.git`
- **Branch** : `main`
- **Auto-deploy** : Activé

## ✅ Fichiers de Configuration

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### package.json
- Scripts : `"build": "vite build"`
- Dependencies : Vite, React, etc.

### tsconfig.json
- `jsx: "react-jsx"` (pas "preserve")
- Pas de plugin Next.js
- Paths corrects : `"src/*": ["./src/*"]`

## 🔍 Vérifications

1. ✅ `vercel.json` sans conflit de merge
2. ✅ `tsconfig.json` configuré pour Vite/React
3. ✅ `index.html` présent à la racine
4. ✅ `package.json` avec script `build`
5. ✅ Variables d'environnement configurées dans Vercel

## 🚨 Problèmes Courants

### Build échoue
- Vérifier que `npm install` fonctionne
- Vérifier que `npm run build` fonctionne localement
- Vérifier les erreurs TypeScript

### Variables d'environnement manquantes
- Vérifier dans Vercel Dashboard → Settings → Environment Variables
- Les variables doivent commencer par `VITE_` pour être accessibles côté client

### Erreur 404
- Vérifier que `vercel.json` contient les rewrites pour SPA
- Vérifier que `outputDirectory` est `dist`

## 📝 Dernière Vérification
- Date : 2026-01-05
- Commit : `43a264a` - fix: Résolution du conflit de merge dans vercel.json

