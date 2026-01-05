# Guide de Contribution

Merci de votre intérêt pour contribuer à LastMinuteJob ! 🎉

## 🚀 Démarrage

1. **Fork** le repository
2. **Clone** votre fork :
   ```bash
   git clone https://github.com/votre-username/lastminutejob.git
   cd lastminutejob
   ```
3. **Créez une branche** pour votre feature :
   ```bash
   git checkout -b feature/nom-de-votre-feature
   ```

## 📋 Processus de Contribution

### 1. Développement

- Suivez les conventions de code existantes
- Écrivez du code TypeScript typé (évitez `any`)
- Ajoutez des commentaires pour les parties complexes
- Testez votre code localement avant de commit

### 2. Commits

Utilisez des messages de commit clairs et descriptifs :

```bash
git commit -m "feat: ajout de la détection de nouvelles villes"
git commit -m "fix: correction du bug d'autocomplétion"
git commit -m "docs: mise à jour de la documentation API"
```

**Conventions** :
- `feat:` : Nouvelle fonctionnalité
- `fix:` : Correction de bug
- `docs:` : Documentation
- `style:` : Formatage, pas de changement de code
- `refactor:` : Refactoring
- `test:` : Ajout de tests
- `chore:` : Maintenance

### 3. Pull Request

1. **Poussez** votre branche :
   ```bash
   git push origin feature/nom-de-votre-feature
   ```

2. **Ouvrez une Pull Request** sur GitHub

3. **Description de la PR** :
   - Expliquez ce que fait votre changement
   - Référencez les issues liées (ex: "Fixes #123")
   - Ajoutez des captures d'écran si applicable

## 📝 Standards de Code

### TypeScript

- Utilisez des types stricts, évitez `any`
- Définissez des interfaces pour les objets complexes
- Utilisez `const` et `let` (jamais `var`)

### React

- Utilisez des composants fonctionnels avec hooks
- Nommez les composants en PascalCase
- Extrayez la logique complexe dans des hooks personnalisés

### Styling

- Utilisez Tailwind CSS pour le styling
- Suivez les classes utilitaires existantes
- Responsive design : utilisez les breakpoints `sm:`, `md:`, `lg:`

### Noms de Fichiers

- Composants : `PascalCase.tsx`
- Utilitaires : `camelCase.ts`
- Constantes : `UPPER_SNAKE_CASE.ts`

## 🧪 Tests

Avant de soumettre une PR, assurez-vous que :

- ✅ Le code compile sans erreurs (`npm run typecheck`)
- ✅ Le linter passe (`npm run lint`)
- ✅ L'application fonctionne en local (`npm run dev`)
- ✅ Le build de production fonctionne (`npm run build`)

## 🐛 Signaler un Bug

1. Vérifiez que le bug n'a pas déjà été signalé
2. Créez une issue avec :
   - Description claire du problème
   - Steps to reproduce
   - Comportement attendu vs comportement actuel
   - Screenshots si applicable
   - Environnement (OS, navigateur, version Node)

## 💡 Proposer une Feature

1. Créez une issue pour discuter de la feature
2. Attendez la validation avant de commencer à coder
3. Implémentez la feature selon les standards du projet

## ❓ Questions ?

N'hésitez pas à ouvrir une issue pour poser des questions ou demander de l'aide !

---

Merci de contribuer à LastMinuteJob ! 🚀

