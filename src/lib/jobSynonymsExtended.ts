/**
 * Structure étendue de synonymes de métiers
 * Support multi-langues et catégorisation complète
 */

// 🔹 Types de base
export type LangCode = "fr" | "en" | "ar";

export interface JobLabelsByLang {
  fr: string[];
  en: string[];
  ar: string[];
}

export interface JobDefinition {
  key: string; // ex: "server"
  labels: JobLabelsByLang;
  weight: number; // importance métier (1 = très central)
}

export interface JobCategory {
  key: string; // ex: "restaurant"
  jobs: Record<string, JobDefinition>; // jobKey -> définition
}

export const JOB_SYNONYMS: Record<string, JobCategory> = {
  // ============================================================
  // RESTAURATION / HÔTELLERIE
  // ============================================================
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
            "extra restauration"
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

  // ============================================================
  // LOGISTIQUE / TRANSPORT
  // ============================================================
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

  // ============================================================
  // COMMERCE / VENTE / IMMOBILIER
  // ============================================================
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

  // ============================================================
  // BTP / TECHNIQUE
  // ============================================================
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
          fr: [
            "plombier",
            "plombier chauffagiste",
            "chauffagiste"
          ],
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

  // ============================================================
  // TECH / IT
  // ============================================================
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

  // ============================================================
  // CRÉATION / CONTENU
  // ============================================================
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
      }
    }
  },

  // ============================================================
  // MARKETING / COMMUNICATION
  // ============================================================
  marketing: {
    key: "marketing",
    jobs: {
      community_manager: {
        key: "community_manager",
        labels: {
          fr: ["community manager", "cm", "social media manager"],
          en: ["community manager", "social media manager"],
          ar: ["مدير مواقع التواصل الاجتماعي"]
        },
        weight: 0.9
      },
      marketing_manager: {
        key: "marketing_manager",
        labels: {
          fr: ["responsable marketing", "chargé marketing", "chef de projet marketing"],
          en: ["marketing manager", "marketing specialist"],
          ar: ["مسؤول تسويق"]
        },
        weight: 0.8
      },
      seo_specialist: {
        key: "seo_specialist",
        labels: {
          fr: ["consultant seo", "seo manager", "référenceur"],
          en: ["seo specialist", "seo consultant"],
          ar: ["متخصص سيو"]
        },
        weight: 0.75
      }
    }
  },

  // ============================================================
  // ADMIN / SUPPORT
  // ============================================================
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

  // ============================================================
  // ÉVÉNEMENTIEL / SÉCURITÉ
  // ============================================================
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

  // ============================================================
  // NETTOYAGE / ENTRETIEN
  // ============================================================
  cleaning: {
    key: "cleaning",
    jobs: {
      cleaner: {
        key: "cleaner",
        labels: {
          fr: [
            "agent de nettoyage",
            "agent d'entretien",
            "nettoyage",
            "femme de ménage",
            "homme de ménage",
            "ménage",
            "technicien de surface",
            "agent de propreté"
          ],
          en: [
            "cleaner",
            "house cleaner",
            "janitor",
            "cleaning staff"
          ],
          ar: ["عامل نظافة", "عاملة نظافة"]
        },
        weight: 0.9
      },
      industrial_cleaner: {
        key: "industrial_cleaner",
        labels: {
          fr: [
            "nettoyage industriel",
            "nettoyage usine",
            "nettoyage fin de chantier"
          ],
          en: ["industrial cleaner", "post construction cleaning"],
          ar: ["تنظيف صناعي"]
        },
        weight: 0.85
      }
    }
  },

  // ============================================================
  // TRANSPORT
  // ============================================================
  transport: {
    key: "transport",
    jobs: {
      driver: {
        key: "driver",
        labels: {
          fr: ["chauffeur", "conducteur"],
          en: ["driver"],
          ar: ["سائق"]
        },
        weight: 0.85
      },
      vtc_driver: {
        key: "vtc_driver",
        labels: {
          fr: ["chauffeur vtc", "vtc", "chauffeur privé"],
          en: ["private driver", "vtc driver"],
          ar: ["سائق خاص"]
        },
        weight: 0.85
      },
      truck_driver: {
        key: "truck_driver",
        labels: {
          fr: ["chauffeur poids lourd", "chauffeur camion"],
          en: ["truck driver", "lorry driver"],
          ar: ["سائق شاحنة"]
        },
        weight: 0.9
      }
    }
  },

  // ============================================================
  // SANTÉ
  // ============================================================
  health: {
    key: "health",
    jobs: {
      nurse: {
        key: "nurse",
        labels: {
          fr: ["infirmier", "infirmière"],
          en: ["nurse"],
          ar: ["ممرض", "ممرضة"]
        },
        weight: 0.9
      },
      caregiver: {
        key: "caregiver",
        labels: {
          fr: [
            "aide soignant",
            "aide-soignant",
            "auxiliaire de vie",
            "aide à domicile"
          ],
          en: ["caregiver", "home care assistant"],
          ar: ["مساعد صحي", "مساعد رعاية"]
        },
        weight: 0.85
      }
    }
  },

  // ============================================================
  // ÉDUCATION
  // ============================================================
  education: {
    key: "education",
    jobs: {
      teacher: {
        key: "teacher",
        labels: {
          fr: [
            "professeur",
            "enseignant",
            "formateur",
            "formateur freelance"
          ],
          en: ["teacher", "trainer", "instructor"],
          ar: ["مدرس", "مكون"]
        },
        weight: 0.85
      },
      tutor: {
        key: "tutor",
        labels: {
          fr: ["professeur particulier", "soutien scolaire"],
          en: ["private tutor"],
          ar: ["أستاذ خاص"]
        },
        weight: 0.8
      },
      coach: {
        key: "coach",
        labels: {
          fr: [
            "coach",
            "coach professionnel",
            "coach business",
            "coach personnel"
          ],
          en: ["coach", "business coach", "life coach"],
          ar: ["مدرب"]
        },
        weight: 0.75
      }
    }
  },

  // ============================================================
  // JURIDIQUE / FINANCE
  // ============================================================
  legal_finance: {
    key: "legal_finance",
    jobs: {
      lawyer: {
        key: "lawyer",
        labels: {
          fr: ["avocat", "avocate"],
          en: ["lawyer", "attorney"],
          ar: ["محامي"]
        },
        weight: 0.9
      },
      legal_consultant: {
        key: "legal_consultant",
        labels: {
          fr: ["juriste", "consultant juridique"],
          en: ["legal consultant", "legal advisor"],
          ar: ["مستشار قانوني"]
        },
        weight: 0.85
      },
      financial_consultant: {
        key: "financial_consultant",
        labels: {
          fr: [
            "consultant financier",
            "conseiller financier",
            "gestionnaire de patrimoine"
          ],
          en: ["financial consultant", "financial advisor"],
          ar: ["مستشار مالي"]
        },
        weight: 0.85
      }
    }
  },

  // ============================================================
  // INDUSTRIE
  // ============================================================
  industry: {
    key: "industry",
    jobs: {
      technician: {
        key: "technician",
        labels: {
          fr: [
            "technicien",
            "technicien de maintenance",
            "technicien sav"
          ],
          en: ["technician", "maintenance technician"],
          ar: ["تقني", "فني صيانة"]
        },
        weight: 0.85
      },
      mechanic: {
        key: "mechanic",
        labels: {
          fr: ["mécanicien", "mécanicien automobile"],
          en: ["mechanic", "auto mechanic"],
          ar: ["ميكانيكي"]
        },
        weight: 0.85
      }
    }
  },

  // ============================================================
  // DIVERTISSEMENT
  // ============================================================
  entertainment: {
    key: "entertainment",
    jobs: {
      animator: {
        key: "animator",
        labels: {
          fr: [
            "animateur",
            "animatrice",
            "animateur événementiel"
          ],
          en: ["event host", "animator"],
          ar: ["منشط"]
        },
        weight: 0.8
      },
      dj: {
        key: "dj",
        labels: {
          fr: ["dj", "disc jockey"],
          en: ["dj", "disc jockey"],
          ar: ["دي جي"]
        },
        weight: 0.8
      },
      musician: {
        key: "musician",
        labels: {
          fr: ["musicien", "musicienne", "groupe de musique"],
          en: ["musician", "band"],
          ar: ["موسيقي"]
        },
        weight: 0.75
      }
    }
  },

  // ============================================================
  // FREELANCE / GÉNÉRIQUE
  // ============================================================
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

  // ============================================================
  // GÉNÉRIQUE SOFT
  // ============================================================
  soft_generic: {
    key: "soft_generic",
    jobs: {
      assistant: {
        key: "assistant",
        labels: {
          fr: ["assistant", "assistante"],
          en: ["assistant"],
          ar: ["مساعد"]
        },
        weight: 0.5
      },
      operator: {
        key: "operator",
        labels: {
          fr: ["opérateur", "opératrice"],
          en: ["operator"],
          ar: ["مشغل"]
        },
        weight: 0.5
      },
      worker: {
        key: "worker",
        labels: {
          fr: ["ouvrier", "employé"],
          en: ["worker", "employee"],
          ar: ["عامل"]
        },
        weight: 0.4
      }
    }
  }
};

