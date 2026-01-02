/**
 * Utilitaire pour analyser les logs de détection de métiers
 * Permet d'identifier de nouveaux tokens candidats pour améliorer la détection
 */

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from './env';

// Note: Pour utiliser ce script, vous devez avoir accès au service role key
// En production, cela devrait être fait côté serveur (Edge Function)

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0600-\u06FF\s]/gi, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export interface TokenFrequency {
  token: string;
  frequency: number;
}

/**
 * Trouve les tokens les plus fréquents dans les prompts où aucun métier n'a été détecté
 * Utile pour identifier de nouveaux métiers à ajouter au système
 */
export async function findNewCandidateTokens(
  supabaseServiceKey: string,
  limit: number = 1000
): Promise<TokenFrequency[]> {
  const supabase = createClient(SUPABASE_URL, supabaseServiceKey);

  const { data, error } = await supabase
    .from("job_detection_logs")
    .select("prompt_text")
    .is("primary_job_key", null) // cas où on n'a rien détecté
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("Error fetching logs:", error);
    return [];
  }

  const freq: Record<string, number> = {};

  for (const row of data) {
    const tokens = tokenize(row.prompt_text);
    for (const t of tokens) {
      if (t.length < 3) continue; // Ignorer les tokens trop courts
      freq[t] = (freq[t] || 0) + 1;
    }
  }

  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 100)
    .map(([token, frequency]) => ({ token, frequency }));

  return sorted;
}

/**
 * Analyse les logs pour identifier les patterns de métiers non détectés
 */
export async function analyzeUndetectedJobs(
  supabaseServiceKey: string,
  limit: number = 500
): Promise<{
  totalUndetected: number;
  commonPatterns: Array<{ pattern: string; count: number }>;
  samplePrompts: string[];
}> {
  const supabase = createClient(SUPABASE_URL, supabaseServiceKey);

  const { data, error } = await supabase
    .from("job_detection_logs")
    .select("prompt_text, created_at")
    .is("primary_job_key", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("Error fetching logs:", error);
    return {
      totalUndetected: 0,
      commonPatterns: [],
      samplePrompts: []
    };
  }

  // Extraire des patterns communs (bigrammes)
  const bigramFreq: Record<string, number> = {};
  const samplePrompts = data.slice(0, 20).map(row => row.prompt_text);

  for (const row of data) {
    const tokens = tokenize(row.prompt_text);
    for (let i = 0; i < tokens.length - 1; i++) {
      if (tokens[i].length >= 3 && tokens[i + 1].length >= 3) {
        const bigram = `${tokens[i]} ${tokens[i + 1]}`;
        bigramFreq[bigram] = (bigramFreq[bigram] || 0) + 1;
      }
    }
  }

  const commonPatterns = Object.entries(bigramFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([pattern, count]) => ({ pattern, count }));

  return {
    totalUndetected: data.length,
    commonPatterns,
    samplePrompts
  };
}

/**
 * Statistiques générales sur les logs
 */
export async function getLogsStatistics(
  supabaseServiceKey: string
): Promise<{
  total: number;
  withNoPrimary: number;
  incomplete: number;
  almostReady: number;
  ready: number;
  usedLLM: number;
  topJobs: Array<{ jobKey: string; count: number }>;
}> {
  const supabase = createClient(SUPABASE_URL, supabaseServiceKey);

  // Récupérer tous les logs (ou un échantillon)
  const { data, error } = await supabase
    .from("job_detection_logs")
    .select("primary_job_key, readiness_status, used_llm")
    .order("created_at", { ascending: false })
    .limit(10000);

  if (error || !data) {
    console.error("Error fetching logs:", error);
    return {
      total: 0,
      withNoPrimary: 0,
      incomplete: 0,
      almostReady: 0,
      ready: 0,
      usedLLM: 0,
      topJobs: []
    };
  }

  const total = data.length;
  const withNoPrimary = data.filter(l => !l.primary_job_key).length;
  const incomplete = data.filter(l => l.readiness_status === "incomplete").length;
  const almostReady = data.filter(l => l.readiness_status === "almost_ready").length;
  const ready = data.filter(l => l.readiness_status === "ready").length;
  const usedLLM = data.filter(l => l.used_llm).length;

  // Compter les métiers les plus fréquents
  const jobCounts: Record<string, number> = {};
  for (const log of data) {
    if (log.primary_job_key) {
      jobCounts[log.primary_job_key] = (jobCounts[log.primary_job_key] || 0) + 1;
    }
  }

  const topJobs = Object.entries(jobCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([jobKey, count]) => ({ jobKey, count }));

  return {
    total,
    withNoPrimary,
    incomplete,
    almostReady,
    ready,
    usedLLM,
    topJobs
  };
}

