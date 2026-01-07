# 🎯 Adaptation du Capability Graph pour LastMinuteJob

## 📋 Contexte

LastMinuteJob se concentre **uniquement sur les métiers humains/terrain**, contrairement à UWi qui inclut aussi SaaS, agents IA, robots, etc.

## ✅ Adaptations effectuées

### 1. Filtrage des providers

**Avant** : Tous les types de providers (saas, agent, human, robot)  
**Après** : Uniquement les providers de type `"human"`

```typescript
// Dans capabilityGraphEnricher.ts et uwi-announce-enriched/index.ts
.eq("type", "human") // ⚠️ FILTRE IMPORTANT
```

### 2. Mapping métiers → tags adapté

Les tags sont maintenant orientés "recrutement terrain" :

```typescript
server: ["service", "restaurant", "hospitality", "terrain", "humain", "recrutement_terrain"]
delivery_driver: ["livraison", "logistique", "transport", "terrain", "humain", "recrutement_terrain"]
// etc.
```

### 3. Métadonnées adaptées pour métiers humains

**Tarifs** :
- Format : `€/h` (tarif horaire)
- Fourchette de prix adaptée au marché des métiers humains
- Suggestions de tarifs réalistes

**Délais** :
- Format : "X jours" ou "X-Y jours" (durée de mission)
- Plus pertinent pour les missions ponctuelles

**Compétences** :
- Focus sur les compétences terrain
- Qualifications pratiques (ex: permis de conduire, HACCP, etc.)
- Expérience terrain plutôt que techniques

### 4. Prompt LLM enrichi

Le prompt inclut maintenant :
- Contexte "MÉTIERS HUMAINS"
- Tarifs horaires moyens du marché
- Compétences/qualifications importantes
- Durée typique de mission

## 🔍 Vérification

Pour vérifier que seuls les providers "human" sont utilisés :

```bash
# Dans Supabase SQL Editor
SELECT type, COUNT(*) 
FROM providers 
GROUP BY type;

-- Devrait montrer des providers "human" disponibles
SELECT COUNT(*) 
FROM providers 
WHERE type = 'human';
```

## 📊 Résultat attendu

Avec ces adaptations, le Capability Graph pour LastMinuteJob :

✅ **Filtre automatiquement** les métiers humains uniquement  
✅ **Suggère des tarifs horaires** réalistes (ex: 12-15€/h pour serveur)  
✅ **Mentionne les compétences terrain** pertinentes  
✅ **Adapte le ton** pour les métiers de terrain  
✅ **Ignore** SaaS, agents IA, robots (non pertinents pour LMJ)

## 🎯 Métiers couverts

- ✅ Restauration / Hôtellerie (serveur, cuisinier, barman, etc.)
- ✅ Logistique / Transport (livreur, déménageur, etc.)
- ✅ Commerce / Vente (vendeur, caissier, etc.)
- ✅ BTP / Construction (électricien, plombier, etc.)
- ✅ Événementiel / Sécurité (agent de sécurité, etc.)
- ✅ Nettoyage / Entretien
- ✅ Freelance / Services

## ⚠️ Notes importantes

1. **Le Capability Graph doit contenir des providers "human"** pour que l'enrichissement fonctionne
2. **Les métiers tech/créatif** peuvent toujours être détectés mais n'auront pas d'enrichissement si aucun provider "human" ne correspond
3. **Le système fonctionne toujours sans enrichissement** si aucun provider "human" n'est trouvé

