import React, { useEffect, useMemo, useState, useRef } from "react";
import ReviewOptimized from './components/ReviewOptimized';
import PrescreenConfig from './components/PrescreenConfig';
import ApplicationPage from './components/ApplicationPage';
import PrescreenModal from './components/PrescreenModal';
import CandidatesPage from './components/CandidatesPage';
import SEO from './components/SEO';
import PostJobPage from './pages/PostJobPage';
import CandidatePage from './pages/CandidatePage';
import NeedWizardPage from './pages/NeedWizardPage';
import HomePage from './pages/Home';
import { UWiLogo } from './components/UWiLogo';
import {
  ChefHat,
  Coffee,
  Utensils,
  Truck,
  Package,
  ShoppingCart,
  Shield,
  Users,
  Clock,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Share2,
  Building2,
  Pencil,
  Trash2,
  Copy,
  Check,
  Zap,
  Save,
  Sparkles,
  ArrowLeft,
  Rocket,
  Quote,
  Star,
  Store,
  Forklift,
  CalendarClock,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  X,
  HelpCircle,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  FileText,
  Upload,
  XCircle
} from "lucide-react";
import { generateEnhancedAnnouncement, findTemplate } from './lib/jobTemplates';
import { generateAllVariants, lightSpellCheck, formatBullets, type AnnouncementVariant } from './lib/textQuality';
import { getAutoCompleteContext, saveDraft, loadDraft, AutoCompleteContext } from './lib/autoComplete';
import { publishJob, getJobs, getJob, updateJob, deleteJob, publishJobWithVerification } from './lib/jobService';
import { detectJob, suggestJobVariations, getDefaultHoursForJob, getDefaultRatesForJob, getCriticalSkillsForJob, getExperienceLevels, getContractTypes, getMissionTypes } from './lib/jobDetection';
import { getPrimaryAndSecondaryJobs, extractContext, computeMissionReadiness, isJobDetectionUncertain, mapJobKeyToJobName, getSuggestedJobsForUncertainty } from './lib/jobSynonymsExtended';
import { detectIntent, type IntentType } from './lib/jobEngine';
import { simpleGenerateAnnouncement, convertLLMResponseToDraft, type SimpleAnnouncementDraft } from './lib/simpleAnnounce';
import { detectSimpleJob } from './lib/simpleJobs';
import { parseLLMResponse } from './lib/llmAnnouncePrompt';
import jobsDataRaw from './lib/uwi_human_jobs_freelance_varied_skills.json';
import { enhancedSmartParse } from './lib/smartParser';
import { generateSmartSuggestions, type SuggestionGroup } from './lib/smartSuggestions';
import { BriefIntake } from './components/BriefIntake';
import AdminDashboard from './components/AdminDashboard';

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, data?: any) => void;
    };
    gtag?: (command: string, event: string, data?: any) => void;
  }
}

async function uwiSuggest(prompt: string) {
  // Utiliser le parser intelligent amélioré
  return enhancedSmartParse(prompt, enhancedLocalParse);
}

async function enhanceCityFRBE(text: string, currentCity: string) {
  if (currentCity && currentCity.trim()) return currentCity;
  const CITIES = [
    "Paris","Marseille","Lyon","Toulouse","Nice","Nantes","Strasbourg","Montpellier","Bordeaux","Lille","Rennes","Reims","Grenoble","Dijon","Angers","Nîmes","Villeurbanne","Saint-Étienne","Toulon","Le Havre","Clermont-Ferrand","Aix-en-Provence","Rouen","Nancy","Metz","Mulhouse","Caen","Tours","Orléans","Amiens","Limoges","Besançon","Perpignan","Brest","Poitiers","Pau","Bayonne","Annecy","La Rochelle","Valenciennes","Dunkerque","Calais","Boulogne-sur-Mer","Béthune","Arras","Lens","Tourcoing","Roubaix","Villeneuve-d'Ascq","Saint-Denis","Argenteuil","Montreuil","Versailles","Vitry-sur-Seine","Nanterre","Créteil","Courbevoie","Colombes","Aulnay-sous-Bois","Rueil-Malmaison","Saint-Maur-des-Fossés","Champigny-sur-Marne","Antony","Levallois-Perret","Neuilly-sur-Seine","Issy-les-Moulineaux","Boulogne-Billancourt","Clamart","Meudon","Suresnes","Clichy","Ivry-sur-Seine","Aubervilliers","Saint-Ouen","Asnières-sur-Seine","Sarcelles","Sevran","Drancy","Noisy-le-Grand","Saint-Quentin","Charleville-Mézières","Chalon-sur-Saône","Mâcon","Bourg-en-Bresse","Chambéry","Valence","Avignon","Albi","Montauban","Tarbes","Narbonne","Béziers","Carcassonne","Perigueux","Brive-la-Gaillarde","Aurillac","Vichy","Saint-Malo","Quimper","Vannes","Lorient","Cholet","Niort","Angoulême","Cognac","Troyes","Épinal","Thionville","Forbach","Colmar","Saint-Nazaire","Choisy-le-Roi",
    "Bruxelles","Brussels","Anvers","Antwerpen","Gand","Gent","Liège","Namur","Charleroi","Louvain","Leuven","Bruges","Brugge","Mons","Tournai","Arlon","La Louvière","Hasselt","Courtrai","Kortrijk","Wavre","Ottignies","Nivelles","Verviers","Seraing","Mouscron","Ostende","Oostende","Roulers","Roeselare","Malines","Mechelen","Genk","Aalst","Alost","Saint-Nicolas","Sint-Niklaas","Laeken","Schaerbeek","Schaarbeek","Anderlecht","Molenbeek","Ixelles","Elsene","Etterbeek","Uccle","Ukkel","Woluwe-Saint-Lambert","Sint-Lambrechts-Woluwe","Woluwe-Saint-Pierre","Sint-Pieters-Woluwe"
  ];
  const m = CITIES.find(c => new RegExp(`\\b${c}\\b`, "i").test(text || ""));
  return m || currentCity || "";
}

const MONTHS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
const WEEKDAYS = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
function capWeekday(s = ""){return s ? s.charAt(0).toUpperCase()+s.slice(1).toLowerCase() : ""}
function capWords(s = ""){return s.replace(/\S[^\s-]*/g, w => w[0].toUpperCase()+w.slice(1).toLowerCase())}
function fmtDayMonth(d: Date){return `${d.getDate()} ${MONTHS[d.getMonth()]}`}
function fmtWeekdayDayMonth(d: Date){return `${WEEKDAYS[d.getDay()]} ${fmtDayMonth(d)}`}
function toISODate(d: Date){const y=d.getFullYear();const m=String(d.getMonth()+1).padStart(2,"0");const dd=String(d.getDate()).padStart(2,"0");return `${y}-${m}-${dd}`}
function isoToFrPretty(iso = ""){if(!/^\d{4}-\d{2}-\d{2}$/.test(iso))return"";const [y,m,d]=iso.split("-").map(Number);const dt=new Date(y,m-1,d);dt.setHours(0,0,0,0);return fmtWeekdayDayMonth(dt)}
function dFromNow(n:number){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);return d}
function nextWeekday(target:number){const t=new Date();t.setHours(0,0,0,0);const delta=(target-t.getDay()+7)%7||7;const d=new Date(t);d.setDate(t.getDate()+delta);return d}

function getHolidayPeriod(text: string): Date[] | null {
  const t = text.toLowerCase();
  const now = new Date();
  const currentYear = now.getFullYear();

  if (/vacances?\s+(?:de\s+)?noël|noël|fêtes?\s+(?:de\s+)?fin\s+(?:d[''\u2019])?année/i.test(t)) {
    const year = now.getMonth() >= 10 ? currentYear : currentYear - 1;
    return [
      new Date(year, 11, 20),
      new Date(year, 11, 21),
      new Date(year, 11, 22),
      new Date(year, 11, 23),
      new Date(year, 11, 24),
      new Date(year, 11, 27),
      new Date(year, 11, 28),
      new Date(year, 11, 29),
      new Date(year, 11, 30)
    ];
  }

  if (/(?:week[\s-]*end|we)\s+(?:de\s+)?(?:la\s+)?toussaint|toussaint/i.test(t)) {
    const year = now.getMonth() >= 10 ? currentYear + 1 : currentYear;
    const toussaint = new Date(year, 10, 1);
    const dayOfWeek = toussaint.getDay();
    const saturdayBefore = new Date(year, 10, 1 - ((dayOfWeek + 1) % 7));
    const sundayBefore = new Date(year, 10, 1 - (dayOfWeek % 7));
    const saturdayAfter = new Date(year, 10, 1 + (6 - dayOfWeek));
    const sundayAfter = new Date(year, 10, 1 + (7 - dayOfWeek));

    return [
      saturdayBefore,
      sundayBefore,
      toussaint,
      saturdayAfter,
      sundayAfter
    ].filter(d => d.getMonth() === 10).sort((a, b) => a.getTime() - b.getTime());
  }

  if (/vacances?\s+(?:de\s+)?pâques|été|juillet|août/i.test(t)) {
    if (t.includes('été') || t.includes('juillet') || t.includes('août')) {
      const year = now.getMonth() < 6 ? currentYear : currentYear + 1;
      return [
        new Date(year, 6, 15),
        new Date(year, 6, 20),
        new Date(year, 6, 25),
        new Date(year, 7, 1),
        new Date(year, 7, 15)
      ];
    }
  }

  return null;
}

function dateChoices(){const a=dFromNow(0),b=dFromNow(1),c=nextWeekday(6),d=nextWeekday(0);return[
  {label:fmtWeekdayDayMonth(a),val:fmtWeekdayDayMonth(a)},
  {label:fmtWeekdayDayMonth(b),val:fmtWeekdayDayMonth(b)},
  {label:`Samedi ${fmtDayMonth(c)}`,val:fmtWeekdayDayMonth(c)},
  {label:`Dimanche ${fmtDayMonth(d)}`,val:fmtWeekdayDayMonth(d)},
]}

function isValidEmail(s=""){const e=(s||"").trim();if(!e||!e.includes("@"))return false;const [l,dom]=e.split("@");if(!l||!dom||!dom.includes("."))return false;return dom.split(".").pop()!.length>=2}
function isValidPhone(s=""){return /^\+?\d[\d\s]{5,14}$/.test(s||"")}

function extractDateFr(text=""){
  const t=(text||"").toLowerCase();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Dates relatives (demain, après-demain, etc.)
  if (/\bdemain\b/.test(t)) {
    return fmtWeekdayDayMonth(dFromNow(1));
  }
  if (/\baprès[-\s]?demain\b/.test(t)) {
    return fmtWeekdayDayMonth(dFromNow(2));
  }
  if (/\baujourd['']hui\b/.test(t)) {
    return fmtWeekdayDayMonth(dFromNow(0));
  }
  
  // Jours de la semaine (lundi, mardi, etc.)
  const weekdayMap: Record<string, number> = {
    'dimanche': 0, 'lundi': 1, 'mardi': 2, 'mercredi': 3,
    'jeudi': 4, 'vendredi': 5, 'samedi': 6
  };
  for (const [day, dayNum] of Object.entries(weekdayMap)) {
    if (new RegExp(`\\b${day}\\b`).test(t)) {
      return fmtWeekdayDayMonth(nextWeekday(dayNum));
    }
  }

  // Périodes de vacances
  const holidayDates = getHolidayPeriod(text);
  if (holidayDates && holidayDates.length > 0) {
    const nextDate = holidayDates.find(d => d >= today);
    if (nextDate) {
      return fmtWeekdayDayMonth(nextDate);
    }
  }

  // Dates complètes : "Lundi 15 janvier"
  const months=MONTHS.join("|");
  const wds=WEEKDAYS.map(w=>w.toLowerCase()).join("|");
  const reFull=new RegExp(`\\b(${wds})\\s+(\\d{1,2})\\s+(${months})(?:\\s+(\\d{4}))?\\b`, "i");
  const m1=t.match(reFull);
  if(m1){
    const day = parseInt(m1[2],10);
    const month = MONTHS.indexOf(m1[3].toLowerCase());
    const year = m1[4] ? parseInt(m1[4],10) : today.getFullYear();
    const date = new Date(year, month, day);
    if (date >= today) {
      return `${capWeekday(m1[1])} ${day} ${m1[3].toLowerCase()}`;
    }
  }
  
  // Dates partielles : "15 janvier"
  const reDM=new RegExp(`\\b(\\d{1,2})\\s+(${months})(?:\\s+(\\d{4}))?\\b`, "i");
  const m2=t.match(reDM);
  if(m2){
    const day = parseInt(m2[1],10);
    const month = MONTHS.indexOf(m2[2].toLowerCase());
    const year = m2[3] ? parseInt(m2[3],10) : today.getFullYear();
    const date = new Date(year, month, day);
    if (date >= today) {
      return `${day} ${m2[2].toLowerCase()}`;
    }
  }
  
  // Dates numériques : "15/01" ou "15/01/2024"
  const m3=t.match(/\b([0-3]?\d)[\/\-]([01]?\d)(?:[\/\-](\d{2,4}))?/);
  if(m3){
    const d=parseInt(m3[1],10);
    const m=parseInt(m3[2],10);
    const y=m3[3]? (m3[3].length===2?2000+parseInt(m3[3],10):parseInt(m3[3],10)):today.getFullYear();
    const date = new Date(y, m-1, d);
    if (date >= today && d <= 31 && m >= 1 && m <= 12) {
      const dayStr = m3[1].padStart(2,"0");
      const monthStr = m3[2].padStart(2,"0");
      return y !== today.getFullYear() ? `${dayStr}/${monthStr}/${y}` : `${dayStr}/${monthStr}`;
    }
  }
  
  return "";
}

