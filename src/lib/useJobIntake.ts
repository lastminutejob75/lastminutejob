import { useState } from 'react';
import {
  DetectedJob,
  JobContext,
  MissionReadiness,
  extractContext,
  detectJobsFromText,
  computeMissionReadiness,
  isJobDetectionUncertain,
  logJobDetectionToApi
} from './jobSynonymsExtended';

export type Step = "prompt" | "confirm_job" | "missing_info" | "preview";

export function useJobIntake() {
  const [step, setStep] = useState<Step>("prompt");
  const [prompt, setPrompt] = useState("");
  const [detectedJobs, setDetectedJobs] = useState<DetectedJob[]>([]);
  const [context, setContext] = useState<JobContext>({});
  const [readiness, setReadiness] = useState<MissionReadiness | null>(null);

  async function onPromptSubmit(value: string) {
    setPrompt(value);

    const ctx = extractContext(value);
    const jobs = detectJobsFromText(value);
    const r = computeMissionReadiness(jobs, ctx);

    setContext(ctx);
    setDetectedJobs(jobs);
    setReadiness(r);

    const uncertain = isJobDetectionUncertain(jobs);

    // Log de détection
    logJobDetectionToApi({
      prompt_text: value,
      detectedJobs: jobs,
      readiness: r,
      usedLLM: false,
      location: ctx.location,
      duration: ctx.duration,
      urgency: ctx.urgency
    }).catch(() => {
      // Jamais bloquant - le logging ne doit jamais casser l'UX
    });

    if (uncertain) {
      setStep("confirm_job");
    } else if (r.status !== "ready") {
      setStep("missing_info");
    } else {
      setStep("preview");
    }
  }

  return {
    step,
    prompt,
    detectedJobs,
    context,
    readiness,
    onPromptSubmit,
    setStep
  };
}