/**
 * Patterns de détection pour combinaisons de mots
 */
export interface JobPattern {
  pattern: string[];      // tokens à retrouver
  jobKey: string;         // clé métier (ex: "cook")
  boost: number;          // bonus de score
}

export interface AdvancedJobPattern {
  jobKey: string;
  includes?: string[];     // mots attendus
  excludes?: string[];     // mots incompatibles
  boost: number;
}

export const JOB_PATTERNS: JobPattern[] = [
  // Restauration
  { pattern: ["chef", "cuisinier"], jobKey: "cook", boost: 0.4 },
  { pattern: ["chef", "cuisine"], jobKey: "cook", boost: 0.3 },
  { pattern: ["extra", "soiree"], jobKey: "server", boost: 0.3 },
  { pattern: ["service", "mariage"], jobKey: "server", boost: 0.4 },
  { pattern: ["serveur", "evenementiel"], jobKey: "server", boost: 0.5 },
  // Tech
  { pattern: ["developpeur", "react"], jobKey: "frontend_developer", boost: 0.6 },
  { pattern: ["react", "freelance"], jobKey: "frontend_developer", boost: 0.5 },
  { pattern: ["fullstack", "js"], jobKey: "web_developer", boost: 0.5 },
  { pattern: ["mobile", "freelance"], jobKey: "mobile_developer", boost: 0.5 },
  // Logistique / livraison
  { pattern: ["livraison", "colis"], jobKey: "delivery_driver", boost: 0.4 },
  { pattern: ["preparation", "commandes"], jobKey: "warehouse_worker", boost: 0.5 },
  // Immobilier
  { pattern: ["vente", "appartement"], jobKey: "real_estate_agent", boost: 0.4 },
  { pattern: ["mandataire", "immo"], jobKey: "real_estate_agent", boost: 0.4 },
  // Générique urgence
  { pattern: ["urgent", "remplacement"], jobKey: "freelancer", boost: 0.2 }
];

