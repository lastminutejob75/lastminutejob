import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export type JobStatus = "draft" | "pending" | "published" | "archived";

export type JobSource = "client" | "admin" | "scraped";

export interface Job {
  id: string;
  title: string;
  city: string | null;
  created_at: string;
  status: JobStatus;
  source: JobSource;
  replies_count?: number; // on va le calculer plus tard si besoin
}

interface UseJobsOptions {
  status?: JobStatus;
  search?: string; // filtre texte (titre/ville)
}

export function useJobs(options: UseJobsOptions = {}, refreshKey?: number) {
  const { status, search } = options;
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function fetchJobs() {
      setLoading(true);
      setError(null);

      // Charger TOUS les jobs (pas de filtre par défaut pour l'admin)
      let query = supabase
        .from("jobs")
        .select(
          `
          id,
          title,
          parsed,
          created_at,
          status,
          source
        `,
          { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .limit(500); // Augmenter la limite pour voir toutes les annonces

      if (status) {
        // Mapper les nouveaux statuts vers les anciens pour la requête
        const statusMapToOld: Record<JobStatus, string> = {
          'published': 'approved',
          'archived': 'rejected',
          'pending': 'pending',
          'draft': 'pending', // Les brouillons n'existent pas dans l'ancienne structure
        };
        query = query.eq("status", statusMapToOld[status] || status);
      }

      if (search && search.trim() !== "") {
        // simple filtre par titre ou ville (dans parsed jsonb)
        // Note: Supabase ne supporte pas directement les filtres sur jsonb dans .or()
        // On filtre d'abord par titre, puis on filtre côté client pour la ville
        const searchTerm = `%${search.trim()}%`;
        query = query.ilike("title", searchTerm);
      }

      const { data, error } = await query;

      if (ignore) return;

      if (error) {
        console.error("Error fetching jobs:", error);
        setError(error.message);
        setJobs([]);
        setLoading(false);
      } else {
        // Normaliser les données rapidement sans counts
        // Extraire city depuis parsed jsonb
        // Mapper les anciens statuts vers les nouveaux
        const statusMap: Record<string, JobStatus> = {
          'approved': 'published',
          'rejected': 'archived',
          'pending': 'pending',
          'draft': 'draft',
          'published': 'published',
          'archived': 'archived',
        };
        
        const sourceMap: Record<string, JobSource> = {
          'user': 'client',
          'admin': 'admin',
          'scraped': 'scraped',
          'client': 'client',
        };
        
        let normalized: Job[] = (data || []).map((row: any) => ({
          id: row.id,
          title: row.title,
          city: row.parsed?.city || null,
          created_at: row.created_at,
          status: statusMap[row.status] || 'pending',
          source: sourceMap[row.source] || 'client',
          replies_count: 0, // Sera mis à jour de manière asynchrone
        }));
        
        // Filtrer par ville côté client si une recherche est active
        if (search && search.trim() !== "") {
          const searchLower = search.trim().toLowerCase();
          normalized = normalized.filter((job) => {
            const titleMatch = job.title?.toLowerCase().includes(searchLower);
            const cityMatch = job.city?.toLowerCase().includes(searchLower);
            return titleMatch || cityMatch;
          });
        }
        setJobs(normalized);
        setLoading(false);
        
        // Charger les counts de manière asynchrone après le rendu initial
        if (normalized.length > 0) {
          const jobIds = normalized.map(j => j.id);
          
          // Requête pour obtenir tous les job_id avec leurs applications
          supabase
            .from("applications")
            .select("job_id")
            .in("job_id", jobIds)
            .then(({ data: appsData, error: appsError }) => {
              if (ignore || appsError) return;
              
              // Compter les applications par job_id
              const counts: Record<string, number> = {};
              if (appsData) {
                appsData.forEach((app: any) => {
                  counts[app.job_id] = (counts[app.job_id] || 0) + 1;
                });
              }
              
              // Mettre à jour les counts
              setJobs((prev) =>
                prev.map((job) => ({
                  ...job,
                  replies_count: counts[job.id] || 0,
                }))
              );
            });
        }
      }
    }

    fetchJobs();

    return () => {
      ignore = true;
    };
  }, [status, search, refreshKey]);

  return { jobs, loading, error, setJobs };
}

