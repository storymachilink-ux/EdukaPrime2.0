import { serve } from 'https://deno.land/std@0.203.0/http/server.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || Deno.env.get('URL_SUPABASE') || '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

console.log('ENV_CHECK_GG', {
  hasUrl: !!SUPABASE_URL,
  hasServiceKey: !!SERVICE_KEY,
});

if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error('Variáveis de ambiente faltando: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não estão configuradas');
}

const jsonHeaders = {
  'Content-Type': 'application/json',
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  Prefer: 'return=representation',
};

async function insertWebhookLog(payload) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/webhook_logs`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Insert webhook_logs failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data[0];
}

async function selectPlanByVegaId(vegaId) {
  const qs = `vega_product_id=eq.${encodeURIComponent(vegaId)}`;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/plans_v2?${qs}&select=*`, { headers: jsonHeaders });
  if (!res.ok) throw new Error(`Select plan failed: ${res.status} ${await res.text()}`);
  const rows = await res.json();
  return rows[0] || null;
}

async function selectUserByEmail(email) {
  const qs = `email=eq.${encodeURIComponent(email)}`;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/users?${qs}&select=*`, { headers: jsonHeaders });
  if (!res.ok) throw new Error(`Select user failed: ${res.status} ${await res.text()}`);
  const rows = await res.json();
  return rows[0] || null;
}

async function checkPaymentIdExists(paymentId) {
  const qs = `payment_id=eq.${encodeURIComponent(paymentId)}`;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/user_subscriptions?${qs}&select=id`, { headers: jsonHeaders });
  if (!res.ok) throw new Error(`Check payment_id failed: ${res.status} ${await res.text()}`);
  const rows = await res.json();
  return rows.length > 0;
}

async function insertUserSubscription(sub) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/user_subscriptions`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(sub),
  });
  if (!res.ok) throw new Error(`Insert subscription failed: ${res.status} ${await res.text()}`);
  return (await res.json())[0];
}

async function insertPendingPlan(pp) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/pending_plans`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(pp),
  });
  if (!res.ok) throw new Error(`Insert pending_plan failed: ${res.status} ${await res.text()}`);
  return (await res.json())[0];
}

