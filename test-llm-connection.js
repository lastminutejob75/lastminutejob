/**
 * Script de test pour vérifier la connexion au LLM
 * Usage: node test-llm-connection.js
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://gywhqtlebvvauxzmdavb.supabase.co";
const TEST_PROMPT = "je cherche un serveur pour extras le week-end à Lille";

async function testLLMConnection() {
  console.log("🧪 Test de connexion LLM UWi");
  console.log("=" .repeat(50));
  console.log(`📡 URL Supabase: ${SUPABASE_URL}`);
  console.log(`📝 Prompt de test: "${TEST_PROMPT}"`);
  console.log("");

  // Récupérer la clé anonyme depuis les variables d'environnement ou utiliser la fallback
  const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5d2hxdGxlYnZ2YXV4em1kYXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjE4NDUsImV4cCI6MjA3NzQ5Nzg0NX0.iQB1ZvpjX8hJ4VPclogbRYQnSd0LOFHGuYXrxGbI0Q8";

  try {
    console.log("⏳ Envoi de la requête à l'Edge Function...");
    const response = await fetch(`${SUPABASE_URL}/functions/v1/uwi-announce`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ prompt: TEST_PROMPT }),
    });

    console.log(`📊 Status HTTP: ${response.status} ${response.statusText}`);
    console.log("");

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Erreur:", errorText);
      
      if (response.status === 500 && errorText.includes("OPENAI_API_KEY")) {
        console.log("");
        console.log("⚠️  SOLUTION:");
        console.log("   La clé OPENAI_API_KEY n'est pas configurée dans Supabase.");
        console.log("   Allez dans: Dashboard Supabase → Edge Functions → Settings → Secrets");
        console.log("   Ajoutez: OPENAI_API_KEY=sk-votre-clé");
      }
      return;
    }

    const data = await response.json();
    console.log("✅ Réponse reçue!");
    console.log("");
    console.log("📦 Données reçues:");
    console.log(JSON.stringify(data, null, 2));
    console.log("");

    if (data.ok && data.announcement) {
      const ann = data.announcement;
      console.log("🎉 CONNEXION LLM RÉUSSIE!");
      console.log("");
      console.log("📋 Résumé de l'annonce générée:");
      console.log(`   Type: ${ann.type}`);
      console.log(`   Rôle: ${ann.role_label}`);
      console.log(`   Contexte: ${ann.short_context}`);
      console.log(`   Lieu: ${ann.location || "Non spécifié"}`);
      console.log(`   Sections: ${ann.sections?.length || 0}`);
    } else {
      console.log("⚠️  Réponse inattendue:", data);
    }
  } catch (error) {
    console.error("❌ Erreur de connexion:", error.message);
    console.log("");
    console.log("🔍 Vérifications:");
    console.log("   1. Vérifiez que VITE_SUPABASE_URL est correct");
    console.log("   2. Vérifiez votre connexion internet");
    console.log("   3. Vérifiez que l'Edge Function 'uwi-announce' est déployée");
  }
}

testLLMConnection();

