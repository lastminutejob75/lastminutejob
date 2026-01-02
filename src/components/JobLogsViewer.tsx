import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface JobLog {
  id: string;
  created_at: string;
  prompt_text: string;
  primary_job_key: string | null;
  primary_confidence: number | null;
  secondary_jobs: any;
  readiness_score: number | null;
  readiness_status: string | null;
  readiness_missing: string[] | null;
  location: string | null;
  duration: string | null;
  urgency: string | null;
  used_llm: boolean;
  user_agent: string | null;
  path: string | null;
}

interface Statistics {
  total: number;
  withNoPrimary: number;
  incomplete: number;
  almostReady: number;
  ready: number;
  usedLLM: number;
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 border rounded-lg bg-white">
      <div className="text-gray-500 text-xs uppercase mb-1">{label}</div>
      <div className="text-xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

export function JobLogsViewer() {
  const [logs, setLogs] = useState<JobLog[]>([]);
  const [stats, setStats] = useState<Statistics>({
    total: 0,
    withNoPrimary: 0,
    incomplete: 0,
    almostReady: 0,
    ready: 0,
    usedLLM: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    setLoading(true);
    setError(null);

    try {
      // Note: Cette requête nécessite le service role key
      // En production, cela devrait passer par une Edge Function admin
      const { data, error: fetchError } = await supabase
        .from("job_detection_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (fetchError) {
        // Si erreur d'accès, c'est normal (RLS bloque)
        setError("Accès refusé. Cette fonctionnalité nécessite les droits administrateur.");
        setLoading(false);
        return;
      }

      if (data) {
        setLogs(data as JobLog[]);
        
        // Calculer les statistiques
        const total = data.length;
        const withNoPrimary = data.filter((l: any) => !l.primary_job_key).length;
        const incomplete = data.filter((l: any) => l.readiness_status === "incomplete").length;
        const almostReady = data.filter((l: any) => l.readiness_status === "almost_ready").length;
        const ready = data.filter((l: any) => l.readiness_status === "ready").length;
        const usedLLM = data.filter((l: any) => l.used_llm).length;

        setStats({
          total,
          withNoPrimary,
          incomplete,
          almostReady,
          ready,
          usedLLM
        });
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des logs");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-sm text-gray-600">⏳ Chargement des logs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
          ⚠️ {error}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Pour accéder aux logs, vous devez utiliser une Edge Function admin avec le service role key.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Job Detection Logs</h1>
        <button
          onClick={loadLogs}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          🔄 Actualiser
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total logs" value={stats.total} />
        <StatCard label="Sans métier détecté" value={stats.withNoPrimary} />
        <StatCard label="Incomplete" value={stats.incomplete} />
        <StatCard label="Almost ready" value={stats.almostReady} />
        <StatCard label="Ready" value={stats.ready} />
        <StatCard label="Avec LLM" value={stats.usedLLM} />
      </div>

      {/* Tableau des logs */}
      <div className="mt-6 border rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left text-xs font-semibold text-gray-700">Date</th>
                <th className="p-2 text-left text-xs font-semibold text-gray-700">Prompt</th>
                <th className="p-2 text-left text-xs font-semibold text-gray-700">Métier</th>
                <th className="p-2 text-left text-xs font-semibold text-gray-700">Confiance</th>
                <th className="p-2 text-left text-xs font-semibold text-gray-700">Readiness</th>
                <th className="p-2 text-left text-xs font-semibold text-gray-700">LLM</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">
                    Aucun log disponible
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-t hover:bg-gray-50">
                    <td className="p-2 text-xs text-gray-600">
                      {new Date(log.created_at).toLocaleString("fr-FR", {
                        dateStyle: "short",
                        timeStyle: "short"
                      })}
                    </td>
                    <td className="p-2 max-w-xs">
                      <div className="truncate text-xs text-slate-700" title={log.prompt_text}>
                        {log.prompt_text}
                      </div>
                    </td>
                    <td className="p-2">
                      <span className="text-xs font-medium text-slate-900">
                        {log.primary_job_key || "❓"}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className="text-xs text-gray-600">
                        {log.primary_confidence
                          ? log.primary_confidence.toFixed(2)
                          : "-"}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        log.readiness_status === "ready"
                          ? "bg-green-100 text-green-700"
                          : log.readiness_status === "almost_ready"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {log.readiness_status} ({log.readiness_score || 0})
                      </span>
                    </td>
                    <td className="p-2">
                      {log.used_llm ? (
                        <span className="text-xs text-blue-600">✓</span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

