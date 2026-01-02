/**
 * Système de suggestions intelligentes amélioré
 * Catégorise et génère des suggestions contextuelles pour améliorer l'UX
 */

import { detectJob, getJobByName, suggestJobVariations, getDefaultRatesForJob, getDefaultHoursForJob, getCriticalSkillsForJob } from './jobDetection';
import { AutoCompleteContext } from './autoComplete';

export interface Suggestion {
  text: string;
  category: 'complete' | 'role' | 'city' | 'contract' | 'skills' | 'rate' | 'date' | 'hours' | 'history' | 'trending';
  priority: number; // 1-10, plus élevé = plus important
  icon?: string;
  description?: string;
  isComplete?: boolean; // Si c'est un exemple complet prêt à publier
}

export interface SuggestionGroup {
  title: string;
  suggestions: Suggestion[];
  icon?: string;
}

/**
 * Génère des suggestions contextuelles basées sur l'heure et le jour
 */
function getContextualSuggestions(detectedCity: string): Suggestion[] {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0 = dimanche, 6 = samedi
  const suggestions: Suggestion[] = [];

  // Suggestions selon l'heure
  if (hour >= 6 && hour < 12) {
    // Matin
    suggestions.push({
      text: `Matin ${detectedCity} 9h-13h`,
      category: 'hours',
      priority: 7,
      description: 'Créneau matinal'
    });
  } else if (hour >= 12 && hour < 18) {
    // Après-midi
    suggestions.push({
      text: `Après-midi ${detectedCity} 13h-18h`,
      category: 'hours',
      priority: 7,
      description: 'Créneau après-midi'
    });
  } else {
    // Soir
    suggestions.push({
      text: `Soir ${detectedCity} 18h-23h`,
      category: 'hours',
      priority: 7,
      description: 'Créneau soirée'
    });
  }

  // Suggestions selon le jour
  if (day === 5 || day === 6) {
    // Weekend
    suggestions.push({
      text: `Weekend ${detectedCity} urgent`,
      category: 'date',
      priority: 8,
      description: 'Mission weekend'
    });
  } else if (day === 0) {
    // Dimanche
    suggestions.push({
      text: `Dimanche ${detectedCity}`,
      category: 'date',
      priority: 6,
      description: 'Dimanche prochain'
    });
  }

  return suggestions;
}

/**
 * Génère des templates pré-remplis pour métiers populaires
 */
function getPopularJobTemplates(detectedCity: string): Suggestion[] {
  const popularJobs = [
    {
      role: 'Serveur',
      template: `Serveur à ${detectedCity} samedi 18h-23h 13€/h`,
      description: 'Service en salle',
      priority: 9
    },
    {
      role: 'Cuisinier',
      template: `Cuisinier à ${detectedCity} demain 9h-14h 15€/h`,
      description: 'Cuisine',
      priority: 9
    },
    {
      role: 'Livreur',
      template: `Livreur à ${detectedCity} urgent 12€/h - Permis B obligatoire`,
      description: 'Livraison',
      priority: 8
    },
    {
      role: 'Agent de sécurité',
      template: `Agent de sécurité à ${detectedCity} lundi 8h-20h 13€/h - Carte professionnelle`,
      description: 'Sécurité',
      priority: 8
    },
    {
      role: 'Vendeur',
      template: `Vendeur à ${detectedCity} demain 10h-19h 14€/h`,
      description: 'Vente',
      priority: 7
    },
    {
      role: 'Magasinier',
      template: `Magasinier à ${detectedCity} lundi 8h-17h 13€/h - CACES optionnel`,
      description: 'Logistique',
      priority: 7
    }
  ];

  return popularJobs.map(job => ({
    text: job.template,
    category: 'complete' as const,
    priority: job.priority,
    description: job.description,
    isComplete: true
  }));
}

/**
 * Analyse le texte et détecte ce qui manque
 */
