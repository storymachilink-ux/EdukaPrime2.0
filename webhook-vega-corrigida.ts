import { serve } from 'https://deno.land/std@0.203.0/http/server.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');

const jsonHeaders = {
  'Content-Type': 'application/json',
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
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
    method: 'POST', headers: jsonHeaders, body: JSON.stringify(sub),
  });
  if (!res.ok) throw new Error(`Insert subscription failed: ${res.status} ${await res.text()}`);
  return (await res.json())[0];
}

async function insertPendingPlan(pp) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/pending_plans`, {
    method: 'POST', headers: jsonHeaders, body: JSON.stringify(pp),
  });
  if (!res.ok) throw new Error(`Insert pending_plan failed: ${res.status} ${await res.text()}`);
  return (await res.json())[0];
}

async function updateWebhookLog(id, patch) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/webhook_logs?id=eq.${id}`, {
    method: 'PATCH', headers: jsonHeaders, body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`Update webhook_logs failed: ${res.status} ${await res.text()}`);
  return true;
}

async function updateUserActivePlan(userId, planId) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
    method: 'PATCH', headers: jsonHeaders, body: JSON.stringify({ active_plan_id: planId }),
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

serve(async (req: Request) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: corsHeaders() });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return new Response(JSON.stringify({ error: 'Bad Request' }), { status: 400, headers: corsHeaders() });
    }

    // Extração defensiva de campos
    const payment_id = body.transaction_token || body.payment_id || body.transactionId || null;
    const customer = body.customer || body.payer || {};
    const customer_email = customer.email || body.email || null;
    const customer_name = customer.name || customer.full_name || body.name || 'Unknown';
    const payment_method = body.method || body.payment_method || body.gateway || 'pix';

    // Conversão de centavos para reais
    let amount = null;
    if (body.total_price !== undefined) {
      amount = Number(body.total_price) / 100;
    } else if (body.amount_cents !== undefined) {
      amount = Number(body.amount_cents) / 100;
    } else if (body.amount !== undefined) {
      amount = Number(body.amount);
    }

    // Coleta de produtos
    let products = [];
    if (Array.isArray(body.items)) products = body.items;
    else if (Array.isArray(body.products)) products = body.products;
    else if (body.product) products = [body.product];

    // Validação básica
    if (!payment_id) {
      return new Response(JSON.stringify({ error: 'Missing payment_id' }), { status: 400, headers: corsHeaders() });
    }

    if (!customer_email) {
      return new Response(JSON.stringify({ error: 'Missing customer_email' }), { status: 400, headers: corsHeaders() });
    }

    if (products.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing products' }), { status: 400, headers: corsHeaders() });
    }

    // Inserir log inicial
    const initial = {
      platform: 'vega',
      event_type: body.status === 'approved' ? 'payment.approved' : `payment.${body.status || 'pending'}`,
      customer_email,
      customer_name,
      payment_method,
      amount,
      transaction_id: payment_id,
      status: 'received',
      raw_payload: body,
    };

    const logRow = await insertWebhookLog(initial);
    const webhookId = logRow.id;

    // Verificar idempotência - payment_id já existe em user_subscriptions?
    const paymentExists = await checkPaymentIdExists(payment_id);
    if (paymentExists) {
      await updateWebhookLog(webhookId, {
        status: 'success',
        processed_at: new Date().toISOString(),
        notes: 'Pagamento já processado (idempotência)'
      });
      return new Response(JSON.stringify({ ok: true, message: 'Payment already processed (idempotent)' }), { status: 200, headers: corsHeaders() });
    }

    let finalStatus = 'success';
    let notes = '';
    let successCount = 0;

    // Processa cada produto
    for (const p of products) {
      const code = p.code || p.id || p.sku || p.product_code || p.product_id || null;

      if (!code) {
        finalStatus = 'failed';
        notes += 'Produto sem code/id; ';
        continue;
      }

      // Buscar plano
      const plan = await selectPlanByVegaId(code);
      if (!plan) {
        finalStatus = 'failed';
        notes += `Plano nao encontrado para ${code}; `;
        continue;
      }

      // Procurar usuário
      const user = await selectUserByEmail(customer_email);

      if (user) {
        // Usuário existe - criar subscription
        const sub = {
          user_id: user.id,
          plan_id: plan.id,
          payment_id,
          status: 'active',
          created_at: new Date().toISOString(),
        };
        await insertUserSubscription(sub);
        await updateUserActivePlan(user.id, plan.id);
        successCount++;
      } else {
        // Usuário não existe - criar pending_plan
        const pp = {
          email: customer_email,
          plan_id: plan.id,
          payment_id,
          status: 'pending',
          created_at: new Date().toISOString(),
        };
        await insertPendingPlan(pp);
        successCount++;
      }
    }

    // Atualizar status final
    if (successCount === 0) {
      finalStatus = 'failed';
    }

    const finalNotes = notes || `${successCount} produto(s) processado(s) com sucesso`;
    await updateWebhookLog(webhookId, {
      status: finalStatus,
      processed_at: new Date().toISOString(),
      notes: finalNotes
    });

    return new Response(JSON.stringify({ ok: true, message: finalNotes }), { status: 200, headers: corsHeaders() });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders() });
  }
});
