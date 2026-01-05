#!/usr/bin/env node

/**
 * Script pour tester la requête jobs et voir exactement quelle erreur se produit
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://gywhqtlebvvauxzmdavb.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5d2hxdGxlYnZ2YXV4em1kYXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjE4NDUsImV4cCI6MjA3NzQ5Nzg0NX0.iQB1ZvpjX8hJ4VPclogbRYQnSd0LOFHGuYXrxGbI0Q8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testQuery() {
  console.log('🔍 Test de la requête jobs exacte...\n');
  
  try {
    // Test 1: Requête exacte comme dans useJobs
    console.log('1️⃣ Test requête complète (comme useJobs)...');
    let query = supabase
      .from("jobs")
      .select(
        `
        id,
        title,
        parsed,
        created_at,
        status,
        source
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .limit(100);
    
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Erreur:', error.message);
      console.error('   Code:', error.code);
      console.error('   Détails:', error.details);
      console.error('   Hint:', error.hint);
    } else {
      console.log(`✅ Succès: ${data?.length || 0} jobs trouvés`);
      if (data && data.length > 0) {
        console.log('   Premier job:', {
          id: data[0].id,
          title: data[0].title,
          city: data[0].parsed?.city,
          status: data[0].status,
          source: data[0].source,
        });
      }
    }
    
    // Test 2: Avec filtre de statut
    console.log('\n2️⃣ Test avec filtre status="approved"...');
    const { data: data2, error: error2 } = await supabase
      .from("jobs")
      .select("id, title, parsed, status")
      .eq("status", "approved")
      .limit(5);
    
    if (error2) {
      console.error('❌ Erreur:', error2.message);
    } else {
      console.log(`✅ Succès: ${data2?.length || 0} jobs trouvés`);
    }
    
    // Test 3: Avec filtre de recherche
    console.log('\n3️⃣ Test avec filtre title ilike...');
    const { data: data3, error: error3 } = await supabase
      .from("jobs")
      .select("id, title, parsed")
      .ilike("title", "%Lille%")
      .limit(5);
    
    if (error3) {
      console.error('❌ Erreur:', error3.message);
    } else {
      console.log(`✅ Succès: ${data3?.length || 0} jobs trouvés`);
    }
    
  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

testQuery().catch(console.error);

