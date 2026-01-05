import { getJobByName, getJobLevel } from './jobDetection';

interface JobTemplate {
  keywords: string[];
  defaultDuration: string;
  defaultHourly: string;
  defaultWorkType: 'Temps plein' | 'Temps partiel';
  template: (city: string, date: string, duration: string, hourly: string) => string;
}

const templates: JobTemplate[] = [
  {
    keywords: ['serveur', 'serveuse', 'runner', 'rang'],
    defaultDuration: '',
    defaultHourly: '13€/h',
    defaultWorkType: 'Temps partiel',
    template: (city, date, duration, hourly) =>
      `Notre établissement recherche un(e) serveur/serveuse dynamique. Vous serez responsable de l'accueil des clients, de la prise de commandes et du service en salle. Mission ponctuelle avec possibilité de renouvellement selon disponibilités.`
  },
  {
    keywords: ['hôte', 'hotesse', 'hôtesse', 'accueil', 'hote d\'accueil', 'hotesse d\'accueil', 'hôtesse d\'accueil'],
    defaultDuration: '',
    defaultHourly: '12€/h',
    defaultWorkType: 'Temps plein',
    template: (city, date, duration, hourly) =>
      `Nous recherchons un(e) hôte/hôtesse d'accueil professionnel(le). Vous serez le premier contact de nos visiteurs : accueil, orientation, renseignements. Présentation soignée et excellente communication indispensables. Mission ponctuelle.`
  },
  {
    keywords: ['cuisinier', 'cuisinière', 'chef', 'commis', 'pizzaiolo', 'pâtissier', 'boulanger'],
    defaultDuration: '',
    defaultHourly: '15€/h',
    defaultWorkType: 'Temps partiel',
    template: (city, date, duration, hourly) =>
      `Nous recherchons un(e) cuisinier/cuisinière qualifié(e). Vous serez en charge de la préparation des plats selon nos standards de qualité. Mission ponctuelle avec possibilité de renouvellement.`
  },
  {
    keywords: ['barista', 'barman', 'barmaid', 'sommelier'],
    defaultDuration: '',
    defaultHourly: '14€/h',
    defaultWorkType: 'Temps partiel',
    template: (city, date, duration, hourly) =>
      `Notre établissement recherche un(e) barman/barmaid expérimenté(e). Préparation de cocktails, conseil clientèle, gestion du bar. Connaissance des boissons et techniques de mixologie appréciée. Mission ponctuelle.`
  },
  {
    keywords: ['déménageur', 'déménageuse', 'manutentionnaire'],
    defaultDuration: '',
    defaultHourly: '13€/h',
    defaultWorkType: 'Temps partiel',
    template: (city, date, duration, hourly) =>
      `Recherche déménageur/manutentionnaire pour mission ponctuelle. Chargement, déchargement et transport de mobilier. Bonne condition physique requise pour port de charges lourdes. Travail en équipe. Ponctualité et sérieux exigés.`
  },
  {
    keywords: ['livreur', 'livreuse', 'coursier', 'coursière'],
    defaultDuration: '',
    defaultHourly: '12€/h',
    defaultWorkType: 'Temps partiel',
    template: (city, date, duration, hourly) =>
      `Recherche livreur/livreuse pour mission ponctuelle. Livraison de colis/repas auprès de la clientèle. Véhicule personnel requis (voiture/scooter/vélo selon secteur). Ponctualité, sens de l'orientation et bon relationnel indispensables.`
  },
  {
    keywords: ['magasinier', 'magasinière', 'préparateur', 'préparatrice', 'cariste'],
    defaultDuration: '',
    defaultHourly: '12€/h',
    defaultWorkType: 'Temps plein',
    template: (city, date, duration, hourly) =>
      `Recherche magasinier/ère pour mission ponctuelle. Réception, contrôle et rangement des marchandises. Préparation des commandes selon bons de livraison. Gestion informatique des stocks. Rigueur et organisation indispensables.`
  },
  {
    keywords: ['vendeur', 'vendeuse', 'caissier', 'caissière', 'commercial'],
    defaultDuration: '',
    defaultHourly: '11€/h',
    defaultWorkType: 'Temps partiel',
    template: (city, date, duration, hourly) =>
      `Notre commerce recherche un(e) vendeur/vendeuse. Accueil et conseil clientèle, mise en rayon, encaissement. Vous contribuez à l'expérience d'achat de nos clients. Sens du contact et sourire indispensables.`
  },
  {
    keywords: ['sécurité', 'agent de sécurité', 'vigile', 'gardien', 'surveillance'],
    defaultDuration: '',
    defaultHourly: '13€/h',
    defaultWorkType: 'Temps plein',
    template: (city, date, duration, hourly) =>
      `Recherche agent de sécurité qualifié. Surveillance des locaux, contrôle d'accès, rondes de sécurité. Gestion des incidents et rédaction de rapports. Carte professionnelle en cours de validité OBLIGATOIRE.`
  },
  {
    keywords: ['nettoyage', 'entretien', 'ménage', 'propreté'],
    defaultDuration: '',
    defaultHourly: '11€/h',
    defaultWorkType: 'Temps partiel',
    template: (city, date, duration, hourly) =>
      `Recherche agent d'entretien pour mission ponctuelle. Nettoyage et désinfection des locaux (bureaux, sanitaires, espaces communs). Respect des protocoles d'hygiène. Autonomie, rigueur et discrétion indispensables.`
  }
];

