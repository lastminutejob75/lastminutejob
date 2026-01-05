import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export interface Candidate {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone?: string | null;
  created_at: string;
  last_application_at: string | null;
  applications_count: number;
}

interface UseCandidatesOptions {
  search?: string;
}

export function useCandidates(options: UseCandidatesOptions = {}) {
  const { search } = options;
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function fetchCandidates() {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("candidates")
        .select(
          `
          id,
          first_name,
          last_name,
          email,
          phone,
          created_at,
          last_application_at,
          applications(count)
        `
        )
        .order("created_at", { ascending: false });

      if (search && search.trim() !== "") {
        const s = `%${search.trim()}%`;
        query = query.or(
          `first_name.ilike.${s},last_name.ilike.${s},email.ilike.${s}`
        );
      }

      const { data, error } = await query;

      if (ignore) return;

      if (error) {
        console.error("Error fetching candidates:", error);
        setError(error.message);
        setCandidates([]);
      } else {
        const normalized: Candidate[] = (data || []).map((row: any) => ({
          id: row.id,
          first_name: row.first_name,
          last_name: row.last_name,
          email: row.email,
          phone: row.phone,
          created_at: row.created_at,
          last_application_at: row.last_application_at,
          applications_count: Array.isArray(row.applications) ? row.applications[0]?.count ?? 0 : (row.applications?.count ?? 0),
        }));
        setCandidates(normalized);
      }

      setLoading(false);
    }

    fetchCandidates();

    return () => {
      ignore = true;
    };
  }, [search]);

  return { candidates, loading, error };
}

