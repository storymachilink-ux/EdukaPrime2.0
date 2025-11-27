const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://lkhfbhvamnqgcqlrriaw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxraGZiaHZhbW5xZ2NxbHJyaWF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTExMDI2NDAsImV4cCI6MjAwNzY3NDY0MH0.K3SEW6I0pYwYnZsmXmLkqU8dQcvVVz9lkYPJl9YMxu4";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTriggers() {
  console.log("Verificando triggers...\n");

  // Verificar triggers existentes
  const { data: triggers, error: triggersError } = await supabase.rpc(
    "get_table_triggers"
  );

  if (triggersError) {
    console.log("❌ Erro ao buscar triggers (esperado):", triggersError.message);
  } else {
    console.log("✅ Triggers encontrados:");
    console.log(triggers);
  }

  // Verificar funções
  console.log("\n\nVerificando funções de desbloqueio...");
  
  // Tentar chamar função de verificação
  const userId = "f2c2d4d8-5c5d-4d8c-8d8c-5d8c5d8c5d8c";
  
  console.log("Testando check_and_unlock_download_badges...");
  const { data: downloadBadges, error: downloadError } = await supabase.rpc(
    "check_and_unlock_download_badges",
    { p_user_id: userId }
  );

  if (downloadError) {
    console.log("❌ Erro:", downloadError.message);
  } else {
    console.log("✅ Resultado:", downloadBadges);
  }

  // Buscar dados do usuário
  console.log("\n\nBuscando dados do usuário...");
  const { data: userProgress } = await supabase
    .from("user_progress")
    .select("resource_type, status, user_id")
    .limit(5);

  console.log("user_progress (primeiros 5):", userProgress);

  // Buscar badges desbloqueadas
  const { data: userBadges } = await supabase
    .from("user_badges")
    .select("badge_id, user_id, earned_at")
    .limit(10);

  console.log("\nuser_badges (primeiros 10):", userBadges);

  // Buscar todas as badges
  const { data: allBadges } = await supabase.from("badges").select("*");
  console.log("\nTotal de badges no banco:", allBadges?.length || 0);
  if (allBadges) {
    console.log(
      "Badges:",
      allBadges.map((b) => `${b.id} (${b.requirement_value})`)
    );
  }
}

checkTriggers();
