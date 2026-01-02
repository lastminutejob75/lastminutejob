/**
 * Parser intelligent pour extraire toutes les informations d'une annonce
 * Amélioration du parsing pour extraire : expérience, compétences, horaires détaillés, etc.
 */

interface ParsedJobInfo {
  role: string;
  city: string;
  date: string;
  duration: string;
  hourly: string;
  company: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contractType?: string;
  missionType?: string;
  experience?: string;
  skills?: string[];
  // Nouvelles informations extraites
  startTime?: string;
  endTime?: string;
  workDays?: string[];
  requirements?: string[];
  benefits?: string[];
  urgency?: 'normal' | 'urgent' | 'très urgent';
  language?: string[];
  availability?: string;
}

/**
 * Patterns améliorés pour extraire l'expérience
 */
function extractExperience(text: string): string | undefined {
  const patterns = [
    /(\d+)\s*(?:an|ans|année|années)\s*(?:d['']|d'|de\s+)?expérience/i,
    /expérience\s*(?:de\s+)?(\d+)\s*(?:an|ans|année|années)/i,
    /(\d+)\s*(?:an|ans)\s*(?:minimum|requis|souhaité)/i,
    /(débutant|junior|senior|expert|confirmé|expérimenté)/i,
    /(?:minimum|au moins)\s+(\d+)\s*(?:an|ans)/i,
    /(\d+)\s*-\s*(\d+)\s*(?:an|ans)\s*d['']expérience/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[1] && match[2]) {
        return `${match[1]}-${match[2]} ans d'expérience`;
      }
      if (match[1] && !isNaN(Number(match[1]))) {
        return `${match[1]} an${Number(match[1]) > 1 ? 's' : ''} d'expérience`;
      }
      if (match[1]) {
        return match[1];
      }
    }
  }

  return undefined;
}

/**
 * Extraction améliorée des horaires
 */
function extractDetailedHours(text: string): { duration?: string; startTime?: string; endTime?: string } {
  const result: { duration?: string; startTime?: string; endTime?: string } = {};

  // Format: 9h-18h, 9h00-18h00, 9h à 18h
  const timeRangePattern = /(\d{1,2})h(?:\d{2})?\s*[-–à]\s*(\d{1,2})h(?:\d{2})?/i;
  const timeMatch = text.match(timeRangePattern);
  if (timeMatch) {
    result.startTime = `${timeMatch[1]}h${timeMatch[1].length === 1 ? '00' : ''}`;
    result.endTime = `${timeMatch[2]}h${timeMatch[2].length === 1 ? '00' : ''}`;
    result.duration = `${timeMatch[1]}h–${timeMatch[2]}h`;
  }

  // Format: 8h/jour, 6 heures par jour
  const hoursPerDayPattern = /(\d{1,2})\s*(?:h|heures?)\s*(?:\/|par)\s*jour/i;
  const hoursPerDayMatch = text.match(hoursPerDayPattern);
  if (hoursPerDayMatch && !result.duration) {
    result.duration = `${hoursPerDayMatch[1]}h/jour`;
  }

  // Format: matin, après-midi, soir, nuit
  const timeOfDayPattern = /(matin|après-midi|soir|nuit|journée)/i;
  const timeOfDayMatch = text.match(timeOfDayPattern);
  if (timeOfDayMatch && !result.duration) {
    result.duration = timeOfDayMatch[1];
  }

  return result;
}

/**
 * Extraction améliorée des compétences
 */
function extractSkills(text: string): string[] {
  const skills: string[] = [];
  const textLower = text.toLowerCase();

  // Compétences communes avec variations
  const skillPatterns: Record<string, string[]> = {
    'permis b': ['permis b', 'permis de conduire', 'permis voiture'],
    'permis c': ['permis c', 'permis poids lourd'],
    'caces': ['caces', 'caces 1', 'caces 3', 'caces 5', 'chariot élévateur'],
    'haccp': ['haccp', 'hygiène alimentaire'],
    'anglais': ['anglais', 'english', 'bilingue'],
    'espagnol': ['espagnol', 'spanish'],
    'sst': ['sst', 'sauveteur secouriste', 'premiers secours'],
    'carte professionnelle': ['carte professionnelle', 'cqp aps'],
    'véhicule': ['véhicule personnel', 'voiture', 'scooter', 'moto'],
  };

  // Détecter les compétences par patterns
  for (const [skill, patterns] of Object.entries(skillPatterns)) {
    if (patterns.some(p => textLower.includes(p))) {
      if (!skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))) {
        skills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
      }
    }
  }

  // Extraire les compétences après "compétences:", "profil:", "qualités:", etc.
  const skillSectionPatterns = [
    /(?:compétences?|profil|qualités?|requis|souhaité)[:\s]+(.*?)(?:\n|$|\.|,)/i,
    /(?:doit|nécessaire|requis)[:\s]+(.*?)(?:\n|$|\.)/i,
  ];

  for (const pattern of skillSectionPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const section = match[1];
      // Séparer par virgules, points, ou tirets
      const extracted = section.split(/[,;•\-\n]/).map(s => s.trim()).filter(s => s.length > 3);
      extracted.forEach(skill => {
        if (!skills.some(existing => existing.toLowerCase() === skill.toLowerCase())) {
          skills.push(skill);
        }
      });
    }
  }

  // Extraire les compétences listées avec des tirets ou puces
  const bulletPattern = /(?:^|\n)[\s]*[-•*]\s*([A-ZÀ-ÿ][^•\n]{3,50}?)(?=\n|$)/g;
  let bulletMatch;
  while ((bulletMatch = bulletPattern.exec(text)) !== null) {
    const skill = bulletMatch[1].trim();
    if (skill.length > 3 && skill.length < 50) {
      // Vérifier que ce n'est pas une date, une ville, ou un salaire
      if (!skill.match(/^\d{1,2}\s*(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)/i) &&
          !skill.match(/\d+€/i) &&
          !skill.match(/^\d{1,2}h/)) {
        if (!skills.some(existing => existing.toLowerCase() === skill.toLowerCase())) {
          skills.push(skill);
        }
      }
    }
  }

  return skills;
}

