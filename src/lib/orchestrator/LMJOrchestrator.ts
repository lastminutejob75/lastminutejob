/**
 * LMJOrchestrator - Chef d'orchestre du matching automatique
 * Point d'entrée unique pour orchestrer tout le processus
 */

import { SmartMatcher } from './SmartMatcher';
import type {
  OrchestratedResult,
  OrchestratorOptions,
  UserContext,
  OrchestratedAction
} from './types';

// Imports des modules existants
import { detectJobsFromText, extractContext, type ParsedNeed } from '../jobEngine';
import { simpleGenerateAnnouncement, convertLLMResponseToDraft } from '../simpleAnnounce';
import { generateAnnouncementWithLLM } from '../llmAnnounce';

export class LMJOrchestrator {
  private matcher: SmartMatcher;
  private options: OrchestratorOptions;

  constructor(options?: OrchestratorOptions) {
    this.matcher = new SmartMatcher();
    this.options = {
      useLLM: true,
      autoNotify: false,  // V1 : pas de notification auto
      ...options
    };
  }

  /**
   * Traite un besoin utilisateur de bout en bout
   * @param prompt - Texte saisi par l'utilisateur
   * @param context - Contexte utilisateur optionnel
   * @returns Résultat orchestré complet
   */
  async process(
    prompt: string,
    context?: UserContext
  ): Promise<OrchestratedResult> {
    const startTime = performance.now();

    try {
      // Phase 1 : Parser le besoin
      const parseStart = performance.now();
      const parsedNeed = await this.parse(prompt);
      const parseTime = performance.now() - parseStart;

      // Phase 2 : Générer le draft d'annonce
      const jobDraft = await this.generateDraft(prompt, parsedNeed);

      // Phase 3 : Matcher les talents
      const matchStart = performance.now();
      const matches = await this.matchTalents(parsedNeed, context);
      const matchTime = performance.now() - matchStart;

      // Phase 4 : Construire la proposition
      const result = this.buildProposal(parsedNeed, jobDraft, matches);

      // Stats
      const totalTime = performance.now() - startTime;

      return {
        ...result,
        stats: {
          parseTime: Math.round(parseTime),
          matchTime: Math.round(matchTime),
          totalTime: Math.round(totalTime)
        }
      };
    } catch (error) {
      console.error('[LMJOrchestrator] Error during processing:', error);

      // Fallback gracieux
      return this.buildFallbackResult(prompt, error as Error);
    }
  }

  /**
   * Phase 1 : Parse le prompt utilisateur
   * Réutilise jobEngine existant
   */
  private async parse(prompt: string): Promise<ParsedNeed> {
    // Détection métier
    const detectedJobs = detectJobsFromText(prompt);

    // Extraction contexte
    const context = extractContext(prompt);

    // Construire ParsedNeed
    const parsedNeed: ParsedNeed = {
      rawPrompt: prompt,
      jobCandidates: detectedJobs,
      primaryJob: detectedJobs.length > 0 ? detectedJobs[0] : null,
      context: context,
      direction: 'demande_de_ressource',  // V1 : on suppose toujours recruteur
      readiness: {
        score: 70,  // V1 : score fixe
        status: 'almost_ready',
        missing: []
      }
    };

    return parsedNeed;
  }

  /**
   * Phase 2 : Génère le draft d'annonce
   * Réutilise simpleAnnounce + LLM si disponible
   */
  private async generateDraft(prompt: string, parsedNeed: ParsedNeed) {
    // Essayer avec LLM d'abord si option activée
    if (this.options.useLLM) {
      try {
        const llmResponse = await generateAnnouncementWithLLM(prompt);
        if (llmResponse) {
          return convertLLMResponseToDraft(llmResponse, prompt);
        }
      } catch (error) {
        console.warn('[LMJOrchestrator] LLM failed, using simple generator:', error);
      }
    }

    // Fallback : générateur simple
    return simpleGenerateAnnouncement(prompt);
  }

