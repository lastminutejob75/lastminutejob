# 🎯 Intégration Capability Graph + LLM pour LastMinuteJob

## 📋 Vue d'ensemble

Cette intégration enrichit la génération d'annonces avec le **Capability Graph** d'UWi pour :
- ✅ Améliorer la qualité des annonces générées
- ✅ Suggérer des prix réalistes basés sur le marché
- ✅ Mentionner les compétences critiques
- ✅ Adapter le ton selon le domaine

## 🏗️ Architecture

```
Prompt utilisateur
    ↓
[1] Détection métier (jobEngine.ts) ← EXISTANT
    ↓
[2] Matching Capability Graph ← NOUVEAU
    ├─ Recherche de capabilities par tags métier
    ├─ Récupération des providers pertinents
    └─ Extraction des métadonnées de marché
    ↓
[3] Enrichissement du prompt LLM ← NOUVEAU
    ├─ Contexte métier détecté
    ├─ Capability trouvée
    ├─ Données de marché (prix, délais)
    └─ Compétences critiques
    ↓
[4] Génération LLM enrichie ← AMÉLIORÉE
    ↓
Annonce optimisée + Métadonnées enrichies
```

## 📁 Fichiers créés/modifiés

### Nouveaux fichiers

1. **`src/lib/capabilityGraphEnricher.ts`**
   - Module d'enrichissement côté client
   - Fonctions : `matchCapabilityFromJob`, `getProvidersForCapability`, `extractMarketData`
   - Utilisable dans le frontend React

2. **`supabase/functions/uwi-announce-enriched/index.ts`**
   - Edge Function enrichie avec Capability Graph
   - Version améliorée de `uwi-announce`
   - Intègre le matching et l'enrichissement avant l'appel LLM

3. **`scripts/test-capability-graph-integration.js`**
   - Script de test pour vérifier l'intégration
   - Teste avec plusieurs métiers et vérifie l'enrichissement

## 🔧 Configuration requise

### Variables d'environnement Supabase

⚠️ **IMPORTANT** : LastMinuteJob utilise son **propre Supabase séparé** d'UWi.

**UWi garde** : `https://gywhqtlebvvauxzmdavb.supabase.co` ✅

**LastMinuteJob doit utiliser** : Un nouveau Supabase à créer 🆕

Pour que l'enrichissement fonctionne, vous devez :

1. **Créer un nouveau projet Supabase** pour LastMinuteJob (voir `MIGRATION_NOUVEAU_SUPABASE.md`)
2. **Configurer dans les secrets Supabase Edge Functions** :
   - **`LMJ_SUPABASE_URL`** (recommandé) ou **`SUPABASE_URL`** : URL du nouveau projet Supabase LastMinuteJob
   - ⚠️ **NE PAS utiliser** l'URL Supabase d'UWi (`gywhqtlebvvauxzmdavb`)

2. **`LMJ_SUPABASE_SERVICE_ROLE_KEY`** (recommandé) ou **`SUPABASE_SERVICE_ROLE_KEY`** : Clé service role LastMinuteJob
   - ⚠️ **Important** : Utilisez la SERVICE_ROLE_KEY du projet LastMinuteJob, pas celle d'UWi
   - Trouvable dans : Dashboard Supabase LastMinuteJob → Settings → API → `service_role` key

3. **`OPENAI_API_KEY`** : Clé OpenAI (déjà configurée)
   - Pour l'appel LLM

**Voir `SEPARATION_SUPABASE.md` pour plus de détails sur la séparation des bases de données.**

### Tables Supabase requises

Le Capability Graph nécessite ces tables dans Supabase :

- ✅ `capabilities` : Capacités disponibles (55 enregistrements présents)
- ✅ `providers` : Providers (SaaS, agents, humains, robots) (100 enregistrements présents)
- ✅ `capability_providers` : Relations capabilities ↔ providers (50 enregistrements présents)
- ✅ `intentions` : Intentions utilisateur (20 enregistrements présents)
- ✅ `intention_capabilities` : Relations intentions ↔ capabilities (28 enregistrements présents)

**✅ Toutes les tables sont déjà présentes dans le Supabase de LastMinuteJob !**

Voir `CAPABILITY_GRAPH_STATUS.md` pour plus de détails.

## 🚀 Déploiement

### Étape 1 : Déployer l'Edge Function enrichie

```bash
cd /Users/actera/Downloads/lastminutejob-restored

# Installer Supabase CLI si pas déjà fait
npm install -g supabase

# Se connecter à Supabase
supabase login

# Lier le projet
supabase link --project-ref YOUR_PROJECT_REF

# Déployer la fonction
supabase functions deploy uwi-announce-enriched
```

### Étape 2 : Configurer les secrets

Dans le Dashboard Supabase :

