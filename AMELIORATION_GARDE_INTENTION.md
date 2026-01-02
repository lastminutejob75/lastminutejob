# 🎯 Amélioration de la garde d'intention - LMJLanding

## 📋 Résumé des modifications

### 1. Wording unifié et centré sur le besoin

**Avant :**
- `personal_search` : "Tu sembles chercher du travail. Veux-tu proposer ton profil ou formuler un besoin à publier ?"
- `ambiguous` : "Je ne suis pas sûr de comprendre. Es-tu en train de chercher du travail ou de recruter quelqu'un ?"

**Après :**
- `personal_search` : "Ton message ressemble à une présentation de toi. De quel type de besoin s'agit-il ?"
- `ambiguous` : "Je ne suis pas sûr d'avoir bien compris ton besoin. De quel type de besoin s'agit-il ?"

### 2. UI unifiée avec deux boutons d'action

**Avant :**
- `personal_search` : 2 boutons ("Créer mon profil" + "Publier un besoin")
- `ambiguous` : 1 bouton ("Réessayer")

**Après :**
- **Les deux cas** (`personal_search` ET `ambiguous`) affichent maintenant :
  - **Bouton A** (bleu) : "Je parle de moi (je cherche du travail ou des missions)"
  - **Bouton B** (gris foncé) : "Je cherche quelqu'un pour m'aider"
  - **Lien optionnel** (petit texte) : "Réessayer"

### 3. Comportement des boutons

#### Bouton A : "Je parle de moi"
```typescript
onClick={() => {
  setIntentMessage(null);
  console.log("[UWi] User selected: personal need (je parle de moi)", { prompt });
  // TODO: Plus tard, rediriger vers CandidateWizard ou flow "profil / je propose mes services"
  track("uwi_intent_selected_personal");
}}
```
- Ferme le message de clarification
- Log dans la console (pour brancher plus tard un CandidateWizard)
- Ne génère PAS d'annonce recruteur

#### Bouton B : "Je cherche quelqu'un pour m'aider"
```typescript
onClick={() => {
  setIntentMessage(null);
  // Forcer l'intention à "need_external" et générer l'annonce
  track("uwi_prompt_submitted", { length: prompt.length, forced_intent: "need_external" });
  setIsGenerating(true);
  setTimeout(() => {
    setSubmitted(true);
    setIsGenerating(false);
    track("uwi_preview_generated", { forced_intent: true });
  }, 800);
  track("uwi_intent_selected_external");
}}
```
- Ferme le message de clarification
- Force l'intention à `need_external` (bypass de `detectIntent`)
- Génère l'annonce normalement

## 🔄 Nouveau flow pour un prompt ambigu

**Exemple :** "Étudiante disponible week-end pour extras en restauration à Paris"

1. **Utilisateur soumet le prompt** → `detectIntent()` retourne `"ambiguous"`

2. **Affichage du message de clarification** :
   - Message : "Je ne suis pas sûr d'avoir bien compris ton besoin. De quel type de besoin s'agit-il ?"
   - Deux boutons proposés

3. **Si l'utilisateur clique sur "Je parle de moi"** :
   - Le message disparaît
   - Log dans la console : `[UWi] User selected: personal need (je parle de moi)`
   - **Aucune annonce n'est générée**
   - L'utilisateur peut modifier son prompt ou attendre une future redirection vers CandidateWizard

4. **Si l'utilisateur clique sur "Je cherche quelqu'un pour m'aider"** :
   - Le message disparaît
   - L'intention est forcée à `need_external`
   - L'annonce est générée avec le prompt original
   - L'aperçu s'affiche normalement

5. **Si l'utilisateur clique sur "Réessayer"** :
   - Le message disparaît
   - L'utilisateur peut modifier son prompt manuellement

## 📊 Diff du composant LMJLanding

### Handler `onSubmit` (lignes 2888-2902)

