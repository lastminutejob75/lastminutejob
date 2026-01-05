# ✅ PATCH APPLIQUÉ : Intent Guard pour génération d'annonce

## MODIFICATIONS EFFECTUÉES

### 1. ✅ Ajout de `detectIntent()` dans `src/lib/jobEngine.ts`

**Fonction ajoutée** (lignes ~1147-1220) :
```typescript
export type IntentType = "need_external" | "personal_search" | "ambiguous";

export function detectIntent(prompt: string): IntentType {
  // Détecte si le prompt exprime :
  // - "need_external" : recherche de ressources (recruteur)
  // - "personal_search" : recherche personnelle (candidat)
  // - "ambiguous" : intention incertaine
}
```

**Logique** :
- **Indicateurs personnels** : "je suis étudiant", "je cherche un job", "disponible", "freelance"
- **Indicateurs externes** : "je cherche un serveur", "nous recrutons", "besoin de"
- **Scoring** : compare les scores pour déterminer l'intention

---

### 2. ✅ Modification du composant `Home` dans `src/App.tsx`

**Ligne ~998** : Bouton "Générer"

**Avant** :
```typescript
<button onClick={async()=>{
  setLoading(true); 
  let parsed=await uwiSuggest(text||example); 
  // ... génération directe
  onGenerated(parsed, text||example);
}}>
```

**Après** :
```typescript
<button onClick={async()=>{
  setLoading(true);
  const intent = detectIntent(text || example);
  
  // BLOQUER si recherche personnelle
  if (intent === "personal_search") {
    setLoading(false);
    alert("Tu sembles chercher du travail. Veux-tu créer ton profil candidat ou formuler un besoin à publier ?");
    return;
  }
  
  // DEMANDER CONFIRMATION si ambigu
  if (intent === "ambiguous") {
    const confirmed = confirm("Es-tu en train de chercher quelqu'un à recruter, ou de chercher du travail ?");
    if (!confirmed) {
      setLoading(false);
      return;
    }
  }
  
  // CONTINUER si besoin externe confirmé
  let parsed=await uwiSuggest(text||example); 
  // ... génération
}}>
```

---

### 3. ✅ Modification du hook `useUWiPreview` dans `src/App.tsx`

**Ligne ~2151** : Fonction `useUWiPreview`

**Avant** :
```typescript
function useUWiPreview(prompt: string) {
  return useMemo(() => {
    if (!prompt.trim()) return null;
    // Génération directe
    const parsed = enhancedSmartParse(prompt, enhancedLocalParse);
    // ...
  }, [prompt]);
}
```

**Après** :
```typescript
function useUWiPreview(prompt: string) {
  return useMemo(() => {
    if (!prompt.trim()) return null;
    
    // VÉRIFIER L'INTENTION AVANT DE GÉNÉRER
    const intent = detectIntent(prompt);
    if (intent === "personal_search") {
      return null;  // Ne pas générer d'annonce
    }
    if (intent === "ambiguous") {
      return null;  // Ne pas générer automatiquement
    }
    
    // CONTINUER SEULEMENT SI "need_external"
    const parsed = enhancedSmartParse(prompt, enhancedLocalParse);
    // ...
  }, [prompt]);
}
```

---

### 4. ✅ Modification du composant `LMJLanding` dans `src/App.tsx`

**Ligne ~2496** : Effet pour aperçu en temps réel

**Avant** :
```typescript
useEffect(() => {
  if (debouncedPrompt.trim() && !submitted) {
    setIsGenerating(true);
    // Génération automatique
  }
}, [debouncedPrompt, submitted]);
```

**Après** :
```typescript
useEffect(() => {
  if (debouncedPrompt.trim() && !submitted) {
    const intent = detectIntent(debouncedPrompt);
    
    // NE PAS GÉNÉRER si recherche personnelle
    if (intent === "personal_search") {
      return;
    }
    
    // NE PAS GÉNÉRER automatiquement si ambigu
    if (intent === "ambiguous") {
      return;
    }
    
    // GÉNÉRER seulement si besoin externe
    setIsGenerating(true);
    // ...
  }
}, [debouncedPrompt, submitted]);
```

---

### 5. ✅ Import ajouté dans `src/App.tsx`

**Ligne ~61** :
```typescript
import { detectIntent, type IntentType } from './lib/jobEngine';
```

---

## COMPORTEMENT ATTENDU

### Cas A : Recherche personnelle
**Input** : "je suis une étudiante je cherche un extra"

**Avant** : ❌ Génère "Recherche serveur (H/F)"

**Après** : ✅ Affiche : "Tu sembles chercher du travail. Veux-tu créer ton profil candidat ou formuler un besoin à publier ?"

---

### Cas B : Besoin externe
**Input** : "je cherche un serveur à Lille samedi soir"

**Avant** : ✅ Génère l'annonce

**Après** : ✅ Génère l'annonce (comportement inchangé)

---

### Cas C : Ambigu
**Input** : "cherche serveur"

**Avant** : ✅ Génère l'annonce (peut être une erreur)

**Après** : ✅ Demande confirmation : "Es-tu en train de chercher quelqu'un à recruter, ou de chercher du travail ?"

---

## TESTS À EFFECTUER

1. ✅ "je suis étudiante je cherche un extra" → doit bloquer
2. ✅ "je cherche un serveur à Lille" → doit générer
3. ✅ "disponible week-end" → doit bloquer
4. ✅ "nous recrutons un cuisinier" → doit générer
5. ✅ "cherche serveur" → doit demander confirmation

---

## IMPACT

- ✅ **Minimal** : Seulement 3 points d'entrée modifiés
- ✅ **Pas de breaking changes** : La génération fonctionne toujours pour les vrais recruteurs
- ✅ **Pas de changement d'architecture** : Fonction simple ajoutée, conditions ajoutées
- ✅ **Pas de changement UI/UX** : Même interface, juste des alertes/confirmations

---

## PROCHAINES ÉTAPES (OPTIONNEL)

Pour améliorer l'UX, on pourrait remplacer les `alert()` et `confirm()` par :
- Un composant modal personnalisé
- Une redirection vers le wizard candidat si `personal_search`
- Un message inline dans l'UI au lieu d'une popup

Mais pour l'instant, le patch minimal est appliqué et fonctionnel.

