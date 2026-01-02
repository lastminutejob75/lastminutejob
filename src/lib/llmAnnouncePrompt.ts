/**
 * Prompt système pour UWi - Transformation de besoin libre en annonce
 */

export const SYSTEM_PROMPT = `
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
  "location": "string | null",     // ville ou région si tu la détectes sinon null
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

8) Si le métier est clair dans le texte (ex : agent immobilier, développeur web, serveur, etc.), utilise ce métier dans "role_label".
`;

export interface LLMAnnouncementResponse {
  type: "offer_services" | "need_someone";
  role_label: string;
  short_context: string;
  location: string | null;
  sections: Array<{
    title: string;
    items: string[];
  }>;
}

/**
 * Génère un prompt utilisateur à partir du texte saisi
 */
export function buildUserPrompt(userText: string): string {
  return `Transforme ce besoin en annonce :\n\n"${userText}"`;
}

/**
 * Parse la réponse JSON du LLM
 */
export function parseLLMResponse(jsonString: string): LLMAnnouncementResponse | null {
  try {
    const parsed = JSON.parse(jsonString);
    
    // Validation basique
    if (
      parsed.type &&
      (parsed.type === "offer_services" || parsed.type === "need_someone") &&
      parsed.role_label &&
      parsed.short_context &&
      Array.isArray(parsed.sections)
    ) {
      return parsed as LLMAnnouncementResponse;
    }
    
    return null;
  } catch (e) {
    console.error("[parseLLMResponse] Error parsing JSON:", e);
    return null;
  }
}

