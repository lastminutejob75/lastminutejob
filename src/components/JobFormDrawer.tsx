import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { JobStatus, JobSource, Job } from "../hooks/useJobs";

type Mode = "create" | "edit";

interface JobFormDrawerProps {
  open: boolean;
  mode: Mode;
  initialJob?: Job | null;
  onClose: () => void;
  onSaved: (job: Job) => void;
}

interface FormValues {
  title: string;
  city: string;
  description: string;
  status: JobStatus;
  source: JobSource;
  isUrgent: boolean;
}

const defaultValues: FormValues = {
  title: "",
  city: "",
  description: "",
  status: "pending",
  source: "admin",
  isUrgent: false,
};

export function JobFormDrawer({
  open,
  mode,
  initialJob,
  onClose,
  onSaved,
}: JobFormDrawerProps) {
  const [values, setValues] = useState<FormValues>(defaultValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && initialJob) {
      // On va chercher la description à part si besoin
      setValues((prev) => ({
        ...prev,
        title: initialJob.title || "",
        city: initialJob.city || "",
        // description sera rechargée depuis Supabase si nécessaire
        description: "",
        status: initialJob.status,
        source: initialJob.source,
        isUrgent: false,
      }));

      // Optionnel : recharger la description complète depuis Supabase
      (async () => {
        const { data } = await supabase
          .from("jobs")
          .select("description, is_urgent")
          .eq("id", initialJob.id)
          .single();

        if (data) {
          setValues((prev) => ({
            ...prev,
            description: data.description || "",
            isUrgent: !!data.is_urgent,
          }));
        }
      })();
    } else if (mode === "create") {
      setValues(defaultValues);
      setError(null);
    }
  }, [mode, initialJob, open]);

  const handleChange = (
    field: keyof FormValues,
    value: string | boolean
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.title.trim()) {
      setError("Le titre est obligatoire.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === "create") {
        // Utiliser parsed jsonb pour city au lieu de colonne city
        const parsedData = {
          role: "",
          city: values.city.trim() || "",
          date: "",
          duration: "",
          hourly: "",
        };
        
        const { data, error } = await supabase
          .from("jobs")
          .insert({
            title: values.title.trim(),
            parsed: parsedData,
            description: values.description.trim() || null,
            status: values.status === "published" ? "approved" : (values.status === "archived" ? "rejected" : values.status),
            source: values.source === "client" ? "user" : values.source,
            is_urgent: values.isUrgent,
          })
          .select(
            "id, title, parsed, created_at, status, source"
          )
          .single();

        if (error) throw error;
        if (data) {
          // Normaliser les données pour correspondre à l'interface Job
          const normalized: Job = {
            id: data.id,
            title: data.title,
            city: data.parsed?.city || null,
            created_at: data.created_at,
            status: data.status === "approved" ? "published" : (data.status === "rejected" ? "archived" : data.status as JobStatus),
            source: data.source === "user" ? "client" : data.source as JobSource,
          };
          onSaved(normalized);
        }
      } else if (mode === "edit" && initialJob) {
        // Utiliser parsed jsonb pour city au lieu de colonne city
        const { data: existingData } = await supabase
          .from("jobs")
          .select("parsed")
          .eq("id", initialJob.id)
          .single();
        
        const existingParsed = existingData?.parsed || {};
        const parsedData = {
          ...existingParsed,
          city: values.city.trim() || existingParsed.city || "",
        };
        
        const { data, error } = await supabase
          .from("jobs")
          .update({
            title: values.title.trim(),
            parsed: parsedData,
            description: values.description.trim() || null,
            status: values.status === "published" ? "approved" : (values.status === "archived" ? "rejected" : values.status),
            source: values.source === "client" ? "user" : values.source,
            is_urgent: values.isUrgent,
          })
          .eq("id", initialJob.id)
          .select(
            "id, title, parsed, created_at, status, source"
          )
          .single();

        if (error) throw error;
        if (data) {
          // Normaliser les données pour correspondre à l'interface Job
          const normalized: Job = {
            id: data.id,
            title: data.title,
            city: data.parsed?.city || null,
            created_at: data.created_at,
            status: data.status === "approved" ? "published" : (data.status === "rejected" ? "archived" : data.status as JobStatus),
            source: data.source === "user" ? "client" : data.source as JobSource,
          };
          onSaved(normalized);
        }
      }

      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/20">
      <div className="w-full max-w-md h-full bg-white shadow-xl border-l border-slate-200 flex flex-col">
        <header className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">
              {mode === "create"
                ? "Nouvelle annonce (admin)"
                : "Modifier l'annonce"}
            </h2>
            <p className="text-[11px] text-slate-400">
              {mode === "create"
                ? "Créer une annonce pour un client ou pour le flux LMJ/UWi."
                : "Mets à jour le contenu et le statut de l'annonce."}
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

        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col px-4 py-3 gap-3 overflow-y-auto text-xs"
        >
          {error && (
            <div className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="block mb-1 text-[11px] font-medium text-slate-600">
              Titre de l'annonce *
            </label>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
              value={values.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Ex : Serveur événement soirée privée"
            />
          </div>

          <div>
            <label className="block mb-1 text-[11px] font-medium text-slate-600">
              Ville
            </label>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
              value={values.city}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="Ex : Lille, Paris, Bruxelles…"
            />
          </div>

          <div>
            <label className="block mb-1 text-[11px] font-medium text-slate-600">
              Description
            </label>
            <textarea
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 min-h-[120px]"
              value={values.description}
              onChange={(e) =>
                handleChange("description", e.target.value)
              }
              placeholder="Détaille la mission, les horaires, le tarif, les conditions..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-[11px] font-medium text-slate-600">
                Statut
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-white"
                value={values.status}
                onChange={(e) =>
                  handleChange("status", e.target.value as JobStatus)
                }
              >
                <option value="draft">Brouillon</option>
                <option value="pending">À valider</option>
                <option value="published">Publiée</option>
                <option value="archived">Archivée</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-[11px] font-medium text-slate-600">
                Source
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-white"
                value={values.source}
                onChange={(e) =>
                  handleChange("source", e.target.value as JobSource)
                }
              >
                <option value="admin">Admin</option>
                <option value="client">Client direct</option>
                <option value="scraped">Scraping</option>
              </select>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              className="h-3 w-3 rounded border-slate-300"
              checked={values.isUrgent}
              onChange={(e) =>
                handleChange("isUrgent", e.target.checked)
              }
            />
            <span className="text-[11px] text-slate-600">
              Marquer comme "urgent"
            </span>
          </label>

          <div className="mt-auto flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              className="px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-60"
              disabled={loading}
            >
              {loading
                ? "Enregistrement..."
                : mode === "create"
                ? "Créer l'annonce"
                : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

