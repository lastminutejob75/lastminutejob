import React, { useState, useMemo } from "react";
import { useJobs, type Job, type JobStatus } from "../hooks/useJobs";
import { useApplicationsForJob, type Application } from "../hooks/useApplicationsForJob";
import { useClients } from "../hooks/useClients";
import { useCandidates } from "../hooks/useCandidates";
import { JobFormDrawer } from "./JobFormDrawer";
import { JobApplicationsDrawer } from "./JobApplicationsDrawer";

type TabKey = "jobs" | "clients" | "candidates" | "imports" | "stats";

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  jobsCount: number;
  lastActive: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  applicationsCount: number;
  lastApplication: string;
}

// MOCK_JOBS removed - now using useJobs hook with real data from Supabase

const MOCK_CLIENTS: Client[] = [
  {
    id: "c_1",
    name: "Restaurant Le Midi Doux",
    email: "contact@lemididoux.fr",
    phone: "+33 6 11 22 33 44",
    jobsCount: 5,
    lastActive: "2025-12-01",
  },
  {
    id: "c_2",
    name: "Événementiel Nord",
    email: "rh@evenord.com",
    jobsCount: 2,
    lastActive: "2025-11-29",
  },
];

const MOCK_CANDIDATES: Candidate[] = [
  {
    id: "u_1",
    name: "Sarah B.",
    email: "sarah.b@example.com",
    phone: "+33 7 12 34 56 78",
    applicationsCount: 8,
    lastApplication: "2025-12-01",
  },
  {
    id: "u_2",
    name: "Yanis K.",
    email: "yanis.k@example.com",
    applicationsCount: 3,
    lastApplication: "2025-11-30",
  },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("jobs");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [jobToEdit, setJobToEdit] = useState<Job | null>(null);
  const [appsDrawerOpen, setAppsDrawerOpen] = useState(false);
  
  // Filtres pour les jobs
  const [statusFilter, setStatusFilter] = useState<Job["status"] | undefined>();
  const [search, setSearch] = useState("");
  // Force le rafraîchissement après certaines actions
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { jobs, loading: jobsLoading, error: jobsError, setJobs } = useJobs({
    status: statusFilter,
    search,
  }, refreshKey);

  const selectedJob = useMemo(
    () => jobs.find((j) => j.id === selectedJobId) || null,
    [jobs, selectedJobId]
  );

  const { applications, loading: appsLoading, error: appsError } =
    useApplicationsForJob(selectedJobId);

  const handleDeleteJob = async (id: string) => {
    if (!window.confirm("Supprimer cette annonce ?")) return;
    
    try {
      const { supabase } = await import("../lib/supabaseClient");
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", id);
      
      if (error) {
        console.error("Erreur suppression:", error);
        alert(`Erreur lors de la suppression: ${error.message}`);
        return;
      }
      
      // Mettre à jour l'état local
      setJobs((prev) => prev.filter((job) => job.id !== id));
      if (selectedJobId === id) setSelectedJobId(null);
    } catch (err: any) {
      console.error("Erreur suppression:", err);
      alert(`Erreur lors de la suppression: ${err.message}`);
    }
  };

  const handleChangeStatus = async (id: string, status: Job["status"]) => {
    try {
      const { supabase } = await import("../lib/supabaseClient");
      
      // Mapper les nouveaux statuts vers les anciens pour Supabase
      const statusMapToOld: Record<JobStatus, string> = {
        'published': 'approved',
        'archived': 'rejected',
        'pending': 'pending',
        'draft': 'pending',
      };
      
      const oldStatus = statusMapToOld[status] || status;
      
      const { error } = await supabase
        .from("jobs")
        .update({ status: oldStatus })
        .eq("id", id);
      
      if (error) {
        console.error("Erreur changement statut:", error);
        alert(`Erreur lors du changement de statut: ${error.message}`);
        return;
      }
      
      // Mettre à jour l'état local
      setJobs((prev) =>
        prev.map((job) => (job.id === id ? { ...job, status } : job))
      );
    } catch (err: any) {
      console.error("Erreur changement statut:", err);
      alert(`Erreur lors du changement de statut: ${err.message}`);
    }
  };

  const handleCreateJobForClient = () => {
    setDrawerMode("create");
    setJobToEdit(null);
    setDrawerOpen(true);
  };

  const handleFakeEdit = (id: string) => {
    const job = jobs.find((j) => j.id === id) || null;
    if (!job) return;
    setDrawerMode("edit");
    setJobToEdit(job);
    setDrawerOpen(true);
  };

  const handleJobSaved = (savedJob: Job) => {
    setJobs((prev) => {
      const exists = prev.find((j) => j.id === savedJob.id);
      if (exists) {
        return prev.map((j) => (j.id === savedJob.id ? savedJob : j));
      }
      // nouveau job → le mettre en haut
      return [savedJob, ...prev];
    });
  };

  const handleImportJob = async (jobData: any) => {
    // Forcer le rafraîchissement depuis Supabase
    setRefreshKey((prev) => prev + 1);
    // Mettre à jour la liste immédiatement aussi
    setJobs((prev) => [jobData, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-60 bg-white border-r border-slate-200">
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="text-lg font-semibold text-slate-900">
            UWi / LMJ Admin
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Contrôle des annonces & utilisateurs
          </div>
        </div>

        <nav className="flex-1 py-4">
          <SidebarItem
            label="Annonces"
            active={activeTab === "jobs"}
            onClick={() => setActiveTab("jobs")}
          />
          <SidebarItem
            label="Recruteurs"
            active={activeTab === "clients"}
            onClick={() => setActiveTab("clients")}
          />
          <SidebarItem
            label="Candidats"
            active={activeTab === "candidates"}
            onClick={() => setActiveTab("candidates")}
          />
          <SidebarItem
            label="Imports / Scraping"
            active={activeTab === "imports"}
            onClick={() => setActiveTab("imports")}
          />
          <SidebarItem
            label="Stats"
            active={activeTab === "stats"}
            onClick={() => setActiveTab("stats")}
          />
        </nav>

        <div className="px-4 py-4 border-t border-slate-100 text-xs text-slate-400">
          Version interne – non visible des utilisateurs
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 flex flex-col">
        {/* Header mobile / top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
          <div className="text-base font-semibold">Admin UWi / LMJ</div>
          <select
            className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-slate-50"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as TabKey)}
          >
            <option value="jobs">Annonces</option>
            <option value="clients">Recruteurs</option>
            <option value="candidates">Candidats</option>
            <option value="imports">Imports</option>
            <option value="stats">Stats</option>
          </select>
        </header>

        <section className="flex-1 p-4 md:p-6">
          {activeTab === "jobs" && (
            <JobsView
              jobs={jobs}
              jobsLoading={jobsLoading}
              jobsError={jobsError}
              selectedJob={selectedJob}
              onSelectJob={setSelectedJobId}
              onDeleteJob={handleDeleteJob}
              onChangeStatus={handleChangeStatus}
              onEditJob={handleFakeEdit}
              onCreateJobForClient={handleCreateJobForClient}
              onOpenApplications={() => setAppsDrawerOpen(true)}
              onSearchChange={setSearch}
              onStatusFilterChange={setStatusFilter}
            />
          )}

          {activeTab === "clients" && <ClientsView />}
          {activeTab === "candidates" && <CandidatesView />}
          {activeTab === "imports" && (
            <ImportsView onImportJob={handleImportJob} />
          )}
          {activeTab === "stats" && <StatsView />}
        </section>
      </main>

      <JobFormDrawer
        open={drawerOpen}
        mode={drawerMode}
        initialJob={jobToEdit}
        onClose={() => setDrawerOpen(false)}
        onSaved={handleJobSaved}
      />

      <JobApplicationsDrawer
        open={appsDrawerOpen && !!selectedJobId}
        jobId={selectedJobId}
        jobTitle={selectedJob?.title}
        onClose={() => setAppsDrawerOpen(false)}
      />
    </div>
  );
}

/* ---------- Sidebar item ---------- */

function SidebarItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      <span>{label}</span>
      {active && <span className="text-[10px] uppercase">Actif</span>}
    </button>
  );
}

/* ---------- Vue Annonces ---------- */

function JobsView({
  jobs,
  jobsLoading,
  jobsError,
  selectedJob,
  onSelectJob,
  onDeleteJob,
  onChangeStatus,
  onEditJob,
  onCreateJobForClient,
  onOpenApplications,
  onSearchChange,
  onStatusFilterChange,
}: {
  jobs: Job[];
  jobsLoading: boolean;
  jobsError: string | null;
  selectedJob: Job | null;
  onSelectJob: (id: string | null) => void;
  onDeleteJob: (id: string) => void;
  onChangeStatus: (id: string, status: Job["status"]) => void;
  onEditJob: (id: string) => void;
  onCreateJobForClient: () => void;
  onOpenApplications: () => void;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: Job["status"] | undefined) => void;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row">
      {/* Liste d'annonces */}
      <div className="md:w-2/3 bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div>
            <h2 className="text-base md:text-lg font-semibold">
              Annonces (LMJ / UWi)
            </h2>
            <p className="text-xs text-slate-400">
              Modifie, valide, supprime ou crée pour un tiers.
            </p>
          </div>
          <button
            onClick={onCreateJobForClient}
            className="hidden md:inline-flex items-center px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs hover:bg-slate-800"
          >
            + Créer pour un client
          </button>
        </div>

        <div className="px-4 py-2 flex items-center gap-2 border-b border-slate-100">
          <input
            className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
            placeholder="Filtrer par titre, ville..."
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <select
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50"
            onChange={(e) => onStatusFilterChange(e.target.value === "" ? undefined : (e.target.value as Job["status"]))}
          >
            <option value="">Tous statuts</option>
            <option value="pending">À valider</option>
            <option value="published">Publiées</option>
            <option value="draft">Brouillons</option>
            <option value="archived">Archivées</option>
          </select>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="text-left px-4 py-2 font-medium">Titre</th>
                <th className="text-left px-2 py-2 font-medium">Ville</th>
                <th className="text-left px-2 py-2 font-medium">Statut</th>
                <th className="text-left px-2 py-2 font-medium">Source</th>
                <th className="text-left px-2 py-2 font-medium">Candidats</th>
                <th className="text-right px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobsLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-xs text-slate-400">
                    Chargement des annonces...
                  </td>
                </tr>
              )}
              {jobsError && !jobsLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-xs text-red-500">
                    Erreur : {jobsError}
                  </td>
                </tr>
              )}
              {!jobsLoading && !jobsError && jobs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400 text-xs">
                    Aucune annonce trouvée.
                  </td>
                </tr>
              )}
              {!jobsLoading && !jobsError && jobs.map((job) => {
                const isSelected = selectedJob?.id === job.id;
                return (
                  <tr
                    key={job.id}
                    className={`border-t border-slate-100 ${
                      isSelected ? "bg-slate-50" : ""
                    }`}
                  >
                    <td className="px-4 py-2">
                      <button
                        className="text-left text-slate-900 hover:underline"
                        onClick={() =>
                          onSelectJob(isSelected ? null : job.id)
                        }
                      >
                        {job.title}
                      </button>
                      <div className="text-[10px] text-slate-400">
                        Créée le {new Date(job.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-2 py-2">{job.city}</td>
                    <td className="px-2 py-2">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-2 py-2">
                      <SourceBadge source={job.source} />
                    </td>
                    <td className="px-2 py-2">{job.replies_count || 0}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          className="px-2 py-1 rounded-full border border-slate-200 text-[11px] hover:bg-slate-50"
                          onClick={() => onEditJob(job.id)}
                        >
                          Modifier
                        </button>
                        <button
                          className="px-2 py-1 rounded-full border border-red-200 text-[11px] text-red-600 hover:bg-red-50"
                          onClick={() => onDeleteJob(job.id)}
                        >
                          Suppr.
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Détail d'une annonce (aperçu rapide) */}
      <div className="md:w-1/3 mt-4 md:mt-0">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm h-full">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Détail de l'annonce</h3>
            {selectedJob && (
              <button
                className="text-[11px] text-slate-500 hover:text-slate-800"
                onClick={() =>
                  selectedJob &&
                  onChangeStatus(
                    selectedJob.id,
                    selectedJob.status === "published"
                      ? "archived"
                      : "published"
                  )
                }
              >
                {selectedJob.status === "published"
                  ? "Archiver"
                  : "Publier"}
              </button>
            )}
          </div>
          <div className="p-4 text-xs text-slate-700">
            {!selectedJob && (
              <p className="text-slate-400">
                Sélectionne une annonce dans la liste pour voir les détails.
              </p>
            )}

            {selectedJob && (
              <div className="space-y-2">
                <div className="text-sm font-semibold">
                  {selectedJob.title}
                </div>
                <div className="text-[11px] text-slate-400">
                  {selectedJob.city || 'Non spécifiée'} • Créée le {new Date(selectedJob.created_at).toLocaleDateString('fr-FR')}
                </div>
                <div className="flex gap-2 mt-1">
                  <StatusBadge status={selectedJob.status} />
                  <SourceBadge source={selectedJob.source} />
                </div>

                <hr className="my-3 border-slate-100" />

                <p className="text-slate-500">
                  Ici tu pourras afficher le texte complet de l'annonce,
                  les conditions, le salaire, etc. (à brancher sur la BDD).
                </p>

                <div className="mt-3 space-y-1">
                  <div className="font-semibold text-[11px] uppercase text-slate-400">
                    Candidats
                  </div>
                  <p className="text-slate-600">
                    {selectedJob.replies_count || 0} réponse(s)
                  </p>
                  <button
                    className="mt-2 inline-flex items-center px-3 py-1.5 rounded-full border border-slate-200 text-[11px] hover:bg-slate-50"
                    onClick={onOpenApplications}
                    disabled={!selectedJob}
                  >
                    Voir les réponses détaillées
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bouton "Créer pour un client" visible en mobile aussi */}
        <button
          onClick={onCreateJobForClient}
          className="mt-3 w-full md:hidden inline-flex items-center justify-center px-3 py-2 rounded-full bg-slate-900 text-white text-xs hover:bg-slate-800"
        >
          + Créer une annonce pour un client
        </button>
      </div>
    </div>
  );
}

/* ---------- Badges ---------- */

function StatusBadge({ status }: { status: Job["status"] }) {
  const map: Record<Job["status"], { label: string; className: string }> = {
    draft: {
      label: "Brouillon",
      className: "bg-slate-100 text-slate-700",
    },
    pending: {
      label: "À valider",
      className: "bg-amber-100 text-amber-700",
    },
    published: {
      label: "Publiée",
      className: "bg-emerald-100 text-emerald-700",
    },
    archived: {
      label: "Archivée",
      className: "bg-slate-200 text-slate-700",
    },
  };

  const { label, className } = map[status];
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] ${className}`}>
      {label}
    </span>
  );
}

function SourceBadge({ source }: { source: Job["source"] }) {
  const map: Record<Job["source"], { label: string; className: string }> = {
    client: {
      label: "Client direct",
      className: "bg-sky-100 text-sky-700",
    },
    admin: {
      label: "Admin",
      className: "bg-violet-100 text-violet-700",
    },
    scraped: {
      label: "Scraping",
      className: "bg-slate-100 text-slate-700",
    },
  };
  const { label, className } = map[source];
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] ${className}`}>
      {label}
    </span>
  );
}

/* ---------- Vues placeholder pour les autres onglets ---------- */

function ClientsView() {
  const [search, setSearch] = useState("");
  const { clients, loading, error } = useClients({ search });

  const handleExportCsv = () => {
    if (!clients.length) {
      alert("Aucun recruteur à exporter.");
      return;
    }

    const header = ["Nom", "Email", "Téléphone", "Nb annonces", "Créé le", "Dernière activité"];
    const rows = clients.map((c) => [
      (c.name || "").replace(/"/g, '""'),
      (c.email || "").replace(/"/g, '""'),
      (c.phone || "").replace(/"/g, '""'),
      String(c.jobs_count ?? 0),
      c.created_at ? new Date(c.created_at).toLocaleDateString() : "",
      c.last_active_at ? new Date(c.last_active_at).toLocaleDateString() : "",
    ]);

    const csvContent =
      [header, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const date = new Date().toISOString().slice(0, 10);
    link.download = `recruteurs_uwi_lmj_${date}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 text-xs">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base md:text-lg font-semibold">Recruteurs</h2>
          <p className="text-[11px] text-slate-500">
            Entreprises / clients qui postent des annonces. Emails exploitables pour relances, offres, etc.
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          className="hidden md:inline-flex items-center px-3 py-1.5 rounded-full bg-slate-900 text-white text-[11px] hover:bg-slate-800"
        >
          Export CSV
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <input
          className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
          placeholder="Rechercher par nom ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={handleExportCsv}
          className="md:hidden inline-flex items-center px-3 py-1.5 rounded-full bg-slate-900 text-white text-[11px] hover:bg-slate-800"
        >
          CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-500">
              <th className="text-left px-3 py-2 font-medium">Nom</th>
              <th className="text-left px-3 py-2 font-medium">Email</th>
              <th className="text-left px-3 py-2 font-medium">Téléphone</th>
              <th className="text-left px-3 py-2 font-medium">Nb annonces</th>
              <th className="text-left px-3 py-2 font-medium">Dernière activité</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-slate-400">
                  Chargement des recruteurs…
                </td>
              </tr>
            )}

            {error && !loading && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-red-500">
                  Erreur : {error}
                </td>
              </tr>
            )}

            {!loading && !error && clients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-slate-400">
                  Aucun recruteur trouvé.
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              clients.map((client) => (
                <tr key={client.id} className="border-t border-slate-100">
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-800">
                      {client.name || "Sans nom"}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Créé le{" "}
                      {new Date(client.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-slate-700">{client.email}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-slate-600">
                      {client.phone || "—"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {client.jobs_count ?? 0}
                  </td>
                  <td className="px-3 py-2">
                    {client.last_active_at
                      ? new Date(client.last_active_at).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CandidatesView() {
  const [search, setSearch] = useState("");
  const { candidates, loading, error } = useCandidates({ search });

  const handleExportCsv = () => {
    if (!candidates.length) {
      alert("Aucun candidat à exporter.");
      return;
    }

    const header = [
      "Prénom",
      "Nom",
      "Email",
      "Téléphone",
      "Nb candidatures",
      "Créé le",
      "Dernière candidature",
    ];

    const rows = candidates.map((c) => [
      (c.first_name || "").replace(/"/g, '""'),
      (c.last_name || "").replace(/"/g, '""'),
      (c.email || "").replace(/"/g, '""'),
      (c.phone || "").replace(/"/g, '""'),
      String(c.applications_count ?? 0),
      c.created_at ? new Date(c.created_at).toLocaleDateString() : "",
      c.last_application_at
        ? new Date(c.last_application_at).toLocaleDateString()
        : "",
    ]);

    const csvContent = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const date = new Date().toISOString().slice(0, 10);
    link.download = `candidats_uwi_lmj_${date}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 text-xs">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base md:text-lg font-semibold">Candidats</h2>
          <p className="text-[11px] text-slate-500">
            Personnes qui répondent aux annonces. Base emails exploitable pour relances, missions futures, etc.
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          className="hidden md:inline-flex items-center px-3 py-1.5 rounded-full bg-slate-900 text-white text-[11px] hover:bg-slate-800"
        >
          Export CSV
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <input
          className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
          placeholder="Rechercher par nom ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={handleExportCsv}
          className="md:hidden inline-flex items-center px-3 py-1.5 rounded-full bg-slate-900 text-white text-[11px] hover:bg-slate-800"
        >
          CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-500">
              <th className="text-left px-3 py-2 font-medium">Nom</th>
              <th className="text-left px-3 py-2 font-medium">Email</th>
              <th className="text-left px-3 py-2 font-medium">Téléphone</th>
              <th className="text-left px-3 py-2 font-medium">Nb candidatures</th>
              <th className="text-left px-3 py-2 font-medium">Dernière candidature</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-4 text-center text-slate-400"
                >
                  Chargement des candidats…
                </td>
              </tr>
            )}

            {error && !loading && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-4 text-center text-red-500"
                >
                  Erreur : {error}
                </td>
              </tr>
            )}

            {!loading && !error && candidates.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-4 text-center text-slate-400"
                >
                  Aucun candidat trouvé.
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              candidates.map((c) => (
                <tr key={c.id} className="border-t border-slate-100">
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-800">
                      {((c.first_name || "") + " " + (c.last_name || "")).trim() || "Sans nom"}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Inscrit le{" "}
                      {new Date(c.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-slate-700">{c.email}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-slate-600">
                      {c.phone || "—"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {c.applications_count ?? 0}
                  </td>
                  <td className="px-3 py-2">
                    {c.last_application_at
                      ? new Date(
                          c.last_application_at
                        ).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ImportsView({ onImportJob }: { onImportJob: (job: Job) => void }) {
  const [importUrl, setImportUrl] = useState("");
  const [importText, setImportText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const handleAnalyze = async () => {
    if (!importUrl.trim() && !importText.trim()) {
      setError("Veuillez entrer une URL ou un texte à analyser.");
      return;
    }

    setLoading(true);
    setError(null);
    setParsedData(null);

    try {
      // Utiliser l'API d'extraction existante
      const textToAnalyze = importText.trim() || importUrl.trim();
      
      // Appel à l'API d'extraction (si disponible) ou parsing local
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || 'https://gywhqtlebvvauxzmdavb.supabase.co'}/functions/v1/uwi-extract`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: textToAnalyze }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'extraction");
      }

      const extracted = await response.json();
      
      // Créer un objet parsé similaire à ce qui est attendu
      setParsedData({
        role: extracted.role || "",
        city: extracted.city || "",
        date: extracted.date || "",
        duration: extracted.duration || "",
        hourly: extracted.hourly || "",
      });
      
      setShowForm(true);
    } catch (err: any) {
      console.error("Erreur d'analyse:", err);
      setError(err.message || "Erreur lors de l'analyse. Essayez avec du texte brut.");
      
      // Fallback: parsing simple local
      const simpleParsed = {
        role: extractRoleFromText(importText || importUrl),
        city: extractCityFromText(importText || importUrl),
        date: "",
        duration: "",
        hourly: "",
      };
      setParsedData(simpleParsed);
      setShowForm(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async () => {
    if (!parsedData || !parsedData.role) {
      setError("Veuillez analyser d'abord le texte ou l'URL.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { supabase } = await import("../lib/supabaseClient");
      
      // Créer le job avec les données extraites
      const parsedJsonb = {
        role: parsedData.role || "",
        city: parsedData.city || "",
        date: parsedData.date || "",
        duration: parsedData.duration || "",
        hourly: parsedData.hourly || "",
      };

      const { data, error: insertError } = await supabase
        .from("jobs")
        .insert({
          title: `${parsedData.role}${parsedData.city ? ` - ${parsedData.city}` : ""}`,
          parsed: parsedJsonb,
          status: "pending",
          source: "scraped",
          external_source_url: importUrl.trim() || null,
          external_source_name: importUrl.includes("leboncoin") ? "Leboncoin" : 
                                importUrl.includes("indeed") ? "Indeed" : 
                                importUrl.includes("pole-emploi") ? "Pôle Emploi" : "Autre",
        })
        .select("id, title, parsed, created_at, status, source")
        .single();

      if (insertError) throw insertError;

      // Normaliser pour correspondre à l'interface Job
      const normalized: Job = {
        id: data.id,
        title: data.title,
        city: data.parsed?.city || null,
        created_at: data.created_at,
        status: data.status === "approved" ? "published" : (data.status === "rejected" ? "archived" : data.status as JobStatus),
        source: "scraped",
      };

      onImportJob(normalized);
      
      // Réinitialiser
      setImportUrl("");
      setImportText("");
      setParsedData(null);
      setShowForm(false);
    } catch (err: any) {
      console.error("Erreur création job:", err);
      setError(err.message || "Erreur lors de la création de l'annonce.");
    } finally {
      setLoading(false);
    }
  };

  // Fonctions d'extraction simples (fallback)
  function extractRoleFromText(text: string): string {
    const roleKeywords = ["serveur", "cuisinier", "livreur", "barman", "chef", "vendeur", "caissier", "agent", "employé"];
    const lower = text.toLowerCase();
    for (const keyword of roleKeywords) {
      if (lower.includes(keyword)) {
        return keyword.charAt(0).toUpperCase() + keyword.slice(1);
      }
    }
    return "";
  }

  function extractCityFromText(text: string): string {
    const cities = ["Lille", "Paris", "Lyon", "Marseille", "Toulouse", "Bordeaux", "Bruxelles", "Liège", "Namur"];
    const lower = text.toLowerCase();
    for (const city of cities) {
      if (lower.includes(city.toLowerCase())) {
        return city;
      }
    }
    return "";
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4 text-xs">
      <div>
        <h2 className="text-base md:text-lg font-semibold mb-1">
          Imports / Scraping
        </h2>
        <p className="text-[11px] text-slate-500">
          Collez un lien d'annonce externe (Leboncoin, Indeed, etc.) ou un texte brut, puis générez une annonce propre.
        </p>
      </div>

      {error && (
        <div className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {!showForm ? (
        <div className="space-y-3">
          <div>
            <label className="block mb-1 text-[11px] font-medium text-slate-600">
              URL de l'annonce (optionnel)
            </label>
            <input
              type="url"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
              placeholder="https://www.leboncoin.fr/..."
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-[11px] font-medium text-slate-600">
              Texte brut de l'annonce *
            </label>
            <textarea
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 min-h-[120px]"
              placeholder="Collez ici le texte complet de l'annonce..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || (!importUrl.trim() && !importText.trim())}
            className="w-full px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Analyse en cours..." : "Analyser et extraire les informations"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-slate-50 rounded-lg p-3 space-y-2">
            <h3 className="text-[11px] font-semibold text-slate-700">Données extraites :</h3>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500">Rôle :</span>{" "}
                <span className="font-medium">{parsedData?.role || "—"}</span>
              </div>
              <div>
                <span className="text-slate-500">Ville :</span>{" "}
                <span className="font-medium">{parsedData?.city || "—"}</span>
              </div>
              <div>
                <span className="text-slate-500">Date :</span>{" "}
                <span className="font-medium">{parsedData?.date || "—"}</span>
              </div>
              <div>
                <span className="text-slate-500">Durée :</span>{" "}
                <span className="font-medium">{parsedData?.duration || "—"}</span>
              </div>
              <div>
                <span className="text-slate-500">Tarif :</span>{" "}
                <span className="font-medium">{parsedData?.hourly || "—"}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowForm(false);
                setParsedData(null);
              }}
              className="flex-1 px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
            >
              Modifier
            </button>
            <button
              onClick={handleCreateJob}
              disabled={loading}
              className="flex-1 px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? "Création..." : "Créer l'annonce"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatsView() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-3">
      <h2 className="text-base md:text-lg font-semibold">
        Stats (MVP)
      </h2>
      <p className="text-xs text-slate-500">
        Nombre d'annonces actives, réponses moyennes par annonce, top villes,
        etc.
      </p>
      <ul className="text-xs text-slate-600 list-disc pl-4">
        <li>À implémenter : cartes simples (totaux, graphiques légers).</li>
        <li>Pas besoin au début d'un truc BPI, juste les chiffres utiles.</li>
      </ul>
    </div>
  );
}