export const JOB_PATTERNS_ADVANCED: AdvancedJobPattern[] = [
  {
    jobKey: "cook",
    includes: ["cuisine", "prep", "service chaud"],
    excludes: ["bar", "cocktail"],
    boost: 0.5
  },
  {
    jobKey: "server",
    includes: ["service", "salle", "clients", "tables"],
    boost: 0.4
  },
  {
    jobKey: "bartender",
    includes: ["bar", "cocktail", "biere"],
    excludes: ["cuisine"],
    boost: 0.5
  },
  {
    jobKey: "frontend_developer",
    includes: ["react", "vue", "interface", "ui"],
    excludes: ["backend", "api"],
    boost: 0.6
  },
  {
    jobKey: "backend_developer",
    includes: ["api", "node", "database", "sql"],
    excludes: ["design", "ui"],
    boost: 0.6
  },
  {
    jobKey: "delivery_driver",
    includes: ["livraison", "colis", "trajet", "clients"],
    boost: 0.4
  }
];

/**
 * Résultat de détection avec score et confiance
 */
export interface DetectedJob {
  jobKey: string;
  score: number;
  confidence: number;
}

/**
 * Résultat final avec job principal et jobs secondaires
 */
export interface JobDetectionResult {
  primaryJob: {
    jobKey: string;
    confidence: number;
  };
  secondaryJobs: Array<{
    jobKey: string;
    confidence: number;
  }>;
}

