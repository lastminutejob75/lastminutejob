import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export type ApplicationStatus =
  | "new"
  | "seen"
  | "shortlisted"
  | "rejected"
  | "hired";

export interface Application {
  id: string;
  status: ApplicationStatus;
  created_at: string;
  candidate_id: string | null;
  candidate_name: string | null;
  candidate_email: string | null;
  candidate_phone?: string | null;
  message: string | null;
}

export function useApplicationsForJob(jobId: string | null) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setApplications([]);
      return;
    }

    let ignore = false;

    async function fetchApplications() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("applications")
        .select(
          `
          id,
          status,
          created_at,
          candidate_id,
          candidate_name,
          candidate_email,
          candidate_phone,
          message
        `
        )
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });

      if (ignore) return;

      if (error) {
        console.error("Error fetching applications:", error);
        setError(error.message);
        setApplications([]);
      } else {
        setApplications((data || []) as Application[]);
      }

      setLoading(false);
    }

    fetchApplications();

    return () => {
      ignore = true;
    };
  }, [jobId]);

  return { applications, loading, error, setApplications };
}

