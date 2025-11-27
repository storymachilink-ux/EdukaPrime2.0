import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.json();

    const payment_id = payload.transaction_token;
    const status = payload.status;
    const event_type = status === "approved" ? "payment.approved" : "payment." + status;
    const customer_email = payload.customer?.email || "";
    const customer_name = payload.customer?.name || "Unknown";
    const payment_method = payload.method || "pix";
    const total_amount = payload.total_price / 100;
    const products = payload.products || [];

    if (!customer_email || !payment_id || products.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email, payment_id ou produtos faltando",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { data: logData, error: logError } = await supabase
      .from("webhook_logs")
      .insert({
        platform: "vega",
        event_type: event_type,
        status: "received",
        customer_email: customer_email,
        customer_name: customer_name,
        payment_method: payment_method,
        amount: total_amount,
        transaction_id: payment_id,
        raw_payload: payload,
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (logError || !logData) {
      console.error("Erro ao inserir log:", logError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Erro ao registrar webhook",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const { data: existingPayment } = await supabase
      .from("user_subscriptions")
      .select("id")
      .eq("payment_id", payment_id)
      .limit(1);

    if (existingPayment && existingPayment.length > 0) {
      await supabase
        .from("webhook_logs")
        .update({
          status: "success",
          processed_at: new Date().toISOString(),
          notes: "Pagamento já processado (idempotência)",
        })
        .eq("id", logData.id);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Pagamento já processado",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("email", customer_email)
      .single();

    const results = [];
    let hasErrors = false;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const product_code = product.code || product.id;

      if (!product_code) {
        console.error("Produto sem code/id:", product);
        hasErrors = true;
        continue;
      }

      const { data: plan, error: planError } = await supabase
        .from("plans_v2")
        .select("id, name")
        .eq("vega_product_id", product_code)
        .single();

      if (planError || !plan) {
        console.error("Plano nao encontrado para product_code: " + product_code);
        hasErrors = true;
        continue;
      }

      if (user) {
        const { error: subscriptionError } = await supabase
          .from("user_subscriptions")
          .insert({
            user_id: user.id,
            plan_id: plan.id,
            payment_id: payment_id,
            status: "active",
            created_at: new Date().toISOString(),
          });

        if (subscriptionError) {
          console.error("Erro ao criar subscription:", subscriptionError);
          hasErrors = true;
          continue;
        }

        await supabase
          .from("users")
          .update({ active_plan_id: plan.id })
          .eq("id", user.id);

        results.push({
          product_code: product_code,
          plan_id: plan.id,
          status: "subscription_created",
          user_id: user.id,
        });
      } else {
        const { error: pendingError } = await supabase
          .from("pending_plans")
          .insert({
            email: customer_email,
            plan_id: plan.id,
            payment_id: payment_id,
            status: "pending",
            created_at: new Date().toISOString(),
          });

        if (pendingError) {
          console.error("Erro ao criar pending_plan:", pendingError);
          hasErrors = true;
          continue;
        }

        results.push({
          product_code: product_code,
          plan_id: plan.id,
          status: "pending_plan_created",
          email: customer_email,
        });
      }
    }

    const finalStatus = hasErrors && results.length === 0 ? "failed" : "success";
    const notes = hasErrors
      ? results.length + " produto(s) processado(s) com sucesso, alguns falharam"
      : results.length + " produto(s) processado(s) com sucesso";

    await supabase
      .from("webhook_logs")
      .update({
        status: finalStatus,
        processed_at: new Date().toISOString(),
        notes: notes,
      })
      .eq("id", logData.id);

    return new Response(
      JSON.stringify({
        success: !hasErrors,
        message: notes,
        results: results,
        webhook_log_id: logData.id,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro ao processar webhook:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Erro ao processar webhook",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
