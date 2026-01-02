#!/usr/bin/env node

/**
 * Script pour exécuter une migration SQL sur Supabase
 * 
 * Usage: node scripts/run-migration.js <path-to-migration.sql>
 * 
 * Variables d'environnement requises:
 * - SUPABASE_URL (ou VITE_SUPABASE_URL)
 * - SUPABASE_SERVICE_ROLE_KEY (clé service_role, pas la clé anon)
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Récupérer les arguments
const migrationPath = process.argv[2];

if (!migrationPath) {
  console.error('❌ Erreur: Veuillez spécifier le chemin vers la migration SQL');
  console.error('Usage: node scripts/run-migration.js <path-to-migration.sql>');
  process.exit(1);
}

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
let migrationSQL;
try {
  const fullPath = resolve(__dirname, '..', migrationPath);
  migrationSQL = readFileSync(fullPath, 'utf-8');
  console.log(`📄 Migration chargée: ${fullPath}`);
} catch (error) {
  console.error(`❌ Erreur lors de la lecture du fichier: ${error.message}`);
  process.exit(1);
}

// Créer le client Supabase avec la clé service_role
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Exécuter la migration
async function runMigration() {
  console.log('🚀 Exécution de la migration...');
  console.log('📊 URL Supabase:', supabaseUrl);
  
  try {
    // Utiliser rpc pour exécuter du SQL brut
    // Note: Supabase ne permet pas d'exécuter du SQL arbitraire via l'API REST
    // Il faut utiliser l'API Management ou psql directement
    
    // Alternative: Utiliser l'API REST pour exécuter via une fonction Edge
    // Pour l'instant, on va utiliser une approche différente
    
    // Exécuter chaque commande SQL séparément via l'API REST
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      },
      body: JSON.stringify({ sql: migrationSQL })
    });

    if (!response.ok) {
      // Si la fonction RPC n'existe pas, on essaie une autre approche
      console.log('⚠️  La fonction RPC exec_sql n\'existe pas. Tentative alternative...');
      
      // Diviser le SQL en commandes individuelles et les exécuter
      const commands = migrationSQL
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('/*'));

      console.log(`📝 ${commands.length} commandes SQL à exécuter`);
      
      // Note: L'API REST de Supabase ne permet pas d'exécuter du SQL arbitraire
      // Il faut utiliser psql ou la CLI Supabase
      console.error('❌ Impossible d\'exécuter la migration via l\'API REST');
      console.error('💡 Solutions alternatives:');
      console.error('   1. Installer Supabase CLI: npm install -g supabase');
      console.error('   2. Exécuter: supabase db push');
      console.error('   3. Ou copier/coller le SQL dans le Supabase Dashboard → SQL Editor');
      
      process.exit(1);
    }

    const result = await response.json();
    console.log('✅ Migration exécutée avec succès!');
    console.log('📊 Résultat:', result);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution de la migration:', error.message);
    console.error('💡 Solutions alternatives:');
    console.error('   1. Installer Supabase CLI: npm install -g supabase');
    console.error('   2. Exécuter: supabase db push');
    console.error('   3. Ou copier/coller le SQL dans le Supabase Dashboard → SQL Editor');
    process.exit(1);
  }
}

runMigration();

