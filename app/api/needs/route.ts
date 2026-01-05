import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      rawPrompt,
      jobCandidates,
      primaryJob,
      context,
      direction,
      readiness
    } = body;

    if (!rawPrompt || typeof rawPrompt !== "string") {
      return NextResponse.json(
        { error: "rawPrompt is required" },
        { status: 400 }
      );
    }

    if (!direction || !["demande_de_ressource", "offre_de_competence", "unknown"].includes(direction)) {
      return NextResponse.json(
        { error: "direction is required and must be valid" },
        { status: 400 }
      );
    }

    const { error, data } = await supabase
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
      console.error("[needs/route] error:", error);
      return NextResponse.json(
        { error: "db error" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      needId: data.id,
      need: data
    });
  } catch (e) {
    console.error("[needs/route] invalid payload:", e);
    return NextResponse.json(
      { error: "invalid payload" },
      { status: 400 }
    );
  }
}

