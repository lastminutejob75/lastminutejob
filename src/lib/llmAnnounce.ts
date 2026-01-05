import { type LLMAnnouncementResponse, parseLLMResponse } from "./llmAnnouncePrompt";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Appelle le LLM pour générer une annonce à partir d'un prompt utilisateur
 */
export async function generateAnnouncementWithLLM(
  prompt: string
): Promise<LLMAnnouncementResponse | null> {
  if (!SUPABASE_URL) {
    console.error("[generateAnnouncementWithLLM] VITE_SUPABASE_URL not configured");
    return null;
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/uwi-announce`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      console.error("[generateAnnouncementWithLLM] API error:", error);
      return null;
    }

    const data = await response.json();
    
    // Format de réponse : { ok: true, announcement: {...} }
    if (data.ok && data.announcement) {
      return parseLLMResponse(JSON.stringify(data.announcement));
    }
    
    return null;
  } catch (e) {
    console.error("[generateAnnouncementWithLLM] Network error:", e);
    return null;
  }
}

