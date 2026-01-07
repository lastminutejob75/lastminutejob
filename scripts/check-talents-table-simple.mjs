#!/usr/bin/env node

/**
 * Script pour vérifier si la table talents existe (version sans dépendances)
 * Usage: node scripts/check-talents-table-simple.mjs
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://gywhqtlebvvauxzmdavb.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5d2hxdGxlYnZ2YXV4em1kYXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjE4NDUsImV4cCI6MjA3NzQ5Nzg0NX0.iQB1ZvpjX8hJ4VPclogbRYQnSd0LOFHGuYXrxGbI0Q8';

async function checkTalentsTable() {
  console.log('🔍 Vérification de la table talents...\n');

  try {
    // Requête REST API Supabase
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/talents?select=id,first_name,last_name,job_keys,city&limit=5`,
      {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'count=exact'
        }
      }
    );

    // Vérifier si la table existe
    if (response.status === 404 || response.status === 406) {
      console.log('❌ La table "talents" n\'existe pas encore.\n');
      console.log('📋 Pour créer la table, suivez ces étapes :');
      console.log('1. Ouvrez https://app.supabase.com');
      console.log('2. Projet gywhqtlebvvauxzmdavb → SQL Editor → New query');
      console.log('3. Copiez le contenu de : supabase/migrations/002_create_talents_table.sql');
      console.log('4. Exécutez le SQL (bouton Run)\n');
      console.log('📖 Guide complet : GUIDE_TEST_ORCHESTRATEUR.md\n');
      return false;
    }

    if (!response.ok) {
      console.log(`⚠️  Erreur HTTP ${response.status}: ${response.statusText}`);
      const text = await response.text();
      console.log('Détails:', text.substring(0, 200));
      return false;
    }

    const data = await response.json();
    const count = response.headers.get('Content-Range')?.split('/')[1] || data.length;

    console.log('✅ Table "talents" existe !');
    console.log(`📊 Nombre de profils : ${count}`);

    if (parseInt(count) === 0) {
      console.log('\n⚠️  Aucun profil de test trouvé.');
      console.log('💡 Assurez-vous d\'avoir exécuté la migration COMPLÈTE (avec les INSERT).');
      return false;
    }

    console.log('\n👥 Aperçu des premiers profils :');
    data.slice(0, 3).forEach((talent, i) => {
      const jobs = Array.isArray(talent.job_keys) ? talent.job_keys.join(', ') : 'N/A';
      console.log(`   ${i + 1}. ${talent.first_name} ${talent.last_name?.charAt(0)}. - ${jobs} - ${talent.city}`);
    });

    console.log('\n✅ Tout est prêt pour tester l\'orchestrateur !');
    console.log('📖 Consultez : GUIDE_TEST_ORCHESTRATEUR.md');
    console.log('🚀 Lancez : npm run dev\n');
    return true;

  } catch (err) {
    console.error('❌ Erreur réseau:', err.message);
    console.log('\n💡 Vérifiez votre connexion internet et l\'URL Supabase.');
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
