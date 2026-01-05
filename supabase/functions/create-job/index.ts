import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Types pour le partage
type ShareChannel = "uwi" | "linkedin" | "facebook" | "email" | "leboncoin";

interface JobSharePayload {
  channel: ShareChannel;
  title: string;
  body: string;
  hashtags?: string[];
  url?: string;
}

interface JobContext {
  urgency?: "low" | "medium" | "high";
  duration?: "one_day" | "short" | "long";
  location?: string | null;
  temporal?: string | null;
}

// Fonction pour construire les payloads de partage (version simplifiée inline)
function buildSharePayloads(args: {
  jobKey: string;
  title: string;
  description: string;
  requirements: string[];
  context: JobContext;
  jobUrl: string;
  channels: ShareChannel[];
}): JobSharePayload[] {
  const { jobKey, title, description, requirements, context, jobUrl, channels } = args;

  const baseLine = `${title}${context.location ? ` - ${context.location}` : ""}`;

  const hashtags = [
    "#recrutement",
    "#job",
    context.location ? `#${context.location.replace(/\s+/g, "")}` : "",
    jobKey === "cook" ? "#cuisine" : "",
    jobKey === "server" ? "#restauration" : "",
    jobKey.includes("developer") ? "#dev" : ""
  ].filter(Boolean);

  return channels.map(channel => {
    switch (channel) {
      case "linkedin":
        return {
          channel,
          title: baseLine,
          body: [
            description,
            "",
            requirements.length ? "Profil recherché :" : "",
            ...requirements.map(r => `• ${r}`),
            "",
            `👉 Postulez ici : ${jobUrl}`
          ].filter(Boolean).join("\n"),
          hashtags
        };

      case "facebook":
        return {
          channel,
          title: baseLine,
          body: [
            description,
            "",
            requirements.length ? "On recherche :" : "",
            ...requirements.map(r => `- ${r}`),
            "",
            `📩 Candidatures via : ${jobUrl}`
          ].filter(Boolean).join("\n"),
          hashtags
        };

      case "email":
        return {
          channel,
          title: `[Mission] ${baseLine}`,
          body: [
            `Bonjour,`,
            "",
            `Nous recherchons : ${title}`,
            "",
            description,
            "",
            requirements.length ? "Profil recherché :" : "",
            ...requirements.map(r => `- ${r}`),
            "",
            `Candidatures via : ${jobUrl}`,
            "",
            `Cordialement,`,
            `L'équipe UWi / LMJ`
          ].join("\n")
        };

      case "leboncoin":
        return {
          channel,
          title: baseLine,
          body: [
            description,
            "",
            "Profil recherché :",
            ...requirements.map(r => `- ${r}`),
            "",
            context.duration ? `Durée : ${context.duration}` : "",
            context.urgency ? `Urgence : ${context.urgency}` : "",
            "",
            `Merci d'envoyer vos informations ou CV via notre formulaire : ${jobUrl}`
          ].filter(Boolean).join("\n")
        };

      case "uwi":
      default:
        return {
          channel,
          title,
          body: description,
          url: jobUrl
        };
    }
  });
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
    const body = await req.json();
    const { 
      prompt, 
      jobKey, 
      context, 
      readiness, 
      title, 
      description, 
      requirements,
      channels = ["uwi"] // Par défaut, publier sur UWi
    } = body;

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const appUrl = Deno.env.get("NEXT_PUBLIC_APP_URL") || "https://lastminutejob.pro";

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Supabase configuration missing" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { createClient } = await import("jsr:@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1) Créer le job
    const { data: job, error } = await supabase
      .from("jobs")
      .insert({
        title: title || "Mission",
        body: description || "",
        parsed: {
          role: jobKey,
          city: context?.location || null,
          date: null,
          duration: context?.duration || null,
          hourly: null
        },
        contact: {},
        status: "pending",
        source: "wizard"
      })
      .select()
      .single();

    if (error || !job) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "db error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 2) Construire l'URL de la mission
    const jobUrl = `${appUrl}/#/job/${job.id}`;

    // 3) Générer les payloads par canal
    const sharePayloads = buildSharePayloads({
      jobKey,
      title: title || "Mission",
      description: description || "",
      requirements: requirements || [],
      context: context || {},
      jobUrl,
      channels: channels as ShareChannel[]
    });

    // 4) Stocker dans job_publications
    const publications = sharePayloads.map(p => ({
      job_id: job.id,
      channel: p.channel,
      status: "prepared",
      payload: p
    }));

    const { error: pubError } = await supabase
      .from("job_publications")
      .insert(publications);

    if (pubError) {
      console.error("Publication error:", pubError);
      // On ne bloque pas pour ça
    }

    return new Response(
      JSON.stringify({
        ok: true,
        jobId: job.id,
        jobUrl,
        sharePayloads
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Create job error:", error);
    return new Response(
      JSON.stringify({ error: "invalid payload" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});


