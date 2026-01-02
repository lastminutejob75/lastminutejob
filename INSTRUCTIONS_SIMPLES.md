# Instructions pour corriger la publication

## Étape 1 : Corriger les permissions dans Supabase

1. Va sur https://supabase.com/dashboard
2. Sélectionne ton projet
3. Clique sur **SQL Editor** (dans le menu de gauche)
4. Ouvre le fichier `CORRIGER_PERMISSIONS.sql` dans ce dossier
5. Copie TOUT le contenu
6. Colle-le dans l'éditeur SQL de Supabase
7. Clique sur **Run** (ou appuie sur Cmd+Enter)
8. Tu devrais voir "✅ Permissions corrigées"

## Étape 2 : Tester la publication

1. Rafraîchis ton site (F5 ou Cmd+R)
2. Essaie de publier une annonce
3. Si ça ne marche pas :
   - Ouvre la console (F12 → Console)
   - Clique sur "Error publishing job" pour voir les détails
   - Copie-colle le message d'erreur complet ici

## Étape 3 : Pousser les changements sur GitHub

```bash
git add .
git commit -m "Amélioration des messages d'erreur"
git push origin main
```

Ensuite Vercel redéploiera automatiquement.