function analyzeMissingFields(text: string, detectedJob: string | null): {
  missingRole: boolean;
  missingCity: boolean;
  missingDate: boolean;
  missingHours: boolean;
  missingRate: boolean;
  missingSkills: boolean;
} {
  const textLower = text.toLowerCase();
  const CITIES = ["Paris","Marseille","Lyon","Toulouse","Nice","Nantes","Strasbourg","Montpellier","Bordeaux","Lille","Rennes","Reims","Grenoble","Bruxelles","Brussels","Anvers","Antwerpen","Gand","Gent","Liège","Namur","Charleroi","Mons","Tournai","Bruges","Brugge","Mouscron"];
  
  const hasCity = CITIES.some(city => new RegExp(`\\b${city}\\b`, 'i').test(text));
  const hasDate = /(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|urgent|demain|après-demain|\d{1,2}[\s\/]\w+)/i.test(text);
  const hasHours = /\d{1,2}h\s*[-–]\s*\d{1,2}h/i.test(text);
  const hasRate = /\d+€/i.test(text) || /\d+\s*€\s*\/\s*h/i.test(text);
  const hasSkills = /permis|caces|carte professionnelle|expérience/i.test(text);

  return {
    missingRole: !detectedJob,
    missingCity: !hasCity,
    missingDate: !hasDate,
    missingHours: !hasHours,
    missingRate: !hasRate,
    missingSkills: detectedJob ? !hasSkills : false
  };
}

/**
 * Génère des suggestions intelligentes groupées par catégorie
 */
