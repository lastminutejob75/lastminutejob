# 🎯 Mode DEMO - Générateur d'annonce simple

## Fichiers créés/modifiés

### 1. Nouveau fichier : `src/lib/simpleAnnounceEngine.ts`

**Contenu** :
- Interface `SimpleAnnouncement`
- Fonction `detectJobSimple(prompt: string)` : détecte un jobKey parmi 15 métiers ou "generic"
- Fonction `extractLocationSimple(prompt: string)` : extrait une ville du prompt
- Fonction `extractDateText(prompt: string)` : extrait un texte de date
- Fonction `simpleGenerateAnnouncement(prompt: string)` : génère une annonce complète

**Métiers supportés** :
- server, bartender, cook, kitchen_assistant
- delivery, warehouse, sales, cashier, host
- cleaning, babysitting, handyman
- dev_web, designer, community_manager
- generic (fallback)

### 2. Modifications dans `src/App.tsx`

#### Import ajouté (ligne 61)
```typescript
import { simpleGenerateAnnouncement, type SimpleAnnouncement } from './lib/simpleAnnounceEngine';
```

#### State ajouté (ligne 2519)
```typescript
const [simplePreview, setSimplePreview] = useState<SimpleAnnouncement | null>(null);
```

#### Fonction `generateAnnouncement()` modifiée (lignes 2522-2536)
```typescript
async function generateAnnouncement() {
  if (!prompt.trim()) return;
  
  setShowIntentBox(false);
  
  // Génération d'annonce avec le moteur simple
  track("uwi_prompt_submitted", { length: prompt.length });
  setIsGenerating(true);
  
  // Simuler un délai puis générer avec le moteur simple
  setTimeout(() => {
    const announcement = simpleGenerateAnnouncement(prompt);
    setSimplePreview(announcement);
    setSubmitted(true);
    setIsGenerating(false);
    track("uwi_preview_generated", { mode: "simple_demo" });
  }, 800);
}
```

#### Réinitialisation de `simplePreview` (lignes 2587-2592)
```typescript
// Réinitialiser simplePreview quand le prompt change
useEffect(() => {
  if (prompt.trim() && simplePreview) {
    setSimplePreview(null);
    setSubmitted(false);
  }
}, [prompt]);
```

#### Affichage de la preview modifié (lignes 3141-3239)
- Condition changée : `!submitted || !simplePreview` au lieu de `!submitted || !preview`
- Utilisation de `simplePreview` au lieu de `preview` pour tous les champs
- Affichage adapté pour la structure `SimpleAnnouncement`

#### Fonctions adaptées
- `handleCopyPreview` : utilise `simplePreview` avec structure adaptée
- `handleShare` : utilise `simplePreview` avec structure adaptée
- `estimatedStats` : utilise `simplePreview.location` au lieu de `preview.location`
- Scroll effect : utilise `simplePreview` au lieu de `preview`
- `handlePublish` : utilise `simplePreview` au lieu de `preview`

## Exemple de SimpleAnnouncement généré

### Prompt : "Je cherche un serveur pour samedi soir à Lille"

```typescript
{
  jobKey: "server",
  title: "Serveur / Serveuse - Lille",
  location: "Lille",
  dateText: "Samedi",
  description: "Recherche serveur/serveuse pour service en salle. Poste dynamique avec contact client privilégié.",
  missions: [
    "Accueil et service en salle",
    "Prise de commande et encaissement",
    "Mise en place et débarrassage",
    "Conseil client sur les plats et boissons"
  ],
  requirements: [
    "Expérience en restauration appréciée",
    "Bonne présentation et sourire",
    "Résistance au stress",
    "Disponibilité horaires restaurant"
  ],
  tags: ["Samedi", "Restauration", "Service", "Contact client", "Lille"]
}
```

### Prompt : "Besoin d'aide pour déménager samedi à Marseille"

```typescript
{
  jobKey: "generic",
  title: "Besoin d'aide ponctuelle",
  location: "Marseille",
  dateText: "Samedi",
  description: "À partir de votre besoin : « Besoin d'aide pour déménager samedi à Marseille », voici une annonce type que vous pouvez adapter.",
  missions: [
    "Aider à réaliser les tâches décrites",
    "S'adapter au contexte",
    "Communiquer efficacement",
    "Respecter les consignes"
  ],
  requirements: [
    "Sérieux",
    "Ponctualité",
    "Envie de bien faire",
    "Disponibilité"
  ],
  tags: ["Samedi", "Flexible", "À préciser", "Marseille"]
}
```

## Avantages du mode DEMO

1. **Robuste** : Toujours produit une annonce, même pour des prompts non reconnus (fallback "generic")
2. **Simple** : Pas de dépendance à `detectIntent`, LLM, ou logique complexe
3. **Rapide** : Génération instantanée sans appel API
4. **Prévisible** : Résultats cohérents pour chaque métier
5. **Non-bloquant** : L'ancien moteur reste en place mais n'est plus utilisé pour la landing

## Tests à effectuer

Tester avec ces prompts :
- ✅ "Je cherche un serveur pour samedi soir à Lille"
- ✅ "Barman extra ce week-end à Paris"
- ✅ "Cuisinier pour restaurant marocain à Lyon"
- ✅ "Étudiante disponible week-end pour extras en restauration à Paris"
- ✅ "Développeur web freelance pour site vitrine"
- ✅ "Graphiste pour créer un logo"
- ✅ "Besoin d'aide pour déménager samedi à Marseille"
- ✅ "Garde d'enfants mercredi après-midi à Lyon"

Pour chacun, vérifier :
- ✅ Un `jobKey` raisonnable est détecté (ou "generic")
- ✅ Le titre, missions, prérequis s'affichent correctement
- ✅ La location et dateText sont extraites si présentes
- ✅ Les tags sont pertinents

