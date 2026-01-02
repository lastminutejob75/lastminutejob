# LastMinuteJob - Plateforme de Recrutement Rapide

**Plateforme de recrutement rapide pour emplois temporaires et missions courtes**

LastMinuteJob est une application web moderne permettant aux recruteurs de publier rapidement des annonces d'emploi et aux candidats de postuler facilement. Le projet intègre un système intelligent de détection de métiers et une interface d'administration complète.

## 🚀 Fonctionnalités principales

### Pour les recruteurs
- **Publication rapide d'annonces** : Création d'annonces en quelques clics avec détection automatique du métier
- **Gestion des candidatures** : Suivi des candidatures, pré-screening, export CSV
- **Dashboard administrateur** : Interface complète pour gérer les annonces, candidats et recruteurs
- **Détection intelligente** : Système de détection automatique des métiers (restaurant, logistique, tech, créatif, etc.)
- **Génération d'annonces IA** : Génération automatique d'annonces optimisées avec variantes

### Pour les candidats
- **Recherche d'emplois** : Navigation intuitive avec filtres par métier, localisation, type de contrat
- **Candidature simplifiée** : Formulaire de candidature avec upload de CV
- **Pré-screening** : Réponses aux questions de pré-sélection

## 🛠️ Technologies

- **Frontend** : React + TypeScript + Vite
- **Styling** : Tailwind CSS
- **Backend** : Supabase (PostgreSQL + Edge Functions)
- **Déploiement** : Vercel
- **IA** : OpenAI API pour la génération d'annonces

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte Supabase
- Clé API OpenAI (optionnel, pour la génération d'annonces)

## 🔧 Installation

1. **Cloner le dépôt**
```bash
git clone <url-du-repo>
cd lastminutejob-restored
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.local.example .env.local
```

Éditez `.env.local` et ajoutez :
```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anon
OPENAI_API_KEY=votre_cle_openai (optionnel)
```

4. **Configurer Supabase**
   - Créez un projet Supabase
   - Exécutez les migrations SQL dans `supabase/migrations/` dans l'ordre chronologique
   - Configurez les Edge Functions si nécessaire

5. **Lancer le serveur de développement**
```bash
npm run dev
```

## 📁 Structure du projet

```
lastminutejob-restored/
├── src/
│   ├── components/      # Composants React réutilisables
│   │   ├── AdminDashboard.tsx
│   │   ├── PostJobWizard.tsx
│   │   ├── CandidatesPage.tsx
│   │   └── ...
│   ├── pages/          # Pages de l'application
│   │   ├── Home.tsx
│   │   ├── PostJobPage.tsx
│   │   └── ...
│   ├── lib/            # Logique métier
│   │   ├── jobEngine.ts        # Moteur de détection de métiers
│   │   ├── jobDetection.ts     # Détection automatique
│   │   ├── jobService.ts        # Services API
│   │   └── ...
│   └── hooks/          # Hooks React personnalisés
├── supabase/
│   ├── functions/      # Edge Functions Supabase
│   └── migrations/     # Migrations SQL
├── public/             # Assets statiques
└── scripts/            # Scripts utilitaires
```

## 🗄️ Base de données

Le projet utilise Supabase (PostgreSQL) avec les tables principales :
- `jobs` : Annonces d'emploi
- `applications` : Candidatures
- `candidates` : Candidats
- `clients` : Recruteurs/clients
- `job_detection_logs` : Logs de détection
- `admin_users` : Utilisateurs administrateurs

Consultez `supabase/migrations/` pour le schéma complet.

## 🚀 Déploiement

### Vercel

1. Connectez votre dépôt GitHub à Vercel
2. Configurez les variables d'environnement dans Vercel
3. Le déploiement se fait automatiquement à chaque push

### Configuration Vercel

Assurez-vous d'avoir configuré :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (pour les Edge Functions)
- `OPENAI_API_KEY` (optionnel)

## 📝 Scripts disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run preview      # Prévisualiser le build
npm run lint         # Linter le code
```

## 🔐 Sécurité

- Les clés API ne doivent jamais être commitées
- Utilisez les variables d'environnement pour les secrets
- Les Edge Functions Supabase gèrent l'authentification côté serveur

## 📄 Licence

Ce projet est privé et propriétaire.

## 🤝 Support

Pour toute question ou problème, consultez la documentation dans le dossier `docs/` ou ouvrez une issue.

---

**LastMinuteJob** - Recrutement rapide et efficace 🚀
