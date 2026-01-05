# 🔄 Guide de Réorganisation - Deux Dossiers Séparés

Ce guide explique comment réorganiser les projets en deux dossiers bien séparés.

## 📁 Structure Cible

```
project 8/
├── uwi-main/              # 🎯 PROJET PRINCIPAL (UWi Graph-Powered LLM)
│   ├── app/
│   ├── lib/
│   ├── components/
│   ├── docs/
│   ├── scripts/
│   ├── supabase/
│   ├── package.json
│   ├── next.config.mjs
│   └── ...
│
├── uwi-legacy/            # 📦 PROJET LEGACY (LMJ UWi Legacy)
│   ├── src/
│   ├── supabase/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
│
├── GUIDE_NAVIGATION_PROJETS.md
├── SEPARATION_PROJETS.md
└── QUICK_START.md
```

## 🚀 Méthode Automatique (Recommandée)

### Option 1 : Script de réorganisation

```bash
# Rendre le script exécutable
chmod +x reorganize-projects.sh

# Exécuter le script (ATTENTION : fait un commit Git avant !)
./reorganize-projects.sh
```

⚠️ **Important** : Le script déplace les fichiers. Assurez-vous d'avoir fait un commit Git avant.

### Option 2 : Déplacement manuel

Si vous préférez déplacer manuellement :

#### 1. Déplacer le projet principal vers `uwi-main/`

```bash
cd "/Users/actera/Downloads/project 8"

# Créer le dossier si nécessaire
mkdir -p uwi-main

# Déplacer les dossiers
mv app lib components docs scripts supabase public data models src uwi-main/ 2>/dev/null || true

# Déplacer les fichiers de configuration
mv next.config.mjs tsconfig.json tailwind.config.ts postcss.config.js middleware.ts next-env.d.ts vercel.json .cursorrules package.json package-lock.json uwi-main/ 2>/dev/null || true

# Déplacer les fichiers spécifiques
mv neo4j_*.cypher neo4j_*.json saas_list*.json docker-compose.yml requirements.txt uwi-main/ 2>/dev/null || true

# Déplacer les fichiers SQL Supabase
mv supabase_*.sql uwi-main/ 2>/dev/null || true
```

#### 2. Déplacer le projet legacy vers `uwi-legacy/`

```bash
cd "/Users/actera/Downloads/project 8"

# Créer le dossier si nécessaire
mkdir -p uwi-legacy

# Déplacer le contenu de archive_lmj_uwi_legacy
mv archive_lmj_uwi_legacy/* uwi-legacy/ 2>/dev/null || true
mv archive_lmj_uwi_legacy/.* uwi-legacy/ 2>/dev/null || true

# Supprimer le dossier vide
rmdir archive_lmj_uwi_legacy 2>/dev/null || true
```

#### 3. Déplacer les fichiers de documentation

```bash
cd "/Users/actera/Downloads/project 8"

# Déplacer les fichiers MD (sauf ceux de séparation)
for file in *.md; do
    if [[ ! "$file" =~ ^(SEPARATION_PROJETS|GUIDE_NAVIGATION_PROJETS|QUICK_START|REORGANISATION)$ ]]; then
        mv "$file" uwi-main/ 2>/dev/null || true
    fi
done
```

## ✅ Vérification Après Réorganisation

### Vérifier le projet principal

```bash
cd "/Users/actera/Downloads/project 8/uwi-main"
ls -la

# Doit contenir :
# - app/
# - lib/
# - package.json
# - next.config.mjs
# - etc.
```

### Vérifier le projet legacy

```bash
cd "/Users/actera/Downloads/project 8/uwi-legacy"
ls -la

# Doit contenir :
# - src/
# - package.json
# - vite.config.ts
# - etc.
```

## 🔧 Mise à Jour des Scripts

Après la réorganisation, mettez à jour les scripts de navigation :

### `switch-to-uwi.sh`

```bash
#!/bin/bash
cd "/Users/actera/Downloads/project 8/uwi-main"
echo "✅ Changé vers le projet principal UWi"
# ... reste du script
```

### `switch-to-legacy.sh`

```bash
#!/bin/bash
cd "/Users/actera/Downloads/project 8/uwi-legacy"
echo "✅ Changé vers le projet legacy LMJ"
# ... reste du script
```

## 📝 Mise à Jour des Chemins

Après la réorganisation, vérifiez et mettez à jour :

1. **Variables d'environnement** : `.env.local` dans chaque projet
2. **Imports relatifs** : Vérifiez les imports dans le code
3. **Scripts npm** : Vérifiez les chemins dans `package.json`
4. **Configuration Vercel** : Mettez à jour les chemins si nécessaire
5. **Documentation** : Mettez à jour les chemins dans les fichiers MD

## 🎯 Avantages de cette Structure

✅ **Séparation claire** : Deux dossiers distincts au même niveau  
✅ **Navigation facile** : `cd uwi-main` ou `cd uwi-legacy`  
✅ **Pas de confusion** : Chaque projet est isolé  
✅ **Git indépendant** : Chaque projet peut avoir son propre `.git`  
✅ **Déploiement séparé** : Chaque projet peut être déployé indépendamment  

## ⚠️ Points d'Attention

1. **Git** : Si vous avez un repo Git à la racine, vous devrez peut-être créer des repos séparés
2. **Variables d'environnement** : Chaque projet a son propre `.env.local`
3. **node_modules** : Chaque projet a son propre `node_modules/`
4. **Chemins absolus** : Vérifiez les chemins absolus dans votre code

## 🔄 Retour en Arrière

Si vous voulez annuler la réorganisation :

```bash
cd "/Users/actera/Downloads/project 8"

# Remettre le projet principal à la racine
mv uwi-main/* . 2>/dev/null || true
mv uwi-main/.* . 2>/dev/null || true
rmdir uwi-main

# Remettre le projet legacy
mv uwi-legacy archive_lmj_uwi_legacy
```

---

**Note** : Les dossiers `uwi-main/` et `uwi-legacy/` ont été créés. Vous pouvez maintenant déplacer les fichiers selon vos préférences.

