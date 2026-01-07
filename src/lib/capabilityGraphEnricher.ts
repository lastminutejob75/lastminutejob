/**
 * Module d'enrichissement avec le Capability Graph pour LastMinuteJob
 * 
 * Ce module enrichit les annonces avec :
 * - Matching des intentions/capabilities depuis le métier détecté
 * - Métadonnées de marché (prix moyens, délais typiques)
 * - Suggestions de providers pertinents
 * - Compétences critiques
 */

import { supabase } from "./supabaseClient";
import type { DetectedJob } from "./jobEngine";

// Types pour le Capability Graph
interface Intention {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  tags: string[];
}

interface Capability {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  domain: string | null;
  tags: string[];
}

interface Provider {
  id: string;
  slug: string;
  name: string;
  type: "saas" | "agent" | "human" | "robot";
  description: string | null;
  price_level: "free" | "low" | "mid" | "high" | "enterprise";
  pricing_min?: number;
  pricing_max?: number;
  pricing_currency?: string;
  pricing_unit?: string;
  delivery_time_min?: number;
  delivery_time_max?: number;
  specialties?: string[];
  task_types?: string[];
}

interface CapabilityMatch {
  capability: Capability;
  score: number;
  matchedTags: string[];
}

interface ProviderMatch {
  provider: Provider;
  score: number;
}

export interface EnrichmentContext {
  detectedJob: DetectedJob;
  capabilityMatch?: CapabilityMatch;
  providerMatches?: ProviderMatch[];
  marketData?: {
    avgPrice?: number;
    priceRange?: { min: number; max: number };
    typicalDuration?: string;
    criticalSkills?: string[];
    specialties?: string[];
  };
}

/**
 * Mappe un métier LastMinuteJob vers des tags du Capability Graph
 * Focus uniquement sur les métiers humains/terrain
 */
function mapJobToCapabilityTags(jobKey: string): string[] {
  const jobTagMap: Record<string, string[]> = {
    // Restauration / Hôtellerie
    server: ["service", "restaurant", "hospitality", "terrain", "humain", "recrutement_terrain"],
    cook: ["cuisine", "restaurant", "hospitality", "terrain", "humain", "recrutement_terrain"],
    bartender: ["bar", "restaurant", "hospitality", "terrain", "humain", "recrutement_terrain"],
    host_hostess: ["accueil", "restaurant", "hospitality", "terrain", "humain", "recrutement_terrain"],
    housekeeper: ["ménage", "hôtellerie", "terrain", "humain", "recrutement_terrain"],
    
    // Logistique / Transport
    delivery_driver: ["livraison", "logistique", "transport", "terrain", "humain", "recrutement_terrain"],
    warehouse_worker: ["entrepôt", "logistique", "manutention", "terrain", "humain", "recrutement_terrain"],
    mover: ["déménagement", "logistique", "manutention", "terrain", "humain", "recrutement_terrain"],
    
    // Commerce / Vente
    shop_assistant: ["vente", "commerce", "retail", "terrain", "humain", "recrutement_terrain"],
    cashier: ["caisse", "commerce", "retail", "terrain", "humain", "recrutement_terrain"],
    
    // BTP / Construction
    construction_worker: ["construction", "btp", "terrain", "humain", "recrutement_terrain"],
    electrician: ["électricité", "btp", "terrain", "humain", "recrutement_terrain"],
    plumber: ["plomberie", "btp", "terrain", "humain", "recrutement_terrain"],
    
    // Événementiel / Sécurité
    security_guard: ["sécurité", "surveillance", "terrain", "humain", "recrutement_terrain"],
    
    // Nettoyage
    cleaner: ["nettoyage", "entretien", "terrain", "humain", "recrutement_terrain"],
    
    // Freelance / Services
    freelancer: ["freelance", "indépendant", "terrain", "humain", "recrutement_terrain"],
  };

  return jobTagMap[jobKey] || ["terrain", "humain", "recrutement_terrain"];
}

/**
 * Recherche les capabilities qui matchent avec un métier
 */
export async function matchCapabilityFromJob(
  detectedJob: DetectedJob
): Promise<CapabilityMatch | null> {
  if (!supabase) {
    console.warn("[CapabilityGraph] Supabase non disponible");
    return null;
  }

  try {
    const tags = mapJobToCapabilityTags(detectedJob.jobKey);
    
    // Recherche par tags
    const { data: capabilities, error } = await supabase
      .from("capabilities")
      .select("*")
      .contains("tags", tags);

    if (error) {
      console.error("[CapabilityGraph] Erreur recherche capabilities:", error);
      return null;
    }

    if (!capabilities || capabilities.length === 0) {
      // Fallback: recherche plus large
      const { data: fallbackCapabilities } = await supabase
        .from("capabilities")
        .select("*")
        .limit(10);

      if (fallbackCapabilities && fallbackCapabilities.length > 0) {
        return {
          capability: fallbackCapabilities[0],
          score: 0.5,
          matchedTags: [],
        };
      }
      return null;
    }

    // Calculer le score de matching
    const bestMatch = capabilities.reduce((best, cap) => {
      const matchedTags = cap.tags?.filter((tag: string) => 
        tags.some(t => tag.toLowerCase().includes(t.toLowerCase()) || 
                      t.toLowerCase().includes(tag.toLowerCase()))
      ) || [];
      
      const score = matchedTags.length / Math.max(tags.length, cap.tags?.length || 1);
      
      return score > best.score ? { capability: cap, score, matchedTags } : best;
    }, { capability: capabilities[0], score: 0, matchedTags: [] as string[] });

    return bestMatch.score > 0 ? bestMatch : {
      capability: capabilities[0],
      score: 0.3,
      matchedTags: [],
    };

  } catch (error) {
    console.error("[CapabilityGraph] Erreur matching capability:", error);
    return null;
  }
}

