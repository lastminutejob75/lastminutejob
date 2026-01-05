# 🏗️ Architecture Cible - Agent IA Orchestrateur LMJ

## 📅 Date : 2026-01-05
## 🎯 Objectif : Automatiser le matching recruteur ↔ talent en temps réel

---

## 🌟 Vision Globale

**LastMinuteJob devient un véritable assistant IA de recrutement qui :**
1. Comprend le besoin en langage naturel
2. Trouve automatiquement les talents matchants
3. Notifie les candidats pertinents en temps réel
4. Propose une sélection validée au recruteur
5. Facilite la prise de contact et le suivi

**Délai cible entre "j'ai besoin" → "la personne commence" : < 2 heures**

---

## 🏛️ Architecture Cible

```
┌─────────────────────────────────────────────────────────────────┐
│                        UTILISATEUR                               │
│   "Je cherche 2 serveurs pour ce soir à Lille"                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  🤖 LMJ ORCHESTRATOR                             │
│                  (Point d'entrée unique)                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  process(prompt: string): Promise<OrchestratedResult>    │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────┬────────────────────────────────────────────────────────┘
         │
         ├──────────────────────────────────────────────┐
         │                                              │
         ▼                                              ▼
┌──────────────────────┐                    ┌──────────────────────┐
│   1️⃣ ANALYSE PHASE   │                    │   🗄️ CONTEXT STORE   │
│                      │                    │   (Mémoire)          │
│  ┌────────────────┐ │                    │                      │
│  │ NLP Parser     │ │◄───────────────────┤  - Historique        │
│  │ ├─ jobEngine   │ │                    │  - Préférences       │
│  │ ├─ smartParser │ │                    │  - Patterns appris   │
│  │ └─ LLM enhance │ │                    │  - Stats matching    │
│  └────────────────┘ │                    │                      │
│                      │                    └──────────────────────┘
│  Output: ParsedNeed  │
│  {                   │
│    job, location,    │
│    urgency, context  │
│  }                   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│              2️⃣ MATCHING ENGINE (NOUVEAU - CORE)                  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  SmartMatcher                                           │    │
│  │  ┌─────────────────────────────────────────────────┐   │    │
│  │  │ Scoring Multi-critères                          │   │    │
│  │  │  ├─ Localisation (distance km)         40%      │   │    │
│  │  │  ├─ Disponibilité (temps réel)         30%      │   │    │
│  │  │  ├─ Compétences (skills match)         20%      │   │    │
│  │  │  └─ Historique (rating, fiabilité)     10%      │   │    │
│  │  └─────────────────────────────────────────────────┘   │    │
│  │                                                         │    │
│  │  SELECT * FROM talents                                 │    │
│  │  WHERE job_key = detected_job                          │    │
│  │    AND city = detected_city (ou proche)                │    │
│  │    AND available_from <= target_date                   │    │
│  │    AND status = 'active'                               │    │
│  │  ORDER BY match_score DESC                             │    │
│  │  LIMIT 10                                              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  Output: MatchedTalent[]                                         │
│  [                                                                │
│    { id, name, score: 0.92, distance: "2km", available: true }, │
│    { id, name, score: 0.87, distance: "5km", available: true }, │
│    ...                                                            │
│  ]                                                                │
└──────────┬────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│           3️⃣ NOTIFICATION ENGINE (NOUVEAU - CORE)                 │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  NotificationDispatcher                                 │    │
│  │                                                         │    │
│  │  Pour chaque talent matché (top 3-5) :                 │    │
│  │                                                         │    │
│  │  ┌──────────────────────────────────────────────┐     │    │
│  │  │ 1. Créer notification en DB                  │     │    │
│  │  │    - job_id, talent_id, match_score          │     │    │
│  │  │    - status: "pending"                       │     │    │
│  │  └──────────────────────────────────────────────┘     │    │
│  │                                                         │    │
│  │  ┌──────────────────────────────────────────────┐     │    │
│  │  │ 2. Envoyer via canaux multiples              │     │    │
│  │  │    ├─ Push (si app mobile)                   │     │    │
│  │  │    ├─ SMS (si urgent + préférence)           │     │    │
│  │  │    └─ Email (toujours)                       │     │    │
│  │  └──────────────────────────────────────────────┘     │    │
│  │                                                         │    │
│  │  ┌──────────────────────────────────────────────┐     │    │
│  │  │ 3. Message personnalisé                      │     │    │
│  │  │   "Nouvelle mission : Serveur ce soir        │     │    │
│  │  │    à Lille - 19h-23h - 15€/h                 │     │    │
│  │  │    📍 2km de vous - Accepter en 1 clic"      │     │    │
│  │  └──────────────────────────────────────────────┘     │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────┬────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│              4️⃣ PROPOSAL BUILDER                                  │
│                                                                   │
│  Construit la réponse pour le recruteur :                        │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  {                                                      │    │
│  │    jobDraft: { ... },  // Annonce générée              │    │
│  │    matches: [          // Top talents                  │    │
│  │      {                                                  │    │
│  │        id: "tal_123",                                   │    │
│  │        name: "Sophie M.",                               │    │
│  │        score: 0.92,                                     │    │
│  │        distance: "2km",                                 │    │
│  │        available: true,                                 │    │
│  │        rating: 4.8,                                     │    │
│  │        lastMissions: 12,                                │    │
│  │        notified: true,                                  │    │
│  │        status: "pending"  // en attente de réponse      │    │
│  │      },                                                 │    │
│  │      { ... },                                           │    │
│  │      { ... }                                            │    │
│  │    ],                                                   │    │
│  │    actions: [                                           │    │
│  │      { type: "publish_job", label: "Publier" },        │    │
│  │      { type: "contact_talent", talentId: "tal_123" },  │    │
│  │      { type: "modify_draft", ... }                     │    │
│  │    ],                                                   │    │
│  │    estimatedTime: "< 2 heures",                         │    │
│  │    confidence: 0.89                                     │    │
│  │  }                                                      │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────┬────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│                    💬 INTERFACE UTILISATEUR                       │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  "✅ Voici 3 serveurs disponibles ce soir à Lille :"       │ │
│  │                                                             │ │
│  │  🥇 Sophie M. - Score 92% - 2km - ⭐ 4.8 - Notifiée ✉️     │ │
│  │     [Voir profil] [Contacter]                              │ │
│  │                                                             │ │
│  │  🥈 Lucas D. - Score 87% - 5km - ⭐ 4.6 - Notifié ✉️       │ │
│  │     [Voir profil] [Contacter]                              │ │
│  │                                                             │ │
│  │  🥉 Emma L. - Score 81% - 3km - ⭐ 4.9 - Notifiée ✉️       │ │
│  │     [Voir profil] [Contacter]                              │ │
│  │                                                             │ │
│  │  [Publier l'annonce] [Modifier] [Chercher d'autres]       │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Structure des Données

### **Nouvelle Table : `talents`**
```sql
CREATE TABLE talents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),

  -- Infos métier
  job_keys TEXT[] NOT NULL,  -- ["server", "bartender"]
  skills TEXT[],              -- ["service", "cocktails", "caisse"]
  experience_years INTEGER,
  languages TEXT[],           -- ["fr", "en"]

  -- Localisation
  city TEXT NOT NULL,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  mobility_radius_km INTEGER DEFAULT 10,

  -- Disponibilité
  available_from TIMESTAMP,
  available_to TIMESTAMP,
  available_days TEXT[],      -- ["lundi", "mardi", "vendredi"]
  available_hours JSONB,      -- { "lundi": ["9h-18h"], ... }

  -- Préférences
  min_hourly_rate DECIMAL(10, 2),
  max_hourly_rate DECIMAL(10, 2),
  preferred_contract_types TEXT[],  -- ["extra", "cdd", "cdi"]

  -- Réputation
  rating DECIMAL(3, 2) DEFAULT 0.0,
  total_missions INTEGER DEFAULT 0,
  completed_missions INTEGER DEFAULT 0,
  cancellation_rate DECIMAL(5, 2) DEFAULT 0.0,

  -- Statut
  status TEXT DEFAULT 'active',  -- active, inactive, suspended

  -- Notifications
  notification_preferences JSONB,  -- { "push": true, "sms": true, "email": true }

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_talents_job_keys ON talents USING GIN(job_keys);
CREATE INDEX idx_talents_city ON talents(city);
CREATE INDEX idx_talents_available_from ON talents(available_from);
CREATE INDEX idx_talents_status ON talents(status);
CREATE INDEX idx_talents_location ON talents(lat, lng);
```

### **Nouvelle Table : `talent_notifications`**
```sql
CREATE TABLE talent_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id),
  talent_id UUID REFERENCES talents(id),

  match_score DECIMAL(5, 4),  -- 0.0000 à 1.0000

  -- Statut notification
  status TEXT DEFAULT 'pending',  -- pending, sent, seen, accepted, rejected
  sent_at TIMESTAMP,
  seen_at TIMESTAMP,
  responded_at TIMESTAMP,

  -- Canaux utilisés
  channels_sent TEXT[],  -- ["email", "push", "sms"]

  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Table modifiée : `jobs`**
