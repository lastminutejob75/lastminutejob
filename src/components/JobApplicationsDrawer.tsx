import React, { useState } from "react";
import { useApplicationsForJob, type Application, type ApplicationStatus } from "../hooks/useApplicationsForJob";
import { supabase } from "../lib/supabaseClient";

interface JobApplicationsDrawerProps {
  open: boolean;
  jobId: string | null;
  jobTitle?: string;
  onClose: () => void;
}

export function JobApplicationsDrawer({
  open,
  jobId,
  jobTitle,
  onClose,
}: JobApplicationsDrawerProps) {
  const { applications, loading, error, setApplications } = useApplicationsForJob(jobId);
  const [savingId, setSavingId] = useState<string | null>(null);

  if (!open || !jobId) return null;

  const handleStatusChange = async (app: Application, newStatus: ApplicationStatus) => {
    if (app.status === newStatus) return;

    setSavingId(app.id);

    try {
      const { data, error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", app.id)
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
        .single();

      if (error) throw error;
      if (data) {
        setApplications((prev) =>
          prev.map((a) => (a.id === data.id ? (data as Application) : a))
        );
      }
    } catch (err: any) {
      console.error(err);
      alert("Erreur lors de la mise à jour du statut.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/20">
      <div className="w-full max-w-md h-full bg-white shadow-xl border-l border-slate-200 flex flex-col">
        {/* Header */}
        <header className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">
              Candidatures
            </h2>
            <p className="text-[11px] text-slate-400 line-clamp-1">
              {jobTitle || "Annonce"} – {applications.length} réponse(s)
            </p>
          </div>
          <button
            type="button"
            className="text-xs text-slate-400 hover:text-slate-700"
            onClick={onClose}
          >
            Fermer
          </button>
        </header>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto px-4 py-3 text-xs">
          {loading && (
            <p className="text-slate-400 text-xs">
              Chargement des candidatures…
            </p>
          )}

          {error && !loading && (
            <p className="text-red-500 text-xs">
              Erreur : {error}
            </p>
          )}

          {!loading && !error && applications.length === 0 && (
            <p className="text-slate-400 text-xs">
              Aucune réponse pour cette annonce pour le moment.
            </p>
          )}

          <ul className="space-y-3">
            {applications.map((app) => (
              <li
                key={app.id}
                className="border border-slate-200 rounded-lg p-3 bg-slate-50"
              >
                <div className="flex justify-between gap-2">
                  <div>
                    <div className="font-semibold text-slate-800">
                      {app.candidate_name || app.candidate_email || "Candidat sans nom"}
                    </div>
                    {app.candidate_email && (
                      <div className="text-[11px] text-slate-500">
                        {app.candidate_email}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">
                      {new Date(app.created_at).toLocaleDateString()}
                    </div>
                    <StatusPill
                      status={app.status}
                      disabled={savingId === app.id}
                      onChange={(newStatus) => handleStatusChange(app, newStatus)}
                    />
                  </div>
                </div>

                {app.message && (
                  <p className="mt-2 text-[11px] text-slate-700 whitespace-pre-line">
                    {app.message}
                  </p>
                )}

                {/* Zone de notes internes – version très simple */}
                {/* Tu pourras la brancher sur la table admin_notes plus tard */}
                <details className="mt-2 text-[11px] text-slate-500">
                  <summary className="cursor-pointer select-none">
                    Notes internes (à implémenter)
                  </summary>
                  <p className="mt-1 text-[10px] text-slate-400">
                    Ici tu pourras enregistrer des notes admin liées à cette candidature
                    (table admin_notes).
                  </p>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatusPill({
  status,
  disabled,
  onChange,
}: {
  status: ApplicationStatus;
  disabled?: boolean;
  onChange: (status: ApplicationStatus) => void;
}) {
  const labelMap: Record<ApplicationStatus, string> = {
    new: "Nouveau",
    seen: "Vu",
    shortlisted: "Retenu",
    rejected: "Refusé",
    hired: "Embauché",
  };

  const nextOptions: ApplicationStatus[] = ["new", "seen", "shortlisted", "rejected", "hired"];

  return (
    <select
      className="mt-1 text-[10px] border border-slate-200 rounded-full px-2 py-0.5 bg-white"
      value={status}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as ApplicationStatus)}
    >
      {nextOptions.map((opt) => (
        <option key={opt} value={opt}>
          {labelMap[opt]}
        </option>
      ))}
    </select>
  );
}

