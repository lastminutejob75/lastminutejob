export type SimpleJobKey =
  | "server"
  | "bartender"
  | "cook"
  | "kitchen_assistant"
  | "delivery"
  | "warehouse"
  | "sales"
  | "cashier"
  | "host"
  | "cleaning"
  | "babysitting"
  | "handyman"
  | "dev_web"
  | "designer"
  | "community_manager"
  | "real_estate"
  | "photographer"
  | "writer"
  | "accountant"
  | "nurse"
  | "teacher"
  | "generic"
  | "custom";

export type SimpleRoleCategory =
  | "restaurant"
  | "logistics"
  | "sales"
  | "household"
  | "kids"
  | "tech"
  | "creative"
  | "generic";

export interface SimpleJobDetection {
  jobKey: SimpleJobKey;
  jobLabel: string;  // ce qu'on affichera ("Serveur / Serveuse", "Graphiste"…)
  found: boolean;    // false = on laisse l'utilisateur écrire
}

const SIMPLE_JOB_PATTERNS: { key: SimpleJobKey; label: string; keywords: string[] }[] = [
  {
    key: "server",
    label: "Serveur / Serveuse",
    keywords: ["serveur", "serveuse", "service", "extra salle", "serveuse en salle"]
  },
  {
    key: "bartender",
    label: "Barman / Barmaid",
    keywords: ["barman", "barmaid", "bar", "cocktails"]
  },
  {
    key: "cook",
    label: "Cuisinier / Cuisinière",
    keywords: ["cuisinier", "cuisinière", "cuisine", "chef", "commis cuisine"]
  },
  {
    key: "delivery",
    label: "Livreur",
    keywords: ["livreur", "delivery", "uber eats", "just eat", "deliveroo"]
  },
  {
    key: "sales",
    label: "Vendeur / Vendeuse",
    keywords: ["vendeur", "vendeuse", "magasin", "boutique", "retail"]
  },
  {
    key: "dev_web",
    label: "Développeur web",
    keywords: ["développeur", "developpeur", "dev", "site web", "landing page"]
  },
  {
    key: "designer",
    label: "Graphiste / Designer",
    keywords: ["graphiste", "designer", "logo", "maquette", "flyer"]
  },
  {
    key: "community_manager",
    label: "Community manager",
    keywords: ["community manager", "cm", "réseaux sociaux", "instagram", "tiktok"]
  },
  // Métiers supplémentaires pour couvrir plus de cas
  {
    key: "kitchen_assistant",
    label: "Plongeur / Aide de cuisine",
    keywords: ["plonge", "plongeur", "plongeuse", "aide de cuisine"]
  },
  {
    key: "warehouse",
    label: "Préparateur de commandes",
    keywords: ["préparateur de commandes", "entrepôt", "logistique", "cariste"]
  },
  {
    key: "cashier",
    label: "Caissier / Caissière",
    keywords: ["caissier", "caissière", "caisse"]
  },
  {
    key: "host",
    label: "Hôte / Hôtesse",
    keywords: ["hôte", "hôtesse", "accueil", "réceptionniste"]
  },
  {
    key: "cleaning",
    label: "Agent d'entretien / Femme de ménage",
    keywords: ["ménage", "femme de ménage", "femme de menage", "nettoyage", "cleaning", "agent d'entretien", "agent entretien", "entretien", "nettoyeur", "nettoyeuse", "aide ménagère", "aide menagere", "aide-ménagère", "aide-menagere"]
  },
  {
    key: "babysitting",
    label: "Baby-sitter",
    keywords: ["babysitting", "baby-sitter", "garde d'enfants", "nounou"]
  },
  {
    key: "handyman",
    label: "Bricoleur / Artisan",
    keywords: ["bricoleur", "petits travaux", "dépannage", "handyman"]
  },
  {
    key: "real_estate",
    label: "Agent immobilier",
    keywords: ["agent immobilier", "agent immobillier", "conseiller immobilier", "négociateur immobilier", "mandataire immobilier", "immobilier", "immobillier", "real estate"]
  },
  {
    key: "photographer",
    label: "Photographe",
    keywords: ["photographe", "photographie", "photo", "photographer"]
  },
  {
    key: "writer",
    label: "Rédacteur / Rédactrice",
    keywords: ["rédacteur", "rédactrice", "copywriter", "rédaction", "writer", "écrivain"]
  },
  {
    key: "accountant",
    label: "Comptable",
    keywords: ["comptable", "expert-comptable", "accountant", "comptabilité"]
  },
  {
    key: "nurse",
    label: "Infirmier / Infirmière",
    keywords: ["infirmier", "infirmière", "aide-soignant", "aide soignante", "nurse", "soignant"]
  },
  {
    key: "teacher",
    label: "Professeur / Enseignant",
    keywords: ["professeur", "enseignant", "enseignante", "prof", "teacher", "cours particulier", "soutien scolaire"]
  }
];