/**
 * Contexte d'une annonce
 */
export interface JobContext {
  urgency?: "low" | "medium" | "high";
  duration?: "one_day" | "short" | "long";
  location?: string | null;
  temporal?: string | null;
}

/**
 * Template d'annonce
 */
export interface JobTemplate {
  title: string;
  description: string;
  requirements: string[];
}

/**
 * État de préparation d'une mission
 */
export interface MissionReadiness {
  score: number; // 0 → 100
  status: "incomplete" | "almost_ready" | "ready";
  missing: string[];
}

/**
 * Étapes possibles dans le flux de création d'annonce
 */
export type Step = "confirm_job" | "missing_info" | "publish";

/**
 * Détermine la prochaine étape basée sur l'état de préparation
 */
export function getNextStep(readiness: MissionReadiness): Step {
  if (readiness.status === "ready") return "publish";
  
  if (readiness.missing.includes("métier")) return "confirm_job";
  
  return "missing_info";
}

/**
 * Convertit la structure hiérarchique en format plat pour compatibilité
 */
export function flattenJobSynonyms(): Record<string, { synonyms: string[]; weight: number }> {
  const flattened: Record<string, { synonyms: string[]; weight: number }> = {};

  for (const category of Object.values(JOB_SYNONYMS)) {
    for (const [jobKey, jobDef] of Object.entries(category.jobs)) {
      const allSynonyms: string[] = [];
      
      // Ajouter tous les synonymes français
      allSynonyms.push(...jobDef.labels.fr);
      
      // Ajouter les synonymes anglais si disponibles
      if (jobDef.labels.en) {
        allSynonyms.push(...jobDef.labels.en);
      }
      
      // Ajouter les synonymes arabes si disponibles
      if (jobDef.labels.ar) {
        allSynonyms.push(...jobDef.labels.ar);
      }
      
      // Utiliser le premier synonyme français comme clé principale
      const primaryKey = jobDef.labels.fr[0];
      
      if (primaryKey) {
        flattened[primaryKey] = {
          synonyms: allSynonyms,
          weight: jobDef.weight
        };
      }
    }
  }

  return flattened;
}

/**
 * Retourne tous les synonymes français pour un métier donné
 */
export function getFrenchSynonyms(jobName: string): string[] {
  const normalized = jobName.toLowerCase().trim();
  
  for (const category of Object.values(JOB_SYNONYMS)) {
    for (const jobDef of Object.values(category.jobs)) {
      const frLabels = jobDef.labels.fr.map(l => l.toLowerCase());
      if (frLabels.includes(normalized) || frLabels.some(label => label.includes(normalized) || normalized.includes(label))) {
        return jobDef.labels.fr;
      }
    }
  }
  
  return [];
}

/**
 * Retourne le poids d'un métier (pour scoring)
 */