async function updateWebhookLog(id, patch) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/webhook_logs?id=eq.${id}`, {
    method: 'PATCH',
    headers: jsonHeaders,
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`Update webhook_logs failed: ${res.status} ${await res.text()}`);
  return true;
}

async function updateUserActivePlan(userId, planId) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
    method: 'PATCH',
    headers: jsonHeaders,
    body: JSON.stringify({
      active_plan_id: planId,
    }),
  });
  if (!res.ok) throw new Error(`Update user active_plan_id failed: ${res.status} ${await res.text()}`);
  return true;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };
}

function mapStatus(statusOrEvent: string): string {
  const lower = (statusOrEvent || '').toLowerCase();
  if (lower.includes('paid')) return 'approved';
  if (lower === 'pending' || lower === 'pix.generated') return 'pending';
  if (lower === 'failed') return 'failed';
  if (lower.includes('refund')) return 'refunded';
  return lower;
}

serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: corsHeaders(),
      });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return new Response(JSON.stringify({ error: 'Bad Request' }), {
        status: 400,
        headers: corsHeaders(),
      });
    }

    const payment = body.payment || {};
    const customer = body.customer || {};
    const payment_id = payment.id || null;
    const customer_email = customer.email || null;
    const customer_name = customer.name || 'Unknown';
    const payment_method = payment.method || 'unknown';
    const raw_status = payment.status || body.event || 'pending';
    const event_name = body.event || 'unknown';

    let amount = null;
    if (payment.amount !== undefined) {
      amount = Number(payment.amount);
    }

    let products = [];
    if (Array.isArray(body.products)) {
      products = body.products;
    } else if (body.product) {
      products = [body.product];
    }

    if (!payment_id) {
      return new Response(JSON.stringify({ error: 'Missing payment_id' }), {
        status: 400,
        headers: corsHeaders(),
      });
    }

    const status_mapped = mapStatus(raw_status || event_name);
    const event_type = `payment.${status_mapped}`;

    const initial = {
      platform: 'ggcheckout',
      event_type: event_type,
      customer_email: customer_email || null,
      customer_name: customer_name,
      payment_method: payment_method,
      amount: amount,
      transaction_id: payment_id,
      status: 'received',
      raw_payload: body,
    };

    const logRow = await insertWebhookLog(initial);
    const webhookId = logRow.id;

    if (status_mapped !== 'approved') {
      await updateWebhookLog(webhookId, {
        status: 'success',
        processed_at: new Date().toISOString(),
        notes: `Webhook recebido com status: ${raw_status}. Nenhuma subscription criada.`,
      });
      return new Response(
        JSON.stringify({
          ok: true,
          message: `Webhook ${event_type} registrado. Nenhuma ação necessária.`,
        }),
        {
          status: 200,
          headers: corsHeaders(),
        }
      );
    }

    if (!customer_email) {
      await updateWebhookLog(webhookId, {
        status: 'failed',
        processed_at: new Date().toISOString(),
        notes: 'Status approved mas customer_email faltando',
      });
      return new Response(JSON.stringify({ error: 'Missing customer_email for approved payment' }), {
        status: 400,
        headers: corsHeaders(),
      });
    }

    if (products.length === 0) {
      await updateWebhookLog(webhookId, {
        status: 'failed',
        processed_at: new Date().toISOString(),
        notes: 'Status approved mas produtos faltando',
      });
      return new Response(JSON.stringify({ error: 'Missing products for approved payment' }), {
        status: 400,
        headers: corsHeaders(),
      });
    }

    const paymentExists = await checkPaymentIdExists(payment_id);
    if (paymentExists) {
      await updateWebhookLog(webhookId, {
        status: 'success',
        processed_at: new Date().toISOString(),
        notes: 'Pagamento já processado (idempotência)',
      });
      return new Response(
        JSON.stringify({
          ok: true,
          message: 'Payment already processed (idempotent)',
        }),
        {
          status: 200,
          headers: corsHeaders(),
        }
      );
    }

    let finalStatus = 'success';
    let notes = '';
    let successCount = 0;

    for (const p of products) {
      const code = p.id || p.code || p.sku || p.product_code || p.product_id || null;
      if (!code) {
        finalStatus = 'failed';
        notes += 'Produto sem code/id; ';
        continue;
      }

      const plan = await selectPlanByVegaId(code);
      if (!plan) {
        finalStatus = 'failed';
        notes += `Plano nao encontrado para ${code}; `;
        continue;
      }

      const user = await selectUserByEmail(customer_email);
      if (user) {
        const sub = {
          user_id: user.id,
          plan_id: plan.id,
          payment_id: payment_id,
          status: 'active',
          created_at: new Date().toISOString(),
        };
        await insertUserSubscription(sub);
        await updateUserActivePlan(user.id, plan.id);
        successCount++;
      } else {
        const pp = {
          email: customer_email,
          plan_id: plan.id,
          payment_id: payment_id,
          status: 'pending',
          created_at: new Date().toISOString(),
        };
        await insertPendingPlan(pp);
        successCount++;
      }
    }

    if (successCount === 0) {
      finalStatus = 'failed';
    }

    const finalNotes = notes || `${successCount} produto(s) processado(s) com sucesso`;
    await updateWebhookLog(webhookId, {
      status: finalStatus,
      processed_at: new Date().toISOString(),
      notes: finalNotes,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        message: finalNotes,
      }),
      {
        status: 200,
        headers: corsHeaders(),
      }
    );
  } catch (err) {
    console.error('🔴 Erro no webhook GGCheckout:', err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ erro: errorMessage }), {
      status: 500,
      headers: corsHeaders(),
    });
  }
});