export function detectSimpleJob(prompt: string): SimpleJobDetection {
  const lower = prompt.toLowerCase().trim();
  
  if (!lower) {
    return { jobKey: "custom", jobLabel: "", found: false };
  }

  console.log("[detectSimpleJob] DEBUG - prompt:", prompt);
  console.log("[detectSimpleJob] DEBUG - lower:", lower);

  // Priorité : chercher les métiers composés d'abord (ex: "agent immobilier")
  // On trie les patterns par longueur de keywords (les plus longs en premier)
  // IMPORTANT : on trie aussi les keywords de chaque pattern pour tester les plus longs d'abord
  const sortedPatterns = [...SIMPLE_JOB_PATTERNS].map(pattern => ({
    ...pattern,
    sortedKeywords: [...pattern.keywords].sort((a, b) => b.length - a.length)
  })).sort((a, b) => {
    const aMaxLen = Math.max(...a.keywords.map(k => k.length));
    const bMaxLen = Math.max(...b.keywords.map(k => k.length));
    return bMaxLen - aMaxLen;
  });

  for (const pattern of sortedPatterns) {
    // Cas spéciaux avec logique personnalisée
    if (pattern.key === "server") {
      // petit exemple : on autorise "étudiante dispo extras en restauration"
      if (
        lower.includes("restauration") &&
        (lower.includes("extra") || lower.includes("extras"))
      ) {
        console.log("[detectSimpleJob] ✅ Trouvé server via cas spécial");
        return { jobKey: "server", jobLabel: pattern.label, found: true };
      }
    }

    if (pattern.key === "dev_web") {
      if (lower.includes("site vitrine") || lower.includes("site internet") || lower.includes("développement web")) {
        console.log("[detectSimpleJob] ✅ Trouvé dev_web via cas spécial");
        return { jobKey: "dev_web", jobLabel: pattern.label, found: true };
      }
    }

    if (pattern.key === "community_manager") {
      if (lower.includes("réseaux sociaux") || lower.includes("social media")) {
        console.log("[detectSimpleJob] ✅ Trouvé community_manager via cas spécial");
        return {
          jobKey: "community_manager",
          jobLabel: pattern.label,
          found: true
        };
      }
    }

    // Vérifier si un des mots-clés est présent dans le texte
    // On cherche des correspondances exactes ou partielles
    // IMPORTANT : tester les keywords triés (les plus longs en premier) pour éviter les faux positifs
    for (const keyword of pattern.sortedKeywords || pattern.keywords) {
      // Correspondance exacte du mot-clé
      if (lower.includes(keyword)) {
        console.log("[detectSimpleJob] ✅ Trouvé", pattern.key, "via keyword:", keyword);
        return { jobKey: pattern.key, jobLabel: pattern.label, found: true };
      }
      
      // Pour les mots-clés composés, vérifier aussi les mots séparés
      const keywordWords = keyword.split(/\s+/);
      if (keywordWords.length > 1) {
        // Vérifier si tous les mots du mot-clé sont présents (dans l'ordre ou non)
        // On normalise les mots pour gérer les fautes d'orthographe courantes
        const allWordsPresent = keywordWords.every(word => {
          if (word.length < 3) return false;
          
          // Correspondance exacte
          if (lower.includes(word)) return true;
          
          // Gestion des fautes d'orthographe courantes
          // "immobilier" vs "immobillier" (double l)
          if (word === "immobilier") {
            return lower.includes("immobilier") || lower.includes("immobillier");
          }
          // "immobillier" (faute) -> détecter "immobilier"
          if (word === "immobillier") {
            return lower.includes("immobilier") || lower.includes("immobillier");
          }
          
          return false;
        });
        if (allWordsPresent) {
          console.log("[detectSimpleJob] ✅ Trouvé", pattern.key, "via mots séparés:", keywordWords);
          return { jobKey: pattern.key, jobLabel: pattern.label, found: true };
        }
      }
    }
  }

  // rien trouvé => on laisse l'utilisateur écrire lui-même le métier
  // MAIS on ne bloque pas : le LLM pourra gérer le métier même s'il n'est pas reconnu
  console.log("[detectSimpleJob] ❌ Aucun métier trouvé pour:", prompt);
  return { jobKey: "custom", jobLabel: "", found: false };
}

export function getRoleCategory(jobKey: SimpleJobKey): SimpleRoleCategory {
  switch (jobKey) {
    case "server":
    case "bartender":
    case "cook":
    case "kitchen_assistant":
      return "restaurant";

    case "delivery":
    case "warehouse":
      return "logistics";

    case "sales":
    case "cashier":
    case "host":
      return "sales";

    case "cleaning":
    case "handyman":
      return "household";

    case "babysitting":
      return "kids";

    case "dev_web":
      return "tech";

    case "designer":
    case "community_manager":
    case "photographer":
    case "writer":
      return "creative";

    case "real_estate":
    case "accountant":
      return "sales";

    case "nurse":
    case "teacher":
      return "generic";

    default:
      return "generic";
  }
}

