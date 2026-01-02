#!/usr/bin/env node

/**
 * Script pour appliquer une migration SQL sur Supabase
 * Utilise l'API Management de Supabase via fetch
 * 
 * Usage: node scripts/apply-migration-supabase.js
 * 
 * Variables d'environnement requises:
 * - SUPABASE_URL (ou VITE_SUPABASE_URL)
 * - SUPABASE_SERVICE_ROLE_KEY
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Récupérer les variables d'environnement
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://gywhqtlebvvauxzmdavb.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ Erreur: SUPABASE_SERVICE_ROLE_KEY n\'est pas définie');
  console.error('Veuillez définir cette variable d\'environnement avec votre clé service_role de Supabase');
  console.error('Vous pouvez la trouver dans: Supabase Dashboard → Settings → API → service_role key');
  process.exit(1);
}

// Lire le fichier de migration
const migrationPath = resolve(__dirname, '..', 'supabase/migrations/20251203100000_create_applications_table.sql');
let migrationSQL;
try {
  migrationSQL = readFileSync(migrationPath, 'utf-8');
  console.log(`📄 Migration chargée: ${migrationPath}`);
} catch (error) {
  console.error(`❌ Erreur lors de la lecture du fichier: ${error.message}`);
  process.exit(1);
}

// Extraire le project ID de l'URL Supabase
const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
if (!projectId) {
  console.error('❌ Impossible d\'extraire le project ID de l\'URL Supabase');
  process.exit(1);
}

// Exécuter la migration via l'API Management de Supabase
async function applyMigration() {
  console.log('🚀 Application de la migration...');
  console.log('📊 Project ID:', projectId);
  console.log('📊 URL Supabase:', supabaseUrl);
  
  try {
    // Utiliser l'API Management de Supabase pour exécuter du SQL
    // Documentation: https://supabase.com/docs/reference/api/management-api
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectId}/database/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({
        query: migrationSQL
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur API:', response.status, response.statusText);
      console.error('📄 Détails:', errorText);
      
      // Si l'API Management ne fonctionne pas, proposer des alternatives
      console.error('\n💡 Solutions alternatives:');
      console.error('   1. Installer Supabase CLI: npm install -g supabase');
      console.error('   2. Exécuter: supabase db push');
      console.error('   3. Ou copier/coller le SQL dans le Supabase Dashboard → SQL Editor');
      console.error('\n📋 SQL à copier:');
      console.log('─'.repeat(80));
      console.log(migrationSQL);
      console.log('─'.repeat(80));
      
      process.exit(1);
    }

    const result = await response.json();
    console.log('✅ Migration appliquée avec succès!');
    console.log('📊 Résultat:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'application de la migration:', error.message);
    console.error('\n💡 Solutions alternatives:');
    console.error('   1. Installer Supabase CLI: npm install -g supabase');
    console.error('   2. Exécuter: supabase db push');
    console.error('   3. Ou copier/coller le SQL dans le Supabase Dashboard → SQL Editor');
    console.error('\n📋 SQL à copier:');
    console.log('─'.repeat(80));
    console.log(migrationSQL);
    console.log('─'.repeat(80));
    process.exit(1);
  }
}

applyMigration();

