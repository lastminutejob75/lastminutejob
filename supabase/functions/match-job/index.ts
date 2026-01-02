import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Extraire le jobId de l'URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const jobId = pathParts[pathParts.length - 1];

    if (!jobId || jobId === "match-job") {
      return new Response(
        JSON.stringify({ error: "jobId is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // 1. Récupérer le job
    const { data: job, error: jobError } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return new Response(
        JSON.stringify({ error: "Job not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Extraire le job_key du job (depuis parsed.role ou directement)
    const jobKey = job.parsed?.role || job.job_key || null;
    const jobLocation = job.parsed?.city || job.location || null;

    if (!jobKey) {
      return new Response(
        JSON.stringify({ 
          candidates: [],
          message: "No job_key found in job"
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 2. Chercher les candidats avec job_key identique + même location ou remote
    const { data: candidates, error: candidatesError } = await supabaseAdmin
      .from("candidates")
      .select("*")
      .eq("job_key", jobKey)
      .or(
        jobLocation
          ? `location.eq.${jobLocation},remote_preference.eq.Remote`
          : "remote_preference.eq.Remote"
      )
      .order("created_at", { ascending: false });

    if (candidatesError) {
      console.error("[match-job] candidates query error:", candidatesError);
      return new Response(
        JSON.stringify({ error: "Database error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        job: {
          id: job.id,
          title: job.title,
          jobKey,
          location: jobLocation
        },
        candidates: candidates || [],
        count: candidates?.length || 0
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("[match-job] error:", e);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

