import React, { useState } from "react";
import {
  generateJobTemplate,
  mapRoleToDirection,
  type DetectedJob,
  type JobContext,
  type MissionReadiness
} from "../lib/jobEngine";
import { SUPABASE_URL } from "../lib/env";
import { type ShareChannel } from "../lib/jobSharing";
import { UWiLogo } from "./UWiLogo";

type Step = "prompt" | "confirm_role" | "confirm_job" | "missing_info" | "preview";

export function PostJobWizard() {
  const [step, setStep] = useState<Step>("prompt");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const [detectedJobs, setDetectedJobs] = useState<DetectedJob[]>([]);
  const [context, setContext] = useState<JobContext>({});
  const [readiness, setReadiness] = useState<MissionReadiness | null>(null);
  const [uncertain, setUncertain] = useState(false);
  const [usedLLM, setUsedLLM] = useState(false);
  const [userRole, setUserRole] = useState<"recruiter" | "candidate" | "unknown">("unknown");
  const [roleUncertain, setRoleUncertain] = useState(false);
  const [roleHint, setRoleHint] = useState<string | null>(null);

  // champs éditables manuellement à l'étape "missing_info"
  const [manualLocation, setManualLocation] = useState<string>("");
  const [manualDuration, setManualDuration] = useState<JobContext["duration"]>();
  const [manualUrgency, setManualUrgency] = useState<JobContext["urgency"]>();

  // Canaux de diffusion
  const [channels, setChannels] = useState<ShareChannel[]>([
    "uwi", // ton propre site
    "linkedin",
    "facebook"
  ]);

  function toggleChannel(ch: ShareChannel) {
    setChannels(prev =>
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  }

  async function handlePromptSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const apiUrl = `${SUPABASE_URL}/functions/v1/analyze-job`;
      
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      if (!res.ok) {
        throw new Error("Erreur lors de l'analyse");
      }

      const data = await res.json();

      // Support à la fois l'ancien format et le nouveau format ParsedNeed
      const jobCandidates = data.jobCandidates || data.detectedJobs || [];
      const direction = data.direction || (data.role ? mapRoleToDirection(data.role) : "unknown");
      
      setDetectedJobs(jobCandidates);
      setContext(data.context || {});
      setReadiness(data.readiness || null);
      setUncertain(data.uncertain || false);
      setUsedLLM(data.usedLLM || false);
      setUserRole(data.role || (direction === "demande_de_ressource" ? "recruiter" : direction === "offre_de_competence" ? "candidate" : "unknown"));
      setRoleUncertain(data.roleUncertain || false);

      // Gérer le cas où l'utilisateur est un candidat
      const isCandidate = direction === "offre_de_competence" || data.role === "candidate";
      if (isCandidate && !data.roleUncertain) {
        setRoleHint("Tu sembles chercher un poste. On va te proposer de créer ton profil.");
        // TODO: basculer vers un autre wizard ou afficher un message
        // Pour l'instant, on continue avec le wizard normal mais avec un hint
      } else {
        setRoleHint(null);
      }

      // initialiser les champs manuels avec le contexte détecté
      setManualLocation(data.context?.location || "");
      setManualDuration(data.context?.duration);
      setManualUrgency(data.context?.urgency);

      // Choix de l'étape suivante
      if (data.roleUncertain || direction === "unknown") {
        setStep("confirm_role");
      } else if (data.uncertain || !jobCandidates.length) {
        setStep("confirm_job");
      } else if (data.readiness?.status !== "ready") {
        setStep("missing_info");
      } else {
        setStep("preview");
      }
    } catch (error) {
      console.error("Error analyzing prompt:", error);
      alert("Erreur lors de l'analyse. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  function handleJobConfirm(jobKey: string) {
    // On force le métier principal choisi par l'utilisateur
    const job = detectedJobs.find(j => j.jobKey === jobKey);
    if (!job) return;

    const reordered = [
      job,
      ...detectedJobs.filter(j => j.jobKey !== jobKey)
    ];
    setDetectedJobs(reordered);

    if (readiness) {
      // on recalcule un readiness simple
      setReadiness({ ...readiness, status: readiness.status });
    }

    // Si d'autres infos manquent → missing_info, sinon preview
    if (readiness && readiness.status !== "ready") {
      setStep("missing_info");
    } else {
      setStep("preview");
    }
  }

  function handleMissingInfoSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newCtx: JobContext = {
      ...context,
      location: manualLocation || null,
      duration: manualDuration,
      urgency: manualUrgency
    };

    setContext(newCtx);
    setStep("preview");
  }

  const primaryJob = detectedJobs[0] || null;
  const template =
    primaryJob && readiness
      ? generateJobTemplate(primaryJob.jobKey, context)
      : null;

  return (
    <div className="w-full max-w-xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Publier une mission
      </h1>

      {step === "prompt" && (
        <form onSubmit={handlePromptSubmit} className="space-y-4">
          {roleHint && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              {roleHint}
            </div>
          )}
          <label className="block space-y-2">
            <span className="text-sm text-gray-700">
              Décrivez votre besoin
            </span>
            <textarea
              className="w-full border rounded-lg p-3 text-sm min-h-[120px]"
              placeholder='Ex : "Je cherche un chef cuisinier extra pour une soirée mariage à Lille"'
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-black text-white text-sm disabled:opacity-50"
          >
            {loading ? "Analyse en cours..." : "Continuer"}
          </button>
        </form>
      )}

      {step === "confirm_role" && (
        <ConfirmRoleStep
          onSelect={(role) => {
            if (role === "recruiter") {
              // on continue vers le wizard recruteur
              setUserRole("recruiter");
              if (uncertain || !detectedJobs.length) {
                setStep("confirm_job");
              } else if (readiness && readiness.status !== "ready") {
                setStep("missing_info");
              } else {
                setStep("preview");
              }
            } else {
              // on bascule vers le wizard candidat
              window.location.hash = "#/candidate";
            }
          }}
        />
      )}

      {step === "confirm_job" && (
        <ConfirmJobStep
          prompt={prompt}
          detectedJobs={detectedJobs}
          uncertain={uncertain}
          onBack={() => setStep("prompt")}
          onConfirm={handleJobConfirm}
        />
      )}

      {step === "missing_info" && (
        <MissingInfoStep
          prompt={prompt}
          primaryJob={primaryJob}
          manualLocation={manualLocation}
          setManualLocation={setManualLocation}
          manualDuration={manualDuration}
          setManualDuration={setManualDuration}
          manualUrgency={manualUrgency}
          setManualUrgency={setManualUrgency}
          onBack={() => setStep("confirm_job")}
          onSubmit={handleMissingInfoSubmit}
        />
      )}

      {step === "preview" && template && (
        <PreviewStep
          prompt={prompt}
          primaryJob={primaryJob}
          context={context}
          readiness={readiness}
          template={template}
          channels={channels}
          toggleChannel={toggleChannel}
          onBack={() => setStep("missing_info")}
        />
      )}
    </div>
  );
}

