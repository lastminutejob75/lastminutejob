import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export interface Client {
  id: string;
  name: string | null;
  email: string;
  phone?: string | null;
  created_at: string;
  last_active_at: string | null;
  jobs_count: number;
}

interface UseClientsOptions {
  search?: string;
}

export function useClients(options: UseClientsOptions = {}) {
  const { search } = options;
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function fetchClients() {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("clients")
        .select(
          `
          id,
          name,
          email,
          phone,
          created_at,
          last_active_at,
          jobs(count)
        `
        )
        .order("created_at", { ascending: false });

      if (search && search.trim() !== "") {
        const s = `%${search.trim()}%`;
        query = query.or(`name.ilike.${s},email.ilike.${s}`);
      }

      const { data, error } = await query;

      if (ignore) return;

      if (error) {
        console.error("Error fetching clients:", error);
        setError(error.message);
        setClients([]);
      } else {
        const normalized: Client[] = (data || []).map((row: any) => ({
          id: row.id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          created_at: row.created_at,
          last_active_at: row.last_active_at,
          jobs_count: Array.isArray(row.jobs) ? row.jobs[0]?.count ?? 0 : (row.jobs?.count ?? 0),
        }));
        setClients(normalized);
      }

      setLoading(false);
    }

    fetchClients();

    return () => {
      ignore = true;
    };
  }, [search]);

  return { clients, loading, error };
}