/**
 * Récupère les providers pour une capability
 * FILTRE : Uniquement les providers de type "human" (métiers humains)
 */
export async function getProvidersForCapability(
  capabilityId: string,
  limit: number = 5
): Promise<ProviderMatch[]> {
  if (!supabase) {
    return [];
  }

  try {
    // Récupérer les providers liés à cette capability
    const { data: capabilityProviders, error: cpError } = await supabase
      .from("capability_providers")
      .select("provider_id, strength")
      .eq("capability_id", capabilityId)
      .order("strength", { ascending: false })
      .limit(limit * 2); // Récupérer plus pour filtrer après

    if (cpError) {
      console.error("[CapabilityGraph] Erreur récupération capability_providers:", cpError);
      return [];
    }

    if (!capabilityProviders || capabilityProviders.length === 0) {
      return [];
    }

    // Récupérer les détails des providers
    const providerIds = capabilityProviders.map(cp => cp.provider_id);
    const { data: providers, error: pError } = await supabase
      .from("providers")
      .select("*")
      .in("id", providerIds)
      .eq("type", "human"); // ⚠️ FILTRE IMPORTANT : Uniquement les métiers humains

    if (pError) {
      console.error("[CapabilityGraph] Erreur récupération providers:", pError);
      return [];
    }

    if (!providers || providers.length === 0) {
      console.log("[CapabilityGraph] Aucun provider 'human' trouvé pour cette capability");
      return [];
    }

    // Mapper avec les scores et limiter
    return providers
      .slice(0, limit)
      .map(provider => {
        const cp = capabilityProviders.find(cp => cp.provider_id === provider.id);
        return {
          provider: provider as Provider,
          score: cp?.strength || 0.5,
        };
      });

  } catch (error) {
    console.error("[CapabilityGraph] Erreur getProvidersForCapability:", error);
    return [];
  }
}

/**
 * Extrait les métadonnées de marché depuis les providers
 * Adapté pour les métiers humains (tarifs horaires, compétences terrain, etc.)
 */
export function extractMarketData(providers: ProviderMatch[]): EnrichmentContext["marketData"] {
  if (!providers || providers.length === 0) {
    return undefined;
  }

  // Extraire les prix (pour métiers humains, généralement en €/h)
  const prices = providers
    .map(p => [p.provider.pricing_min, p.provider.pricing_max])
    .flat()
    .filter((p): p is number => p !== undefined && p !== null && p > 0);

  const avgPrice = prices.length > 0
    ? Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length)
    : undefined;

  const priceRange = prices.length > 0
    ? { min: Math.round(Math.min(...prices)), max: Math.round(Math.max(...prices)) }
    : undefined;

  // Pour les métiers humains, les délais sont souvent en heures/jours de mission
  // On adapte le format pour être plus pertinent
  const durations = providers
    .map(p => [p.provider.delivery_time_min, p.provider.delivery_time_max])
    .flat()
    .filter((d): d is number => d !== undefined && d !== null && d > 0);

  let typicalDuration: string | undefined;
  if (durations.length > 0) {
    const minDays = Math.min(...durations);
    const maxDays = Math.max(...durations);
    if (minDays === maxDays) {
      typicalDuration = minDays === 1 ? "1 jour" : `${minDays} jours`;
    } else {
      typicalDuration = `${minDays}-${maxDays} jours`;
    }
  }

  // Extraire les compétences/spécialités (très importantes pour métiers humains)
  const allSpecialties = providers
    .map(p => p.provider.specialties || [])
    .flat()
    .filter((s, i, arr) => arr.indexOf(s) === i); // Dédupliquer

  const allTaskTypes = providers
    .map(p => p.provider.task_types || [])
    .flat()
    .filter((t, i, arr) => arr.indexOf(t) === i); // Dédupliquer

  // Pour métiers humains, on priorise les compétences terrain
  const criticalSkills = [
    ...allTaskTypes,
    ...allSpecialties
  ].slice(0, 5); // Top 5 compétences les plus fréquentes

  return {
    avgPrice,
    priceRange,
    typicalDuration,
    criticalSkills: criticalSkills.length > 0 ? criticalSkills : undefined,
    specialties: allSpecialties.slice(0, 5), // Top 5 spécialités
  };
}

