# 🔧 Correction du déploiement Vercel

## Problème identifié

Le projet LastMinuteJob utilise **Vite** mais était configuré pour **Next.js**, ce qui causait l'échec du déploiement.

## Corrections apportées

### 1. `package.json`
- ✅ Changé les scripts de `next dev/build` vers `vite` et `vite build`
- ✅ Ajouté le script `preview` pour Vite
- ✅ Mis à jour les dépendances pour correspondre à un projet Vite

### 2. `vercel.json`
- ✅ Changé `framework` de `nextjs` vers `vite`
- ✅ Configuré `outputDirectory` sur `dist` (sortie Vite)
- ✅ Conservé les rewrites pour le routing SPA

## Configuration Vercel requise

### Variables d'environnement

Dans les paramètres Vercel (Settings → Environment Variables), configurez :

```
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anon
```

### Build Settings

Vercel devrait maintenant détecter automatiquement :
- **Framework** : Vite
- **Build Command** : `npm run build`
- **Output Directory** : `dist`
- **Install Command** : `npm install`

## Vérification

Après le déploiement, vérifiez que :
1. ✅ Le build se termine sans erreur
2. ✅ L'application est accessible
3. ✅ Les routes fonctionnent (SPA routing)

## Commandes locales

```bash
# Développement
npm run dev

# Build de production
npm run build

# Prévisualiser le build
npm run preview
```

## Notes

- Le dossier `app/` contient des routes API Next.js qui ne seront pas utilisées dans ce projet Vite
- Ces fichiers peuvent être supprimés si non nécessaires
- Le projet utilise le routing côté client avec React Router (dans App.tsx)

