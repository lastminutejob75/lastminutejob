const COMMON_TYPOS: Record<string, string> = {
  'recherhce': 'recherche',
  'recheche': 'recherche',
  'recherch': 'recherche',
  'expérience': 'expérience',
  'expèrience': 'expérience',
  'nécéssaire': 'nécessaire',
  'necessaire': 'nécessaire',
  'nessecaire': 'nécessaire',
  'ponctualité': 'ponctualité',
  'ponctualite': 'ponctualité',
  'sérieux': 'sérieux',
  'serieux': 'sérieux',
  'dynamisme': 'dynamisme',
  'dynamisne': 'dynamisme',
  'rémunération': 'rémunération',
  'remuneration': 'rémunération',
  'rémunaration': 'rémunération',
  'disponibilité': 'disponibilité',
  'disponibilite': 'disponibilité',
  'immédiate': 'immédiate',
  'immediate': 'immédiate',
  'professionel': 'professionnel',
  'professionelle': 'professionnelle',
  'restauration': 'restauration',
  'restaurent': 'restaurant',
};

export function lightSpellCheck(text: string): string {
  let corrected = text;

  Object.entries(COMMON_TYPOS).forEach(([typo, correct]) => {
    const regex = new RegExp(`\\b${typo}\\b`, 'gi');
    corrected = corrected.replace(regex, (match) => {
      if (match[0] === match[0].toUpperCase()) {
        return correct.charAt(0).toUpperCase() + correct.slice(1);
      }
      return correct;
    });
  });

  return corrected;
}

export function formatBullets(text: string): string {
  let lines = text.split('\n');
  let formatted: string[] = [];

  for (let line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('•')) {
      const content = trimmed.substring(1).trim();
      formatted.push(`• ${content}`);
    } else if (/^[\d]+\./.test(trimmed)) {
      formatted.push(trimmed);
    } else if (trimmed) {
      formatted.push(trimmed);
    } else {
      formatted.push('');
    }
  }

  return formatted.join('\n');
}

export function generateShortVariant(role: string, city: string, date: string, duration: string, hourly: string): { title: string; body: string } {
  const roleCap = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Poste';
  const title = `${roleCap}${city ? ` - ${city}` : ''}`;

  const parts: string[] = [];

  if (duration) parts.push(`⏰ ${duration}`);
  if (date) parts.push(`📅 ${date}`);
  if (hourly) parts.push(`💰 ${hourly}`);
  if (city) parts.push(`📍 ${city}`);

  const body = `${roleCap} recherché${role?.toLowerCase().includes('serveuse') || role?.toLowerCase().includes('vendeuse') ? 'e' : ''}.\n\n${parts.join('\n')}\n\nMission ponctuelle. Contactez-nous rapidement !`;

  return { title, body };
}

export function generateImpactfulVariant(role: string, city: string, date: string, duration: string, hourly: string): { title: string; body: string } {
  const roleCap = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Poste';
  const title = `🔥 ${roleCap} Urgent${city ? ` - ${city}` : ''}`;

  let bodyParts: string[] = [];

  bodyParts.push(`Opportunité immédiate pour ${role || 'ce poste'} !`);
  bodyParts.push('');

  const details: string[] = [];
  if (date) details.push(`• Date : ${date}`);
  if (duration) details.push(`• Horaires : ${duration}`);
  if (hourly) details.push(`• Rémunération : ${hourly}`);
  if (city) details.push(`• Lieu : ${city}`);

  if (details.length > 0) {
    bodyParts.push(...details);
    bodyParts.push('');
  }

  bodyParts.push('✅ Mission ponctuelle');
  bodyParts.push('✅ Paiement assuré');
  bodyParts.push('✅ Démarrage rapide');
  bodyParts.push('');
  bodyParts.push('Postulez maintenant !');

  return { title, body: bodyParts.join('\n') };
}

