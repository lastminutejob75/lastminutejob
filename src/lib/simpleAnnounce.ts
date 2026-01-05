import { detectSimpleJob, SimpleJobKey } from "./simpleJobs";
import { extractContext } from "./jobEngine";

export interface SimpleAnnouncementDraft {
  jobKey: SimpleJobKey;
  jobTitle: string;      // EDITABLE par l'utilisateur
  location: string;      // EDITABLE
  description: string;   // EDITABLE
  missions: string[];    // EDITABLE
  requirements: string[];// EDITABLE
  tags: string[];        // EDITABLE
}

function extractSimpleLocation(prompt: string): string {
  // Utiliser la fonction detectLocation améliorée de jobEngine
  const context = extractContext(prompt);
  return context.location || "";
}

function buildTemplate(jobKey: SimpleJobKey, jobTitle: string, prompt: string): Omit<SimpleAnnouncementDraft, "jobKey" | "jobTitle" | "location"> {
  switch (jobKey) {
    case "server":
      return {
        description: `Annonce pour ${jobTitle.toLowerCase()} générée à partir de ton besoin : « ${prompt} ».`,
        missions: [
          "Accueillir et servir les clients",
          "Prendre les commandes et encaisser",
          "Veiller à la propreté de la salle"
        ],
        requirements: [
          "Ponctualité",
          "Sérieux",
          "Bonne présentation",
          "Première expérience appréciée"
        ],
        tags: ["Extra", "Week-end", "Restauration"]
      };

    case "bartender":
      return {
        description: `Annonce pour ${jobTitle.toLowerCase()} générée à partir de ton besoin : « ${prompt} ».`,
        missions: [
          "Service au bar et préparation de cocktails",
          "Conseil client sur les boissons",
          "Encaissement et gestion de caisse"
        ],
        requirements: [
          "Expérience en bar appréciée",
          "Connaissances en cocktails",
          "Bonne présentation",
          "Disponibilité soirs et week-ends"
        ],
        tags: ["Bar", "Cocktails", "Soirée"]
      };

    case "cook":
      return {
        description: `Annonce pour ${jobTitle.toLowerCase()} générée à partir de ton besoin : « ${prompt} ».`,
        missions: [
          "Préparation des plats selon les recettes",
          "Respect des standards de qualité",
          "Maintien de la propreté en cuisine"
        ],
        requirements: [
          "Expérience en cuisine",
          "Connaissances des techniques culinaires",
          "Résistance au stress et à la chaleur",
          "Ponctualité et rigueur"
        ],
        tags: ["Cuisine", "Culinaire", "Qualité"]
      };

    case "delivery":
      return {
        description: `Annonce pour ${jobTitle.toLowerCase()} générée à partir de ton besoin : « ${prompt} ».`,
        missions: [
          "Livraison de commandes",
          "Respect des horaires de livraison",
          "Gestion des paiements"
        ],
        requirements: [
          "Permis de conduire valide",
          "Connaissance de la zone",
          "Ponctualité",
          "Bonne condition physique"
        ],
        tags: ["Livraison", "Mobile", "Flexible"]
      };

    case "dev_web":
      return {
        description: `Annonce pour ${jobTitle.toLowerCase()} pour t'aider sur ton projet web (« ${prompt} »).`,
        missions: [
          "Créer ou améliorer un site vitrine",
          "Intégrer le design fourni ou proposer une maquette",
          "Assurer le bon fonctionnement du site"
        ],
        requirements: [
          "Bonne maîtrise du développement web",
          "Autonomie",
          "Capacité à expliquer simplement les choix techniques"
        ],
        tags: ["Freelance", "Projet web"]
      };

    case "designer":
      return {
        description: `Annonce pour ${jobTitle.toLowerCase()} générée à partir de ton besoin : « ${prompt} ».`,
        missions: [
          "Création de logos et identités visuelles",
          "Réalisation de maquettes",
          "Création de supports de communication"
        ],
        requirements: [
          "Maîtrise des outils graphiques",
          "Sens créatif et esthétique",
          "Portfolio",
          "Disponibilité"
        ],
        tags: ["Design", "Création", "Graphisme"]
      };

    case "community_manager":
      return {
        description: `Annonce pour ${jobTitle.toLowerCase()} générée à partir de ton besoin : « ${prompt} ».`,
        missions: [
          "Gestion des réseaux sociaux",
          "Création de contenu",
          "Animation de communauté"
        ],
        requirements: [
          "Maîtrise des réseaux sociaux",
          "Sens de la communication",
          "Créativité",
          "Disponibilité"
        ],
        tags: ["Social Media", "Digital", "Communication"]
      };

    case "kitchen_assistant":
      return {
        description: `Annonce pour ${jobTitle.toLowerCase()} générée à partir de ton besoin : « ${prompt} ».`,
        missions: [
          "Plonge et nettoyage de la vaisselle",
          "Aide à la préparation des plats",
          "Nettoyage et entretien de la cuisine"
        ],
        requirements: [
          "Rapidité et efficacité",
          "Résistance physique",
          "Respect des règles d'hygiène",
          "Disponibilité"
        ],
        tags: ["Cuisine", "Plonge", "Support"]
      };

    case "warehouse":
      return {
        description: `Annonce pour ${jobTitle.toLowerCase()} générée à partir de ton besoin : « ${prompt} ».`,
        missions: [
          "Préparation et conditionnement des commandes",
          "Gestion des stocks",
          "Chargement et déchargement"
        ],
        requirements: [
          "Bonne condition physique",
          "Rigueur et organisation",
          "Connaissance des engins de manutention (plus)",
          "Disponibilité"
        ],
        tags: ["Logistique", "Entrepôt", "Manutention"]
      };

    case "sales":
      return {
        description: `Annonce pour ${jobTitle.toLowerCase()} générée à partir de ton besoin : « ${prompt} ».`,
        missions: [
          "Accueil et conseil client",
          "Mise en rayon et merchandising",
          "Encaissement"
        ],
        requirements: [
          "Expérience en vente appréciée",
          "Bonne présentation",
          "Sens du contact",
          "Disponibilité"
        ],
        tags: ["Vente", "Commerce", "Contact client"]
      };

    case "cashier":
      return {
        description: `Annonce pour ${jobTitle.toLowerCase()} générée à partir de ton besoin : « ${prompt} ».`,
        missions: [
          "Encaissement des clients",
          "Gestion de caisse",
          "Accueil client"
        ],
        requirements: [
          "Rigueur et honnêteté",
          "Rapidité",
          "Bonne présentation",
          "Disponibilité"
        ],
        tags: ["Caisse", "Encaissement", "Commerce"]
      };

    case "host":
      return {
        description: `Annonce pour ${jobTitle.toLowerCase()} générée à partir de ton besoin : « ${prompt} ».`,
        missions: [
          "Accueil et orientation des clients",
          "Gestion des réservations",
          "Réponse au téléphone"
        ],
        requirements: [
          "Excellente présentation",
          "Sourire et aisance relationnelle",
          "Maîtrise du français",
          "Disponibilité"
        ],
        tags: ["Accueil", "Réception", "Contact client"]
      };

    case "cleaning":
      return {
        description: `Annonce pour ${jobTitle.toLowerCase()} générée à partir de ton besoin : « ${prompt} ».`,
        missions: [
          "Nettoyage des locaux et espaces de vie",
          "Entretien régulier des surfaces et sols",
          "Gestion des produits d'entretien et matériel",
          "Respect des normes d'hygiène et de propreté"
        ],
        requirements: [
          "Expérience en entretien ménager appréciée",
          "Rigueur et minutie dans le travail",
          "Bonne condition physique",
          "Sens de l'organisation",
          "Disponibilité selon les besoins"
        ],
        tags: ["Entretien", "Nettoyage", "Hygiène", "Ménage"]
      };

    case "babysitting":
      return {
        description: `Annonce pour ${jobTitle.toLowerCase()} générée à partir de ton besoin : « ${prompt} ».`,
        missions: [
          "Garde et surveillance des enfants",
          "Activités ludiques et éducatives",
          "Repas et soins d'hygiène"
        ],
        requirements: [
          "Expérience avec enfants",
          "Patience et bienveillance",
          "Références vérifiables",
          "Disponibilité"
        ],
        tags: ["Garde d'enfants", "Famille", "Soirée"]
      };

    case "handyman":
      return {
        description: `Annonce pour ${jobTitle.toLowerCase()} générée à partir de ton besoin : « ${prompt} ».`,
        missions: [
          "Réalisation de petits travaux",
          "Réparations diverses",
          "Montage et installation"
        ],
        requirements: [
          "Compétences techniques",
          "Autonomie",
          "Outils personnels (plus)",
          "Disponibilité"
        ],
        tags: ["Bricolage", "Travaux", "Polyvalent"]
      };

    case "real_estate":
      return {
        description: `Annonce pour ${jobTitle.toLowerCase()} générée à partir de ton besoin : « ${prompt} ».`,
        missions: [
          "Conseil et accompagnement client",
          "Gestion de portefeuille de biens",
          "Négociation et transaction"
        ],
        requirements: [
          "Connaissances du marché immobilier",
          "Aisance relationnelle",
          "Rigueur et organisation",
          "Disponibilité"
        ],
        tags: ["Immobilier", "Conseil", "Transaction"]
      };

    case "photographer":
      return {
        description: `Annonce pour ${jobTitle.toLowerCase()} générée à partir de ton besoin : « ${prompt} ».`,
        missions: [
          "Prise de vue et cadrage",
          "Retouche et post-production",
          "Livraison des photos"
        ],
        requirements: [
          "Maîtrise des techniques photographiques",
          "Matériel professionnel",
          "Portfolio",
          "Disponibilité"
        ],
        tags: ["Photographie", "Création", "Événement"]
      };

    case "writer":
      return {
        description: `Annonce pour ${jobTitle.toLowerCase()} générée à partir de ton besoin : « ${prompt} ».`,
        missions: [
          "Rédaction de contenus",
          "Adaptation du style et du ton",
          "Relecture et correction"
        ],
        requirements: [
          "Excellente maîtrise du français",
          "Capacité d'adaptation",
          "Portfolio ou exemples",
          "Disponibilité"
        ],
        tags: ["Rédaction", "Écriture", "Contenu"]
      };

    case "accountant":
      return {
        description: `Annonce pour ${jobTitle.toLowerCase()} générée à partir de ton besoin : « ${prompt} ».`,
        missions: [
          "Tenue de comptabilité",
          "Déclarations fiscales",
          "Conseil financier"
        ],
        requirements: [
          "Formation en comptabilité",
          "Connaissances fiscales",
          "Rigueur et précision",
          "Disponibilité"
        ],
        tags: ["Comptabilité", "Fiscal", "Conseil"]
      };

    case "nurse":
      return {
        description: `Annonce pour ${jobTitle.toLowerCase()} générée à partir de ton besoin : « ${prompt} ».`,
        missions: [
          "Soins et accompagnement",
          "Surveillance de l'état de santé",
          "Administration de traitements"
        ],
        requirements: [
          "Diplôme d'infirmier(ère)",
          "Empathie et bienveillance",
          "Rigueur et professionnalisme",
          "Disponibilité"
        ],
        tags: ["Soins", "Santé", "Accompagnement"]
      };

    case "teacher":
      return {
        description: `Annonce pour ${jobTitle.toLowerCase()} générée à partir de ton besoin : « ${prompt} ».`,
        missions: [
          "Enseignement et transmission de connaissances",
          "Préparation de cours",
          "Suivi et évaluation"
        ],
        requirements: [
          "Pédagogie et patience",
          "Maîtrise de la matière",
          "Capacité d'adaptation",
          "Disponibilité"
        ],
        tags: ["Enseignement", "Éducation", "Pédagogie"]
      };

    default:
      return {
        description: `À partir de ton besoin : « ${prompt} », voici une annonce type que tu peux adapter.`,
        missions: [
          "Réaliser les tâches décrites dans le besoin",
          "S'adapter au contexte et aux attentes",
          "Communiquer régulièrement sur l'avancement"
        ],
        requirements: [
          "Ponctualité",
          "Sérieux",
          "Envie de bien faire"
        ],
        tags: ["Flexible", "À préciser"]
      };
  }
}

