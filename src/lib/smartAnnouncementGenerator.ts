/**
 * Générateur d'annonces intelligent avec prompts avancés
 * Utilise des templates intelligents et des prompts contextuels
 */

import { generateEnhancedAnnouncement } from './jobTemplates';

interface JobContext {
  role: string;
  city: string;
  date: string;
  duration: string;
  hourly: string;
  contractType?: string;
  missionType?: string;
  experience?: string;
  skills?: string[];
  urgency?: 'normal' | 'urgent' | 'très urgent';
  language?: string[];
  availability?: string;
  company?: string;
}

interface AnnouncementStyle {
  name: string;
  description: string;
  tone: 'professionnel' | 'décontracté' | 'dynamique' | 'formel';
  length: 'court' | 'moyen' | 'long';
  useEmojis: boolean;
}

/**
 * Styles d'annonces disponibles
 */
const ANNOUNCEMENT_STYLES: AnnouncementStyle[] = [
  {
    name: 'Professionnel',
    description: 'Ton formel et structuré',
    tone: 'professionnel',
    length: 'moyen',
    useEmojis: false,
  },
  {
    name: 'Dynamique',
    description: 'Ton énergique et engageant',
    tone: 'dynamique',
    length: 'moyen',
    useEmojis: true,
  },
  {
    name: 'Décontracté',
    description: 'Ton amical et accessible',
    tone: 'décontracté',
    length: 'court',
    useEmojis: true,
  },
  {
    name: 'Détaillé',
    description: 'Description complète et précise',
    tone: 'professionnel',
    length: 'long',
    useEmojis: false,
  },
];

/**
 * Génère un prompt intelligent basé sur le contexte
 */
function generateSmartPrompt(context: JobContext, style: AnnouncementStyle): string {
  const parts: string[] = [];

  // Introduction selon le style
  if (style.tone === 'professionnel') {
    parts.push(`Notre ${context.company || 'établissement'} recherche un(e) ${context.role || 'candidat'}`);
  } else if (style.tone === 'dynamique') {
    parts.push(`🔥 Opportunité ${context.role || 'de travail'} ${context.urgency === 'urgent' || context.urgency === 'très urgent' ? 'URGENTE' : ''}`);
  } else if (style.tone === 'décontracté') {
    parts.push(`On cherche ${context.role ? 'un(e) ' + context.role : 'quelqu\'un'} sympa`);
  } else {
    parts.push(`Recherche ${context.role || 'candidat'}`);
  }

  // Détails de la mission
  const details: string[] = [];
  
  if (context.date) {
    details.push(`Date : ${context.date}`);
  }
  
  if (context.duration) {
    details.push(`Horaires : ${context.duration}`);
  }
  
  if (context.hourly) {
    details.push(`Rémunération : ${context.hourly}`);
  }
  
  if (context.city) {
    details.push(`Lieu : ${context.city}`);
  }

  if (details.length > 0) {
    if (style.useEmojis) {
      parts.push('');
      parts.push(...details.map(d => {
        if (d.includes('Date')) return `📅 ${d.replace('Date : ', '')}`;
        if (d.includes('Horaires')) return `⏰ ${d.replace('Horaires : ', '')}`;
        if (d.includes('Rémunération')) return `💰 ${d.replace('Rémunération : ', '')}`;
        if (d.includes('Lieu')) return `📍 ${d.replace('Lieu : ', '')}`;
        return d;
      }));
    } else {
      parts.push('');
      parts.push('Détails de la mission :');
      details.forEach(d => parts.push(`• ${d}`));
    }
  }

  // Profil recherché
  const requirements: string[] = [];
  
  if (context.experience) {
    requirements.push(context.experience);
  }
  
  if (context.skills && context.skills.length > 0) {
    const maxSkills = style.length === 'long' ? context.skills.length : Math.min(context.skills.length, 5);
    requirements.push(...context.skills.slice(0, maxSkills));
  }
  
  if (context.language && context.language.length > 0) {
    requirements.push(`${context.language.join(', ')} ${context.language.length > 1 ? 'requis' : 'requis'}`);
  }

  if (requirements.length > 0) {
    parts.push('');
    if (style.tone === 'professionnel' || style.tone === 'formel') {
      parts.push('Profil recherché :');
    } else if (style.tone === 'dynamique') {
      parts.push('✅ Ce qu\'on cherche :');
    } else {
      parts.push('On recherche quelqu\'un qui a :');
    }
    
    requirements.forEach(req => {
      if (style.useEmojis && !req.includes('€')) {
        parts.push(`✅ ${req}`);
      } else {
        parts.push(`• ${req}`);
      }
    });
  }

  // Type de contrat
  if (context.contractType || context.missionType) {
    parts.push('');
    const contractInfo = [context.contractType, context.missionType].filter(Boolean).join(' - ');
    if (style.tone === 'professionnel') {
      parts.push(`Type de contrat : ${contractInfo}`);
    } else {
      parts.push(`📋 ${contractInfo}`);
    }
  }

  // Disponibilité
  if (context.availability) {
    parts.push('');
    if (style.tone === 'dynamique') {
      parts.push(`⚡ Disponibilité : ${context.availability}`);
    } else {
      parts.push(`Disponibilité : ${context.availability}`);
    }
  }

  // Urgence
  if (context.urgency === 'urgent' || context.urgency === 'très urgent') {
    parts.push('');
    if (style.tone === 'dynamique') {
      parts.push(`🚨 ${context.urgency === 'très urgent' ? 'TRÈS URGENT' : 'URGENT'} - Démarrage rapide !`);
    } else {
      parts.push(`Mission ${context.urgency} - Démarrage immédiat possible.`);
    }
  }

  // Call to action
  parts.push('');
  if (style.tone === 'professionnel') {
    parts.push('Merci de nous contacter pour plus d\'informations.');
  } else if (style.tone === 'dynamique') {
    parts.push('💼 Intéressé(e) ? Contactez-nous rapidement !');
  } else {
    parts.push('N\'hésitez pas à nous contacter !');
  }

  return parts.join('\n');
}

