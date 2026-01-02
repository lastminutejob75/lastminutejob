# Plan d'Implémentation Priorisé : Suggestions de Tarifs & Apprentissage Client

## 🎯 Objectif
Améliorer la flexibilité des suggestions de tarifs horaires et implémenter un système d'apprentissage des préférences client pour accélérer la création d'annonces.

---

## 📊 Vue d'ensemble des phases

```
Phase 1 (Rapide - 1-2h)     → Flexibilité immédiate
Phase 2 (Moyen - 3-4h)       → Apprentissage basique
Phase 3 (Avancé - 5-6h)      → Intelligence contextuelle
```

---

## 🚀 PHASE 1 : Flexibilité Immédiate (PRIORITÉ HAUTE)

**Objectif** : Donner plus de choix à l'utilisateur dès maintenant, sans infrastructure complexe.

### 1.1 Augmenter le nombre de suggestions de tarifs

**Fichier** : `src/lib/smartSuggestions.ts`
- **Ligne 289** : Changer `slice(0, 2)` → `slice(0, 5)`
- **Impact** : Passe de 2 à 5 suggestions de tarifs

**Modification** :
```typescript
// AVANT (ligne 289)
availableRates.slice(0, 2).forEach(rate => {

// APRÈS
availableRates.slice(0, 5).forEach(rate => {
```

### 1.2 Générer une plage de tarifs autour du tarif par défaut

**Fichier** : `src/lib/smartSuggestions.ts`
- **Fonction** : `generateSmartSuggestions()`
- **Ligne ~273-296** : Section suggestions de tarifs

**Logique à ajouter** :
```typescript
if (missing.missingRate && detectedJob) {
  const existingRates = new Set<number>();
  // ... détection des tarifs existants ...
  
  const defaultRates = getDefaultRatesForJob(detectedJob);
  const baseRate = defaultRates[0] || 15; // Tarif de base
  
  // Générer une plage autour du tarif de base
  const rateRange: number[] = [];
  for (let i = -3; i <= 3; i++) {
    const rate = baseRate + i;
    if (rate >= 10 && rate <= 30 && !existingRates.has(rate)) {
      rateRange.push(rate);
    }
  }
  
  // Limiter à 5 suggestions
  rateRange.slice(0, 5).forEach(rate => {
    completionSuggestions.push({
      text: `${text.trim()} ${rate}€/h`,
      category: 'rate',
      priority: 7
    });
  });
}
```

### 1.3 Ajouter un bouton "Tarif personnalisé" toujours visible

**Fichier** : `src/App.tsx`
- **Fonction** : `LMJLanding` ou `Home`
- **Section** : Suggestions de tarifs

**Interface à ajouter** :
```typescript
// Après les suggestions de tarifs
<button
  onClick={() => {
    // Ouvrir un input pour tarif personnalisé
    setShowCustomRateInput(true);
  }}
  className="px-3 py-1.5 rounded-lg border-2 border-blue-200 bg-blue-50 text-blue-700 font-medium hover:bg-blue-100"
>
  + Autre montant
</button>

// Input conditionnel
{showCustomRateInput && (
  <div className="flex gap-2">
    <input
      type="number"
      min="10"
      max="50"
      placeholder="Ex: 17"
      className="w-20 px-2 py-1 border rounded"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          const rate = parseInt(e.target.value);
          if (rate >= 10 && rate <= 50) {
            setPrompt(`${prompt.trim()} ${rate}€/h`);
            setShowCustomRateInput(false);
          }
        }
      }}
    />
    <span className="text-sm text-slate-600 self-center">€/h</span>
  </div>
)}
```

### 1.4 Ajouter des boutons rapides de tarifs populaires