export function generateDetailedVariant(
  role: string, 
  city: string, 
  date: string, 
  duration: string, 
  hourly: string,
  contractType?: string,
  missionType?: string,
  experience?: string,
  skills?: string[]
): { title: string; body: string } {
  const roleCap = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Poste';
  const title = `${roleCap}${city ? ` - ${city}` : ''}${date ? ` - ${date}` : ''}`;

  let bodyParts: string[] = [];

  // Introduction détaillée
  bodyParts.push(`**Offre d'emploi : ${roleCap}**`);
  bodyParts.push('');
  bodyParts.push(`Nous recherchons activement ${role ? 'un(e) ' + role : 'un candidat'} pour rejoindre notre équipe. Cette opportunité s'adresse à une personne ${experience ? experience.toLowerCase() : 'motivée'} souhaitant évoluer dans un environnement dynamique.`);
  bodyParts.push('');

  // Section : Présentation de la mission
  bodyParts.push('**📋 Présentation de la mission**');
  bodyParts.push('');
  
  if (missionType) {
    bodyParts.push(`Type de mission : ${missionType}`);
  }
  if (contractType) {
    bodyParts.push(`Type de contrat : ${contractType}`);
  }
  if (date) {
    bodyParts.push(`Date de début : ${date}`);
  }
  if (duration) {
    bodyParts.push(`Horaires de travail : ${duration}`);
    // Ajouter des détails sur les horaires
    const hoursMatch = duration.match(/(\d{1,2})h[-–](\d{1,2})h/);
    if (hoursMatch) {
      const start = parseInt(hoursMatch[1]);
      const end = parseInt(hoursMatch[2]);
      const totalHours = end - start;
      bodyParts.push(`Durée quotidienne : ${totalHours} heures`);
    }
  }
  if (city) {
    bodyParts.push(`Lieu de travail : ${city}`);
    bodyParts.push(`Accessibilité : Accessible en transports en commun`);
  }
  bodyParts.push('');

  // Section : Rémunération et avantages
  bodyParts.push('**💰 Rémunération et conditions**');
  bodyParts.push('');
  if (hourly) {
    bodyParts.push(`Rémunération horaire : ${hourly}`);
    // Calculer le salaire journalier si possible
    const rateMatch = hourly.match(/(\d+)/);
    const hoursMatch = duration.match(/(\d{1,2})h[-–](\d{1,2})h/);
    if (rateMatch && hoursMatch) {
      const rate = parseInt(rateMatch[1]);
      const start = parseInt(hoursMatch[1]);
      const end = parseInt(hoursMatch[2]);
      const dailyRate = rate * (end - start);
      bodyParts.push(`Rémunération journalière estimée : ${dailyRate}€`);
    }
  } else {
    bodyParts.push('Rémunération : À discuter selon profil et expérience');
  }
  bodyParts.push('• Paiement régulier et sécurisé');
  bodyParts.push('• Environnement de travail agréable');
  bodyParts.push('');

  // Section : Profil recherché (détaillée)
  bodyParts.push('**👤 Profil recherché**');
  bodyParts.push('');
  
  if (experience) {
    bodyParts.push(`Niveau d'expérience requis : ${experience}`);
  } else {
    bodyParts.push('Niveau d\'expérience : Tous niveaux acceptés (formation possible)');
  }
  bodyParts.push('');

  // Compétences spécifiques
  if (skills && skills.length > 0) {
    bodyParts.push('**Compétences requises :**');
    skills.forEach(skill => {
      bodyParts.push(`• ${skill}`);
    });
    bodyParts.push('');
  }

  // Compétences générales
  bodyParts.push('**Qualités personnelles recherchées :**');
  bodyParts.push('• Ponctualité et rigueur professionnelle');
  bodyParts.push('• Motivation et dynamisme');
  bodyParts.push('• Capacité d\'adaptation et polyvalence');
  bodyParts.push('• Esprit d\'équipe et bonne communication');
  bodyParts.push('• Disponibilité immédiate');
  bodyParts.push('');

  // Section : Missions et responsabilités
  bodyParts.push('**🎯 Missions et responsabilités**');
  bodyParts.push('');
  if (role) {
    const roleLower = role.toLowerCase();
    if (roleLower.includes('serveur') || roleLower.includes('serveuse')) {
      bodyParts.push('• Accueil et service des clients');
      bodyParts.push('• Prise de commandes et conseil');
      bodyParts.push('• Service à table et encaissement');
      bodyParts.push('• Maintien de la propreté de la salle');
    } else if (roleLower.includes('cuisinier') || roleLower.includes('cuisinière')) {
      bodyParts.push('• Préparation des plats selon les recettes');
      bodyParts.push('• Respect des normes d\'hygiène et de sécurité alimentaire');
      bodyParts.push('• Gestion des stocks et commandes');
      bodyParts.push('• Collaboration avec l\'équipe en cuisine');
    } else if (roleLower.includes('livreur') || roleLower.includes('livreuse')) {
      bodyParts.push('• Préparation et chargement des commandes');
      bodyParts.push('• Livraison dans les délais impartis');
      bodyParts.push('• Gestion des documents de livraison');
      bodyParts.push('• Respect des règles de sécurité routière');
    } else if (roleLower.includes('sécurité') || roleLower.includes('vigile')) {
      bodyParts.push('• Surveillance des locaux et contrôle d\'accès');
      bodyParts.push('• Prévention des incidents et gestion des situations');
      bodyParts.push('• Rédaction de rapports d\'incidents');
      bodyParts.push('• Application des consignes de sécurité');
    } else {
      bodyParts.push('• Exécution des tâches liées au poste');
      bodyParts.push('• Respect des procédures et consignes');
      bodyParts.push('• Collaboration avec l\'équipe');
    }
  } else {
    bodyParts.push('• Exécution des missions confiées');
    bodyParts.push('• Respect des consignes et procédures');
    bodyParts.push('• Collaboration efficace avec l\'équipe');
  }
  bodyParts.push('');

  // Section : Avantages et conditions
  bodyParts.push('**✨ Avantages**');
  bodyParts.push('• Mission ponctuelle avec possibilité d\'évolution');
  bodyParts.push('• Intégration dans une équipe dynamique');
  bodyParts.push('• Expérience professionnelle enrichissante');
  bodyParts.push('• Horaires adaptés');
  bodyParts.push('');

  // Section : Candidature
  bodyParts.push('**📧 Comment postuler ?**');
  bodyParts.push('Nous vous invitons à nous contacter rapidement pour cette opportunité. Merci de nous transmettre vos coordonnées et votre disponibilité.');
  bodyParts.push('');
  bodyParts.push('Nous étudierons votre candidature avec attention et vous recontacterons dans les plus brefs délais.');

  return { title, body: bodyParts.join('\n') };
}