```sql
-- Ajouts à la table jobs existante
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS orchestration_result JSONB;
-- Stocke le résultat de l'orchestration pour traçabilité
```

---

## 🔄 Flux Détaillé : Exemple Concret

### **Scénario : Restaurant cherche serveurs urgents**

```
T+0s    Recruteur : "Je cherche 2 serveurs pour ce soir à Lille"
        │
        ▼
T+0.5s  🤖 Orchestrator.process()
        │
        ├─► Parsing
        │   └─► Détecté : {
        │         job: "server",
        │         count: 2,
        │         date: "2026-01-05 19:00",
        │         city: "Lille",
        │         urgency: "high"
        │       }
        │
T+1s    ├─► Matching
        │   └─► SQL Query :
        │       SELECT * FROM talents
        │       WHERE 'server' = ANY(job_keys)
        │         AND city = 'Lille'
        │         AND available_from <= '2026-01-05 19:00'
        │         AND status = 'active'
        │       ORDER BY (
        │         distance_score * 0.4 +
        │         availability_score * 0.3 +
        │         skills_score * 0.2 +
        │         rating_score * 0.1
        │       ) DESC
        │       LIMIT 10
        │
        │   └─► Résultat : 10 talents trouvés
        │
T+2s    ├─► Notification (async)
        │   ├─► Talent #1 (Sophie) : Email + Push ✅
        │   ├─► Talent #2 (Lucas)  : Email + SMS  ✅
        │   ├─► Talent #3 (Emma)   : Email + Push ✅
        │   ├─► Talent #4 (Marc)   : Email        ✅
        │   └─► Talent #5 (Julie)  : Email + Push ✅
        │
T+2.5s  └─► Proposal Builder
            └─► Return {
                  jobDraft: { title, description, ... },
                  matches: [Sophie, Lucas, Emma],
                  notified: 5,
                  estimatedTime: "< 2h"
                }
        │
        ▼
T+3s    Recruteur voit : "3 serveurs disponibles - notifiés ✅"

        ┌──────────────────────────────────┐
        │ En attente de réponse...         │
        └──────────────────────────────────┘
        │
T+15min ├─► Sophie répond : "✅ Accepte"
        │   └─► Status: "accepted" → Notification au recruteur
        │
T+25min ├─► Lucas répond : "✅ Accepte"
        │   └─► Status: "accepted" → Notification au recruteur
        │
T+30min └─► Recruteur : "✅ 2/2 serveurs confirmés - Mission complete !"
```

