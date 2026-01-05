/**
 * Types pour le système de brief UWi
 */

export interface ParsedBrief {
  intent: string; // Intention principale
  location?: string; // Localisation (ex: "Paris")
  budget?: {
    amount: number;
    currency: string;
  };
  constraints: string[]; // Contraintes identifiées
  goals: string[]; // Objectifs identifiés
  timeline?: string; // Délai souhaité
  context: Record<string, any>; // Contexte additionnel
}

export interface ServiceMatch {
  serviceId: string;
  serviceName: string;
  matchScore: number; // 0-1
  reason: string; // Pourquoi ce service est recommandé
  estimatedCost?: number;
  executionType: 'human' | 'ai_agent' | 'robot' | 'saas';
}

export interface OrchestrationSuggestion {
  briefId: string;
  parsedBrief: ParsedBrief;
  recommendedServices: ServiceMatch[];
  executionPlan: {
    phase: number;
    description: string;
    services: string[]; // IDs des services
    dependencies?: string[]; // Services qui doivent être exécutés avant
  }[];
  estimatedTotalCost?: number;
  estimatedTimeline?: string;
  confidence: number; // 0-1
}

