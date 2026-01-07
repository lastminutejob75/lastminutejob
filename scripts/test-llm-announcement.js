/**
 * Script de test pour vérifier le fonctionnement du LLM dans LastMinuteJob
 * 
 * Usage: node scripts/test-llm-announcement.js
 */

// ⚠️ IMPORTANT : Supabase LastMinuteJob : https://lsukxdglogtgfukdqqti.supabase.co
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://lsukxdglogtgfukdqqti.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_8lYvOVlfCNTdJaYB0SYfnw_5PapFvCO";

// Prompts de test
const TEST_PROMPTS = [
  "Je cherche un serveur pour ce week-end à Paris",
  "Besoin urgent d'un cuisinier pour demain soir",
  "Recherche développeur web freelance pour créer un site e-commerce",
  "On a besoin d'un livreur pour des missions ponctuelles à Lyon"
];

/**
 * Teste l'appel à l'Edge Function uwi-announce
 */
async function testLLMAnnouncement(prompt) {
  console.log(`\n🧪 Test avec le prompt: "${prompt}"`);
  console.log("─".repeat(60));

  try {
    const startTime = Date.now();
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/uwi-announce`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ prompt }),
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
    console.log(JSON.stringify(data, null, 2));

    if (data.ok && data.announcement) {
      const announcement = data.announcement;
      console.log(`\n📝 Annonce générée:`);
      console.log(`   Type: ${announcement.type || 'N/A'}`);
      console.log(`   Rôle: ${announcement.role_label || 'N/A'}`);
      console.log(`   Localisation: ${announcement.location || 'N/A'}`);
      console.log(`   Contexte: ${announcement.short_context || 'N/A'}`);
      
      if (announcement.sections && announcement.sections.length > 0) {
        console.log(`\n   Sections:`);
        announcement.sections.forEach((section, idx) => {
          console.log(`   ${idx + 1}. ${section.title || 'Sans titre'}`);
          if (section.items) {
            section.items.forEach(item => console.log(`      - ${item}`));
          }
        });
      }

      return { 
        success: true, 
        announcement,
        duration 
      };
    } else {
      console.error(`❌ Format de réponse invalide`);
      console.error(`   Attendu: { ok: true, announcement: {...} }`);
      console.error(`   Reçu:`, data);
      return { success: false, error: "Format de réponse invalide", data };
    }

  } catch (error) {
    console.error(`❌ Erreur lors de l'appel:`, error.message);
    console.error(`   Stack:`, error.stack);
    return { success: false, error: error.message };
  }
}

/**
 * Teste la configuration
 */
function testConfiguration() {
  console.log("🔍 Vérification de la configuration...");
  console.log("─".repeat(60));

  const config = {
    SUPABASE_URL: SUPABASE_URL ? `${SUPABASE_URL.substring(0, 30)}...` : "❌ NON CONFIGURÉ",
    SUPABASE_ANON_KEY: SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 20)}...` : "❌ NON CONFIGURÉ",
  };

  console.log(`📋 Configuration:`);
  Object.entries(config).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });

  const isValid = SUPABASE_URL && SUPABASE_ANON_KEY;
  
  if (!isValid) {
    console.error(`\n❌ Configuration incomplète!`);
    console.error(`   Assurez-vous d'avoir configuré:`);
    console.error(`   - VITE_SUPABASE_URL`);
    console.error(`   - VITE_SUPABASE_ANON_KEY`);
    return false;
  }

  console.log(`\n✅ Configuration valide`);
  return true;
}

/**
 * Teste la disponibilité de l'Edge Function
 */
async function testEdgeFunctionAvailability() {
  console.log("\n🔍 Vérification de la disponibilité de l'Edge Function...");
  console.log("─".repeat(60));

  try {
    // Test avec un prompt minimal
    const response = await fetch(`${SUPABASE_URL}/functions/v1/uwi-announce`, {
      method: "OPTIONS",
      headers: {
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (response.status === 200 || response.status === 204) {
      console.log(`✅ Edge Function accessible (CORS OK)`);
      return true;
    } else {
      console.log(`⚠️  Statut inattendu: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la vérification:`, error.message);
    return false;
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log("🚀 Test du LLM pour LastMinuteJob");
  console.log("=".repeat(60));

  // 1. Vérifier la configuration
  if (!testConfiguration()) {
    process.exit(1);
  }

  // 2. Vérifier la disponibilité de l'Edge Function
  const isAvailable = await testEdgeFunctionAvailability();
  if (!isAvailable) {
    console.log(`\n⚠️  L'Edge Function pourrait ne pas être accessible`);
    console.log(`   Continuons quand même le test...`);
  }

  // 3. Tester avec plusieurs prompts
  console.log(`\n\n🧪 Tests avec différents prompts`);
  console.log("=".repeat(60));

  const results = [];
  
  for (const prompt of TEST_PROMPTS) {
    const result = await testLLMAnnouncement(prompt);
    results.push({ prompt, ...result });
    
    // Attendre un peu entre les tests pour éviter le rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 4. Résumé
  console.log(`\n\n📊 Résumé des tests`);
  console.log("=".repeat(60));

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const avgDuration = results
    .filter(r => r.duration)
    .reduce((sum, r) => sum + r.duration, 0) / successful || 0;

  console.log(`✅ Réussis: ${successful}/${results.length}`);
  console.log(`❌ Échoués: ${failed}/${results.length}`);
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

  // 5. Recommandations
  console.log(`\n💡 Recommandations`);
  console.log("─".repeat(60));

  if (successful === 0) {
    console.log(`❌ Aucun test n'a réussi. Vérifiez:`);
    console.log(`   1. Que l'Edge Function 'uwi-announce' est déployée sur Supabase`);
    console.log(`   2. Que OPENAI_API_KEY est configurée dans les secrets Supabase`);
    console.log(`   3. Que les variables d'environnement sont correctes`);
    console.log(`   4. Les logs de l'Edge Function dans le dashboard Supabase`);
  } else if (failed > 0) {
    console.log(`⚠️  Certains tests ont échoué. Vérifiez:`);
    console.log(`   1. Les logs de l'Edge Function pour les erreurs spécifiques`);
    console.log(`   2. Que OPENAI_API_KEY est valide et a des crédits`);
    console.log(`   3. Les limites de rate limiting d'OpenAI`);
  } else {
    console.log(`✅ Tous les tests sont passés! Le LLM est fonctionnel.`);
    console.log(`   Vous pouvez maintenant intégrer le Capability Graph.`);
  }

  process.exit(failed === 0 ? 0 : 1);
}

// Exécuter les tests
main().catch(error => {
  console.error(`\n💥 Erreur fatale:`, error);
  process.exit(1);
});

