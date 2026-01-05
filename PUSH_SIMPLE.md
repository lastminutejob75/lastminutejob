# 🚀 Pousser les changements - Méthode SIMPLE

## ✅ Option 1 : GitHub Desktop (LE PLUS SIMPLE)

### Étapes :
1. **Ouvre GitHub Desktop** (l'application)
2. Tu devrais voir :
   - "4 commits ahead of origin/main" (en haut)
   - Les fichiers modifiés listés
3. **Clique sur "Push origin"** (bouton en haut à droite)
4. **C'est tout !** ✅

---

## 🔧 Option 2 : Ligne de commande (si GitHub Desktop ne marche pas)

### Étape 1 : Créer un token GitHub

1. Va sur : https://github.com/settings/tokens/new
2. **Note** : Tape "UWI Project"
3. **Expiration** : Choisis "90 days" ou "No expiration"
4. **Scopes** : Coche seulement `repo` (tout en bas)
5. Clique sur **"Generate token"** (tout en bas)
6. **COPIE LE TOKEN** (tu ne pourras plus le voir après !)

### Étape 2 : Utiliser le token

Dans le terminal, tape cette commande (remplace `TON_TOKEN` par le token que tu as copié) :

```bash
git push https://TON_TOKEN@github.com/lastminutejob75/UWI.git main
```

**Exemple** : Si ton token est `ghp_abc123xyz`, tu tapes :
```bash
git push https://ghp_abc123xyz@github.com/lastminutejob75/UWI.git main
```

---

## 🎯 Quelle méthode choisir ?

- **GitHub Desktop** = Plus simple, pas besoin de token
- **Ligne de commande** = Si GitHub Desktop ne fonctionne pas

**Je recommande GitHub Desktop !** 🎉