```diff
- if (intent === "personal_search") {
-   setIntentMessage({
-     type: "personal_search",
-     message: "Tu sembles chercher du travail. Veux-tu proposer ton profil ou formuler un besoin à publier ?"
-   });
-   return;
- }
- 
- if (intent === "ambiguous") {
-   setIntentMessage({
-     type: "ambiguous",
-     message: "Je ne suis pas sûr de comprendre. Es-tu en train de chercher du travail ou de recruter quelqu'un ?"
-   });
-   return;
- }

+ if (intent === "personal_search") {
+   setIntentMessage({
+     type: "personal_search",
+     message: "Ton message ressemble à une présentation de toi. De quel type de besoin s'agit-il ?"
+   });
+   return;
+ }
+ 
+ if (intent === "ambiguous") {
+   setIntentMessage({
+     type: "ambiguous",
+     message: "Je ne suis pas sûr d'avoir bien compris ton besoin. De quel type de besoin s'agit-il ?"
+   });
+   return;
+ }
```

### Bloc UI `intentMessage` (lignes 3055-3107)

```diff
- {/* Message de clarification d'intention */}
- {intentMessage && (
-   <div className="mt-4 p-4 rounded-lg border bg-amber-50 border-amber-200">
-     <div className="flex items-start gap-3">
-       <AlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
-       <div className="flex-1">
-         <p className="text-sm font-medium text-amber-900 mb-2">
-           {intentMessage.message}
-         </p>
-         {intentMessage.type === "personal_search" && (
-           <div className="flex flex-wrap gap-2">
-             <button onClick={() => window.location.hash = "#/candidate"}>
-               Créer mon profil
-             </button>
-             <button onClick={() => { setIntentMessage(null); setSubmitted(true); }}>
-               Publier un besoin
-             </button>
-           </div>
-         )}
-         {intentMessage.type === "ambiguous" && (
-           <button onClick={() => setIntentMessage(null)}>
-             Réessayer
-           </button>
-         )}
-       </div>
-     </div>
-   </div>
- )}

+ {/* Message de clarification d'intention */}
+ {intentMessage && (
+   <div className="mt-4 p-4 rounded-lg border bg-amber-50 border-amber-200">
+     <div className="flex items-start gap-3">
+       <AlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
+       <div className="flex-1">
+         <p className="text-sm font-medium text-amber-900 mb-3">
+           {intentMessage.message}
+         </p>
+         {/* Boutons unifiés pour personal_search ET ambiguous */}
+         <div className="flex flex-col sm:flex-row gap-2 mb-2">
+           <button onClick={() => {
+             setIntentMessage(null);
+             console.log("[UWi] User selected: personal need", { prompt });
+             track("uwi_intent_selected_personal");
+           }}>
+             Je parle de moi (je cherche du travail ou des missions)
+           </button>
+           <button onClick={() => {
+             setIntentMessage(null);
+             // Force need_external et génère l'annonce
+             track("uwi_prompt_submitted", { forced_intent: "need_external" });
+             setIsGenerating(true);
+             setTimeout(() => {
+               setSubmitted(true);
+               setIsGenerating(false);
+             }, 800);
+             track("uwi_intent_selected_external");
+           }}>
+             Je cherche quelqu'un pour m'aider
+           </button>
+         </div>
+         <button onClick={() => setIntentMessage(null)} className="text-xs underline">
+           Réessayer
+         </button>
+       </div>
+     </div>
+   </div>
+ )}
```

## ✅ Points importants

1. **Wording centré sur le besoin** : Plus de mention de "recruteur", "candidat", "recruter quelqu'un"
2. **UI unifiée** : Même structure de boutons pour `personal_search` et `ambiguous`
3. **Actions claires** : Deux boutons d'action avec comportements distincts
4. **Pas de génération inappropriée** : Le bouton "Je parle de moi" ne génère pas d'annonce recruteur
5. **Force l'intention** : Le bouton "Je cherche quelqu'un" bypass `detectIntent` et génère directement
6. **Réessayer relégué** : Petit lien texte optionnel en dessous