/**
 * Fonction principale : enrichit le contexte d'une annonce avec le Capability Graph
 * 
 * ⚠️ IMPORTANT : Utilise le Supabase de LastMinuteJob (gywhqtlebvvauxzmdavb.supabase.co)
 * PAS le Supabase d'UWi. Les deux projets ont des bases de données séparées.
 */
export async function enrichAnnouncementContext(
  detectedJob: DetectedJob,
  userPrompt?: string
): Promise<EnrichmentContext> {
  console.log(`[CapabilityGraph] Enrichissement pour métier: ${detectedJob.jobKey}`);
  console.log(`[CapabilityGraph] Supabase LastMinuteJob: ${import.meta.env.VITE_SUPABASE_URL || 'non configuré'}`);

  // 1. Matcher la capability
  const capabilityMatch = await matchCapabilityFromJob(detectedJob);

  if (!capabilityMatch) {
    console.log("[CapabilityGraph] Aucune capability trouvée, retour sans enrichissement");
    return { detectedJob };
  }

  console.log(`[CapabilityGraph] Capability trouvée: ${capabilityMatch.capability.title} (score: ${capabilityMatch.score.toFixed(2)})`);

  // 2. Récupérer les providers
  const providerMatches = await getProvidersForCapability(capabilityMatch.capability.id, 5);

  console.log(`[CapabilityGraph] ${providerMatches.length} providers trouvés`);

  // 3. Extraire les métadonnées de marché
  const marketData = extractMarketData(providerMatches);

  if (marketData) {
    console.log(`[CapabilityGraph] Métadonnées extraites:`, {
      avgPrice: marketData.avgPrice,
      typicalDuration: marketData.typicalDuration,
      skills: marketData.criticalSkills?.length || 0,
    });
  }

  return {
    detectedJob,
    capabilityMatch,
    providerMatches,
    marketData,
  };
}

/**
 * Génère un prompt enrichi pour le LLM avec le contexte du Capability Graph
 */
export function generateEnrichedPrompt(
  userPrompt: string,
  context: EnrichmentContext
): string {
  const parts: string[] = [];

  // Contexte métier
  if (context.detectedJob) {
    parts.push(`MÉTIER DÉTECTÉ: ${context.detectedJob.jobKey} (confiance: ${Math.round(context.detectedJob.confidence * 100)}%)`);
  }

  // Contexte Capability Graph
  if (context.capabilityMatch) {
    const cap = context.capabilityMatch.capability;
    parts.push(`\nCAPABILITY: ${cap.title}`);
    if (cap.description) {
      parts.push(`Description: ${cap.description}`);
    }
    if (cap.domain) {
      parts.push(`Domaine: ${cap.domain}`);
    }
  }

  // Données de marché (adaptées pour métiers humains)
  if (context.marketData) {
    parts.push(`\nDONNÉES DE MARCHÉ (MÉTIERS HUMAINS):`);
    
    if (context.marketData.avgPrice) {
      const currency = context.providerMatches?.[0]?.provider.pricing_currency || 'EUR';
      const unit = context.providerMatches?.[0]?.provider.pricing_unit || 'h';
      const priceInfo = context.marketData.priceRange?.min 
        ? `${context.marketData.priceRange.min}-${context.marketData.priceRange.max}${currency}/${unit} (moyenne: ${context.marketData.avgPrice}${currency}/${unit})`
        : `${context.marketData.avgPrice}${currency}/${unit}`;
      parts.push(`- Tarif horaire moyen: ${priceInfo}`);
      parts.push(`  💡 Utilise cette fourchette pour suggérer un tarif réaliste si non mentionné`);
    }
    
    if (context.marketData.typicalDuration) {
      parts.push(`- Durée typique de mission: ${context.marketData.typicalDuration}`);
    }
    
    if (context.marketData.criticalSkills && context.marketData.criticalSkills.length > 0) {
      parts.push(`- Compétences/qualifications importantes: ${context.marketData.criticalSkills.join(', ')}`);
      parts.push(`  💡 Mentionne ces compétences dans l'annonce si pertinentes`);
    }
    
    if (context.marketData.specialties && context.marketData.specialties.length > 0) {
      parts.push(`- Spécialités recherchées: ${context.marketData.specialties.join(', ')}`);
    }
  }

  // Providers disponibles
  if (context.providerMatches && context.providerMatches.length > 0) {
    parts.push(`\nPROVIDERS DISPONIBLES:`);
    context.providerMatches.slice(0, 3).forEach((pm, idx) => {
      const p = pm.provider;
      parts.push(`${idx + 1}. ${p.name} (${p.type})`);
      if (p.description) {
        parts.push(`   ${p.description.substring(0, 100)}...`);
      }
    });
  }

  // Instructions pour le LLM
  parts.push(`\nINSTRUCTIONS:`);
  parts.push(`- Utilise les données de marché pour suggérer des prix réalistes si non mentionnés`);
  parts.push(`- Mentionne les compétences importantes dans l'annonce`);
  parts.push(`- Adapte le ton selon le domaine (${context.capabilityMatch?.capability.domain || 'général'})`);
  parts.push(`- Sois précis et professionnel`);

  parts.push(`\nPROMPT UTILISATEUR: "${userPrompt}"`);

  return parts.join('\n');
}

