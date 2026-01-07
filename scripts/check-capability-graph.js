/**
 * Script pour vérifier si le Capability Graph existe dans le Supabase de LastMinuteJob
 * 
 * Usage: node scripts/check-capability-graph.js
 */

import { createClient } from '@supabase/supabase-js';

// ⚠️ IMPORTANT : Supabase LastMinuteJob : https://lsukxdglogtgfukdqqti.supabase.co
// Ce script utilise le Supabase de LastMinuteJob, pas celui d'UWi (gywhqtlebvvauxzmdavb)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://lsukxdglogtgfukdqqti.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_8lYvOVlfCNTdJaYB0SYfnw_5PapFvCO";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TABLES_REQUIRED = [
  'capabilities',
  'providers',
  'capability_providers',
  'intentions',
  'intention_capabilities'
];

async function checkTable(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        return { exists: false, error: 'Table does not exist' };
      }
      return { exists: false, error: error.message };
    }

    // Compter le nombre total
    const { count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    return { exists: true, count: count || 0 };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

async function main() {
  console.log("🔍 Vérification du Capability Graph dans LastMinuteJob");
  console.log("=".repeat(60));
  console.log(`📡 Supabase URL: ${SUPABASE_URL}`);
  console.log("");

  const results = {};

  for (const table of TABLES_REQUIRED) {
    console.log(`Vérification de la table '${table}'...`);
    const result = await checkTable(table);
    results[table] = result;

    if (result.exists) {
      console.log(`  ✅ Table existe (${result.count} enregistrements)`);
    } else {
      console.log(`  ❌ Table n'existe pas: ${result.error}`);
    }
    console.log("");
  }

  // Résumé
  console.log("\n📊 Résumé");
  console.log("=".repeat(60));

  const existingTables = Object.entries(results).filter(([_, r]) => r.exists);
  const missingTables = Object.entries(results).filter(([_, r]) => !r.exists);

  console.log(`✅ Tables existantes: ${existingTables.length}/${TABLES_REQUIRED.length}`);
  console.log(`❌ Tables manquantes: ${missingTables.length}/${TABLES_REQUIRED.length}`);

  if (existingTables.length > 0) {
    console.log("\n📋 Tables existantes:");
    existingTables.forEach(([name, result]) => {
      console.log(`   - ${name}: ${result.count} enregistrements`);
    });
  }

  if (missingTables.length > 0) {
    console.log("\n❌ Tables manquantes:");
    missingTables.forEach(([name, result]) => {
      console.log(`   - ${name}: ${result.error}`);
    });
  }

  // Recommandations
  console.log("\n💡 Recommandations");
  console.log("─".repeat(60));

  if (missingTables.length === 0) {
    console.log("✅ Le Capability Graph est complet! Vous pouvez utiliser l'intégration.");
  } else if (missingTables.length === TABLES_REQUIRED.length) {
    console.log("❌ Le Capability Graph n'existe pas dans ce Supabase.");
    console.log("\nOptions:");
    console.log("1. Migrer le Capability Graph depuis le projet UWi principal");
    console.log("2. Créer un nouveau Capability Graph spécifique à LastMinuteJob");
    console.log("3. Utiliser un Supabase différent qui contient déjà le Capability Graph");
    console.log("\nPour migrer:");
    console.log("   - Exécutez les migrations SQL du projet UWi");
    console.log("   - Ou utilisez le script: node scripts/migrate-capability-graph.js");
  } else {
    console.log("⚠️  Le Capability Graph est partiellement présent.");
    console.log("   Certaines tables manquent. Vous devez compléter la migration.");
  }

  process.exit(missingTables.length === 0 ? 0 : 1);
}

main().catch(error => {
  console.error("\n💥 Erreur fatale:", error);
  process.exit(1);
});

