import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lkhfbhvamnqgcqlrriaw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxraGZiaHZhbW5xZ2NxbHJyaWF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTExMDI2NDAsImV4cCI6MjAwNzY3NDY0MH0.K3SEW6I0pYwYnZsmXmLkqU8dQcvVVz9lkYPJl9YMxu4";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBadges() {
  console.log("=== DIAGNÓSTICO DE BADGES ===\n");

  // 1. Verificar badges na tabela
  console.log("1. Verificando badges na tabela...");
  const { data: allBadges, error: badgesError } = await supabase
    .from("badges")
    .select("*");

  if (badgesError) {
    console.log("❌ Erro:", badgesError.message);
  } else {
    console.log(`✅ Total de badges: ${allBadges?.length || 0}`);
    if (allBadges) {
      allBadges.forEach((b) => {
        console.log(`   - ${b.id}: ${b.title} (${b.requirement_value})`);
      });
    }
  }

  // 2. Verificar user_progress
  console.log("\n2. Verificando user_progress...");
  const { data: allProgress, error: progressError } = await supabase
    .from("user_progress")
    .select("user_id, resource_type, status")
    .limit(20);

  if (progressError) {
    console.log("❌ Erro:", progressError.message);
  } else {
    console.log(`✅ Total de registros: ${allProgress?.length || 0}`);

    // Contar por tipo e status
    const downloads = allProgress?.filter(p => p.status === 'started' || p.status === 'completed').length || 0;
    const completed = allProgress?.filter(p => p.status === 'completed').length || 0;
    console.log(`   - Downloads (started/completed): ${downloads}`);
    console.log(`   - Conclusões (completed): ${completed}`);
  }

  // 3. Verificar user_badges
  console.log("\n3. Verificando user_badges desbloqueadas...");
  const { data: userBadges, error: userBadgesError } = await supabase
    .from("user_badges")
    .select("user_id, badge_id, earned_at");

  if (userBadgesError) {
    console.log("❌ Erro:", userBadgesError.message);
  } else {
    console.log(`✅ Total de badges desbloqueadas: ${userBadges?.length || 0}`);
    if (userBadges && userBadges.length > 0) {
      userBadges.slice(0, 5).forEach((ub) => {
        console.log(`   - Badge: ${ub.badge_id} (User: ${ub.user_id.slice(0, 8)}...)`);
      });
    }
  }

  // 4. Verificar se há usuários com progresso
  console.log("\n4. Verificando usuários com progresso...");
  const { data: usersWithProgress } = await supabase
    .from("user_progress")
    .select("user_id", { count: 'exact' })
    .neq('user_id', 'null');

  console.log(`✅ Usuários com progresso: ${usersWithProgress?.length || 0}`);

  // 5. Verificar um usuário específico
  if (usersWithProgress && usersWithProgress.length > 0) {
    const userId = usersWithProgress[0].user_id;
    console.log(`\n5. Detalhes do usuário ${userId.slice(0, 8)}...`);

    const { data: userProgressData } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId)
      .limit(5);

    const userProgressCount = userProgressData?.filter(p => p.status === 'started' || p.status === 'completed').length || 0;
    const userCompletedCount = userProgressData?.filter(p => p.status === 'completed').length || 0;

    console.log(`   - Total de downloads: ${userProgressCount}`);
    console.log(`   - Total de conclusões: ${userCompletedCount}`);

    // Verificar badges deste usuário
    const { data: userUnlockedBadges } = await supabase
      .from("user_badges")
      .select("badge_id, earned_at")
      .eq("user_id", userId);

    console.log(`   - Badges desbloqueadas: ${userUnlockedBadges?.length || 0}`);
    if (userUnlockedBadges && userUnlockedBadges.length > 0) {
      userUnlockedBadges.forEach((b) => {
        console.log(`      * ${b.badge_id}`);
      });
    }
  }

  console.log("\n=== FIM DO DIAGNÓSTICO ===");
}

checkBadges().catch(console.error);
