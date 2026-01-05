/**
 * Supabase client (préparation - non intégré pour l'instant)
 * 
 * Structure préparée pour l'intégration future de Supabase
 */

// TODO: Intégrer Supabase quand nécessaire
// import { createClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/**
 * Configuration Supabase (à remplir lors de l'intégration)
 */
export const supabaseConfig: SupabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
};

/**
 * Client Supabase (à initialiser lors de l'intégration)
 */
export class SupabaseClient {
  // TODO: Implémenter lors de l'intégration Supabase
  // private client: any;

  constructor(config?: SupabaseConfig) {
    // TODO: Initialiser le client Supabase
    // this.client = createClient(config?.url || supabaseConfig.url, config?.anonKey || supabaseConfig.anonKey);
  }

  // Méthodes stub pour préparer l'API
  async getServices() {
    // TODO: Récupérer les services depuis Supabase
    return [];
  }

  async addService(service: any) {
    // TODO: Ajouter un service dans Supabase
    return { id: '', ...service };
  }

  async saveBrief(brief: any) {
    // TODO: Sauvegarder un brief dans Supabase
    return { id: '', ...brief };
  }
}