export function simpleGenerateAnnouncement(prompt: string): SimpleAnnouncementDraft {
  const jobDetection = detectSimpleJob(prompt);
  const location = extractSimpleLocation(prompt);

  const defaultTitle =
    jobDetection.found && jobDetection.jobLabel
      ? jobDetection.jobLabel
      : "";

  const base = buildTemplate(
    jobDetection.jobKey,
    defaultTitle,
    prompt
  );

  return {
    jobKey: jobDetection.jobKey,
    jobTitle: defaultTitle,
    location,
    ...base
  };
}

/**
 * Convertit une réponse LLM en SimpleAnnouncementDraft
 */
export function convertLLMResponseToDraft(
  llmResponse: {
    type: "offer_services" | "need_someone";
    role_label: string;
    short_context: string;
    location: string | null;
    sections: Array<{ title: string; items: string[] }>;
  },
  originalPrompt: string
): SimpleAnnouncementDraft {
  // Détecter le métier depuis le prompt original d'abord (plus fiable)
  const jobDetectionFromPrompt = detectSimpleJob(originalPrompt);
  
  // Détecter aussi depuis le role_label du LLM
  const jobDetectionFromLLM = llmResponse.role_label ? detectSimpleJob(llmResponse.role_label) : null;
  
  // Priorité : si la détection depuis le prompt a trouvé un métier, on l'utilise
  // Sinon, on utilise la détection depuis le role_label du LLM
  // Sinon, on utilise le role_label du LLM tel quel
  const jobDetection = jobDetectionFromPrompt.found 
    ? jobDetectionFromPrompt 
    : (jobDetectionFromLLM?.found ? jobDetectionFromLLM : jobDetectionFromPrompt);
  
  // Extraire la location : d'abord depuis la réponse LLM, sinon depuis le prompt original
  let location = llmResponse.location || "";
  if (!location) {
    // Si le LLM n'a pas détecté de location, essayer de la détecter depuis le prompt original
    location = extractSimpleLocation(originalPrompt);
  }
  
  // Extraire missions et requirements des sections
  const missions: string[] = [];
  const requirements: string[] = [];
  const tags: string[] = [];

  for (const section of llmResponse.sections) {
    const titleLower = section.title.toLowerCase();
    if (titleLower.includes("mission") || titleLower.includes("tâche") || titleLower.includes("activité")) {
      missions.push(...section.items);
    } else if (titleLower.includes("prérequis") || titleLower.includes("requis") || titleLower.includes("qualification") || titleLower.includes("compétence")) {
      requirements.push(...section.items);
    } else {
      // Autres sections peuvent devenir des tags ou missions
      if (section.items.length <= 3) {
        tags.push(...section.items);
      } else {
        missions.push(...section.items);
      }
    }
  }

  // Si pas de missions/requirements détectés, prendre la première section
  if (missions.length === 0 && requirements.length === 0 && llmResponse.sections.length > 0) {
    missions.push(...llmResponse.sections[0].items);
  }

  // Déterminer le titre final avec priorité :
  // 1. jobLabel de la détection depuis le prompt (PRIORITÉ ABSOLUE si trouvé)
  // 2. role_label du LLM (s'il est spécifique et non générique)
  // 3. jobLabel de la détection depuis le role_label
  // 4. role_label du LLM même s'il est générique
  // 5. Chaîne vide en dernier recours (l'utilisateur devra remplir)
  let finalJobTitle = "";

  // PRIORITÉ 1 : Si la détection depuis le prompt a trouvé un métier, on l'utilise TOUJOURS
  // C'EST LA PRIORITÉ ABSOLUE - RIEN NE PEUT LA REMPLACER
  // Même si le LLM retourne quelque chose, on fait confiance à la détection locale
  if (jobDetectionFromPrompt.found && jobDetectionFromPrompt.jobLabel) {
    finalJobTitle = jobDetectionFromPrompt.jobLabel;
  }
  // PRIORITÉ 2 : Sinon, si le LLM a fourni un role_label spécifique et non générique
  // (seulement si la détection depuis le prompt n'a RIEN trouvé)
  else if (llmResponse.role_label &&
      llmResponse.role_label.trim() &&
      llmResponse.role_label !== "Rôle à préciser" &&
      llmResponse.role_label !== "" &&
      llmResponse.role_label !== "Rôle à définir" &&
      !llmResponse.role_label.toLowerCase().includes("besoin") &&
      !llmResponse.role_label.toLowerCase().includes("à préciser") &&
      !llmResponse.role_label.toLowerCase().includes("à définir") &&
      !llmResponse.role_label.toLowerCase().includes("recherche") &&
      !llmResponse.role_label.toLowerCase().includes("cherche") &&
      !llmResponse.role_label.toLowerCase().includes("définir")) {
    // Le LLM a fourni un role_label spécifique
    finalJobTitle = llmResponse.role_label;
  }
  // PRIORITÉ 3 : Sinon, si la détection depuis le role_label a trouvé quelque chose
  else if (jobDetectionFromLLM?.found && jobDetectionFromLLM.jobLabel) {
    finalJobTitle = jobDetectionFromLLM.jobLabel;
  }
  // PRIORITÉ 4 : Sinon, on utilise quand même le role_label du LLM même s'il est générique
  // (mais seulement s'il n'est pas complètement vide ou générique)
  else if (llmResponse.role_label &&
           llmResponse.role_label.trim() &&
           llmResponse.role_label !== "Rôle à préciser" &&
      llmResponse.role_label !== "" &&
           llmResponse.role_label !== "Rôle à définir") {
    finalJobTitle = llmResponse.role_label;
  }
  
  // Si le LLM a détecté un métier mais qu'on ne l'a pas reconnu, on utilise "generic" au lieu de "custom"
  // pour éviter de bloquer le système
  let finalJobKey = jobDetection.jobKey;
  if (finalJobKey === "custom" && (llmResponse.role_label || jobDetectionFromPrompt.found)) {
    // Le LLM ou la détection a trouvé quelque chose, on fait confiance
    finalJobKey = "generic";
  }

  // S'assurer que finalJobTitle n'est jamais "Rôle à préciser" ou "Rôle à définir"
  // On nettoie complètement pour garantir que l'utilisateur voit toujours un message clair
  const cleanJobTitle = (finalJobTitle === "Rôle à préciser" ||
                         finalJobTitle === "Rôle à définir" ||
                         !finalJobTitle ||
                         !finalJobTitle.trim())
    ? ""
    : finalJobTitle;

  return {
    jobKey: finalJobKey,
    jobTitle: cleanJobTitle,
    location: location,
    description: llmResponse.short_context,
    missions: missions.length > 0 ? missions : ["À définir"],
    requirements: requirements.length > 0 ? requirements : ["À définir"],
    tags: tags.length > 0 ? tags : []
  };
}

