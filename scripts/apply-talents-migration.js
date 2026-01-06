#!/usr/bin/env node

/**
 * Script pour appliquer la migration de la table talents
 * Usage: node scripts/apply-talents-migration.js
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://gywhqtlebvvauxzmdavb.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5d2hxdGxlYnZ2YXV4em1kYXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjE4NDUsImV4cCI6MjA3NzQ5Nzg0NX0.iQB1ZvpjX8hJ4VPclogbRYQnSd0LOFHGuYXrxGbI0Q8';

async function applyMigration() {
  console.log('🔄 Lecture de la migration...');

  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '002_create_talents_table.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  console.log('📤 Envoi de la migration à Supabase...');
  console.log(`   URL: ${SUPABASE_URL}`);

  try {
    // Utiliser l'API REST de Supabase pour exécuter le SQL
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        query: migrationSQL
      })
    });

    if (!response.ok) {
      // L'API RPC n'est peut-être pas disponible
      // On va essayer avec le SQL Editor endpoint si possible
      console.log('⚠️  API RPC non disponible, veuillez appliquer la migration manuellement.');
      console.log('\n📋 Instructions :');
      console.log('1. Ouvrez Supabase Dashboard : https://app.supabase.com');
      console.log('2. Sélectionnez votre projet');
      console.log('3. Allez dans SQL Editor');
      console.log('4. Copiez et exécutez le contenu de : supabase/migrations/002_create_talents_table.sql');
      console.log('\n✅ Ou bien, utilisez le SQL ci-dessous :\n');
      console.log('─'.repeat(80));
      console.log(migrationSQL);
      console.log('─'.repeat(80));
      return;
    }

    console.log('✅ Migration appliquée avec succès !');
    console.log('\n📊 Table "talents" créée avec :');
    console.log('   - 15 profils de test');
    console.log('   - Index optimisés');
    console.log('   - RLS policies');

  } catch (error) {
    console.error('❌ Erreur lors de l\'application de la migration:', error.message);
    console.log('\n📋 Veuillez appliquer la migration manuellement :');
    console.log('1. Ouvrez : https://app.supabase.com');
    console.log('2. SQL Editor → Nouveau query');
    console.log('3. Copiez le contenu de : supabase/migrations/002_create_talents_table.sql');
    console.log('4. Exécutez le SQL');
  }
}

// Exécuter
applyMigration().catch(console.error);
