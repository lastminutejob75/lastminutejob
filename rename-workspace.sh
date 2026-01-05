#!/bin/bash
# Script pour renommer le workspace "project 8" en un nom plus descriptif

OLD_NAME="project 8"
OLD_PATH="/Users/actera/Downloads/project 8"

echo "🔄 Renommage du workspace 'project 8'"
echo ""
echo "Options de nom suggérées :"
echo "  1. uwi-workspace    (recommandé)"
echo "  2. uwi-projects"
echo "  3. uwi-mvp"
echo "  4. Autre (saisir manuellement)"
echo ""
read -p "Choisissez une option (1-4) : " choice

case $choice in
    1)
        NEW_NAME="uwi-workspace"
        ;;
    2)
        NEW_NAME="uwi-projects"
        ;;
    3)
        NEW_NAME="uwi-mvp"
        ;;
    4)
        read -p "Entrez le nouveau nom : " NEW_NAME
        ;;
    *)
        echo "❌ Option invalide"
        exit 1
        ;;
esac

NEW_PATH="/Users/actera/Downloads/${NEW_NAME}"

if [ -d "${NEW_PATH}" ]; then
    echo "❌ Le dossier ${NEW_NAME} existe déjà !"
    exit 1
fi

echo ""
echo "⚠️  ATTENTION : Cette opération va renommer le dossier"
echo "   Ancien : ${OLD_PATH}"
echo "   Nouveau : ${NEW_PATH}"
echo ""
read -p "Continuer ? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Opération annulée"
    exit 1
fi

# Renommer le dossier
mv "${OLD_PATH}" "${NEW_PATH}"

if [ $? -eq 0 ]; then
    echo "✅ Dossier renommé avec succès !"
    echo ""
    echo "📍 Nouveau chemin : ${NEW_PATH}"
    echo ""
    echo "⚠️  Actions à effectuer après le renommage :"
    echo ""
    echo "1. Mettre à jour les scripts de navigation :"
    echo "   cd \"${NEW_PATH}\""
    echo "   # Éditer switch-to-uwi.sh et switch-to-legacy.sh"
    echo ""
    echo "2. Mettre à jour les alias shell (si vous en avez créé) :"
    echo "   # Éditer ~/.zshrc et remplacer les chemins"
    echo ""
    echo "3. Mettre à jour les chemins dans votre IDE"
    echo ""
    echo "4. Mettre à jour la documentation si nécessaire"
else
    echo "❌ Erreur lors du renommage"
    exit 1
fi