export interface AnnouncementVariant {
  name: string;
  description: string;
  title: string;
  body: string;
}

import { generateEnhancedAnnouncement } from './jobTemplates';

export function generateAllVariants(role: string, city: string, date: string, duration: string, hourly: string, contractType?: string, missionType?: string, experience?: string, skills?: string[]): AnnouncementVariant[] {
  const enhanced = generateEnhancedAnnouncement(role, city, date, duration, hourly, contractType, missionType, experience, skills);
  const short = generateShortVariant(role, city, date, duration, hourly);
  const impactful = generateImpactfulVariant(role, city, date, duration, hourly);
  const detailed = generateDetailedVariant(role, city, date, duration, hourly, contractType, missionType, experience, skills);

  return [
    {
      name: 'Recommandé',
      description: 'Version optimisée avec compétences',
      title: enhanced.title,
      body: formatBullets(lightSpellCheck(enhanced.body))
    },
    {
      name: 'Court',
      description: 'Version concise et directe',
      title: short.title,
      body: formatBullets(lightSpellCheck(short.body))
    },
    {
      name: 'Impactant',
      description: 'Version dynamique avec émojis',
      title: impactful.title,
      body: formatBullets(lightSpellCheck(impactful.body))
    },
    {
      name: 'Détaillé',
      description: 'Version complète et professionnelle',
      title: detailed.title,
      body: formatBullets(lightSpellCheck(detailed.body))
    }
  ];
}