function enhancedLocalParse(prompt:string){
  const text=(prompt||"").toLowerCase();
  const out:any={role:"",city:"",date:"",duration:"",hourly:"",company:"",contactName:"",contactEmail:"",contactPhone:""};

  // Détection améliorée avec plusieurs tentatives
  let detectedJob = detectJob(text);
  
  // Si pas de détection, essayer avec des variations
  if (!detectedJob) {
    // Essayer avec des mots-clés communs qui correspondent aux métiers de la base
    const jobKeywords: Record<string, string> = {
      // Restauration
      'serveur': 'Serveur / Serveuse', 'serveuse': 'Serveur / Serveuse',
      'cuisinier': 'Cuisinier', 'cuisiniere': 'Cuisinier', 'cuisine': 'Cuisinier',
      'chef': 'Chef cuisinier', 'chef de cuisine': 'Chef cuisinier',
      'commis': 'Commis de cuisine', 'commis de cuisine': 'Commis de cuisine',
      'plongeur': 'Plongeur', 'plongeuse': 'Plongeur',
      'barman': 'Barman / Barmaid', 'barmaid': 'Barman / Barmaid', 'barista': 'Barista',
      'sommelier': 'Sommelier',
      'chef de rang': 'Chef de rang', 'chef rang': 'Chef de rang',
      'runner': 'Runner', 'runner restaurant': 'Runner',
      'hôte': 'Hôte / Hôtesse d\'accueil', 'hôtesse': 'Hôte / Hôtesse d\'accueil', 'hôtesse d\'accueil': 'Hôte / Hôtesse d\'accueil',
      // Hôtellerie
      'réceptionniste': 'Réceptionniste', 'receptionniste': 'Réceptionniste',
      'femme de chambre': 'Femme de chambre', 'valet de chambre': 'Valet de chambre',
      'concierge': 'Concierge',
      // Livraison/Transport
      'livreur': 'Livreur / Livreuse', 'livreuse': 'Livreur / Livreuse',
      'coursier': 'Coursier / Coursière', 'courriere': 'Coursier / Coursière',
      'chauffeur': 'Chauffeur / Chauffeuse', 'chauffeuse': 'Chauffeur / Chauffeuse',
      'conducteur': 'Chauffeur / Chauffeuse',
      'déménageur': 'Déménageur / Déménageuse', 'demenageur': 'Déménageur / Déménageuse',
      // Commerce
      'vendeur': 'Vendeur / Vendeuse', 'vendeuse': 'Vendeur / Vendeuse',
      'caissier': 'Caissier / Caissière', 'caissiere': 'Caissier / Caissière',
      'conseiller': 'Conseiller / Conseillère de vente', 'conseillere': 'Conseiller / Conseillère de vente',
      'commercial': 'Commercial / Commerciale', 'commerciale': 'Commercial / Commerciale',
      // Sécurité
      'agent de sécurité': 'Agent de sécurité', 'agent securite': 'Agent de sécurité',
      'vigile': 'Agent de sécurité', 'gardien': 'Agent de sécurité', 'surveillance': 'Agent de sécurité',
      // Entretien
      'nettoyage': 'Agent d\'entretien', 'nettoyeur': 'Agent d\'entretien', 'nettoyeuse': 'Agent d\'entretien',
      'ménage': 'Agent d\'entretien', 'menage': 'Agent d\'entretien',
      'entretien': 'Agent d\'entretien', 'agent entretien': 'Agent d\'entretien',
      // Logistique
      'cariste': 'Cariste', 'magasinier': 'Magasinier / Magasinière', 'magasiniere': 'Magasinier / Magasinière',
      'préparateur': 'Préparateur / Préparatrice de commandes', 'preparateur': 'Préparateur / Préparatrice de commandes',
      'manutentionnaire': 'Manutentionnaire', 'manutention': 'Manutentionnaire',
      // Immobilier
      'agent immobilier': 'Agent immobilier', 'conseiller immobilier': 'Agent immobilier',
      'negociateur immobilier': 'Agent immobilier', 'immobilier': 'Agent immobilier',
      // Divers
      'agent': 'Agent polyvalent', 'polyvalent': 'Agent polyvalent',
      'ouvrier': 'Ouvrier / Ouvrière', 'ouvriere': 'Ouvrier / Ouvrière',
      'manœuvre': 'Manœuvre', 'manoeuvre': 'Manœuvre'
    };

    // Chercher les mots-clés dans le texte
    for (const [keyword, jobName] of Object.entries(jobKeywords)) {
      if (text.includes(keyword)) {
        detectedJob = jobName;
        break;
      }
    }
    
    // Si toujours pas de détection, essayer de détecter n'importe quel mot qui pourrait être un métier
    // en cherchant dans la base de données avec une correspondance plus flexible
    if (!detectedJob) {
      // Extraire les mots significatifs du texte (exclure les mots communs)
      const words = text.split(/\s+/).filter(w => 
        w.length >= 4 && 
        !['pour', 'avec', 'sans', 'dans', 'chez', 'recherche', 'cherche', 'besoin', 'disponible', 'dispo'].includes(w)
      );
      
      // Chercher chaque mot dans les noms de métiers de la base
      for (const word of words) {
        const jobMatch = detectJob(word);
        if (jobMatch) {
          detectedJob = jobMatch;
          break;
        }
      }
    }
  }

  if (detectedJob) {
    out.role = detectedJob;
  }

  // Liste étendue de villes avec arrondissements et codes postaux
  const CITIES=[
    "Paris","Marseille","Lyon","Toulouse","Nice","Nantes","Strasbourg","Montpellier","Bordeaux","Lille","Rennes","Reims","Grenoble","Dijon","Angers","Nîmes","Villeurbanne","Saint-Étienne","Toulon","Le Havre","Clermont-Ferrand","Aix-en-Provence","Rouen","Nancy","Metz","Mulhouse","Caen","Tours","Orléans","Amiens","Limoges","Besançon","Perpignan","Brest","Poitiers","Pau","Bayonne","Annecy","La Rochelle","Valenciennes","Dunkerque","Calais","Boulogne-sur-Mer","Béthune","Arras","Lens","Tourcoing","Roubaix","Villeneuve-d'Ascq","Saint-Denis","Argenteuil","Montreuil","Versailles","Vitry-sur-Seine","Nanterre","Créteil","Courbevoie","Colombes","Aulnay-sous-Bois","Rueil-Malmaison","Saint-Maur-des-Fossés","Champigny-sur-Marne","Antony","Levallois-Perret","Neuilly-sur-Seine","Issy-les-Moulineaux","Boulogne-Billancourt","Clamart","Meudon","Suresnes","Clichy","Ivry-sur-Seine","Aubervilliers","Saint-Ouen","Asnières-sur-Seine","Sarcelles","Sevran","Drancy","Noisy-le-Grand","Saint-Quentin","Charleville-Mézières","Chalon-sur-Saône","Mâcon","Bourg-en-Bresse","Chambéry","Valence","Avignon","Albi","Montauban","Tarbes","Narbonne","Béziers","Carcassonne","Perigueux","Brive-la-Gaillarde","Aurillac","Vichy","Saint-Malo","Quimper","Vannes","Lorient","Cholet","Niort","Angoulême","Cognac","Troyes","Épinal","Thionville","Forbach","Colmar","Saint-Nazaire","Choisy-le-Roi",
    "Bruxelles","Brussels","Anvers","Antwerpen","Gand","Gent","Liège","Namur","Charleroi","Louvain","Leuven","Bruges","Brugge","Mons","Tournai","Arlon","La Louvière","Hasselt","Courtrai","Kortrijk","Wavre","Ottignies","Nivelles","Verviers","Seraing","Mouscron","Ostende","Oostende","Roulers","Roeselare","Malines","Mechelen","Genk","Aalst","Alost","Saint-Nicolas","Sint-Niklaas","Laeken","Schaerbeek","Schaarbeek","Anderlecht","Molenbeek","Ixelles","Elsene","Etterbeek","Uccle","Ukkel","Woluwe-Saint-Lambert","Sint-Lambrechts-Woluwe","Woluwe-Saint-Pierre","Sint-Pieters-Woluwe"
  ];
  
  // Détection de ville avec arrondissements (ex: "Paris 15", "Paris 15e", "75015")
  const arrondissementMatch = prompt.match(/\b(paris|lyon|marseille)\s+(\d{1,2})(?:e|ème|er)?\b/i);
  if (arrondissementMatch) {
    const city = arrondissementMatch[1].charAt(0).toUpperCase() + arrondissementMatch[1].slice(1).toLowerCase();
    const arr = arrondissementMatch[2];
    if (CITIES.includes(city)) {
      out.city = `${city} ${arr}e`;
    }
  }
  
  // Détection par code postal (ex: "75001", "69001", "13001")
  const postalCodeMatch = prompt.match(/\b(75|69|13|33|31|59|06|67|44|35|57|38|37|45|63|42|69|01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|2[0-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9])\d{3}\b/);
  if (postalCodeMatch && !out.city) {
    const code = postalCodeMatch[0];
    const cityMap: Record<string, string> = {
      '75': 'Paris', '69': 'Lyon', '13': 'Marseille', '33': 'Bordeaux',
      '31': 'Toulouse', '59': 'Lille', '06': 'Nice', '67': 'Strasbourg',
      '44': 'Nantes', '35': 'Rennes', '57': 'Metz', '38': 'Grenoble',
      '37': 'Tours', '45': 'Orléans', '63': 'Clermont-Ferrand', '42': 'Saint-Étienne'
    };
    const prefix = code.substring(0, 2);
    if (cityMap[prefix]) {
      out.city = cityMap[prefix];
      // Si Paris, Lyon ou Marseille, ajouter l'arrondissement
      if (prefix === '75' && code.length === 5) {
        const arr = parseInt(code.substring(2, 4));
        if (arr >= 1 && arr <= 20) {
          out.city = `Paris ${arr}e`;
        }
      } else if (prefix === '69' && code.length === 5) {
        const arr = parseInt(code.substring(2, 4));
        if (arr >= 1 && arr <= 9) {
          out.city = `Lyon ${arr}e`;
        }
      } else if (prefix === '13' && code.length === 5) {
        const arr = parseInt(code.substring(2, 4));
        if (arr >= 1 && arr <= 16) {
          out.city = `Marseille ${arr}e`;
        }
      }
    }
  }
  
  // Détection normale par nom de ville
  if (!out.city) {
    const c = CITIES.find(c => new RegExp(`\\b${c.replace(/[-\s]/g, '[\\s-]?')}\\b`, "i").test(prompt));
    if (c) out.city = c;
  }

  const dt=extractDateFr(prompt); if(dt) out.date=dt;
  
  // Extraction horaires - formats variés
  // Format "18h-23h", "18h - 23h", "18h00-23h00", "18:00-23:00", "de 18h à 23h"
  const hourPatterns = [
    /(\d{1,2})h\s*[-–]\s*(\d{1,2})h/i,
    /(\d{1,2})h\s*(\d{2})?\s*[-–]\s*(\d{1,2})h\s*(\d{2})?/i,
    /(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/i,
    /de\s+(\d{1,2})h\s+à\s+(\d{1,2})h/i,
    /(\d{1,2})h\s+à\s+(\d{1,2})h/i,
    /(\d{1,2})h\s+(\d{1,2})h/i
  ];
  
  for (const pattern of hourPatterns) {
    const hrs = text.match(pattern);
    if (hrs) {
      const start = parseInt(hrs[1], 10);
      const end = parseInt(hrs[hrs.length - 1] || hrs[2], 10);
      if (start >= 0 && start <= 23 && end >= 0 && end <= 23 && end > start) {
        out.duration = `${start}h–${end}h`;
        break;
      }
    }
  }
  
  // Extraction rémunération - formats variés
  // "15€/h", "15 euros/heure", "15€ par heure", "15€ heure", "15€h"
  // Si plusieurs montants sont présents, prendre le dernier (le plus récent) ou le plus élevé
  const ratePatterns = [
    /(\d{2,3})\s*(?:€|eur|euros?)\s*\/\s*h(?:eure)?s?/gi,
    /(\d{2,3})\s*(?:€|eur|euros?)\s+par\s+heure/gi,
    /(\d{2,3})\s*(?:€|eur|euros?)\s+heure/gi,
    /(\d{2,3})\s*€h/gi,
    /(\d{2,3})\s*(?:€|eur|euros?)\s*\/\s*heure/gi,
    /rémunération[:\s]+(\d{2,3})\s*(?:€|eur|euros?)/gi,
    /salaire[:\s]+(\d{2,3})\s*(?:€|eur|euros?)/gi
  ];
  
  const allRates: Array<{amount: number, position: number}> = [];
  
  for (const pattern of ratePatterns) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      const amount = parseInt(match[1], 10);
      if (amount >= 10 && amount <= 200) {
        allRates.push({
          amount,
          position: match.index || 0
        });
      }
    }
  }
  
  if (allRates.length > 0) {
    // Si plusieurs montants, prendre le dernier (le plus récent dans le texte)
    // ou le plus élevé si les montants sont proches
    const sortedByPosition = [...allRates].sort((a, b) => b.position - a.position);
    const lastRate = sortedByPosition[0];
    
    // Si le dernier montant est significativement plus élevé, le prendre
    // Sinon, prendre le dernier
    const maxRate = Math.max(...allRates.map(r => r.amount));
    const chosenAmount = (maxRate - lastRate.amount <= 3) ? lastRate.amount : maxRate;
    
    out.hourly = `${chosenAmount}€/h`;
  }

  // Extraire les informations des suggestions
  const contractTypeMatch = prompt.match(/temps\s+(plein|partiel)/i);
  if(contractTypeMatch) out.contractType = `Temps ${contractTypeMatch[1].toLowerCase()}`;

  const missionTypeMatch = prompt.match(/\b(cdi|cdd|mission|mission ponctuelle)\b/i);
  if(missionTypeMatch) out.missionType = missionTypeMatch[1];

  const experienceMatch = prompt.match(/(débutant|1 an d['']expérience|2 ans d['']expérience)/i);
  if(experienceMatch) out.experience = experienceMatch[1];

  // Extraire les skills mentionnées (après les tirets)
  const parts = prompt.split(' - ').map(p => p.trim());
  const skills: string[] = [];

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    // Ignorer les parties qui sont clairement pas des skills
    if (!part.match(/temps\s+(plein|partiel)/i) &&
        !part.match(/\b(cdi|cdd|mission|mission ponctuelle)\b/i) &&
        !part.match(/\d+€\/h/i) &&
        !part.match(/\d{1,2}h\s*[-–]\s*\d{1,2}h/) &&
        !part.match(/^\d+\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)/i) &&
        !CITIES.some(city => part.toLowerCase().includes(city.toLowerCase())) &&
        part.length > 2 && part.length < 50) {
      skills.push(part);
    }
  }

  if (skills.length > 0) {
    out.skills = skills;
  }

  const companyPatterns = [
    /(?:chez|pour)\s+(?:le|la|l[''])\s+([A-ZÀ-ÿ][\w\s'-]{2,30}?)(?=\s+(?:à|au|en|recherche|cherche|recrute|demain|le|du|pour|$))/i,
    /(?:chez|pour)\s+([A-ZÀ-ÿ][\w\s'-]{2,30}?)(?=\s+(?:à|au|en|recherche|cherche|recrute|demain|le|du|pour|$))/i,
    /(?:restaurant|café|bar|brasserie|hôtel|magasin|boutique|centre|entreprise)\s+(?:le|la|l[''])\s+([A-ZÀ-ÿ][\w\s'-]{2,30}?)(?=\s+(?:à|au|en|recherche|cherche|recrute|demain|le|du|pour|$))/i,
    /(?:restaurant|café|bar|brasserie|hôtel|magasin|boutique|centre|entreprise)\s+([A-ZÀ-ÿ][\w\s'-]{2,30}?)(?=\s+(?:à|au|en|recherche|cherche|recrute|demain|le|du|pour|$))/i,
    /établissement\s+([A-ZÀ-ÿ][\w\s'-]{2,30}?)(?=\s+(?:à|au|en|recherche|cherche|recrute|demain|le|du|pour|$))/i,
    /([A-ZÀ-ÿ][\w\s'-]{2,30}?)\s+(?:recherche|recrute|cherche)/i
  ];

  const isValidCompanyName = (candidate: string): boolean => {
    const candidateLower = candidate.toLowerCase();
    if(/\d{1,2}h/.test(candidateLower)) return false;
    if(/\d{1,2}h\s*[-–]\s*\d{1,2}h/.test(candidateLower)) return false;
    if(/^\d/.test(candidate)) return false;
    if(CITIES.some(city => city.toLowerCase() === candidateLower)) return false;
    return true;
  };

  for(const pattern of companyPatterns){
    const match = prompt.match(pattern);
    if(match && match[1]){
      const candidate = match[1].trim();
      if(isValidCompanyName(candidate)){
        out.company = candidate;
        break;
      }
    }
  }

  if(!out.company && out.city){
    const afterCityRegex = new RegExp(`\\b${out.city}\\b\\s+([A-ZÀ-ÿ][\\w\\s'-]{2,30}?)(?=\\s|$)`, 'i');
    const matchAfterCity = prompt.match(afterCityRegex);
    if(matchAfterCity && matchAfterCity[1]){
      const candidate = matchAfterCity[1].trim();
      const candidateLower = candidate.toLowerCase();
      const isCommonWord = /^(pour|recherche|cherche|recrute|demain|le|la|les|un|une|des|du|de)$/i.test(candidate);

      if(isValidCompanyName(candidate) && !isCommonWord){
        const words = candidate.split(/\s+/);
        const firstWord = words[0];
        if(firstWord && firstWord.length >= 3){
          out.company = firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
        }
      }
    }
  }

  const emailMatch = prompt.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  if(emailMatch) out.contactEmail = emailMatch[0];

  const phoneMatch = prompt.match(/(?:\+33|0)[\s.-]?[1-9](?:[\s.-]?\d{2}){4}/);
  if(phoneMatch) out.contactPhone = phoneMatch[0].replace(/[\s.-]/g, '');

  const namePatterns = [
    /contact[:\s]+([A-ZÀ-ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-ÿ][a-zà-ÿ]+)?)/i,
    /(?:M\.|Mme|Mr)\s+([A-ZÀ-ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-ÿ][a-zà-ÿ]+)?)/
  ];
  for(const pattern of namePatterns){
    const match = prompt.match(pattern);
    if(match && match[1]){
      out.contactName = match[1].trim();
      break;
    }
  }

  return out;
}

function genAnnouncement({role,city,date,duration,hourly,contractType,missionType,experience,skills}:{role:string;city:string;date:string;duration:string;hourly:string;contractType?:string;missionType?:string;experience?:string;skills?:string[];}){
  return generateEnhancedAnnouncement(role, city, date, duration, hourly, contractType, missionType, experience, skills);
}

function iconForRole(role:string){
  const r=(role||"").toLowerCase();
  if(r.includes("déménag")||r.includes("demenag")||r.includes("livreur")||r.includes("livreuse")||r.includes("coursier")||r.includes("chauffeur")||r.includes("conducteur")) return Truck;
  if(r.includes("serveur")||r.includes("rang")||r.includes("hôte")||r.includes("runner")) return Utensils;
  if(r.includes("barista")||r.includes("barman")||r.includes("barmaid")||r.includes("sommelier")) return Coffee;
  if(r.includes("cuisin")||r.includes("chef")||r.includes("commis")||r.includes("pizzaiolo")||r.includes("pâtiss")||r.includes("boulang")) return ChefHat;
  if(r.includes("magasin")||r.includes("logist")||r.includes("prépar")||r.includes("prepar")||r.includes("cariste")||r.includes("manutent")) return Package;
  if(r.includes("vendeur")||r.includes("vendeuse")||r.includes("caisse")||r.includes("commercial")) return ShoppingCart;
  if(r.includes("sécur")||r.includes("secur")||r.includes("vigile")||r.includes("gardien")||r.includes("surveillance")) return Shield;
  if(r.includes("nettoy")||r.includes("entretien")||r.includes("ménage")||r.includes("propreté")) return Sparkles;
  return Users;
}

function generateSecret(){return Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2)}

function Chip({children,onClick}:{children:React.ReactNode;onClick:()=>void}){return <button onClick={onClick} className="px-2.5 sm:px-3 py-1.5 rounded-full border text-xs sm:text-sm bg-white hover:bg-blue-50 active:bg-blue-100 shadow-sm touch-manipulation">{children}</button>}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="block text-xs sm:text-sm"> <div className="text-gray-600 mb-1">{label}</div>{children}</label>}
function Input({value,onChange,type="text",placeholder}:{value:string;onChange:(v:string)=>void;type?:string;placeholder?:string}){return <input type={type} value={value} placeholder={placeholder} onChange={e=>onChange((e.target as HTMLInputElement).value)} className="w-full px-3 py-2.5 sm:py-2 border rounded-lg text-sm touch-manipulation"/>}

function Nav({goHome,goList,user}:{goHome:()=>void;goList:()=>void;user:any}){
  const [currentRoute, setCurrentRoute] = useState<string>('');
  
  useEffect(() => {
    const updateRoute = () => {
      setCurrentRoute(window.location.hash.replace(/^#\/?/, '') || 'landing');
    };
    updateRoute();
    window.addEventListener('hashchange', updateRoute);
    return () => window.removeEventListener('hashchange', updateRoute);
  }, []);
  
  const goToLanding = () => {
    window.location.hash = "#/landing";
  };
  
  const toggleRoute = () => {
    if (currentRoute === 'candidates') {
      window.location.hash = '#/landing';
    } else {
      window.location.hash = '#/candidates';
    }
  };
  
  return (
    <div className="w-full border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between">
        <button 
          onClick={goToLanding}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl grid place-items-center text-white font-bold text-[10px]" style={{ backgroundColor: COLORS.blue }}>LMJ</div>
          <span className="font-semibold text-sm sm:text-base">LastMinuteJob</span>
          <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-semibold"><UWiLogo size="sm" /></span>
        </button>
        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
          <button onClick={goList} className="hover:underline px-2 py-1 text-slate-600 hover:text-blue-600 transition-colors">Annonces</button>
          <button 
            onClick={toggleRoute}
            className="hover:underline px-2 py-1 hidden sm:inline text-slate-600 hover:text-blue-600 transition-colors"
          >
            {currentRoute === 'candidates' ? 'Publier' : 'Trouver une mission'}
          </button>
          <button 
            onClick={toggleRoute}
            className="hover:underline px-2 py-1 sm:hidden text-slate-600 hover:text-blue-600 transition-colors"
          >
            {currentRoute === 'candidates' ? '+' : '🔍'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Home({onGenerated}:{onGenerated:(p:any,txt:string)=>void}){
  const [text,setText]=useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const example="Agent de sécurité à Lille samedi 7 mars 18h–23h 15€/h";
  const [loading,setLoading]=useState(false);
  const [autoContext, setAutoContext] = useState<AutoCompleteContext>({});
  const [showQuickPublish, setShowQuickPublish] = useState(false);
  const [suggestionGroups, setSuggestionGroups] = useState<SuggestionGroup[]>([]);
  const [adjustableValues, setAdjustableValues] = useState<Map<string, {type: 'rate'|'hours'|'date', value: number|{start: number, end: number}}>>(new Map());
  const [showCustomRate, setShowCustomRate] = useState(false);
  const [customRate, setCustomRate] = useState("");
  const [showCustomDate, setShowCustomDate] = useState(false);

  const setTextAndFocus = (newText: string) => {
    setText(newText);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  useEffect(() => {
    getAutoCompleteContext().then(setAutoContext);
  }, []);

  useEffect(() => {
    // Réinitialiser les champs personnalisés quand le texte change
    setShowCustomRate(false);
    setCustomRate("");
    setShowCustomDate(false);

    // Utiliser le nouveau système de suggestions intelligentes
    const groups = generateSmartSuggestions(text, autoContext);
    setSuggestionGroups(groups);
  }, [text, autoContext]);

  const canQuickPublish = text.trim().length > 15;
  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 md:py-8">
      <div className="grid lg:grid-cols-5 gap-4 md:gap-6">
        <div className="lg:col-span-3">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-2 sm:mb-3">Décrivez votre besoin</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4"><UWiLogo size="sm" className="font-semibold" /> transforme une phrase en annonce complète et vous aide à compléter les détails.</p>
          <div className="p-4 sm:p-5 rounded-2xl border bg-white shadow-sm">
            <textarea ref={textareaRef} value={text} onChange={e=>setText((e.target as HTMLTextAreaElement).value)} placeholder={example} className="w-full h-32 sm:h-36 resize-none outline-none text-base sm:text-lg"/>

            {suggestionGroups.length > 0 && (
              <div className="mt-3 pb-3 border-b space-y-3">
                {suggestionGroups.map((group, groupIdx) => (
                  <div key={groupIdx} className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      {group.icon && <span className="text-sm">{group.icon}</span>}
                      <span className="text-xs sm:text-sm text-gray-600 font-semibold">{group.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">{group.suggestions.length}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                      {group.suggestions.map((sugg, idx) => {
                        const suggestionKey = `${groupIdx}-${idx}`;
                        const adjustable = adjustableValues.get(suggestionKey);
                        const suggText = sugg.text;

                    // Suggestion de taux avec +/-
                    if (adjustable?.type === 'rate') {
                      const currentRate = adjustable.value as number;
                      return (
                            <div key={suggestionKey} className="inline-flex items-center rounded-lg border bg-blue-50 overflow-hidden">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (currentRate > 10) {
                                const newMap = new Map(adjustableValues);
                                    newMap.set(suggestionKey, {type: 'rate', value: currentRate - 1});
                                setAdjustableValues(newMap);
                              }
                            }}
                            className="px-3 py-2 hover:bg-blue-100 active:bg-blue-200 text-blue-700 text-lg font-bold"
                          >
                            −
                          </button>
                          <button
                                onClick={() => setTextAndFocus(suggText.replace(/\d+€\/h/, `${currentRate}€/h`))}
                            className="px-3 py-2 text-sm text-blue-700 font-medium"
                          >
                            {currentRate}€/h
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (currentRate < 40) {
                                const newMap = new Map(adjustableValues);
                                    newMap.set(suggestionKey, {type: 'rate', value: currentRate + 1});
                                setAdjustableValues(newMap);
                              }
                            }}
                            className="px-3 py-2 hover:bg-blue-100 active:bg-blue-200 text-blue-700 text-lg font-bold"
                          >
                            +
                          </button>
                        </div>
                      );
                    }

                    // Suggestion d'horaires avec +/-
                    if (adjustable?.type === 'hours') {
                      const {start, end} = adjustable.value as {start: number, end: number};
                      return (
                            <div key={suggestionKey} className="inline-flex items-center rounded-lg border bg-blue-50 overflow-hidden">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (start > 6) {
                                const newMap = new Map(adjustableValues);
                                    newMap.set(suggestionKey, {type: 'hours', value: {start: start - 1, end}});
                                setAdjustableValues(newMap);
                              }
                            }}
                            className="px-1.5 py-1 hover:bg-blue-100 active:bg-blue-200 text-blue-700 text-sm font-bold"
                          >
                            −
                          </button>
                          <button
                                onClick={() => setTextAndFocus(suggText.replace(/\d{1,2}h-\d{1,2}h/, `${start}h-${end}h`))}
                            className="px-2 py-1 text-[10px] sm:text-xs text-blue-700 font-medium"
                          >
                            {start}h-{end}h
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (start < end - 2) {
                                const newMap = new Map(adjustableValues);
                                    newMap.set(suggestionKey, {type: 'hours', value: {start: start + 1, end}});
                                setAdjustableValues(newMap);
                              }
                            }}
                            className="px-1.5 py-1 hover:bg-blue-100 active:bg-blue-200 text-blue-700 text-sm font-bold"
                          >
                            +
                          </button>
                          <div className="w-px h-4 bg-blue-200"></div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (end > start + 2) {
                                const newMap = new Map(adjustableValues);
                                    newMap.set(suggestionKey, {type: 'hours', value: {start, end: end - 1}});
                                setAdjustableValues(newMap);
                              }
                            }}
                            className="px-1.5 py-1 hover:bg-blue-100 active:bg-blue-200 text-blue-700 text-sm font-bold"
                          >
                            −
                          </button>
                          <button
                                onClick={() => setTextAndFocus(suggText.replace(/\d{1,2}h-\d{1,2}h/, `${start}h-${end}h`))}
                            className="px-2 py-1 text-[10px] sm:text-xs text-blue-700 font-medium"
                          >
                            {end}h
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (end < 23) {
                                const newMap = new Map(adjustableValues);
                                    newMap.set(suggestionKey, {type: 'hours', value: {start, end: end + 1}});
                                setAdjustableValues(newMap);
                              }
                            }}
                            className="px-1.5 py-1 hover:bg-blue-100 active:bg-blue-200 text-blue-700 text-sm font-bold"
                          >
                            +
                          </button>
                        </div>
                      );
                    }

                    // Suggestion de date avec +/-
                    if (adjustable?.type === 'date') {
                      const currentOffset = adjustable.value as number;
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const date = new Date(today);
                      date.setDate(today.getDate() + currentOffset);
                      const formatted = fmtWeekdayDayMonth(date);

                      return (
                            <div key={suggestionKey} className="inline-flex items-center rounded-lg border bg-blue-50 overflow-hidden">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (currentOffset > 0) {
                                const newMap = new Map(adjustableValues);
                                    newMap.set(suggestionKey, {type: 'date', value: currentOffset - 1});
                                setAdjustableValues(newMap);
                              }
                            }}
                            className="px-1.5 py-1 hover:bg-blue-100 active:bg-blue-200 text-blue-700 text-sm font-bold"
                          >
                            −
                          </button>
                          <button
                            onClick={() => {
                              const textWithoutDate = text.replace(/\s+(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche)\s+\d+\s+\w+\s*$/i, '').trim();
                              setTextAndFocus(`${textWithoutDate} ${formatted}`);
                            }}
                            className="px-2 py-1 text-[10px] sm:text-xs text-blue-700 font-medium whitespace-nowrap"
                          >
                            {formatted}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (currentOffset < 30) {
                                const newMap = new Map(adjustableValues);
                                    newMap.set(suggestionKey, {type: 'date', value: currentOffset + 1});
                                setAdjustableValues(newMap);
                              }
                            }}
                            className="px-1.5 py-1 hover:bg-blue-100 active:bg-blue-200 text-blue-700 text-sm font-bold"
                          >
                            +
                          </button>
                        </div>
                      );
                    }

                    // Option taux personnalisé
                        if (suggText === '__CUSTOM_RATE__') {
                      if (!showCustomRate) {
                        return (
                          <button
                                key={suggestionKey}
                            onClick={() => setShowCustomRate(true)}
                            className="text-sm px-3 py-2 rounded-lg border bg-orange-50 hover:bg-orange-100 active:bg-orange-200 text-orange-700 transition-colors font-medium"
                          >
                            Autre montant...
                          </button>
                        );
                      } else {
                        return (
                              <div key={suggestionKey} className="inline-flex items-center rounded-lg border bg-orange-50 overflow-hidden">
                            <input
                              type="number"
                              value={customRate}
                              onChange={(e) => setCustomRate(e.target.value)}
                              placeholder="Ex: 15"
                              className="w-16 px-2 py-1 text-[10px] sm:text-xs bg-white border-r outline-none"
                              autoFocus
                            />
                            <span className="px-1 text-[10px] sm:text-xs text-orange-700">€/h</span>
                            <button
                              onClick={() => {
                                if (customRate && parseFloat(customRate) > 0) {
                                  setTextAndFocus(`${text.trim()} ${customRate}€/h`);
                                  setShowCustomRate(false);
                                  setCustomRate("");
                                }
                              }}
                              className="px-2 py-1 hover:bg-orange-100 active:bg-orange-200 text-orange-700 text-[10px] sm:text-xs font-medium"
                            >
                              OK
                            </button>
                            <button
                              onClick={() => {
                                setShowCustomRate(false);
                                setCustomRate("");
                              }}
                              className="px-2 py-1 hover:bg-orange-100 active:bg-orange-200 text-orange-700 text-[10px] sm:text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      }
                    }

                    // Option date personnalisée
                        if (suggText === '__CUSTOM_DATE__') {
                      if (!showCustomDate) {
                        return (
                          <button
                                key={suggestionKey}
                            onClick={() => setShowCustomDate(true)}
                            className="text-sm px-3 py-2 rounded-lg border bg-green-50 hover:bg-green-100 active:bg-green-200 text-green-700 transition-colors font-medium"
                          >
                            Autre date...
                          </button>
                        );
                      } else {
                        return (
                              <div key={suggestionKey} className="inline-flex items-center rounded-lg border bg-green-50 overflow-hidden">
                            <input
                              type="date"
                              onChange={(e) => {
                                if (e.target.value) {
                                  const selectedDate = new Date(e.target.value);
                                  const weekday = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][selectedDate.getDay()];
                                  const day = selectedDate.getDate();
                                  const month = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'][selectedDate.getMonth()];
                                  const formatted = `${weekday} ${day} ${month}`;
                                  setTextAndFocus(`${text.trim()} ${formatted}`);
                                  setShowCustomDate(false);
                                }
                              }}
                              className="px-3 py-2 text-sm bg-white border-r outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => setShowCustomDate(false)}
                              className="px-2 py-1 hover:bg-green-100 active:bg-green-200 text-green-700 text-[10px] sm:text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      }
                    }

                    // Suggestion simple (établissement, etc.)
                    // Détecter si c'est un exemple complet (contient plusieurs infos)
                        const isCompleteExample = sugg.isComplete || /\d+€\/h/.test(suggText) || /\d{1,2}h[-–]\d{1,2}h/.test(suggText) || 
                                                 /(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|demain|urgent)/i.test(suggText);
                    
                    return (
                      <button
                            key={suggestionKey}
                            onClick={() => setTextAndFocus(suggText)}
                        className={`text-sm px-3 py-2 rounded-lg border transition-all font-medium flex items-center gap-1.5 ${
                          isCompleteExample
                            ? 'bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 border-green-200 text-green-800 shadow-sm'
                            : 'bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700'
                        }`}
                            title={sugg.description}
                      >
                        {isCompleteExample && <Sparkles className="w-3.5 h-3.5 text-green-600 flex-shrink-0"/>}
                            <span className="text-left">{suggText}</span>
                      </button>
                    );
                  })}
                </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={()=>setText(example)} className="text-[10px] sm:text-xs underline text-gray-500 hover:text-gray-700 active:text-gray-900">Exemple</button>
              </div>
              <div className="flex gap-2 sm:gap-3">
                {canQuickPublish && (
                  <button disabled={loading} onClick={async()=>{
                    setLoading(true);
                    let parsed=await uwiSuggest(text);
                    const city=await enhanceCityFRBE(text, (parsed as any).city);
                    if(city) parsed={...parsed, city};
                    const template = findTemplate(parsed.role || '');
                    if (template && !parsed.duration) parsed.duration = template.defaultDuration;
                    if (template && !parsed.hourly) parsed.hourly = template.defaultHourly;
                    setLoading(false);
                    setShowQuickPublish(true);
                    onGenerated(parsed, text);
                  }} className="flex-1 sm:flex-none px-4 sm:px-5 py-3 rounded-xl bg-green-600 text-white text-sm sm:text-base font-medium shadow-lg flex items-center justify-center gap-2 active:bg-green-700 disabled:opacity-50">
                    <Zap className="w-4 h-4"/><span>{loading?"Analyse…":"Publication rapide"}</span>
                  </button>
                )}
                <button disabled={loading} onClick={async()=>{
                  setLoading(true);
                  const intent = detectIntent(text || example);
                  
                  // BLOQUER si recherche personnelle
                  if (intent === "personal_search") {
                    setLoading(false);
                    alert("Tu sembles chercher du travail. Veux-tu créer ton profil candidat ou formuler un besoin à publier ?");
                    return;
                  }
                  
                  // DEMANDER CONFIRMATION si ambigu
                  if (intent === "ambiguous") {
                    const confirmed = confirm("Es-tu en train de chercher quelqu'un à recruter, ou de chercher du travail ?");
                    if (!confirmed) {
                      setLoading(false);
                      return;
                    }
                  }
                  
                  // CONTINUER si besoin externe confirmé
                  let parsed=await uwiSuggest(text||example); 
                  const city=await enhanceCityFRBE(text||example, (parsed as any).city); 
                  if(city) parsed={...parsed, city}; 
                  setLoading(false); 
                  onGenerated(parsed, text||example);
                }} className="flex-1 sm:flex-none px-4 sm:px-5 py-3 rounded-xl bg-blue-600 text-white text-sm sm:text-base font-medium shadow-lg active:bg-blue-700 disabled:opacity-50">{loading?"Analyse...":"Générer"}</button>
              </div>
            </div>
          </div>
        </div>
        <aside className="lg:col-span-2 space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl border bg-white shadow-sm">
            <div className="text-sm sm:text-base font-semibold mb-3">Comment ça marche</div>
            <ol className="text-sm text-gray-600 list-decimal list-inside space-y-2">
              <li><UWiLogo size="sm" className="font-semibold text-black" /> extrait métier, ville, date, horaires.</li>
              <li>Templates automatiques selon le métier.</li>
              <li>Publication rapide en 1 clic si complet.</li>
              <li>Brouillons sauvegardés automatiquement.</li>
            </ol>
          </div>
          <div className="p-4 sm:p-5 rounded-2xl border bg-gradient-to-br from-blue-50 to-purple-50 shadow-sm">
            <div className="flex items-center gap-2 text-sm sm:text-base font-semibold mb-3">
              <Sparkles className="w-4 h-4 text-blue-600"/>
              Suggestions intelligentes
            </div>
            <div className="text-sm text-gray-700 space-y-2">
              <div>• Complétion automatique pendant la frappe</div>
              <div>• Suggestions d'établissements</div>
              <div>• Horaires et tarifs contextuels</div>
              {autoContext.detectedCity && (
                <div className="pt-2 mt-2 border-t border-blue-200">
                  <div className="font-medium text-blue-700">📍 Localisation détectée:</div>
                  <div className="mt-1">{autoContext.detectedCity}</div>
                </div>
              )}
              {autoContext.recentRole && (
                <div className="pt-2 mt-2 border-t border-blue-200">
                  <div className="font-medium text-blue-700">🕒 Dernière annonce:</div>
                  <div className="mt-1">{autoContext.recentRole} à {autoContext.recentCity || '...'}</div>
                  {autoContext.recentCompany && <div className="text-gray-600">{autoContext.recentCompany}</div>}
                </div>
              )}
            </div>
          </div>
          <div className="p-4 sm:p-5 rounded-2xl border bg-white shadow-sm">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-3 font-medium"><Building2 className="w-4 h-4"/> Métiers populaires</div>
            <div className="flex flex-wrap gap-2">
              {["Déménageur", "Serveur", "Cuisinier", "Barista", "Livreur", "Magasinier", "Vendeur", "Agent de sécurité"].map(x=>(
                <button
                  key={x}
                  onClick={() => setText(`${x.toLowerCase()} à `)}
                  className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 active:bg-gray-100 hover:border-blue-300 transition-colors"
                >
                  {x}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 sm:p-5 rounded-2xl border bg-white shadow-sm">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-3 font-medium"><MapPin className="w-4 h-4"/> Villes fréquentes</div>
            <div className="flex flex-wrap gap-2">
              {["Lille", "Paris", "Lyon", "Marseille", "Toulouse", "Bordeaux"].map(city=>(
                <button
                  key={city}
                  onClick={() => {
                    const currentText = text.toLowerCase();
                    if (currentText.includes('serveur') || currentText.includes('cuisinier') || currentText.includes('livreur')) {
                      if (!currentText.includes('à')) {
                        setText(`${text} à ${city}`);
                      }
                    } else {
                      setText(`serveur à ${city}`);
                    }
                  }}
                  className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 active:bg-gray-100 hover:border-blue-300 transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function QuickDate({value,onSelect}:{value?:string;onSelect:(v:string)=>void}){
  const opts=useMemo(()=>dateChoices(),[]);
  if(value) return null;
  const min=toISODate(new Date());
  return (
    <div className="p-3 sm:p-4 rounded-2xl border bg-white">
      <div className="text-xs sm:text-sm font-medium mb-2 sm:mb-3">Date</div>
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">{opts.map(o=> <Chip key={o.val} onClick={()=>onSelect(o.val)}>{o.label}</Chip>)}</div>
      <div className="grid sm:grid-cols-[auto_1fr_auto] items-center gap-2">
        <div className="text-[10px] sm:text-xs text-gray-600">Ou date précise</div>
        <input type="date" min={min} className="px-3 py-2.5 sm:py-2 border rounded-lg text-sm touch-manipulation" onChange={e=>{const fr=isoToFrPretty((e.target as HTMLInputElement).value); if(fr) onSelect(fr)}}/>
        <div className="text-[10px] sm:text-xs text-gray-500">Ex: Samedi 7 mars</div>
      </div>
    </div>
  )
}

function Review({parsed,setParsed,sourceText,onPublish,contact,setContact,quickPublish,user}:{parsed:any;setParsed:(v:any)=>void;sourceText:string;onPublish:(job:any,url:string,editUrl:string)=>void;contact:any;setContact:(v:any)=>void;quickPublish?:boolean;user:any;}){
  return <ReviewOptimized parsed={parsed} setParsed={setParsed} sourceText={sourceText} onPublish={onPublish} contact={contact} setContact={setContact} quickPublish={quickPublish} user={user} />;
}

function ReviewOLD({parsed,setParsed,sourceText,onPublish,contact,setContact,quickPublish,user}:{parsed:any;setParsed:(v:any)=>void;sourceText:string;onPublish:(job:any,url:string,editUrl:string)=>void;contact:any;setContact:(v:any)=>void;quickPublish?:boolean;user:any;}){
  const [draft,setDraft]=useState("");
  const [saving,setSaving]=useState(false);
  const [selectedVariant, setSelectedVariant]=useState(0);
  const [variants, setVariants]=useState<AnnouncementVariant[]>([]);
  const announcement=useMemo(()=>genAnnouncement(parsed),[parsed]);

  useEffect(()=>{setDraft(`${announcement.title}\n\n${announcement.body}`)},[announcement.title,announcement.body]);

  useEffect(()=>{
    const newVariants = generateAllVariants(parsed.role, parsed.city, parsed.date, parsed.duration, parsed.hourly, parsed.contractType, parsed.missionType, parsed.experience, parsed.skills);
    setVariants(newVariants);
    if (newVariants.length > 0 && selectedVariant < newVariants.length) {
      setDraft(`${newVariants[selectedVariant].title}\n\n${newVariants[selectedVariant].body}`);
    }
  }, [parsed.role, parsed.city, parsed.date, parsed.duration, parsed.hourly, parsed.contractType, parsed.missionType, parsed.experience, JSON.stringify(parsed.skills)]);

  useEffect(() => {
    getAutoCompleteContext().then(ctx => {
      if (ctx.recentContact && !contact.email && !contact.phone) {
        setContact({
          company: ctx.recentCompany || '',
          name: ctx.recentContact.name || '',
          email: ctx.recentContact.email || '',
          phone: ctx.recentContact.phone || ''
        });
      }
    });
  }, []);

  useEffect(() => {
    const autoSave = setTimeout(() => {
      saveDraft(parsed, sourceText, contact).then(() => setSaving(false));
    }, 2000);
    setSaving(true);
    return () => clearTimeout(autoSave);
  }, [parsed, contact]);

  const autoDate=extractDateFr(draft);
  const haveDate=Boolean(parsed.date||autoDate);
  const missing={ role:!parsed.role, city:!parsed.city, date:!haveDate, duration:!parsed.duration };

  const Icon=iconForRole(parsed.role||"");

  const validEmail=isValidEmail(contact.email);
  const validPhone=isValidPhone(contact.phone);
  const validContact=validEmail||validPhone||user;

  function apply(patch:any){
    const next={...parsed,...patch};
    const template = findTemplate(next.role || '');
    if (template) {
      if (!next.duration && template.defaultDuration) next.duration = template.defaultDuration;
      if (!next.hourly && template.defaultHourly) next.hourly = template.defaultHourly;
    }
    setParsed(next);
    const a=genAnnouncement(next);
    setDraft(`${a.title}\n\n${a.body}`);
  }

  const extractionComplete = parsed.role && parsed.city && (parsed.date || autoDate) && parsed.duration && validContact;
  const extractionScore = [
    parsed.role, parsed.city, (parsed.date || autoDate), parsed.duration, parsed.hourly,
    contact.company, validContact
  ].filter(Boolean).length;
  const extractionPercent = Math.round((extractionScore / 7) * 100);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h2 className="text-lg sm:text-xl font-semibold">Vérification de l'annonce</h2>
        <div className="flex items-center gap-2">
          <div className="text-[10px] sm:text-xs text-gray-600">Extraction: {extractionPercent}%</div>
          <div className="w-24 sm:w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full transition-all ${extractionPercent >= 80 ? 'bg-green-500' : extractionPercent >= 50 ? 'bg-orange-500' : 'bg-red-500'}`} style={{width: `${extractionPercent}%`}}></div>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-5 gap-4 sm:gap-6">
        <div className="md:col-span-3 space-y-3 sm:space-y-4">
          <div className="p-3 sm:p-4 rounded-2xl border bg-white">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="p-1.5 sm:p-2 rounded-xl border"><Icon className="w-6 h-6 sm:w-8 sm:h-8"/></div>
              <div className="flex-1">
                <div className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">Informations extraites du prompt</div>
                <div className="text-[10px] sm:text-xs text-gray-500 italic line-clamp-2">" {sourceText} "</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0"/>
                <span className={`${parsed.role ? 'text-green-700 font-medium' : 'text-red-600'} truncate`}>
                  {parsed.role ? capWords(parsed.role) : '❌ Manquant'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0"/>
                <span className={`${contact.company ? 'text-green-700 font-medium' : 'text-gray-500'} truncate`}>
                  {contact.company || '— Non détecté'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0"/>
                <span className={`${parsed.city ? 'text-green-700 font-medium' : 'text-red-600'} truncate`}>
                  {parsed.city || '❌ Manquant'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0"/>
                <span className={`${(parsed.date || autoDate) ? 'text-green-700 font-medium' : 'text-red-600'} truncate`}>
                  {parsed.date || autoDate || '❌ Manquant'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0"/>
                <span className={`${parsed.duration ? 'text-green-700 font-medium' : 'text-gray-500'} truncate`}>
                  {parsed.duration || '— 18h-23h (défaut)'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-xs flex-shrink-0">💰</span>
                <span className={`${parsed.hourly ? 'text-green-700 font-medium' : 'text-gray-500'} truncate`}>
                  {parsed.hourly || '— Non spécifié'}
                </span>
              </div>
            </div>
          </div>

          {(missing.role||missing.city||missing.date||missing.duration) && (
            <div className="p-3 sm:p-4 rounded-2xl border bg-white">
              <div className="text-xs sm:text-sm font-medium mb-2 sm:mb-3">Questions rapides</div>
              <div className="space-y-2 sm:space-y-3">
                {missing.role && (
                  <div>
                    <div className="text-[10px] sm:text-xs text-gray-600 mb-1.5 sm:mb-2">Métier</div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">{"Serveur Cuisinier Vendeur Livreur Agent".split(" ").map((r)=> <Chip key={r} onClick={()=>apply({role:r.toLowerCase()})}>{r}</Chip>)}</div>
                  </div>
                )}
                {missing.city && (
                  <div>
                    <div className="text-[10px] sm:text-xs text-gray-600 mb-1.5 sm:mb-2">Ville</div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">{"Paris Lyon Lille Marseille Bordeaux Bruxelles Liège Namur".split(" ").map(c=> <Chip key={c} onClick={()=>apply({city:c})}>{c}</Chip>)}</div>
                  </div>
                )}
                {missing.date && (<QuickDate value={parsed.date} onSelect={(val)=>apply({date:val})}/>) }
                {missing.duration && (
                  <div>
                    <div className="text-[10px] sm:text-xs text-gray-600 mb-1.5 sm:mb-2">Créneau</div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {[
                        {label:"Matin 9h-13h",val:"9h–13h"},
                        {label:"A-midi 13h-18h",val:"13h–18h"},
                        {label:"Soir 18h-23h",val:"18h–23h"},
                      ].map(o=> <Chip key={o.val} onClick={()=>apply({duration:o.val})}>{o.label}</Chip>)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="p-3 sm:p-4 rounded-2xl border bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs sm:text-sm font-medium">Variantes d'annonce</div>
              <span className="text-[10px] sm:text-xs px-2 py-1 rounded-md border">A/B Testing</span>
            </div>
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2 -mx-1 px-1">
              {variants.map((v, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedVariant(idx);
                    setDraft(`${v.title}\n\n${v.body}`);
                  }}
                  className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-xs whitespace-nowrap flex-shrink-0 transition-all ${
                    selectedVariant === idx
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white hover:bg-gray-50 active:bg-gray-100'
                  }`}
                >
                  <div className="font-medium text-[11px] sm:text-xs">{v.name}</div>
                  <div className={`text-[9px] sm:text-[10px] mt-0.5 max-w-[120px] sm:max-w-none truncate sm:whitespace-normal ${
                    selectedVariant === idx ? 'text-blue-100' : 'text-gray-500'
                  }`}>{v.description}</div>
                </button>
              ))}
            </div>
            {variants[selectedVariant] && (
              <div className="text-xs sm:text-sm text-gray-700 whitespace-pre-line p-2.5 sm:p-3 bg-gray-50 rounded-lg break-words overflow-hidden">
                <strong className="block mb-1">{variants[selectedVariant].title}</strong>
                <div className="text-[11px] sm:text-xs">{variants[selectedVariant].body}</div>
              </div>
            )}
          </div>

          <div className="p-3 sm:p-4 rounded-2xl border bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
              <div className="text-xs sm:text-sm font-medium">Modifier avant publication</div>
              <button
                onClick={() => {
                  const corrected = formatBullets(lightSpellCheck(draft));
                  setDraft(corrected);
                }}
                className="text-[11px] sm:text-xs px-2 py-1.5 sm:py-1 rounded-lg border hover:bg-gray-50 active:bg-gray-100 flex items-center justify-center gap-1 w-full sm:w-auto"
              >
                <Sparkles className="w-3 h-3"/>Corriger orthographe
              </button>
            </div>
            <textarea className="w-full h-32 sm:h-40 border rounded-xl p-2.5 sm:p-3 text-[11px] sm:text-sm" value={draft} onChange={e=>setDraft((e.target as HTMLTextAreaElement).value)}/>
          </div>
        </div>

        <aside className="md:col-span-2 space-y-3 sm:space-y-4">
          <div className="p-3 sm:p-4 rounded-2xl border bg-white">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="text-xs sm:text-sm font-medium">Coordonnées employeur</div>
              {saving && <span className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1"><Save className="w-3 h-3"/>Auto-save...</span>}
            </div>
            {(contact.company || contact.name || contact.email || contact.phone) && (
              <div className="mb-2 sm:mb-3 p-2 bg-green-50 rounded-lg">
                <div className="text-[10px] sm:text-xs font-medium text-green-700 mb-1 flex items-center gap-1">
                  <Check className="w-3 h-3"/>Informations détectées automatiquement
                </div>
                <div className="text-[10px] sm:text-xs text-green-700 space-y-0.5">
                  {contact.company && <div>• Établissement: {contact.company}</div>}
                  {contact.name && <div>• Contact: {contact.name}</div>}
                  {contact.email && <div>• Email: {contact.email}</div>}
                  {contact.phone && <div>• Tél: {contact.phone}</div>}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Field label="Nom de l'établissement"><Input value={contact.company} onChange={v=>setContact({...contact,company:v})} placeholder="Ex: Restaurant Le Bistrot"/></Field>
              <Field label="Contact (nom)"><Input value={contact.name} onChange={v=>setContact({...contact,name:v})} placeholder="Ex: Marie Dupont"/></Field>
              <Field label="Email"><Input type="email" value={contact.email} onChange={v=>setContact({...contact,email:v})} placeholder="contact@restaurant.fr"/></Field>
              <Field label="Mobile"><Input type="tel" value={contact.phone} onChange={v=>setContact({...contact,phone:v})} placeholder="06 12 34 56 78"/></Field>
              {!(isValidEmail(contact.email)||isValidPhone(contact.phone)) && (
                <div className="text-[10px] sm:text-xs text-red-600 font-medium">⚠️ Un email ou un mobile valide est REQUIS pour publier.</div>
              )}
            </div>
          </div>
          <div className="p-3 sm:p-4 rounded-2xl border bg-white">
            <button onClick={async ()=>{
              if(!validContact){
                alert("Veuillez renseigner un email ou un téléphone valide pour publier");
                return;
              }

              const title=draft.split("\n")[0]||"Annonce";
              const body=draft.split("\n").slice(1).join("\n");
              const editToken = Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2);

              const jobData = {
                title,
                body,
                role: parsed.role,
                city: parsed.city,
                date: parsed.date,
                duration: parsed.duration,
                hourly_rate: parsed.hourly,
                company_name: contact.company,
                contact_name: contact.name,
                contact_email: contact.email,
                contact_phone: contact.phone,
                edit_token: editToken,
                user_id: null
              };

              const job = await publishJob(jobData);
              if(job){
                const url=`${location.origin}${location.pathname}#/${job.id}`;
                const editUrl=`${location.origin}${location.pathname}#/${job.id}?edit=${editToken}`;
                onPublish(job,url,editUrl);
              }
            }} disabled={!validContact} className="w-full px-4 py-2.5 sm:py-2 rounded-xl bg-blue-600 text-white text-sm sm:text-base shadow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:bg-blue-700 touch-manipulation">
              {quickPublish && <Zap className="w-4 h-4"/>}
              Publier l'annonce
            </button>
          </div>
        </aside>
      </div>
      <div className="mt-4 sm:mt-6 text-[10px] sm:text-xs text-gray-500 px-2 break-words">Texte initial: "{sourceText}"</div>
    </div>
  )
}

function PublicList({jobs,onOpenJob}:{jobs:any[];onOpenJob:(job:any)=>void}){
  const [searchRole, setSearchRole] = useState('');
  const [searchCity, setSearchCity] = useState('');

  const filteredJobs = jobs.filter(job => {
    if (searchRole && !job.role?.toLowerCase().includes(searchRole.toLowerCase())) return false;
    if (searchCity && !job.city?.toLowerCase().includes(searchCity.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">Annonces publiées</h2>
          <span className="text-[10px] sm:text-xs px-2 py-1 rounded-md border">Public</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Rechercher un métier..."
            value={searchRole}
            onChange={e=>setSearchRole(e.target.value)}
            className="flex-1 px-3 py-2.5 sm:py-2 border rounded-lg text-sm touch-manipulation"
          />
          <input
            type="text"
            placeholder="Ville..."
            value={searchCity}
            onChange={e=>setSearchCity(e.target.value)}
            className="flex-1 px-3 py-2.5 sm:py-2 border rounded-lg text-sm touch-manipulation"
          />
        </div>
      </div>
      {filteredJobs.length===0? (
        <div className="p-4 sm:p-6 rounded-2xl border bg-white text-xs sm:text-sm text-gray-600">Aucune annonce pour le moment.</div>
      ):(
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredJobs.map(job=>{
            const Icon=iconForRole(job.role);
            return (
              <div key={job.id} className="rounded-2xl border bg-white p-3 sm:p-4 hover:shadow active:shadow-md transition-shadow">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-xl border bg-white flex-shrink-0"><Icon className="w-8 h-8 sm:w-10 sm:h-10"/></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base leading-snug line-clamp-2">{job.title}</div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-600">
                      {job.city && <span className="px-1.5 sm:px-2 py-0.5 rounded-full border flex items-center gap-1"><MapPin className="w-3 h-3"/><span className="truncate">{job.city}</span></span>}
                      {job.date && <span className="px-1.5 sm:px-2 py-0.5 rounded-full border flex items-center gap-1"><Calendar className="w-3 h-3"/><span className="truncate">{job.date}</span></span>}
                      {job.duration && <span className="px-1.5 sm:px-2 py-0.5 rounded-full border flex items-center gap-1"><Clock className="w-3 h-3"/><span className="truncate">{job.duration}</span></span>}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                  {/* Bouton Postuler intelligent dans la liste */}
                  {(job?.contact_email || job?.contact_phone) && (
                    <>
                      {job?.contact_email && job?.contact_phone && (
                        <>
                          <a href={`mailto:${encodeURIComponent(job.contact_email)}?subject=${encodeURIComponent('[LastMinuteJob by UWI] Candidature - ' + (job.title||'Poste'))}`} className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-blue-600 text-white text-xs sm:text-sm hover:bg-blue-700 active:bg-blue-800 touch-manipulation">
                            <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4"/><span className="hidden sm:inline">Email</span><span className="sm:hidden">@</span>
                          </a>
                          <a href={`tel:${(job.contact_phone||'').replace(/\s+/g,'')}`} className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm hover:bg-gray-50 active:bg-gray-100 touch-manipulation">
                            <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4"/><span className="hidden sm:inline">Tel</span><span className="sm:hidden">☎</span>
                          </a>
                        </>
                      )}
                      {job?.contact_email && !job?.contact_phone && (
                        <a href={`mailto:${encodeURIComponent(job.contact_email)}?subject=${encodeURIComponent('[LastMinuteJob by UWI] Candidature - ' + (job.title||'Poste'))}`} className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-blue-600 text-white text-xs sm:text-sm hover:bg-blue-700 active:bg-blue-800 touch-manipulation">
                          <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>Postuler
                        </a>
                      )}
                      {!job?.contact_email && job?.contact_phone && (
                        <a href={`tel:${(job.contact_phone||'').replace(/\s+/g,'')}`} className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-blue-600 text-white text-xs sm:text-sm hover:bg-blue-700 active:bg-blue-800 touch-manipulation">
                          <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>Postuler
                        </a>
                      )}
                    </>
                  )}
                  <button onClick={()=>onOpenJob(job)} className="ml-auto px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm hover:bg-gray-50 active:bg-gray-100 touch-manipulation">Voir détails</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ShareButton({ name, href }:{name:string;href:string}){
  const getIcon = () => {
    if (name.includes('LinkedIn')) return <Linkedin className="w-4 h-4"/>;
    if (name.includes('Facebook')) return <Facebook className="w-4 h-4"/>;
    if (name.includes('Twitter') || name.includes('X')) return <Twitter className="w-4 h-4"/>;
    if (name.includes('WhatsApp')) return <MessageCircle className="w-4 h-4"/>;
    return <Share2 className="w-4 h-4"/>;
  };
  
  const getColor = () => {
    if (name.includes('LinkedIn')) return 'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700';
    if (name.includes('Facebook')) return 'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700';
    if (name.includes('Twitter') || name.includes('X')) return 'hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700';
    if (name.includes('WhatsApp')) return 'hover:bg-green-50 hover:border-green-300 hover:text-green-700';
    return 'hover:bg-slate-50 hover:border-slate-300';
  };
  
  return (
    <a 
      target="_blank" 
      rel="noopener noreferrer" 
      href={href} 
      className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 transition-all active:scale-95 ${getColor()}`}
    >
      {getIcon()}
      <span className="hidden sm:inline">{name}</span>
    </a>
  );
}

function CopyLink({url}:{url:string}){
  const [ok,setOk]=useState(false);
  return (
    <button onClick={async()=>{try{await navigator.clipboard.writeText(url);setOk(true);setTimeout(()=>setOk(false),1200);}catch{}}} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm">{ok?<><Check className="w-4 h-4"/>Copié</>:<><Copy className="w-4 h-4"/>Copier</>}</button>
  )
}

function PublicJob({job,canEdit,onBack,refresh,onRequestAccess}:{job:any;canEdit:boolean;onBack:()=>void;refresh:(updated:any)=>void;onRequestAccess:()=>void}){
  const [showPrescreenModal, setShowPrescreenModal] = useState(false);
  const [showCvModal, setShowCvModal] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvFileName, setCvFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shareUrl=typeof window!=="undefined"?window.location.href:"";
  const telHref=job?.contact_phone?`tel:${(job.contact_phone||'').replace(/\s+/g,'')}`:"";
  const Icon=iconForRole(job.role);
  const hasPrescreen = job?.prescreen_questions && job.prescreen_questions.length > 0;

  // Debug: vérifier les coordonnées et canEdit
  useEffect(() => {
    console.log('🔍 Debug PublicJob:', {
      canEdit,
      hasJob: !!job,
      contact_email: job?.contact_email,
      contact_phone: job?.contact_phone,
      company_name: job?.company_name,
      contact_name: job?.contact_name,
      editToken: job?.edit_token,
      fullJob: job
    });
  }, [canEdit, job]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Le fichier est trop volumineux. Taille maximale : 5MB');
        return;
      }
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        alert('Format de fichier non supporté. Veuillez utiliser PDF, DOC ou DOCX');
        return;
      }
      setCvFile(file);
      setCvFileName(file.name);
    }
  };

  const removeCv = () => {
    setCvFile(null);
    setCvFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEmailSubmit = () => {
    if (!job?.contact_email) return;
    const cvNote = cvFile ? `\n\n📎 CV joint : ${cvFileName}\n(Je peux vous envoyer mon CV sur demande si nécessaire)` : '';
    const subject = encodeURIComponent(`[LastMinuteJob by UWI] Candidature - ${job.title || 'Annonce'}`);
    const body = encodeURIComponent(`Bonjour,\n\nJe souhaite postuler pour le poste de ${job.title || 'cette annonce'}.${cvNote}\n\nCordialement\n\n---\nCette candidature a été envoyée via LastMinuteJob by UWI\nPlateforme de recrutement rapide\nwww.lastminutejob.pro`);
    window.location.href = `mailto:${job.contact_email}?subject=${subject}&body=${body}`;
    setShowCvModal(false);
    setCvFile(null);
    setCvFileName('');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-blue-50/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
      <div className="mb-6 flex items-center justify-between">
          <button 
            onClick={onBack} 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4"/> Retour
          </button>
          <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-xs font-semibold text-blue-700 border border-blue-200">
            Page publique
          </span>
      </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header de l'annonce */}
          <div className="p-6 sm:p-8 bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 border-b border-slate-200">
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg flex-shrink-0">
                <Icon className="w-8 h-8 sm:w-10 sm:h-10"/>
            </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 leading-tight">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm sm:text-base">
                  {job.city && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm">
                      <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0"/>
                      <span className="font-medium text-slate-700">{job.city}</span>
          </div>
                  )}
                  {job.date && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm">
                      <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0"/>
                      <span className="font-medium text-slate-700">{job.date}</span>
        </div>
                  )}
                  {job.duration && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm">
                      <Clock className="w-4 h-4 text-pink-600 flex-shrink-0"/>
                      <span className="font-medium text-slate-700">{job.duration}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contenu de l'annonce */}
          <div className="p-4 sm:p-6 md:p-8">
            <div className="prose prose-slate max-w-none prose-sm sm:prose-base">
              <div className="whitespace-pre-wrap text-sm sm:text-base text-slate-700 leading-relaxed">
                {job.body}
              </div>
            </div>
          </div>

          {/* Actions: Contact et Partage */}
          <div className="p-6 sm:p-8 pt-0 grid sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Contact */}
            <div className="p-5 sm:p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 text-white">
                  <Mail className="w-4 h-4"/>
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  {canEdit ? "Coordonnées de contact" : "Contacter l'employeur"}
                </h3>
              </div>
              
              {/* Toujours afficher les coordonnées pour le recruteur, même si canEdit est false temporairement */}
              {(canEdit || (job?.edit_token && window.location.search.includes('edit='))) ? (
                /* Vue recruteur : afficher les coordonnées avec message explicatif */
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0"/>
                      <span className="text-xs font-semibold text-blue-700">Ces coordonnées sont visibles par les candidats</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-white/80 backdrop-blur-sm border border-emerald-200">
                      <div className="text-xs text-emerald-600 font-medium mb-1">Établissement</div>
                      <div className="text-sm font-semibold text-slate-900">{job?.company_name || <span className="text-amber-600 italic">Non renseigné</span>}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/80 backdrop-blur-sm border border-emerald-200">
                      <div className="text-xs text-emerald-600 font-medium mb-1">Contact</div>
                      <div className="text-sm font-semibold text-slate-900">{job?.contact_name || <span className="text-amber-600 italic">Non renseigné</span>}</div>
                    </div>
                    <div className={`p-3 rounded-lg backdrop-blur-sm border ${
                      job?.contact_email?.trim() 
                        ? 'bg-white/80 border-emerald-200' 
                        : 'bg-amber-50 border-amber-200'
                    }`}>
                      <div className="text-xs text-emerald-600 font-medium mb-1">Email</div>
                      {job?.contact_email?.trim() ? (
                        <div className="text-sm font-semibold text-slate-900">{job.contact_email}</div>
                      ) : (
                        <div className="text-xs text-amber-700 flex items-center gap-2">
                          <AlertCircle className="w-3 h-3 flex-shrink-0"/>
                          <span>Email non renseigné</span>
                        </div>
                      )}
                    </div>
                    <div className={`p-3 rounded-lg backdrop-blur-sm border ${
                      job?.contact_phone?.trim() 
                        ? 'bg-white/80 border-emerald-200' 
                        : 'bg-amber-50 border-amber-200'
                    }`}>
                      <div className="text-xs text-emerald-600 font-medium mb-1">Téléphone</div>
                      {job?.contact_phone?.trim() ? (
                        <div className="text-sm font-semibold text-slate-900">{job.contact_phone}</div>
                      ) : (
                        <div className="text-xs text-amber-700 flex items-center gap-2">
                          <AlertCircle className="w-3 h-3 flex-shrink-0"/>
                          <span>Téléphone non renseigné</span>
                        </div>
                      )}
                    </div>
                    {(!job?.contact_email?.trim() && !job?.contact_phone?.trim()) && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                        <div className="flex items-center gap-2 text-xs text-red-700">
                          <AlertCircle className="w-4 h-4 flex-shrink-0"/>
                          <span className="font-medium">⚠️ Aucune coordonnée renseignée - Les candidats ne pourront pas vous contacter</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Vue candidat : afficher les boutons de contact */
                <>
                  <div className="space-y-3 mb-4">
                    {job?.company_name && (
                      <div className="p-3 rounded-lg bg-white/80 backdrop-blur-sm border border-emerald-200">
                        <div className="text-xs text-emerald-600 font-medium mb-1">Établissement</div>
                        <div className="text-sm font-semibold text-slate-900">{job.company_name}</div>
                      </div>
                    )}
                    {job?.contact_name && (
                      <div className="p-3 rounded-lg bg-white/80 backdrop-blur-sm border border-emerald-200">
                        <div className="text-xs text-emerald-600 font-medium mb-1">Contact</div>
                        <div className="text-sm font-semibold text-slate-900">{job.contact_name}</div>
                      </div>
                    )}
                  </div>

                  {/* Bouton Postuler */}
              {(job?.contact_email || job?.contact_phone) && (
                    <div className="space-y-2">
                  {hasPrescreen ? (
                    <button
                      onClick={() => setShowPrescreenModal(true)}
                          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold hover:shadow-lg active:scale-95 transition-all duration-200"
                    >
                          <Mail className="w-5 h-5"/> Postuler maintenant
                    </button>
                  ) : (
                    <>
                      {job?.contact_email && job?.contact_phone && (
                        <div className="space-y-2">
                              <button 
                                onClick={() => setShowCvModal(true)}
                                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold hover:shadow-lg active:scale-95 transition-all duration-200"
                              >
                                <Mail className="w-5 h-5"/> Postuler par email
                              </button>
                              <a 
                                href={telHref} 
                                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-blue-600 bg-white text-blue-600 text-sm font-semibold hover:bg-blue-50 active:scale-95 transition-all duration-200"
                              >
                                <Phone className="w-5 h-5"/> Appeler maintenant
                          </a>
                        </div>
                      )}
                      {job?.contact_email && !job?.contact_phone && (
                            <button 
                              onClick={() => setShowCvModal(true)}
                              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold hover:shadow-lg active:scale-95 transition-all duration-200"
                            >
                              <Mail className="w-5 h-5"/> Postuler par email
                            </button>
                      )}
                      {!job?.contact_email && job?.contact_phone && (
                            <a 
                              href={telHref} 
                              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold hover:shadow-lg active:scale-95 transition-all duration-200"
                            >
                              <Phone className="w-5 h-5"/> Appeler maintenant
                        </a>
                      )}
                    </>
                  )}
                </div>
              )}

                </>
              )}
            </div>

            {/* Partage */}
            <div className="p-5 sm:p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <Share2 className="w-4 h-4"/>
          </div>
                <h3 className="text-base font-semibold text-slate-900">Partager cette annonce</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
              <ShareButton name="LinkedIn" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}/>
              <ShareButton name="Facebook" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}/>
              <ShareButton name="X (Twitter)" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(job.title||"Annonce")}`}/>
              <ShareButton name="WhatsApp" href={`https://wa.me/?text=${encodeURIComponent((job.title||"Annonce")+" "+shareUrl)}`}/>
              </div>
              <div className="mt-2">
              <CopyLink url={shareUrl}/>
            </div>
          </div>
        </div>

          {/* Actions d'édition */}
        {canEdit && (
            <div className="p-6 sm:p-8 pt-0 border-t border-slate-200">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Pencil className="w-5 h-5 text-amber-600"/>
                  <h3 className="text-sm font-semibold text-amber-900">Options d'édition</h3>
                </div>
            <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={async()=>{
                const title = prompt("Modifier le titre", job.title);
                if(title===null) return;
                const body = prompt("Modifier le corps de l'annonce", job.body);
                if(body===null) return;
                const updated = await updateJob(job.id, job.edit_token, { title, body });
                if(updated) refresh(updated);
                else alert('Erreur lors de la modification');
                    }} 
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-300 bg-white text-sm font-medium text-amber-700 hover:bg-amber-50 active:scale-95 transition-all"
                  >
                    <Pencil className="w-4 h-4"/> Modifier
                  </button>
                  <button 
                    onClick={async()=>{
                if(!confirm("Supprimer définitivement cette annonce ?")) return;
                const success = await deleteJob(job.id, job.edit_token);
                if(success) onBack();
                else alert('Erreur lors de la suppression');
                    }} 
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 bg-white text-sm font-medium text-red-600 hover:bg-red-50 active:scale-95 transition-all"
                  >
                    <Trash2 className="w-4 h-4"/> Supprimer
                  </button>
                </div>
            </div>
            <PrescreenConfig jobId={job.id} editToken={job.edit_token} />
          </div>
        )}

          {/* Demande d'accès */}
        {!canEdit && job?.verified_email && (
            <div className="p-6 sm:p-8 pt-0 border-t border-slate-200">
              <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                <p className="text-sm text-slate-700 mb-4">Vous êtes le créateur de cette annonce ?</p>
            <button
              onClick={onRequestAccess}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold hover:shadow-lg active:scale-95 transition-all duration-200"
            >
                  <Mail className="w-5 h-5"/>
              Demander l'accès par email
            </button>
              </div>
          </div>
        )}
        </div>
      </div>

      <PrescreenModal
        isOpen={showPrescreenModal}
        onClose={() => setShowPrescreenModal(false)}
        questions={job?.prescreen_questions || []}
        jobTitle={job.title}
        contactEmail={job?.contact_email}
        contactPhone={job?.contact_phone}
      />

      {/* Modal Upload CV */}
      {showCvModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold">Joindre un CV (optionnel)</h2>
              <button
                onClick={() => {
                  setShowCvModal(false);
                  setCvFile(null);
                  setCvFileName('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <p className="text-sm text-gray-600 mb-4">
                Vous pouvez joindre votre CV à votre candidature. Ceci est optionnel.
              </p>

              {!cvFile ? (
                <label className="block">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Cliquez pour téléverser votre CV</span>
                      <span className="text-xs text-gray-400">PDF, DOC, DOCX (max 5MB)</span>
                    </div>
                  </div>
                </label>
              ) : (
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-blue-900 truncate">{cvFileName}</span>
                  </div>
                  <button
                    onClick={removeCv}
                    className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0"
                    title="Retirer le CV"
                  >
                    <XCircle className="w-5 h-5 text-blue-600" />
                  </button>
                </div>
              )}

              <div className="mt-6 pt-6 border-t space-y-3">
                <button
                  onClick={handleEmailSubmit}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {cvFile ? 'Envoyer avec CV' : 'Postuler par email'}
                </button>
                <button
                  onClick={() => {
                    setShowCvModal(false);
                    setCvFile(null);
                    setCvFileName('');
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SuggestionsMockup({onBack}:{onBack:()=>void}){
  const steps = [
    { label: 'Étape 1', title: 'Décrivez', active: true },
    { label: 'Étape 2', title: 'Affinez', active: true },
    { label: 'Étape 3', title: 'Publiez', active: false },
  ];

  const sampleGroups = [
    {
      title: 'Suggestions du moment',
      icon: '⚡',
      description: 'Basées sur l’heure et le contexte',
      chips: [
        'Serveur urgent à Lille 18h-23h',
        'Cuisinier demain 9h-14h 15€/h',
        'Livreur Express 12€/h - Permis B',
      ],
    },
    {
      title: 'Compléter votre annonce',
      icon: '✨',
      description: 'Informations manquantes détectées',
      chips: [
        'Ajouter Ville : Paris',
        'Ajouter Date : Samedi 8 mars',
        'Ajouter Taux : 14€/h',
        'Ajouter Compétence : Permis B',
      ],
    },
    {
      title: 'Métiers similaires',
      icon: '🤝',
      description: 'Explorer d’autres profils proches',
      chips: [
        'Chef de rang à Lille',
        'Runner événementiel',
        'Hôte d’accueil premium',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <button
          onClick={()=>{
            onBack();
            history.replaceState(null,'','#/');
          }}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 text-sm hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-4 h-4"/> Retour interface
        </button>

        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <div className="text-xs uppercase tracking-widest text-blue-200 mb-2">Parcours utilisateur</div>
          <div className="flex flex-col md:flex-row gap-3">
            {steps.map((step, idx)=>(
              <div key={idx} className={`flex-1 p-3 rounded-xl border ${step.active?'border-blue-400 bg-blue-500/10':'border-white/15 bg-white/5 text-white/60'}`}>
                <div className="text-[11px] uppercase tracking-wide">{step.label}</div>
                <div className="text-lg font-semibold">{step.title}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {sampleGroups.map((group, idx)=>(
              <div key={idx} className="bg-white rounded-2xl text-slate-900 p-5 shadow-lg space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{group.icon}</span>
                  <div>
                    <div className="font-semibold">{group.title}</div>
                    <div className="text-xs text-slate-500">{group.description}</div>
                  </div>
                  <span className="ml-auto text-[11px] px-2 py-1 rounded-full bg-slate-100 text-slate-500">Voir plus</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.chips.map((chip,i)=>(
                    <button
                      key={i}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-sm hover:border-blue-400 hover:text-blue-600 transition-colors shadow-sm bg-white"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <aside className="space-y-4">
            <div className="bg-white/10 rounded-2xl p-4 border border-white/15 space-y-3">
              <div className="text-xs uppercase tracking-wide text-blue-200">Feedback visuel</div>
              <div className="bg-emerald-500/10 border border-emerald-300/30 text-emerald-100 rounded-xl p-3 text-sm">
                Champ “Horaires” complété automatiquement ✅
              </div>
              <div className="text-[12px] text-white/70">
                Chaque fois qu’une suggestion remplit un champ, un toast discret confirme l’action pour rassurer l’utilisateur.
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-slate-900 space-y-3 shadow-lg">
              <div className="text-xs uppercase tracking-wide text-slate-400">Section repliable</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Coordonnées employeur</div>
                  <div className="text-xs text-slate-500">Complété à 80%</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-500">Réduire</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="bg-slate-50 rounded-lg px-3 py-2">Restaurant Le Central</div>
                <div className="bg-slate-50 rounded-lg px-3 py-2">contact@lecentral.fr</div>
                <div className="bg-slate-50 rounded-lg px-3 py-2">06 12 34 56 78</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function track(event: string, data: any = {}) {
  if (typeof window === "undefined") return;

  if (window.posthog && typeof window.posthog.capture === "function") {
    window.posthog.capture(event, data);
  }

  // Google Analytics 4 (gtag)
  if (typeof window.gtag === "function") {
    window.gtag("event", event, data);
  }
}

const COLORS = {
  blue: "#007BFF",
  orange: "#FF6B00",
  neutralBg: "#F9FAFB",
  text: "#1E293B",
};

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} className="text-sm text-slate-600 hover:text-blue-600 transition-colors">{children}</a>;
}

function Section({ id, className = "", children }: { id?: string; className?: string; children: React.ReactNode }) {
  return <section id={id} className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>{children}</section>;
}

function Bento({ title, desc, icon: Icon }: { title: string; desc: string; icon: any }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-2.5">
        <div className="p-2 rounded-xl bg-blue-600 text-white"><Icon size={20} /></div>
        <h3 className="text-base md:text-lg font-semibold text-slate-900">{title}</h3>
      </div>
      <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function Step({ n, title, desc, icon: Icon }: { n: number; title: string | React.ReactNode; desc: string; icon: any }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-7 h-7 rounded-full grid place-items-center text-xs font-bold text-white bg-blue-600">{n}</div>
        <Icon size={20} className="text-orange-500" />
        <h4 className="text-sm md:text-lg font-semibold text-slate-900">{title}</h4>
      </div>
      <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function Testimonial({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
      <Quote className="text-blue-500 mb-3" />
      <p className="text-slate-800 mb-4 text-sm md:text-base">{quote}</p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-orange-100 grid place-items-center text-orange-600">{author.charAt(0)}</div>
        <div>
          <div className="font-semibold text-slate-900 text-sm md:text-base">{author}</div>
          <div className="text-xs md:text-sm text-slate-500">{role}</div>
        </div>
        <div className="ml-auto flex gap-1 text-blue-500" aria-label="5 étoiles">
          {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
        </div>
      </div>
    </div>
  );
}

function useUWiPreview(prompt: string) {
  return useMemo(() => {
    if (!prompt.trim()) return null;
    
    // VÉRIFIER L'INTENTION AVANT DE GÉNÉRER
    const intent = detectIntent(prompt);
    if (intent === "personal_search") {
      return null;  // Ne pas générer d'annonce pour recherche personnelle
    }
    if (intent === "ambiguous") {
      return null;  // Ne pas générer automatiquement si ambigu
    }
    
    // CONTINUER SEULEMENT SI "need_external"
    try {
      const parsed = enhancedSmartParse(prompt, enhancedLocalParse);
      const detectedJob = detectJob(prompt.toLowerCase());
      
      // Générer un titre basé sur le job détecté ou le rôle parsé
      let title = parsed.role || detectedJob || "Mission / Prestation";
      if (!title.includes("(H/F)") && !title.includes("/")) {
        title = `${title} (H/F)`;
      }
      
      // Extraire les horaires
      let schedule = parsed.duration || "—";
      if (parsed.startTime && parsed.endTime) {
        schedule = `${parsed.startTime} – ${parsed.endTime}`;
      } else if (parsed.duration) {
        schedule = parsed.duration;
      }
      
      // Extraire le salaire
      const pay = parsed.hourly || "À discuter";
      
      // Générer des missions basées sur le type de job
      let missions: string[] = [];
      const lower = prompt.toLowerCase();
      if (lower.includes("serveur") || lower.includes("serveuse")) {
        missions = ["Accueil et service en salle", "Prise de commande et encaissement", "Mise en place / débarrassage"];
      } else if (lower.includes("cuisinier") || lower.includes("cuisinière")) {
        missions = ["Préparation des plats", "Respect des recettes et standards", "Maintien de la propreté"];
      } else if (lower.includes("nettoyage") || lower.includes("ménage")) {
        missions = ["Nettoyage des espaces", "Entretien des équipements", "Respect des normes d'hygiène"];
      } else {
        missions = ["Exécution des missions confiées", "Respect des consignes", "Travail en équipe"];
      }
      
      // Générer des prérequis
      let requirements: string[] = [];
      if (parsed.experience) {
        requirements.push(parsed.experience);
      }
      if (parsed.skills && parsed.skills.length > 0) {
        requirements.push(...parsed.skills.slice(0, 2));
      }
      if (requirements.length === 0) {
        requirements = ["Ponctualité", "Sérieux", "Première expérience appréciée"];
      }
      
      // Générer des tags
      const tags: string[] = [];
      if (parsed.urgency === "urgent" || parsed.urgency === "très urgent" || lower.includes("urgent")) {
        tags.push("#Urgent");
      }
      if (lower.includes("week-end") || lower.includes("weekend") || lower.includes("samedi") || lower.includes("dimanche")) {
        tags.push("#WeekEnd");
      }
      if (lower.includes("soir") || lower.includes("nuit")) {
        tags.push("#Soirée");
      }
      if (!tags.length) {
        tags.push("#Express", "#Flexible");
      }
      
      return {
        title,
        location: parsed.city || "—",
        date: parsed.date || "—",
        schedule,
        pay,
        missions,
        requirements,
        tags,
      };
    } catch (error) {
      // Fallback en cas d'erreur
      const cityMatch = prompt.match(/\b([A-ZÉÈÀÂÎÛÔÇ][a-zéèàâîûôç\-]+)\b/);
      const dateMatch = prompt.match(/\b(\d{1,2}[\/\-.]\d{1,2}|\d{1,2}\s?(janv|févr|fevr|mars|avr|mai|juin|juil|août|aout|sept|oct|nov|déc|dec)\.?|\d{4}-\d{2}-\d{2})\b/i);
      return {
        title: "Mission / Prestation (H/F)",
        location: cityMatch?.[1] || "—",
        date: dateMatch?.[0] || "—",
        schedule: "—",
        pay: "À discuter",
        missions: ["Mission à définir selon vos besoins"],
        requirements: ["Ponctualité", "Sérieux"],
        tags: ["#Express"],
      };
    }
  }, [prompt]);
}

const EXAMPLE_PROMPTS = [
  "Je cherche un serveur à Lille ce samedi soir de 19h à minuit pour un événement",
  "Étudiante disponible week-end pour extras en restauration à Paris",
  "Besoin urgent d'un cuisinier demain matin 8h-14h à Lyon",
  "Recherche hôtesse d'accueil pour événement ce dimanche à Marseille",
];

// Hook pour debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Suggestions de complétion
const CITY_SUGGESTIONS = ["Paris", "Lille", "Lyon", "Marseille", "Toulouse", "Nantes", "Bordeaux", "Strasbourg"];
const JOB_SUGGESTIONS = ["serveur", "cuisinier", "hôtesse", "livreur", "nettoyage", "barman", "caissier", "vendeur"];
const TIME_SUGGESTIONS = ["matin", "midi", "après-midi", "soir", "nuit", "week-end"];

// Helper pour remplacer "UWi" par le logo dans les strings
function replaceUWiWithLogo(text: string): React.ReactNode {
  const parts = text.split(/(UWi)/g);
  return (
    <>
      {parts.map((part, i) => 
        part === "UWi" ? <UWiLogo key={i} size="sm" /> : part
      )}
    </>
  );
}

// Composant de tutoriel interactif avec mode découverte guidée
function OnboardingTutorial({ 
  onClose, 
  onSkip
}: { 
  onClose: () => void; 
  onSkip: () => void;
}) {
  const [step, setStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  
  const steps = [
    {
      title: "Bienvenue sur UWi ! 👋",
      content: "Créez une annonce de recrutement en 30 secondes. Tapez simplement ce que vous cherchez, UWi fait le reste.",
      example: null,
      position: "center"
    },
    {
      title: "Étape 1 : Décrivez votre besoin",
      content: "Tapez dans le champ ci-dessous : métier, ville, date, horaires...",
      example: "Exemple : \"Je cherche un serveur à Paris ce samedi soir de 18h à 23h\"",
      position: "input"
    },
    {
      title: "Étape 2 : UWi détecte automatiquement",
      content: "Les informations importantes sont détectées en temps réel. Si quelque chose manque, vous verrez des badges orange.",
      example: "✓ Métier détecté\n✓ Ville détectée\n✓ Date détectée",
      position: "validation"
    },
    {
      title: "Étape 3 : Votre annonce est prête",
      content: "L'aperçu de votre annonce s'affiche automatiquement. Vous pouvez la copier, la partager ou la publier.",
      example: "Votre annonce complète avec missions, prérequis et tags optimisés",
      position: "preview"
    }
  ];

  const currentStep = steps[step];

  if (step >= steps.length) {
    if (dontShowAgain) {
      localStorage.setItem("uwi_tutorial_seen", "true");
      localStorage.setItem("uwi_tutorial_disabled", "true");
    } else {
      localStorage.setItem("uwi_tutorial_seen", "true");
    }
    onClose();
    return null;
  }

  // Scroll vers l'élément à highlight
  useEffect(() => {
    if (currentStep.position !== "center") {
      const element = document.querySelector(`[data-onboarding="${currentStep.position}"]`);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      }
    }
  }, [step, currentStep.position]);

  // Calculer la position du highlight
  const highlightStyle = useMemo(() => {
    if (currentStep.position === "center") return null;
    const element = document.querySelector(`[data-onboarding="${currentStep.position}"]`);
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return {
      top: `${rect.top - 8}px`,
      left: `${rect.left - 8}px`,
      width: `${rect.width + 16}px`,
      height: `${rect.height + 16}px`,
    };
  }, [currentStep.position, step]);

  return (
    <>
      {/* Overlay avec highlight */}
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm">
        {currentStep.position !== "center" && highlightStyle && (
          <div 
            className="absolute border-4 border-blue-500 rounded-xl shadow-2xl animate-pulse pointer-events-none"
            style={highlightStyle}
          />
        )}
      </div>
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-in fade-in zoom-in duration-300">
          
          {/* Header */}
          <div className="p-6 pb-4 border-b border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-2xl font-bold text-slate-900">{replaceUWiWithLogo(currentStep.title)}</h3>
              <button
                onClick={onSkip}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                title="Fermer"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-slate-600 text-base leading-relaxed">{replaceUWiWithLogo(currentStep.content)}</p>
          </div>

          {/* Example */}
          {currentStep.example && (
            <div className="px-6 py-4 bg-blue-50 border-l-4 border-blue-500">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-semibold text-sm">💡</span>
                <div className="text-sm text-blue-900 whitespace-pre-line font-medium">
                  {currentStep.example}
                </div>
              </div>
            </div>
          )}
          
          {/* Footer */}
          <div className="p-6 pt-4">
            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === step ? "w-8 bg-blue-600" : "w-2 bg-slate-300"
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3">
              {step > 0 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-5 py-2.5 rounded-lg border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  ← Précédent
                </button>
              ) : (
                <div></div>
              )}
              
              <button
                onClick={() => {
                  if (step === steps.length - 1) {
                    if (dontShowAgain) {
                      localStorage.setItem("uwi_tutorial_seen", "true");
                      localStorage.setItem("uwi_tutorial_disabled", "true");
                    } else {
                      localStorage.setItem("uwi_tutorial_seen", "true");
                    }
                    onClose();
                  } else {
                    setStep(step + 1);
                  }
                }}
                className="px-6 py-2.5 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity shadow-lg"
                style={{ backgroundColor: COLORS.blue }}
              >
                {step === steps.length - 1 ? "C'est parti ! 🚀" : "Suivant →"}
              </button>
            </div>

            {/* Don't show again checkbox */}
            {step === steps.length - 1 && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>Ne plus afficher ce tutoriel</span>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function LMJLanding({ onStart, onPublish }: { onStart?: () => void; onPublish?: (prompt: string, preview: any) => void }) {
  const [prompt, setPrompt] = useState("");
  // const [heroVariant] = useState(() => (Math.random() > 0.5 ? "A" : "B")); // Désactivé - utilisation d'un seul variant
  const [submitted, setSubmitted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userType, setUserType] = useState<"recruteur" | "candidat" | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [validation, setValidation] = useState<{city: boolean; date: boolean; job: boolean; pay: boolean}>({city: false, date: false, job: false, pay: false});
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showTutorial, setShowTutorial] = useState(() => {
    const hasSeenTutorial = localStorage.getItem("uwi_tutorial_seen");
    const isDisabled = localStorage.getItem("uwi_tutorial_disabled");
    return !hasSeenTutorial && !isDisabled;
  });
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [showIntentBox, setShowIntentBox] = useState(false);
  const [intentType, setIntentType] = useState<"personal_search" | "ambiguous" | null>(null);
  const [draft, setDraft] = useState<SimpleAnnouncementDraft | null>(null);
  const [llmAnnouncement, setLlmAnnouncement] = useState<any | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  async function generateAnnouncement() {
    if (!prompt.trim()) return;
    
    setShowIntentBox(false);
    track("uwi_prompt_submitted", { length: prompt.length });
    setIsGenerating(true);
    
    try {
      // Essayer d'abord la route Next.js API, puis fallback sur Edge Function
      let apiUrl = "/api/llm-announcement";
      let res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      
      // Si la route Next.js n'existe pas (404), utiliser l'Edge Function
      if (!res.ok && res.status === 404) {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5d2hxdGxlYnZ2YXV4em1kYXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjE4NDUsImV4cCI6MjA3NzQ5Nzg0NX0.iQB1ZvpjX8hJ4VPclogbRYQnSd0LOFHGuYXrxGbI0Q8";
        if (supabaseUrl) {
          res = await fetch(`${supabaseUrl}/functions/v1/uwi-announce`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseAnonKey}`
            },
            body: JSON.stringify({ prompt })
          });
        } else {
          throw new Error("VITE_SUPABASE_URL not configured");
        }
      }
      
      const data = await res.json();
      
      if (!res.ok || !data.ok) {
        console.error("[generateAnnouncement] Erreur API:", res.status, data);
        throw new Error("llm error");
      }
      
      const llmResp = data.announcement;
      console.log("[generateAnnouncement] ✅ Réponse LLM reçue:", llmResp);
      setLlmAnnouncement(llmResp);
      
      // Convertir la réponse LLM en draft pour l'affichage
      const { convertLLMResponseToDraft } = await import("./lib/simpleAnnounce");
      const draftFromLLM = convertLLMResponseToDraft(llmResp, prompt);
      console.log("[generateAnnouncement] 📝 Draft créé:", {
        jobTitle: draftFromLLM.jobTitle,
        jobKey: draftFromLLM.jobKey,
        location: draftFromLLM.location
      });
      setDraft(draftFromLLM);
      
      setSubmitted(true);
      track("uwi_preview_generated");
    } catch (e) {
      console.error("[generateAnnouncement] ❌ Erreur LLM, utilisation du fallback simple:", e);
      // En cas d'erreur LLM, utiliser le moteur simple comme fallback
      const { simpleGenerateAnnouncement } = await import("./lib/simpleAnnounce");
      const fallbackDraft = simpleGenerateAnnouncement(prompt);
      setDraft(fallbackDraft);
      
      // Fallback minimal pour llmAnnouncement aussi
      // S'assurer que role_label n'est jamais "Rôle à préciser"
      const cleanRoleLabel = (fallbackDraft.jobTitle && 
                               fallbackDraft.jobTitle.trim() && 
                               fallbackDraft.jobTitle !== "Rôle à préciser" && 
                               fallbackDraft.jobTitle !== "Rôle à définir")
        ? fallbackDraft.jobTitle
        : "";
      setLlmAnnouncement({
        type: "need_someone",
        role_label: cleanRoleLabel,
        short_context: fallbackDraft.description,
        location: fallbackDraft.location || null,
        sections: [
          { title: "Missions", items: fallbackDraft.missions },
          { title: "Prérequis", items: fallbackDraft.requirements }
        ]
      });
      setSubmitted(true);
    } finally {
      setIsGenerating(false);
    }
  }
  
  // Handler pour le submit du formulaire
  function handleSubmit(e?: React.FormEvent) {
    if (e) {
      e.preventDefault();
    }
    if (!prompt.trim()) return;
    
    // 🔥 v1 WOW : on envoie TOUT au LLM
    generateAnnouncement();
  }
  
  function handleITalkAboutMe() {
    // cas "je parle de moi"
    setShowIntentBox(false);
    setIntentType(null);
    console.log("[UWi] L'utilisateur parle de lui (recherche de missions)");
    // plus tard : redirection vers /candidate
  }
  
  function handleINeedSomeone() {
    // cas "je cherche quelqu'un"
    setShowIntentBox(false);
    setIntentType(null);
    // ⚠️ on NE repasse PAS par handleSubmit ni detectIntent
    generateAnnouncement();
  }
  
  // Debounce pour l'aperçu en temps réel
  const debouncedPrompt = useDebounce(prompt, 1500);
  const preview = useUWiPreview(debouncedPrompt);
  
  // Réinitialiser draft quand le prompt change
  useEffect(() => {
    if (prompt.trim() && draft) {
      setDraft(null);
      setSubmitted(false);
    }
  }, [prompt]);
  
  // Aperçu en temps réel : afficher automatiquement après debounce
  useEffect(() => {
    if (debouncedPrompt.trim() && !submitted) {
      const intent = detectIntent(debouncedPrompt);
      
      // NE PAS GÉNÉRER si recherche personnelle
      if (intent === "personal_search") {
        return;
      }
      
      // NE PAS GÉNÉRER automatiquement si ambigu
      if (intent === "ambiguous") {
        return;
      }
      
      // GÉNÉRER seulement si besoin externe
      setIsGenerating(true);
      setTimeout(() => {
        setSubmitted(true);
        setIsGenerating(false);
        setShowSuccessAnimation(true);
        setTimeout(() => setShowSuccessAnimation(false), 2000);
        track("uwi_realtime_preview_generated");
      }, 300);
    }
  }, [debouncedPrompt, submitted]);
  
  // Détection recruteur/candidat + Validation en temps réel
  useEffect(() => {
    if (!prompt.trim()) {
      setUserType(null);
      setValidation({city: false, date: false, job: false, pay: false});
      setSuggestions([]);
      return;
    }
    const lower = prompt.toLowerCase();
    const recruteurKeywords = ["je cherche", "besoin", "recherche", "recrute", "recherchons", "cherchons"];
    const candidatKeywords = ["je suis", "disponible", "dispo", "cherche un job", "cherche du travail", "étudiant", "étudiante"];
    
    const isRecruteur = recruteurKeywords.some(kw => lower.includes(kw));
    const isCandidat = candidatKeywords.some(kw => lower.includes(kw));
    
    if (isCandidat && !isRecruteur) {
      setUserType("candidat");
    } else if (isRecruteur || (!isCandidat && (lower.includes("serveur") || lower.includes("cuisinier") || lower.includes("hôtesse")))) {
      setUserType("recruteur");
    } else {
      setUserType(null);
    }
    
    // Validation en temps réel améliorée
    const hasCity = CITY_SUGGESTIONS.some(city => lower.includes(city.toLowerCase()));
    const hasDate = /\b(\d{1,2}[\/\-.]\d{1,2}|demain|aujourd'hui|samedi|dimanche|lundi|mardi|mercredi|jeudi|vendredi|janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\b/i.test(prompt);
    const hasJob = JOB_SUGGESTIONS.some(job => lower.includes(job));
    // Détection améliorée : vérifier qu'il y a un montant horaire valide (10-200€/h)
    const hasPay = /\d{2,3}\s*(?:€|eur|euros?)\s*\/?\s*h/i.test(lower) || 
                   /\d{2,3}\s*(?:€|eur|euros?)\s+(?:par\s+)?heure/i.test(lower) ||
                   /\d{2,3}\s*€h/i.test(lower);
    
    setValidation({
      city: hasCity,
      date: hasDate,
      job: hasJob,
      pay: hasPay
    });
    
    // Générer des suggestions intelligentes améliorées avec contexte
    const newSuggestions: string[] = [];
    const words = prompt.trim().split(/\s+/);
    const lastWord = words[words.length - 1]?.toLowerCase() || "";
    
    // Suggestions contextuelles basées sur le dernier mot
    if (lastWord.length > 1) {
      // Suggestions de villes
      if (!hasCity) {
        const matchingCities = CITY_SUGGESTIONS.filter(city => 
          city.toLowerCase().startsWith(lastWord) ||
          city.toLowerCase().includes(lastWord)
        );
        newSuggestions.push(...matchingCities.slice(0, 2).map(c => `à ${c}`));
      }
      
      // Suggestions de métiers
      if (!hasJob) {
        const matchingJobs = JOB_SUGGESTIONS.filter(job => 
          job.startsWith(lastWord) ||
          job.includes(lastWord)
        );
        newSuggestions.push(...matchingJobs.slice(0, 2));
      }
      
      // Suggestions de temps
      if (!hasDate && TIME_SUGGESTIONS.some(t => t.includes(lastWord))) {
        const matchingTimes = TIME_SUGGESTIONS.filter(time => 
          time.includes(lastWord)
        );
        newSuggestions.push(...matchingTimes.slice(0, 1));
      }
    }
    
    // Suggestions contextuelles basées sur ce qui manque
    if (hasJob && !hasCity && prompt.length > 5) {
      newSuggestions.push(`à ${CITY_SUGGESTIONS[0]}`);
    }
    if (hasJob && hasCity && !hasDate && prompt.length > 5) {
      newSuggestions.push("demain", "ce week-end");
    }
    
    // Amélioration : ne pas proposer de montants si déjà présents
    // Détecter tous les montants présents dans le texte
    const existingRates = new Set<number>();
    const rateMatches = lower.matchAll(/(\d{2,3})\s*(?:€|eur|euros?)\s*\/?\s*h/gi);
    for (const match of rateMatches) {
      const amount = parseInt(match[1], 10);
      if (amount >= 10 && amount <= 200) {
        existingRates.add(amount);
      }
    }
    
    // Proposer seulement des montants qui ne sont pas déjà présents
    if (hasJob && hasCity && hasDate && !hasPay && prompt.length > 10) {
      const suggestedRates = [12, 13, 14, 15, 16, 18, 20];
      const availableRates = suggestedRates.filter(rate => !existingRates.has(rate));
      if (availableRates.length > 0) {
        // Proposer seulement 1-2 montants, pas tous
        newSuggestions.push(...availableRates.slice(0, 2).map(r => `${r}€/h`));
      }
    }
    
    // Filtrer les doublons dans les suggestions
    const uniqueSuggestions = Array.from(new Set(newSuggestions));
    
    setSuggestions(uniqueSuggestions.slice(0, 4));
    setShowSuggestions(uniqueSuggestions.length > 0 && prompt.length > 2);
  }, [prompt]);
  
  // Scroll vers l'aperçu quand il se génère
  useEffect(() => {
    if (submitted && draft && previewRef.current) {
      setTimeout(() => {
        previewRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  }, [submitted, draft]);
  
  // Fermer le menu de partage quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showShareMenu && !(event.target as Element).closest('.share-menu-container')) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShareMenu]);
  
  // Calculer les statistiques de performance estimées
  const estimatedStats = useMemo(() => {
    if (!draft || !submitted) return null;
    
    const lower = prompt.toLowerCase();
    let baseCandidates = 15; // Base de candidats
    
    // Ajuster selon le type de job
    if (lower.includes("serveur") || lower.includes("cuisinier")) {
      baseCandidates += 10;
    }
    if (lower.includes("urgent")) {
      baseCandidates += 5;
    }
    if (validation.city) {
      baseCandidates += 8;
    }
    if (validation.date) {
      baseCandidates += 5;
    }
    
    // Ajuster selon la ville (Paris = plus de candidats)
    if (draft.location && draft.location.toLowerCase().includes("paris")) {
      baseCandidates = Math.floor(baseCandidates * 1.5);
    }
    
    return {
      estimatedCandidates: baseCandidates,
      responseTime: "2-4 heures",
      successRate: "85%"
    };
  }, [draft, submitted, prompt, validation]);
  
  // Smooth scroll pour les liens d'ancrage
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  
  // Copier l'aperçu
  const handleCopyPreview = async () => {
    if (!draft) return;
    const text = `${draft.jobTitle}\n\n${draft.description}\n\n${draft.location ? `Lieu: ${draft.location}\n` : ""}\nMissions:\n${draft.missions.map(m => `- ${m}`).join("\n")}\n\nPrérequis:\n${draft.requirements.map(r => `- ${r}`).join("\n")}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      track("uwi_preview_copied");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erreur lors de la copie", err);
    }
  };

  // Partage social
  const handleShare = (platform: "facebook" | "twitter" | "linkedin" | "whatsapp") => {
    if (!draft) return;
    
    const shareText = `${draft.jobTitle}${draft.location ? ` - ${draft.location}` : ""}`;
    const shareUrl = window.location.href;
    const fullText = `${shareText}\n\n${shareUrl}`;
    
    let shareLink = "";
    
    switch (platform) {
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case "whatsapp":
        shareLink = `https://wa.me/?text=${encodeURIComponent(fullText)}`;
        break;
    }
    
    if (shareLink) {
      window.open(shareLink, "_blank", "width=600,height=400");
      track("uwi_share_clicked", { platform });
      setShowShareMenu(false);
    }
  };

  const handlePublish = (source: string) => {
    track("uwi_publish_clicked", { source });
    
    // Si on a un draft et un prompt, utiliser onPublish pour passer directement à la page de review
    if (draft && prompt.trim() && onPublish) {
      onPublish(prompt, draft);
      return;
    }
    
    // Si pas d'aperçu, scroller vers le formulaire sur la landing page
    const formElement = document.getElementById('job-form') || 
                       document.querySelector('form') || 
                       inputRef.current?.closest('form') ||
                       inputRef.current;
    
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Focus sur l'input après un court délai
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 500);
    } else {
      // Fallback : scroller vers le haut de la page
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0" style={{ backgroundColor: COLORS.neutralBg }}>
      {showTutorial && (
        <OnboardingTutorial
          onClose={() => {
            setShowTutorial(false);
          }}
          onSkip={() => {
            setShowTutorial(false);
            localStorage.setItem("uwi_tutorial_seen", "true");
          }}
        />
      )}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
        <Section className="flex h-12 sm:h-14 items-center justify-between">
          <button
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <UWiLogo size="md" />
            <span className="font-semibold text-sm sm:text-base text-slate-900">LastMinuteJob</span>
            <span className="ml-1 sm:ml-2 px-2 sm:px-3 py-1 text-[10px] sm:text-xs rounded-full bg-gradient-to-r from-blue-50 to-orange-50 border border-blue-200 text-blue-700 font-semibold flex items-center gap-1">
              <Sparkles size={10} className="text-blue-600" />
              Agent RH IA
            </span>
          </button>
          <nav className="hidden md:flex gap-6">
            <a href="#how" onClick={(e) => handleAnchorClick(e, "#how")} className="text-sm text-slate-600 hover:text-blue-600 transition-colors">Fonctionnement</a>
            <a href="#benefits" onClick={(e) => handleAnchorClick(e, "#benefits")} className="text-sm text-slate-600 hover:text-blue-600 transition-colors">Avantages</a>
            <a href="#usecases" onClick={(e) => handleAnchorClick(e, "#usecases")} className="text-sm text-slate-600 hover:text-blue-600 transition-colors">Cas d'usage</a>
            <a href="#testimonials" onClick={(e) => handleAnchorClick(e, "#testimonials")} className="text-sm text-slate-600 hover:text-blue-600 transition-colors">Témoignages</a>
            <a href="#faq" onClick={(e) => handleAnchorClick(e, "#faq")} className="text-sm text-slate-600 hover:text-blue-600 transition-colors">FAQ</a>
            <button
              onClick={() => setShowTutorial(true)}
              className="text-sm text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1"
              title="Voir le tutoriel"
            >
              <HelpCircle size={16} />
              Aide
            </button>
          </nav>
          <a
            href="#/candidates"
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = "#/candidates";
            }}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-white text-xs sm:text-sm font-semibold shadow hover:opacity-90 transition whitespace-nowrap"
            style={{ backgroundColor: COLORS.blue }}
          >
            <span className="hidden sm:inline">Trouver une mission</span>
            <span className="sm:hidden">Missions</span>
          </a>
        </Section>
      </header>

      <Section className="pt-6 sm:pt-10 pb-12 sm:pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 to-orange-50 px-4 py-2 text-xs font-medium text-slate-700 mb-6 animate-pulse">
            <Sparkles size={14} className="text-blue-600 animate-spin" style={{ animationDuration: '3s' }} /> 
            <UWiLogo size="sm" /> 
            <span className="whitespace-nowrap">Agent RH IA • Recrutement express</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
            <UWiLogo size="lg" className="inline-block mr-2" />, votre agent RH intelligent
          </h1>
          <p className="text-lg sm:text-xl text-slate-700 mb-2 max-w-2xl mx-auto">
            Décrivez votre besoin, <strong>UWi crée votre annonce</strong>
          </p>
          <p className="text-sm sm:text-base text-slate-600 mb-8 max-w-2xl mx-auto">
            UWi analyse votre besoin et génère une annonce optimisée, professionnelle et prête à publier en moins de 60 secondes.
          </p>
          <form 
            id="job-form"
            onSubmit={handleSubmit} 
            className="rounded-xl border-2 border-blue-200 bg-white p-4 sm:p-5 shadow-lg max-w-2xl mx-auto"
          >
            <div className="mb-3">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 mb-2">
                <Sparkles size={12} className="text-blue-600" />
                Parlez à UWi comme à un agent RH
              </div>
            </div>
            <div className="relative">
              <input 
                ref={inputRef}
                value={prompt} 
                onChange={(e) => setPrompt(e.target.value)}
                onFocus={() => setShowSuggestions(suggestions.length > 0)}
                placeholder="Ex: J'ai besoin d'un serveur à Paris ce samedi soir de 18h à 23h" 
                className="w-full rounded-lg border-2 border-blue-300 px-4 py-4 text-base focus:ring-2 focus:ring-blue-400 focus:border-blue-500 outline-none transition-all pl-10" 
                data-onboarding="input"
              />
              <Sparkles size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 opacity-60" />
              {/* Suggestions de complétion intelligente améliorées */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-10 bg-white border border-slate-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 border-b border-slate-100">
                    💡 Suggestions
                  </div>
                  {suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        const words = prompt.trim().split(/\s+/);
                        const lastWord = words[words.length - 1]?.toLowerCase() || "";
                        
                        // Remplacer le dernier mot si la suggestion commence par le même préfixe
                        if (suggestion.toLowerCase().startsWith(lastWord) && lastWord.length > 1) {
                          setPrompt(prompt.slice(0, prompt.length - lastWord.length) + suggestion);
                        } else if (suggestion.startsWith("à ")) {
                          setPrompt(prompt.trim() + (prompt.endsWith(" ") ? "" : " ") + suggestion);
                        } else {
                          setPrompt(prompt.trim() + (prompt.endsWith(" ") ? "" : " ") + suggestion);
                        }
                        setShowSuggestions(false);
                        inputRef.current?.focus();
                        track("uwi_suggestion_clicked", { suggestion });
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors flex items-center gap-2 group"
                    >
                      <Sparkles size={12} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="flex-1">{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Message d'incertitude sur le métier - DÉSACTIVÉ (utilise PostJobWizard maintenant) */}
            {/* Code commenté car utilise des variables non déclarées - fonctionnalité déplacée vers PostJobWizard
            {showUncertaintyMessage && uncertainJobs.length > 0 && (
              ...
            )}
            */}

            {/* Champs pour informations manquantes - DÉSACTIVÉ (utilise PostJobWizard maintenant) */}
            {/* Code commenté car utilise des variables non déclarées - fonctionnalité déplacée vers PostJobWizard
            {(missingLocation || missingDuration) && !showUncertaintyMessage && (
              ...
            )}
            */}

            {/* Validation en temps réel - version simplifiée */}
            {prompt.trim() && /* !showUncertaintyMessage && */ (
              <div className="mt-3 flex flex-wrap items-center gap-2" data-onboarding="validation">
                {validation.city && validation.date && validation.job ? (
                  <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200 font-medium">
                    <Check size={14} />
                    Prêt à générer
                  </span>
                ) : (
                  <>
                    {!validation.city && (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        <MapPin size={12} />
                        Ville
                      </span>
                    )}
                    {!validation.date && (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        <Calendar size={12} />
                        Date
                      </span>
                    )}
                    {!validation.job && (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        <Users size={12} />
                        Métier
                      </span>
                    )}
                  </>
                )}
              </div>
            )}
            
            {/* Exemples cliquables - version simplifiée */}
            {!prompt.trim() && (
              <div className="mt-3">
                <p className="text-xs text-slate-500 mb-2">Exemples :</p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_PROMPTS.slice(0, 2).map((example, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setPrompt(example);
                        track("uwi_example_clicked", { example: i });
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
                    >
                      {example.length > 40 ? `${example.substring(0, 40)}...` : example}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-4">
              <button 
                type="submit" 
                disabled={!prompt.trim() || isGenerating} 
                className={`w-full px-6 py-3 rounded-lg text-white font-semibold text-base transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] ${!prompt.trim() || isGenerating ? "opacity-50 cursor-not-allowed" : ""}`} 
                style={{ backgroundColor: COLORS.blue }}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    UWi analyse votre besoin...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Demander à UWi de créer l'annonce
                  </>
                )}
              </button>
            </div>
          </form>
          
          {/* Message de clarification d'intention - EN DEHORS du formulaire */}
          {showIntentBox && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-gray-800">
              <p className="mb-3">
                {intentType === "personal_search"
                  ? "Ton message ressemble à une présentation de toi. De quel type de besoin s'agit-il ?"
                  : "Je ne suis pas sûr d'avoir bien compris ton besoin. De quel type de besoin s'agit-il ?"}
              </p>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handleITalkAboutMe}
                  className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white"
                >
                  Je parle de moi (je cherche du travail ou des missions)
                </button>

                <button
                  type="button"
                  onClick={handleINeedSomeone}
                  className="flex-1 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white"
                >
                  Je cherche quelqu'un pour m'aider
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowIntentBox(false);
                  setIntentType(null);
                }}
                className="mt-2 text-xs text-gray-600 underline"
              >
                Réessayer
              </button>
            </div>
          )}
          
          {/* Informations complémentaires - version simplifiée */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-green-600" />
              Sans inscription
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-blue-600" />
              &lt; 60 secondes
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={14} className="text-orange-600" />
              +1 200 recruteurs/semaine
            </span>
          </div>
        </div>
        <div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" ref={previewRef} data-onboarding="preview">
            {!submitted || !draft ? (
            <div className="h-[260px] md:h-[300px] grid place-items-center text-slate-500 text-center px-4">
              <div>
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-8 w-8 mx-auto mb-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-sm font-medium">Génération en cours...</p>
                    <p className="text-xs mt-1 text-slate-400"><UWiLogo size="sm" /> analyse votre demande</p>
                  </>
                ) : (
                  <>
                    <Sparkles className="mx-auto mb-2 text-slate-300" size={32} />
                    <p className="text-sm">Tapez votre besoin ci-contre</p>
                    <p className="text-xs mt-1"><UWiLogo size="sm" /> générera un aperçu automatiquement</p>
                    {prompt.trim() && !submitted && debouncedPrompt !== prompt && (
                      <div className="mt-3 px-3 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                        ⏳ Génération en cours...
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 p-4 animate-in fade-in duration-300 relative">
              {/* Animation de succès */}
              {showSuccessAnimation && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="animate-ping">
                    <div className="w-16 h-16 rounded-full bg-green-500 opacity-75"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check size={32} className="text-white" />
                  </div>
                </div>
              )}
              
              {/* Affichage de la réponse LLM si disponible */}
              {llmAnnouncement ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold">
                      {(draft?.jobTitle && 
                        draft.jobTitle.trim() && 
                        draft.jobTitle !== "Rôle à préciser" && 
                        draft.jobTitle !== "Rôle à définir") 
                        ? draft.jobTitle
                        : (llmAnnouncement.role_label && 
                            llmAnnouncement.role_label.trim() && 
                            llmAnnouncement.role_label !== "Rôle à préciser" && 
                            llmAnnouncement.role_label !== "Rôle à définir" &&
                            !llmAnnouncement.role_label.toLowerCase().includes("à préciser") &&
                            !llmAnnouncement.role_label.toLowerCase().includes("à définir"))
                          ? llmAnnouncement.role_label 
                          : "Indiquez le métier ci-dessous"}
                    </h3>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-600 flex items-center gap-1">
                      <Sparkles size={12} />
                      Aperçu généré par <UWiLogo size="sm" />
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700">
                    {llmAnnouncement.short_context}
                  </p>

                  {llmAnnouncement.location && (
                    <p className="text-xs text-gray-500">
                      📍 {llmAnnouncement.location}
                    </p>
                  )}

                  {Array.isArray(llmAnnouncement.sections) &&
                    llmAnnouncement.sections.map((section: any, idx: number) => (
                      <div key={idx} className="mt-2">
                        <h4 className="text-sm font-semibold">
                          {section.title}
                        </h4>
                        <ul className="mt-1 list-disc pl-4 text-sm text-gray-700">
                          {Array.isArray(section.items) &&
                            section.items.map((item: string, i: number) => (
                              <li key={i}>{item}</li>
                            ))}
                        </ul>
                      </div>
                    ))}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-slate-900">
                      {(draft?.jobTitle && 
                        draft.jobTitle.trim() && 
                        draft.jobTitle !== "Rôle à préciser" && 
                        draft.jobTitle !== "Rôle à définir")
                        ? draft.jobTitle
                        : "Indiquez le métier ci-dessous"}
                    </h3>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-600 flex items-center gap-1">
                      <Sparkles size={12} />
                      Aperçu généré par <UWiLogo size="sm" />
                    </span>
                  </div>
              
              {/* Informations principales */}
              {draft.location && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 mb-3">
                  <div className="flex items-start gap-1">
                    <span className="font-semibold min-w-[60px]">Lieu:</span>
                    <span className="text-slate-700">{draft.location}</span>
                  </div>
                </div>
              )}
              
              {/* Description */}
              <div className="mb-3">
                <p className="text-sm text-slate-700">{draft.description}</p>
              </div>
              
              {/* Missions */}
              <div className="mb-3">
                <div className="font-semibold text-slate-900 text-sm mb-1">Missions</div>
                <ul className="list-disc pl-5 text-sm text-slate-700">
                  {draft.missions.map((m, i) => <li key={i}>{m}</li>)}
                </ul>
              </div>
              
              {/* Prérequis */}
              <div className="mb-3">
                <div className="font-semibold text-slate-900 text-sm mb-1">Pré‑requis</div>
                <ul className="list-disc pl-5 text-sm text-slate-700">
                  {draft.requirements.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
              
              {/* Tags */}
              {draft.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {draft.tags.map((t, i) => (
                    <span key={i} className="text-xs font-medium px-2 py-1 rounded-full border border-slate-200 bg-blue-50 text-blue-700">
                      {t}
                    </span>
                  ))}
                </div>
              )}
                </>
              )}
            </div>
          )}
          </div>
          
          {/* Formulaire d'édition du draft */}
          {draft && (
            <div className="mt-4 rounded-xl border bg-blue-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">
                  Finalisez les détails
                </span>
              </div>

              {/* Métier / rôle : TOUJOURS modifiable */}
              <label className="block space-y-1">
                <span className="text-xs text-gray-700">Métier / rôle</span>
                <input
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={draft.jobTitle}
                  onChange={e => {
                    const newJobTitle = e.target.value;
                    // Détecter le métier depuis la nouvelle saisie pour mettre à jour le jobKey
                    const jobDetection = detectSimpleJob(newJobTitle);
                    
                    setDraft(prev => {
                      if (!prev) return prev;
                      
                      // Si un métier est détecté, mettre à jour le jobKey et le jobTitle
                      if (jobDetection.found && jobDetection.jobLabel) {
                        return {
                          ...prev,
                          jobTitle: jobDetection.jobLabel,
                          jobKey: jobDetection.jobKey
                        };
                      }
                      
                      // Sinon, garder la saisie utilisateur mais mettre jobKey à "custom"
                      return {
                        ...prev,
                        jobTitle: newJobTitle,
                        jobKey: prev.jobKey === "generic" ? "generic" : "custom"
                      };
                    });
                  }}
                  placeholder={draft.jobKey === "custom" || !draft.jobTitle 
                    ? "Tapez le métier ici (ex : Agent immobilier, Serveuse, Développeur web...)" 
                    : "Ex : Serveuse, Étudiante pour extras, Développeur web..."}
                />
                {(draft.jobKey === "custom" || !draft.jobTitle) && (
                  <p className="text-[11px] text-blue-600 font-medium">
                    💡 Indiquez le métier dans le champ ci-dessus pour compléter votre annonce
                  </p>
                )}
              </label>

              {/* Ville */}
              <label className="block space-y-1">
                <span className="text-xs text-gray-700">Ville</span>
                <input
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={draft.location}
                  onChange={e =>
                    setDraft(prev =>
                      prev ? { ...prev, location: e.target.value } : prev
                    )
                  }
                  placeholder="Ex : Paris, Lille, Lyon..."
                />
              </label>

              {/* Missions */}
              <label className="block space-y-1">
                <span className="text-xs text-gray-700">Missions</span>
                <textarea
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={draft.missions.join("\n")}
                  onChange={e =>
                    setDraft(prev =>
                      prev
                        ? { ...prev, missions: e.target.value.split("\n").filter(Boolean) }
                        : prev
                    )
                  }
                  rows={3}
                />
                <p className="text-[11px] text-gray-500">
                  Une mission par ligne, tu peux tout réécrire.
                </p>
              </label>

              {/* Pré-requis */}
              <label className="block space-y-1">
                <span className="text-xs text-gray-700">Pré-requis</span>
                <textarea
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={draft.requirements.join("\n")}
                  onChange={e =>
                    setDraft(prev =>
                      prev
                        ? { ...prev, requirements: e.target.value.split("\n").filter(Boolean) }
                        : prev
                    )
                  }
                  rows={3}
                />
              </label>
            </div>
          )}
          
          {/* Module "Informations à compléter" - version simplifiée et intégrée */}
          {submitted && draft && parsedData && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-300 shadow-lg p-5 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-amber-600"/>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Finalisez les détails</h2>
              </div>
              
              <div className="space-y-4">
                {/* Métier */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-500"/>
                      Métier <span className="text-amber-600">*</span>
                    </label>
                    {parsedData.role && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                        ✓ {capWords(parsedData.role)}
                      </span>
                    )}
                  </div>
                  {!parsedData.role ? (
                    <div className="flex flex-wrap gap-2">
                      {"Serveur Cuisinier Vendeur Livreur Agent".split(" ").map((r) => (
                        <button
                          key={r}
                          onClick={() => {
                            const updated = { ...parsedData, role: r.toLowerCase() };
                            setParsedData(updated);
                            setPrompt(`${r} ${prompt.replace(/^(serveur|cuisinier|vendeur|livreur|agent)\s*/i, '')}`.trim());
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 border-2 border-blue-200 text-blue-700 font-medium hover:bg-blue-100 hover:border-blue-300 transition-all text-sm"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                      {capWords(parsedData.role)}
                    </div>
                  )}
                </div>

                {/* Ville */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-500"/>
                      Ville <span className="text-amber-600">*</span>
                    </label>
                    {parsedData.city && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                        ✓ {parsedData.city}
                      </span>
                    )}
                  </div>
                  {!parsedData.city ? (
                    <div className="flex flex-wrap gap-2">
                      {"Paris Lyon Lille Bruxelles Namur".split(" ").map(c => (
                        <button
                          key={c}
                          onClick={() => {
                            const updated = { ...parsedData, city: c };
                            setParsedData(updated);
                            setPrompt(`${prompt} à ${c}`.trim());
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 border-2 border-blue-200 text-blue-700 font-medium hover:bg-blue-100 hover:border-blue-300 transition-all text-sm"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                      {parsedData.city}
                    </div>
                  )}
                </div>

                {/* Date */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500"/>
                      Date <span className="text-amber-600">*</span>
                    </label>
                    {parsedData.date && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                        ✓ {parsedData.date}
                      </span>
                    )}
                  </div>
                  {!parsedData.date ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {[
                          {label:"Demain",val:extractDateFr("demain")},
                          {label:"Après-demain",val:extractDateFr("après-demain")},
                        ].map(o => (
                          <button
                            key={o.val}
                            onClick={() => {
                              const updated = { ...parsedData, date: o.val };
                              setParsedData(updated);
                              setPrompt(`${prompt} ${o.label.toLowerCase()}`.trim());
                            }}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 border-2 border-blue-200 text-blue-700 font-medium hover:bg-blue-100 hover:border-blue-300 transition-all text-sm"
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="ou tapez une date (ex: lundi, 15 novembre...)"
                        className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        onKeyDown={(e: any) => {
                          if(e.key === 'Enter'){
                            const val = e.currentTarget.value.trim();
                            if(val) {
                              const dateVal = extractDateFr(val) || val;
                              const updated = { ...parsedData, date: dateVal };
                              setParsedData(updated);
                              setPrompt(`${prompt} ${val}`.trim());
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                      {parsedData.date}
                    </div>
                  )}
                </div>

                {/* Horaires (optionnel) */}
                {!parsedData.duration && (
                  <div>
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-slate-500"/>
                      Horaires
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 18h-23h, matin, après-midi..."
                      className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      onKeyDown={(e: any) => {
                        if(e.key === 'Enter'){
                          const val = e.currentTarget.value.trim();
                          if(val) {
                            const updated = { ...parsedData, duration: val };
                            setParsedData(updated);
                            setPrompt(`${prompt} ${val}`.trim());
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          
          {submitted && draft && (
            <div className="mt-4 flex flex-wrap gap-2" data-onboarding="actions">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (draft && onPublish) {
                      onPublish(prompt, draft);
                    } else {
                      handlePublish("preview");
                    }
                  }}
                  className="px-4 py-2 rounded-lg text-white font-semibold flex-1 min-w-[140px] text-center hover:opacity-90 transition-all transform hover:scale-105"
                  style={{ backgroundColor: COLORS.blue }}
                >
                  Publier cette annonce
                </button>
                <div className="relative share-menu-container">
                  <button 
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="px-3 py-2 rounded-lg border border-slate-300 bg-white font-semibold hover:bg-slate-50 flex items-center gap-1.5 text-sm transition-all"
                    title="Partager"
                  >
                    <Share2 size={16} />
                    Partager
                  </button>
                  {showShareMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-white border border-slate-200 rounded-lg shadow-lg p-2 z-20 animate-in fade-in slide-in-from-bottom-2 duration-200 share-menu-container">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleShare("facebook")}
                          className="px-3 py-2 rounded-lg hover:bg-blue-50 flex items-center gap-2 text-sm transition-colors"
                        >
                          <Facebook size={16} className="text-blue-600" />
                          Facebook
                        </button>
                        <button
                          onClick={() => handleShare("twitter")}
                          className="px-3 py-2 rounded-lg hover:bg-sky-50 flex items-center gap-2 text-sm transition-colors"
                        >
                          <Twitter size={16} className="text-sky-500" />
                          Twitter
                        </button>
                        <button
                          onClick={() => handleShare("linkedin")}
                          className="px-3 py-2 rounded-lg hover:bg-blue-50 flex items-center gap-2 text-sm transition-colors"
                        >
                          <Linkedin size={16} className="text-blue-700" />
                          LinkedIn
                        </button>
                        <button
                          onClick={() => handleShare("whatsapp")}
                          className="px-3 py-2 rounded-lg hover:bg-green-50 flex items-center gap-2 text-sm transition-colors"
                        >
                          <MessageCircle size={16} className="text-green-600" />
                          WhatsApp
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <button 
                  onClick={handleCopyPreview}
                  className="px-3 py-2 rounded-lg border border-slate-300 bg-white font-semibold hover:bg-slate-50 flex items-center gap-1.5 text-sm transition-all transform hover:scale-105"
                  title="Copier l'aperçu"
                >
                  {copied ? (
                    <>
                      <Check size={16} className="text-green-600 animate-in zoom-in duration-200" />
                      <span className="text-green-600">Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copier
                    </>
                  )}
                </button>
                <button 
                  onClick={() => {
                    setSubmitted(false);
                    setPrompt("");
                  }} 
                  className="px-3 py-2 rounded-lg border border-slate-300 bg-white font-semibold hover:bg-slate-50 text-sm transition-all"
                >
                  Modifier
                </button>
            </div>
          )}
        </div>
      </Section>

      <Section id="partners" className="py-10 text-center">
        <p className="text-slate-500 text-sm mb-4">Ils utilisent déjà LastMinuteJob</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 items-center">
          {["FoodExpress","Eventia","HubLog","QuickRetail","CityCater","MovePro"].map((n) => (
            <div key={n} className="h-12 rounded-xl bg-slate-100 grid place-items-center text-slate-500 text-sm">{n}</div>
          ))}
        </div>
      </Section>

      <Section id="benefits" className="py-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Bento icon={Clock} title="Gain de temps" desc="Annonce prête en 1 minute." />
        <Bento icon={Sparkles} title="Optimisation IA" desc="Rédaction et structure automatiques." />
        <Bento icon={Users} title="Plus de candidats" desc="Diffusion intelligente, bons canaux." />
        <Bento icon={Shield} title="Fiabilité" desc="Données sécurisées, modération anti‑spam." />
      </Section>

      <Section id="how" className="py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Comment ça marche ?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Step n={1} icon={CalendarClock} title="Décrivez votre besoin" desc="Ex : Serveur à Lille, 28/10, 9h–18h, tenue noire." />
          <Step n={2} icon={Sparkles} title={<><UWiLogo size="sm" /> optimise</>} desc="Intitulé, missions, horaires, salaire, prérequis, tags." />
          <Step n={3} icon={Rocket} title="Publiez & recevez" desc="Candidatures qualifiées rapidement." />
        </div>
      </Section>

      <Section id="usecases" className="py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Cas d'usage</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Bento icon={Building2} title="Restauration & Événementiel" desc="Remplacements last‑minute, services supplémentaires." />
          <Bento icon={Forklift} title="Logistique" desc="Renforts hub, inventaires, pics week‑end." />
          <Bento icon={Store} title="Retail" desc="Ouvertures, soldes, fêtes — vendeurs vite et bien." />
        </div>
      </Section>

      <Section id="trust" className="py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-700"><Shield /></div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Confiance & sécurité</h3>
              <ul className="grid sm:grid-cols-2 gap-2 text-slate-600 text-sm">
                <li className="flex items-start gap-2"><Check className="mt-0.5" size={18} /> Données chiffrées, conformité RGPD</li>
                <li className="flex items-start gap-2"><Check className="mt-0.5" size={18} /> Annonces modérées anti‑spam</li>
                <li className="flex items-start gap-2"><Check className="mt-0.5" size={18} /> Transparence : vous gardez le contrôle</li>
                <li className="flex items-start gap-2"><Check className="mt-0.5" size={18} /> Support réactif en cas de besoin</li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <Section id="testimonials" className="py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Ils en parlent</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Testimonial quote="UWi m'a fait gagner 2h par jour pour mes recrutements." author="Sophie" role="RH chez FoodExpress" />
          <Testimonial quote="Des annonces plus claires, plus efficaces, et de meilleurs candidats." author="Karim" role="Manager logistique" />
        </div>
      </Section>

      <Section id="faq" className="py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">FAQ</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-700">
          <div>
            <h4 className="font-semibold mb-2"><UWiLogo size="sm" />, comment ça marche ?</h4>
            <p><UWiLogo size="sm" /> lit ce que vous écrivez dans le champ (job, renfort, mission…) et génère automatiquement un texte clair et structuré. Vous pouvez ensuite tout ajuster avant de publier.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Puis‑je éditer le texte proposé ?</h4>
            <p>Oui, tout est modifiable : intitulé, description, missions, horaires, salaire, prérequis… <UWiLogo size="sm" /> vous fait gagner du temps, mais vous gardez le contrôle final.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">La diffusion est‑elle automatique ?</h4>
            <p>Une fois votre annonce validée, vous pouvez activer la diffusion sur plusieurs canaux partenaires pour toucher plus de candidats en quelques clics.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Ai‑je besoin d'un compte ?</h4>
            <p>Vous pouvez tester <UWiLogo size="sm" /> sans créer de compte. La création d'un compte est recommandée pour suivre vos annonces et vos candidatures dans le temps.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Et si je suis candidat ?</h4>
            <p>Vous utilisez le même champ : décrivez ce que vous cherchez (job, horaires, ville, expérience). <UWiLogo size="sm" /> comprend le contexte et vous aide à formuler un pitch ou une annonce adaptée.</p>
          </div>
        </div>
      </Section>

      <Section id="cta" className="py-14">
        <div className="rounded-3xl bg-white border border-slate-200 p-8 md:p-12 text-center shadow-sm">
          <h2 className="text-2xl md:text-4xl font-extrabold mb-3">Postez votre annonce en moins d'une minute</h2>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">Aucune complexité. Décrivez votre besoin, visualisez l'annonce, publiez. <strong>Zéro friction, zéro perte de temps.</strong></p>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePublish("footer_cta");
            }}
            className="inline-block px-6 py-3 rounded-xl text-white font-semibold"
            style={{ backgroundColor: COLORS.blue }}
          >
            Publier une annonce
          </a>
        </div>
      </Section>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-white/95 border-t border-slate-200 px-4 py-3 md:hidden">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <span className="text-xs text-slate-600">Prêt à publier ?</span>
          <button
            onClick={() => handlePublish("mobile_sticky")}
            className="flex-1 px-4 py-2 rounded-lg text-white font-semibold"
            style={{ backgroundColor: COLORS.blue }}
          >
            Publier une annonce
          </button>
        </div>
      </div>

      <footer className="border-t border-slate-200 bg-white py-12 mt-8 text-slate-700">
        <Section className="grid md:grid-cols-4 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl grid place-items-center text-white font-bold" style={{ backgroundColor: COLORS.blue }}>LMJ</div>
              <span className="font-semibold text-lg">LastMinuteJob</span>
            </div>
            <p className="text-slate-600 leading-relaxed mb-3">La plateforme qui simplifie le recrutement express. Publiez, optimisez et diffusez vos annonces en quelques secondes.</p>
            <div className="flex flex-col gap-2 text-slate-500">
              <div className="flex items-center gap-2"><MapPin size={15} className="text-orange-500" /> Paris, France</div>
              <div className="flex items-center gap-2"><Phone size={15} className="text-orange-500" /> +33 1 84 60 45 22</div>
              <div className="flex items-center gap-2"><Mail size={15} className="text-orange-500" /> contact@lastminutejob.pro</div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Produit</h3>
            <ul className="flex flex-col gap-2 text-slate-600">
              <li><a href="#benefits" className="hover:text-blue-600 transition-colors">Fonctionnalités</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Tarifs</a></li>
              <li><a href="#usecases" className="hover:text-blue-600 transition-colors">Diffusion</a></li>
              <li><a href="#faq" className="hover:text-blue-600 transition-colors">Sécurité</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Ressources</h3>
            <ul className="flex flex-col gap-2 text-slate-600">
              <li><a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Support client</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Centre d'aide</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Entreprise</h3>
            <ul className="flex flex-col gap-2 text-slate-600">
              <li><a href="#" className="hover:text-blue-600 transition-colors">À propos</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Presse</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Carrières</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Contact</a></li>
            </ul>
          </div>
        </Section>
        <div className="border-t border-slate-200 mt-10 pt-6 text-center text-xs text-slate-500">© {new Date().getFullYear()} LastMinuteJob — Tous droits réservés. | Mentions légales | Politique de confidentialité</div>
      </footer>
    </div>
  );
}


export default function App(){
  const [route,setRoute]=useState<"landing"|"home"|"review"|"list"|"job"|"apply"|"mockup"|"brief"|"candidates"|"post-job"|"candidate"|"need-wizard"|"admin">("landing");
  const [parsed,setParsed]=useState({role:"",city:"",date:"",duration:"",hourly:"",contractType:"",missionType:"",experience:"",skills:[] as string[]});
  const [sourceText,setSourceText]=useState("");
  const [contact,setContact]=useState({company:"",name:"",email:"",phone:""});
  const [jobs,setJobs]=useState<any[]>([]);
  const [current,setCurrent]=useState<any>(null);
  const [editToken,setEditToken]=useState("");
  const [afterPublish,setAfterPublish]=useState({url:"",editUrl:""});
  const [quickPublish,setQuickPublish]=useState(false);
  const [user,setUser]=useState<any>(null);
  const [applyJobId,setApplyJobId]=useState<string>("");

  useEffect(()=>{
    getJobs().then(setJobs);
    loadDraft().then(draft => {
      if (draft) {
        setParsed(draft.parsed_data || {role:"",city:"",date:"",duration:"",hourly:""});
        setSourceText(draft.source_text || "");
        setContact(draft.contact_data || {company:"",name:"",email:"",phone:""});
      }
    });
  },[]);

  useEffect(()=>{
    async function handleHash(){
      const h=location.hash.replace(/^#\/?/,"");
      if(!h) {
        // Si pas de hash, afficher la landing page
        setRoute("landing");
        return;
      }
      const [path,q]=h.split("?");
      if(path === "mockup"){
        setRoute("mockup");
        return;
      }
      if(path === "landing"){
        setRoute("landing");
        return;
      }
      if(path === "brief"){
        setRoute("brief");
        return;
      }
      if(path === "candidates"){
        setRoute("candidates");
        return;
      }
      if(path === "post-job"){
        setRoute("post-job");
        return;
      }
      if(path === "need-wizard"){
        setRoute("need-wizard");
        return;
      }
      if(path === "candidate"){
        setRoute("candidate");
        return;
      }
      if(path === "admin"){
        setRoute("admin");
        return;
      }
      if(path.startsWith("apply/")){
        const jobId = path.replace("apply/","");
        setApplyJobId(jobId);
        setRoute("apply");
        return;
      }
      if(path){
        const id=path;
        const token=q && new URLSearchParams(q).get("edit");
        const job = await getJob(id);
        if(job){ setCurrent(job); setRoute("job"); setEditToken(token||""); }
      }
    }
    window.addEventListener("hashchange",handleHash);
    handleHash();
    return ()=>window.removeEventListener("hashchange",handleHash);
  },[]);

  function goHome(){setRoute("home")}
  function goList(){setRoute("list")}

  const canEdit = !!(current && editToken && current.editToken===editToken);

  // SEO selon la route
  const getSEOProps = () => {
    switch (route) {
      case "landing":
        return {
          title: "LastMinuteJob - Créez votre annonce d'emploi avec UWi",
          description: "Créez des annonces d'emploi professionnelles en quelques secondes avec UWi, l'assistante IA. Publiez vos offres d'emploi en France et Belgique gratuitement.",
          keywords: "créer annonce emploi, publier offre emploi, recrutement, UWi IA, annonce emploi gratuite"
        };
      case "candidates":
        return {
          title: "Trouvez votre prochaine mission - LastMinuteJob",
          description: "Des centaines de missions ponctuelles et flexibles près de chez vous. Trouvez votre prochain job ou proposez vos services en freelance.",
          keywords: "trouver emploi, missions ponctuelles, freelance, candidater, offres d'emploi"
        };
      case "job":
        if (current) {
          const hourlyMatch = current.hourly?.match(/(\d+)/);
          const hourlyValue = hourlyMatch ? parseInt(hourlyMatch[1], 10) : undefined;
          return {
            title: `${current.title || current.role} - ${current.city || ''} | LastMinuteJob`,
            description: current.body?.substring(0, 160) || `Offre d'emploi ${current.role} à ${current.city}`,
            jobPosting: {
              title: current.title || `${current.role} - ${current.city}`,
              description: current.body || '',
              company: current.company_name || 'Entreprise',
              location: current.city || '',
              datePosted: current.created_at,
              employmentType: "PART_TIME",
              ...(hourlyValue && {
                baseSalary: {
                  currency: "EUR",
                  value: {
                    value: hourlyValue
                  }
                }
              })
            }
          };
        }
        return {};
      case "list":
        return {
          title: "Liste des annonces d'emploi - LastMinuteJob",
          description: "Consultez toutes les offres d'emploi disponibles en France et Belgique. Trouvez votre prochain job rapidement.",
          keywords: "liste offres emploi, annonces emploi, jobs disponibles"
        };
      default:
        return {
          title: "LastMinuteJob - Offres d'emploi en France et Belgique",
          description: "Trouvez les meilleures offres d'emploi en France et Belgique. Publiez et consultez des annonces d'emploi gratuites."
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO {...getSEOProps()} />
      {route !== "brief" && route !== "landing" && route !== "post-job" && route !== "candidate" && route !== "need-wizard" && route !== "admin" && <Nav goHome={goHome} goList={goList} user={user}/>}
      {route==="candidates" && <CandidatesPage />}
      {route==="post-job" && <PostJobPage />}
      {route==="need-wizard" && <NeedWizardPage />}
      {route==="candidate" && <CandidatePage />}
      {route==="admin" && <AdminDashboard />}
      {route==="landing" && <LMJLanding 
        onStart={()=>setRoute("home")} 
        onPublish={(prompt, previewData) => {
          // Parser le prompt pour extraire les données
          const parsed = enhancedSmartParse(prompt, enhancedLocalParse);
          // PRIORITÉ ABSOLUE : Si l'utilisateur a modifié le jobTitle dans le draft, on l'utilise
          // Sinon, on utilise le rôle détecté depuis le parsing
          const finalRole = (previewData?.jobTitle && 
                             previewData.jobTitle.trim() && 
                             previewData.jobTitle !== "Rôle à préciser" && 
                             previewData.jobTitle !== "Rôle à définir")
            ? previewData.jobTitle
            : (parsed.role || previewData?.detectedJob || '');
            setParsed({
            role: finalRole,
            city: parsed.city || previewData?.detectedCity || previewData?.location || '',
            date: parsed.date || previewData?.detectedDate || '',
            duration: parsed.duration || previewData?.detectedSchedule || '',
            hourly: parsed.hourly || previewData?.detectedPay || '',
            contractType: parsed.contractType || '',
            missionType: parsed.missionType || '',
            experience: parsed.experience || '',
            skills: parsed.skills || []
            });
          setSourceText(prompt);
            setContact({
            company: parsed.company || '',
            name: parsed.contactName || '',
            email: parsed.contactEmail || '',
            phone: parsed.contactPhone || ''
            });
            setRoute("review");
        }}
      />}
      {route==="brief" && <BriefIntake />}
      {route==="home" && (
        <>
          <HomePage />
          <PublicList jobs={jobs} onOpenJob={async(job)=>{
            const fullJob = await getJob(job.id);
            if(fullJob) {
              setCurrent(fullJob);
              setEditToken("");
              setRoute("job");
              history.replaceState(null, "", `#/${job.id}`);
            }
          }}/>
        </>
      )}
      {route==="review" && (
        <Review parsed={parsed} setParsed={setParsed} sourceText={sourceText} contact={contact} setContact={setContact} quickPublish={quickPublish} user={user} onPublish={async(job,url,editUrl)=>{
          const allJobs = await getJobs();
          setJobs(allJobs);
          setCurrent(job);
          setAfterPublish({url,editUrl});
          setRoute("job");
          history.replaceState(null,"",`#/${job.id}?edit=${job.edit_token}`);
        }}/>
      )}
      {route==="list" && (
        <PublicList jobs={jobs} onOpenJob={async(job)=>{
          const fullJob = await getJob(job.id);
          if(fullJob) {
            setCurrent(fullJob);
            setEditToken("");
            setRoute("job");
            history.replaceState(null,"",`#/${job.id}`);
          }
        }}/>
      )}
      {route==="job" && current && (
        <div>
          {afterPublish.editUrl && (
            <div className="max-w-3xl mx-auto mt-6 px-4">
              <div className="p-3 rounded-xl border bg-amber-50 text-xs">
                Lien d'édition sécurisé: <a className="underline" href={afterPublish.editUrl}>{afterPublish.editUrl}</a>
              </div>
            </div>
          )}
          <PublicJob job={current} canEdit={canEdit} onBack={()=>{setAfterPublish({url:"",editUrl:""}); setRoute("list");}} refresh={async(updated)=>{
            setCurrent(updated);
            const allJobs = await getJobs();
            setJobs(allJobs);
          }} onRequestAccess={()=>{}}/>
        </div>
      )}
      {route==="apply" && applyJobId && (
        <ApplicationPage jobId={applyJobId} />
      )}
      {route==="mockup" && (
        <SuggestionsMockup onBack={goHome}/>
      )}
      <footer className="max-w-6xl mx-auto px-4 py-10 text-center text-xs text-gray-500">LMJ × <UWiLogo size="sm" className="font-semibold" /> — FR/BE Geocoded MVP</footer>
    </div>
  )
}

