import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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
 * Recherche une capability qui matche avec un métier
 */
async function matchCapabilityFromJob(
  supabase: any,
  jobKey: string
): Promise<{ capability: any; score: number; matchedTags: string[] } | null> {
  try {
    const tags = mapJobToCapabilityTags(jobKey);
    
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
    const bestMatch = capabilities.reduce((best: any, cap: any) => {
      const matchedTags = cap.tags?.filter((tag: string) => 
        tags.some(t => tag.toLowerCase().includes(t.toLowerCase()) || 
                      t.toLowerCase().includes(tag.toLowerCase()))
      ) || [];
      
      const score = matchedTags.length / Math.max(tags.length, cap.tags?.length || 1);
      
      return score > best.score ? { capability: cap, score, matchedTags } : best;
    }, { capability: capabilities[0], score: 0, matchedTags: [] });

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
 */
async function getProvidersForCapability(
  supabase: any,
  capabilityId: string,
  limit: number = 5
): Promise<Array<{ provider: any; score: number }>> {
  try {
    const { data: capabilityProviders, error: cpError } = await supabase
      .from("capability_providers")
      .select("provider_id, strength")
      .eq("capability_id", capabilityId)
      .order("strength", { ascending: false })
      .limit(limit);

    if (cpError || !capabilityProviders || capabilityProviders.length === 0) {
      return [];
    }

    const providerIds = capabilityProviders.map((cp: any) => cp.provider_id);
    const { data: providers, error: pError } = await supabase
      .from("providers")
      .select("*")
      .in("id", providerIds)
      .eq("type", "human"); // ⚠️ FILTRE IMPORTANT : Uniquement les métiers humains

    if (pError || !providers) {
      return [];
    }

    return providers.map((provider: any) => {
      const cp = capabilityProviders.find((cp: any) => cp.provider_id === provider.id);
      return {
        provider,
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
 */
function extractMarketData(providers: Array<{ provider: any; score: number }>): any {
  if (!providers || providers.length === 0) {
    return null;
  }

  const prices = providers
    .map(p => [p.provider.pricing_min, p.provider.pricing_max])
    .flat()
    .filter((p): p is number => p !== undefined && p !== null);

  const avgPrice = prices.length > 0
    ? prices.reduce((sum, p) => sum + p, 0) / prices.length
    : undefined;

  const priceRange = prices.length > 0
    ? { min: Math.min(...prices), max: Math.max(...prices) }
    : undefined;

  const durations = providers
    .map(p => [p.provider.delivery_time_min, p.provider.delivery_time_max])
    .flat()
    .filter((d): d is number => d !== undefined && d !== null);

  const typicalDuration = durations.length > 0
    ? `${Math.min(...durations)}-${Math.max(...durations)} jours`
    : undefined;

  const allSpecialties = providers
    .map(p => p.provider.specialties || [])
    .flat()
    .filter((s: string, i: number, arr: string[]) => arr.indexOf(s) === i);

  const allTaskTypes = providers
    .map(p => p.provider.task_types || [])
    .flat()
    .filter((t: string, i: number, arr: string[]) => arr.indexOf(t) === i);

  return {
    avgPrice,
    priceRange,
    typicalDuration,
    criticalSkills: allTaskTypes.slice(0, 5),
    specialties: allSpecialties.slice(0, 5),
  };
}

/**
 * Génère un prompt enrichi pour le LLM
 */
function generateEnrichedSystemPrompt(
  userPrompt: string,
  detectedJob?: { jobKey: string; confidence: number },
  capabilityMatch?: { capability: any; score: number },
  marketData?: any,
  providers?: Array<{ provider: any; score: number }>
): string {
  const parts: string[] = [];

  parts.push(`Tu es UWi, un assistant qui transforme un besoin libre en une annonce courte, claire, prête à publier.`);

  // Contexte métier
  if (detectedJob) {
    parts.push(`\nMÉTIER DÉTECTÉ: ${detectedJob.jobKey} (confiance: ${Math.round(detectedJob.confidence * 100)}%)`);
  }

  // Contexte Capability Graph
  if (capabilityMatch) {
    const cap = capabilityMatch.capability;
    parts.push(`\nCAPABILITY: ${cap.title}`);
    if (cap.description) {
      parts.push(`Description: ${cap.description}`);
    }
    if (cap.domain) {
      parts.push(`Domaine: ${cap.domain}`);
    }
  }

  // Données de marché (adaptées pour métiers humains)
  if (marketData) {
    parts.push(`\nDONNÉES DE MARCHÉ (MÉTIERS HUMAINS):`);
    
    if (marketData.avgPrice) {
      const currency = providers?.[0]?.provider.pricing_currency || 'EUR';
      const unit = providers?.[0]?.provider.pricing_unit || 'h';
      const priceInfo = marketData.priceRange 
        ? `${marketData.priceRange.min}-${marketData.priceRange.max}${currency}/${unit} (moyenne: ${Math.round(marketData.avgPrice)}${currency}/${unit})`
        : `${Math.round(marketData.avgPrice)}${currency}/${unit}`;
      parts.push(`- Tarif horaire moyen: ${priceInfo}`);
      parts.push(`  💡 Utilise cette fourchette pour suggérer un tarif réaliste si non mentionné`);
    }
    
    if (marketData.typicalDuration) {
      parts.push(`- Durée typique de mission: ${marketData.typicalDuration}`);
    }
    
    if (marketData.criticalSkills && marketData.criticalSkills.length > 0) {
      parts.push(`- Compétences/qualifications importantes: ${marketData.criticalSkills.join(', ')}`);
      parts.push(`  💡 Mentionne ces compétences dans l'annonce si pertinentes`);
    }
  }

  // Règles de base
  parts.push(`\nRÈGLES:`);
  parts.push(`1) Tu ne parles jamais de "recruteur" ou "candidat".`);
  parts.push(`2) Tu distingues simplement 2 types :`);
  parts.push(`   - "offer_services" : la personne parle d'elle-même, propose ses services ou cherche une mission/job.`);
  parts.push(`   - "need_someone" : la personne cherche quelqu'un pour l'aider ou travailler.`);
  parts.push(`3) Tu réponds TOUJOURS en JSON strict :`);
  parts.push(`{`);
  parts.push(`  "type": "offer_services" | "need_someone",`);
  parts.push(`  "role_label": "string",`);
  parts.push(`  "short_context": "string",`);
  parts.push(`  "location": "string | null",`);
  parts.push(`  "sections": [{"title": "string", "items": ["string"]}]`);
  parts.push(`}`);
  parts.push(`4) Utilise les données de marché pour suggérer des prix réalistes si non mentionnés.`);
  parts.push(`5) Mentionne les compétences importantes dans l'annonce si pertinentes.`);
  parts.push(`6) Adapte le ton selon le domaine (${capabilityMatch?.capability.domain || 'général'}).`);

  return parts.join('\n');
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const { prompt, detectedJob } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "prompt is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialiser Supabase pour le Capability Graph
    // ⚠️ IMPORTANT : Utiliser le Supabase de LastMinuteJob, PAS celui d'UWi (gywhqtlebvvauxzmdavb)
    // Les variables d'environnement doivent être configurées dans les secrets Supabase Edge Functions
    const supabaseUrl = Deno.env.get("LMJ_SUPABASE_URL") || Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("LMJ_SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    // Vérifier que c'est bien le Supabase de LastMinuteJob (pas celui d'UWi)
    const isUWISupabase = supabaseUrl && supabaseUrl.includes("gywhqtlebvvauxzmdavb");
    const isLMJSupabase = supabaseUrl && supabaseUrl.includes("lsukxdglogtgfukdqqti");
    
    let capabilityMatch = null;
    let providerMatches: Array<{ provider: any; score: number }> = [];
    let marketData = null;

    if (isUWISupabase) {
      console.error("[CapabilityGraph] ⚠️ ATTENTION : L'URL Supabase pointe vers UWi !");
      console.error("[CapabilityGraph] Configurez LMJ_SUPABASE_URL avec l'URL du Supabase LastMinuteJob (lsukxdglogtgfukdqqti)");
    } else if (isLMJSupabase && supabaseServiceKey && detectedJob?.jobKey) {
      try {
        console.log(`[CapabilityGraph] Utilisation du Supabase LastMinuteJob: ${supabaseUrl.substring(0, 40)}...`);
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        // Matcher la capability
        capabilityMatch = await matchCapabilityFromJob(supabase, detectedJob.jobKey);
        
        if (capabilityMatch) {
          // Récupérer les providers
          providerMatches = await getProvidersForCapability(
            supabase,
            capabilityMatch.capability.id,
            5
          );
          
          // Extraire les métadonnées de marché
          marketData = extractMarketData(providerMatches);
          
          console.log(`[CapabilityGraph] Enrichissement: ${capabilityMatch.capability.title}, ${providerMatches.length} providers, prix moyen: ${marketData?.avgPrice || 'N/A'}`);
        }
      } catch (cgError) {
        console.error("[CapabilityGraph] Erreur enrichissement:", cgError);
        // Continue sans enrichissement si erreur
      }
    }

    // Générer le prompt enrichi
    const enrichedSystemPrompt = generateEnrichedSystemPrompt(
      prompt,
      detectedJob,
      capabilityMatch,
      marketData,
      providerMatches
    );

    const userPrompt = `Texte utilisateur : "${prompt}". Génère l'objet JSON pour cette situation.`;

    // Appel à OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: enrichedSystemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[uwi-announce-enriched] ❌ OpenAI API error:", response.status, error);
      return new Response(
        JSON.stringify({ error: "OpenAI API error", details: error }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";
    
    console.log("[uwi-announce-enriched] ✅ Réponse OpenAI reçue, longueur:", content.length);

    // Parser la réponse JSON
    let json;
    try {
      json = JSON.parse(content);
      console.log("[uwi-announce-enriched] ✅ JSON parsé avec succès");
    } catch (e) {
      console.error("[uwi-announce-enriched] ❌ JSON parse error:", e, "Content:", content);
      json = {
        type: "need_someone",
        role_label: "",
        short_context: prompt,
        location: null,
        sections: [
          {
            title: "Détails",
            items: [prompt],
          },
        ],
      };
    }

    return new Response(
      JSON.stringify({ 
        ok: true, 
        announcement: json,
        enrichment: {
          capability: capabilityMatch?.capability.title || null,
          marketData: marketData || null,
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("[uwi-announce-enriched] Unexpected error:", e);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