**Temps total : 30 minutes** ⚡

---

## 🧩 Modules & Responsabilités

### **Module 1 : LMJOrchestrator** (Nouveau - Chef d'orchestre)
```typescript
class LMJOrchestrator {
  private parser: NLPParser;
  private matcher: SmartMatcher;
  private notifier: NotificationEngine;
  private proposalBuilder: ProposalBuilder;
  private contextStore: ContextStore;

  async process(prompt: string, userId: string): Promise<OrchestratedResult> {
    // 1. Parse
    const parsed = await this.parser.parse(prompt, this.contextStore);

    // 2. Match
    const matches = await this.matcher.findTalents(parsed);

    // 3. Notify (async, non-bloquant)
    this.notifier.notifyTalents(matches, parsed).catch(console.error);

    // 4. Build proposal
    const proposal = await this.proposalBuilder.build(parsed, matches);

    // 5. Save orchestration
    await this.contextStore.saveOrchestration(userId, { parsed, matches, proposal });

    return proposal;
  }
}
```

### **Module 2 : NLPParser** (Unifie l'existant)
```typescript
class NLPParser {
  private jobEngine: JobEngine;
  private smartParser: SmartParser;
  private llmClient: LLMClient;

  async parse(prompt: string, context: ContextStore): Promise<ParsedNeed> {
    // 1. Détection locale rapide
    const localParsing = {
      jobs: this.jobEngine.detectJobsFromText(prompt),
      context: this.jobEngine.extractContext(prompt),
      details: this.smartParser.extract(prompt)
    };

    // 2. Enrichissement LLM si besoin
    if (localParsing.jobs.length === 0 || localParsing.confidence < 0.7) {
      const llmEnhancement = await this.llmClient.enhance(prompt);
      return this.merge(localParsing, llmEnhancement);
    }

    return localParsing;
  }
}
```