export function findTemplate(role: string): JobTemplate | null {
  const roleLower = (role || '').toLowerCase();
  return templates.find(t => t.keywords.some(k => roleLower.includes(k))) || null;
}

// Compétences spécifiques critiques par type de métier
const criticalSkills: Record<string, string[]> = {
  'livreur': ['Permis B obligatoire', 'Véhicule personnel', 'Sens de l\'orientation', 'Ponctualité'],
  'livreuse': ['Permis B obligatoire', 'Véhicule personnel', 'Sens de l\'orientation', 'Ponctualité'],
  'coursier': ['Permis B ou scooter', 'Véhicule personnel', 'Connaissance du secteur'],
  'chauffeur': ['Permis B ou C selon véhicule', 'Expérience conduite', 'Casier judiciaire vierge'],
  'conducteur': ['Permis adapté au véhicule', 'FIMO/FCO si +3.5T', 'Expérience conduite'],
  'cariste': ['CACES 1-3-5 exigé', 'Expérience chariot élévateur', 'Rigueur et sécurité'],
  'déménageur': ['Bonne condition physique', 'Port de charges lourdes', 'Travail en équipe', 'Permis B apprécié'],
  'sécurité': ['Carte professionnelle obligatoire', 'CQP APS ou équivalent', 'Casier judiciaire vierge', 'SST souhaité'],
  'agent de sécurité': ['Carte professionnelle obligatoire', 'CQP APS ou équivalent', 'Casier judiciaire vierge'],
  'vigile': ['Carte professionnelle obligatoire', 'CQP APS', 'Casier judiciaire vierge'],
  'cuisinier': ['Expérience en cuisine', 'HACCP', 'Normes d\'hygiène', 'Travail sous pression'],
  'cuisinière': ['Expérience en cuisine', 'HACCP', 'Normes d\'hygiène', 'Travail sous pression'],
  'chef': ['Expérience significative', 'Management d\'équipe', 'HACCP', 'Gestion des stocks'],
  'commis': ['Formation cuisine', 'HACCP', 'Esprit d\'équipe', 'Station debout prolongée'],
  'serveur': ['Expérience restauration', 'Sens du service', 'Port de plateaux', 'Travail en équipe'],
  'serveuse': ['Expérience restauration', 'Sens du service', 'Port de plateaux', 'Travail en équipe'],
  'barman': ['Connaissance cocktails', 'Service rapide', 'Hygiène', 'Relation client'],
  'barmaid': ['Connaissance cocktails', 'Service rapide', 'Hygiène', 'Relation client'],
  'vendeur': ['Techniques de vente', 'Sens du contact', 'Connaissance produits', 'Encaissement'],
  'vendeuse': ['Techniques de vente', 'Sens du contact', 'Connaissance produits', 'Encaissement'],
  'caissier': ['Maîtrise caisse', 'Rigueur', 'Rapidité', 'Amabilité'],
  'caissière': ['Maîtrise caisse', 'Rigueur', 'Rapidité', 'Amabilité']
};

