// "@/lib/supabaseClient"

import { createClient } from "@supabase/supabase-js";

// For Vite projects, use import.meta.env instead of process.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://gywhqtlebvvauxzmdavb.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5d2hxdGxlYnZ2YXV4em1kYXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjE4NDUsImV4cCI6MjA3NzQ5Nzg0NX0.iQB1ZvpjX8hJ4VPclogbRYQnSd0LOFHGuYXrxGbI0Q8";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey
  });
  // Ne pas lancer d'erreur pour éviter de bloquer le site
  // Les hooks géreront les erreurs si Supabase n'est pas configuré
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

