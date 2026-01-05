# 📋 Plan d'Amélioration Détaillé - Orchestrateur LMJ

## 📅 Date : 2026-01-05
## 🎯 Objectif : Transformer LMJ en assistant IA de recrutement automatisé

---

## 🌊 Approche : Développement Itératif par Vagues

Au lieu de tout reconstruire d'un coup, nous procédons par **vagues successives** avec validation à chaque étape.

---

## 🌊 VAGUE 1 : MVP Orchestrateur Unifié
**Durée estimée : 3-5 jours**
**Priorité : 🔴 CRITIQUE**
**Objectif : Point d'entrée unique + première brique de matching**

### 📦 Livrables

#### 1.1 - Créer le module `LMJOrchestrator`
**Fichier** : `src/lib/orchestrator/LMJOrchestrator.ts`
**Temps** : 4-6h

```typescript
/**
 * Point d'entrée unique pour toute orchestration LMJ
 * Unifie jobEngine + simpleAnnounce + logique métier
 */
export class LMJOrchestrator {
  async process(prompt: string, context?: UserContext): Promise<OrchestratedResult> {
    // Phase 1 : Parse
    const parsed = await this.parse(prompt, context);

    // Phase 2 : Generate job draft
    const jobDraft = await this.generateDraft(parsed);

    // Phase 3 : Match talents (NOUVEAU)
    const matches = await this.matchTalents(parsed);

    // Phase 4 : Build proposal
    return this.buildProposal(jobDraft, matches, parsed);
  }
}
```

**Dépendances** :
- ✅ Réutilise `jobEngine.ts` (détection)
- ✅ Réutilise `simpleAnnounce.ts` (génération)
- 🆕 Nouveau : module `SmartMatcher`

**Tests** :
- [ ] Test parsing : "Je cherche un serveur"
- [ ] Test génération draft
- [ ] Test matching basique
- [ ] Test performance < 3s

---

#### 1.2 - Créer la table `talents`
**Fichier** : `supabase/migrations/002_create_talents_table.sql`
**Temps** : 2-3h

```sql
-- Voir ARCHITECTURE_ORCHESTRATEUR.md pour schéma complet
CREATE TABLE talents ( ... );

-- Seed avec données de test
INSERT INTO talents (job_keys, city, status, available_from) VALUES
  (ARRAY['server'], 'Paris', 'active', NOW()),
  (ARRAY['server', 'bartender'], 'Lyon', 'active', NOW()),
  (ARRAY['cook'], 'Lille', 'active', NOW()),
  ...
```

**Tests** :
- [ ] Création table OK
- [ ] Index performants
- [ ] Contraintes respectées
- [ ] Seed data 20-30 talents tests

---

#### 1.3 - Module `SmartMatcher` (version basique)
**Fichier** : `src/lib/orchestrator/SmartMatcher.ts`
**Temps** : 6-8h

```typescript
export class SmartMatcher {
  /**
   * Version V1 : Matching simple par critères exacts
   * - Job match (exact)
   * - City match (exact)
   * - Disponibilité (date >= available_from)
   * - Status active
   *
   * Scoring V1 :
   * - 100% si tous critères OK
   * - 0% sinon
   */
  async findTalents(need: ParsedNeed): Promise<MatchedTalent[]> {
    const { data, error } = await supabase
      .from('talents')
      .select('*')
      .contains('job_keys', [need.primaryJob.jobKey])
      .eq('city', need.context.location)
      .eq('status', 'active')
      .gte('available_from', need.context.date || new Date())
      .limit(10);

    if (error) throw error;

    return data.map(talent => ({
      ...talent,
      score: 1.0,  // V1 : tous les résultats = 100%
      matchReasons: ['Job match', 'Localisation', 'Disponible']
    }));
  }
}
```

**Tests** :
- [ ] Query SQL correcte
- [ ] Gestion erreurs
- [ ] Performance < 200ms
- [ ] Résultats pertinents

---

#### 1.4 - Intégration dans `App.tsx`
**Fichier** : `src/App.tsx`
**Temps** : 3-4h

