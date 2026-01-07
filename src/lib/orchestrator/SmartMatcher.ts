/**
 * SmartMatcher - Module de matching talents ↔ jobs
 * Version 1 : Matching basique par critères exacts
 */

import { supabase } from '../supabaseClient';
import type {
  Talent,
  MatchedTalent,
  MatchCriteria,
  MatcherOptions,
  MatchScore
} from './types';
import type { ParsedNeed } from '../jobEngine';

export class SmartMatcher {
  private defaultOptions: MatcherOptions = {
    limit: 10,
    minScore: 0.3,
    maxDistance: 50,
    includeInactive: false
  };

  /**
   * Trouve les talents matchant un besoin parsé
   */
  async findTalents(
    need: ParsedNeed,
    options?: MatcherOptions
  ): Promise<MatchedTalent[]> {
    const opts = { ...this.defaultOptions, ...options };

    // Construire les critères de recherche
    const criteria = this.buildCriteria(need);

    // Requête DB
    const talents = await this.queryDatabase(criteria, opts);

    if (!talents || talents.length === 0) {
      return [];
    }

    // Scorer chaque talent
    const matchedTalents = talents.map(talent => this.scoreMatch(talent, need));

    // Filtrer par score minimum et trier
    return matchedTalents
      .filter(t => t.score >= opts.minScore!)
      .sort((a, b) => b.score - a.score)
      .slice(0, opts.limit!);
  }

  /**
   * Construit les critères de matching depuis le besoin
   */
  private buildCriteria(need: ParsedNeed): MatchCriteria {
    const jobKey = need.primaryJob?.jobKey || 'server';
    const location = need.context.location || '';

    return {
      jobKey,
      location,
      date: need.context.temporal ? new Date() : undefined,
      urgency: need.context.urgency,
      requiredSkills: [],
      minRating: 0.0,
      maxDistance: 50
    };
  }

  /**
   * Requête la base de données
   * V1 : Critères exacts (job_key + city + status active)
   */
  private async queryDatabase(
    criteria: MatchCriteria,
    options: MatcherOptions
  ): Promise<Talent[]> {
    try {
      let query = supabase
        .from('talents')
        .select('*');

      // Filtre : job_key dans la liste
      query = query.contains('job_keys', [criteria.jobKey]);

      // Filtre : city exact (V1 simple, pas de géoloc)
      if (criteria.location) {
        query = query.ilike('city', criteria.location);
      }

      // Filtre : status
      if (!options.includeInactive) {
        query = query.eq('status', 'active');
      }

      // Filtre : disponibilité (si date spécifiée)
      if (criteria.date) {
        query = query.or(`available_from.is.null,available_from.lte.${criteria.date.toISOString()}`);
      }

      // Limite
      query = query.limit(options.limit || 10);

      const { data, error } = await query;

      if (error) {
        console.error('[SmartMatcher] Database error:', error);
        throw error;
      }

      return (data as Talent[]) || [];
    } catch (error) {
      console.error('[SmartMatcher] Query failed:', error);
      return [];
    }
  }

  /**
   * Score un talent par rapport au besoin
   * V1 : Scoring simple (100% si match, 0% sinon)
   * V2+ : Scoring multi-critères avancé
   */
  private scoreMatch(talent: Talent, need: ParsedNeed): MatchedTalent {
    // V1 : Tous les résultats DB matchent déjà (critères exacts)
    // → Score de base = 1.0
    let score = 1.0;
    const matchReasons: string[] = [];

    // Vérifier job match
    if (need.primaryJob && talent.job_keys.includes(need.primaryJob.jobKey)) {
      matchReasons.push(`Métier : ${need.primaryJob.jobKey}`);
    }

    // Vérifier localisation
    if (need.context.location && talent.city.toLowerCase() === need.context.location.toLowerCase()) {
      matchReasons.push(`Localisation : ${talent.city}`);
    }

    // Vérifier disponibilité
    if (talent.available_from) {
      const availableDate = new Date(talent.available_from);
      if (availableDate <= new Date()) {
        matchReasons.push('Disponible immédiatement');
      }
    } else {
      matchReasons.push('Disponibilité à confirmer');
    }

    // Ajouter rating si bon
    if (talent.rating && talent.rating >= 4.5) {
      matchReasons.push(`⭐ ${talent.rating}/5`);
    }

    // Déterminer statut disponibilité
    const availabilityStatus = this.checkAvailability(talent);

    return {
      ...talent,
      score,
      match_reasons: matchReasons,
      availability_status: availabilityStatus
    };
  }

  /**
   * Vérifie la disponibilité d'un talent
   */
  private checkAvailability(talent: Talent): 'available' | 'maybe' | 'unavailable' {
    if (talent.status !== 'active') {
      return 'unavailable';
    }

    if (!talent.available_from) {
      return 'maybe';
    }

    const availableDate = new Date(talent.available_from);
    const now = new Date();

    if (availableDate <= now) {
      return 'available';
    }

    // Disponible dans moins de 24h
    const hoursUntilAvailable = (availableDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntilAvailable <= 24) {
      return 'maybe';
    }

    return 'unavailable';
  }

  /**
   * Calcule le score détaillé (pour V2+)
   * Pas utilisé en V1 mais architecture prête
   */
  private calculateDetailedScore(talent: Talent, need: ParsedNeed): MatchScore {
    const weights = {
      location: 0.4,
      availability: 0.3,
      skills: 0.2,
      reputation: 0.1
    };

    const breakdown = {
      location: 1.0,  // V1 : exact match via DB
      availability: 1.0,  // V1 : exact match via DB
      skills: 1.0,  // V1 : exact match via DB
      reputation: talent.rating ? talent.rating / 5.0 : 0.5
    };

    const total =
      breakdown.location * weights.location +
      breakdown.availability * weights.availability +
      breakdown.skills * weights.skills +
      breakdown.reputation * weights.reputation;

    return {
      total,
      breakdown,
      weights
    };
  }
}