export function getJobWeight(jobName: string): number {
  const normalized = jobName.toLowerCase().trim();
  
  for (const category of Object.values(JOB_SYNONYMS)) {
    for (const jobDef of Object.values(category.jobs)) {
      const frLabels = jobDef.labels.fr.map(l => l.toLowerCase());
      if (frLabels.includes(normalized) || frLabels.some(label => label.includes(normalized) || normalized.includes(label))) {
        return jobDef.weight;
      }
    }
  }
  
  return 0.8; // Poids par défaut
}

/**
 * Tokenize le texte en supportant l'arabe
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // enlever accents
    .replace(/[^a-z0-9\u0600-\u06FF\s]/gi, " ") // garder aussi l'arabe
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Détecte les métiers à partir de texte avec scoring avancé
 */
export function detectJobsFromText(text: string): DetectedJob[] {
  const tokens = tokenize(text);
  const scores: Record<string, number> = {};

  // 1. Matching par synonymes
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
        // match si tous les tokens du label sont trouvés
        if (labelTokens.every(t => tokens.includes(t))) {
          scores[job.key] = (scores[job.key] || 0) + job.weight;
        }
      }
    }
  }

  // 2. Boost via patterns simples
  for (const pattern of JOB_PATTERNS) {
    const patternNormalized = pattern.pattern.map(p => 
      p.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    );
    if (patternNormalized.every(t => tokens.includes(t))) {
      scores[pattern.jobKey] = (scores[pattern.jobKey] || 0) + pattern.boost;
    }
  }

  // 3. Boost via patterns avancés (includes/excludes)
  for (const p of JOB_PATTERNS_ADVANCED) {
    const hasIncludes = !p.includes || p.includes.every(t => {
      const normalized = t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return tokens.some(token => token.includes(normalized) || normalized.includes(token));
    });
    
    const hasExcludes = p.excludes && p.excludes.some(t => {
      const normalized = t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return tokens.some(token => token.includes(normalized) || normalized.includes(token));
    });

    if (hasIncludes && !hasExcludes) {
      scores[p.jobKey] = (scores[p.jobKey] || 0) + p.boost;
    }
  }

  // 4. Normalisation simple du score -> confiance
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

/**
 * Obtient le job principal et les jobs secondaires
 */
export function getPrimaryAndSecondaryJobs(text: string): {
  primaryJob: DetectedJob | null;
  secondaryJobs: DetectedJob[];
} {
  const detected = detectJobsFromText(text);

  if (detected.length === 0) {
    return {
      primaryJob: null,
      secondaryJobs: []
    };
  }

  const [primary, ...rest] = detected;

  // Seuil pour considérer un job comme "secondaire"
  const secondaryJobs = rest.filter(j => j.confidence >= 0.4);

  return {
    primaryJob: primary,
    secondaryJobs
  };
}

/**
 * Détecte l'urgence dans le texte
 */
function detectUrgency(tokens: string[]): JobContext["urgency"] {
  const urgencyWords = {
    high: ["urgent", "asap", "immediat", "immediate", "tout de suite"],
    medium: ["rapidement", "vite", "bientot", "prochainement"]
  };
  
  if (urgencyWords.high.some(word => tokens.includes(word))) return "high";
  if (urgencyWords.medium.some(word => tokens.includes(word))) return "medium";
  return "low";
}

/**
 * Détecte la durée dans le texte
 */
function detectDuration(tokens: string[]): JobContext["duration"] {
  const durationWords = {
    one_day: ["soiree", "soire", "journee", "journee", "demi-journee", "demi journee", "ponctuel", "ponctuelle"],
    short: ["semaine", "quelques jours", "courte duree", "court terme"],
    long: ["mois", "long terme", "longue duree", "permanent", "cdi"]
  };
  
  if (durationWords.one_day.some(word => tokens.includes(word))) return "one_day";
  if (durationWords.short.some(word => tokens.includes(word))) return "short";
  if (durationWords.long.some(word => tokens.includes(word))) return "long";
  return undefined;
}

