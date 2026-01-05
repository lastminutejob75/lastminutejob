/**
 * Base de données des services disponibles
 */

export type ExecutionMode = 'human' | 'ai_agent' | 'robot' | 'saas';

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  executionType: ExecutionMode;
  capabilities: string[]; // Ce que le service peut faire
  constraints: string[]; // Contraintes du service
  estimatedCost?: {
    min: number;
    max: number;
    currency: string;
  };
  location?: string[]; // Zones géographiques couvertes
  tags: string[]; // Tags pour le matching
}

export const services: Service[] = [
  {
    id: 'human-sales-rep',
    name: 'Commercial humain',
    description: 'Commercial expérimenté pour démarchage et vente',
    category: 'sales',
    executionType: 'human',
    capabilities: ['démarchage', 'négociation', 'relation client', 'vente'],
    constraints: ['nécessite formation', 'disponibilité limitée'],
    estimatedCost: {
      min: 2000,
      max: 5000,
      currency: 'EUR',
    },
    location: ['Paris', 'Île-de-France'],
    tags: ['vente', 'commercial', 'démarchage', 'paris'],
  },
  {
    id: 'ai-chatbot',
    name: 'Chatbot IA',
    description: 'Assistant conversationnel IA pour qualification de leads',
    category: 'marketing',
    executionType: 'ai_agent',
    capabilities: ['qualification', 'réponse automatique', '24/7'],
    constraints: ['nécessite intégration', 'limité aux questions prévues'],
    estimatedCost: {
      min: 50,
      max: 200,
      currency: 'EUR',
    },
    tags: ['chatbot', 'ia', 'qualification', 'automatisation'],
  },
  {
    id: 'saas-crm',
    name: 'CRM SaaS',
    description: 'Plateforme CRM pour gestion de la relation client',
    category: 'sales',
    executionType: 'saas',
    capabilities: ['gestion contacts', 'pipeline', 'reporting'],
    constraints: ['nécessite configuration', 'abonnement mensuel'],
    estimatedCost: {
      min: 30,
      max: 100,
      currency: 'EUR',
    },
    tags: ['crm', 'gestion', 'contacts', 'pipeline'],
  },
  {
    id: 'ai-content-generator',
    name: 'Générateur de contenu IA',
    description: 'Génération automatique de contenu marketing',
    category: 'marketing',
    executionType: 'ai_agent',
    capabilities: ['articles', 'posts réseaux sociaux', 'emails'],
    constraints: ['nécessite relecture', 'qualité variable'],
    estimatedCost: {
      min: 20,
      max: 100,
      currency: 'EUR',
    },
    tags: ['contenu', 'marketing', 'ia', 'rédaction'],
  },
  {
    id: 'robot-delivery',
    name: 'Livraison robotisée',
    description: 'Service de livraison automatisé',
    category: 'logistics',
    executionType: 'robot',
    capabilities: ['livraison', 'transport', 'automatisé'],
    constraints: ['zones limitées', 'poids limité'],
    estimatedCost: {
      min: 5,
      max: 15,
      currency: 'EUR',
    },
    location: ['Paris'],
    tags: ['livraison', 'robot', 'transport', 'paris'],
  },
];
