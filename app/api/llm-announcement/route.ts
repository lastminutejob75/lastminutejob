import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const systemPrompt = `
Tu es UWi, un assistant qui transforme un besoin libre en une annonce courte, claire, prête à publier.

Règles :

1) Tu ne parles jamais de "recruteur" ou "candidat".

2) Tu distingues simplement 2 types :
   - "offer_services" : la personne parle d'elle-même, propose ses services ou cherche une mission/job.
   - "need_someone" : la personne cherche quelqu'un pour l'aider ou travailler.

3) Tu réponds TOUJOURS en JSON STRICT :

{
  "type": "offer_services" | "need_someone",
  "role_label": "string",
  "short_context": "string",
  "location": "string | null",
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

7) La langue de sortie suit la langue du prompt.

8) Si le métier est clair dans le texte (ex : agent immobilier, développeur web, serveur, etc.), utilise ce métier dans "role_label".
`;

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "prompt is required" },
        { status: 400 }
      );
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // ou "gpt-4.1-mini" selon disponibilité
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Texte utilisateur : "${prompt}". Génère l'objet JSON pour cette situation.`,
        },
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content || "";

    let json;
    try {
      json = JSON.parse(content);
    } catch (e) {
      // fallback très simple en cas de problème de parsing
      json = {
        type: "need_someone",
        role_label: "Besoin à préciser",
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

    return NextResponse.json({ ok: true, announcement: json });
  } catch (e) {
    console.error("[llm-announcement] error:", e);
    return NextResponse.json(
      { error: "llm_error" },
      { status: 500 }
    );
  }
}

