// jobEngine.ts
// Moteur de détection métier + contexte pour LMJ / UWi

/* ------------------------- TYPES DE BASE ------------------------- */

export type LangCode = "fr" | "en" | "ar";

export type UserRole = "recruiter" | "candidate" | "unknown";

export interface RoleDetection {
  role: UserRole;
  recruiterScore: number;
  candidateScore: number;
}

export interface JobLabelsByLang {
  fr: string[];
  en: string[];
  ar: string[];
}

export interface JobDefinition {
  key: string; // ex: "cook"
  labels: JobLabelsByLang;
  weight: number; // importance métier (1 = central)
}

export interface JobCategory {
  key: string; // ex: "restaurant"
  jobs: Record<string, JobDefinition>; // jobKey -> définition
}

export interface DetectedJob {
  jobKey: string;
  score: number;
  confidence: number; // 0–1
}

export interface JobContext {
  urgency?: "low" | "medium" | "high";
  duration?: "one_day" | "short" | "long";
  location?: string | null;
  temporal?: string | null; // soirée, week-end, etc.
}

export interface MissionReadiness {
  score: number; // 0–100
  status: "incomplete" | "almost_ready" | "ready";
  missing: string[];
}

export interface JobPattern {
  pattern: string[]; // tokens à retrouver
  jobKey: string;
  boost: number;
}

export interface AdvancedJobPattern {
  jobKey: string;
  includes?: string[];
  excludes?: string[];
  boost: number;
}

export interface JobDetectionLog {
  prompt_text: string;
  detectedJobs: DetectedJob[];
  readiness: MissionReadiness;
  usedLLM: boolean;
  location?: string | null;
  duration?: string | null;
  urgency?: string | null;
}

export type NeedDirection =
  | "demande_de_ressource"   // j'ai besoin de quelqu'un / quelque chose
  | "offre_de_competence"    // je propose mes services / dispo
  | "unknown";

export interface ParsedNeed {
  rawPrompt: string;
  jobCandidates: DetectedJob[];  // issus de detectJobsFromText
  primaryJob: DetectedJob | null;
  context: JobContext;           // lieu, durée, urgence, temporal
  direction: NeedDirection;       // interne, mais UX reste neutre
  readiness: MissionReadiness;   // à quel point le besoin est structuré
}

/* ------------------------- VOCABULAIRE METIERS ------------------------- */

