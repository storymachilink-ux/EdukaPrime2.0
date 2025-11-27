// webhook-amplopay/index.ts
// WEBHOOK ESPECÍFICA PARA AMPLOPAY
// URL: https://seu-supabase.supabase.co/functions/v1/webhook-amplopay

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
    console.log("📥 [AMPLOPAY] Webhook recebido");

    const customer_email = payload.customer?.email?.toLowerCase();
    const customer_name = payload.customer?.name || null;
    const amount = payload.amount || 0;
    const product_id = payload.product_id || null;
    const payment_id = payload.transaction_id || payload.id || null;
    const payment_method = payload.method || payload.payment_method || null;
    const event_type = payload.status === "approved" ? "payment.approved" : "payment.pending";
    const product_title = payload.product_title || null;

    console.log(`📧 Email: ${customer_email}`);
    console.log(`💰 Valor: R$ ${amount}`);
    console.log(`📦 Product ID: ${product_id}`);
    console.log(`🎯 Status: ${event_type}`);

    const { data: logData, error: logError } = await supabase
      .from("webhook_logs")
      .insert({
        platform: "amplopay",
        event_type,
        status: "received",
        customer_email,
        customer_name,
        amount,
        transaction_id: payment_id,
        payment_method,
        product_titles: product_title,
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

    if (event_type !== "payment.approved") {
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

    if (!customer_email || !product_id || !payment_id) {
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

    const { data: existingSub } = await supabase
      .from("user_subscriptions")
      .select("id")
      .eq("payment_id", payment_id)
      .maybeSingle();

    if (existingSub) {
      await supabase
        .from("webhook_logs")
        .update({
          status: "success",
          notes: "Duplicado",
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

    const { data: planData } = await supabase
      .from("plans_v2")
      .select("id, duration_days")
      .eq("amplopay_product_id", product_id)
      .maybeSingle();

    if (!planData) {
      await supabase
        .from("webhook_logs")
        .update({
          status: "failed",
          notes: `PLANO_NAO_MAPEADO: ${product_id}`,
        })
        .eq("id", webhookId);

      return new Response(
        JSON.stringify({ success: false, message: "Plano não mapeado" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const planId = planData.id;
    const duration_days = planData.duration_days;

    let endDate: string | null = null;
    if (duration_days && duration_days > 0) {
      const end = new Date();
      end.setDate(end.getDate() + duration_days);
      endDate = end.toISOString();
    }

    const nowIso = new Date().toISOString();

    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("email", customer_email)
      .maybeSingle();

    if (userData) {
      const userId = userData.id;

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
        await supabase
          .from("webhook_logs")
          .update({ status: "failed", notes: `Erro: ${subError.message}` })
          .eq("id", webhookId);

        return new Response(
          JSON.stringify({ error: "Erro ao criar subscription" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

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
        .update({ status: "success", notes: "Subscription criada" })
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

    const { data: existingPending } = await supabase
      .from("pending_plans")
      .select("id")
      .eq("payment_id", payment_id)
      .maybeSingle();

    if (existingPending) {
      await supabase
        .from("webhook_logs")
        .update({ status: "success", notes: "Duplicado" })
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
      platform: "amplopay",
    });

    if (pendingError) {
      await supabase
        .from("webhook_logs")
        .update({ status: "failed", notes: `Erro: ${pendingError.message}` })
        .eq("id", webhookId);

      return new Response(
        JSON.stringify({ error: "Erro ao criar pending_plan" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    await supabase
      .from("webhook_logs")
      .update({ status: "success", notes: "Pending_plan criado" })
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
