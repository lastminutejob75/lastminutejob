#!/usr/bin/env node

/**
 * Script pour appliquer la migration de la table applications
 * 
 * Ce script essaie d'exécuter la migration automatiquement.
 * Si cela échoue, il affiche le SQL à copier dans le Supabase Dashboard.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Lire le fichier de migration
const migrationPath = resolve(__dirname, '..', 'supabase/migrations/20251203100000_create_applications_table.sql');
let migrationSQL;
try {
  migrationSQL = readFileSync(migrationPath, 'utf-8');
  console.log('✅ Migration chargée:', migrationPath);
} catch (error) {
  console.error('❌ Erreur lors de la lecture du fichier:', error.message);
  process.exit(1);
}

// Récupérer les variables d'environnement
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://gywhqtlebvvauxzmdavb.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n📋 Instructions pour appliquer la migration:\n');
console.log('═'.repeat(80));
console.log('MÉTHODE 1: Via le Supabase Dashboard (RECOMMANDÉ)\n');
console.log('1. Allez sur: https://supabase.com/dashboard/project/gywhqtlebvvauxzmdavb');
console.log('2. Cliquez sur "SQL Editor" dans le menu de gauche');
console.log('3. Collez le SQL ci-dessous dans l\'éditeur');
console.log('4. Cliquez sur "Run" pour exécuter\n');
console.log('═'.repeat(80));
console.log('\n📄 SQL à copier:\n');
console.log('─'.repeat(80));
console.log(migrationSQL);
console.log('─'.repeat(80));

if (serviceRoleKey) {
  console.log('\n\n🔧 Tentative d\'exécution automatique...\n');
  
  // Extraire le project ID
  const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  
  if (projectId) {
    try {
      // Essayer d'utiliser l'API Management de Supabase
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

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Migration appliquée avec succès via l\'API!');
        console.log('📊 Résultat:', JSON.stringify(result, null, 2));
        process.exit(0);
      } else {
        const errorText = await response.text();
        console.log('⚠️  L\'API Management n\'a pas fonctionné. Utilisez la méthode 1 ci-dessus.');
        console.log('📄 Détails:', errorText.substring(0, 200));
      }
    } catch (error) {
      console.log('⚠️  Erreur lors de l\'exécution automatique:', error.message);
      console.log('💡 Utilisez la méthode 1 ci-dessus pour appliquer la migration manuellement.');
    }
  }
} else {
  console.log('\n💡 Pour une exécution automatique, définissez SUPABASE_SERVICE_ROLE_KEY');
  console.log('   (trouvable dans: Supabase Dashboard → Settings → API → service_role key)');
}

console.log('\n');