export const JOB_SYNONYMS: Record<string, JobCategory> = {
  /* =========== RESTAURATION / HÔTELLERIE =========== */
  restaurant: {
    key: "restaurant",
    jobs: {
      server: {
        key: "server",
        labels: {
          fr: [
            "serveur",
            "serveuse",
            "serveur de restaurant",
            "serveuse de restaurant",
            "serveur resto",
            "serveuse resto",
            "chef de rang",
            "commis de salle",
            "garçon de café",
            "runner",
            "extra service",
            "extra restauration",
            "service en salle"
          ],
          en: [
            "waiter",
            "waitress",
            "restaurant waiter",
            "restaurant waitress",
            "server",
            "wait staff"
          ],
          ar: ["نادل", "نادلة", "نادل مطعم"]
        },
        weight: 1.0
      },
      cook: {
        key: "cook",
        labels: {
          fr: [
            "cuisinier",
            "cuisinière",
            "chef cuisinier",
            "chef cuisine",
            "chef",
            "commis de cuisine",
            "aide cuisinier",
            "aide-cuisinier",
            "plongeur cuisine",
            "plongeur"
          ],
          en: [
            "cook",
            "kitchen cook",
            "chef",
            "head chef",
            "line cook",
            "kitchen assistant"
          ],
          ar: ["طباخ", "طباخة", "شيف", "مساعد طباخ"]
        },
        weight: 1.0
      },
      bartender: {
        key: "bartender",
        labels: {
          fr: ["barman", "barmaid", "serveur bar", "serveuse bar", "bartender"],
          en: ["bartender", "barman", "bar staff"],
          ar: ["نادل بار"]
        },
        weight: 0.9
      },
      housekeeper: {
        key: "housekeeper",
        labels: {
          fr: [
            "femme de chambre",
            "valet de chambre",
            "agent d'entretien hôtel",
            "agent de nettoyage hôtel"
          ],
          en: ["housekeeper", "room attendant"],
          ar: ["عاملة تنظيف غرف", "منظف فندق"]
        },
        weight: 0.7
      }
    }
  },

  /* =========== LOGISTIQUE / TRANSPORT =========== */
  logistics: {
    key: "logistics",
    jobs: {
      warehouse_worker: {
        key: "warehouse_worker",
        labels: {
          fr: [
            "manutentionnaire",
            "manut",
            "préparateur de commandes",
            "préparateur commandes",
            "agent logistique",
            "magasinier",
            "cariste",
            "agent de quai"
          ],
          en: [
            "warehouse worker",
            "warehouseman",
            "order picker",
            "logistics assistant",
            "forklift driver"
          ],
          ar: ["عامل مستودع", "عامل تحميل", "عامل مخزن"]
        },
        weight: 0.95
      },
      delivery_driver: {
        key: "delivery_driver",
        labels: {
          fr: [
            "livreur",
            "livreur colis",
            "livreur vélo",
            "coursier",
            "chauffeur livreur"
          ],
          en: ["delivery driver", "courier", "driver", "delivery rider"],
          ar: ["سائق توصيل", "موصل طلبات"]
        },
        weight: 0.9
      },
      mover: {
        key: "mover",
        labels: {
          fr: ["déménageur", "aide déménageur"],
          en: ["mover", "moving helper"],
          ar: ["عامل نقل أثاث"]
        },
        weight: 0.7
      }
    }
  },

  /* =========== COMMERCE / VENTE / IMMOBILIER =========== */
  sales: {
    key: "sales",
    jobs: {
      shop_assistant: {
        key: "shop_assistant",
        labels: {
          fr: [
            "vendeur",
            "vendeuse",
            "vendeur magasin",
            "vendeuse magasin",
            "vendeur boutique",
            "conseiller de vente",
            "vendeur conseil"
          ],
          en: ["shop assistant", "sales assistant", "retail salesperson"],
          ar: ["بائع", "بائعة", "بائع في متجر"]
        },
        weight: 0.95
      },
      cashier: {
        key: "cashier",
        labels: {
          fr: ["caissier", "caissière", "hôte de caisse", "hôtesse de caisse"],
          en: ["cashier"],
          ar: ["أمين صندوق", "كاشير"]
        },
        weight: 0.8
      },
      real_estate_agent: {
        key: "real_estate_agent",
        labels: {
          fr: [
            "agent immobilier",
            "agent immo",
            "conseiller immobilier",
            "négociateur immobilier",
            "mandataire immobilier"
          ],
          en: ["real estate agent", "realtor", "property agent"],
          ar: ["وكيل عقاري", "سمسار عقارات"]
        },
        weight: 1.0
      }
    }
  },

  /* =========== BTP / TECHNIQUE / ÉNERGIE =========== */
  construction: {
    key: "construction",
    jobs: {
      construction_worker: {
        key: "construction_worker",
        labels: {
          fr: [
            "ouvrier bâtiment",
            "ouvrier btp",
            "manœuvre",
            "aide maçon",
            "aide chantier"
          ],
          en: ["construction worker", "laborer", "site worker"],
          ar: ["عامل بناء", "عامل ورشة"]
        },
        weight: 0.9
      },
      mason: {
        key: "mason",
        labels: {
          fr: ["maçon", "maçon coffreur", "maçon bancheur"],
          en: ["mason", "bricklayer"],
          ar: ["بنّاء"]
        },
        weight: 0.85
      },
      electrician: {
        key: "electrician",
        labels: {
          fr: ["électricien", "électricien bâtiment", "électricien chantier"],
          en: ["electrician"],
          ar: ["كهربائي"]
        },
        weight: 0.9
      },
      plumber: {
        key: "plumber",
        labels: {
          fr: ["plombier", "plombier chauffagiste", "chauffagiste"],
          en: ["plumber", "heating plumber"],
          ar: ["سبّاك", "فني تدفئة"]
        },
        weight: 0.9
      },
      solar_technician: {
        key: "solar_technician",
        labels: {
          fr: [
            "installateur panneaux solaires",
            "poseur panneaux solaires",
            "technicien photovoltaïque"
          ],
          en: ["solar panel installer", "pv technician"],
          ar: ["فني ألواح شمسية"]
        },
        weight: 0.8
      }
    }
  },

  /* =========== TECH / IT =========== */
  tech: {
    key: "tech",
    jobs: {
      web_developer: {
        key: "web_developer",
        labels: {
          fr: [
            "développeur web",
            "dev web",
            "développeur",
            "dev",
            "intégrateur web"
          ],
          en: [
            "web developer",
            "software developer",
            "developer",
            "fullstack developer"
          ],
          ar: ["مطور ويب", "مطور برامج"]
        },
        weight: 1.0
      },
      frontend_developer: {
        key: "frontend_developer",
        labels: {
          fr: ["développeur front", "dev front", "frontend"],
          en: ["frontend developer", "front-end developer"],
          ar: ["مطور واجهة أمامية"]
        },
        weight: 0.85
      },
      backend_developer: {
        key: "backend_developer",
        labels: {
          fr: ["développeur back", "dev back", "backend"],
          en: ["backend developer", "back-end developer"],
          ar: ["مطور خلفية"]
        },
        weight: 0.85
      },
      mobile_developer: {
        key: "mobile_developer",
        labels: {
          fr: [
            "développeur mobile",
            "dev mobile",
            "développeur ios",
            "développeur android"
          ],
          en: ["mobile developer", "android developer", "ios developer"],
          ar: ["مطور تطبيقات جوال"]
        },
        weight: 0.8
      },
      data_analyst: {
        key: "data_analyst",
        labels: {
          fr: ["data analyst", "analyste données"],
          en: ["data analyst"],
          ar: ["محلل بيانات"]
        },
        weight: 0.8
      },
      ai_engineer: {
        key: "ai_engineer",
        labels: {
          fr: ["ingénieur ia", "ai engineer", "machine learning engineer"],
          en: ["ai engineer", "machine learning engineer"],
          ar: ["مهندس ذكاء اصطناعي"]
        },
        weight: 0.8
      }
    }
  },

  /* =========== CRÉA / CONTENU / MARKETING =========== */
  creative: {
    key: "creative",
    jobs: {
      graphic_designer: {
        key: "graphic_designer",
        labels: {
          fr: ["graphiste", "designer graphique", "graphic designer"],
          en: ["graphic designer"],
          ar: ["مصمم جرافيك"]
        },
        weight: 0.85
      },
      ui_ux_designer: {
        key: "ui_ux_designer",
        labels: {
          fr: ["ui designer", "ux designer", "ui/ux designer"],
          en: ["ui designer", "ux designer", "product designer"],
          ar: ["مصمم واجهات وتجربة مستخدم"]
        },
        weight: 0.8
      },
      writer: {
        key: "writer",
        labels: {
          fr: [
            "rédacteur web",
            "rédacteur",
            "copywriter",
            "content writer",
            "rédacteur freelance"
          ],
          en: ["copywriter", "content writer", "web writer"],
          ar: ["كاتب محتوى", "كاتب"]
        },
        weight: 0.85
      },
      photographer: {
        key: "photographer",
        labels: {
          fr: ["photographe"],
          en: ["photographer"],
          ar: ["مصور"]
        },
        weight: 0.8
      },
      videographer: {
        key: "videographer",
        labels: {
          fr: ["vidéaste", "monteur vidéo", "video editor"],
          en: ["videographer", "video editor"],
          ar: ["مصور فيديو", "محرر فيديو"]
        },
        weight: 0.8
      },
      community_manager: {
        key: "community_manager",
        labels: {
          fr: ["community manager", "cm", "social media manager"],
          en: ["community manager", "social media manager"],
          ar: ["مدير مواقع التواصل الاجتماعي"]
        },
        weight: 0.9
      }
    }
  },

  /* =========== ADMIN / SUPPORT =========== */
  admin: {
    key: "admin",
    jobs: {
      admin_assistant: {
        key: "admin_assistant",
        labels: {
          fr: [
            "assistant administratif",
            "assistante administrative",
            "assistant de gestion"
          ],
          en: ["administrative assistant", "office assistant"],
          ar: ["مساعد إداري", "مساعدة إدارية"]
        },
        weight: 0.8
      },
      accountant: {
        key: "accountant",
        labels: {
          fr: ["comptable", "aide comptable"],
          en: ["accountant", "bookkeeper"],
          ar: ["محاسب"]
        },
        weight: 0.85
      },
      hr_assistant: {
        key: "hr_assistant",
        labels: {
          fr: ["assistant rh", "assistante rh", "chargé rh"],
          en: ["hr assistant", "hr officer"],
          ar: ["مساعد موارد بشرية"]
        },
        weight: 0.75
      }
    }
  },

  /* =========== ÉVÉNEMENTIEL / SÉCURITÉ =========== */
  events: {
    key: "events",
    jobs: {
      host_hostess: {
        key: "host_hostess",
        labels: {
          fr: ["hôte", "hôtesse", "hôte événementiel", "hôtesse événementielle"],
          en: ["host", "hostess", "event host"],
          ar: ["مضيف", "مضيفة"]
        },
        weight: 0.8
      },
      security_guard: {
        key: "security_guard",
        labels: {
          fr: ["agent de sécurité", "vigile"],
          en: ["security guard", "security officer"],
          ar: ["حارس أمن"]
        },
        weight: 0.75
      }
    }
  },

  /* =========== NETTOYAGE / AIDE A DOMICILE =========== */
  cleaning: {
    key: "cleaning",
    jobs: {
      cleaner: {
        key: "cleaner",
        labels: {
          fr: [
            "agent de nettoyage",
            "agent d'entretien",
            "femme de ménage",
            "homme de ménage",
            "ménage",
            "technicien de surface",
            "agent de propreté"
          ],
          en: ["cleaner", "house cleaner", "janitor", "cleaning staff"],
          ar: ["عامل نظافة", "عاملة نظافة"]
        },
        weight: 0.9
      }
    }
  },

  /* =========== GÉNÉRIQUE / FREELANCE =========== */
  generic: {
    key: "generic",
    jobs: {
      freelancer: {
        key: "freelancer",
        labels: {
          fr: ["freelance", "indépendant", "auto entrepreneur", "auto-entrepreneur"],
          en: ["freelancer", "independent contractor"],
          ar: ["مستقل", "عامل حر"]
        },
        weight: 0.6
      }
    }
  },

  /* =========== SANTÉ / MÉDECINE =========== */
  health: {
    key: "health",
    jobs: {
      nurse: {
        key: "nurse",
        labels: {
          fr: ["infirmier", "infirmière", "aide soignant", "aide-soignant", "as"],
          en: ["nurse", "nursing assistant", "care assistant"],
          ar: ["ممرض", "ممرضة", "مساعد تمريض"]
        },
        weight: 0.9
      },
      caregiver: {
        key: "caregiver",
        labels: {
          fr: ["aide à domicile", "auxiliaire de vie", "aide soignant à domicile", "avs"],
          en: ["caregiver", "home care assistant", "home health aide"],
          ar: ["مساعد رعاية منزلية", "مقدم رعاية"]
        },
        weight: 0.85
      },
      medical_assistant: {
        key: "medical_assistant",
        labels: {
          fr: ["assistant médical", "assistante médicale", "secrétaire médicale"],
          en: ["medical assistant", "clinical assistant"],
          ar: ["مساعد طبي"]
        },
        weight: 0.8
      }
    }
  },

  /* =========== ÉDUCATION / FORMATION =========== */
  education: {
    key: "education",
    jobs: {
      tutor: {
        key: "tutor",
        labels: {
          fr: ["professeur particulier", "tuteur", "soutien scolaire", "cours particulier"],
          en: ["tutor", "private teacher", "home tutor"],
          ar: ["مدرس خاص", "معلم خصوصي", "مدرس منزلي"]
        },
        weight: 0.85
      },
      trainer: {
        key: "trainer",
        labels: {
          fr: ["formateur", "formatrice", "animateur formation", "instructeur"],
          en: ["trainer", "instructor", "coach"],
          ar: ["مدرب", "مدرس", "مدرب تدريبي"]
        },
        weight: 0.8
      },
      language_teacher: {
        key: "language_teacher",
        labels: {
          fr: ["professeur de langue", "professeur anglais", "professeur français", "professeur espagnol"],
          en: ["language teacher", "english teacher", "language tutor"],
          ar: ["مدرس لغة", "معلم لغة"]
        },
        weight: 0.8
      }
    }
  },

  /* =========== JURIDIQUE / FINANCE =========== */
  legal_finance: {
    key: "legal_finance",
    jobs: {
      lawyer: {
        key: "lawyer",
        labels: {
          fr: ["avocat", "avocate", "juriste", "conseil juridique"],
          en: ["lawyer", "attorney", "legal advisor", "counsel"],
          ar: ["محامي", "محامية", "مستشار قانوني"]
        },
        weight: 0.9
      },
      financial_advisor: {
        key: "financial_advisor",
        labels: {
          fr: ["conseiller financier", "conseillère financière", "expert comptable", "comptable expert"],
          en: ["financial advisor", "accountant", "financial consultant"],
          ar: ["مستشار مالي", "محاسب", "خبير مالي"]
        },
        weight: 0.85
      },
      notary: {
        key: "notary",
        labels: {
          fr: ["notaire", "clerc de notaire"],
          en: ["notary", "notary public"],
          ar: ["كاتب عدل"]
        },
        weight: 0.8
      }
    }
  },

  /* =========== INDUSTRIE / MANUFACTURING =========== */
  industry: {
    key: "industry",
    jobs: {
      machine_operator: {
        key: "machine_operator",
        labels: {
          fr: ["opérateur machine", "opératrice machine", "conducteur machine", "opérateur production"],
          en: ["machine operator", "production operator", "equipment operator"],
          ar: ["عامل آلة", "مشغل آلة", "عامل إنتاج"]
        },
        weight: 0.85
      },
      quality_controller: {
        key: "quality_controller",
        labels: {
          fr: ["contrôleur qualité", "contrôleuse qualité", "qc", "inspecteur qualité"],
          en: ["quality controller", "qc inspector", "quality assurance"],
          ar: ["مراقب جودة", "مفتش جودة"]
        },
        weight: 0.8
      },
      welder: {
        key: "welder",
        labels: {
          fr: ["soudeur", "soudeuse", "soudure"],
          en: ["welder", "welding operator"],
          ar: ["لحام", "عامل لحام"]
        },
        weight: 0.85
      },
      forklift_operator: {
        key: "forklift_operator",
        labels: {
          fr: ["cariste", "conducteur chariot élévateur", "chauffeur chariot"],
          en: ["forklift operator", "forklift driver"],
          ar: ["سائق رافعة شوكية"]
        },
        weight: 0.8
      }
    }
  }
};

