import jobsDataRaw from './uwi_human_jobs_freelance_varied_skills.json';
import { flattenJobSynonyms, getJobWeight, getPrimaryAndSecondaryJobs, mapJobKeyToJobName, JobDetectionResult } from './jobSynonymsExtended';

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

const categoryDefaultHours: Record<string, {start: number, end: number}[]> = {
  'Hôtellerie & Restauration': [{start: 12, end: 20}, {start: 18, end: 23}, {start: 10, end: 18}],
  'Logistique & Transport': [{start: 6, end: 14}, {start: 14, end: 22}, {start: 8, end: 17}],
  'BTP / Maintenance / Énergie': [{start: 7, end: 15}, {start: 8, end: 17}, {start: 6, end: 14}],
  'Commerce / Vente / Marketing': [{start: 9, end: 18}, {start: 10, end: 19}, {start: 8, end: 17}],
  'Administratif / Finance / Juridique': [{start: 9, end: 18}, {start: 8, end: 17}, {start: 10, end: 19}],
  'Santé / Social / Éducation': [{start: 8, end: 16}, {start: 9, end: 17}, {start: 7, end: 15}],
  'Informatique / Numérique': [{start: 9, end: 18}, {start: 10, end: 19}, {start: 8, end: 17}],
  'Création / Médias / Culture': [{start: 9, end: 18}, {start: 10, end: 19}, {start: 14, end: 22}],
  'Agriculture / Environnement': [{start: 7, end: 15}, {start: 8, end: 17}, {start: 6, end: 14}],
  'Sécurité / Défense / Urgence': [{start: 8, end: 16}, {start: 20, end: 6}, {start: 6, end: 14}],
  'Artisanat / Industrie / Fabrication': [{start: 8, end: 16}, {start: 6, end: 14}, {start: 14, end: 22}],
  'Sports / Loisirs / Tourisme': [{start: 9, end: 18}, {start: 10, end: 19}, {start: 14, end: 22}],
  'Direction / Management': [{start: 9, end: 18}, {start: 8, end: 19}, {start: 10, end: 20}],
  'Freelance & Indépendants': [{start: 9, end: 18}, {start: 10, end: 19}, {start: 8, end: 17}]
};

const levelDefaultRates: Record<string, number[]> = {
  'débutant': [12, 13, 14],
  'intermédiaire': [15, 16, 18],
  'expert': [20, 22, 25]
};

const STOP_WORDS = new Set([
  'avec','sans','pour','des','les','une','sur','dans','chez','aux','par','entre','parmi','mon','ton','son','leur','notre','votre','auxiliaire',
  'de','la','le','du','un','et','en','au','aux','dun','dune','secteur','specialise','specialisee','profession','metier',
  'recherche','cherche','besoin','disponible','dispo','mission','poste','emploi','travail','job'
]);

// Synonymes de base (pour compatibilité)
const JOB_SYNONYMS_BASE: Record<string, string[]> = {
  'vendeur': ['vendeuse', 'seller', 'sales', 'commercial', 'commerciale'],
  'caissier': ['caissiere', 'cashier', 'caisse', 'encaissement'],
  'agent de securite': ['vigile', 'gardien', 'surveillance', 'securite', 'security'],
  'nettoyage': ['entretien', 'menage', 'proprete', 'cleaning', 'cleaner'],
  'demenageur': ['demenageuse', 'manutentionnaire', 'mover', 'moving'],
  'chauffeur': ['chauffeuse', 'conducteur', 'driver', 'pilote'],
  // Métiers immobiliers
  'agent immobilier': ['conseiller immobilier', 'negociateur immobilier', 'commercial immobilier', 'immobilier', 'transaction immobiliere'],
  'conseiller immobilier': ['agent immobilier', 'negociateur immobilier', 'immobilier'],
  'negociateur immobilier': ['agent immobilier', 'conseiller immobilier', 'immobilier'],
  // Autres domaines
  'agent commercial': ['commercial', 'vendeur', 'business developer', 'business dev'],
  'graphiste': ['designer', 'creatif', 'maquettiste', 'graphic designer'],
  'photographe': ['photo', 'photography', 'photographe professionnel'],
  'redacteur': ['redactrice', 'copywriter', 'redacteur web', 'redacteur seo'],
  'webmaster': ['web master', 'administrateur site', 'gestionnaire site web']
};

