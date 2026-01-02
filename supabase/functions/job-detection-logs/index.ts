import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

/**
 * Edge Function pour recevoir les logs de détection de métiers
 * 
 * Le logging ne doit jamais casser l'UX - on renvoie toujours 200 même en cas d'erreur
 */
Deno.serve(async (req: Request) => {
  // Gérer CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Seulement POST accepté
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ ok: false, error: "Method not allowed" }),
      {
        status: 200, // Toujours 200 pour ne pas casser l'UX
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const body = await req.json();
    
    // Accepter un log unique ou un batch
    const logs = Array.isArray(body) ? body : [body];

    // Log dans la console (pour debug)
    console.log(`[JOB DETECTION LOGS] Received ${logs.length} log(s):`, {
      count: logs.length,
      sample: logs[0] ? {
        prompt_text: logs[0].prompt_text?.substring(0, 50),
        primary_job_key: logs[0].primary_job_key,
        readiness_status: logs[0].readiness_status
      } : null
    });

    // Stocker en Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (supabaseUrl && supabaseServiceKey) {
      const { createClient } = await import("jsr:@supabase/supabase-js@2");
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Mapper les logs vers la structure de la table
      const { error } = await supabase
        .from("job_detection_logs")
        .insert(logs.map(log => ({
          prompt_text: log.prompt_text,
          primary_job_key: log.primary_job_key,
          primary_confidence: log.primary_confidence,
          secondary_jobs: log.secondary_jobs || null,
          readiness_score: log.readiness_score,
          readiness_status: log.readiness_status,
          readiness_missing: log.readiness_missing || [],
          location: log.location,
          duration: log.duration,
          urgency: log.urgency,
          used_llm: log.used_llm || false,
          user_agent: log.user_agent,
          path: log.path,
          raw: log.raw || null
        })));
      
      if (error) {
        // Log l'erreur mais ne pas faire échouer la requête
        console.error("[JOB DETECTION LOGS] Database error:", error);
      } else {
        console.log(`[JOB DETECTION LOGS] Successfully stored ${logs.length} log(s)`);
      }
    } else {
      console.warn("[JOB DETECTION LOGS] Missing Supabase credentials, skipping database storage");
    }

    // Toujours renvoyer 200 pour ne pas casser l'UX
    return new Response(
      JSON.stringify({ ok: true, received: logs.length }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // En cas d'erreur, on log mais on renvoie quand même 200
    console.error("[JOB DETECTION LOGS] Error:", error);
    
    return new Response(
      JSON.stringify({ ok: false, error: "Internal error" }),
      {
        status: 200, // Toujours 200 - le logging ne doit jamais casser l'UX
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

