/**
 * Script de test pour l'intégration Capability Graph + LLM
 * 
 * Usage: node scripts/test-capability-graph-integration.js
 */

// ⚠️ IMPORTANT : Supabase LastMinuteJob : https://lsukxdglogtgfukdqqti.supabase.co
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://lsukxdglogtgfukdqqti.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_8lYvOVlfCNTdJaYB0SYfnw_5PapFvCO";

// Tests avec métiers détectés
const TEST_CASES = [
  {
    prompt: "Je cherche un serveur pour ce week-end à Paris",
    detectedJob: { jobKey: "server", confidence: 0.9 }
  },
  {
    prompt: "Besoin urgent d'un cuisinier pour demain soir",
    detectedJob: { jobKey: "cook", confidence: 0.85 }
  },
  {
    prompt: "Recherche développeur web freelance pour créer un site e-commerce",
    detectedJob: { jobKey: "web_developer", confidence: 0.95 }
  }
];

/**
 * Teste l'Edge Function enrichie avec Capability Graph
 */
async function testEnrichedAnnouncement(prompt, detectedJob) {
  console.log(`\n🧪 Test avec enrichissement Capability Graph`);
  console.log(`   Prompt: "${prompt}"`);
  console.log(`   Métier détecté: ${detectedJob.jobKey} (${Math.round(detectedJob.confidence * 100)}%)`);
  console.log("─".repeat(60));

  try {
    const startTime = Date.now();
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/uwi-announce-enriched`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ prompt, detectedJob }),
    });

    const duration = Date.now() - startTime;

    console.log(`📡 Statut HTTP: ${response.status} ${response.statusText}`);
    console.log(`⏱️  Temps de réponse: ${duration}ms`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erreur HTTP:`, errorText);
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }

    const data = await response.json();
    
    console.log(`✅ Réponse reçue:`);
    
    if (data.ok && data.announcement) {
      const announcement = data.announcement;
      console.log(`\n📝 Annonce générée:`);
      console.log(`   Type: ${announcement.type || 'N/A'}`);
      console.log(`   Rôle: ${announcement.role_label || 'N/A'}`);
      console.log(`   Localisation: ${announcement.location || 'N/A'}`);
      console.log(`   Contexte: ${announcement.short_context || 'N/A'}`);
      
      if (data.enrichment) {
        console.log(`\n🎯 Enrichissement Capability Graph:`);
        if (data.enrichment.capability) {
          console.log(`   Capability: ${data.enrichment.capability}`);
        }
        if (data.enrichment.marketData) {
          const md = data.enrichment.marketData;
          console.log(`   Données de marché:`);
          if (md.avgPrice) {
            console.log(`     - Prix moyen: ${Math.round(md.avgPrice)}€`);
          }
          if (md.typicalDuration) {
            console.log(`     - Délai typique: ${md.typicalDuration}`);
          }
          if (md.criticalSkills && md.criticalSkills.length > 0) {
            console.log(`     - Compétences: ${md.criticalSkills.join(', ')}`);
          }
        }
      }

      return { 
        success: true, 
        announcement,
        enrichment: data.enrichment,
        duration 
      };
    } else {
      console.error(`❌ Format de réponse invalide`);
      return { success: false, error: "Format de réponse invalide", data };
    }

  } catch (error) {
    console.error(`❌ Erreur lors de l'appel:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log("🚀 Test de l'intégration Capability Graph + LLM");
  console.log("=".repeat(60));

  // Vérifier la configuration
  console.log(`\n🔍 Configuration:`);
  console.log(`   SUPABASE_URL: ${SUPABASE_URL ? SUPABASE_URL.substring(0, 40) + '...' : '❌ NON CONFIGURÉ'}`);
  console.log(`   SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 20) + '...' : '❌ NON CONFIGURÉ'}`);

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error(`\n❌ Configuration incomplète!`);
    process.exit(1);
  }

  console.log(`\n\n🧪 Tests avec enrichissement`);
  console.log("=".repeat(60));

  const results = [];
  
  for (const testCase of TEST_CASES) {
    const result = await testEnrichedAnnouncement(testCase.prompt, testCase.detectedJob);
    results.push({ ...testCase, ...result });
    
    // Attendre entre les tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Résumé
  console.log(`\n\n📊 Résumé des tests`);
  console.log("=".repeat(60));

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const withEnrichment = results.filter(r => r.enrichment?.capability).length;
  const avgDuration = results
    .filter(r => r.duration)
    .reduce((sum, r) => sum + r.duration, 0) / successful || 0;

  console.log(`✅ Réussis: ${successful}/${results.length}`);
  console.log(`❌ Échoués: ${failed}/${results.length}`);
  console.log(`🎯 Avec enrichissement: ${withEnrichment}/${results.length}`);
  if (successful > 0) {
    console.log(`⏱️  Temps moyen: ${Math.round(avgDuration)}ms`);
  }

  if (failed > 0) {
    console.log(`\n❌ Tests échoués:`);
    results
      .filter(r => !r.success)
      .forEach((r, idx) => {
        console.log(`   ${idx + 1}. "${r.prompt.substring(0, 50)}..."`);
        console.log(`      Erreur: ${r.error}`);
      });
  }

  // Recommandations
  console.log(`\n💡 Recommandations`);
  console.log("─".repeat(60));

  if (successful === 0) {
    console.log(`❌ Aucun test n'a réussi. Vérifiez:`);
    console.log(`   1. Que l'Edge Function 'uwi-announce-enriched' est déployée`);
    console.log(`   2. Que SUPABASE_SERVICE_ROLE_KEY est configurée dans les secrets Supabase`);
    console.log(`   3. Que les tables du Capability Graph existent (capabilities, providers, capability_providers)`);
  } else if (withEnrichment === 0) {
    console.log(`⚠️  Les tests passent mais l'enrichissement ne fonctionne pas.`);
    console.log(`   Vérifiez que:`);
    console.log(`   1. SUPABASE_SERVICE_ROLE_KEY est configurée dans les secrets Supabase`);
    console.log(`   2. Les tables du Capability Graph sont accessibles`);
    console.log(`   3. Il y a des données dans le Capability Graph`);
  } else {
    console.log(`✅ L'intégration fonctionne! Le Capability Graph enrichit les annonces.`);
  }

  process.exit(failed === 0 ? 0 : 1);
}

main().catch(error => {
  console.error(`\n💥 Erreur fatale:`, error);
  process.exit(1);
});

