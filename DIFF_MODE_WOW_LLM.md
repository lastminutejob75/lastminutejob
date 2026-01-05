# 🚀 Diff - Mode "WOW" avec LLM pour génération d'annonce

## Fichiers créés/modifiés

### 1. Nouveau fichier : `app/api/llm-announcement/route.ts`

**Contenu** :
- Route Next.js API pour appeler OpenAI
- Utilise le SDK OpenAI avec `OPENAI_API_KEY` depuis les variables d'environnement
- System prompt identique à celui fourni
- Modèle : `gpt-4o-mini` (ou `gpt-4.1-mini` selon disponibilité)
- Fallback JSON en cas d'erreur de parsing
- Format de réponse : `{ ok: true, announcement: {...} }`

**Structure de la réponse** :
```typescript
{
  ok: true,
  announcement: {
    type: "offer_services" | "need_someone",
    role_label: string,
    short_context: string,
    location: string | null,
    sections: [
      {
        title: string,
        items: string[]
      }
    ]
  }
}
```

### 2. Modifications dans `src/App.tsx`

#### Fonction `generateAnnouncement()` modifiée (lignes 2526-2571)
- Appelle d'abord `/api/llm-announcement` (route Next.js)
- Fallback automatique sur l'Edge Function Supabase si la route n'existe pas (404)
- Stocke la réponse dans `llmAnnouncement`
- Fallback minimal en cas d'erreur complète

#### Affichage de `llmAnnouncement` (lignes 3210-3244)
- Affichage conditionnel : si `llmAnnouncement` existe, affiche la réponse LLM
- Sinon, affiche le `draft` (moteur simple)
- Structure d'affichage :
  - `role_label` comme titre
  - `short_context` comme description
  - `location` avec icône 📍 si disponible
  - Toutes les `sections` avec leurs `items` en liste à puces

## Exemple de `llmAnnouncement` JSON généré

### Prompt : "Je suis étudiante, je cherche des extras en restauration à Paris"

```json
{
  "type": "offer_services",
  "role_label": "Étudiante pour extras en restauration",
  "short_context": "Étudiante disponible pour des extras en restauration à Paris. Flexible sur les horaires, motivée et sérieuse.",
  "location": "Paris",
  "sections": [
    {
      "title": "Disponibilités",
      "items": [
        "Soirs et week-ends",
        "Flexible selon planning cours"
      ]
    },
    {
      "title": "Expérience",
      "items": [
        "Première expérience en restauration appréciée",
        "Motivation et sérieux"
      ]
    }
  ]
}
```

### Prompt : "Je cherche un serveur pour samedi soir à Lille"

```json
{
  "type": "need_someone",
  "role_label": "Serveur pour extra le samedi soir",
  "short_context": "Recherche serveur pour compléter l'équipe le samedi soir à Lille. Poste ponctuel, ambiance conviviale.",
  "location": "Lille",
  "sections": [
    {
      "title": "Missions",
      "items": [
        "Service en salle",
        "Prise de commande et encaissement",
        "Mise en place et débarrassage"
      ]
    },
    {
      "title": "Profil recherché",
      "items": [
        "Expérience en restauration appréciée",
        "Bonne présentation",
        "Disponibilité samedi soir"
      ]
    }
  ]
}
```

### Prompt : "Développeur web freelance pour site vitrine"

```json
{
  "type": "need_someone",
  "role_label": "Développeur web freelance",
  "short_context": "Recherche développeur web freelance pour créer un site vitrine. Projet clair, délai flexible.",
  "location": null,
  "sections": [
    {
      "title": "Mission",
      "items": [
        "Création d'un site vitrine",
        "Design responsive",
        "Optimisation SEO"
      ]
    },
    {
      "title": "Profil recherché",
      "items": [
        "Maîtrise HTML/CSS/JavaScript",
        "Expérience en développement web",
        "Autonomie et réactivité"
      ]
    }
  ]
}
```

### Prompt : "Besoin d'aide pour déménagement samedi à Marseille"

```json
{
  "type": "need_someone",
  "role_label": "Aide pour déménagement",
  "short_context": "Recherche de l'aide pour un déménagement le samedi à Marseille. Besoin de bras supplémentaires pour le transport et le chargement.",
  "location": "Marseille",
  "sections": [
    {
      "title": "Mission",
      "items": [
        "Aide au chargement et déchargement",
        "Transport de meubles",
        "Manutention"
      ]
    },
    {
      "title": "Profil recherché",
      "items": [
        "Bonne condition physique",
        "Disponibilité samedi",
        "Ponctualité"
      ]
    }
  ]
}
```

## Configuration requise

### Variables d'environnement

Pour que la route `/api/llm-announcement` fonctionne, il faut :

1. **En développement local (si Next.js)** :
   - Créer un fichier `.env.local` avec :
     ```
     OPENAI_API_KEY=sk-...
     ```

2. **En production (Vercel)** :
   - Ajouter dans Vercel Dashboard > Settings > Environment Variables :
     - `OPENAI_API_KEY=sk-...`

3. **Alternative : Edge Function Supabase** :
   - Si la route Next.js n'est pas disponible, le code utilise automatiquement l'Edge Function
   - Configurer `OPENAI_API_KEY` dans Supabase Dashboard > Edge Functions > Secrets

## Flux de génération

1. L'utilisateur soumet un prompt
2. `generateAnnouncement()` est appelé
3. Appel à `/api/llm-announcement` (ou Edge Function en fallback)
4. Le LLM génère une annonce structurée
5. Stockage dans `llmAnnouncement`
6. Affichage dans la preview (colonne droite)
7. Fallback minimal en cas d'erreur

## Tests à effectuer

Tester avec ces prompts :
- ✅ "Je suis étudiante, je cherche des extras en restauration à Paris"
- ✅ "Je cherche un serveur pour samedi soir à Lille"
- ✅ "Développeur web freelance pour site vitrine"
- ✅ "Besoin d'aide pour déménagement samedi à Marseille"

Pour chacun, vérifier :
- ✅ Le type est correct (`offer_services` ou `need_someone`)
- ✅ Le `role_label` est pertinent
- ✅ Le `short_context` résume bien la situation
- ✅ La `location` est détectée si présente
- ✅ Les `sections` sont structurées et pertinentes