function getCriticalSkills(role: string): string[] {
  const roleLower = (role || '').toLowerCase();
  for (const [key, skills] of Object.entries(criticalSkills)) {
    if (roleLower.includes(key)) {
      return skills;
    }
  }
  return [];
}

export function generateEnhancedAnnouncement(
  role: string,
  city: string,
  date: string,
  duration: string,
  hourly: string,
  contractType?: string,
  missionType?: string,
  experience?: string,
  userSkills?: string[]
): { title: string; body: string } {
  const template = findTemplate(role);
  const job = getJobByName(role);

  const roleCap = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Poste';
  const title = `${roleCap}${city ? ` - ${city}` : ''}${date ? ` - ${date}` : ''}`;

  let body = '';

  // Introduction avec template ou générique
  if (template) {
    body = template.template(city, date, duration || template.defaultDuration, hourly || template.defaultHourly);
  } else {
    body = `Recherche ${role || 'candidat'} pour mission ponctuelle${duration ? ` ${duration}` : ''}.`;
  }

  // Section Missions et Responsabilités (si durée ou date spécifiée)
  if (duration || date) {
    body += `\n\n**📋 Missions :**\n`;
    if (duration) {
      body += `• Horaires : ${duration}\n`;
    }
    if (date) {
      body += `• Date de début : ${date}\n`;
    }
    if (template) {
      body += `• Poste à pourvoir rapidement\n`;
    }
  }

  // Compétences : utilisateur d'abord, puis critiques, puis base de données
  const allSkills: string[] = [];

  // Ajouter les skills de l'utilisateur en premier
  if (userSkills && userSkills.length > 0) {
    userSkills.forEach(skill => {
      if (!allSkills.some(s => s.toLowerCase() === skill.toLowerCase())) {
        allSkills.push(skill);
      }
    });
  }

  // Ajouter les compétences critiques
  const critical = getCriticalSkills(role);
  critical.forEach(skill => {
    const skillLower = skill.toLowerCase();
    const isDuplicate = allSkills.some(existing => {
      const existingLower = existing.toLowerCase();
      return existingLower === skillLower ||
             existingLower.includes(skillLower) ||
             skillLower.includes(existingLower);
    });
    if (!isDuplicate) {
      allSkills.push(skill);
    }
  });

  // Ajouter les compétences de la base de données
  const jobSkills = job?.skills || [];
  jobSkills.forEach(skill => {
    const skillLower = skill.toLowerCase();
    const isDuplicate = allSkills.some(existing => {
      const existingLower = existing.toLowerCase();
      return existingLower === skillLower ||
             existingLower.includes(skillLower) ||
             skillLower.includes(existingLower);
    });
    if (!isDuplicate) {
      allSkills.push(skill);
    }
  });

  // Section Profil recherché
  if (allSkills.length > 0 || experience) {
    body += `\n\n**👤 Profil recherché :**\n`;

    // Ajouter l'expérience si fournie
    if (experience) {
      body += `• ${experience}\n`;
    }

    // Ajouter les compétences
    const level = getJobLevel(role);
    const maxSkills = level === 'débutant' ? 5 : level === 'expert' ? 8 : 6;
    const skillsToShow = allSkills.slice(0, maxSkills);

    skillsToShow.forEach(skill => {
      body += `• ${skill}\n`;
    });
  }

  // Section Conditions
  body += `\n\n**💼 Conditions :**\n`;
  const workType = contractType || template?.defaultWorkType || 'Temps partiel';
  const mission = missionType || 'Mission ponctuelle';
  body += `• Type : ${workType} - ${mission}\n`;

  if (hourly) {
    body += `• Rémunération : ${hourly}\n`;
  } else if (template) {
    body += `• Rémunération : ${template.defaultHourly}\n`;
  }

  if (city) {
    body += `• Lieu : ${city}\n`;
  }

  if (date) {
    body += `• Date de début : ${date}\n`;
  }

  // Section Avantages (si applicable)
  if (contractType === 'Temps plein' || missionType === 'CDI') {
    body += `\n**✨ Avantages :**\n`;
    body += `• Mission avec possibilité d'évolution\n`;
    if (hourly && parseInt(hourly) >= 15) {
      body += `• Rémunération attractive\n`;
    }
  }

  return { title, body };
}
