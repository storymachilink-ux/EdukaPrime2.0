// webhook-vega/index.ts
// WEBHOOK ESPECÍFICA PARA VEGA
// URL: https://seu-supabase.supabase.co/functions/v1/webhook-vega

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.38.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

serve(async (req: Request): Promise<Response> => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Use POST" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.json();
    console.log("📥 [VEGA] Webhook recebido");

    // ─────────────────────────────────────────────
    // 1) EXTRAIR DADOS DO VEGA
    // ─────────────────────────────────────────────
    const customer_email = payload.customer?.email?.toLowerCase();
    const customer_name = payload.customer?.name || null;
    const amount = payload.total_price ? payload.total_price / 100 : 0;
    const product_id = payload.products?.[0]?.code || null;
    const payment_id = payload.transaction_token || null;
    const payment_method = payload.method || null;
    const event_type =
      payload.status === "approved" ? "payment.approved" : "payment.pending";
    const product_title = payload.products?.[0]?.title || null;

    console.log(`📧 Email: ${customer_email}`);
    console.log(`💰 Valor: R$ ${amount.toFixed(2)}`);
    console.log(`📦 Product ID: ${product_id}`);
    console.log(`🎯 Status: ${event_type}`);

    // ─────────────────────────────────────────────
    // 2) INSERIR LOG EM webhook_logs
    // ─────────────────────────────────────────────
    const { data: logData, error: logError } = await supabase
      .from("webhook_logs")
      .insert({
        platform: "vega",
        event_type,
        status: "received",
        customer_email,
        customer_name,
        amount,
        transaction_id: payment_id,
        payment_method,
        product_id,
        product_title,
        raw_payload: payload,
      })
      .select()
      .single();

    if (logError) {
      console.error("❌ Erro ao inserir log:", logError.message);
      return new Response(
        JSON.stringify({ error: logError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const webhookId = logData.id;
    console.log("✅ Log inserido:", webhookId);

    // ─────────────────────────────────────────────
    // 3) SE NÃO FOR APROVADO, APENAS LOG
    // ─────────────────────────────────────────────
    if (event_type !== "payment.approved") {
      console.log("ℹ️ Pagamento não aprovado. Apenas registrado.");
      return new Response(
        JSON.stringify({
          success: true,
          webhook_id: webhookId,
          message: "Pagamento pendente",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ─────────────────────────────────────────────
    // 4) VALIDAR DADOS OBRIGATÓRIOS
    // ─────────────────────────────────────────────
    if (!customer_email || !product_id || !payment_id) {
      console.error("❌ Dados faltando: email, product_id ou payment_id");

      await supabase
        .from("webhook_logs")
        .update({
          status: "failed",
          notes: "Dados obrigatórios faltando",
        })
        .eq("id", webhookId);

      return new Response(
        JSON.stringify({ success: false, message: "Dados incompletos" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ─────────────────────────────────────────────
    // 5) VERIFICAR IDEMPOTÊNCIA
    // ─────────────────────────────────────────────
    const { data: existingSub } = await supabase
      .from("user_subscriptions")
      .select("id")
      .eq("payment_id", payment_id)
      .maybeSingle();

    if (existingSub) {
      console.log("⚠️ Webhook duplicado (subscription já existe)");

      await supabase
        .from("webhook_logs")
        .update({
          status: "success",
          notes: "Duplicado (subscription existe)",
        })
        .eq("id", webhookId);

      return new Response(
        JSON.stringify({
          success: true,
          webhook_id: webhookId,
          message: "Já processado",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ─────────────────────────────────────────────
    // 6) BUSCAR PLANO
    // ─────────────────────────────────────────────
    const { data: planData } = await supabase
      .from("plans_v2")
      .select("id, duration_days")
      .eq("vega_product_id", product_id)
      .maybeSingle();

    if (!planData) {
      console.error("❌ Plano não encontrado para:", product_id);

      await supabase
        .from("webhook_logs")
        .update({
          status: "failed",
          notes: `PLANO_NAO_MAPEADO: ${product_id}`,
        })
        .eq("id", webhookId);

      return new Response(
        JSON.stringify({
          success: false,
          message: "Plano não mapeado",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const planId = planData.id;
    const duration_days = planData.duration_days;

    console.log(`✅ Plano encontrado: ${planId}`);

    // Calcular data de expiração
    let endDate: string | null = null;
    if (duration_days && duration_days > 0) {
      const end = new Date();
      end.setDate(end.getDate() + duration_days);
      endDate = end.toISOString();
    }

    const nowIso = new Date().toISOString();

    // ─────────────────────────────────────────────
    // 7) BUSCAR USUÁRIO
    // ─────────────────────────────────────────────
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("email", customer_email)
      .maybeSingle();

    // ─────────────────────────────────────────────
    // 8) SE USUÁRIO EXISTE → CRIAR SUBSCRIPTION
    // ─────────────────────────────────────────────
    if (userData) {
      const userId = userData.id;
      console.log(`👤 Usuário encontrado: ${userId}`);

      const { error: subError } = await supabase.from("user_subscriptions").insert({
        user_id: userId,
        plan_id: planId,
        status: "active",
        start_date: nowIso,
        end_date: endDate,
        payment_id: payment_id,
        amount_paid: amount,
        webhook_id: webhookId,
      });

      if (subError) {
        console.error("❌ Erro ao criar subscription:", subError.message);

        await supabase
          .from("webhook_logs")
          .update({
            status: "failed",
            notes: `Erro subscription: ${subError.message}`,
          })
          .eq("id", webhookId);

        return new Response(
          JSON.stringify({ error: "Erro ao criar subscription" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log("✅ Subscription criada");

      // Atualizar usuário
      await supabase
        .from("users")
        .update({
          active_plan_id: planId,
          plano_ativo: planId,
          updated_at: nowIso,
        })
        .eq("id", userId);

      await supabase
        .from("webhook_logs")
        .update({
          status: "success",
          notes: "Subscription criada",
        })
        .eq("id", webhookId);

      return new Response(
        JSON.stringify({
          success: true,
          webhook_id: webhookId,
          mode: "subscription",
          message: "Plano ativado",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ─────────────────────────────────────────────
    // 9) SE USUÁRIO NÃO EXISTE → CRIAR PENDING_PLAN
    // ─────────────────────────────────────────────
    console.log("⏳ Usuário não encontrado. Criando pending_plan...");

    const { data: existingPending } = await supabase
      .from("pending_plans")
      .select("id")
      .eq("payment_id", payment_id)
      .maybeSingle();

    if (existingPending) {
      console.log("⚠️ Pending_plan já existe");

      await supabase
        .from("webhook_logs")
        .update({
          status: "success",
          notes: "Duplicado (pending_plan existe)",
        })
        .eq("id", webhookId);

      return new Response(
        JSON.stringify({
          success: true,
          webhook_id: webhookId,
          mode: "pending_plan",
          message: "Já processado",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { error: pendingError } = await supabase.from("pending_plans").insert({
      email: customer_email,
      plan_id: planId,
      status: "pending",
      start_date: nowIso,
      end_date: endDate,
      payment_id: payment_id,
      amount_paid: amount,
      webhook_id: webhookId,
      platform: "vega",
    });

    if (pendingError) {
      console.error("❌ Erro ao criar pending_plan:", pendingError.message);

      await supabase
        .from("webhook_logs")
        .update({
          status: "failed",
          notes: `Erro pending_plan: ${pendingError.message}`,
        })
        .eq("id", webhookId);

      return new Response(
        JSON.stringify({ error: "Erro ao criar pending_plan" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("✅ Pending_plan criado");

    await supabase
      .from("webhook_logs")
      .update({
        status: "success",
        notes: "Pending_plan criado",
      })
      .eq("id", webhookId);

    return new Response(
      JSON.stringify({
        success: true,
        webhook_id: webhookId,
        mode: "pending_plan",
        message: "Plano pendente criado",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("❌ ERRO:", error.message);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