### **Module 3 : SmartMatcher** (Nouveau - Core business)
```typescript
class SmartMatcher {
  async findTalents(need: ParsedNeed): Promise<MatchedTalent[]> {
    // Algorithme de scoring multi-critères
    const talents = await this.queryDatabase(need);

    return talents.map(talent => ({
      ...talent,
      score: this.calculateScore(talent, need),
      distance: this.calculateDistance(talent, need),
      availability: this.checkAvailability(talent, need)
    })).sort((a, b) => b.score - a.score);
  }

  private calculateScore(talent: Talent, need: ParsedNeed): number {
    const locationScore = this.scoreLocation(talent, need);      // 40%
    const availabilityScore = this.scoreAvailability(talent, need); // 30%
    const skillsScore = this.scoreSkills(talent, need);         // 20%
    const reputationScore = this.scoreReputation(talent);       // 10%

    return (
      locationScore * 0.4 +
      availabilityScore * 0.3 +
      skillsScore * 0.2 +
      reputationScore * 0.1
    );
  }
}
```

### **Module 4 : NotificationEngine** (Nouveau - Critical)
```typescript
class NotificationEngine {
  private emailService: EmailService;
  private smsService: SMSService;
  private pushService: PushNotificationService;

  async notifyTalents(
    talents: MatchedTalent[],
    job: ParsedNeed
  ): Promise<NotificationResult[]> {
    const results = [];

    for (const talent of talents.slice(0, 5)) {  // Top 5
      const notification = await this.createNotification(talent, job);

      // Envoyer via canaux préférés
      const channels = [];

      if (talent.preferences.email) {
        await this.emailService.send(talent.email, notification);
        channels.push('email');
      }

      if (talent.preferences.push && job.urgency === 'high') {
        await this.pushService.send(talent.deviceId, notification);
        channels.push('push');
      }

      if (talent.preferences.sms && job.urgency === 'high') {
        await this.smsService.send(talent.phone, notification);
        channels.push('sms');
      }

      results.push({
        talentId: talent.id,
        channels,
        sentAt: new Date()
      });
    }

    return results;
  }
}
```

### **Module 5 : ContextStore** (Nouveau - Intelligence)
```typescript
class ContextStore {
  // Stocke et apprend des interactions
  async saveOrchestration(userId: string, data: OrchestrationData) {
    // Sauvegarde pour analytics et apprentissage
  }

  async getPreferences(userId: string): Promise<UserPreferences> {
    // Récupère les préférences apprises
  }

  async updatePatterns(result: OrchestrationResult) {
    // Met à jour les patterns basés sur succès/échecs
  }
}
```

---

## 🎯 Indicateurs de Succès (KPIs)

### **Performance**
- ⏱️ Temps de réponse orchestration : < 3s
- 🎯 Précision matching : > 85%
- 📧 Taux de notification délivrée : > 95%
- 🔔 Taux de réponse talents : > 40%

### **Business**
- ⚡ Temps moyen besoin → contact : < 30 min
- ✅ Taux de mission pourvue : > 70%
- 🔄 Taux de re-booking talent : > 50%
- ⭐ Satisfaction utilisateur : > 4.5/5

### **Technique**
- 🐛 Taux d'erreur : < 1%
- 📊 Disponibilité système : > 99%
- 💾 Latence DB : < 100ms
- 🔐 Sécurité : 100% conformité RGPD

---

## 🔐 Sécurité & Conformité

### **RGPD**
- ✅ Consentement explicite notifications
- ✅ Droit à l'oubli (suppression données)
- ✅ Portabilité données
- ✅ Transparence algorithme matching

### **Sécurité**
- 🔒 Chiffrement données sensibles
- 🛡️ Rate limiting API
- 🔑 Authentification forte
- 📝 Audit logs complets

---

## 🚀 Évolutions Futures (Phase 2+)

### **Intelligence Augmentée**
- 🧠 Apprentissage automatique du matching
- 💬 Chatbot conversationnel multi-tours
- 🎯 Prédiction taux d'acceptation
- 📈 Suggestions proactives de talents

### **Automatisation Avancée**
- 🤝 Confirmation automatique si critères stricts
- 📄 Génération contrats automatique
- 💰 Gestion paiements intégrée
- 📊 Rapports analytics temps réel

### **Expansion**
- 🌍 Multi-pays / multi-langues
- 📱 App mobile native talents
- 🔗 Intégrations externes (ATS, planning, etc.)
- 🎮 Gamification (badges, niveaux talents)

---

## ✅ Critères de Validation

Avant de déployer l'orchestrateur unifié :

- [ ] Tests unitaires > 80% coverage
- [ ] Tests d'intégration E2E complets
- [ ] Performance validée (< 3s réponse)
- [ ] Notification testée (email, SMS, push)
- [ ] Algorithme matching validé sur dataset réel
- [ ] Monitoring & alerting configurés
- [ ] Documentation technique complète
- [ ] Formation équipe effectuée

---

**Document vivant - À mettre à jour au fil de l'implémentation**