/* ------------------------- PATTERNS METIERS ------------------------- */

// Patterns simples (jobKey direct)
export const JOB_PATTERNS: JobPattern[] = [
  // Restauration
  { pattern: ["chef", "cuisinier"], jobKey: "cook", boost: 0.4 },
  { pattern: ["chef", "cuisine"], jobKey: "cook", boost: 0.3 },
  { pattern: ["extra", "soirée"], jobKey: "server", boost: 0.3 },
  { pattern: ["service", "mariage"], jobKey: "server", boost: 0.4 },
  { pattern: ["serveur", "événementiel"], jobKey: "server", boost: 0.5 },

  // Tech
  { pattern: ["développeur", "react"], jobKey: "frontend_developer", boost: 0.6 },
  { pattern: ["react", "freelance"], jobKey: "frontend_developer", boost: 0.5 },
  { pattern: ["fullstack", "js"], jobKey: "web_developer", boost: 0.5 },
  { pattern: ["mobile", "freelance"], jobKey: "mobile_developer", boost: 0.5 },

  // Logistique
  { pattern: ["livraison", "colis"], jobKey: "delivery_driver", boost: 0.4 },
  { pattern: ["préparation", "commandes"], jobKey: "warehouse_worker", boost: 0.5 },

  // Immobilier
  { pattern: ["vente", "appartement"], jobKey: "real_estate_agent", boost: 0.4 },
  { pattern: ["mandataire", "immo"], jobKey: "real_estate_agent", boost: 0.4 }
];