```typescript
// Remplacer l'appel direct à generateAnnouncement par :
import { LMJOrchestrator } from './lib/orchestrator/LMJOrchestrator';

const orchestrator = new LMJOrchestrator();

async function handleSubmit() {
  const result = await orchestrator.process(prompt, { userId });

  // Afficher le draft
  setDraft(result.jobDraft);

  // NOUVEAU : Afficher les matches
  setMatches(result.matches);

  // UI : "3 talents trouvés et notifiés !"
}
```

**Tests** :
- [ ] Flow complet fonctionne
- [ ] UI affiche les matches
- [ ] Pas de régression
- [ ] UX fluide

---

### 📊 Validation Vague 1

**Critères de succès** :
- ✅ Un utilisateur peut entrer un besoin
- ✅ Le système parse correctement
- ✅ Le système génère un draft
- ✅ Le système trouve des talents matchants
- ✅ L'UI affiche les 3 meilleurs talents
- ✅ Performance < 3s bout-en-bout

**Démo** :
```
Input : "Je cherche un serveur à Paris"
Output :
  - Draft annonce ✅
  - 3 serveurs trouvés à Paris ✅
  - Score 100% (tous matchent) ✅
  - Temps : 2.1s ✅
```

---

## 🌊 VAGUE 2 : Notifications Automatiques
**Durée estimée : 4-6 jours**
**Priorité : 🟠 HAUTE**
**Objectif : Contacter automatiquement les talents**

### 📦 Livrables

#### 2.1 - Table `talent_notifications`
**Fichier** : `supabase/migrations/003_create_notifications.sql`
**Temps** : 2h

```sql
CREATE TABLE talent_notifications ( ... );
-- Voir ARCHITECTURE_ORCHESTRATEUR.md
```

---

#### 2.2 - Module `NotificationEngine`
**Fichier** : `src/lib/orchestrator/NotificationEngine.ts`
**Temps** : 8-10h

```typescript
export class NotificationEngine {
  async notifyTalents(
    talents: MatchedTalent[],
    job: ParsedNeed
  ): Promise<void> {
    for (const talent of talents.slice(0, 5)) {
      // 1. Créer enregistrement notification
      await this.createNotificationRecord(talent, job);

      // 2. Envoyer email
      await this.sendEmail(talent, job);

      // 3. (Optionnel) SMS si urgent
      if (job.urgency === 'high') {
        await this.sendSMS(talent, job);
      }
    }
  }
}
```

**Dépendances** :
- 📧 Service email (SendGrid, Resend, ou Supabase edge function)
- 📱 Service SMS (Twilio, ou autre)

---

#### 2.3 - Intégration notifications
**Fichier** : `src/lib/orchestrator/LMJOrchestrator.ts`
**Temps** : 3h

```typescript
async process(prompt: string): Promise<OrchestratedResult> {
  // ... parsing et matching ...

  // NOUVEAU : Notifier (async, non-bloquant)
  this.notificationEngine
    .notifyTalents(matches, parsed)
    .catch(err => console.error('Notification error:', err));

  return result;
}
```

---

#### 2.4 - UI côté Talent (page dédiée)
**Fichier** : `src/pages/TalentNotificationsPage.tsx`
**Temps** : 6-8h

```tsx
// Page affichant les notifications reçues
function TalentNotificationsPage() {
  const notifications = useNotifications(talentId);

  return (
    <div>
      {notifications.map(notif => (
        <NotificationCard
          job={notif.job}
          score={notif.score}
          onAccept={() => acceptMission(notif)}
          onReject={() => rejectMission(notif)}
        />
      ))}
    </div>
  );
}
```

---

### 📊 Validation Vague 2

**Critères de succès** :
- ✅ Talents reçoivent emails automatiquement
- ✅ Talents peuvent accepter/refuser
- ✅ Recruteur voit statut des réponses
- ✅ Taux de délivrabilité > 95%

---

## 🌊 VAGUE 3 : Scoring Intelligent
**Durée estimée : 5-7 jours**
**Priorité : 🟡 MOYENNE**
**Objectif : Améliorer la pertinence du matching**

### 📦 Livrables

#### 3.1 - Algorithme de scoring avancé
**Fichier** : `src/lib/orchestrator/SmartMatcher.ts`
**Temps** : 10-12h