/**
 * Extraction de l'urgence
 */
function extractUrgency(text: string): 'normal' | 'urgent' | 'très urgent' | undefined {
  const textLower = text.toLowerCase();
  
  if (/très\s+urgent|extrêmement\s+urgent|asap|immédiatement/i.test(textLower)) {
    return 'très urgent';
  }
  
  if (/urgent|rapidement|dès\s+que\s+possible/i.test(textLower)) {
    return 'urgent';
  }
  
  return undefined;
}

/**
 * Extraction des langues
 */
function extractLanguages(text: string): string[] {
  const languages: string[] = [];
  const textLower = text.toLowerCase();
  
  const langMap: Record<string, string> = {
    'anglais': 'Anglais',
    'english': 'Anglais',
    'espagnol': 'Espagnol',
    'spanish': 'Espagnol',
    'italien': 'Italien',
    'italian': 'Italien',
    'allemand': 'Allemand',
    'german': 'Allemand',
    'néerlandais': 'Néerlandais',
    'dutch': 'Néerlandais',
    'portugais': 'Portugais',
    'portuguese': 'Portugais',
    'arabe': 'Arabe',
    'arabic': 'Arabe',
    'chinois': 'Chinois',
    'chinese': 'Chinois',
  };
  
  for (const [key, lang] of Object.entries(langMap)) {
    if (textLower.includes(key) && !languages.includes(lang)) {
      languages.push(lang);
    }
  }
  
  // Détecter "bilingue"
  if (textLower.includes('bilingue') && !languages.includes('Bilingue')) {
    languages.push('Bilingue');
  }
  
  return languages;
}

/**
 * Extraction de la disponibilité
 */
function extractAvailability(text: string): string | undefined {
  const patterns = [
    /disponibilité\s*[:\s]+(.*?)(?:\n|$|\.)/i,
    /disponible\s+(.*?)(?:\n|$|\.)/i,
    /(immédiat|immédiate|dès\s+maintenant|dès\s+aujourd['']hui)/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
    if (match && pattern.source.includes('immédiat')) {
      return 'Immédiate';
    }
  }
  
  return undefined;
}

/**
 * Parser intelligent principal
 */
export function smartParse(prompt: string): ParsedJobInfo {
  const text = (prompt || '').toLowerCase();
  const out: ParsedJobInfo = {
    role: '',
    city: '',
    date: '',
    duration: '',
    hourly: '',
    company: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  };

  // Utiliser le parser existant pour les bases
  // (on va améliorer ça progressivement)
  
  // Extraire l'expérience
  const experience = extractExperience(prompt);
  if (experience) {
    out.experience = experience;
  }

  // Extraire les horaires détaillés
  const hours = extractDetailedHours(prompt);
  if (hours.duration) out.duration = hours.duration;
  if (hours.startTime) out.startTime = hours.startTime;
  if (hours.endTime) out.endTime = hours.endTime;

  // Extraire les compétences
  const skills = extractSkills(prompt);
  if (skills.length > 0) {
    out.skills = skills;
  }

  // Extraire l'urgence
  const urgency = extractUrgency(prompt);
  if (urgency) {
    out.urgency = urgency;
  }

  // Extraire les langues
  const languages = extractLanguages(prompt);
  if (languages.length > 0) {
    out.language = languages;
  }

  // Extraire la disponibilité
  const availability = extractAvailability(prompt);
  if (availability) {
    out.availability = availability;
  }

  return out;
}

/**
 * Combine le parsing intelligent avec le parsing existant
 */
export function enhancedSmartParse(prompt: string, existingParser: (text: string) => any): ParsedJobInfo {
  // Utiliser le parser existant pour les bases
  const base = existingParser(prompt);
  
  // Ajouter les informations intelligentes
  const smart = smartParse(prompt);
  
  // Fusionner les résultats
  return {
    ...base,
    ...smart,
    // Préserver les valeurs du parser existant si elles existent
    role: base.role || smart.role,
    city: base.city || smart.city,
    date: base.date || smart.date,
    duration: base.duration || smart.duration,
    hourly: base.hourly || smart.hourly,
    company: base.company || smart.company,
    contactName: base.contactName || smart.contactName,
    contactEmail: base.contactEmail || smart.contactEmail,
    contactPhone: base.contactPhone || smart.contactPhone,
    contractType: base.contractType || smart.contractType,
    missionType: base.missionType || smart.missionType,
    experience: base.experience || smart.experience,
    skills: base.skills || smart.skills,
  };
}

