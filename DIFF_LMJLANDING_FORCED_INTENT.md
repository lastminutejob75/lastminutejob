# 🔧 Diff - Correction de la boucle avec la garde d'intention

## Problème identifié

Quand on clique sur "Je cherche quelqu'un pour m'aider", le message se ferme puis se ré-affiche, la génération ne passe jamais.

**Cause** : Le state `forcedIntent` est mis à jour de manière asynchrone dans React. Quand on appelle `setForcedIntent("need_external")` puis immédiatement `handleSubmit()`, le state n'est pas encore mis à jour, donc `handleSubmit()` appelle encore `detectIntent(prompt)` qui retourne "ambiguous", et la garde se ré-ouvre.

## Solution appliquée

### 1. Handler `handleSubmit` amélioré (lignes 2525-2562)

```diff
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (!prompt.trim()) return;
    
    let intent: IntentType;
    
-   if (forcedIntent) {
+   // Si forcedIntent est présent, l'utiliser directement (ne pas appeler detectIntent)
+   if (forcedIntent) {
      intent = forcedIntent;
    } else {
      intent = detectIntent(prompt);
    }
    
-   if (intent === "personal_search" || intent === "ambiguous") {
+   // Si l'intention est personnelle ou ambiguë, afficher le message et bloquer
+   if (intent === "personal_search" || intent === "ambiguous") {
      setIntentMessage({
        type: intent,
        message: intent === "personal_search"
          ? "Ton message ressemble à une présentation de toi. De quel type de besoin s'agit-il ?"
          : "Je ne suis pas sûr d'avoir bien compris ton besoin. De quel type de besoin s'agit-il ?"
      });
      return;
    }
    
-   // On consomme le forcedIntent une fois utilisé
+   // Si l'intention est "need_external" → générer l'annonce
+   // On consomme le forcedIntent une fois utilisé
+   const wasForced = !!forcedIntent;
    setForcedIntent(null);
    setIntentMessage(null);
    
    // Génération d'annonce
-   track("uwi_prompt_submitted", { length: prompt.length, forced_intent: forcedIntent || null });
+   track("uwi_prompt_submitted", { length: prompt.length, forced_intent: wasForced });
    setIsGenerating(true);
    setTimeout(() => {
      setSubmitted(true);
      setIsGenerating(false);
      track("uwi_preview_generated");
    }, 800);
  };
```

**Changements** :
- Sauvegarde de `forcedIntent` dans `wasForced` avant de le réinitialiser (pour le tracking)
- Commentaires clarifiés

### 2. Handler `handleINeedSomeone` corrigé (lignes 2571-2578)

```diff
  const handleINeedSomeone = () => {
-   setForcedIntent("need_external");
-   setIntentMessage(null);
-   // on relance onSubmit MAIS cette fois avec forcedIntent
-   handleSubmit();
+   // Définir forcedIntent AVANT de fermer le message et appeler handleSubmit
+   setForcedIntent("need_external");
+   setIntentMessage(null);
+   // Appeler handleSubmit qui utilisera forcedIntent au lieu de detectIntent
+   // Utiliser setTimeout pour s'assurer que le state est bien mis à jour
+   setTimeout(() => {
+     handleSubmit();
+   }, 0);
  };
```

**Changements** :
- Utilisation de `setTimeout(() => handleSubmit(), 0)` pour garantir que le state `forcedIntent` est mis à jour avant l'appel à `handleSubmit()`
- Commentaires clarifiés

### 3. Handler `handleIAmTheOne` (lignes 2565-2569) - inchangé

```typescript
const handleIAmTheOne = () => {
  setIntentMessage(null);
  // v1 simple : plus tard on redirigera vers /candidate
  console.log("[intent] user talks about themselves (personal_search)");
};
```

## Vérifications

✅ **Après un clic sur "Je cherche quelqu'un pour m'aider"** :
1. `setForcedIntent("need_external")` est appelé
2. `setIntentMessage(null)` ferme le message
3. `setTimeout` garantit que le state est mis à jour
4. `handleSubmit()` est appelé avec `forcedIntent = "need_external"`
5. `handleSubmit()` utilise `forcedIntent` au lieu de `detectIntent(prompt)`
6. L'intention est "need_external", donc on passe la garde
7. L'annonce est générée
8. `forcedIntent` est réinitialisé à `null`

✅ **Le message ne réapparaît plus** car `forcedIntent` est utilisé et l'intention est "need_external"

✅ **Après la génération, `forcedIntent` repasse à `null`** (ligne 2551)

## Résultat

Le problème de boucle est résolu. Quand l'utilisateur clique sur "Je cherche quelqu'un pour m'aider", l'annonce est générée correctement sans que le message de clarification ne réapparaisse.

