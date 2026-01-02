import React, { useState } from "react";
import type { ParsedNeed } from "../lib/jobEngine";
import { analyzeNeedPrompt } from "../lib/jobEngine";
import { UWiLogo } from "./UWiLogo";

type Step = "prompt" | "refine" | "summary";

export function NeedWizard() {
  const [step, setStep] = useState<Step>("prompt");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<ParsedNeed | null>(null);

  // champs que l'utilisateur peut ajuster
  const [location, setLocation] = useState("");
  const [duration, setDuration] = useState<string>("");
  const [urgency, setUrgency] = useState<string>("");

  async function handlePromptSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      // Utiliser directement analyzeNeedPrompt (moteur local)
      const parsed = await analyzeNeedPrompt(prompt);

      setParsed(parsed);
      setLocation(parsed.context.location || "");
      setDuration(parsed.context.duration || "");
      setUrgency(parsed.context.urgency || "");

      setStep("refine");
    } catch (error) {
      console.error("Error analyzing prompt:", error);
      alert("Erreur lors de l'analyse. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  function handleRefineSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!parsed) return;

    setParsed({
      ...parsed,
      context: {
        ...parsed.context,
        location: location || null,
        duration: (duration || undefined) as any,
        urgency: (urgency || undefined) as any
      }
    });

    setStep("summary");
  }

  return (
    <div className="w-full max-w-xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Décris ton besoin
      </h1>

      {step === "prompt" && (
        <form onSubmit={handlePromptSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">
            Tu peux écrire par exemple :
            <br />
            <span className="text-xs text-gray-500">
              "Je suis serveur, je cherche des extras le week-end à Lille" ou
              "Je cherche un développeur freelance pour un site vitrine"
            </span>
          </p>
          <textarea
            className="w-full border rounded-lg p-3 text-sm min-h-[120px]"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-black text-white text-sm disabled:opacity-50"
          >
            {loading ? "Analyse en cours..." : "Continuer"}
          </button>
        </form>
      )}

      {step === "refine" && parsed && (
        <form onSubmit={handleRefineSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">
            Voilà ce que j'ai compris de ton besoin. Tu peux ajuster si besoin.
          </p>

          <div className="p-3 rounded-lg bg-gray-50 text-xs text-gray-600 space-y-1">
            <div>Texte original :</div>
            <div className="text-gray-800">{parsed.rawPrompt}</div>
          </div>

          {parsed.primaryJob && (
            <div className="text-sm text-gray-700">
              Métier / domaine principal détecté :{" "}
              <strong>{parsed.primaryJob.jobKey}</strong>{" "}
              <span className="text-xs text-gray-500">
                ({(parsed.primaryJob.confidence * 100).toFixed(0)}%)
              </span>
            </div>
          )}

          <label className="block space-y-1">
            <span className="text-xs text-gray-700">
              Lieu principal (ville, zone…)
            </span>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Ex : Lille, Paris, À distance…"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs text-gray-700">
              Durée / format du besoin
            </span>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={duration}
              onChange={e => setDuration(e.target.value)}
            >
              <option value="">Laisser flou</option>
              <option value="one_day">Une journée / soirée</option>
              <option value="short">Quelques jours / semaines</option>
              <option value="long">Plusieurs mois / long terme</option>
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-xs text-gray-700">
              Niveau d'urgence
            </span>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={urgency}
              onChange={e => setUrgency(e.target.value)}
            >
              <option value="">Pas précisé</option>
              <option value="low">Flexible</option>
              <option value="medium">
                Dans les jours/semaines qui viennent
              </option>
              <option value="high">Urgent</option>
            </select>
          </label>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep("prompt")}
              className="text-xs text-gray-500 underline"
            >
              Modifier le texte initial
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-black text-white text-sm"
            >
              Continuer
            </button>
          </div>
        </form>
      )}

      {step === "summary" && parsed && (
        <SummaryStep parsed={parsed} onBack={() => setStep("refine")} />
      )}
    </div>
  );
}

/* ----- étape de résumé du besoin normalisé ----- */

function SummaryStep({
  parsed,
  onBack
}: {
  parsed: ParsedNeed;
  onBack: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { SUPABASE_URL } = await import("../lib/env");
      const apiUrl = `${SUPABASE_URL}/functions/v1/create-need`;

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawPrompt: parsed.rawPrompt,
          jobCandidates: parsed.jobCandidates,
          primaryJob: parsed.primaryJob,
          context: parsed.context,
          direction: parsed.direction,
          readiness: parsed.readiness
        })
      });

      if (!res.ok) {
        throw new Error("Erreur API");
      }

      const data = await res.json();
      setSuccess(true);
    } catch (e) {
      console.error("Error saving need:", e);
      setError("Impossible d'enregistrer le besoin pour le moment.");
    } finally {
      setSaving(false);
    }
  }

  const { primaryJob, context, readiness, direction } = parsed;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Voilà le besoin tel qu'il peut être orchestré par <UWiLogo size="sm" />.
      </p>

      <div className="border rounded-lg p-4 bg-white space-y-2 text-sm text-gray-800">
        {primaryJob && (
          <div>
            Domaine principal :{" "}
            <strong>{primaryJob.jobKey}</strong>
          </div>
        )}
        {context.location && (
          <div>
            Lieu : <strong>{context.location}</strong>
          </div>
        )}
        {context.duration && (
          <div>
            Durée : <strong>{context.duration}</strong>
          </div>
        )}
        {context.urgency && (
          <div>
            Urgence : <strong>{context.urgency}</strong>
          </div>
        )}
        <div className="text-xs text-gray-500 pt-1">
          Qualité du brief :{" "}
          {readiness.score}/100 ({readiness.status})
        </div>
        <div className="text-xs text-gray-500">
          Direction interne (orchestration) : {direction}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-gray-500 underline"
        >
          Modifier
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Enregistrer le besoin"}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-2">{error}</p>
      )}
      {success && (
        <p className="text-xs text-emerald-600 mt-2">
          Besoin enregistré. <UWiLogo size="sm" /> pourra ensuite l'orchestrer vers des
          réponses (humains, freelances, etc.).
        </p>
      )}
    </div>
  );
}
