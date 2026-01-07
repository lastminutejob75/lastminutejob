// "@/lib/supabaseClient"

import { createClient } from "@supabase/supabase-js";

// For Vite projects, use import.meta.env instead of process.env
// ⚠️ IMPORTANT : LastMinuteJob utilise son propre Supabase, séparé d'UWi
// Supabase LastMinuteJob : https://lsukxdglogtgfukdqqti.supabase.co
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://lsukxdglogtgfukdqqti.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_8lYvOVlfCNTdJaYB0SYfnw_5PapFvCO";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey
  });
  // Ne pas lancer d'erreur pour éviter de bloquer le site
  // Les hooks géreront les erreurs si Supabase n'est pas configuré
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

