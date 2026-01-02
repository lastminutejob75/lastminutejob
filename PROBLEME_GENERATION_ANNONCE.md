# 🔍 ANALYSE DU PROBLÈME : Génération d'annonce inappropriée

## OÙ SE SITUE LE PROBLÈME

### Flow actuel de génération d'annonce

1. **Landing page** (`src/App.tsx`, composant `Home`)
   - Ligne 2877-2886 : Handler `onSubmit` du formulaire
   - **PROBLÈME** : Génère directement l'annonce sans vérifier l'intention
   ```typescript
   onSubmit={(e) => {
     e.preventDefault();
     if (!prompt.trim()) return;
     track("uwi_prompt_submitted", { length: prompt.length });
     setIsGenerating(true);
     setTimeout(() => {
       setSubmitted(true);  // ← Génère directement !
       setIsGenerating(false);
       track("uwi_preview_generated");
     }, 800);
   }}
   ```

2. **Aperçu en temps réel** (`useUWiPreview`, ligne 2178)
   - ✅ **DÉJÀ PROTÉGÉ** : Vérifie `detectIntent` avant de générer (ligne 2183-2189)
   - Retourne `null` si `personal_search` ou `ambiguous`

3. **Fonction `detectIntent`** (`src/lib/jobEngine.ts`, ligne 1162)
   - ✅ **EXISTE DÉJÀ** : Fonction bien conçue avec patterns et scoring
   - Retourne : `"need_external"` | `"personal_search"` | `"ambiguous"`

## LE PROBLÈME CONCRET

**Exemple** : "je suis une étudiante je cherche un extra"

1. L'utilisateur tape le prompt
2. L'aperçu en temps réel ne se génère pas (✅ protégé par `useUWiPreview`)
3. **MAIS** si l'utilisateur clique sur "Générer l'annonce"
4. Le handler `onSubmit` génère **directement** sans vérifier l'intention
5. ❌ Résultat : Une annonce recruteur est générée alors que c'est une recherche personnelle

## SOLUTION : PATCH MINIMAL

### 1. Ajouter un état pour le message de clarification

```typescript
const [intentMessage, setIntentMessage] = useState<{
  type: "personal_search" | "ambiguous" | null;
  message: string;
} | null>(null);
```

### 2. Modifier le handler `onSubmit` pour vérifier l'intention AVANT génération

```typescript
onSubmit={(e) => {
  e.preventDefault();
  if (!prompt.trim()) return;
  
  // ✅ NOUVEAU : Vérifier l'intention AVANT de générer
  const intent = detectIntent(prompt);
  
  if (intent === "personal_search") {
    setIntentMessage({
      type: "personal_search",
      message: "Tu sembles chercher du travail. Veux-tu proposer ton profil ou formuler un besoin à publier ?"
    });
    return; // ← BLOQUER la génération
  }
  
  if (intent === "ambiguous") {
    setIntentMessage({
      type: "ambiguous",
      message: "Je ne suis pas sûr de comprendre. Es-tu en train de chercher du travail ou de recruter quelqu'un ?"
    });
    return; // ← BLOQUER la génération
  }
  
  // ✅ Seulement si "need_external" → générer
  setIntentMessage(null); // Réinitialiser le message
  track("uwi_prompt_submitted", { length: prompt.length });
  setIsGenerating(true);
  setTimeout(() => {
    setSubmitted(true);
    setIsGenerating(false);
    track("uwi_preview_generated");
  }, 800);
}}
```

### 3. Afficher le message de clarification dans l'UI

Ajouter après le formulaire (avant ou après le bouton) :

```typescript
{intentMessage && (
  <div className="mt-4 p-4 rounded-lg border bg-amber-50 border-amber-200">
    <div className="flex items-start gap-3">
      <AlertCircle className="text-amber-600 mt-0.5" size={20} />
      <div className="flex-1">
        <p className="text-sm font-medium text-amber-900 mb-2">
          {intentMessage.message}
        </p>
        {intentMessage.type === "personal_search" && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                // Rediriger vers le wizard candidat
                window.location.hash = "#/candidate";
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Créer mon profil
            </button>
            <button
              onClick={() => {
                // Forcer la génération (cas où l'utilisateur veut quand même publier)
                setIntentMessage(null);
                setSubmitted(true);
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300"
            >
              Publier un besoin
            </button>
          </div>
        )}
        {intentMessage.type === "ambiguous" && (
          <button
            onClick={() => setIntentMessage(null)}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300"
          >
            Réessayer
          </button>
        )}
      </div>
    </div>
  </div>
)}
```

## AMÉLIORATION DE `detectIntent` (optionnel)

Pour mieux détecter "je suis une étudiante je cherche un extra" :

```typescript
// Dans detectIntent, ajouter ce pattern :
/je\s+suis\s+(une|un)\s+(étudiant|étudiante)/i,  // "je suis une étudiante"
```

Mais le pattern existant `/^je\s+suis/i` devrait déjà le capturer.

## RÉSUMÉ DU PATCH

**Fichier à modifier** : `src/App.tsx`

**Changements** :
1. Ajouter état `intentMessage`
2. Modifier handler `onSubmit` pour appeler `detectIntent` AVANT génération
3. Bloquer génération si `personal_search` ou `ambiguous`
4. Afficher message de clarification avec actions

**Impact** : Minimal, pas de changement d'architecture, juste une garde d'intention avant génération.