/**
 * Détecte la localisation dans le texte
 */
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

/**
 * Extrait le contexte d'une annonce
 */
export function extractContext(text: string): JobContext {
  const tokens = tokenize(text);

  return {
    urgency: detectUrgency(tokens),
    duration: detectDuration(tokens),
    location: detectLocation(text),
    temporal: tokens.find(t =>
      ["soir", "soiree", "soire", "week-end", "weekend", "matin", "apres-midi", "apres midi", "nuit"].includes(t)
    ) || null
  };
}

/**
 * Templates contextuels pour génération d'annonces
 */
const COOK_TEMPLATE = (ctx: JobContext): JobTemplate => ({
  title: `Recherche cuisinier${ctx.duration === "one_day" ? " pour une mission ponctuelle" : ""}`,
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
  requirements: ["Expérience React ou Vue", "Autonomie", "Esprit produit"]
});

export const JOB_TEMPLATES: Record<string, (ctx: JobContext) => JobTemplate> = {
  cook: COOK_TEMPLATE,
  frontend_developer: FRONTEND_TEMPLATE
};

/**
 * Génère un template d'annonce basé sur le jobKey et le contexte
 */
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
      // Si un template existe dans JOB_TEMPLATES, l'utiliser
      if (JOB_TEMPLATES[jobKey]) {
        return JOB_TEMPLATES[jobKey](ctx);
      }
      // Sinon, template générique
      return {
        title: "Mission recherchée",
        description: "Merci de préciser votre besoin.",
        requirements: []
      };
  }
}

/**
 * Détermine si la détection de métier est incertaine
 * Retourne true si on doit demander confirmation à l'utilisateur
 */
export function isJobDetectionUncertain(
  detected: DetectedJob[]
): boolean {
  if (!detected.length) return true;
  
  if (detected[0].confidence < 0.5) return true;
  
  // Si deux métiers ont une confiance très proche, demander confirmation
  if (
    detected.length > 1 &&
    Math.abs(detected[0].confidence - detected[1].confidence) < 0.15
  ) {
    return true;
  }
  
  return false;
}

/**
 * Retourne les métiers suggérés quand la détection est incertaine
 * Utile pour afficher des boutons de sélection à l'utilisateur
 */
export function getSuggestedJobsForUncertainty(
  text: string,
  maxSuggestions: number = 3
): Array<{ jobKey: string; confidence: number; jobName: string | null }> {
  const detected = detectJobsFromText(text);
  
  if (!isJobDetectionUncertain(detected)) {
    return [];
  }
  
  // Retourner les top N métiers détectés avec leurs noms depuis la base
  return detected.slice(0, maxSuggestions).map(job => ({
    jobKey: job.jobKey,
    confidence: job.confidence,
    jobName: null // Sera mappé depuis la base de données dans le composant
  }));
}

/**
 * Calcule le score de préparation d'une mission
 */
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
  if (ctx.location) {
    score += 20;
  } else {
    missing.push("lieu");
  }

  // Durée / temporalité
  if (ctx.duration || ctx.temporal) {
    score += 20;
  } else {
    missing.push("durée");
  }

  // Urgence (optionnelle mais utile)
  if (ctx.urgency) {
    score += 10;
  }

  // Score confiance globale
  if (detectedJobs.length && detectedJobs[0].confidence >= 0.8) {
    score += 20;
  }

  let status: MissionReadiness["status"] = "incomplete";
  if (score >= 80) {
    status = "ready";
  } else if (score >= 50) {
    status = "almost_ready";
  }

  return { score, status, missing };
}

/**
 * Détermine si on doit appeler un LLM pour améliorer la détection
 */
export function shouldCallLLM(
  jobs: DetectedJob[],
  readiness: MissionReadiness
): boolean {
  if (!jobs.length) return true;
  
  if (jobs[0].confidence < 0.45) return true;
  
  if (readiness.status === "incomplete") return true;
  
  return false;
}

