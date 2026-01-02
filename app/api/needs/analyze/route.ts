import { NextRequest, NextResponse } from "next/server";

import { analyzeNeedPrompt } from "@/lib/jobEngine";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "prompt is required" },
        { status: 400 }
      );
    }

    const parsed = await analyzeNeedPrompt(prompt);

    return NextResponse.json(parsed);
  } catch (e) {
    console.error("[needs/analyze] error:", e);
    return NextResponse.json(
      { error: "analyze error" },
      { status: 500 }
    );
  }
}

