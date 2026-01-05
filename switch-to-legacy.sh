#!/bin/bash
# Script pour aller au projet legacy LMJ

LMJ_DIR="/Users/actera/Downloads/project 8/lmj"
LEGACY_OLD_DIR="/Users/actera/Downloads/project 8/archive_lmj_uwi_legacy"

# Si le dossier lmj existe et contient des fichiers, y aller
if [ -d "${LMJ_DIR}" ] && [ "$(ls -A ${LMJ_DIR} 2>/dev/null | grep -v README.md)" ]; then
    cd "${LMJ_DIR}"
    echo "✅ Changé vers le projet LMJ (lmj/)"
elif [ -d "${LEGACY_OLD_DIR}" ]; then
    # Sinon, aller à l'ancien emplacement
    cd "${LEGACY_OLD_DIR}"
    echo "✅ Changé vers le projet LMJ (archive_lmj_uwi_legacy/)"
    echo "⚠️  Note : Les fichiers sont encore dans archive_lmj_uwi_legacy/. Voir REORGANISATION.md pour déplacer vers lmj/"
else
    echo "❌ Aucun projet LMJ trouvé"
    exit 1
fi

echo "📍 Chemin actuel : $(pwd)"
echo ""
echo "Commandes utiles :"
echo "  npm run dev          # Démarrer le serveur de développement"
echo "  npm run build        # Build de production"
echo "  git status           # Vérifier le statut Git"
echo ""

# Vérifier si on est au bon endroit
if [ -f "vite.config.ts" ]; then
    echo "✅ Projet legacy détecté (Vite)"
else
    echo "⚠️  Attention : vite.config.ts non trouvé"
    echo "   Vérifiez que vous êtes dans le bon dossier"
fi