/**
 * Génère le prompt pour le LLM afin d'améliorer la détection
 */
export function generateLLMPrompt(userPrompt: string): string {
  return `You are a job classification assistant.

Extract:
- main job
- secondary job (optional)
- missing info

User input:
"${userPrompt}"

Return JSON only:
{
  "primaryJob": "...",
  "secondaryJob": "...",
  "missing": ["location", "duration", "urgency"]
}`;
}

/**
 * Fusionne les résultats du LLM avec la détection de base
 */
export function mergeLLMResult(
  base: DetectedJob[],
  llmResult: any
): DetectedJob[] {
  if (!base.length && llmResult.primaryJob) {
    return [
      { jobKey: llmResult.primaryJob, score: 0.6, confidence: 0.6 }
    ];
  }
  
  // Si le LLM a trouvé un métier et qu'on n'en avait pas, l'ajouter
  if (llmResult.primaryJob && !base.find(j => j.jobKey === llmResult.primaryJob)) {
    return [
      { jobKey: llmResult.primaryJob, score: 0.65, confidence: 0.65 },
      ...base
    ];
  }
  
  // Si le LLM confirme un métier existant, augmenter sa confiance
  if (llmResult.primaryJob) {
    return base.map(job => {
      if (job.jobKey === llmResult.primaryJob) {
        return {
          ...job,
          confidence: Math.min(1, job.confidence + 0.1),
          score: job.score + 0.1
        };
      }
      return job;
    });
  }
  
  return base;
}

/**
 * Log d'une détection de métier
 */
export interface JobDetectionLog {
  prompt_text: string;
  detectedJobs: DetectedJob[];
  readiness: MissionReadiness;
  usedLLM: boolean;
  userCorrection?: string;
  location?: string | null;
  duration?: string | null;
  urgency?: string | null;
}

/**
 * Crée un log de détection
 */
export function createDetectionLog(
  prompt_text: string,
  detectedJobs: DetectedJob[],
  readiness: MissionReadiness,
  usedLLM: boolean,
  userCorrection?: string,
  location?: string | null,
  duration?: string | null,
  urgency?: string | null
): JobDetectionLog {
  return {
    prompt_text,
    detectedJobs,
    readiness,
    usedLLM,
    userCorrection,
    location: location || null,
    duration: duration || null,
    urgency: urgency || null
  };
}

/**
 * Buffer pour les logs de détection (batching)
 */
let jobDetectionBuffer: JobDetectionLog[] = [];
let flushTimeout: number | null = null;

/**
 * Transforme un JobDetectionLog en payload pour l'API
 */
function transformLogToApiPayload(log: JobDetectionLog & { userAgent?: string; path?: string }): any {
  const primary = log.detectedJobs[0];

  return {
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
    user_agent: log.userAgent ?? null,
    path: log.path ?? null,
    raw: log // Garder tout pour debug/analyse
  };
}

/**
 * Envoie les logs en batch au serveur
 */
function flushLogs(): void {
  if (!jobDetectionBuffer.length) return;

  const payload = jobDetectionBuffer.map(transformLogToApiPayload);
  jobDetectionBuffer = [];

  const body = JSON.stringify(payload);

  // Récupérer l'URL Supabase depuis les variables d'environnement
  const supabaseUrl = typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL
    ? import.meta.env.VITE_SUPABASE_URL
    : null;
  
  if (!supabaseUrl) {
    // Si pas d'URL Supabase, on ignore silencieusement (ne pas casser l'UX)
    return;
  }

  const apiUrl = `${supabaseUrl}/functions/v1/job-detection-logs`;

  // Utiliser sendBeacon si disponible (plus fiable pour les logs)
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon(apiUrl, blob);
  } else {
    fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true // Important : permet l'envoi même si la page se ferme
    }).catch(() => {
      // Jamais bloquant - le logging ne doit jamais casser l'UX
    });
  }
}