/* ----------------- Sous-composants ----------------- */

function ConfirmRoleStep({
  onSelect
}: {
  onSelect: (role: "recruiter" | "candidate") => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-700">
        Pour continuer, dis-nous simplement ce que tu veux faire 👇
      </p>

      <button
        onClick={() => onSelect("recruiter")}
        className="w-full px-4 py-3 border rounded-lg text-left hover:bg-gray-50"
      >
        🔍 Je cherche à recruter / poster une mission
      </button>

      <button
        onClick={() => onSelect("candidate")}
        className="w-full px-4 py-3 border rounded-lg text-left hover:bg-gray-50"
      >
        🙋 Je cherche du travail / des missions
      </button>
    </div>
  );
}

function ConfirmJobStep({
  prompt,
  detectedJobs,
  uncertain,
  onBack,
  onConfirm
}: {
  prompt: string;
  detectedJobs: DetectedJob[];
  uncertain: boolean;
  onBack: () => void;
  onConfirm: (jobKey: string) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        {uncertain
          ? "Je ne suis pas certain du métier. Lequel correspond le mieux à votre besoin ?"
          : "Confirmez le métier principal pour cette mission."}
      </p>

      <div className="p-3 rounded-lg bg-gray-50 text-xs text-gray-500">
        {prompt}
      </div>

      <div className="space-y-2">
        {detectedJobs.slice(0, 3).map(job => (
          <button
            key={job.jobKey}
            type="button"
            onClick={() => onConfirm(job.jobKey)}
            className="w-full text-left px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm flex items-center justify-between"
          >
            <span>{job.jobKey}</span>
            <span className="text-xs text-gray-500">
              {(job.confidence * 100).toFixed(0)}%
            </span>
          </button>
        ))}

        {detectedJobs.length === 0 && (
          <p className="text-sm text-red-500">
            Aucun métier détecté. Reformulez votre besoin avec le type de
            poste recherché (serveur, cuisinier, développeur...).
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onBack}
        className="text-xs text-gray-500 underline"
      >
        Modifier la description
      </button>
    </div>
  );
}

function MissingInfoStep({
  prompt,
  primaryJob,
  manualLocation,
  setManualLocation,
  manualDuration,
  setManualDuration,
  manualUrgency,
  setManualUrgency,
  onBack,
  onSubmit
}: {
  prompt: string;
  primaryJob: DetectedJob | null;
  manualLocation: string;
  setManualLocation: (v: string) => void;
  manualDuration?: JobContext["duration"];
  setManualDuration: (v: JobContext["duration"]) => void;
  manualUrgency?: JobContext["urgency"];
  setManualUrgency: (v: JobContext["urgency"]) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm text-gray-600">
        On complète les informations essentielles pour la mission.
      </p>

      <div className="p-3 rounded-lg bg-gray-50 text-xs text-gray-500 space-y-1">
        <div>{prompt}</div>
        {primaryJob && (
          <div className="text-[11px] text-gray-600">
            Métier détecté : <strong>{primaryJob.jobKey}</strong>
          </div>
        )}
      </div>

      <label className="block space-y-1">
        <span className="text-xs text-gray-700">Lieu de la mission</span>
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Ex : Lille, Paris..."
          value={manualLocation}
          onChange={e => setManualLocation(e.target.value)}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs text-gray-700">Durée</span>
        <select
          className="w-full border rounded-lg px-3 py-2 text-sm"
          value={manualDuration || ""}
          onChange={e =>
            setManualDuration(
              e.target.value as JobContext["duration"]
            )
          }
        >
          <option value="">Choisir...</option>
          <option value="one_day">Une soirée / une journée</option>
          <option value="short">Quelques jours / 1 semaine</option>
          <option value="long">Plusieurs semaines / mois</option>
        </select>
      </label>

      <label className="block space-y-1">
        <span className="text-xs text-gray-700">Urgence</span>
        <select
          className="w-full border rounded-lg px-3 py-2 text-sm"
          value={manualUrgency || ""}
          onChange={e =>
            setManualUrgency(
              e.target.value as JobContext["urgency"]
            )
          }
        >
          <option value="">Choisir...</option>
          <option value="low">Flexible</option>
          <option value="medium">Dans les jours qui viennent</option>
          <option value="high">Urgent / ASAP</option>
        </select>
      </label>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-gray-500 underline"
        >
          Retour
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-black text-white text-sm"
        >
          Voir l'annonce
        </button>
      </div>
    </form>
  );
}

function PreviewStep({
  prompt,
  primaryJob,
  context,
  readiness,
  template,
  channels,
  toggleChannel,
  onBack
}: {
  prompt: string;
  primaryJob: DetectedJob | null;
  context: JobContext;
  readiness: MissionReadiness | null;
  template: ReturnType<typeof generateJobTemplate>;
  channels: ShareChannel[];
  toggleChannel: (ch: ShareChannel) => void;
  onBack: () => void;
}) {
  const [publishing, setPublishing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [sharePayloads, setSharePayloads] = React.useState<any[] | null>(null);

  async function handlePublish() {
    if (!primaryJob) return;
    setPublishing(true);
    setError(null);
    setSuccess(false);

    try {
      const apiUrl = `${SUPABASE_URL}/functions/v1/create-job`;
      
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          jobKey: primaryJob.jobKey,
          context,
          readiness,
          title: template.title,
          description: template.description,
          requirements: template.requirements,
          channels
        })
      });

      if (!res.ok) {
        throw new Error("Erreur API");
      }

      const data = await res.json();
      setSharePayloads(data.sharePayloads || []);
      setSuccess(true);
    } catch (e) {
      setError("Impossible de publier la mission pour le moment.");
    } finally {
      setPublishing(false);
    }
  }

  const allChannels: { id: ShareChannel; label: string | React.ReactNode }[] = [
    { id: "uwi", label: <><UWiLogo size="sm" /> / LMJ</> },
    { id: "linkedin", label: "LinkedIn" },
    { id: "facebook", label: "Facebook" },
    { id: "email", label: "Email" },
    { id: "leboncoin", label: "Leboncoin (copier-coller)" }
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Voici la mission telle qu'elle sera présentée aux candidats.
      </p>

      <div className="border rounded-lg p-4 space-y-2 bg-white">
        <h2 className="text-lg font-semibold">{template.title}</h2>
        <p className="text-sm text-gray-700">{template.description}</p>

        {template.requirements.length > 0 && (
          <ul className="list-disc list-inside text-sm text-gray-700 mt-2">
            {template.requirements.map((req, i) => (
              <li key={i}>{req}</li>
            ))}
          </ul>
        )}

        <div className="mt-3 text-xs text-gray-500 space-y-1">
          {primaryJob && (
            <div>
              Métier : <strong>{primaryJob.jobKey}</strong>{" "}
              ({(primaryJob.confidence * 100).toFixed(0)}%)
            </div>
          )}
          {context.location && (
            <div>Lieu : <strong>{context.location}</strong></div>
          )}
          {context.duration && (
            <div>Durée : <strong>{context.duration}</strong></div>
          )}
          {context.urgency && (
            <div>Urgence : <strong>{context.urgency}</strong></div>
          )}
          {readiness && (
            <div>
              Mission readiness :{" "}
              <strong>
                {readiness.score}/100 ({readiness.status})
              </strong>
            </div>
          )}
        </div>
      </div>

      {/* Bloc "Diffuser aussi sur :" */}
      <div className="border rounded-lg p-3 bg-gray-50 space-y-2">
        <p className="text-xs text-gray-600 mb-1">
          Diffuser aussi sur :
        </p>
        <div className="flex flex-wrap gap-2">
          {allChannels.map(ch => (
            <button
              key={ch.id}
              type="button"
              onClick={() => toggleChannel(ch.id)}
              className={`px-2 py-1 rounded-full text-xs border ${
                channels.includes(ch.id)
                  ? "bg-black text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-gray-500 underline"
        >
          Modifier les infos
        </button>
        <button
          type="button"
          onClick={handlePublish}
          disabled={publishing}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm disabled:opacity-50"
        >
          {publishing ? "Publication..." : "Publier la mission 🚀"}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-2">{error}</p>
      )}
      {success && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-emerald-600">
            Mission publiée. Voici vos textes prêts à partager :
          </p>
          {sharePayloads && (
            <div className="space-y-2">
              {sharePayloads.map((p: any) => (
                <div
                  key={p.channel}
                  className="border rounded-lg p-2 bg-white"
                >
                  <div className="text-[11px] font-semibold uppercase text-gray-500 mb-1">
                    {p.channel}
                  </div>
                  <div className="text-xs font-medium">
                    {p.title}
                  </div>
                  <pre className="mt-1 text-[11px] whitespace-pre-wrap">
                    {p.body}
                  </pre>
                  {p.hashtags && p.hashtags.length > 0 && (
                    <div className="mt-1 text-[11px] text-gray-500">
                      {p.hashtags.join(" ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="pt-2">
        <p className="text-[11px] text-gray-500">
          Texte original : {prompt}
        </p>
      </div>
    </div>
  );
}

