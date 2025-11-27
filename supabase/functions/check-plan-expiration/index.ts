import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

interface ExpiredSubscription {
  id: string;
  user_id: string;
  plan_id: number;
  end_date: string;
}

interface ExpirationResult {
  status: "success" | "error";
  expired_count: number;
  notifications_created: number;
  pending_plans_expired: number;
  error?: string;
  timestamp: string;
}

async function checkPlanExpiration(): Promise<ExpirationResult> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const now = new Date().toISOString();
    let expiredCount = 0;
    let notificationsCreated = 0;
    let pendingPlansExpiredCount = 0;

    console.log(`⏰ [${now}] Iniciando verificação de expiração de planos...`);

    // ============================================
    // [1] VERIFICAR SUBSCRIPTIONS EXPIRADAS
    // ============================================

    const { data: expiredSubscriptions, error: fetchError } = await supabase
      .from("user_subscriptions")
      .select("id, user_id, plan_id, end_date")
      .lt("end_date", now) // end_date < agora
      .eq("status", "active"); // status = active

    if (fetchError) {
      console.error("❌ Erro ao buscar subscriptions expiradas:", fetchError);
      return {
        status: "error",
        expired_count: 0,
        notifications_created: 0,
        pending_plans_expired: 0,
        error: fetchError.message,
        timestamp: now,
      };
    }

    if (expiredSubscriptions && expiredSubscriptions.length > 0) {
      console.log(`📊 Encontradas ${expiredSubscriptions.length} subscriptions expiradas`);

      // ============================================
      // [1A] ATUALIZAR STATUS PARA 'EXPIRED'
      // ============================================

      for (const sub of expiredSubscriptions) {
        // Atualizar status
        const { error: updateError } = await supabase
          .from("user_subscriptions")
          .update({
            status: "expired",
            updated_at: now,
          })
          .eq("id", sub.id);

        if (updateError) {
          console.error(
            `❌ Erro ao atualizar subscription ${sub.id}:`,
            updateError
          );
          continue;
        }

        expiredCount++;

        // ============================================
        // [1B] CRIAR NOTIFICAÇÃO
        // ============================================

        const { error: notificationError } = await supabase
          .from("notifications")
          .insert({
            user_id: sub.user_id,
            type: "plan_expired",
            title: "🔴 Seu plano expirou!",
            message:
              "Seu acesso premium foi desativado. Renove agora para continuar desfrutando de todo o conteúdo.",
            action_url: "/renovar-plano",
            action_label: "Renovar Plano",
            read: false,
            created_at: now,
          });

        if (notificationError) {
          console.warn(
            `⚠️ Erro ao criar notificação para user ${sub.user_id}:`,
            notificationError
          );
        } else {
          notificationsCreated++;
        }

        // ============================================
        // [1C] LOG PARA AUDITORIA
        // ============================================

        console.log(
          `✅ Subscription ${sub.id} (user: ${sub.user_id}) marcada como expirada`
        );
      }
    } else {
      console.log("✅ Nenhuma subscription expirada encontrada");
    }

    // ============================================
    // [2] VERIFICAR PENDING PLANS EXPIRADOS
    // ============================================

    const { data: expiredPendingPlans, error: pendingFetchError } = await supabase
      .from("pending_plans")
      .select("id, email, plan_id, end_date")
      .lt("end_date", now) // end_date < agora
      .eq("status", "pending"); // status = pending

    if (pendingFetchError) {
      console.error(
        "❌ Erro ao buscar pending_plans expirados:",
        pendingFetchError
      );
    } else if (expiredPendingPlans && expiredPendingPlans.length > 0) {
      console.log(
        `📊 Encontrados ${expiredPendingPlans.length} pending_plans expirados`
      );

      for (const pending of expiredPendingPlans) {
        const { error: updateError } = await supabase
          .from("pending_plans")
          .update({
            status: "expired",
            updated_at: now,
          })
          .eq("id", pending.id);

        if (updateError) {
          console.error(
            `❌ Erro ao atualizar pending_plan ${pending.id}:`,
            updateError
          );
          continue;
        }

        pendingPlansExpiredCount++;
        console.log(
          `✅ Pending plan ${pending.id} (email: ${pending.email}) marcado como expirado`
        );
      }
    }

    // ============================================
    // [3] RETORNAR RESULTADO
    // ============================================

    const result: ExpirationResult = {
      status: "success",
      expired_count: expiredCount,
      notifications_created: notificationsCreated,
      pending_plans_expired: pendingPlansExpiredCount,
      timestamp: now,
    };

    console.log(`✅ Verificação concluída:`, result);

    return result;
  } catch (error) {
    const now = new Date().toISOString();
    console.error(`❌ [${now}] Erro fatal na verificação de expiração:`, error);

    return {
      status: "error",
      expired_count: 0,
      notifications_created: 0,
      pending_plans_expired: 0,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: now,
    };
  }
}

// ============================================
// [4] HANDLER DA EDGE FUNCTION
// ============================================

Deno.serve(async (req: Request) => {
  // Validar método HTTP
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Método não permitido. Use POST.",
      }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Executar verificação de expiração
    const result = await checkPlanExpiration();

    return new Response(JSON.stringify(result), {
      status: result.status === "success" ? 200 : 500,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Erro na edge function:", error);

    return new Response(
      JSON.stringify({
        status: "error",
        expired_count: 0,
        notifications_created: 0,
        pending_plans_expired: 0,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
