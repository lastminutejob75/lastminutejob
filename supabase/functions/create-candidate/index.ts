import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const clean = (s?: string) => (s || "").trim() || null;

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
      profile
    } = body as {
      prompt?: string;
      jobKey: string;
      profile?: {
        headline?: string;
        bio?: string;
        location?: string;
        availability?: string;
        experienceLevel?: string;
        contractType?: string;
        remotePreference?: string;
      };
    };

    if (!jobKey) {
      return new Response(
        JSON.stringify({ error: "jobKey is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!profile) {
      return new Response(
        JSON.stringify({ error: "profile is required" }),
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
      .from("candidates")
      .insert({
        prompt_text: prompt || null,
        job_key: jobKey,
        headline: clean(profile.headline),
        bio: clean(profile.bio),
        location: clean(profile.location),
        availability: clean(profile.availability),
        experience_level: clean(profile.experienceLevel),
        contract_type: clean(profile.contractType),
        remote_preference: clean(profile.remotePreference)
      })
      .select("*")
      .single();

    if (error) {
      console.error("[candidates.insert] error:", error);
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
        candidateId: data.id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("[candidates] invalid payload:", e);
    return new Response(
      JSON.stringify({ error: "invalid payload" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

