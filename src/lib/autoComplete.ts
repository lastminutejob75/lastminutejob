import { supabase } from './supabase';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './env';

export interface AutoCompleteContext {
  recentRole?: string;
  recentCity?: string;
  recentCompany?: string;
  detectedCity?: string;
  recentContact?: {
    name: string;
    email: string;
    phone: string;
  };
}

export async function getAutoCompleteContext(): Promise<AutoCompleteContext> {
  try {
    const sessionId = getOrCreateSessionId();

    const { data, error } = await supabase
      .from('job_drafts')
      .select('*')
      .eq('session_id', sessionId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const detectedCity = await detectCityFromIP();

    if (error || !data) {
      return { detectedCity };
    }

    const draftData = data.draft_data || {};
    const parsed = draftData.parsed || {};
    const contact = draftData.contact || {};

    return {
      recentRole: parsed.role,
      recentCity: parsed.city,
      recentCompany: contact.company,
      detectedCity,
      recentContact: {
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone || ''
      }
    };
  } catch (error) {
    console.error('Error getting autocomplete context:', error);
    return {};
  }
}

/**
 * Détection améliorée de la ville depuis l'IP avec cache
 */
async function detectCityFromIP(): Promise<string> {
  // Vérifier le cache local (valide 24h)
  const cacheKey = 'lmj_detected_city';
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const { city, timestamp } = JSON.parse(cached);
      const now = Date.now();
      const cacheAge = 24 * 60 * 60 * 1000; // 24 heures
      
      if (city && (now - timestamp < cacheAge)) {
        return city;
      }
    } catch (e) {
      // Cache invalide, continuer
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout 5s

    const response = await fetch(`${SUPABASE_URL}/functions/v1/geo-detect`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn('Geo-detect response not OK:', response.status);
      return '';
    }

    const data = await response.json();
    const city = data.city || '';

    // Mettre en cache si on a une ville
    if (city) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          city,
          timestamp: Date.now(),
        }));
      } catch (e) {
        // Ignorer les erreurs de localStorage (quota, etc.)
      }
    }

    return city;
  } catch (error) {
    // Erreur non bloquante - on continue sans détection automatique
    if (error instanceof Error && error.name !== 'AbortError') {
      console.warn('Error detecting city from IP (non-bloquant):', error);
    }
    return '';
  }
}

export async function saveDraft(parsed: any, sourceText: string, contact: any) {
  try {
    const sessionId = getOrCreateSessionId();

    const { error } = await supabase
      .from('job_drafts')
      .upsert({
        session_id: sessionId,
        draft_data: {
          parsed,
          sourceText,
          contact
        },
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'session_id'
      });

    if (error) {
      console.error('Error saving draft:', error);
    }
  } catch (error) {
    console.error('Error saving draft:', error);
  }
}

export async function loadDraft() {
  try {
    const sessionId = getOrCreateSessionId();

    const { data, error } = await supabase
      .from('job_drafts')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error loading draft:', error);
    return null;
  }
}

function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem('lmj_session_id');

  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('lmj_session_id', sessionId);
  }

  return sessionId;
}

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