/**
 * Génère une annonce intelligente avec plusieurs styles
 */
export function generateSmartAnnouncement(context: JobContext): Array<{ style: AnnouncementStyle; title: string; body: string }> {
  const announcements = [];

  // Générer avec le système existant (Recommandé)
  const enhanced = generateEnhancedAnnouncement(
    context.role,
    context.city,
    context.date,
    context.duration,
    context.hourly,
    context.contractType,
    context.missionType,
    context.experience,
    context.skills
  );

  announcements.push({
    style: {
      name: 'Recommandé',
      description: 'Version optimisée avec compétences',
      tone: 'professionnel',
      length: 'moyen',
      useEmojis: false,
    },
    title: enhanced.title,
    body: enhanced.body,
  });

  // Générer avec les nouveaux styles intelligents
  for (const style of ANNOUNCEMENT_STYLES) {
    const title = style.tone === 'dynamique' && context.urgency
      ? `🔥 ${context.role || 'Poste'} ${context.urgency === 'très urgent' ? 'TRÈS URGENT' : 'URGENT'}${context.city ? ` - ${context.city}` : ''}`
      : `${context.role || 'Poste'}${context.city ? ` - ${context.city}` : ''}${context.date ? ` - ${context.date}` : ''}`;

    const body = generateSmartPrompt(context, style);

    announcements.push({
      style,
      title,
      body,
    });
  }

  return announcements;
}

/**
 * Génère une annonce avec un style spécifique
 */
export function generateAnnouncementWithStyle(
  context: JobContext,
  styleName: string
): { title: string; body: string } {
  const style = ANNOUNCEMENT_STYLES.find(s => s.name === styleName) || ANNOUNCEMENT_STYLES[0];
  
  const title = style.tone === 'dynamique' && context.urgency
    ? `🔥 ${context.role || 'Poste'} ${context.urgency === 'très urgent' ? 'TRÈS URGENT' : 'URGENT'}${context.city ? ` - ${context.city}` : ''}`
    : `${context.role || 'Poste'}${context.city ? ` - ${context.city}` : ''}${context.date ? ` - ${context.date}` : ''}`;

  const body = generateSmartPrompt(context, style);

  return { title, body };
}

