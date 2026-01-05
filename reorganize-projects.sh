#!/bin/bash
# Script pour réorganiser les projets en deux dossiers bien séparés

set -e  # Arrêter en cas d'erreur

PROJECT_ROOT="/Users/actera/Downloads/project 8"
UWI_DIR="${PROJECT_ROOT}/uwi"
LMJ_DIR="${PROJECT_ROOT}/lmj"

echo "🔄 Réorganisation des projets en deux dossiers séparés..."
echo ""

# Créer les dossiers principaux
echo "📁 Vérification des dossiers..."
mkdir -p "${UWI_DIR}"
mkdir -p "${LMJ_DIR}"

echo "✅ Dossiers prêts :"
echo "   - ${UWI_DIR}"
echo "   - ${LMJ_DIR}"
echo ""

echo "⚠️  ATTENTION : Ce script va déplacer les fichiers."
echo "   Assurez-vous d'avoir fait un commit Git avant de continuer."
echo ""
echo "🚀 Démarrage de la réorganisation..."
echo ""

# Déplacer le projet legacy existant
if [ -d "${PROJECT_ROOT}/archive_lmj_uwi_legacy" ]; then
    echo "📦 Déplacement du projet legacy vers lmj/..."
    mv "${PROJECT_ROOT}/archive_lmj_uwi_legacy"/* "${LMJ_DIR}/" 2>/dev/null || true
    mv "${PROJECT_ROOT}/archive_lmj_uwi_legacy"/.* "${LMJ_DIR}/" 2>/dev/null || true
    rmdir "${PROJECT_ROOT}/archive_lmj_uwi_legacy" 2>/dev/null || true
    echo "✅ Projet legacy déplacé vers lmj/"
fi

# Déplacer les fichiers du projet principal
echo "📦 Déplacement du projet principal vers uwi/..."

# Dossiers spécifiques au projet principal
MAIN_DIRS=("app" "lib" "components" "docs" "scripts" "supabase" "public" "data" "models" "src")
for dir in "${MAIN_DIRS[@]}"; do
    if [ -d "${PROJECT_ROOT}/${dir}" ]; then
        mv "${PROJECT_ROOT}/${dir}" "${UWI_DIR}/"
        echo "   ✓ ${dir}"
    fi
done

# Fichiers de configuration du projet principal
MAIN_FILES=("next.config.mjs" "tsconfig.json" "tailwind.config.ts" "postcss.config.js" "middleware.ts" "next-env.d.ts" "vercel.json" ".cursorrules" ".gitignore" "package.json" "package-lock.json" "docker-compose.yml" "requirements.txt")
for file in "${MAIN_FILES[@]}"; do
    if [ -f "${PROJECT_ROOT}/${file}" ]; then
        mv "${PROJECT_ROOT}/${file}" "${UWI_DIR}/"
        echo "   ✓ ${file}"
    fi
done

# Fichiers Neo4j spécifiques au projet principal
if [ -f "${PROJECT_ROOT}/neo4j_cypher_import.cypher" ]; then
    mv "${PROJECT_ROOT}/neo4j_cypher_import.cypher" "${UWI_DIR}/"
    echo "   ✓ neo4j_cypher_import.cypher"
fi
if [ -f "${PROJECT_ROOT}/neo4j_import_api.json" ]; then
    mv "${PROJECT_ROOT}/neo4j_import_api.json" "${UWI_DIR}/"
    echo "   ✓ neo4j_import_api.json"
fi

# Fichiers SaaS list spécifiques au projet principal
if [ -f "${PROJECT_ROOT}/saas_list.json" ]; then
    mv "${PROJECT_ROOT}/saas_list.json" "${UWI_DIR}/"
    echo "   ✓ saas_list.json"
fi
if [ -f "${PROJECT_ROOT}/saas_list.enriched.json" ]; then
    mv "${PROJECT_ROOT}/saas_list.enriched.json" "${UWI_DIR}/"
    echo "   ✓ saas_list.enriched.json"
fi
if [ -f "${PROJECT_ROOT}/saas_list.json.example" ]; then
    mv "${PROJECT_ROOT}/saas_list.json.example" "${UWI_DIR}/"
    echo "   ✓ saas_list.json.example"
fi

# Déplacer les fichiers SQL Supabase du projet principal
if ls "${PROJECT_ROOT}"/supabase_*.sql 1> /dev/null 2>&1; then
    mv "${PROJECT_ROOT}"/supabase_*.sql "${UWI_DIR}/"
    echo "   ✓ Fichiers SQL Supabase"
fi

# Déplacer les fichiers de documentation du projet principal
# (garder les fichiers de séparation à la racine)
DOC_FILES=("README.md" "PROJECT_STRUCTURE.md" "SETUP_INSTRUCTIONS.md")
for file in "${DOC_FILES[@]}"; do
    if [ -f "${PROJECT_ROOT}/${file}" ]; then
        cp "${PROJECT_ROOT}/${file}" "${UWI_DIR}/"
        echo "   ✓ ${file} (copié)"
    fi
done

# Déplacer tous les fichiers MD de documentation du projet principal
# (sauf ceux de séparation et les scripts)
if ls "${PROJECT_ROOT}"/*.md 1> /dev/null 2>&1; then
    for file in "${PROJECT_ROOT}"/*.md; do
        filename=$(basename "$file")
        # Ne pas déplacer les fichiers de séparation et les scripts
        if [[ ! "$filename" =~ ^(SEPARATION_PROJETS|GUIDE_NAVIGATION_PROJETS|QUICK_START|INDEX|STRUCTURE|REORGANISATION|QU_EST_CE_QUE_PROJECT_8)$ ]]; then
            mv "$file" "${UWI_DIR}/"
            echo "   ✓ ${filename}"
        fi
    done
fi

# Déplacer les fichiers .tsbuildinfo et autres fichiers de build
if [ -f "${PROJECT_ROOT}/tsconfig.tsbuildinfo" ]; then
    mv "${PROJECT_ROOT}/tsconfig.tsbuildinfo" "${UWI_DIR}/"
    echo "   ✓ tsconfig.tsbuildinfo"
fi

# Déplacer vercel.json.backup si présent
if [ -f "${PROJECT_ROOT}/vercel.json.backup" ]; then
    mv "${PROJECT_ROOT}/vercel.json.backup" "${UWI_DIR}/"
    echo "   ✓ vercel.json.backup"
fi

# Déplacer .env.local si présent (mais garder .env.local.example à la racine)
if [ -f "${PROJECT_ROOT}/.env.local" ]; then
    mv "${PROJECT_ROOT}/.env.local" "${UWI_DIR}/"
    echo "   ✓ .env.local"
fi

# Déplacer .next si présent
if [ -d "${PROJECT_ROOT}/.next" ]; then
    mv "${PROJECT_ROOT}/.next" "${UWI_DIR}/"
    echo "   ✓ .next/"
fi

echo ""
echo "✅ Réorganisation terminée !"
echo ""
echo "📁 Structure finale :"
echo "   ${PROJECT_ROOT}/"
echo "   ├── uwi/               # Projet principal UWi"
echo "   └── lmj/               # Projet legacy LMJ"
echo ""
echo "✅ Les fichiers de séparation restent à la racine :"
echo "   - SEPARATION_PROJETS.md"
echo "   - GUIDE_NAVIGATION_PROJETS.md"
echo "   - QUICK_START.md"
echo "   - INDEX.md"
echo "   - STRUCTURE.md"
echo "   - REORGANISATION.md"
echo "   - switch-to-uwi.sh"
echo "   - switch-to-legacy.sh"
echo ""
echo "⚠️  N'oubliez pas de :"
echo "   1. Vérifier les chemins dans vos fichiers de configuration"
echo "   2. Vérifier les remotes Git dans chaque projet"
echo "   3. Mettre à jour les variables d'environnement si nécessaire"