```typescript
private calculateScore(talent: Talent, need: ParsedNeed): number {
  // 1. Score localisation (40%)
  const distanceKm = this.calculateDistance(
    talent.lat, talent.lng,
    need.location.lat, need.location.lng
  );
  const locationScore = Math.max(0, 1 - (distanceKm / talent.mobility_radius_km));

  // 2. Score disponibilité (30%)
  const availabilityScore = this.checkAvailability(talent, need);

  // 3. Score compétences (20%)
  const skillsScore = this.matchSkills(talent.skills, need.requiredSkills);

  // 4. Score réputation (10%)
  const reputationScore = talent.rating / 5.0;

  return (
    locationScore * 0.4 +
    availabilityScore * 0.3 +
    skillsScore * 0.2 +
    reputationScore * 0.1
  );
}
```

---

#### 3.2 - Géolocalisation
**Intégration** : API Geocoding (Google Maps ou OpenStreetMap)
**Temps** : 4-6h

```typescript
// Convertir "Paris 15e" en lat/lng
async geocodeAddress(address: string): Promise<{lat, lng}> {
  // Appel API geocoding
}
```

---

#### 3.3 - Tests & Optimisation
**Temps** : 6-8h

- Dataset de test : 100+ talents
- Benchmark scoring
- Optimisation requêtes SQL
- Cache géolocalisation

---

### 📊 Validation Vague 3

**Critères de succès** :
- ✅ Score reflète vraiment la pertinence
- ✅ Top 3 talents = meilleurs choix
- ✅ Performances maintenues (< 3s)
- ✅ Satisfaction utilisateur validée (A/B test)

---

## 🌊 VAGUE 4 : Mémoire & Apprentissage
**Durée estimée : 4-6 jours**
**Priorité : 🟢 BASSE (mais haute valeur)**
**Objectif : Système qui s'améliore avec le temps**

### 📦 Livrables

#### 4.1 - Module `ContextStore`
**Fichier** : `src/lib/orchestrator/ContextStore.ts`
**Temps** : 8-10h

```typescript
export class ContextStore {
  // Stocker historique orchestrations
  async saveOrchestration(userId: string, data: OrchestrationData) {
    await supabase.from('orchestration_history').insert({ ... });
  }

  // Apprendre préférences utilisateur
  async getPreferences(userId: string): Promise<UserPreferences> {
    // Analyse historique → préférences
  }

  // Améliorer patterns
  async updatePatterns(result: OrchestrationResult) {
    // Si matching réussi → renforcer pattern
    // Si matching échoué → ajuster
  }
}
```

---

#### 4.2 - Table `orchestration_history`
**Fichier** : `supabase/migrations/004_orchestration_history.sql`
**Temps** : 2h

