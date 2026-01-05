import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Import du moteur de détection (à adapter selon votre structure)
// Pour l'instant, on va utiliser une version simplifiée inline
// Dans un vrai projet, vous importeriez depuis un module partagé

interface DetectedJob {
  jobKey: string;
  score: number;
  confidence: number;
}

interface JobContext {
  urgency?: "low" | "medium" | "high";
  duration?: "one_day" | "short" | "long";
  location?: string | null;
  temporal?: string | null;
}

interface MissionReadiness {
  score: number;
  status: "incomplete" | "almost_ready" | "ready";
  missing: string[];
}

interface LLMJobSuggestion {
  primaryJob?: string | null;
  secondaryJob?: string | null;
  missing?: string[];
}

type UserRole = "recruiter" | "candidate" | "unknown";

interface RoleDetection {
  role: UserRole;
  recruiterScore: number;
  candidateScore: number;
}

// Fonction de tokenisation (simplifiée)
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0600-\u06FF\s]/gi, " ")
    .split(/\s+/)
    .filter(Boolean);
}

// Détection du rôle utilisateur
function detectUserRole(text: string): RoleDetection {
  const lower = text.toLowerCase();
  const tokens = tokenize(text);

  let recruiterScore = 0;
  let candidateScore = 0;

  // --- RECRUTEUR : FR ---
  if (
    /nous\s+(recherchons|recrutons|cherchons)/.test(lower) ||
    /on\s+cherche/.test(lower)
  ) {
    recruiterScore += 3;
  }

  if (/je\s+(recrute|recherche)\s+un[e]?\s+/.test(lower)) {
    recruiterScore += 2;
  }

  if (/je\s+cherche\s+(quelqu'un|une personne|du monde)/.test(lower)) {
    recruiterScore += 2;
  }

  if (
    /je\s+cherche\s+un[e]?\s+[a-zéèêàîïôûç]+/.test(lower) &&
    !/poste|job|emploi|boulot|travail|mission/.test(lower)
  ) {
    recruiterScore += 1.5;
  }

  if (
    tokens.some(t =>
      [
        "recrute",
        "recrutons",
        "recrutement",
        "candidatures",
        "mon equipe",
        "mon équipe",
        "notre restaurant",
        "notre societé",
        "notre société",
        "mon restaurant",
        "mon entreprise",
        "pour mon client",
        "pour un de nos clients"
      ].includes(t)
    )
  ) {
    recruiterScore += 1.5;
  }

  // --- RECRUTEUR : ENGLISH ---
  if (
    /we\s+are\s+(hiring|looking\s+for)/.test(lower) ||
    /we\s+need\s+a\s+/.test(lower)
  ) {
    recruiterScore += 3;
  }

  if (/i\s+need\s+(someone|a\s+developer|a\s+waiter)/.test(lower)) {
    recruiterScore += 1.5;
  }

  // --- RECRUTEUR : AR ---
  if (/نبحث عن/.test(text)) {
    recruiterScore += 3;
  }

  // --- CANDIDAT / FREELANCE : FR ---
  if (
    /je\s+cherche\s+un[e]?\s+(poste|job|emploi|boulot|travail|stage)/.test(lower)
  ) {
    candidateScore += 3;
  }

  if (/je\s+cherche\s+du\s+travail/.test(lower)) {
    candidateScore += 3;
  }

  if (
    /a la recherche d'un[e]?\s+(poste|job|emploi|travail)/.test(lower)
  ) {
    candidateScore += 2.5;
  }

  if (
    /je\s+suis\s+[a-zéèêàîïôûç]+\s+et\s+je\s+cherche\s+/.test(lower) &&
    /mission|poste|job|emploi|travail/.test(lower)
  ) {
    candidateScore += 2.5;
  }

  if (
    /freelance/.test(lower) &&
    (/dispo/.test(lower) || /disponible/.test(lower))
  ) {
    candidateScore += 2;
  }

  if (/je\s+propose\s+mes\s+services/.test(lower)) {
    candidateScore += 2;
  }

  if (/open to work|open to opportunities/.test(lower)) {
    candidateScore += 2.5;
  }

  if (
    /mon cv|cv en piece jointe|cv en pièce jointe|mon profil/.test(lower)
  ) {
    candidateScore += 1.5;
  }

  // --- CANDIDAT : ENGLISH ---
  if (
    /i'?m\s+looking\s+for\s+a\s+(job|position|role)/.test(lower) ||
    /looking\s+for\s+a\s+job/.test(lower)
  ) {
    candidateScore += 3;
  }

  if (
    /i\s+am\s+a\s+[a-z]+\s+and\s+i\s+am\s+looking\s+for\s+(a\s+job|work|freelance|missions?)/.test(lower)
  ) {
    candidateScore += 2.5;
  }

  if (
    /available\s+for\s+freelance/.test(lower) ||
    /available\s+for\s+missions?/.test(lower)
  ) {
    candidateScore += 2;
  }

  // --- CANDIDAT : AR ---
  if (/أبحث عن عمل/.test(text) || /ابحث عن عمل/.test(text)) {
    candidateScore += 3;
  }

  // --- Normalisation / décision ---
  if (/je\s+suis\s+[a-zéèêàîïôûç]+\b/.test(lower) && !/je\s+recrute/.test(lower)) {
    candidateScore += 1;
  }

  let role: UserRole = "unknown";

  if (recruiterScore === 0 && candidateScore === 0) {
    role = "unknown";
  } else if (recruiterScore >= candidateScore + 1) {
    role = "recruiter";
  } else if (candidateScore >= recruiterScore + 1) {
    role = "candidate";
  } else {
    role = "unknown";
  }

  return { role, recruiterScore, candidateScore };
}

function isRoleUncertain(
  recruiterScore: number,
  candidateScore: number
): boolean {
  if (recruiterScore === 0 && candidateScore === 0) return true;

  const diff = Math.abs(recruiterScore - candidateScore);

  // seuil que tu peux ajuster
  return diff < 1.5;
}

// Note: Dans un vrai projet, ces fonctions seraient importées depuis jobEngine.ts
// Pour l'instant, on fait un appel à l'API externe ou on utilise le moteur local
async function analyzeJobPromptLocal(prompt: string): Promise<{
  jobCandidates: DetectedJob[];
  detectedJobs: DetectedJob[]; // pour compatibilité
  context: JobContext;
  readiness: MissionReadiness;
  uncertain: boolean;
  direction: "demande_de_ressource" | "offre_de_competence" | "unknown";
  role: UserRole; // pour compatibilité
  roleScores: { recruiter: number; candidate: number };
}> {
  // Appel au moteur local (vous pouvez créer une Edge Function dédiée)
  // Ou utiliser directement les fonctions depuis un module partagé
  // Pour l'instant, on retourne une structure vide avec la détection de rôle
  const roleDetection = detectUserRole(prompt);
  
  // Fonction inline pour mapper role vers direction
  function mapRoleToDirection(role: "recruiter" | "candidate" | "unknown"): "demande_de_ressource" | "offre_de_competence" | "unknown" {
    if (role === "recruiter") return "demande_de_ressource";
    if (role === "candidate") return "offre_de_competence";
    return "unknown";
  }
  
  const direction = mapRoleToDirection(roleDetection.role);
  
  return {
    jobCandidates: [],
    detectedJobs: [], // pour compatibilité
    context: {},
    readiness: { score: 0, status: "incomplete", missing: [] },
    uncertain: true,
    direction,
    role: roleDetection.role, // pour compatibilité
    roleScores: {
      recruiter: roleDetection.recruiterScore,
      candidate: roleDetection.candidateScore
    }
  };
}

async function shouldCallLLM(detectedJobs: DetectedJob[], readiness: MissionReadiness): Promise<boolean> {
  if (!detectedJobs.length) return true;
  if (detectedJobs[0].confidence < 0.45) return true;
  if (readiness.status === "incomplete") return true;
  return false;
}

async function callLLMForJob(prompt: string): Promise<LLMJobSuggestion> {
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
  
  if (!openaiApiKey) {
    console.warn("OPENAI_API_KEY not set, skipping LLM call");
    return {};
  }

  const system = `You classify job requests in French.

Return ONLY valid JSON:
{
  "primaryJob": "cook | server | web_developer | frontend_developer | real_estate_agent | ...",
  "secondaryJob": "optional",
  "missing": ["location", "duration", "urgency"...]
}

Available job keys: cook, server, bartender, warehouse_worker, delivery_driver, shop_assistant, real_estate_agent, construction_worker, electrician, plumber, web_developer, frontend_developer, backend_developer, mobile_developer, graphic_designer, writer, community_manager, admin_assistant, cleaner, freelancer`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: `User prompt: "${prompt}"` }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      return {};
    }

    try {
      const json = JSON.parse(text);
      return {
        primaryJob: json.primaryJob || null,
        secondaryJob: json.secondaryJob || null,
        missing: json.missing || []
      };
    } catch {
      return {};
    }
  } catch (error) {
    console.error("LLM call error:", error);
    return {};
  }
}

