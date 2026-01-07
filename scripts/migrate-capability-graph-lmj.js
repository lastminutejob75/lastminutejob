/**
 * Script pour migrer le Capability Graph vers le nouveau Supabase LastMinuteJob
 * 
 * Usage: node scripts/migrate-capability-graph-lmj.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://lsukxdglogtgfukdqqti.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY manquante !");
  console.error("   Configurez SUPABASE_SERVICE_ROLE_KEY dans .env.local");
  console.error("   Cette clé doit être celle du Supabase LastMinuteJob (lsukxdglogtgfukdqqti)");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function executeSQLMigration(filePath) {
  console.log(`\n📄 Exécution de la migration: ${filePath}`);
  console.log("─".repeat(60));

  try {
    const sql = readFileSync(filePath, 'utf-8');
    
    // Exécuter le SQL via l'API Supabase
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // Si la fonction RPC n'existe pas, utiliser l'API REST directement
      console.log("⚠️  RPC exec_sql non disponible, utilisation alternative...");
      
      // Pour les migrations, il faut utiliser le SQL Editor ou l'API REST
      console.log("📋 Instructions:");
      console.log(`   1. Ouvrez: https://supabase.com/dashboard/project/lsukxdglogtgfukdqqti/sql/new`);
      console.log(`   2. Copiez-collez le contenu de: ${filePath}`);
      console.log(`   3. Cliquez sur "Run"`);
      return { success: false, needsManual: true };
    }

    console.log("✅ Migration exécutée avec succès");
    return { success: true };

  } catch (error) {
    console.error(`❌ Erreur lors de l'exécution:`, error.message);
    return { success: false, error: error.message };
  }
}

async function checkTables() {
  console.log("\n🔍 Vérification des tables...");
  
  const tables = ['capabilities', 'providers', 'capability_providers', 'intentions', 'intention_capabilities'];
  const results = {};

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        results[table] = { exists: false };
      } else {
        results[table] = { exists: false, error: error.message };
      }
    } else {
      const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
      results[table] = { exists: true, count: count || 0 };
    }
  }

  return results;
}

async function main() {
  console.log("🚀 Migration du Capability Graph vers LastMinuteJob");
  console.log("=".repeat(60));
  console.log(`📡 Supabase URL: ${SUPABASE_URL}`);
  console.log(`🔑 Service Key: ${SUPABASE_SERVICE_KEY.substring(0, 20)}...`);
  console.log("");

  // Vérifier l'état actuel
  console.log("📊 État actuel des tables:");
  const currentState = await checkTables();
  
  Object.entries(currentState).forEach(([table, result]) => {
    if (result.exists) {
      console.log(`   ✅ ${table}: ${result.count} enregistrements`);
    } else {
      console.log(`   ❌ ${table}: ${result.error || 'N\'existe pas'}`);
    }
  });

  // Vérifier si les migrations sont nécessaires
  const allExist = Object.values(currentState).every(r => r.exists);
  
  if (allExist) {
    console.log("\n✅ Toutes les tables existent déjà !");
    console.log("   Le Capability Graph est déjà migré.");
    return;
  }

  // Chemins des migrations
  const migration1 = join(__dirname, '../supabase/migrations/20250102000000_create_capability_graph_lmj.sql');
  const migration2 = join(__dirname, '../supabase/migrations/20250102000001_seed_capability_graph_lmj.sql');

  console.log("\n📋 Migrations à exécuter:");
  console.log(`   1. ${migration1}`);
  console.log(`   2. ${migration2}`);

  console.log("\n⚠️  IMPORTANT:");
  console.log("   Les migrations SQL doivent être exécutées manuellement dans le SQL Editor Supabase.");
  console.log("   Ce script ne peut pas exécuter directement les migrations SQL.");
  console.log("");

  console.log("📋 Instructions:");
  console.log("─".repeat(60));
  console.log("1. Ouvrez le SQL Editor Supabase:");
  console.log(`   https://supabase.com/dashboard/project/lsukxdglogtgfukdqqti/sql/new`);
  console.log("");
  console.log("2. Exécutez la première migration:");
  console.log(`   Fichier: supabase/migrations/20250102000000_create_capability_graph_lmj.sql`);
  console.log("   - Copiez-collez le contenu");
  console.log("   - Cliquez sur 'Run'");
  console.log("");
  console.log("3. Exécutez la deuxième migration (seed):");
  console.log(`   Fichier: supabase/migrations/20250102000001_seed_capability_graph_lmj.sql`);
  console.log("   - Copiez-collez le contenu");
  console.log("   - Cliquez sur 'Run'");
  console.log("");
  console.log("4. Vérifiez avec:");
  console.log("   node scripts/check-capability-graph.js");

  // Afficher le contenu des migrations pour faciliter le copier-coller
  console.log("\n" + "=".repeat(60));
  console.log("📄 CONTENU DE LA PREMIÈRE MIGRATION:");
  console.log("=".repeat(60));
  try {
    const migration1Content = readFileSync(migration1, 'utf-8');
    console.log(migration1Content);
  } catch (error) {
    console.error(`❌ Erreur lecture fichier: ${error.message}`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("📄 CONTENU DE LA DEUXIÈME MIGRATION (SEED):");
  console.log("=".repeat(60));
  try {
    const migration2Content = readFileSync(migration2, 'utf-8');
    console.log(migration2Content);
  } catch (error) {
    console.error(`❌ Erreur lecture fichier: ${error.message}`);
  }
}

main().catch(error => {
  console.error("\n💥 Erreur fatale:", error);
  process.exit(1);
});