1. Allez dans **Edge Functions** → **uwi-announce-enriched** → **Settings**
2. Ajoutez les secrets :
   - `SUPABASE_URL` : Votre URL Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` : Votre clé service role
   - `OPENAI_API_KEY` : Votre clé OpenAI (si pas déjà configurée)

### Étape 3 : Vérifier le Capability Graph

Le Capability Graph est déjà présent dans le Supabase de LastMinuteJob !

Pour vérifier :
```bash
node scripts/check-capability-graph.js
```

**Résultat attendu** : Toutes les tables sont présentes avec des données.

## 🧪 Tests

### Test 1 : LLM de base (sans enrichissement)

```bash
node scripts/test-llm-announcement.js
```

Vérifie que le LLM fonctionne sans le Capability Graph.

### Test 2 : Intégration complète (avec enrichissement)

```bash
node scripts/test-capability-graph-integration.js
```

Vérifie que :
- ✅ L'Edge Function enrichie fonctionne
- ✅ Le Capability Graph est accessible
- ✅ Les métadonnées de marché sont extraites
- ✅ Les annonces sont enrichies

## 📊 Utilisation dans le code

### Option A : Utiliser l'Edge Function enrichie (recommandé)

```typescript
// Dans votre composant React
const response = await fetch(`${SUPABASE_URL}/functions/v1/uwi-announce-enriched`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
  },
  body: JSON.stringify({ 
    prompt: "Je cherche un serveur pour ce week-end",
    detectedJob: { jobKey: "server", confidence: 0.9 }
  }),
});

const data = await response.json();
// data.announcement : Annonce générée
// data.enrichment : Métadonnées enrichies (capability, marketData)
```

### Option B : Utiliser le module côté client

```typescript
import { enrichAnnouncementContext, generateEnrichedPrompt } from './lib/capabilityGraphEnricher';
import { detectJob } from './lib/jobDetection';

// Détecter le métier
const detectedJob = await detectJob(userPrompt);

// Enrichir avec le Capability Graph
const context = await enrichAnnouncementContext(detectedJob, userPrompt);

// Générer le prompt enrichi
const enrichedPrompt = generateEnrichedPrompt(userPrompt, context);

// Utiliser enrichedPrompt pour l'appel LLM
```

## 🎯 Mapping métiers → Capability Graph

Le système mappe automatiquement les métiers LastMinuteJob vers des tags du Capability Graph, **uniquement pour les métiers humains** :

| Métier LMJ | Tags Capability Graph |
|------------|----------------------|
| `server` | service, restaurant, hospitality, terrain, humain, recrutement_terrain |
| `cook` | cuisine, restaurant, hospitality, terrain, humain, recrutement_terrain |
| `delivery_driver` | livraison, logistique, transport, terrain, humain, recrutement_terrain |
| `warehouse_worker` | entrepôt, logistique, manutention, terrain, humain, recrutement_terrain |
| ... | ... |

**⚠️ Important** : Seuls les providers de type `"human"` sont utilisés. Les SaaS, agents IA et robots sont exclus.

Vous pouvez étendre ce mapping dans `capabilityGraphEnricher.ts` → `mapJobToCapabilityTags()`.

Voir `CAPABILITY_GRAPH_ADAPTATION.md` pour plus de détails sur l'adaptation pour métiers humains.

## 📈 Métadonnées extraites (adaptées pour métiers humains)

L'enrichissement extrait automatiquement, **uniquement depuis les providers "human"** :

1. **Tarifs horaires moyens** : `avgPrice`, `priceRange` (min/max) en €/h
2. **Durée typique de mission** : `typicalDuration` (en jours)
3. **Compétences/qualifications** : `criticalSkills` (top 5) - focus terrain
4. **Spécialités** : `specialties` (top 5) - métiers spécifiques

Ces données sont injectées dans le prompt LLM pour améliorer la qualité des annonces avec des informations pertinentes pour les métiers humains.

## 🔍 Dépannage

### Problème : L'enrichissement ne fonctionne pas

**Symptômes** : Les tests passent mais `enrichment` est `null`

**Solutions** :
1. Vérifier que `SUPABASE_SERVICE_ROLE_KEY` est configurée dans les secrets
2. Vérifier que les tables du Capability Graph existent
3. Vérifier que le Capability Graph contient des données
4. Vérifier les logs de l'Edge Function dans Supabase Dashboard

### Problème : Erreur "capabilities table not found"

**Solution** : Le Capability Graph n'est pas déployé dans ce projet Supabase. Vous devez :
- Soit utiliser le même Supabase que le projet UWi principal
- Soit migrer les tables du Capability Graph dans ce projet

### Problème : Temps de réponse trop long

**Symptômes** : Plus de 10 secondes pour générer une annonce

**Solutions** :
1. Limiter le nombre de providers récupérés (actuellement 5)
2. Mettre en cache les résultats de matching
3. Utiliser des requêtes parallèles

## 📝 Prochaines étapes

1. ✅ **Déployer l'Edge Function enrichie**
2. ✅ **Configurer les secrets Supabase**
3. ✅ **Tester l'intégration**
4. 🔄 **Intégrer dans l'interface utilisateur** (modifier `llmAnnounce.ts` pour utiliser la version enrichie)
5. 🔄 **Ajouter le Contexte Graph** (historique, préférences utilisateur)
6. 🔄 **Optimiser les performances** (cache, requêtes parallèles)

## 🎉 Résultat attendu

Avec cette intégration, les annonces générées seront :
- ✅ Plus précises (contexte métier enrichi)
- ✅ Plus réalistes (prix basés sur le marché)
- ✅ Plus complètes (compétences critiques mentionnées)
- ✅ Mieux adaptées (ton selon le domaine)

---

**Note** : Cette intégration est optionnelle. Si le Capability Graph n'est pas disponible, le système fonctionne toujours avec le LLM de base.

