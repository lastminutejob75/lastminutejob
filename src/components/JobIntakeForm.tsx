import React from 'react';
import { useJobIntake } from '../lib/useJobIntake';
import { generateJobTemplate, mapJobKeyToJobName } from '../lib/jobSynonymsExtended';
import jobsDataRaw from '../lib/uwi_human_jobs_freelance_varied_skills.json';
import { Sparkles, CheckCircle, AlertCircle, MapPin, Calendar, Clock, Users } from 'lucide-react';

interface Job {
  id: number;
  name: string;
  category: string;
  skills: string[];
  level: string;
  urgency_tags: string[];
  icon: string;
}

const jobs: Job[] = typeof jobsDataRaw === 'string' ? JSON.parse(jobsDataRaw) : jobsDataRaw;

interface PromptStepProps {
  defaultValue: string;
  onSubmit: (value: string) => void;
}

function PromptStep({ defaultValue, onSubmit }: PromptStepProps) {
  const [value, setValue] = React.useState(defaultValue);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) {
          onSubmit(value.trim());
        }
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Décrivez votre besoin
        </label>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none resize-y"
          placeholder="Ex: Serveur à Paris samedi soir 15€/h"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-all"
        style={{ backgroundColor: '#007BFF' }}
      >
        <Sparkles className="w-4 h-4 inline mr-2" />
        Analyser
      </button>
    </form>
  );
}

interface ConfirmJobStepProps {
  detectedJobs: Array<{ jobKey: string; confidence: number }>;
  onConfirm: () => void;
}

function ConfirmJobStep({ detectedJobs, onConfirm }: ConfirmJobStepProps) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 font-semibold mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Je ne suis pas sûr du métier. Est-ce plutôt l'un de ceux-ci ?
        </p>
        <div className="space-y-2">
          {detectedJobs.slice(0, 5).map((job, idx) => (
            <button
              key={idx}
              onClick={onConfirm}
              className="w-full text-left px-4 py-3 rounded-lg bg-white border-2 border-blue-200 hover:border-blue-400 text-blue-700 font-medium transition-all"
            >
              {mapJobKeyToJobName(job.jobKey, jobs) || job.jobKey} 
              <span className="text-xs text-blue-500 ml-2">
                ({(job.confidence * 100).toFixed(0)}%)
              </span>
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={onConfirm}
        className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white font-medium hover:bg-slate-50"
      >
        Autre métier
      </button>
    </div>
  );
}

interface MissingInfoStepProps {
  context: { location?: string | null; duration?: string | null; urgency?: string | null };
  readiness: MissionReadiness | null;
  onDone: () => void;
}

function MissingInfoStep({ context, readiness, onDone }: MissingInfoStepProps) {
  const missing = readiness?.missing || [];

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Il manque quelques informations pour générer une annonce complète.
        </p>
        <div className="space-y-3">
          {missing.includes("lieu") && (
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-2 flex items-center gap-1">
                <MapPin className="w-4 h-4" /> Où a lieu la mission ?
              </label>
              <input
                type="text"
                placeholder="Ville / Code postal"
                className="w-full px-3 py-2 rounded-lg border border-amber-300 focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
              />
            </div>
          )}
          {missing.includes("durée") && (
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-2 flex items-center gap-1">
                <Clock className="w-4 h-4" /> Quand ?
              </label>
              <input
                type="text"
                placeholder="Soirée / Journée / Plusieurs jours"
                className="w-full px-3 py-2 rounded-lg border border-amber-300 focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
              />
            </div>
          )}
        </div>
      </div>
      <button
        onClick={onDone}
        className="w-full px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-all"
        style={{ backgroundColor: '#007BFF' }}
      >
        Continuer
      </button>
    </div>
  );
}

interface PreviewStepProps {
  template: { title: string; description: string; requirements: string[] };
}

function PreviewStep({ template }: PreviewStepProps) {
  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Aperçu de l'annonce générée
        </p>
      </div>
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4">{template.title}</h3>
        <div className="text-sm text-slate-700 mb-4 whitespace-pre-line">
          {template.description}
        </div>
        {template.requirements.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Pré-requis :</h4>
            <ul className="list-disc pl-5 text-sm text-slate-700">
              {template.requirements.map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <button
        className="w-full px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-all"
        style={{ backgroundColor: '#FF6B00' }}
      >
        Publier l'annonce
      </button>
    </div>
  );
}

export function JobIntakeForm() {
  const {
    step,
    prompt,
    detectedJobs,
    context,
    readiness,
    onPromptSubmit,
    setStep
  } = useJobIntake();

  if (step === "prompt") {
    return (
      <PromptStep
        defaultValue={prompt}
        onSubmit={onPromptSubmit}
      />
    );
  }

  if (step === "confirm_job") {
    return (
      <ConfirmJobStep
        detectedJobs={detectedJobs}
        onConfirm={() => setStep("missing_info")}
      />
    );
  }

  if (step === "missing_info") {
    return (
      <MissingInfoStep
        context={context}
        readiness={readiness}
        onDone={() => setStep("preview")}
      />
    );
  }

  if (step === "preview") {
    const primary = detectedJobs[0];
    if (!primary) {
      return (
        <div className="text-center text-red-600">
          Erreur : aucun métier détecté
        </div>
      );
    }
    
    const tpl = generateJobTemplate(primary.jobKey, context);
    return <PreviewStep template={tpl} />;
  }

  return null;
}

