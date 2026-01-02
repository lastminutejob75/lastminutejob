/**
 * Orchestrateur pour coordonner les services
 */

import { LLMClient } from './llm';
import { services, type Service } from '../data/services';
import type { ParsedBrief, ServiceMatch, OrchestrationSuggestion } from '../types/brief';

export class Orchestrator {
  private llmClient: LLMClient;

  constructor(apiKey?: string) {
    this.llmClient = new LLMClient(apiKey);
  }

  async processBrief(userPrompt: string): Promise<OrchestrationSuggestion> {
    // 1. Parser le brief
    const parsedBrief = await this.parseBrief(userPrompt);

    // 2. Matcher les services
    const matchedServices = await this.matchServices(parsedBrief);

    // 3. Générer le plan d'orchestration
    const orchestrationPlan = await this.llmClient.generateOrchestrationPlan(
      parsedBrief,
      matchedServices
    );

    // 4. Construire la suggestion finale
    return {
      briefId: this.generateBriefId(),
      parsedBrief,
      recommendedServices: matchedServices,
      executionPlan: orchestrationPlan.executionPlan || [],
      estimatedTotalCost: orchestrationPlan.estimatedTotalCost,
      estimatedTimeline: orchestrationPlan.estimatedTimeline,
      confidence: this.calculateConfidence(parsedBrief, matchedServices),
    };
  }

  private async parseBrief(userPrompt: string): Promise<ParsedBrief> {
    const parsed = await this.llmClient.parseBrief(userPrompt);
    
    return {
      intent: parsed.intent || 'non spécifié',
      location: parsed.location,
      budget: parsed.budget,
      constraints: parsed.constraints || [],
      goals: parsed.goals || [],
      timeline: parsed.timeline,
      context: parsed.context || {},
    };
  }

  private async matchServices(parsedBrief: ParsedBrief): Promise<ServiceMatch[]> {
    const matches: ServiceMatch[] = [];

    for (const service of services) {
      const score = this.calculateMatchScore(service, parsedBrief);
      
      if (score > 0.3) { // Seuil minimum de pertinence
        matches.push({
          serviceId: service.id,
          serviceName: service.name,
          matchScore: score,
          reason: this.generateMatchReason(service, parsedBrief),
          estimatedCost: service.estimatedCost?.min,
          executionType: service.executionType,
        });
      }
    }

    // Trier par score décroissant
    return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5); // Top 5
  }

  private calculateMatchScore(service: Service, brief: ParsedBrief): number {
    let score = 0;
    let factors = 0;

    // Match par tags et capabilities
    const briefText = `${brief.intent} ${brief.goals.join(' ')}`.toLowerCase();
    const serviceText = `${service.name} ${service.description} ${service.tags.join(' ')} ${service.capabilities.join(' ')}`.toLowerCase();

    // Score basé sur les mots-clés communs
    const briefWords = briefText.split(/\s+/);
    const serviceWords = serviceText.split(/\s+/);
    const commonWords = briefWords.filter(word => serviceWords.includes(word));
    score += (commonWords.length / Math.max(briefWords.length, serviceWords.length)) * 0.4;
    factors += 0.4;

    // Match par localisation
    if (brief.location && service.location) {
      if (service.location.some(loc => 
        brief.location?.toLowerCase().includes(loc.toLowerCase()) ||
        loc.toLowerCase().includes(brief.location.toLowerCase())
      )) {
        score += 0.3;
      }
      factors += 0.3;
    }

    // Match par budget
    if (brief.budget && service.estimatedCost) {
      const budgetAmount = brief.budget.amount;
      const serviceMin = service.estimatedCost.min;
      const serviceMax = service.estimatedCost.max;
      
      if (budgetAmount >= serviceMin && budgetAmount <= serviceMax) {
        score += 0.3;
      } else if (budgetAmount >= serviceMin * 0.5) {
        score += 0.15; // Budget proche
      }
      factors += 0.3;
    }

    return factors > 0 ? score / factors : 0;
  }

  private generateMatchReason(service: Service, brief: ParsedBrief): string {
    const reasons: string[] = [];

    if (brief.location && service.location?.includes(brief.location)) {
      reasons.push(`Disponible à ${brief.location}`);
    }

    const briefText = brief.intent.toLowerCase();
    const matchingCapability = service.capabilities.find(cap => 
      briefText.includes(cap.toLowerCase())
    );
    if (matchingCapability) {
      reasons.push(`Capable de ${matchingCapability}`);
    }

    if (brief.budget && service.estimatedCost) {
      if (brief.budget.amount >= service.estimatedCost.min) {
        reasons.push(`Dans le budget`);
      }
    }

    return reasons.length > 0 
      ? reasons.join(', ')
      : `Service pertinent pour "${brief.intent}"`;
  }

  private calculateConfidence(parsedBrief: ParsedBrief, matches: ServiceMatch[]): number {
    let confidence = 0.5; // Base

    // Plus de matches = plus de confiance
    if (matches.length >= 3) confidence += 0.2;
    else if (matches.length >= 1) confidence += 0.1;

    // Brief bien structuré = plus de confiance
    if (parsedBrief.intent && parsedBrief.goals.length > 0) confidence += 0.2;
    if (parsedBrief.location) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  private generateBriefId(): string {
    return `brief_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
