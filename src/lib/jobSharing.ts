import type { JobContext } from "./jobEngine";

export type ShareChannel = "uwi" | "linkedin" | "facebook" | "email" | "leboncoin";

export interface JobSharePayload {
  channel: ShareChannel;
  title: string;
  body: string;
  hashtags?: string[];
  url?: string; // lien vers la mission sur UWi
}

export function buildSharePayloads(args: {
  jobKey: string;
  title: string;
  description: string;
  requirements: string[];
  context: JobContext;
  jobUrl: string;          // ex: https://uwi.work/jobs/123
  channels: ShareChannel[];
}): JobSharePayload[] {
  const { jobKey, title, description, requirements, context, jobUrl, channels } = args;

  const baseLine = `${title}${context.location ? ` - ${context.location}` : ""}`;

  const hashtags = [
    "#recrutement",
    "#job",
    context.location ? `#${context.location.replace(/\s+/g, "")}` : "",
    jobKey === "cook" ? "#cuisine" : "",
    jobKey === "server" ? "#restauration" : "",
    jobKey.includes("developer") ? "#dev" : ""
  ].filter(Boolean);

  return channels.map(channel => {
    switch (channel) {
      case "linkedin":
        return {
          channel,
          title: baseLine,
          body: [
            description,
            "",
            requirements.length
              ? "Profil recherché :"
              : "",
            ...requirements.map(r => `• ${r}`),
            "",
            `👉 Postulez ici : ${jobUrl}`
          ]
            .filter(Boolean)
            .join("\n"),
          hashtags
        };

      case "facebook":
        return {
          channel,
          title: baseLine,
          body: [
            description,
            "",
            requirements.length
              ? "On recherche :"
              : "",
            ...requirements.map(r => `- ${r}`),
            "",
            `📩 Candidatures via : ${jobUrl}`
          ]
            .filter(Boolean)
            .join("\n"),
          hashtags
        };

      case "email":
        return {
          channel,
          title: `[Mission] ${baseLine}`,
          body: [
            `Bonjour,`,
            "",
            `Nous recherchons : ${title}`,
            "",
            description,
            "",
            requirements.length
              ? "Profil recherché :"
              : "",
            ...requirements.map(r => `- ${r}`),
            "",
            `Candidatures via : ${jobUrl}`,
            "",
            `Cordialement,`,
            `L'équipe UWi / LMJ`
          ].join("\n")
        };

      case "leboncoin":
        // texte brut optimisé "copier-coller"
        return {
          channel,
          title: baseLine,
          body: [
            description,
            "",
            "Profil recherché :",
            ...requirements.map(r => `- ${r}`),
            "",
            context.duration ? `Durée : ${context.duration}` : "",
            context.urgency ? `Urgence : ${context.urgency}` : "",
            "",
            `Merci d'envoyer vos informations ou CV via notre formulaire : ${jobUrl}`
          ]
            .filter(Boolean)
            .join("\n")
        };

      case "uwi":
      default:
        return {
          channel,
          title,
          body: description,
          url: jobUrl
        };
    }
  });
}

