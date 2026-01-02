import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

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
    const body = await req.json();

    const {
      rawPrompt,
      jobCandidates,
      primaryJob,
      context,
      direction,
      readiness
    } = body as {
      rawPrompt: string;
      jobCandidates: any[];
      primaryJob: any | null;
      context: any;
      direction: "demande_de_ressource" | "offre_de_competence" | "unknown";
      readiness: any;
    };

    if (!rawPrompt || typeof rawPrompt !== "string") {
      return new Response(
        JSON.stringify({ error: "rawPrompt is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!direction || !["demande_de_ressource", "offre_de_competence", "unknown"].includes(direction)) {
      return new Response(
        JSON.stringify({ error: "direction is required and must be valid" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    const { error, data } = await supabaseAdmin
      .from("needs")
      .insert({
        raw_prompt: rawPrompt,
        job_candidates: jobCandidates || [],
        primary_job: primaryJob || null,
        context: context || {},
        direction,
        readiness: readiness || { score: 0, status: "incomplete", missing: [] }
      })
      .select("*")
      .single();

    if (error) {
      console.error("[needs.insert] error:", error);
      return new Response(
        JSON.stringify({ error: "db error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        needId: data.id,
        need: data
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("[create-need] invalid payload:", e);
    return new Response(
      JSON.stringify({ error: "invalid payload" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

