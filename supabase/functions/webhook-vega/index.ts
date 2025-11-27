import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.38.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false }), { status: 405, headers: cors });
  }

  try {
    const body = await req.json();

    const email = body.customer?.email?.toLowerCase();
    const name = body.customer?.name;
    const amt = body.total_price ? body.total_price : 0;
    const prodId = body.products?.[0]?.code;
    const prodTitle = body.products?.[0]?.title;
    const payId = body.transaction_token;
    const method = body.method;
    const evt = body.status === "approved" ? "payment.approved" : "payment.pending";

    const { data: log } = await supabase
      .from("webhook_logs")
      .insert({
        platform: "vega",
        event_type: evt,
        status: "received",
        customer_email: email,
        customer_name: name,
        amount: amt,
        transaction_id: payId,
        payment_method: method,
        product_id: prodId,
        product_title: prodTitle,
        raw_payload: body,
      })
      .select()
      .single();

    if (!log) {
      return new Response(JSON.stringify({ ok: false }), { status: 500, headers: cors });
    }

    const wid = log.id;

    if (evt !== "payment.approved") {
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: cors });
    }

    if (!email || !prodId || !payId) {
      await supabase.from("webhook_logs").update({ status: "failed" }).eq("id", wid);
      return new Response(JSON.stringify({ ok: false }), { status: 400, headers: cors });
    }

    const { data: sub } = await supabase
      .from("user_subscriptions")
      .select("id")
      .eq("payment_id", payId)
      .maybeSingle();

    if (sub) {
      await supabase.from("webhook_logs").update({ status: "success" }).eq("id", wid);
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: cors });
    }

    const { data: plan } = await supabase
      .from("plans_v2")
      .select("id, duration_days")
      .eq("vega_product_id", prodId)
      .maybeSingle();

    if (!plan) {
      await supabase.from("webhook_logs").update({ status: "failed" }).eq("id", wid);
      return new Response(JSON.stringify({ ok: false }), { status: 404, headers: cors });
    }

    const pid = plan.id;
    const days = plan.duration_days || 30;
    const end = new Date();
    end.setDate(end.getDate() + days);
    const now = new Date().toISOString();

    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (user) {
      await supabase.from("user_subscriptions").insert({
        user_id: user.id,
        plan_id: pid,
        status: "active",
        start_date: now,
        end_date: end.toISOString(),
        payment_id: payId,
        amount_paid: amt,
        webhook_id: wid,
      });

      await supabase
        .from("users")
        .update({
          active_plan_id: pid,
          plano_ativo: pid,
          updated_at: now,
        })
        .eq("id", user.id);

      await supabase.from("webhook_logs").update({ status: "success" }).eq("id", wid);

      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: cors });
    }

    const { data: pend } = await supabase
      .from("pending_plans")
      .select("id")
      .eq("payment_id", payId)
      .maybeSingle();

    if (pend) {
      await supabase.from("webhook_logs").update({ status: "success" }).eq("id", wid);
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: cors });
    }

    await supabase.from("pending_plans").insert({
      email: email,
      plan_id: pid,
      status: "pending",
      start_date: now,
      end_date: end.toISOString(),
      payment_id: payId,
      amount_paid: amt,
      webhook_id: wid,
      platform: "vega",
    });

    await supabase.from("webhook_logs").update({ status: "success" }).eq("id", wid);

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: cors });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false }), { status: 500, headers: cors });
  }
});
