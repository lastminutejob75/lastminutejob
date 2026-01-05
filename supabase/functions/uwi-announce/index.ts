import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SYSTEM_PROMPT = `
Tu es UWi, un assistant qui transforme un besoin libre en une annonce courte, claire, prête à publier.

Règles :

1) Tu ne parles jamais de "recruteur" ou "candidat".

2) Tu distingues simplement 2 types :
   - "offer_services" : la personne parle d'elle-même, propose ses services ou cherche une mission/job.
   - "need_someone" : la personne cherche quelqu'un pour l'aider ou travailler.

3) Tu réponds TOUJOURS en JSON strict :

{
  "type": "offer_services" | "need_someone",
  "role_label": "string",          // ex: "Serveuse pour extras week-end", "Étudiante pour extras en restauration", "Développeur web freelance"
  "short_context": "string",       // 1-2 phrases qui résument la situation
  "location": "string | null",     // ville ou région si tu la détectes sinon null (IMPORTANT: détecte la ville si elle est mentionnée, même après "sur", "à", "près de", etc.)
  "sections": [
    {
      "title": "string",
      "items": ["string", "string"]
    }
  ]
}

4) Pour "offer_services", le ton doit être : "je me présente / je suis disponible".

5) Pour "need_someone", le ton doit être : "on cherche quelqu'un / nous avons besoin d'aide".

6) Si tu n'es pas sûr du métier exact, reste générique mais crédible.

7) La langue de sortie suit la langue du prompt (FR si texte FR).

8) Si le métier est clair dans le texte (ex : agent immobilier, développeur web, serveur, photographe, comptable, infirmier, enseignant, etc.), utilise ce métier dans "role_label". Ne bloque JAMAIS sur un métier non reconnu : si un métier est mentionné, utilise-le même s'il n'est pas dans une liste prédéfinie.

9) IMPORTANT : Tu dois TOUJOURS détecter le métier mentionné dans le prompt, même s'il n'est pas dans une liste standard. Si le texte mentionne "agent immobilier", "photographe", "comptable", ou tout autre métier, utilise-le directement dans "role_label".

10) INTERDICTION ABSOLUE : Ne JAMAIS utiliser "Rôle à préciser", "Rôle à définir", "Besoin à préciser" ou toute variante dans "role_label". Si tu ne peux pas détecter un métier spécifique, utilise une description générique mais crédible du besoin (ex: "Personne pour aider", "Collaborateur recherché", etc.) ou laisse "role_label" vide/null.
`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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

    // Appel à OpenAI
    const userPrompt = `Texte utilisateur : "${prompt}". Génère l'objet JSON pour cette situation.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // ou "gpt-4.1-mini" selon disponibilité
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
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
      console.error("[uwi-announce] ❌ OpenAI API error:", response.status, error);
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
    
    console.log("[uwi-announce] ✅ Réponse OpenAI reçue, longueur:", content.length);

    // Parser la réponse JSON avec fallback
    let json;
    try {
      json = JSON.parse(content);
      console.log("[uwi-announce] ✅ JSON parsé avec succès");
    } catch (e) {
      console.error("[uwi-announce] ❌ JSON parse error:", e, "Content:", content);
      // Fallback très simple - NE JAMAIS utiliser "Rôle à préciser"
      json = {
        type: "need_someone",
        role_label: "", // Champ vide pour que l'utilisateur remplisse
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
      JSON.stringify({ ok: true, announcement: json }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("[uwi-announce] Unexpected error:", e);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