export function generateSmartSuggestions(
  text: string,
  autoContext: AutoCompleteContext
): SuggestionGroup[] {
  const textLower = text.toLowerCase().trim();
  const detectedCity = autoContext.detectedCity || 'Lille';
  const groups: SuggestionGroup[] = [];

  // Cas 1: Texte vide - Afficher exemples complets et templates populaires
  if (text.length === 0) {
    // Groupe: Historique utilisateur
    if (autoContext.recentRole && autoContext.recentCity) {
      groups.push({
        title: 'Votre dernière annonce',
        icon: '🕒',
        suggestions: [{
          text: `${autoContext.recentRole} à ${autoContext.recentCity}`,
          category: 'history',
          priority: 10,
          description: 'Réutiliser votre dernière annonce'
        }]
      });
    }

    // Groupe: Templates populaires
    const popularTemplates = getPopularJobTemplates(detectedCity);
    if (popularTemplates.length > 0) {
      groups.push({
        title: 'Templates prêts à l\'emploi',
        icon: '⭐',
        suggestions: popularTemplates.slice(0, 4)
      });
    }

    // Groupe: Suggestions contextuelles
    const contextual = getContextualSuggestions(detectedCity);
    if (contextual.length > 0) {
      groups.push({
        title: 'Suggestions du moment',
        icon: '⚡',
        suggestions: contextual
      });
    }

    return groups;
  }

  // Cas 2: Texte court (< 10 caractères) - Suggestions de métiers
  if (text.length < 10) {
    const jobSuggestions = suggestJobVariations(textLower);
    if (jobSuggestions.length > 0) {
      groups.push({
        title: 'Métiers correspondants',
        icon: '💼',
        suggestions: jobSuggestions.slice(0, 6).map(job => ({
          text: `${job} à ${detectedCity}`,
          category: 'role' as const,
          priority: 8
        }))
      });
    }
    return groups;
  }

  // Cas 3: Texte plus long - Analyse intelligente
  const detectedJob = detectJob(text);
  const missing = analyzeMissingFields(text, detectedJob);

  const normalizedWords = Array.from(
    new Set(
      textLower
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .split(/[\s,;:.!?]+/)
        .filter(word =>
          word.length >= 3 &&
          !['avec','sans','pour','des','les','une','sur','dans','chez','aux','par','entre','parmi','mon','ton','son','leur','notre','votre','auxiliaire'].includes(word)
        )
    )
  );

  // Groupe: Compléter les informations manquantes
  const completionSuggestions: Suggestion[] = [];

  if (missing.missingCity && detectedJob) {
    const suggestedCities = [detectedCity, 'Paris', 'Lyon', 'Marseille'].filter((city, idx, arr) => arr.indexOf(city) === idx);
    suggestedCities.forEach(city => {
      completionSuggestions.push({
        text: `${text} à ${city}`,
        category: 'city',
        priority: 9
      });
    });
  }

  if (missing.missingHours && detectedJob) {
    const defaultHours = getDefaultHoursForJob(detectedJob);
    defaultHours.slice(0, 3).forEach(hours => {
      completionSuggestions.push({
        text: `${text.trim()} ${hours.start}h-${hours.end}h`,
        category: 'hours',
        priority: 8
      });
    });
  }

  if (missing.missingRate && detectedJob) {
    // Détecter les montants déjà présents dans le texte pour éviter les doublons
    const existingRates = new Set<number>();
    const rateMatches = text.matchAll(/(\d{2,3})\s*(?:€|eur|euros?)\s*\/?\s*h/gi);
    for (const match of rateMatches) {
      const amount = parseInt(match[1], 10);
      if (amount >= 10 && amount <= 200) {
        existingRates.add(amount);
      }
    }
    
    const defaultRates = getDefaultRatesForJob(detectedJob);
    // Filtrer les montants déjà présents et ne proposer que ceux qui manquent
    const availableRates = defaultRates.filter(rate => !existingRates.has(rate));
    
    // Limiter à 2 suggestions de montants maximum pour éviter la répétition
    availableRates.slice(0, 2).forEach(rate => {
      completionSuggestions.push({
        text: `${text.trim()} ${rate}€/h`,
        category: 'rate',
        priority: 7
      });
    });
  }

  if (missing.missingDate) {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const dayAfter = new Date(now);
    dayAfter.setDate(now.getDate() + 2);

    const weekdays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

    completionSuggestions.push({
      text: `${text.trim()} Urgent`,
      category: 'date',
      priority: 9,
      description: 'Mission urgente'
    });
    completionSuggestions.push({
      text: `${text.trim()} Demain`,
      category: 'date',
      priority: 8,
      description: `${weekdays[tomorrow.getDay()]} ${tomorrow.getDate()} ${months[tomorrow.getMonth()]}`
    });
  }

  if (missing.missingSkills && detectedJob) {
    const criticalSkills = getCriticalSkillsForJob(detectedJob);
    criticalSkills.slice(0, 3).forEach(skill => {
      if (!textLower.includes(skill.toLowerCase())) {
        completionSuggestions.push({
          text: `${text} - ${skill}`,
          category: 'skills',
          priority: 6
        });
      }
    });
  }

  if (completionSuggestions.length > 0) {
    groups.push({
      title: 'Compléter votre annonce',
      icon: '✨',
      suggestions: completionSuggestions.sort((a, b) => b.priority - a.priority).slice(0, 6)
    });
  }

  // Groupe: suggestions de métiers si aucun rôle détecté
  if (!detectedJob && normalizedWords.length > 0) {
    const keywordJobs: string[] = [];
    normalizedWords.forEach(keyword => {
      const variations = suggestJobVariations(keyword);
      variations.forEach(job => {
        if (!keywordJobs.includes(job)) {
          keywordJobs.push(job);
        }
      });
    });

    if (keywordJobs.length > 0) {
      groups.push({
        title: 'Métiers correspondants',
        icon: '🔍',
        suggestions: keywordJobs.slice(0, 6).map(job => ({
          text: `${job} à ${detectedCity}`,
          category: 'role',
          priority: 7
        }))
      });
    }
  }

  // Groupe: Exemples complets similaires
  if (detectedJob) {
    const job = getJobByName(detectedJob);
    if (job) {
      const similarExamples: Suggestion[] = [];
      const defaultRates = getDefaultRatesForJob(detectedJob);
      const defaultHours = getDefaultHoursForJob(detectedJob);
      
      // Générer 2-3 exemples complets
      for (let i = 0; i < Math.min(2, defaultRates.length); i++) {
        const rate = defaultRates[i];
        const hours = defaultHours[i % defaultHours.length];
        similarExamples.push({
          text: `${detectedJob} à ${detectedCity} demain ${hours.start}h-${hours.end}h ${rate}€/h`,
          category: 'complete',
          priority: 7,
          isComplete: true
        });
      }

      if (similarExamples.length > 0) {
        groups.push({
          title: 'Exemples similaires',
          icon: '📋',
          suggestions: similarExamples
        });
      }
    }
  }

  // Groupe: métiers similaires lorsque le poste est identifié
  if (detectedJob) {
    const similarJobs = suggestJobVariations(detectedJob.toLowerCase())
      .filter(job => job.toLowerCase() !== detectedJob.toLowerCase());

    if (similarJobs.length > 0) {
      groups.push({
        title: 'Métiers similaires',
        icon: '🤝',
        suggestions: similarJobs.slice(0, 5).map(job => ({
          text: `${job} à ${detectedCity}`,
          category: 'role',
          priority: 6
        }))
      });
    }
  }

  return groups;
}

/**
 * Formate les suggestions pour l'affichage
 */
export function formatSuggestionText(suggestion: Suggestion): string {
  return suggestion.text;
}

