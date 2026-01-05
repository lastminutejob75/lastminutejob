#!/bin/bash
# Script pour aller au projet principal UWi

UWI_DIR="/Users/actera/Downloads/project 8/uwi"

# Si le dossier uwi existe et contient des fichiers, y aller
if [ -d "${UWI_DIR}" ] && [ "$(ls -A ${UWI_DIR} 2>/dev/null | grep -v README.md)" ]; then
    cd "${UWI_DIR}"
    echo "✅ Changé vers le projet UWi (uwi/)"
else
    # Sinon, aller à la racine (ancien emplacement)
    cd "/Users/actera/Downloads/project 8"
    echo "✅ Changé vers le projet UWi (racine)"
    echo "⚠️  Note : Les fichiers sont encore à la racine. Voir REORGANISATION.md pour déplacer vers uwi/"
fi

echo "📍 Chemin actuel : $(pwd)"
echo ""
echo "Commandes utiles :"
echo "  npm run dev          # Démarrer le serveur de développement"
echo "  npm run build        # Build de production"
echo "  git status           # Vérifier le statut Git"
echo ""

# Vérifier si on est au bon endroit
if [ -f "next.config.mjs" ]; then
    echo "✅ Projet principal détecté (Next.js)"
else
    echo "⚠️  Attention : next.config.mjs non trouvé"
    echo "   Vérifiez que vous êtes dans le bon dossier"
fi