/**
 * Envoie un log de détection au serveur (avec batching)
 * Le logging ne doit jamais casser l'UX - toujours silencieux en cas d'erreur
 */
export function logJobDetection(log: JobDetectionLog): void {
  // Ajouter les métadonnées
  const enrichedLog: JobDetectionLog = {
    ...log,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    path: typeof window !== "undefined" ? window.location.pathname : undefined
  };

  jobDetectionBuffer.push(enrichedLog);

  // Flush toutes les 2 secondes ou immédiatement si le buffer est plein (50 logs)
  if (jobDetectionBuffer.length >= 50) {
    if (flushTimeout) {
      clearTimeout(flushTimeout);
      flushTimeout = null;
    }
    flushLogs();
  } else if (!flushTimeout) {
    flushTimeout = window.setTimeout(() => {
      flushLogs();
      flushTimeout = null;
    }, 2000);
  }
}

/**
 * Force l'envoi immédiat des logs en attente
 * Utile avant de quitter la page ou lors d'événements critiques
 */
export function flushJobDetectionLogs(): void {
  if (flushTimeout) {
    clearTimeout(flushTimeout);
    flushTimeout = null;
  }
  flushLogs();
}

/**
 * Envoie un log de détection directement à l'API (sans batching)
 * Utile pour les logs critiques ou en fin de session
 */
export async function logJobDetectionToApi(
  input: JobDetectionLog
): Promise<void> {
  const primary = input.detectedJobs[0];

  const payload = {
    prompt_text: input.prompt_text,
    primary_job_key: primary?.jobKey ?? null,
    primary_confidence: primary?.confidence ?? null,
    secondary_jobs: input.detectedJobs.slice(1),
    readiness_score: input.readiness.score,
    readiness_status: input.readiness.status,
    readiness_missing: input.readiness.missing,
    location: input.location ?? null,
    duration: input.duration ?? null,
    urgency: input.urgency ?? null,
    used_llm: input.usedLLM,
    user_agent:
      typeof navigator !== "undefined" ? navigator.userAgent : null,
    path:
      typeof window !== "undefined" ? window.location.pathname : null,
    raw: input // Garder tout pour debug/analyse
  };

  // Récupérer l'URL Supabase
  const supabaseUrl = typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL
    ? import.meta.env.VITE_SUPABASE_URL
    : null;
  
  if (!supabaseUrl) {
    return; // Ignorer silencieusement si pas d'URL
  }

  // Utiliser l'Edge Function Supabase (pas Next.js)
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
    // Jamais bloquant - le logging ne doit jamais casser l'UX
  }
}

/**
 * Ancienne fonction pour compatibilité (utilise la nouvelle logique)
 */
export function detectJobs(tokens: string[]): DetectedJob[] {
  const text = tokens.join(' ');
  return detectJobsFromText(text);
}

/**
 * Convertit les jobKeys en noms de métiers depuis la base de données
 */
export function mapJobKeyToJobName(jobKey: string, jobs: any[]): string | null {
  // Récupérer le premier synonyme français depuis JOB_SYNONYMS
  let frenchName = jobKey;
  
  for (const category of Object.values(JOB_SYNONYMS)) {
    for (const [key, jobDef] of Object.entries(category.jobs)) {
      if (key === jobKey && jobDef.labels.fr.length > 0) {
        frenchName = jobDef.labels.fr[0];
        break;
      }
    }
  }
  
  // Chercher dans la base de données
  const frenchNameLower = frenchName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  for (const job of jobs) {
    const jobNameLower = job.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (jobNameLower.includes(frenchNameLower) || 
        frenchNameLower.includes(jobNameLower) ||
        jobNameLower.split(/\s+/).some(word => frenchNameLower.includes(word)) ||
        frenchNameLower.split(/\s+/).some(word => jobNameLower.includes(word))) {
      return job.name;
    }
  }
  
  return null;
}