  /**
   * Phase 3 : Matche les talents disponibles
   * Nouveau : utilise SmartMatcher
   */
  private async matchTalents(parsedNeed: ParsedNeed, context?: UserContext) {
    try {
      const matches = await this.matcher.findTalents(
        parsedNeed,
        this.options.matcherOptions
      );

      console.log(`[LMJOrchestrator] Found ${matches.length} matching talents`);

      return matches;
    } catch (error) {
      console.error('[LMJOrchestrator] Matching failed:', error);
      return [];
    }
  }

  /**
   * Phase 4 : Construit la proposition finale
   */
  private buildProposal(
    parsedNeed: ParsedNeed,
    jobDraft: any,
    matches: any[]
  ): Omit<OrchestratedResult, 'stats'> {
    // Générer ID unique
    const orchestrationId = `orch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Calculer confiance
    const confidence = this.calculateConfidence(parsedNeed, matches);

    // Estimer temps
    const estimatedTime = matches.length > 0
      ? '< 2 heures'
      : matches.length === 0
        ? 'Publication sans matching automatique'
        : '< 24 heures';

    // Actions disponibles
    const actions = this.buildActions(matches);

    return {
      parsedNeed,
      jobDraft,
      matches: matches.slice(0, 5),  // Top 5
      totalMatches: matches.length,
      actions,
      confidence,
      estimatedTime,
      orchestrationId
    };
  }

  /**
   * Construit les actions proposées
   */
  private buildActions(matches: any[]): OrchestratedAction[] {
    const actions: OrchestratedAction[] = [];

    // Action principale : publier
    actions.push({
      type: 'publish_job',
      label: 'Publier l\'annonce',
      primary: true
    });

    // Si matches : actions contact
    if (matches.length > 0) {
      // Contacter le meilleur talent
      actions.push({
        type: 'contact_talent',
        label: `Contacter ${matches[0].first_name || 'le talent'}`,
        talentId: matches[0].id
      });
    }

    // Action modifier
    actions.push({
      type: 'modify_draft',
      label: 'Modifier l\'annonce'
    });

    // Action chercher plus
    if (matches.length < 3) {
      actions.push({
        type: 'search_more',
        label: 'Élargir la recherche'
      });
    }

    return actions;
  }

  /**
   * Calcule le score de confiance global
   */
  private calculateConfidence(parsedNeed: ParsedNeed, matches: any[]): number {
    let confidence = 0.5;  // Base

    // Boost si job détecté
    if (parsedNeed.primaryJob && parsedNeed.primaryJob.confidence > 0.7) {
      confidence += 0.2;
    }

    // Boost si localisation
    if (parsedNeed.context.location) {
      confidence += 0.1;
    }

    // Boost si matches trouvés
    if (matches.length >= 3) {
      confidence += 0.2;
    } else if (matches.length >= 1) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Construit un résultat de fallback en cas d'erreur
   */
  private buildFallbackResult(prompt: string, error: Error): OrchestratedResult {
    const fallbackDraft = simpleGenerateAnnouncement(prompt);

    return {
      parsedNeed: {
        rawPrompt: prompt,
        jobCandidates: [],
        primaryJob: null,
        context: { location: null, temporal: null },
        direction: 'demande_de_ressource',
        readiness: { score: 0, status: 'incomplete', missing: [] }
      },
      jobDraft: fallbackDraft,
      matches: [],
      totalMatches: 0,
      actions: [
        {
          type: 'publish_job',
          label: 'Publier l\'annonce',
          primary: true
        }
      ],
      confidence: 0.3,
      estimatedTime: 'Publication manuelle',
      orchestrationId: `orch_fallback_${Date.now()}`,
      stats: {
        parseTime: 0,
        matchTime: 0,
        totalTime: 0
      }
    };
  }
}

/**
 * Instance singleton pour usage simple
 */
export const orchestrator = new LMJOrchestrator();