function mergeLLMJobSuggestion(
  detectedJobs: DetectedJob[],
  llm: LLMJobSuggestion | null
): DetectedJob[] {
  if (!llm || !llm.primaryJob) return detectedJobs;

  const existing = detectedJobs.find(j => j.jobKey === llm.primaryJob);
  if (existing) {
    return [
      existing,
      ...detectedJobs.filter(j => j.jobKey !== llm.primaryJob)
    ];
  }

  return [
    { jobKey: llm.primaryJob, score: 0.6, confidence: 0.6 },
    ...detectedJobs
  ];
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
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "prompt is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 1) Moteur maison (appel à une autre Edge Function ou logique locale)
    // Pour l'instant, on utilise une version simplifiée
    // Dans un vrai projet, vous appelleriez analyzeJobPrompt depuis jobEngine
    const base = await analyzeJobPromptLocal(prompt);
    let { jobCandidates, detectedJobs, context, readiness, direction, role, roleScores } = base;
    let usedLLM = false;

    // 2) Fallback LLM si besoin
    if (await shouldCallLLM(detectedJobs, readiness)) {
      usedLLM = true;
      const llmResult = await callLLMForJob(prompt);
      detectedJobs = mergeLLMJobSuggestion(detectedJobs, llmResult);
      jobCandidates = detectedJobs; // synchroniser
    }

    const roleUncertain = isRoleUncertain(
      roleScores.recruiter,
      roleScores.candidate
    );

    // Calculer primaryJob (premier job détecté ou null)
    const primaryJob = jobCandidates.length > 0 ? jobCandidates[0] : (detectedJobs.length > 0 ? detectedJobs[0] : null);

    // Format ParsedNeed (principal)
    const parsedNeed = {
      rawPrompt: prompt,
      jobCandidates: jobCandidates.length > 0 ? jobCandidates : detectedJobs,
      primaryJob,
      context,
      direction,
      readiness
    };

    return new Response(
      JSON.stringify({
        // Format ParsedNeed principal
        ...parsedNeed,
        // Champs de compatibilité (optionnels, pour rétrocompatibilité)
        prompt, // pour compatibilité
        detectedJobs, // pour compatibilité
        uncertain: detectedJobs.length === 0 || detectedJobs[0].confidence < 0.5,
        usedLLM,
        role, // pour compatibilité
        roleUncertain: isRoleUncertain(roleScores.recruiter, roleScores.candidate),
        roleScores
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Analyze job error:", error);
    return new Response(
      JSON.stringify({ error: "analyze error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