**Fichier** : `src/App.tsx`
- **Section** : Module "Informations à compléter" (après génération de l'aperçu)

**Interface à ajouter** :
```typescript
// Dans le module "Informations à compléter"
{!parsedData.hourly && (
  <div>
    <label className="text-sm font-semibold text-slate-700 mb-2">
      Rémunération horaire
    </label>
    <div className="flex flex-wrap gap-2 mb-2">
      {[10, 12, 13, 14, 15, 16, 18, 20, 22, 25].map(rate => (
        <button
          key={rate}
          onClick={() => {
            const updated = { ...parsedData, hourly: `${rate}€/h` };
            setParsedData(updated);
          }}
          className="px-3 py-1.5 rounded-lg bg-blue-50 border-2 border-blue-200 text-blue-700 font-medium hover:bg-blue-100"
        >
          {rate}€/h
        </button>
      ))}
    </div>
    <input
      type="text"
      placeholder="ou tapez un montant (ex: 17€/h)"
      className="w-full px-3 py-2 border rounded-lg"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          const val = e.currentTarget.value.trim();
          if (val.match(/^\d+€\/h?$/)) {
            const updated = { ...parsedData, hourly: val };
            setParsedData(updated);
            e.currentTarget.value = '';
          }
        }
      }}
    />
  </div>
)}
```

**Temps estimé** : 1-2 heures
**Priorité** : 🔴 CRITIQUE

---

## 🧠 PHASE 2 : Apprentissage Basique (PRIORITÉ MOYENNE)

**Objectif** : Mémoriser les préférences de l'utilisateur pour accélérer les prochaines annonces.

### 2.1 Créer un système de stockage des préférences (localStorage)

**Fichier** : `src/lib/clientPreferences.ts` (NOUVEAU)

**Structure** :
```typescript
interface ClientPreferences {
  sessionId: string;
  preferredRates: {
    [jobCategory: string]: number[]; // Ex: { "serveur": [13, 14], "cuisinier": [15, 18] }
  };
  cityRates: {
    [city: string]: number; // Tarif moyen par ville
  };
  history: Array<{
    job: string;
    city: string;
    rate: number;
    date: string; // ISO string
  }>;
}

const STORAGE_KEY = 'uwi_client_preferences';

export function getClientPreferences(): ClientPreferences {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Si erreur, créer nouveau profil
    }
  }
  
  // Créer nouveau profil
  return {
    sessionId: generateSessionId(),
    preferredRates: {},
    cityRates: {},
    history: []
  };
}

export function saveClientPreferences(prefs: ClientPreferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function addJobToHistory(job: string, city: string, rate: number): void {
  const prefs = getClientPreferences();
  prefs.history.push({
    job,
    city,
    rate,
    date: new Date().toISOString()
  });
  
  // Limiter l'historique à 50 entrées
  if (prefs.history.length > 50) {
    prefs.history = prefs.history.slice(-50);
  }
  
  // Mettre à jour les tarifs préférés par métier
  if (!prefs.preferredRates[job]) {
    prefs.preferredRates[job] = [];
  }
  if (!prefs.preferredRates[job].includes(rate)) {
    prefs.preferredRates[job].push(rate);
    // Garder seulement les 5 tarifs les plus utilisés
    prefs.preferredRates[job] = prefs.preferredRates[job].slice(0, 5);
  }
  
  // Mettre à jour le tarif moyen par ville
  const cityJobs = prefs.history.filter(h => h.city === city);
  if (cityJobs.length > 0) {
    const avgRate = cityJobs.reduce((sum, h) => sum + h.rate, 0) / cityJobs.length;
    prefs.cityRates[city] = Math.round(avgRate);
  }
  
  saveClientPreferences(prefs);
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
```

### 2.2 Intégrer l'apprentissage dans le flux de publication

**Fichier** : `src/App.tsx`
- **Fonction** : `handlePublish` ou dans `ReviewOptimized` après publication

**Modification** :
```typescript
import { addJobToHistory } from './lib/clientPreferences';

// Après la publication réussie
if (parsedData.role && parsedData.city && parsedData.hourly) {
  const rateMatch = parsedData.hourly.match(/(\d+)/);
  if (rateMatch) {
    const rate = parseInt(rateMatch[1], 10);
    addJobToHistory(parsedData.role, parsedData.city, rate);
  }
}
```

### 2.3 Utiliser les préférences pour les suggestions

**Fichier** : `src/lib/smartSuggestions.ts`
- **Fonction** : `generateSmartSuggestions()`
- **Section** : Suggestions de tarifs (ligne ~273)

**Modification** :
```typescript
import { getClientPreferences } from './clientPreferences';

// Dans generateSmartSuggestions()
if (missing.missingRate && detectedJob) {
  const prefs = getClientPreferences();
  const existingRates = new Set<number>();
  // ... détection des tarifs existants ...
  
  // PRIORITÉ 1 : Tarifs préférés du client pour ce métier
  const preferredRates = prefs.preferredRates[detectedJob] || [];
  preferredRates.forEach(rate => {
    if (!existingRates.has(rate)) {
      completionSuggestions.push({
        text: `${text.trim()} ${rate}€/h`,
        category: 'rate',
        priority: 10, // Priorité maximale
        description: 'Votre tarif habituel'
      });
    }
  });
  
  // PRIORITÉ 2 : Tarif moyen de la ville
  if (prefs.cityRates[detectedCity]) {
    const cityRate = prefs.cityRates[detectedCity];
    if (!existingRates.has(cityRate) && !preferredRates.includes(cityRate)) {
      completionSuggestions.push({
        text: `${text.trim()} ${cityRate}€/h`,
        category: 'rate',
        priority: 9,
        description: `Tarif moyen à ${detectedCity}`
      });
    }
  }
  
  // PRIORITÉ 3 : Tarifs par défaut du métier
  const defaultRates = getDefaultRatesForJob(detectedJob);
  defaultRates.forEach(rate => {
    if (!existingRates.has(rate) && !preferredRates.includes(rate)) {
      completionSuggestions.push({
        text: `${text.trim()} ${rate}€/h`,
        category: 'rate',
        priority: 7
      });
    }
  });
  
  // Limiter à 5 suggestions au total
  completionSuggestions.sort((a, b) => b.priority - a.priority);
  // ... garder seulement les 5 meilleures ...
}
```

### 2.4 Afficher les préférences dans l'interface

**Fichier** : `src/App.tsx`
- **Section** : Suggestions de tarifs

**Interface** :
```typescript
// Afficher "Votre tarif habituel" si disponible
{preferredRates.length > 0 && (
  <div className="mb-2">
    <span className="text-xs text-slate-500">Votre tarif habituel : </span>
    {preferredRates[0]}€/h
    <span className="text-xs text-slate-400 ml-1">
      (utilisé {prefs.history.filter(h => h.job === detectedJob && h.rate === preferredRates[0]).length} fois)
    </span>
  </div>
)}
```

**Temps estimé** : 3-4 heures
**Priorité** : 🟡 IMPORTANT

---

## 🎯 PHASE 3 : Intelligence Contextuelle (PRIORITÉ BASSE)

**Objectif** : Suggestions basées sur le marché et le contexte.

### 3.1 Ajouter des tarifs moyens par métier/ville

**Fichier** : `src/lib/marketRates.ts` (NOUVEAU)

**Structure** :
```typescript
// Tarifs moyens du marché par métier et ville
const MARKET_RATES: Record<string, Record<string, number>> = {
  'Serveur / Serveuse': {
    'Paris': 16,
    'Lyon': 14,
    'Marseille': 14,
    'Lille': 13,
    'default': 13
  },
  'Cuisinier': {
    'Paris': 18,
    'Lyon': 16,
    'Marseille': 16,
    'Lille': 15,
    'default': 15
  },
  // ... autres métiers
};

export function getMarketRate(job: string, city: string): number | null {
  const jobRates = MARKET_RATES[job];
  if (!jobRates) return null;
  
  return jobRates[city] || jobRates['default'] || null;
}
```

### 3.2 Intégrer les tarifs du marché dans les suggestions

**Fichier** : `src/lib/smartSuggestions.ts`

**Modification** :
```typescript
import { getMarketRate } from './marketRates';

// Dans generateSmartSuggestions(), section tarifs
const marketRate = getMarketRate(detectedJob, detectedCity);
if (marketRate && !existingRates.has(marketRate)) {
  completionSuggestions.push({
    text: `${text.trim()} ${marketRate}€/h`,
    category: 'rate',
    priority: 8,
    description: `Tarif moyen du marché à ${detectedCity}`
  });
}
```

### 3.3 Suggestions basées sur l'urgence

**Fichier** : `src/lib/smartSuggestions.ts`

**Logique** :
```typescript
// Si "urgent" dans le texte, suggérer des tarifs plus élevés
const isUrgent = textLower.includes('urgent') || textLower.includes('asap');
if (isUrgent && missing.missingRate) {
  const baseRate = defaultRates[0] || 15;
  const urgentRates = [baseRate + 2, baseRate + 3, baseRate + 5];
  urgentRates.forEach(rate => {
    if (rate >= 10 && rate <= 30 && !existingRates.has(rate)) {
      completionSuggestions.push({
        text: `${text.trim()} ${rate}€/h`,
        category: 'rate',
        priority: 9,
        description: 'Tarif mission urgente'
      });
    }
  });
}
```

### 3.4 Statistiques et insights

**Fichier** : `src/components/RateInsights.tsx` (NOUVEAU)

**Interface** :
```typescript
// Afficher des insights sur les tarifs
<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
  <p className="text-xs text-blue-800">
    💡 À {city}, les annonces de {job} avec un tarif de {suggestedRate}€/h 
    reçoivent en moyenne 30% plus de candidatures.
  </p>
</div>
```

**Temps estimé** : 5-6 heures
**Priorité** : 🟢 OPTIONNEL

---

## 📋 Checklist d'implémentation

### Phase 1 (Rapide)
- [ ] Modifier `smartSuggestions.ts` ligne 289 : `slice(0, 2)` → `slice(0, 5)`
- [ ] Ajouter génération de plage de tarifs autour du tarif de base
- [ ] Ajouter bouton "Tarif personnalisé" dans les suggestions
- [ ] Ajouter boutons rapides (10, 12, 13, 14, 15, 16, 18, 20, 22, 25) dans module "Informations à compléter"
- [ ] Tester avec différents métiers et villes

### Phase 2 (Apprentissage)
- [ ] Créer `src/lib/clientPreferences.ts`
- [ ] Implémenter `getClientPreferences()`, `saveClientPreferences()`, `addJobToHistory()`
- [ ] Intégrer `addJobToHistory()` dans le flux de publication
- [ ] Modifier `smartSuggestions.ts` pour utiliser les préférences
- [ ] Afficher "Votre tarif habituel" dans l'interface
- [ ] Tester l'apprentissage sur plusieurs annonces

### Phase 3 (Intelligence)
- [ ] Créer `src/lib/marketRates.ts` avec tarifs moyens
- [ ] Intégrer les tarifs du marché dans les suggestions
- [ ] Ajouter suggestions basées sur l'urgence
- [ ] Créer composant `RateInsights.tsx` pour les statistiques
- [ ] Tester les suggestions contextuelles

---

## 🎯 Ordre d'implémentation recommandé

1. **Phase 1.1** : Augmenter le nombre de suggestions (5 min)
2. **Phase 1.2** : Générer plage de tarifs (15 min)
3. **Phase 1.3** : Bouton "Tarif personnalisé" (20 min)
4. **Phase 1.4** : Boutons rapides dans module (30 min)
5. **Phase 2.1** : Système de stockage (1h)
6. **Phase 2.2** : Intégration apprentissage (30 min)
7. **Phase 2.3** : Utilisation préférences (1h)
8. **Phase 2.4** : Affichage préférences (30 min)
9. **Phase 3** : Intelligence contextuelle (optionnel, 5-6h)

---

## 📊 Métriques de succès

- **Phase 1** : Utilisateur peut choisir parmi 5+ tarifs au lieu de 2
- **Phase 2** : Après 3 annonces, les suggestions sont personnalisées
- **Phase 3** : Suggestions contextuelles pertinentes (marché, urgence)

---

## 🔄 Améliorations futures (post-MVP)

- Synchronisation cloud des préférences (si utilisateur connecté)
- Machine learning pour prédire les tarifs optimaux
- A/B testing automatique des tarifs
- Analytics des performances par tarif

