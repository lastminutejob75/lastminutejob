# 🔀 Séparation des Projets

Ce workspace contient **deux projets distincts** qui doivent être clairement séparés :

## 📁 Structure des Projets

```
project 8/
├── [PROJET PRINCIPAL] UWi Graph-Powered LLM
│   ├── app/                    # Next.js App Router
│   ├── lib/                    # Logique métier (orchestration, Capability Graph)
│   ├── components/             # Composants React
│   ├── docs/                   # Documentation UWi
│   ├── scripts/                # Scripts UWi
│   ├── supabase/               # Migrations Supabase (projet actif)
│   ├── package.json            # Dépendances Next.js
│   ├── .cursorrules            # Configuration Cursor pour UWi
│   ├── vercel.json             # Configuration Vercel Next.js
│   └── README.md               # Documentation principale
│
└── archive_lmj_uwi_legacy/     # [PROJET INDÉPENDANT] LMJ UWi Legacy
    ├── src/                    # Code source Vite/React
    ├── supabase/               # Migrations Supabase (instance séparée)
    ├── package.json            # Dépendances Vite
    ├── vercel.json             # Configuration Vercel SPA
    └── README.md               # Documentation du projet
```

## 🎯 Projet Principal : UWi Graph-Powered LLM

**Statut** : ✅ **ACTIF** - Projet en développement

### Caractéristiques

- **Framework** : Next.js 14 (App Router)
- **Base de données** : Supabase + Neo4j (Capability Graph)
- **Orchestration** : LLM avec Capability Graph RAG
- **Architecture** : Orchestration intelligente de SaaS, Agents IA, Humains, Robots

### Configuration

- **`.cursorrules`** : Configuration spécifique UWi (Neo4j, RAG, etc.)
- **`vercel.json`** : Configuration Next.js
- **`package.json`** : Dépendances Next.js + UWi

### Documentation

- Voir `/README.md` pour la documentation complète
- Voir `/docs/UWI_LLM_PROMPT_TEMPLATE.md` pour le template LLM

## 📦 Projet Legacy : LMJ UWi Legacy

**Statut** : ✅ **ACTIF ET INDÉPENDANT** - Projet séparé avec son propre repo Git et Supabase

### Caractéristiques

- **Framework** : Vite + React
- **Base de données** : Supabase (instance séparée)
- **Repository Git** : Dépôt Git indépendant
- **Fonctionnalités** : Dashboard admin, gestion candidats/jobs, LLM pour annonces

### Configuration

- **`vercel.json`** : Configuration SPA (rewrites pour index.html)
- **`package.json`** : Dépendances Vite/React
- **Repository Git** : Dépôt Git séparé (configuré dans le dossier)
- **Supabase** : Instance Supabase séparée avec ses propres migrations
- **Pas de `.cursorrules`** : Utilise la configuration du projet principal (optionnel)

### Documentation

- Voir `/archive_lmj_uwi_legacy/README.md` pour plus de détails

## 🔒 Isolation des Projets

### Fichiers de configuration séparés

| Fichier | Projet Principal | Projet Legacy |
|---------|------------------|---------------|
| `package.json` | ✅ Next.js | ✅ Vite/React |
| `vercel.json` | ✅ Next.js config | ✅ SPA config |
| `.cursorrules` | ✅ UWi spécifique | ❌ Non présent |
| `node_modules/` | ✅ Racine | ✅ Dans archive/ |
| `supabase/` | ✅ Instance Supabase principale | ✅ Instance Supabase séparée |
| **Repository Git** | ✅ Dépôt principal | ✅ Dépôt séparé |

### Variables d'environnement

Les deux projets ont des variables d'environnement différentes et des instances Supabase séparées :

- **Projet principal** : `.env.local` à la racine (Supabase principal)
- **Projet legacy** : `.env.local` dans `archive_lmj_uwi_legacy/` (Supabase séparé)

### Repositories Git

Les deux projets ont des repositories Git séparés :

- **Projet principal** : Repository Git à la racine
- **Projet legacy** : Repository Git dans `archive_lmj_uwi_legacy/`

## 🚀 Commandes de Développement

### Projet Principal (UWi)

```bash
# À la racine
npm install
npm run dev          # Démarre Next.js dev server
npm run build        # Build de production
npm run seed:capability-graph-enriched  # Seed le graph
```

### Projet Legacy (LMJ)

```bash
# Dans archive_lmj_uwi_legacy/
cd archive_lmj_uwi_legacy
npm install
npm run dev          # Démarre Vite dev server
npm run build        # Build de production
```

## 📝 Règles Importantes

1. **Ne pas mélanger les dépendances** : Chaque projet a son propre `package.json` et `node_modules/`
2. **Configurations séparées** : Les fichiers de configuration sont spécifiques à chaque projet
3. **Documentation séparée** : Chaque projet a son propre README
4. **Migrations SQL séparées** : Les migrations Supabase sont dans des dossiers différents et utilisent des instances Supabase différentes
5. **Repositories Git séparés** : Chaque projet a son propre dépôt Git
6. **Projets indépendants** : Les deux projets peuvent être développés et déployés indépendamment
7. **Variables d'environnement séparées** : Chaque projet a ses propres variables d'environnement et credentials Supabase

## 🔍 Vérification de la Séparation

Pour vérifier que les projets sont bien séparés :

```bash
# Vérifier les dépendances du projet principal
cat package.json | grep "name"

# Vérifier les dépendances du projet legacy
cat archive_lmj_uwi_legacy/package.json | grep "name"

# Vérifier les configurations Vercel
diff vercel.json archive_lmj_uwi_legacy/vercel.json
```

## 📚 Ressources

- ⚡ **Démarrage rapide** : [`QUICK_START.md`](./QUICK_START.md) - Comment retrouver rapidement chaque projet
- 🧭 **Guide de navigation** : [`GUIDE_NAVIGATION_PROJETS.md`](./GUIDE_NAVIGATION_PROJETS.md) - Guide complet de navigation
- **Projet Principal** : [`README.md`](./README.md)
- **Projet Legacy** : [`archive_lmj_uwi_legacy/README.md`](./archive_lmj_uwi_legacy/README.md)
- **Template LLM UWi** : [`docs/UWI_LLM_PROMPT_TEMPLATE.md`](./docs/UWI_LLM_PROMPT_TEMPLATE.md)
- **Architecture Capability Graph** : [`docs/ARCHITECTURE_CAPABILITY_GRAPH.md`](./docs/ARCHITECTURE_CAPABILITY_GRAPH.md)

---

**Dernière mise à jour** : 2025-01-24

