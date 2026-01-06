# 🎯 Guide de Test - Orchestrateur LMJ Wave 1

## 📋 Prérequis

L'implémentation Wave 1 est **terminée et committée**. Avant de tester, il faut appliquer la migration SQL.

## 1️⃣ Appliquer la Migration SQL

### Option A : Via Supabase Dashboard (Recommandé)

1. Ouvrez [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet `gywhqtlebvvauxzmdavb`
3. Menu latéral → **SQL Editor**
4. Cliquez sur **"New query"**
5. Copiez tout le contenu du fichier :
   ```
   supabase/migrations/002_create_talents_table.sql
   ```
6. Collez dans l'éditeur SQL
7. Cliquez sur **"Run"** (ou `Ctrl+Enter`)

### Option B : Via Supabase CLI (Si installé)

```bash
# Se connecter à Supabase
supabase login

# Lier le projet
supabase link --project-ref gywhqtlebvvauxzmdavb

# Appliquer la migration
supabase db push
```

### ✅ Vérification de la Migration

Après avoir exécuté le SQL, vérifiez dans **Table Editor** :
- Table `talents` existe
- Contient 15 lignes (profils de test)
- Colonnes : `id`, `job_keys`, `city`, `rating`, `status`, etc.

## 2️⃣ Lancer l'Application en Dev

```bash
npm run dev
```

Ouvrez : http://localhost:5173 (ou le port affiché)

## 3️⃣ Tests Fonctionnels

### Test 1 : Matching avec talents disponibles

**Prompt à tester :**
```
Besoin d'un serveur pour demain soir à Paris
```

**Résultat attendu :**
- ✅ Annonce générée
- ✅ Section verte "X talents trouvés !"
- ✅ Affichage de 3 profils de serveurs à Paris :
  - Sophie M. (rating 4.8)
  - Marc D. (rating 4.5)
  - Julie L. (rating 4.2)
- ✅ Disponibilité affichée
- ✅ Score de confiance > 70%

### Test 2 : Matching avec autre métier

**Prompt à tester :**
```
Cherche un cuisinier à Lyon pour jeudi
```

**Résultat attendu :**
- ✅ Annonce générée
- ✅ 2 talents trouvés (Pierre B. et Thomas R.)
- ✅ Localisation : Lyon
- ✅ Compétences affichées

### Test 3 : Matching avec livreur

**Prompt à tester :**
```
Besoin d'un livreur à Marseille urgent
```

**Résultat attendu :**
- ✅ 1 talent trouvé (Ahmed K.)
- ✅ Disponibilité : disponible
- ✅ Raisons du match : "Métier : livreur", "Ville : Marseille"

### Test 4 : Aucun match

**Prompt à tester :**
```
Besoin d'un développeur à Strasbourg
```

**Résultat attendu :**
- ✅ Annonce générée normalement
- ❌ Aucun talent affiché (pas de section verte)
- ✅ Message "Publication sans matching automatique"

## 4️⃣ Vérifier les Métriques

Ouvrez la **Console du navigateur** (F12) et cherchez les logs :

```
[LMJLanding] 🎯 Orchestration du besoin...
[LMJOrchestrator] Found X matching talents
[LMJLanding] ✅ Orchestration terminée : {
  matches: X,
  confidence: 0.XX,
  estimatedTime: "< 2 heures",
  stats: { parseTime: XX, matchTime: XX, totalTime: XX }
}
```

## 5️⃣ Vérifier l'UI

### Section Talents Matchés (si matches > 0)

- **Header** : "X talent(s) trouvé(s) !" avec icône CheckCircle verte
- **Temps estimé** : "< 2 heures" affiché
- **Cartes talents** (max 3 affichés) :
  - Nom + initiale du nom de famille
  - Rating (étoile jaune si ≥ 4.5)
  - Ville + distance
  - Badge disponibilité (vert/jaune/gris)
  - Raisons du match (badges bleus)
  - Compétences (badges gris)
  - Historique missions
- **Indicateur "+" si plus de 3 talents**
- **Score de confiance** en bas

### Section Draft (toujours affichée)

- Métier
- Description
- Missions
- Prérequis
- Tags

## 6️⃣ Tests de Performance

### Temps attendus (visibles dans stats)

- `parseTime` : < 50ms
- `matchTime` : < 200ms (avec 15 talents)
- `totalTime` : < 1000ms (incluant LLM si activé)

## 7️⃣ Tests de Robustesse

### Test avec erreur DB

1. Temporairement, cassez les credentials Supabase dans `.env.local`
2. Testez un prompt
3. **Résultat attendu** :
   - ✅ Annonce générée (fallback)
   - ❌ Aucun talent (erreur matching silencieuse)
   - ✅ Pas de crash

### Test avec ville inconnue

**Prompt :**
```
Besoin d'un serveur à Trifouilly-les-Oies
```

**Résultat attendu :**
- ✅ Annonce générée
- ❌ Aucun talent trouvé (ville non matchée)

## 📊 Données de Test Disponibles

Les 15 profils de test couvrent :

| Métier | Ville | Count |
|--------|-------|-------|
| server | Paris | 3 |
| bartender | Paris | 2 |
| cook | Lyon | 2 |
| delivery | Marseille, Toulouse | 2 |
| security | Paris | 1 |
| cleaner | Lyon | 1 |
| cashier | Bordeaux | 1 |
| waiter | Nice | 1 |
| barista | Lille | 1 |
| dishwasher | Nantes | 1 |

## 🐛 Problèmes Connus / Limites V1

1. **Matching exact uniquement** : Si la ville est légèrement différente (ex: "Paris 15" vs "Paris"), pas de match
2. **Pas de scoring avancé** : Tous les matches ont score = 100%
3. **Pas de géolocalisation** : Distance non calculée (prévu V2)
4. **Pas de notifications** : Talents non notifiés automatiquement (prévu V2)

## ✅ Checklist de Validation

- [ ] Migration SQL appliquée
- [ ] Application démarre sans erreur
- [ ] Test 1 : Match serveur Paris réussi
- [ ] Test 2 : Match cuisinier Lyon réussi
- [ ] Test 3 : Match livreur Marseille réussi
- [ ] Test 4 : Pas de match développeur
- [ ] Console logs visibles et corrects
- [ ] UI talents affichée correctement
- [ ] Métriques de performance < 1s
- [ ] Pas de crash en cas d'erreur DB

## 🚀 Prochaines Étapes (Wave 2)

Après validation de Wave 1 :
1. Notifications automatiques par email/SMS
2. Scoring multi-critères avancé
3. Calcul de distance géographique réel
4. Filtre par disponibilité calendaire
5. Learning : historique des matches réussis

---

**Questions ?** Ouvrez une issue ou contactez l'équipe dev.
