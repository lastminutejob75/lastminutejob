#!/usr/bin/env node

/**
 * Script pour vérifier si la table talents existe et contient des données
 * Usage: node scripts/check-talents-table.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://gywhqtlebvvauxzmdavb.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5d2hxdGxlYnZ2YXV4em1kYXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjE4NDUsImV4cCI6MjA3NzQ5Nzg0NX0.iQB1ZvpjX8hJ4VPclogbRYQnSd0LOFHGuYXrxGbI0Q8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkTalentsTable() {
  console.log('🔍 Vérification de la table talents...\n');

  try {
    // Essayer de requêter la table
    const { data, error, count } = await supabase
      .from('talents')
      .select('*', { count: 'exact', head: false })
      .limit(5);

    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        console.log('❌ La table "talents" n\'existe pas encore.\n');
        console.log('📋 Pour créer la table, suivez ces étapes :');
        console.log('1. Ouvrez https://app.supabase.com');
        console.log('2. Projet → SQL Editor → New query');
        console.log('3. Copiez le contenu de : supabase/migrations/002_create_talents_table.sql');
        console.log('4. Exécutez le SQL\n');
        console.log('Ou consultez : GUIDE_TEST_ORCHESTRATEUR.md\n');
        return false;
      }

      console.log('⚠️  Erreur lors de la vérification:', error.message);
      return false;
    }

    console.log('✅ Table "talents" existe !');
    console.log(`📊 Nombre de profils : ${count || 0}`);

    if (count === 0) {
      console.log('\n⚠️  Aucun profil de test trouvé.');
      console.log('💡 Vérifiez que la migration complète a été exécutée (INSERT statements).');
      return false;
    }

    console.log('\n👥 Aperçu des premiers profils :');
    data?.slice(0, 3).forEach((talent, i) => {
      console.log(`   ${i + 1}. ${talent.first_name} ${talent.last_name?.charAt(0)}. - ${talent.job_keys?.join(', ')} - ${talent.city}`);
    });

    console.log('\n✅ Tout est prêt pour tester l\'orchestrateur !');
    console.log('📖 Consultez GUIDE_TEST_ORCHESTRATEUR.md pour les tests.\n');
    return true;

  } catch (err) {
    console.error('❌ Erreur inattendue:', err.message);
    return false;
  }
}

// Exécuter
checkTalentsTable()
  .then(success => process.exit(success ? 0 : 1))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