```sql
CREATE TABLE orchestration_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  prompt TEXT,
  parsed_result JSONB,
  matches JSONB,
  success BOOLEAN,
  feedback_score INTEGER,  -- 1-5
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

#### 4.3 - Analytics Dashboard
**Fichier** : `src/pages/AdminAnalytics.tsx`
**Temps** : 8-10h

- Taux de succès matching
- Temps moyen réponse
- Talents les plus sollicités
- Patterns détection métier

---

### 📊 Validation Vague 4

**Critères de succès** :
- ✅ Système apprend des interactions
- ✅ Taux de succès augmente avec le temps
- ✅ Dashboard analytics fonctionnel
- ✅ Détection patterns améliorée

---

## 📊 Récapitulatif Planning

| Vague | Objectif | Durée | Priorité | Valeur Business |
|-------|----------|-------|----------|-----------------|
| **1** | MVP Orchestrateur | 3-5j | 🔴 CRITIQUE | ⭐⭐⭐⭐⭐ |
| **2** | Notifications Auto | 4-6j | 🟠 HAUTE | ⭐⭐⭐⭐ |
| **3** | Scoring Intelligent | 5-7j | 🟡 MOYENNE | ⭐⭐⭐ |
| **4** | Mémoire & Analytics | 4-6j | 🟢 BASSE | ⭐⭐ |

**Total estimé** : 16-24 jours de développement

---

## 🎯 Quick Wins (À faire en parallèle)

### QW1 : Améliorer le parsing existant
**Temps** : 2-3h
**Impact** : Meilleure détection métiers

- Ajouter synonymes manquants
- Gérer fautes orthographe
- Supporter abréviations courantes

---

### QW2 : Seed database talents
**Temps** : 1-2h
**Impact** : Tests réalistes

- Générer 50-100 talents fictifs
- Variété de métiers, villes, disponibilités
- Permet de tester matching

---

### QW3 : Monitoring basique
**Temps** : 2-3h
**Impact** : Visibilité production

```typescript
// Logger chaque orchestration
console.log('[Orchestrator]', {
  prompt,
  parseTime,
  matchTime,
  totalTime,
  talentsFound: matches.length
});
```

---

## 🚨 Risques & Mitigations

### Risque 1 : Pas assez de talents en DB
**Impact** : Matching vide
**Mitigation** :
- Campagne recrutement talents en parallèle
- Fallback sur annonce classique si 0 match

---

### Risque 2 : Taux de réponse talents < 40%
**Impact** : Business value faible
**Mitigation** :
- Notifications attractives (design, copy)
- Incentives pour réponses rapides
- Gamification

---

### Risque 3 : Performance dégradée
**Impact** : UX médiocre
**Mitigation** :
- Optimisation SQL dès le début
- Cache géolocalisation
- Async notifications

---

### Risque 4 : Spam notifications
**Impact** : Désengagement talents
**Mitigation** :
- Rate limiting (max 5 notifs/jour par talent)
- Préférences granulaires
- Scoring pour prioriser meilleurs matchs

---

## ✅ Checklist Avant Démarrage

Avant de commencer la Vague 1 :

- [ ] **Infrastructure**
  - [ ] Supabase DB configurée
  - [ ] Migrations setup
  - [ ] Environnement dev prêt

- [ ] **Code**
  - [ ] Branch feature créée
  - [ ] Tests framework configuré
  - [ ] Linter + formatter setup

- [ ] **Business**
  - [ ] Validation concept par stakeholders
  - [ ] Priorités confirmées
  - [ ] Budget/timeline OK

- [ ] **Données**
  - [ ] Schéma DB validé
  - [ ] Plan seed data
  - [ ] Migration rollback strategy

---

## 🎯 Métriques de Succès Globales

### Après Vague 1 (MVP)
- ⏱️ Temps orchestration < 3s
- 🎯 Au moins 1 match pour 70% des requêtes
- 📊 0 crash en production

### Après Vague 2 (Notifications)
- 📧 Taux délivrabilité emails > 95%
- 🔔 Taux ouverture emails > 40%
- ⚡ Temps moyen première réponse < 30min

### Après Vague 3 (Scoring)
- 🎯 Top 3 talents pertinents dans 85% des cas
- ⭐ Satisfaction recruteurs > 4/5
- 📈 Taux de confirmation mission > 60%

### Après Vague 4 (Apprentissage)
- 📊 Amélioration continue +5% / mois
- 🧠 Patterns appris > 50
- 💡 Suggestions proactives utilisées 30%

---

## 📚 Ressources & Références

### Documentation Technique
- [Supabase Docs](https://supabase.com/docs)
- [PostGIS for Geolocation](https://postgis.net/)
- [Matching Algorithms](https://en.wikipedia.org/wiki/Matching_algorithm)

### Outils Recommandés
- **Testing** : Vitest, Playwright
- **Monitoring** : Sentry, PostHog
- **Email** : Resend, SendGrid
- **SMS** : Twilio
- **Geocoding** : Google Maps API, OpenStreetMap

---

## 🎬 Next Steps Immédiats

### Cette semaine (si on démarre aujourd'hui)
1. ✅ Valider ce plan avec l'équipe
2. 🛠️ Setup infrastructure (migrations DB)
3. 💻 Démarrer Vague 1.1 (LMJOrchestrator)
4. 🧪 Écrire premiers tests

### Semaine prochaine
5. 🚀 Finir Vague 1 (MVP)
6. 🎯 Demo interne
7. 📊 Collect feedback
8. 🔄 Itérer si besoin avant Vague 2

---

**Document vivant - Mise à jour au fil de l'implémentation**

*Dernière mise à jour : 2026-01-05*
