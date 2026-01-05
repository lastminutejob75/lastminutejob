# 🧭 Guide de Navigation entre les Projets

Guide pratique pour retrouver et travailler sur chaque projet rapidement.

## 📍 Localisation des Projets

### Projet Principal : UWi Graph-Powered LLM
```
Chemin absolu : /Users/actera/Downloads/project 8/uwi/
Chemin relatif : uwi/
```

### Projet Legacy : LMJ UWi Legacy
```
Chemin absolu : /Users/actera/Downloads/project 8/lmj/
Chemin relatif : lmj/
```

## 🚀 Commandes Rapides

### Aller au Projet Principal (UWi)

```bash
# Depuis n'importe où
cd "/Users/actera/Downloads/project 8/uwi"

# Ou depuis le projet legacy
cd ../uwi

# Vérifier que vous êtes au bon endroit
pwd
# Devrait afficher : /Users/actera/Downloads/project 8/uwi
```

### Aller au Projet Legacy (LMJ)

```bash
# Depuis n'importe où
cd "/Users/actera/Downloads/project 8/lmj"

# Ou depuis le projet principal
cd ../lmj

# Vérifier que vous êtes au bon endroit
pwd
# Devrait afficher : /Users/actera/Downloads/project 8/lmj
```

## 🔧 Scripts d'Aide (Optionnel)

Créez ces alias dans votre `~/.zshrc` pour un accès rapide :

```bash
# Ajoutez ces lignes à votre ~/.zshrc
alias uwi="cd '/Users/actera/Downloads/project 8/uwi'"
alias lmj="cd '/Users/actera/Downloads/project 8/lmj'"

# Puis rechargez votre shell
source ~/.zshrc
```

Ensuite, utilisez simplement :
```bash
uwi          # Va au projet principal
lmj          # Va au projet legacy
```

## 📋 Checklist de Démarrage

### Pour travailler sur le Projet Principal (UWi)

```bash
# 1. Aller au projet
cd "/Users/actera/Downloads/project 8/uwi"

# 2. Vérifier le repository Git
git remote -v

# 3. Vérifier les variables d'environnement
ls -la .env.local

# 4. Installer les dépendances (si nécessaire)
npm install

# 5. Démarrer le développement
npm run dev
```

### Pour travailler sur le Projet Legacy (LMJ)

```bash
# 1. Aller au projet
cd "/Users/actera/Downloads/project 8/lmj"

# 2. Vérifier le repository Git
git remote -v

# 3. Vérifier les variables d'environnement
ls -la .env.local

# 4. Installer les dépendances (si nécessaire)
npm install

# 5. Démarrer le développement
npm run dev
```

## 🎯 Identifiants Visuels

### Comment savoir sur quel projet vous êtes ?

**Projet Principal (UWi)** :
- ✅ Présence de `next.config.mjs`
- ✅ Présence de `.cursorrules`
- ✅ Dossier `app/` (Next.js App Router)
- ✅ Dossier `lib/capabilityGraph/`
- ✅ Fichier `package.json` avec `"name": "uwi-mvp-orchestrator"`

**Projet Legacy (LMJ)** :
- ✅ Présence de `vite.config.ts`
- ✅ Dossier `src/` (Vite structure)
- ✅ Dossier `dist/` (build Vite)
- ✅ Fichier `package.json` avec `"name": "uwi-mvp-prompt-orchestrator"`

### Commande rapide pour vérifier

```bash
# Dans n'importe quel dossier du projet
cat package.json | grep '"name"'

# Projet principal affichera : "uwi-mvp-orchestrator"
# Projet legacy affichera : "uwi-mvp-prompt-orchestrator"
```

## 🔄 Basculer entre les Projets

### Depuis le Projet Principal vers le Legacy

```bash
cd ../lmj
```

### Depuis le Projet Legacy vers le Principal

```bash
cd ../uwi
```

## 📂 Structure Rapide

```
project 8/
├── uwi/                            ← PROJET PRINCIPAL (UWi)
│   ├── app/                        ← Next.js App Router
│   ├── lib/                        ← Logique métier
│   ├── package.json                ← "uwi-mvp-orchestrator"
│   └── next.config.mjs            ← Config Next.js
│
└── lmj/                            ← PROJET LEGACY (LMJ)
    ├── src/                        ← Code source Vite
    ├── package.json                ← "uwi-mvp-prompt-orchestrator"
    └── vite.config.ts              ← Config Vite
```

## 🛠️ Commandes Utiles par Projet

### Projet Principal (UWi)

```bash
# Développement
npm run dev

# Build
npm run build

# Seed Capability Graph
npm run seed:capability-graph-enriched

# Tests
npm run test:analytics
npm run test:capability-graph
```

### Projet Legacy (LMJ)

```bash
# Développement
npm run dev

# Build
npm run build

# Lint
npm run lint
```

## 💡 Astuces

### 1. Garder deux terminaux ouverts

- **Terminal 1** : Projet Principal (`npm run dev`)
- **Terminal 2** : Projet Legacy (`npm run dev`)

### 2. Utiliser des onglets dans votre IDE

- **Onglet 1** : Ouvrir le dossier principal (`project 8/uwi/`)
- **Onglet 2** : Ouvrir le dossier legacy (`project 8/lmj/`)

### 3. Marque-page dans votre navigateur

- Projet Principal : `http://localhost:3000` (Next.js)
- Projet Legacy : `http://localhost:5173` (Vite)

## 🔍 Vérification Rapide

Créez ce script pour vérifier rapidement où vous êtes :

```bash
# Ajoutez à ~/.zshrc
check-project() {
    if [ -f "next.config.mjs" ]; then
        echo "✅ Projet Principal (UWi) - Next.js"
    elif [ -f "vite.config.ts" ]; then
        echo "✅ Projet Legacy (LMJ) - Vite"
    else
        echo "❌ Aucun projet détecté"
    fi
}
```

Utilisez ensuite :
```bash
check-project
```

## 📝 Notes Importantes

1. **Chaque projet a son propre `node_modules/`** : Installez les dépendances dans chaque projet séparément
2. **Chaque projet a son propre `.env.local`** : Configurez les variables d'environnement pour chaque projet
3. **Chaque projet a son propre repository Git** : Vérifiez toujours `git remote -v` avant de commit
4. **Ports différents** : 
   - Projet Principal : Port 3000 (Next.js)
   - Projet Legacy : Port 5173 (Vite)

---

**Astuce** : Gardez ce fichier ouvert ou ajoutez-le à vos favoris pour référence rapide !

