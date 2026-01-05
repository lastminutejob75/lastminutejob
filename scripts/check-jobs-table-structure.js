#!/usr/bin/env node

/**
 * Script pour vérifier la structure actuelle de la table jobs
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://gywhqtlebvvauxzmdavb.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5d2hxdGxlYnZ2YXV4em1kYXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjE4NDUsImV4cCI6MjA3NzQ5Nzg0NX0.iQB1ZvpjX8hJ4VPclogbRYQnSd0LOFHGuYXrxGbI0Q8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTableStructure() {
  console.log('🔍 Vérification de la structure de la table jobs...\n');
  
  // Test 1: Vérifier si la colonne city existe
  console.log('1️⃣ Test avec colonne city...');
  const { data: withCity, error: cityError } = await supabase
    .from('jobs')
    .select('id, title, city')
    .limit(1);
  
  if (cityError) {
    console.log('❌ Erreur avec colonne city:', cityError.message);
    console.log('   Code:', cityError.code);
  } else {
    console.log('✅ Colonne city existe');
    console.log('   Exemple:', withCity?.[0]);
  }
  
  // Test 2: Vérifier si parsed jsonb existe
  console.log('\n2️⃣ Test avec parsed jsonb...');
  const { data: withParsed, error: parsedError } = await supabase
    .from('jobs')
    .select('id, title, parsed')
    .limit(1);
  
  if (parsedError) {
    console.log('❌ Erreur avec parsed:', parsedError.message);
  } else {
    console.log('✅ Colonne parsed existe');
    if (withParsed && withParsed[0]) {
      console.log('   Exemple parsed:', JSON.stringify(withParsed[0].parsed, null, 2));
      if (withParsed[0].parsed && typeof withParsed[0].parsed === 'object') {
        console.log('   City dans parsed:', withParsed[0].parsed.city);
      }
    }
  }
  
  // Test 3: Lister toutes les colonnes
  console.log('\n3️⃣ Structure complète d\'un job...');
  const { data: fullJob, error: fullError } = await supabase
    .from('jobs')
    .select('*')
    .limit(1);
  
  if (fullError) {
    console.log('❌ Erreur:', fullError.message);
  } else if (fullJob && fullJob[0]) {
    console.log('✅ Colonnes disponibles:');
    Object.keys(fullJob[0]).forEach(key => {
      const value = fullJob[0][key];
      const type = typeof value;
      const preview = type === 'object' ? JSON.stringify(value).substring(0, 50) : String(value).substring(0, 50);
      console.log(`   - ${key}: ${type} (${preview}...)`);
    });
  }
}

checkTableStructure().catch(console.error);

