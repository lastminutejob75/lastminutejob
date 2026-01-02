#!/usr/bin/env node

/**
 * Script de diagnostic pour vérifier les connexions Supabase
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://gywhqtlebvvauxzmdavb.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5d2hxdGxlYnZ2YXV4em1kYXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjE4NDUsImV4cCI6MjA3NzQ5Nzg0NX0.iQB1ZvpjX8hJ4VPclogbRYQnSd0LOFHGuYXrxGbI0Q8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnections() {
  console.log('🔍 Diagnostic des connexions Supabase...\n');
  console.log('📊 URL:', supabaseUrl);
  console.log('🔑 Clé:', supabaseAnonKey.substring(0, 20) + '...\n');

  // Test 1: Vérifier la table jobs
  console.log('1️⃣ Test de la table jobs...');
  const { data: jobs, error: jobsError, count: jobsCount } = await supabase
    .from('jobs')
    .select('*', { count: 'exact' })
    .limit(5);
  
  if (jobsError) {
    console.error('❌ Erreur:', jobsError.message);
    console.error('   Code:', jobsError.code);
    console.error('   Détails:', jobsError.details);
  } else {
    console.log(`✅ Jobs: ${jobsCount || 0} annonces trouvées`);
    if (jobs && jobs.length > 0) {
      console.log('   Exemple:', jobs[0].title);
    }
  }

  // Test 2: Vérifier la table applications
  console.log('\n2️⃣ Test de la table applications...');
  const { data: apps, error: appsError, count: appsCount } = await supabase
    .from('applications')
    .select('*', { count: 'exact' })
    .limit(5);
  
  if (appsError) {
    console.error('❌ Erreur:', appsError.message);
    console.error('   Code:', appsError.code);
    console.error('   Détails:', appsError.details);
  } else {
    console.log(`✅ Applications: ${appsCount || 0} candidatures trouvées`);
  }

  // Test 3: Vérifier la relation jobs -> applications
  console.log('\n3️⃣ Test de la relation jobs -> applications...');
  const { data: jobsWithApps, error: relError } = await supabase
    .from('jobs')
    .select(`
      id,
      title,
      applications(count)
    `)
    .limit(3);
  
  if (relError) {
    console.error('❌ Erreur relation:', relError.message);
    console.error('   Code:', relError.code);
    console.error('   Détails:', relError.details);
  } else {
    console.log('✅ Relation fonctionne!');
    if (jobsWithApps && jobsWithApps.length > 0) {
      jobsWithApps.forEach(job => {
        const count = Array.isArray(job.applications) 
          ? job.applications[0]?.count ?? 0 
          : (job.applications?.count ?? 0);
        console.log(`   - ${job.title}: ${count} candidatures`);
      });
    }
  }

  // Test 4: Vérifier la table clients
  console.log('\n4️⃣ Test de la table clients...');
  const { data: clients, error: clientsError, count: clientsCount } = await supabase
    .from('clients')
    .select('*', { count: 'exact' })
    .limit(5);
  
  if (clientsError) {
    console.error('❌ Erreur:', clientsError.message);
    console.error('   Code:', clientsError.code);
  } else {
    console.log(`✅ Clients: ${clientsCount || 0} clients trouvés`);
  }

  // Test 5: Vérifier la table candidates
  console.log('\n5️⃣ Test de la table candidates...');
  const { data: candidates, error: candidatesError, count: candidatesCount } = await supabase
    .from('candidates')
    .select('*', { count: 'exact' })
    .limit(5);
  
  if (candidatesError) {
    console.error('❌ Erreur:', candidatesError.message);
    console.error('   Code:', candidatesError.code);
  } else {
    console.log(`✅ Candidates: ${candidatesCount || 0} candidats trouvés`);
  }

  console.log('\n📋 Résumé:');
  console.log(`   - Jobs: ${jobsCount || 0}`);
  console.log(`   - Applications: ${appsCount || 0}`);
  console.log(`   - Clients: ${clientsCount || 0}`);
  console.log(`   - Candidates: ${candidatesCount || 0}`);
  
  if ((jobsCount || 0) === 0) {
    console.log('\n💡 Aucune donnée dans la table jobs. C\'est normal si vous venez de créer les tables.');
    console.log('   Vous pouvez créer des annonces via le dashboard admin.');
  }
}

testConnections().catch(console.error);

