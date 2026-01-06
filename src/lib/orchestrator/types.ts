/**
 * Types pour l'orchestrateur LMJ
 * Définit les interfaces pour le matching talent ↔ job
 */

import type { DetectedJob, JobContext, ParsedNeed } from "../jobEngine";
import type { SimpleAnnouncementDraft } from "../simpleAnnounce";

/* ============================================
   TALENTS
============================================ */

/**
 * Profil d'un talent dans la base de données
 */
export interface Talent {
  id: string;
  user_id?: string;

  // Métier & compétences
  job_keys: string[];  // ["server", "bartender"]
  skills?: string[];   // ["service", "cocktails", "caisse"]
  experience_years?: number;
  languages?: string[];  // ["fr", "en"]

  // Localisation
  city: string;
  lat?: number;
  lng?: number;
  mobility_radius_km?: number;  // Rayon de mobilité en km

  // Disponibilité
  available_from?: string;  // ISO date
  available_to?: string;    // ISO date
  available_days?: string[];  // ["lundi", "mardi"]
  available_hours?: Record<string, string[]>;  // { "lundi": ["9h-18h"] }

  // Préférences
  min_hourly_rate?: number;
  max_hourly_rate?: number;
  preferred_contract_types?: string[];  // ["extra", "cdd"]

  // Réputation
  rating?: number;  // 0.0 - 5.0
  total_missions?: number;
  completed_missions?: number;
  cancellation_rate?: number;

  // Statut
  status: 'active' | 'inactive' | 'suspended';

  // Contact
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;

  // Notifications
  notification_preferences?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };

  created_at?: string;
  updated_at?: string;
}

/**
 * Talent avec score de matching
 */
export interface MatchedTalent extends Talent {
  score: number;  // 0.0 - 1.0
  distance_km?: number;
  match_reasons: string[];
  availability_status: 'available' | 'maybe' | 'unavailable';
}

/* ============================================
   ORCHESTRATION
============================================ */

/**
 * Contexte utilisateur pour personnalisation
 */
export interface UserContext {
  userId?: string;
  sessionId?: string;
  preferences?: {
    preferredTalents?: string[];  // IDs des talents favoris
    maxDistance?: number;
    autoNotify?: boolean;
  };
}

/**
 * Résultat de l'orchestration
 */
export interface OrchestratedResult {
  // Besoin parsé
  parsedNeed: ParsedNeed;

  // Annonce générée
  jobDraft: SimpleAnnouncementDraft;

  // Talents matchés
  matches: MatchedTalent[];
  totalMatches: number;

  // Actions disponibles
  actions: OrchestratedAction[];

  // Métadonnées
  confidence: number;  // 0.0 - 1.0
  estimatedTime: string;  // "< 2 heures"
  orchestrationId: string;

  // Stats
  stats: {
    parseTime: number;  // ms
    matchTime: number;  // ms
    totalTime: number;  // ms
  };
}

/**
 * Action proposée à l'utilisateur
 */
export interface OrchestratedAction {
  type: 'publish_job' | 'contact_talent' | 'modify_draft' | 'search_more';
  label: string;
  talentId?: string;
  primary?: boolean;
}

/* ============================================
   MATCHING
============================================ */

/**
 * Critères de matching
 */
export interface MatchCriteria {
  jobKey: string;
  location: string;
  date?: Date;
  urgency?: 'low' | 'medium' | 'high';
  requiredSkills?: string[];
  minRating?: number;
  maxDistance?: number;  // km
}

/**
 * Score détaillé d'un match
 */
export interface MatchScore {
  total: number;  // 0.0 - 1.0
  breakdown: {
    location: number;      // 0.0 - 1.0
    availability: number;  // 0.0 - 1.0
    skills: number;        // 0.0 - 1.0
    reputation: number;    // 0.0 - 1.0
  };
  weights: {
    location: number;      // 0.4
    availability: number;  // 0.3
    skills: number;        // 0.2
    reputation: number;    // 0.1
  };
}

/* ============================================
   NOTIFICATIONS
============================================ */

/**
 * Notification envoyée à un talent
 */
export interface TalentNotification {
  id: string;
  job_id: string;
  talent_id: string;

  match_score: number;

  // Statut
  status: 'pending' | 'sent' | 'seen' | 'accepted' | 'rejected';
  sent_at?: string;
  seen_at?: string;
  responded_at?: string;

  // Canaux
  channels_sent?: ('email' | 'sms' | 'push')[];

  created_at: string;
}

/**
 * Résultat d'envoi de notification
 */
export interface NotificationResult {
  talent_id: string;
  success: boolean;
  channels: ('email' | 'sms' | 'push')[];
  error?: string;
  sent_at: Date;
}

/* ============================================
   UTILS
============================================ */

/**
 * Options de configuration du matcher
 */
export interface MatcherOptions {
  limit?: number;  // Nombre max de résultats (défaut: 10)
  minScore?: number;  // Score minimum pour être retenu (défaut: 0.3)
  maxDistance?: number;  // Distance max en km (défaut: 50)
  includeInactive?: boolean;  // Inclure talents inactifs (défaut: false)
}

/**
 * Options de configuration de l'orchestrateur
 */
export interface OrchestratorOptions {
  useLLM?: boolean;  // Utiliser le LLM pour améliorer le parsing (défaut: true)
  autoNotify?: boolean;  // Notifier automatiquement les talents (défaut: false en V1)
  matcherOptions?: MatcherOptions;
}
