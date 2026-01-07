# LastMinuteJob (LMJ)

**Plateforme de recrutement spécialisée dans les missions urgentes et opérationnelles.**

LastMinuteJob connecte en temps réel des entreprises ayant un besoin immédiat (restauration, logistique, événementiel, retail, hôtellerie) avec des talents disponibles autour d'eux, grâce un matching rapide, fiable et automatisé.

## 🤖 Agent RH IA Intégré

LMJ embarque un **Agent RH d’intelligence artificielle** qui agit comme un recruteur digital autonome.

L’agent est capable de :

1.  **Comprendre un besoin** exprimé en langage naturel (*« Trouve-moi 2 serveurs disponibles ce soir à Lyon »*)
2.  **Analyser les contraintes** (horaires, localisation, compétences, disponibilité réelle, fiabilité)
3.  **Identifier et prioriser** les meilleurs profils (scoring automatique, compatibilité instantanée)
4.  **Orchestrer les actions** (envoi d’alertes, génération de shortlist, suivi des confirmations, relances)

## 🎯 Objectif Produit

Réduire au minimum le délai entre :
> “J’ai besoin de quelqu’un” ➡️ “La personne est confirmée et commence la mission.”

LMJ agit comme **copilote RH + marketplace temps réel**.

## 🛠️ Technologies

-   **Frontend** : React + TypeScript + Vite
-   **Styling** : Tailwind CSS
-   **Backend** : Supabase (PostgreSQL + Edge Functions)
-   **Deployment** : Vercel
-   **AI** : OpenAI API (pour l'Agent RH)

## 🚀 Installation & Démarrage

1.  **Installation des dépendances**
    ```bash
    npm install
    ```

2.  **Configuration**
    Copiez `.env.local.example` vers `.env.local` et configurez vos clés Supabase et OpenAI.

3.  **Lancement**
    ```bash
    npm run dev
    ```
