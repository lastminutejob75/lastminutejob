import React, { useState } from "react";
import type { DetectedJob, JobContext } from "../lib/jobEngine";
import { mapRoleToDirection } from "../lib/jobEngine";
import { SUPABASE_URL } from "../lib/env";

type Step = "prompt" | "confirm_job" | "complete_profile" | "preview";

interface CandidateProfile {
  jobKey: string;
  headline: string;
  location: string;
  availability: string;    // ex: "Soirs et week-end"
  experienceLevel: string; // "Débutant", "Intermédiaire", "Senior"
  contractType: string;    // "Extra", "CDD", "Freelance", etc.
  remotePreference: string;// "Sur place", "Remote", "Hybride"
  bio: string;
}

export function CandidateWizard() {
  const [step, setStep] = useState<Step>("prompt");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const [detectedJobs, setDetectedJobs] = useState<DetectedJob[]>([]);
  const [context, setContext] = useState<JobContext>({});
  const [role, setRole] = useState<"recruiter" | "candidate" | "unknown">(
    "unknown"
  );
  const [roleHint, setRoleHint] = useState<string | null>(null);

  const [profile, setProfile] = useState<CandidateProfile | null>(null);

  async function handlePromptSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setRoleHint(null);

    try {
      // ✅ Détection LOCALE pour éviter les appels API
      const lower = prompt.toLowerCase();

      // Détecter le métier
      let detectedJobKey = "";
      let detectedJobLabel = "";

      // Mots clés pour différents métiers
      const jobKeywords: Record<string, { key: string, label: string, keywords: string[] }> = {
        serveur: { key: "server", label: "Serveur/Serveuse", keywords: ["serveur", "serveuse", "service"] },
        cuisinier: { key: "cook", label: "Cuisinier/Cuisinière", keywords: ["cuisinier", "cuisinière", "cuisine", "chef"] },
        barman: { key: "bartender", label: "Barman/Barmaid", keywords: ["barman", "barmaid", "bartender"] },
        livreur: { key: "delivery", label: "Livreur/Livreuse", keywords: ["livreur", "livreuse", "livraison", "coursier"] },
        vendeur: { key: "seller", label: "Vendeur/Vendeuse", keywords: ["vendeur", "vendeuse", "vente"] },
        receptionniste: { key: "receptionist", label: "Réceptionniste", keywords: ["réceptionniste", "réception", "accueil"] },
        agent: { key: "agent", label: "Agent de service", keywords: ["agent", "entretien", "nettoyage"] },
        manutentionnaire: { key: "handler", label: "Manutentionnaire", keywords: ["manutentionnaire", "manutention", "magasinier"] },
      };

      // Chercher le métier
      for (const [name, job] of Object.entries(jobKeywords)) {
        for (const keyword of job.keywords) {
          if (lower.includes(keyword)) {
            detectedJobKey = job.key;
            detectedJobLabel = job.label;
            break;
          }
        }
        if (detectedJobKey) break;
      }

      // Détecter la localisation
      const cities = ["Paris", "Lyon", "Lille", "Marseille", "Toulouse", "Bordeaux", "Nantes", "Nice", "Strasbourg"];
      let location = "";
      for (const city of cities) {
        if (lower.includes(city.toLowerCase())) {
          location = city;
          break;
        }
      }

      // Vérifier si c'est bien un candidat
      const isCandidateKeywords = ["je suis", "je cherche", "dispo", "disponible", "recherche un poste", "recherche du travail"];
      const isCandidate = isCandidateKeywords.some(kw => lower.includes(kw));

      if (!isCandidate) {
        setRoleHint(
          "Ton message ressemble plutôt à une demande de recruteur. Si tu cherches un poste, reformule en parlant de toi (ex : \"Je suis serveur, je cherche un poste à Lille…\")."
        );
        setLoading(false);
        return;
      }

      if (!detectedJobKey) {
        setRoleHint(
          "Je n'ai pas réussi à détecter ton métier. Essaye de préciser ton profil (ex : 'Je suis cuisinier, 5 ans d'expérience, je cherche des extras...')."
        );
        setLoading(false);
        return;
      }

      // Créer le profil détecté
      const detectedJob: DetectedJob = {
        jobKey: detectedJobKey,
        score: 1,
        confidence: 0.8
      };

      setDetectedJobs([detectedJob]);
      setContext({ location: location || undefined });
      setRole("candidate");

      const defaultHeadline = `${detectedJobLabel} à la recherche de missions`;
      const defaultBio = `Je suis ${detectedJobLabel.toLowerCase()} et je souhaite trouver de nouvelles opportunités.`;

      setProfile({
        jobKey: detectedJobKey,
        headline: defaultHeadline,
        location: location,
        availability: "",
        experienceLevel: "",
        contractType: "",
        remotePreference: "",
        bio: defaultBio
      });

      setStep("confirm_job");
    } catch (error) {
      console.error("Error analyzing prompt:", error);
      setRoleHint("Erreur lors de l'analyse. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  function handleJobConfirm(jobKey: string) {
    if (!profile) return;

    const job = detectedJobs.find(j => j.jobKey === jobKey);
    const newProfile: CandidateProfile = {
      ...profile,
      jobKey,
      headline: `Profil ${jobKey} à la recherche de missions`,
      bio:
        profile.bio &&
        profile.bio !== "Profil à la recherche de missions"
          ? profile.bio
          : `Je suis ${jobKey} et je souhaite trouver de nouvelles opportunités.`
    };

    setProfile(newProfile);
    setStep("complete_profile");
  }

  function handleProfileChange<K extends keyof CandidateProfile>(
    key: K,
    value: CandidateProfile[K]
  ) {
    if (!profile) return;
    setProfile({ ...profile, [key]: value });
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    // ICI : tu pourras appeler /api/candidates pour enregistrer le profil
    setStep("preview");
  }

  const primaryJob = detectedJobs[0] || null;

  return (
    <div className="w-full max-w-xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Créer mon profil candidat / freelance
      </h1>

      {step === "prompt" && (
        <form onSubmit={handlePromptSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">
            Décris rapidement qui tu es et ce que tu cherches.
          </p>
          <textarea
            className="w-full border rounded-lg p-3 text-sm min-h-[120px]"
            placeholder='Ex : "Je suis développeur React freelance, je cherche des missions à distance"'
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
          />
          {roleHint && (
            <p className="text-xs text-amber-600">{roleHint}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-black text-white text-sm disabled:opacity-50"
          >
            {loading ? "Analyse en cours..." : "Continuer"}
          </button>
        </form>
      )}

      {step === "confirm_job" && profile && (
        <ConfirmJobStepCandidate
          prompt={prompt}
          detectedJobs={detectedJobs}
          onBack={() => setStep("prompt")}
          onConfirm={handleJobConfirm}
        />
      )}

      {step === "complete_profile" && profile && (
        <CompleteProfileStep
          profile={profile}
          context={context}
          onBack={() => setStep("confirm_job")}
          onChange={handleProfileChange}
          onSubmit={handleProfileSubmit}
        />
      )}

      {step === "preview" && profile && (
        <PreviewProfileStep
          profile={profile}
          primaryJob={primaryJob}
          context={context}
          prompt={prompt}
          onBack={() => setStep("complete_profile")}
        />
      )}
    </div>
  );
}

/* ----------------- Sous-composants ----------------- */

function ConfirmJobStepCandidate({
  prompt,
  detectedJobs,
  onBack,
  onConfirm
}: {
  prompt: string;
  detectedJobs: DetectedJob[];
  onBack: () => void;
  onConfirm: (jobKey: string) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Pour commencer, confirme ton métier principal :
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
            Aucun métier détecté. Reformule ton profil en précisant ton
            métier (ex : "Je suis serveur avec 3 ans d'expérience...").
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

function CompleteProfileStep({
  profile,
  context,
  onBack,
  onChange,
  onSubmit
}: {
  profile: CandidateProfile;
  context: JobContext;
  onBack: () => void;
  onChange: <K extends keyof CandidateProfile>(
    key: K,
    value: CandidateProfile[K]
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm text-gray-600">
        On complète ton profil pour que les recruteurs te comprennent vite.
      </p>

      <label className="block space-y-1">
        <span className="text-xs text-gray-700">Titre de profil</span>
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm"
          value={profile.headline}
          onChange={e => onChange("headline", e.target.value)}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs text-gray-700">Lieu principal</span>
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Ex : Lille, Paris, Remote..."
          value={profile.location || context.location || ""}
          onChange={e => onChange("location", e.target.value)}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs text-gray-700">
          Disponibilités / Horaires
        </span>
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Ex : Soirs et week-ends, Temps plein, Freelance 3j/semaine..."
          value={profile.availability}
          onChange={e => onChange("availability", e.target.value)}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs text-gray-700">Niveau d'expérience</span>
        <select
          className="w-full border rounded-lg px-3 py-2 text-sm"
          value={profile.experienceLevel}
          onChange={e => onChange("experienceLevel", e.target.value)}
        >
          <option value="">Choisir...</option>
          <option value="Débutant">Débutant</option>
          <option value="Intermédiaire">Intermédiaire (1-3 ans)</option>
          <option value="Senior">Senior (3+ ans)</option>
        </select>
      </label>

      <label className="block space-y-1">
        <span className="text-xs text-gray-700">Type de contrat recherché</span>
        <select
          className="w-full border rounded-lg px-3 py-2 text-sm"
          value={profile.contractType}
          onChange={e => onChange("contractType", e.target.value)}
        >
          <option value="">Choisir...</option>
          <option value="Extra">Extra / Mission ponctuelle</option>
          <option value="CDD">CDD</option>
          <option value="CDI">CDI</option>
          <option value="Freelance">Freelance / Indépendant</option>
          <option value="Stage">Stage</option>
        </select>
      </label>

      <label className="block space-y-1">
        <span className="text-xs text-gray-700">Préférence télétravail</span>
        <select
          className="w-full border rounded-lg px-3 py-2 text-sm"
          value={profile.remotePreference}
          onChange={e => onChange("remotePreference", e.target.value)}
        >
          <option value="">Choisir...</option>
          <option value="Sur place">Sur place uniquement</option>
          <option value="Remote">100% Remote</option>
          <option value="Hybride">Hybride</option>
        </select>
      </label>

      <label className="block space-y-1">
        <span className="text-xs text-gray-700">Bio / Présentation</span>
        <textarea
          className="w-full border rounded-lg px-3 py-2 text-sm min-h-[100px]"
          placeholder="Présente-toi en quelques lignes..."
          value={profile.bio}
          onChange={e => onChange("bio", e.target.value)}
        />
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
          Voir le profil
        </button>
      </div>
    </form>
  );
}

function PreviewProfileStep({
  profile,
  primaryJob,
  context,
  onBack,
  prompt
}: {
  profile: CandidateProfile;
  primaryJob: DetectedJob | null;
  context: JobContext;
  onBack: () => void;
  prompt: string;
}) {
  const [publishing, setPublishing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  async function handleSave() {
    setPublishing(true);
    setError(null);
    setSuccess(false);

    try {
      const apiUrl = `${SUPABASE_URL}/functions/v1/create-candidate`;
      
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          jobKey: profile.jobKey,
          profile: {
            headline: profile.headline,
            bio: profile.bio,
            location: profile.location,
            availability: profile.availability,
            experienceLevel: profile.experienceLevel,
            contractType: profile.contractType,
            remotePreference: profile.remotePreference
          }
        })
      });

      if (!res.ok) {
        throw new Error("API error");
      }

      setSuccess(true);
    } catch (e) {
      setError("Impossible d'enregistrer ton profil pour le moment.");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Voici ton profil tel qu'il sera visible par les recruteurs.
      </p>

      <div className="border rounded-lg p-4 space-y-3 bg-white">
        <h2 className="text-lg font-semibold">{profile.headline}</h2>
        
        <div className="text-sm text-gray-700 space-y-2">
          {profile.location && (
            <div>
              <span className="font-medium">📍 Lieu :</span> {profile.location}
            </div>
          )}
          {profile.availability && (
            <div>
              <span className="font-medium">⏰ Disponibilités :</span> {profile.availability}
            </div>
          )}
          {profile.experienceLevel && (
            <div>
              <span className="font-medium">💼 Expérience :</span> {profile.experienceLevel}
            </div>
          )}
          {profile.contractType && (
            <div>
              <span className="font-medium">📋 Type de contrat :</span> {profile.contractType}
            </div>
          )}
          {profile.remotePreference && (
            <div>
              <span className="font-medium">🏠 Télétravail :</span> {profile.remotePreference}
            </div>
          )}
        </div>

        {profile.bio && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        {primaryJob && (
          <div className="mt-3 pt-3 border-t text-xs text-gray-500">
            Métier détecté : <strong>{primaryJob.jobKey}</strong> ({(primaryJob.confidence * 100).toFixed(0)}%)
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-gray-500 underline"
        >
          Modifier le profil
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={publishing}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm disabled:opacity-50"
        >
          {publishing ? "Enregistrement..." : "Enregistrer mon profil 🚀"}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-2">{error}</p>
      )}
      {success && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-800 font-semibold">
            ✅ Profil publié avec succès !
          </p>
          <p className="text-xs text-green-700 mt-1">
            Les recruteurs peuvent maintenant te contacter.
          </p>
        </div>
      )}
    </div>
  );
}

