# 🖥️ Guide : Séparer les Interfaces de Travail

Guide pour ouvrir chaque projet dans une interface séparée (fenêtre/workspace).

## 🎯 Méthode 1 : Cursor (Recommandé)

### Option A : Deux Fenêtres Cursor Séparées

1. **Ouvrir le projet UWi** :
   ```bash
   cd "/Users/actera/Downloads/project 8/uwi"
   cursor .
   ```

2. **Ouvrir le projet LMJ** dans une nouvelle fenêtre :
   ```bash
   cd "/Users/actera/Downloads/project 8/lmj"
   cursor -n .  # -n = nouvelle fenêtre
   ```

### Option B : Via le Menu Cursor

1. **Premier projet** :
   - Menu : `File` → `Open Folder...`
   - Sélectionner : `/Users/actera/Downloads/project 8/uwi`

2. **Deuxième projet** :
   - Menu : `File` → `New Window` (ou `Cmd+Shift+N` sur Mac)
   - Menu : `File` → `Open Folder...`
   - Sélectionner : `/Users/actera/Downloads/project 8/lmj`

### Option C : Workspaces Multi-Root (Une Fenêtre, Deux Racines)

1. Menu : `File` → `Add Folder to Workspace...`
2. Ajouter le premier projet : `/Users/actera/Downloads/project 8/uwi`
3. Menu : `File` → `Add Folder to Workspace...`
4. Ajouter le deuxième projet : `/Users/actera/Downloads/project 8/lmj`
5. Sauvegarder le workspace : `File` → `Save Workspace As...`
   - Nom suggéré : `uwi-lmj.code-workspace`

## 🚀 Scripts Rapides

Créez ces scripts pour ouvrir rapidement chaque projet :

### Script : `open-uwi.sh`

```bash
#!/bin/bash
cd "/Users/actera/Downloads/project 8/uwi"
cursor .
```

### Script : `open-lmj.sh`

```bash
#!/bin/bash
cd "/Users/actera/Downloads/project 8/lmj"
cursor -n .  # Nouvelle fenêtre
```

Rendez-les exécutables :
```bash
chmod +x open-uwi.sh open-lmj.sh
```

## 📋 Méthode 2 : VS Code

### Deux Fenêtres Séparées

```bash
# Terminal 1
cd "/Users/actera/Downloads/project 8/uwi"
code .

# Terminal 2
cd "/Users/actera/Downloads/project 8/lmj"
code -n .  # -n = nouvelle fenêtre
```

### Workspace Multi-Root

Créez un fichier `uwi-lmj.code-workspace` :

```json
{
  "folders": [
    {
      "name": "UWi (Principal)",
      "path": "/Users/actera/Downloads/project 8/uwi"
    },
    {
      "name": "LMJ (Legacy)",
      "path": "/Users/actera/Downloads/project 8/lmj"
    }
  ],
  "settings": {
    "files.exclude": {
      "**/node_modules": true,
      "**/.next": true,
      "**/dist": true
    }
  }
}
```

Ouvrez-le avec : `code uwi-lmj.code-workspace`

## 🎨 Configuration Recommandée

### Pour Cursor/VS Code

1. **Couleurs différentes** :
   - UWi : Thème clair
   - LMJ : Thème sombre (ou vice versa)

2. **Onglets séparés** :
   - Chaque fenêtre a ses propres onglets
   - Pas de confusion entre les projets

3. **Terminaux séparés** :
   - Terminal 1 dans la fenêtre UWi : `npm run dev` (port 3000)
   - Terminal 2 dans la fenêtre LMJ : `npm run dev` (port 5173)

## 💡 Astuces

### 1. Utiliser des Espaces de Bureau (macOS)

- **Espace 1** : Fenêtre Cursor avec projet UWi
- **Espace 2** : Fenêtre Cursor avec projet LMJ
- Glissez les fenêtres entre les espaces avec `Ctrl+←` ou `Ctrl+→`

### 2. Utiliser des Tags/Étiquettes

Dans Cursor, vous pouvez :
- Renommer les fenêtres (si supporté)
- Utiliser des extensions pour différencier visuellement

### 3. Raccourcis Clavier

Créez des raccourcis dans votre système :

**macOS** (via Automator ou Alfred) :
- `Cmd+U` → Ouvre UWi
- `Cmd+L` → Ouvre LMJ

### 4. Scripts Shell Alias

Ajoutez à votre `~/.zshrc` :

```bash
# Ouvrir les projets dans Cursor
alias uwi-open="cd '/Users/actera/Downloads/project 8/uwi' && cursor ."
alias lmj-open="cd '/Users/actera/Downloads/project 8/lmj' && cursor -n ."

# Ouvrir les deux projets
alias projects-open="uwi-open && sleep 2 && lmj-open"
```

Puis utilisez :
```bash
uwi-open      # Ouvre UWi
lmj-open      # Ouvre LMJ dans une nouvelle fenêtre
projects-open # Ouvre les deux projets
```

## 🔧 Configuration Avancée : Workspace File

Créez `/Users/actera/Downloads/project 8/uwi-lmj.code-workspace` :

```json
{
  "folders": [
    {
      "name": "🎯 UWi - Projet Principal",
      "path": "./uwi"
    },
    {
      "name": "📦 LMJ - Projet Legacy",
      "path": "./lmj"
    }
  ],
  "settings": {
    "files.exclude": {
      "**/node_modules": true,
      "**/.next": true,
      "**/dist": true,
      "**/.git": false
    },
    "search.exclude": {
      "**/node_modules": true,
      "**/.next": true,
      "**/dist": true
    }
  },
  "extensions": {
    "recommendations": [
      "dbaeumer.vscode-eslint",
      "esbenp.prettier-vscode"
    ]
  }
}
```

Ouvrez-le avec :
```bash
cd "/Users/actera/Downloads/project 8"
cursor uwi-lmj.code-workspace
```

## 📊 Comparaison des Méthodes

| Méthode | Avantages | Inconvénients |
|---------|-----------|--------------|
| **Deux fenêtres** | ✅ Séparation complète<br>✅ Pas de confusion | ⚠️ Plus de ressources |
| **Workspace multi-root** | ✅ Une seule fenêtre<br>✅ Navigation facile | ⚠️ Peut être confus |
| **Espaces macOS** | ✅ Séparation visuelle<br>✅ Organisation | ⚠️ macOS uniquement |

## ✅ Recommandation

**Pour un développement actif sur les deux projets** :
→ Utilisez **deux fenêtres Cursor séparées**

**Pour une consultation occasionnelle** :
→ Utilisez un **workspace multi-root**

---

**Dernière mise à jour** : 2025-01-24