// Patterns avancés (includes / excludes contextuels)
export const JOB_PATTERNS_ADVANCED: AdvancedJobPattern[] = [
  {
    jobKey: "cook",
    includes: ["cuisine", "chaud"],
    excludes: ["bar"],
    boost: 0.4
  },
  {
    jobKey: "server",
    includes: ["service", "salle"],
    boost: 0.3
  },
  {
    jobKey: "bartender",
    includes: ["bar", "cocktail"],
    excludes: ["cuisine"],
    boost: 0.5
  },
  {
    jobKey: "frontend_developer",
    includes: ["react", "vue", "interface", "ui"],
    excludes: ["backend"],
    boost: 0.6
  },
  {
    jobKey: "backend_developer",
    includes: ["api", "node", "database", "sql"],
    excludes: ["design", "ui"],
    boost: 0.6
  }
];

/* ------------------------- TOKENISATION ------------------------- */

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0600-\u06FF\s]/gi, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/* ------------------------- DETECTION ROLE UTILISATEUR ------------------------- */

export function detectUserRole(text: string): RoleDetection {
  const lower = text.toLowerCase();
  const tokens = tokenize(text);

  let recruiterScore = 0;
  let candidateScore = 0;

  // --- RECRUTEUR : FR ---

  // "nous recherchons / nous recrutons / on cherche ..."
  if (
    /nous\s+(recherchons|recrutons|cherchons)/.test(lower) ||
    /on\s+cherche/.test(lower)
  ) {
    recruiterScore += 3;
  }

  // "je recrute", "je recherche un serveur"
  if (/je\s+(recrute|recherche)\s+un[e]?\s+/.test(lower)) {
    recruiterScore += 2;
  }

  // "je cherche quelqu'un / une personne"
  if (/je\s+cherche\s+(quelqu'un|une personne|du monde)/.test(lower)) {
    recruiterScore += 2;
  }

  // "je cherche un serveur / développeur" (sans "poste"/"job")
  if (
    /je\s+cherche\s+un[e]?\s+[a-zéèêàîïôûç]+/.test(lower) &&
    !/poste|job|emploi|boulot|travail|mission/.test(lower)
  ) {
    recruiterScore += 1.5;
  }

  // mots typiques recruteur
  if (
    tokens.some(t =>
      [
        "recrute",
        "recrutons",
        "recrutement",
        "candidatures",
        "mon equipe",
        "mon équipe",
        "notre restaurant",
        "notre societé",
        "notre société",
        "mon restaurant",
        "mon entreprise",
        "pour mon client",
        "pour un de nos clients"
      ].includes(t)
    )
  ) {
    recruiterScore += 1.5;
  }

  // --- RECRUTEUR : ENGLISH ---

  if (
    /we\s+are\s+(hiring|looking\s+for)/.test(lower) ||
    /we\s+need\s+a\s+/.test(lower)
  ) {
    recruiterScore += 3;
  }

  if (/i\s+need\s+(someone|a\s+developer|a\s+waiter)/.test(lower)) {
    recruiterScore += 1.5;
  }

  // --- RECRUTEUR : AR (simple) ---

  if (/نبحث عن/.test(text)) {
    recruiterScore += 3;
  }

  // --- CANDIDAT / FREELANCE : FR ---

  // "je cherche un poste / job / emploi / boulot / travail"
  if (
    /je\s+cherche\s+un[e]?\s+(poste|job|emploi|boulot|travail|stage)/.test(
      lower
    )
  ) {
    candidateScore += 3;
  }

  if (/je\s+cherche\s+du\s+travail/.test(lower)) {
    candidateScore += 3;
  }

  // "à la recherche d'un poste / job"
  if (
    /a la recherche d'un[e]?\s+(poste|job|emploi|travail)/.test(lower)
  ) {
    candidateScore += 2.5;
  }

  // "je suis [métier] et je cherche une mission"
  if (
    /je\s+suis\s+[a-zéèêàîïôûç]+\s+et\s+je\s+cherche\s+/.test(lower) &&
    /mission|poste|job|emploi|travail/.test(lower)
  ) {
    candidateScore += 2.5;
  }

  // Freelance dispo / propose mes services
  if (
    /freelance/.test(lower) &&
    (/dispo/.test(lower) || /disponible/.test(lower))
  ) {
    candidateScore += 2;
  }

  if (/je\s+propose\s+mes\s+services/.test(lower)) {
    candidateScore += 2;
  }

  // "open to work", "open to opportunities"
  if (/open to work|open to opportunities/.test(lower)) {
    candidateScore += 2.5;
  }

  // mots typiques candidat
  if (
    /mon cv|cv en piece jointe|cv en pièce jointe|mon profil/.test(
      lower
    )
  ) {
    candidateScore += 1.5;
  }

  // --- CANDIDAT : ENGLISH ---

  if (
    /i'?m\s+looking\s+for\s+a\s+(job|position|role)/.test(lower) ||
    /looking\s+for\s+a\s+job/.test(lower)
  ) {
    candidateScore += 3;
  }

  if (
    /i\s+am\s+a\s+[a-z]+\s+and\s+i\s+am\s+looking\s+for\s+(a\s+job|work|freelance|missions?)/.test(
      lower
    )
  ) {
    candidateScore += 2.5;
  }

  if (
    /available\s+for\s+freelance/.test(lower) ||
    /available\s+for\s+missions?/.test(lower)
  ) {
    candidateScore += 2;
  }

  // --- CANDIDAT : AR (simple) ---

  if (/أبحث عن عمل/.test(text) || /ابحث عن عمل/.test(text)) {
    candidateScore += 3;
  }

  // --- Normalisation / décision ---

  // petit bonus si le texte contient "je suis" + métier sans "je recrute"
  if (/je\s+suis\s+[a-zéèêàîïôûç]+\b/.test(lower) && !/je\s+recrute/.test(lower)) {
    candidateScore += 1;
  }

  let role: UserRole = "unknown";

  if (recruiterScore === 0 && candidateScore === 0) {
    role = "unknown";
  } else if (recruiterScore >= candidateScore + 1) {
    role = "recruiter";
  } else if (candidateScore >= recruiterScore + 1) {
    role = "candidate";
  } else {
    role = "unknown";
  }

  return { role, recruiterScore, candidateScore };
}

/* ------------------------- DETECTION METIERS ------------------------- */

export function detectJobsFromText(text: string): DetectedJob[] {
  const tokens = tokenize(text);
  const scores: Record<string, number> = {};

  // 1. Matching synonymes
  for (const category of Object.values(JOB_SYNONYMS)) {
    for (const job of Object.values(category.jobs)) {
      const allLabels = [
        ...job.labels.fr,
        ...job.labels.en,
        ...job.labels.ar
      ].map(l =>
        l
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
      );

      for (const label of allLabels) {
        const labelTokens = label.split(/\s+/);
        if (labelTokens.every(t => tokens.includes(t))) {
          scores[job.key] = (scores[job.key] || 0) + job.weight;
        }
      }
    }
  }

  // 2. Boost via JOB_PATTERNS
  for (const pattern of JOB_PATTERNS) {
    if (pattern.pattern.every(t => tokens.includes(t))) {
      scores[pattern.jobKey] = (scores[pattern.jobKey] || 0) + pattern.boost;
    }
  }

  // 3. Boost via JOB_PATTERNS_ADVANCED
  for (const pattern of JOB_PATTERNS_ADVANCED) {
    const hasIncludes =
      !pattern.includes || pattern.includes.every(t => tokens.includes(t));
    const hasExcludes =
      pattern.excludes && pattern.excludes.some(t => tokens.includes(t));
    if (hasIncludes && !hasExcludes) {
      scores[pattern.jobKey] = (scores[pattern.jobKey] || 0) + pattern.boost;
    }
  }

  const maxScore = Object.values(scores).reduce(
    (max, s) => (s > max ? s : max),
    0
  );

  return Object.entries(scores)
    .map(([jobKey, score]) => ({
      jobKey,
      score,
      confidence: maxScore ? Math.min(1, score / maxScore) : 0
    }))
    .sort((a, b) => b.score - a.score);
}

/* ------------------------- CONTEXTE (urgence, durée, lieu) ------------------------- */

function detectUrgency(tokens: string[]): JobContext["urgency"] {
  if (tokens.some(t => ["urgent", "asap", "immediat", "immédiat"].includes(t)))
    return "high";
  if (tokens.some(t => ["rapidement", "vite", "des que possible"].includes(t)))
    return "medium";
  return "low";
}

function detectDuration(tokens: string[]): JobContext["duration"] | undefined {
  if (tokens.some(t => ["soir", "soiree", "soirée", "journee", "demi-journee", "demi-journée"].includes(t)))
    return "one_day";
  if (tokens.some(t => ["semaine", "quelques", "jours"].includes(t)))
    return "short";
  if (tokens.some(t => ["mois", "long", "long terme"].includes(t)))
    return "long";
  return undefined;
}

// Très simple : "à Lille", "a Paris" → Lille, Paris
// Liste des villes connues (France et Belgique)
const KNOWN_CITIES = [
  "Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg",
  "Montpellier", "Bordeaux", "Lille", "Rennes", "Reims", "Grenoble", "Dijon",
  "Angers", "Nîmes", "Villeurbanne", "Saint-Étienne", "Toulon", "Le Havre",
  "Clermont-Ferrand", "Aix-en-Provence", "Rouen", "Nancy", "Metz", "Mulhouse",
  "Caen", "Tours", "Orléans", "Amiens", "Limoges", "Besançon", "Perpignan",
  "Boulogne-Billancourt", "Nanterre", "Créteil", "Courbevoie", "Colombes",
  "Argenteuil", "Montreuil", "Saint-Denis", "Vitry-sur-Seine",
  "Bruxelles", "Brussels", "Anvers", "Antwerpen", "Gand", "Gent", "Liège",
  "Namur", "Charleroi", "Louvain", "Leuven", "Bruges", "Brugge", "Mons",
  "Tournai", "Arlon", "La Louvière", "Hasselt", "Courtrai", "Kortrijk",
  "Wavre", "Ottignies", "Nivelles", "Verviers", "Seraing", "Mouscron",
  "Ostende", "Oostende", "Roulers", "Roeselare", "Malines", "Mechelen",
  "Genk", "Aalst", "Alost", "Saint-Nicolas", "Sint-Niklaas"
].map(city => city.toLowerCase());

function detectLocation(text: string): string | null {
  if (!text) return null;

  const lower = text.toLowerCase().trim();

  // 1) D'abord : chercher une ville connue dans le texte (insensible à la casse)
  // On cherche avec un word boundary pour éviter les faux positifs
  for (const city of KNOWN_CITIES) {
    // Utiliser un regex avec word boundary pour une meilleure précision
    const cityRegex = new RegExp(`\\b${city.replace(/[-\s]/g, '[\\s-]?')}\\b`, 'i');
    if (cityRegex.test(lower)) {
      // On renvoie avec la première lettre en majuscule
      return city.charAt(0).toUpperCase() + city.slice(1);
    }
  }

  // 2) Ensuite : chercher un motif du type "à Paris", "sur Lyon", "près de Marseille"
  // Pattern amélioré : accepte majuscule ou minuscule après la préposition
  const pattern =
    /\b(?:à|a|sur|vers|près\s+de|proche\s+de|dans\s+la\s+région\s+de)\s+([A-ZÀ-ÖØ-Ýa-zà-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ' -]+)/i;
  const match = text.match(pattern);
  if (match && match[1]) {
    // Nettoyage léger
    const raw = match[1].trim();
    // On coupe si il y a une virgule après
    const city = raw.split(",")[0].trim().split(/\s+/)[0]; // Prendre seulement le premier mot
    // Vérifier si c'est une ville connue
    const cityLower = city.toLowerCase();
    for (const knownCity of KNOWN_CITIES) {
      if (cityLower === knownCity || cityLower.startsWith(knownCity) || knownCity.startsWith(cityLower)) {
        return knownCity.charAt(0).toUpperCase() + knownCity.slice(1);
      }
    }
    // Sinon, capitaliser la première lettre
    return city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
  }

  // 3) Fallback : chercher un mot capitalisé isolé après "à" ou "sur"
  const simpleMatch = text.match(/\b(?:à|a|sur)\s+([A-ZÀ-ÖØ-Ýa-zà-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ' -]+)/i);
  if (simpleMatch && simpleMatch[1]) {
    const city = simpleMatch[1].split(",")[0].trim().split(/\s+/)[0];
    const cityLower = city.toLowerCase();
    // Vérifier si c'est une ville connue
    for (const knownCity of KNOWN_CITIES) {
      if (cityLower === knownCity || cityLower.startsWith(knownCity) || knownCity.startsWith(cityLower)) {
        return knownCity.charAt(0).toUpperCase() + knownCity.slice(1);
      }
    }
    return city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
  }

  return null;
}

export function extractContext(text: string): JobContext {
  const tokens = tokenize(text);

  return {
    urgency: detectUrgency(tokens),
    duration: detectDuration(tokens),
    location: detectLocation(text),
    temporal:
      tokens.find(t =>
        ["soir", "soiree", "soirée", "week-end", "weekend", "matin"].includes(t)
      ) || null
  };
}

/* ------------------------- MISSION READINESS ------------------------- */

export function computeMissionReadiness(
  detectedJobs: DetectedJob[],
  ctx: JobContext
): MissionReadiness {
  let score = 0;
  const missing: string[] = [];

  // Métier
  if (detectedJobs.length && detectedJobs[0].confidence >= 0.6) {
    score += 30;
  } else {
    missing.push("métier");
  }

  // Lieu
  if (ctx.location) score += 20;
  else missing.push("lieu");

  // Durée / temporalité
  if (ctx.duration || ctx.temporal) score += 20;
  else missing.push("durée");

  // Urgence
  if (ctx.urgency) score += 10;

  // Confiance globale
  if (detectedJobs.length && detectedJobs[0].confidence >= 0.8) {
    score += 20;
  }

  let status: MissionReadiness["status"] = "incomplete";
  if (score >= 80) status = "ready";
  else if (score >= 50) status = "almost_ready";

  return { score, status, missing };
}

/* ------------------------- DIAGNOSTIC D'INCERTITUDE ------------------------- */

export function isJobDetectionUncertain(detected: DetectedJob[]): boolean {
  if (!detected.length) return true;
  if (detected[0].confidence < 0.5) return true;
  if (
    detected.length > 1 &&
    Math.abs(detected[0].confidence - detected[1].confidence) < 0.15
  )
    return true;
  return false;
}

/* ------------------------- DÉTECTION D'INTENTION (INTENT GUARD) ------------------------- */

export type IntentType = "need_external" | "personal_search" | "ambiguous";

/**
 * Détecte l'intention du prompt utilisateur AVANT génération d'annonce.
 * 
 * - "need_external" : L'utilisateur cherche quelqu'un (recruteur)
 * - "personal_search" : L'utilisateur cherche du travail (candidat)
 * - "ambiguous" : Intention incertaine, nécessite clarification
 * 
 * Cette fonction doit être appelée AVANT toute génération d'annonce pour éviter
 * de générer une annonce recruteur quand l'utilisateur exprime une recherche personnelle.
 */
export function detectIntent(text: string): IntentType {
  const lower = text.toLowerCase().trim();

  // 1) patterns typiques "je cherche un job / je cherche du travail / extra"
  if (
    /je\s+cherche\s+un[e]?\s+(job|poste|emploi|boulot|travail|extra|extras?)/.test(lower) ||
    /je\s+cherche\s+du\s+travail/.test(lower) ||
    /a la recherche d'un[e]?\s+(job|poste|emploi)/.test(lower) ||
    /je\s+cherche\s+(un|des)\s+extra/.test(lower)
  ) {
    return "personal_search";
  }

  // 2) profil perso + dispo / missions
  if (
    /je\s+suis\s+[a-zéèêàîïôûç]+\s+et\s+je\s+cherche/.test(lower) ||
    /freelance/.test(lower) && /dispo|disponible|missions?/.test(lower) ||
    /open to work|open to opportunities/.test(lower)
  ) {
    return "personal_search";
  }

  // 3) cas "étudiant / étudiante" spécifique
  if (/je\s+suis\s+(une|un)\s+(étudiant|étudiante|etudiante)/i.test(lower)) {
    // si derrière il y a "je cherche un extra / job"
    if (/je\s+cherche/.test(lower)) {
      return "personal_search";
    }
  }
  
  // 3b) cas "je suis étudiante" (sans article)
  if (/je\s+suis\s+(étudiant|étudiante|etudiante)/i.test(lower)) {
    // si derrière il y a "je cherche"
    if (/je\s+cherche/.test(lower)) {
      return "personal_search";
    }
  }

  // 4) patterns typiques "je cherche quelqu'un / nous recrutons" → besoin externe
  if (
    /nous\s+(recherchons|recrutons|cherchons)/.test(lower) ||
    /on\s+cherche\s+/.test(lower) ||
    /je\s+cherche\s+(un|une)\s+(serveur|serveuse|cuisinier|développeur|dev|graphiste)/.test(
      lower
    ) ||
    /restaurant|magasin|notre entreprise|mon restaurant|mon client/.test(lower)
  ) {
    return "need_external";
  }

  // 5) si c'est très court ou juste un mot → ambigu
  const tokenCount = lower.split(/\s+/).filter(Boolean).length;
  if (tokenCount <= 3) {
    return "ambiguous";
  }

  // 6) fallback : si aucun signal clair → ambiguous
  return "ambiguous";
}

export function isRoleUncertain(
  recruiterScore: number,
  candidateScore: number
): boolean {
  if (recruiterScore === 0 && candidateScore === 0) return true;

  const diff = Math.abs(recruiterScore - candidateScore);

  // seuil que tu peux ajuster
  return diff < 1.5;
}

/* ------------------------- LLM FALLBACK (logique) ------------------------- */

export function shouldCallLLM(
  jobs: DetectedJob[],
  readiness: MissionReadiness
): boolean {
  if (!jobs.length) return true;
  if (jobs[0].confidence < 0.45) return true;
  if (readiness.status === "incomplete") return true;
  return false;
}

/* ------------------------- GENERATION DE TEMPLATE D'ANNONCE ------------------------- */

export interface JobTemplate {
  title: string;
  description: string;
  requirements: string[];
}

const COOK_TEMPLATE = (ctx: JobContext): JobTemplate => ({
  title: `Recherche cuisinier${
    ctx.duration === "one_day" ? " pour une mission ponctuelle" : ""
  }`,
  description: `Nous recherchons un cuisinier pour ${
    ctx.temporal || "un service"
  }${ctx.location ? ` à ${ctx.location}` : ""}.`,
  requirements: [
    "Expérience en cuisine",
    "Capacité à travailler sous pression",
    "Ponctualité et sérieux"
  ]
});

const FRONTEND_TEMPLATE = (ctx: JobContext): JobTemplate => ({
  title: "Recherche développeur Frontend freelance",
  description: `Mission ${
    ctx.duration === "long" ? "long terme" : "ponctuelle"
  }${ctx.location ? ` à ${ctx.location}` : ""}.`,
  requirements: [
    "Expérience React ou Vue",
    "Autonomie",
    "Bon niveau en intégration"
  ]
});

export function generateJobTemplate(
  jobKey: string,
  ctx: JobContext
): JobTemplate {
  switch (jobKey) {
    case "cook":
      return COOK_TEMPLATE(ctx);
    case "frontend_developer":
      return FRONTEND_TEMPLATE(ctx);
    default:
      return {
        title: "Votre mission",
        description:
          "Décrivez votre besoin (métier, lieu, date, horaires, rémunération).",
        requirements: []
      };
  }
}

/* ------------------------- LOGGING (à brancher sur ton API) ------------------------- */

export async function logJobDetection(
  log: JobDetectionLog
): Promise<void> {
  const primary = log.detectedJobs[0];

  const payload = {
    prompt_text: log.prompt_text,
    primary_job_key: primary?.jobKey ?? null,
    primary_confidence: primary?.confidence ?? null,
    secondary_jobs: log.detectedJobs.slice(1),
    readiness_score: log.readiness.score,
    readiness_status: log.readiness.status,
    readiness_missing: log.readiness.missing,
    location: log.location ?? null,
    duration: log.duration ?? null,
    urgency: log.urgency ?? null,
    used_llm: log.usedLLM,
    user_agent:
      typeof navigator !== "undefined" ? navigator.userAgent : null,
    path:
      typeof window !== "undefined" ? window.location.pathname : null,
    raw: log
  };

  // Récupérer l'URL Supabase
  const supabaseUrl = typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL
    ? import.meta.env.VITE_SUPABASE_URL
    : null;
  
  if (!supabaseUrl) {
    return; // Ignorer silencieusement si pas d'URL
  }

  const apiUrl = `${supabaseUrl}/functions/v1/job-detection-logs`;

  try {
    // Utiliser sendBeacon si disponible (plus fiable)
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      navigator.sendBeacon(apiUrl, blob);
    } else {
      await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true
      });
    }
  } catch {
    // On ne casse jamais l'UX pour un log
  }
}

/* ------------------------- MAPPING ROLE VERS DIRECTION ------------------------- */

export function mapRoleToDirection(role: "recruiter" | "candidate" | "unknown"): NeedDirection {
  if (role === "recruiter") return "demande_de_ressource";
  if (role === "candidate") return "offre_de_competence";
  return "unknown";
}

/* ------------------------- FONCTION ORCHESTRATEUR UNIQUE ------------------------- */

export async function analyzeNeedPrompt(prompt: string): Promise<ParsedNeed> {
  const context = extractContext(prompt);
  const jobCandidates = detectJobsFromText(prompt);
  const readiness = computeMissionReadiness(jobCandidates, context);

  const roleDetection = detectUserRole(prompt);
  const direction = mapRoleToDirection(roleDetection.role);

  await logJobDetection({
    prompt_text: prompt,
    detectedJobs: jobCandidates,
    readiness,
    usedLLM: false,
    location: context.location,
    duration: context.duration,
    urgency: context.urgency
  });

  return {
    rawPrompt: prompt,
    jobCandidates,
    primaryJob: jobCandidates[0] || null,
    context,
    direction,
    readiness
  };
}

/* ------------------------- LLM INTEGRATION ------------------------- */

export interface LLMJobSuggestion {
  primaryJob?: string | null;
  secondaryJob?: string | null;
  missing?: string[]; // ["location", "duration", ...]
}

// Fusion simple entre ton moteur et la réponse LLM
export function mergeLLMJobSuggestion(
  detectedJobs: DetectedJob[],
  llm: LLMJobSuggestion | null
): DetectedJob[] {
  if (!llm || !llm.primaryJob) return detectedJobs;

  const existing = detectedJobs.find(j => j.jobKey === llm.primaryJob);
  if (existing) {
    // on remonte ce job en premier
    return [
      existing,
      ...detectedJobs.filter(j => j.jobKey !== llm.primaryJob)
    ];
  }

  // sinon on l'ajoute avec une confiance moyenne
  return [
    { jobKey: llm.primaryJob, score: 0.6, confidence: 0.6 },
    ...detectedJobs
  ];
}

