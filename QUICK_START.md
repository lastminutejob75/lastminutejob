# ⚡ Démarrage Rapide - Retrouver vos Projets

## 🎯 Méthode la Plus Rapide

### Option 1 : Scripts Shell (Recommandé)

```bash
# Aller au projet principal UWi
./switch-to-uwi.sh

# Aller au projet legacy LMJ
./switch-to-legacy.sh
```

### Option 2 : Commandes Directes

```bash
# Projet Principal (UWi)
cd "/Users/actera/Downloads/project 8/uwi"

# Projet Legacy (LMJ)
cd "/Users/actera/Downloads/project 8/lmj"
```

### Option 3 : Alias (Une fois configuré)

Ajoutez à votre `~/.zshrc` :
```bash
alias uwi="cd '/Users/actera/Downloads/project 8/uwi'"
alias lmj="cd '/Users/actera/Downloads/project 8/lmj'"
```

Puis utilisez :
```bash
uwi          # Va au projet principal
lmj          # Va au projet legacy
```

## 📍 Comment Savoir où Vous Êtes

```bash
# Vérifier le chemin actuel
pwd

# Vérifier le type de projet
cat package.json | grep '"name"'
# "uwi-mvp-orchestrator" = Projet Principal
# "uwi-mvp-prompt-orchestrator" = Projet Legacy
```

## 🚀 Commandes de Démarrage

### Projet Principal (UWi)
```bash
cd "/Users/actera/Downloads/project 8/uwi"
npm run dev  # Port 3000
```

### Projet Legacy (LMJ)
```bash
cd "/Users/actera/Downloads/project 8/lmj"
npm run dev  # Port 5173
```

## 🖥️ Ouvrir dans des Interfaces Séparées

### Méthode Rapide : Scripts

```bash
# Ouvrir UWi dans Cursor
./open-uwi.sh

# Ouvrir LMJ dans une nouvelle fenêtre Cursor
./open-lmj.sh
```

### Méthode Manuelle

**Dans Cursor** :
1. `File` → `Open Folder...` → Sélectionner `uwi/`
2. `File` → `New Window` (`Cmd+Shift+N`)
3. `File` → `Open Folder...` → Sélectionner `lmj/`

**Guide complet** : [`GUIDE_INTERFACES_SEPAREES.md`](./GUIDE_INTERFACES_SEPAREES.md)

## 📚 Documentation Complète

- 🖥️ **Interfaces séparées** : [`GUIDE_INTERFACES_SEPAREES.md`](./GUIDE_INTERFACES_SEPAREES.md)
- 🧭 **Guide de navigation détaillé** : [`GUIDE_NAVIGATION_PROJETS.md`](./GUIDE_NAVIGATION_PROJETS.md)
- 📋 **Séparation des projets** : [`SEPARATION_PROJETS.md`](./SEPARATION_PROJETS.md)