// Fusionner les synonymes étendus avec les synonymes de base
function buildJobSynonyms(): Record<string, string[]> {
  const extended = flattenJobSynonyms();
  const merged: Record<string, string[]> = { ...JOB_SYNONYMS_BASE };
  
  // Ajouter les synonymes étendus
  for (const [key, value] of Object.entries(extended)) {
    if (merged[key]) {
      // Fusionner avec les synonymes existants
      merged[key] = [...new Set([...merged[key], ...value.synonyms])];
    } else {
      merged[key] = value.synonyms;
    }
  }
  
  return merged;
}

const JOB_SYNONYMS = buildJobSynonyms();

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text: string): string[] {
  return text
    .split(/\s+/)
    .filter(word => word.length >= 3 && !STOP_WORDS.has(word));
}

/**
 * Génère des bigrammes (paires de mots consécutifs) pour détecter les métiers composés
 */
function generateBigrams(tokens: string[]): string[] {
  const bigrams: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.push(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return bigrams;
}

/**
 * Détecte un métier avec le nouveau système avancé
 * Retourne le nom du métier depuis la base de données
 */
export function detectJobAdvanced(text: string): JobDetectionResult | null {
  const { primaryJob, secondaryJobs } = getPrimaryAndSecondaryJobs(text);
  
  if (!primaryJob) return null;

  return {
    primaryJob: {
      jobKey: primaryJob.jobKey,
      confidence: primaryJob.confidence
    },
    secondaryJobs: secondaryJobs.map(j => ({
      jobKey: j.jobKey,
      confidence: j.confidence
    }))
  };
}

export function detectJob(text: string): string | null {
  if (!text || text.trim().length === 0) return null;

  // Utiliser le nouveau système avancé en priorité
  const { primaryJob } = getPrimaryAndSecondaryJobs(text);
  
  if (primaryJob && primaryJob.confidence > 0.5) {
    const jobName = mapJobKeyToJobName(primaryJob.jobKey, jobs);
    if (jobName) {
      return jobName;
    }
  }

  // Fallback: ancien système de détection
  const normalized = normalizeText(text);
  const tokens = tokenize(normalized);
  if (tokens.length === 0) return null;

  // ÉTAPE 1: Vérifier les synonymes complets (métiers multi-mots) d'abord
  for (const [key, synonyms] of Object.entries(JOB_SYNONYMS)) {
    const keyNormalized = normalizeText(key);
    
    // Vérifier si le texte contient le métier complet (ex: "agent immobilier")
    if (normalized.includes(keyNormalized)) {
      // Chercher le job correspondant dans la base
      for (const job of jobs) {
        const jobNormalized = normalizeText(job.name);
        // Correspondance exacte ou partielle
        if (jobNormalized.includes(keyNormalized) || 
            keyNormalized.includes(jobNormalized) ||
            jobNormalized.split(' ').some(word => keyNormalized.includes(word)) ||
            keyNormalized.split(' ').some(word => jobNormalized.includes(word))) {
          return job.name;
        }
      }
    }
    
    // Vérifier les synonymes
    for (const synonym of synonyms) {
      const synNormalized = normalizeText(synonym);
      if (normalized.includes(synNormalized)) {
        for (const job of jobs) {
          const jobNormalized = normalizeText(job.name);
          if (jobNormalized.includes(keyNormalized) || 
              keyNormalized.includes(jobNormalized.split(' ')[0]) ||
              jobNormalized.includes(synNormalized)) {
            return job.name;
          }
        }
      }
    }
  }

  // ÉTAPE 2: Détecter les métiers composés via bigrammes (ex: "agent immobilier")
  const bigrams = generateBigrams(tokens);
  for (const bigram of bigrams) {
    const bigramNormalized = normalizeText(bigram);
    
    // Chercher dans les synonymes
    for (const [key] of Object.entries(JOB_SYNONYMS)) {
      const keyNormalized = normalizeText(key);
      if (bigramNormalized === keyNormalized || 
          bigramNormalized.includes(keyNormalized) || 
          keyNormalized.includes(bigramNormalized)) {
        // Chercher le job correspondant
        for (const job of jobs) {
          const jobNormalized = normalizeText(job.name);
          if (jobNormalized.includes(keyNormalized) || 
              jobNormalized.includes(bigramNormalized) ||
              bigramNormalized.split(' ').every(word => jobNormalized.includes(word))) {
            return job.name;
          }
        }
      }
    }
    
    // Chercher directement dans la base de données avec correspondance flexible
    for (const job of jobs) {
      const jobNormalized = normalizeText(job.name);
      const bigramWords = bigramNormalized.split(' ');
      
      // Si le bigramme correspond exactement au job
      if (jobNormalized.includes(bigramNormalized)) {
        return job.name;
      }
      
      // Si le job contient tous les mots du bigramme (ordre flexible)
      if (bigramWords.length === 2 && 
          jobNormalized.includes(bigramWords[0]) && 
          jobNormalized.includes(bigramWords[1])) {
        return job.name;
      }
    }
  }

  let exactMatch: string | null = null;
  let exactMatchLength = 0;
  let bestMatch: string | null = null;
  let bestScore = 0;

  for (const job of jobs) {
    const normalizedJob = normalizeText(job.name);

    // Correspondance exacte
    if (normalized.includes(normalizedJob)) {
      if (normalizedJob.length > exactMatchLength) {
        exactMatch = job.name;
        exactMatchLength = normalizedJob.length;
      }
      continue;
    }

    // Correspondance partielle par tokens
    const jobTokens = tokenize(normalizedJob);
    if (jobTokens.length === 0) continue;

    const matchedTokens = jobTokens.filter(token => tokens.includes(token));
    if (matchedTokens.length === 0) continue;

    // Pour les jobs multi-mots, améliorer la logique de correspondance
    // Si le job a 2+ mots, on accepte si au moins 2 tokens correspondent OU si les mots importants correspondent
    if (jobTokens.length > 1) {
      // Vérifier si les mots importants (premier et dernier) correspondent
      const firstTokenMatch = tokens.includes(jobTokens[0]);
      const lastTokenMatch = jobTokens.length > 1 && tokens.includes(jobTokens[jobTokens.length - 1]);
      
      // Si moins de 2 tokens correspondent mais que les mots importants correspondent, on continue
      if (matchedTokens.length < 2 && !firstTokenMatch && !lastTokenMatch) {
        continue;
      }
    }

    let score = matchedTokens.length / jobTokens.length;

    // Bonus si tous les tokens correspondent
    if (matchedTokens.length === jobTokens.length && normalized.includes(jobTokens.join(' '))) {
      score += 0.3; // Augmenté de 0.25 à 0.3
    }

    // Bonus si le premier token correspond (souvent le métier principal)
    if (jobTokens.length > 0 && tokens.includes(jobTokens[0])) {
      score += 0.2; // Augmenté de 0.15 à 0.2
    }

    // Bonus si le dernier token correspond (souvent le domaine, ex: "immobilier")
    if (jobTokens.length > 1 && tokens.includes(jobTokens[jobTokens.length - 1])) {
      score += 0.15; // Nouveau bonus
    }

    // Bonus si le texte contient le job complet
    if (normalized.includes(jobTokens.join(' '))) {
      score += 0.25; // Augmenté de 0.2 à 0.25
    }
    
    // Bonus spécial pour les métiers composés détectés via bigrammes
    const bigrams = generateBigrams(tokens);
    const jobBigram = jobTokens.length >= 2 ? `${jobTokens[0]} ${jobTokens[1]}` : null;
    if (jobBigram && bigrams.some(bg => bg === jobBigram || bg.includes(jobBigram) || jobBigram.includes(bg))) {
      score += 0.2; // Bonus pour correspondance bigramme
    }
    
    // Multiplier par le poids du métier (si disponible dans les synonymes étendus)
    const jobWeight = getJobWeight(job.name);
    score *= jobWeight;

    if (score > bestScore) {
      bestMatch = job.name;
      bestScore = score;
    } else if (score === bestScore && score > 0 && bestMatch) {
      const currentTokens = tokenize(normalizeText(bestMatch));
      // Préférer les jobs plus courts (plus spécifiques)
      if (jobTokens.length < currentTokens.length) {
        bestMatch = job.name;
      } else if (jobTokens.length === currentTokens.length && normalizedJob.length < normalizeText(bestMatch).length) {
        bestMatch = job.name;
      }
    }
  }

  // Seuil minimum de confiance - réduit pour permettre plus de détections
  // Si on a un match avec au moins 2 tokens, on accepte même avec un score plus bas
  const hasMultipleTokens = bestMatch && tokenize(normalizeText(bestMatch)).length >= 2;
  const minScore = hasMultipleTokens ? 0.25 : 0.3; // Seuil plus bas pour métiers composés
  
  if (bestScore < minScore && !exactMatch) {
    return null;
  }

  return exactMatch || bestMatch;
}

export function getJobByName(name: string): Job | null {
  if (!name) return null;
  const nameLower = name.toLowerCase().trim();

  // Correspondance exacte d'abord
  let job = jobs.find(j => j.name.toLowerCase() === nameLower);
  if (job) return job;

  // Correspondance partielle : chercher des mots du name dans les noms de jobs
  const nameWords = nameLower.split(/[\s\/]+/).filter(w => w.length >= 3);

  job = jobs.find(j => {
    const jobNameLower = j.name.toLowerCase();
    return nameWords.some(word => jobNameLower.includes(word));
  });

  if (job) return job;

  // Inverse : chercher des mots des jobs dans le name
  job = jobs.find(j => {
    const jobNameLower = j.name.toLowerCase();
    const words = jobNameLower.split(/[\s\/]+/).filter(w => w.length >= 3);
    return words.some(word => nameLower.includes(word));
  });

  return job || null;
}

export function getJobCategory(jobName: string): string | null {
  const job = getJobByName(jobName);
  return job ? job.category : null;
}

export function getJobLevel(jobName: string): string {
  const job = getJobByName(jobName);
  return job ? job.level : 'intermédiaire';
}

export function getDefaultHoursForJob(jobName: string): {start: number, end: number}[] {
  const job = getJobByName(jobName);
  if (!job) return [{start: 9, end: 18}, {start: 8, end: 17}, {start: 10, end: 19}];

  const categoryHours = categoryDefaultHours[job.category];
  return categoryHours || [{start: 9, end: 18}, {start: 8, end: 17}, {start: 10, end: 19}];
}

export function getDefaultRatesForJob(jobName: string): number[] {
  const level = getJobLevel(jobName);
  return levelDefaultRates[level] || [15, 16, 18];
}

export function suggestJobVariations(text: string): string[] {
  const textLower = text.toLowerCase().trim();
  if (textLower.length < 2) return [];

  const suggestions: string[] = [];

  for (const job of jobs) {
    const nameLower = job.name.toLowerCase();
    const words = nameLower.split(/[\s\/]+/);

    if (nameLower.includes(textLower)) {
      if (!suggestions.includes(job.name)) {
        suggestions.push(job.name);
      }
    } else if (words.some(word => word.length >= 3 && (word.startsWith(textLower) || textLower.startsWith(word.slice(0, 3))))) {
      if (!suggestions.includes(job.name)) {
        suggestions.push(job.name);
      }
    }
  }

  const detectedJob = detectJob(text);
  if (detectedJob && suggestions.length < 6) {
    const currentJob = getJobByName(detectedJob);
    if (currentJob) {
      const sameCategory = jobs.filter(j =>
        j.category === currentJob.category &&
        j.name !== currentJob.name &&
        !suggestions.includes(j.name)
      ).slice(0, 6 - suggestions.length);
      suggestions.push(...sameCategory.map(j => j.name));
    }
  }

  return suggestions.slice(0, 6);
}

export function getCriticalSkillsForJob(jobName: string): string[] {
  const criticalSkillsByJob: Record<string, string[]> = {
    'livreur': ['Permis B', 'Véhicule personnel'],
    'livreuse': ['Permis B', 'Véhicule personnel'],
    'coursier': ['Permis B ou scooter', 'Véhicule personnel'],
    'chauffeur': ['Permis B/C', 'Expérience conduite'],
    'agent de sécurité': ['Carte professionnelle', 'Casier judiciaire vierge'],
    'vigile': ['Carte professionnelle', 'Casier judiciaire vierge'],
    'cariste': ['CACES 1-3-5', 'Expérience chariot'],
    'magasinier': ['CACES (optionnel)', 'Gestion stocks'],
    'préparateur': ['Lecture bons commande', 'Organisation'],
    'serveur': [],
    'serveuse': [],
    'cuisinier': ['CAP Cuisine (souhaité)', 'Hygiène alimentaire'],
    'cuisinière': ['CAP Cuisine (souhaité)', 'Hygiène alimentaire'],
    'barman': ['Connaissance cocktails', 'Expérience bar'],
    'barmaid': ['Connaissance cocktails', 'Expérience bar']
  };

  const jobLower = jobName.toLowerCase();
  for (const [key, skills] of Object.entries(criticalSkillsByJob)) {
    if (jobLower.includes(key)) {
      return skills;
    }
  }

  return [];
}

export function getExperienceLevels(): string[] {
  return ['Débutant', '1 an d\'expérience', '2 ans d\'expérience'];
}

export function getContractTypes(): string[] {
  return ['Temps plein', 'Temps partiel'];
}

export function getMissionTypes(): string[] {
  return ['CDI', 'CDD', 'Mission', 'Mission ponctuelle'];
}
