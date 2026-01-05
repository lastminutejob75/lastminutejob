import React, { useState } from "react";
import { UWiLogo } from "./UWiLogo";

type ExecutionMode = "human" | "ai" | "hybrid";

interface ParsedBrief {
  rawText: string;
  type: string;
  location: string;
  date: string;
  timeRange: string;
  urgency: "low" | "medium" | "high";
  audienceSize: string;
}

const defaultParsedBrief: ParsedBrief = {
  rawText: "",
  type: "",
  location: "",
  date: "",
  timeRange: "",
  urgency: "medium",
  audienceSize: "",
};

export function BriefIntake() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [input, setInput] = useState("");
  const [brief, setBrief] = useState<ParsedBrief>(defaultParsedBrief);
  const [executionMode, setExecutionMode] = useState<ExecutionMode>("human");

  const fakeParseBrief = (text: string): ParsedBrief => {
    let parsed: ParsedBrief = {
      ...defaultParsedBrief,
      rawText: text,
    };

    const lower = text.toLowerCase();

    if (lower.includes("serveur") || lower.includes("serveuse")) {
      parsed.type = "Serveur / événement";
    } else if (lower.includes("nettoyage") || lower.includes("ménage")) {
      parsed.type = "Nettoyage / ménage";
    } else if (lower.includes("monteur vidéo") || lower.includes("montage")) {
      parsed.type = "Montage vidéo";
    } else {
      parsed.type = "Mission / prestation";
    }

    if (
      lower.includes("aujourd'hui") ||
      lower.includes("tout de suite") ||
      lower.includes("urgent")
    ) {
      parsed.urgency = "high";
    } else {
      parsed.urgency = "medium";
    }

    const locationMatch =
      text.match(/à\s+([A-Za-zÀ-ÿ\s-]+)/) || text.match(/a\s+([A-Za-zÀ-ÿ\s-]+)/);
    if (locationMatch && locationMatch[1]) {
      parsed.location = locationMatch[1].trim();
    }

    if (lower.includes("demain")) {
      parsed.date = "Demain";
    } else if (lower.includes("samedi")) {
      parsed.date = "Samedi";
    } else if (lower.includes("dimanche")) {
      parsed.date = "Dimanche";
    }

    if (lower.includes("19h") || lower.includes("19 h")) {
      parsed.timeRange = "19h–00h (estimé)";
    }

    const peopleMatch = text.match(/(\d+)\s*(personnes|pers)/i);
    if (peopleMatch && peopleMatch[1]) {
      parsed.audienceSize = `${peopleMatch[1]} personnes`;
    }

    return parsed;
  };

  const handleSubmitStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const parsed = fakeParseBrief(input);
    setBrief(parsed);
    setStep(2);
  };

  const handleConfirmBrief = () => {
    setStep(3);
  };

  const handleLaunch = () => {
    console.log("Launching orchestration with:", { brief, executionMode });
    alert("Demande envoyée à UWi pour orchestration ✅");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-3xl p-6 md:p-8 border border-slate-100">
        {/* Badge LMJ / UWi */}
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold">
              LMJ
            </span>
            <span><UWiLogo size="sm" /> — orchestrateur de travail express</span>
          </div>
          <span className="hidden md:inline text-[11px] text-slate-400">
            1 brief unique → humains, IA, robots
          </span>
        </div>

        {step === 1 && (
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-2">
              Que veux-tu que l'on fasse pour toi ?
            </h1>
            <p className="text-slate-500 mb-6 text-sm md:text-base">
              Écris ton besoin comme tu le dirais à un collègue. Que tu sois{" "}
              <strong>recruteur, candidat ou porteur de projet</strong>, <UWiLogo size="sm" />
              structure la demande et prépare la meilleure exécution possible.
            </p>

            <form onSubmit={handleSubmitStep1} className="space-y-4">
              <textarea
                className="w-full min-h-[140px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent resize-none"
                placeholder={
                  "Ex : J'ai besoin d'un serveur pour ce samedi soir à Lille, de 19h à minuit, pour un anniversaire de 40 personnes.\nEx : Je suis étudiant à Lyon et je cherche des missions week-end en restauration."
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="px-3 py-1 rounded-full bg-slate-100 cursor-pointer">
                  Recrutement express
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 cursor-pointer">
                  Projet / mission
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 cursor-pointer">
                  Je cherche un job
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 cursor-pointer">
                  Urgent
                </span>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className={`inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-medium transition ${
                    !input.trim()
                      ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  }`}
                >
                  Continuer avec <UWiLogo size="sm" />
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs text-slate-400 hover:text-slate-600 mb-1"
            >
              ← Modifier la description
            </button>

            <div>
              <h2 className="text-xl font-semibold mb-2">Résumé de ta demande</h2>
              <p className="text-slate-500 mb-4 text-sm">
                <UWiLogo size="sm" /> a commencé à structurer ton brief. Tu peux ajuster les
                éléments, ils seront utilisés pour orchestrer les bons acteurs.
              </p>

              <div className="space-y-3">
                <EditableRow
                  label="Type de mission"
                  value={brief.type}
                  onChange={(v) => setBrief((b) => ({ ...b, type: v }))}
                />
                <EditableRow
                  label="Lieu"
                  value={brief.location}
                  onChange={(v) => setBrief((b) => ({ ...b, location: v }))}
                />
                <EditableRow
                  label="Date"
                  value={brief.date}
                  onChange={(v) => setBrief((b) => ({ ...b, date: v }))}
                />
                <EditableRow
                  label="Horaire"
                  value={brief.timeRange}
                  onChange={(v) => setBrief((b) => ({ ...b, timeRange: v }))}
                />
                <EditableRow
                  label="Nombre de personnes"
                  value={brief.audienceSize}
                  onChange={(v) =>
                    setBrief((b) => ({ ...b, audienceSize: v }))
                  }
                />
                <EditableRow
                  label="Texte brut"
                  value={brief.rawText}
                  onChange={(v) => setBrief((b) => ({ ...b, rawText: v }))}
                  isMultiline
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-lg font-semibold mb-2">
                Comment <UWiLogo size="sm" /> exécute ta demande ?
              </h3>
              <p className="text-slate-500 text-sm mb-4">
                Choisis le mode d'exécution. <UWiLogo size="sm" /> peut mobiliser uniquement des
                humains, uniquement de l'IA, ou un mix des deux.
              </p>

              <div className="grid gap-3 md:grid-cols-3">
                <ModeCard
                  label="Humain"
                  description="Un professionnel vérifié prend tout en charge."
                  selected={executionMode === "human"}
                  onClick={() => setExecutionMode("human")}
                />
                <ModeCard
                  label="IA"
                  description={<><UWiLogo size="sm" /> génère plans, messages, scripts ou contenu.</>}
                  selected={executionMode === "ai"}
                  onClick={() => setExecutionMode("ai")}
                />
                <ModeCard
                  label="Mix"
                  description="L'IA prépare, l'humain exécute. Meilleur rapport qualité/prix."
                  selected={executionMode === "hybrid"}
                  onClick={() => setExecutionMode("hybrid")}
                />
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleConfirmBrief}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition shadow-sm"
                >
                  Valider le brief
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-xs text-slate-400 hover:text-slate-600 mb-1"
            >
              ← Retour au brief
            </button>

            <h2 className="text-xl font-semibold mb-2">
              Ta demande est prête à être orchestrée
            </h2>
            <p className="text-slate-500 text-sm mb-4">
              <UWiLogo size="sm" /> va orchestrer les bons acteurs (humains, IA, robots) et te
              proposer les meilleures options pour exécuter ce brief.
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-sm">
              <div>
                <span className="font-medium">Mode choisi : </span>
                {executionMode === "human" && "Humain premium"}
                {executionMode === "ai" && "IA uniquement"}
                {executionMode === "hybrid" && "Mix humain + IA"}
              </div>
              <div>
                <span className="font-medium">Type : </span>
                {brief.type || "Non spécifié"}
              </div>
              <div>
                <span className="font-medium">Lieu : </span>
                {brief.location || "Non spécifié"}
              </div>
              <div>
                <span className="font-medium">Date : </span>
                {brief.date || "Non spécifiée"}
              </div>
              {brief.audienceSize && (
                <div>
                  <span className="font-medium">Volume : </span>
                  {brief.audienceSize}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-full border border-slate-300 text-sm text-slate-700 hover:bg-slate-50"
              >
                Modifier le brief
              </button>
              <button
                type="button"
                onClick={handleLaunch}
                className="px-5 py-2.5 rounded-full bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 shadow-sm"
              >
                Lancer avec <UWiLogo size="sm" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface EditableRowProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  isMultiline?: boolean;
}

function EditableRow({ label, value, onChange, isMultiline }: EditableRowProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
        {label}
      </span>
      {isMultiline ? (
        <textarea
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent bg-white"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
        />
      ) : (
        <input
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent bg-white"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

interface ModeCardProps {
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

function ModeCard({ label, description, selected, onClick }: ModeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-2xl border px-4 py-3 text-sm transition ${
        selected
          ? "border-blue-600 bg-blue-600 text-white shadow-sm"
          : "border-slate-200 bg-slate-50 hover:bg-slate-100"
      }`}
    >
      <div className="font-semibold mb-1">{label}</div>
      <div className={selected ? "text-xs text-slate-100" : "text-xs text-slate-500"}>
        {description}
      </div>
    </button>
  );
}

