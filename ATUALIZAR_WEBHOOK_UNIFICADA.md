# 🔧 ATUALIZAR EDGE FUNCTION - webhook-unificada

## 📝 Situação:

Você tem **2 versões** do webhook:
1. `supabase/functions/webhook-unificada/index.ts` (ORIGINAL - versão antiga)
2. `supabase/functions/webhook-unificada-v2/index.ts` (NOVA - versão atualizada)

A **versão antiga** usa `extractProductId` (singular) e só processa webhooks **aprovados**.

Você quer que **TODOS os webhooks apareçam**, inclusive os não aprovados.

---

## ✅ SOLUÇÃO:

Vou atualizar o arquivo **ORIGINAL** (webhook-unificada/index.ts) com a nova lógica.

**ARQUIVO**: `supabase/functions/webhook-unificada/index.ts`

**LOCAL**: Supabase Console → Edge Functions → webhook-unificada → Edit

---

## 🚀 Copie e cole TODO O CONTEÚDO ABAIXO:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.38.4'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

function detectPlatform(payload: any): string {
  if (payload.items && Array.isArray(payload.items) && payload.items[0]?.code) {
    return 'vega'
  }
  if (payload.products && Array.isArray(payload.products) && payload.products[0]?.id) {
    return 'ggcheckout'
  }
  if (payload.product_id || payload.gateway === 'amplopay') {
    return 'amplopay'
  }
  return 'unknown'
}

function extractProductIds(payload: any, platform: string): string[] {
  const productIds: string[] = []

  if (platform === 'vega' && payload.items && Array.isArray(payload.items)) {
    payload.items.forEach((item: any) => {
      if (item.code) productIds.push(item.code)
    })
  } else if (platform === 'ggcheckout' && payload.products && Array.isArray(payload.products)) {
    payload.products.forEach((product: any) => {
      if (product.id) productIds.push(product.id)
    })
  } else if (platform === 'amplopay' && payload.product_id) {
    productIds.push(payload.product_id)
  }

  return productIds
}

function extractWebhookData(payload: any, platform: string) {
  let customer_email = 'unknown@example.com'
  let customer_name = null
  let payment_method = null
  let amount = 0
  let transaction_id = null
  let event_type = 'unknown'
  let product_titles: string[] = []

  if (platform === 'vega') {
    customer_email = payload.customer?.email?.toLowerCase() || 'unknown@example.com'
    customer_name = payload.customer?.name || null
    payment_method = payload.payment?.method || payload.method || null
    const price = parseInt(String(payload.total_price || 0))
    amount = price / 100
    transaction_id = payload.transaction_token || payload.id || null
    event_type = payload.status === 'approved' ? 'payment.approved' : 'payment.pending'
    if (payload.items && Array.isArray(payload.items)) {
      product_titles = payload.items.map((item: any) => item.title || 'Unknown').filter(Boolean)
    }
  } else if (platform === 'ggcheckout') {
    customer_email = payload.customer?.email?.toLowerCase() || 'unknown@example.com'
    customer_name = payload.customer?.name || null
    payment_method = payload.payment?.method || null
    amount = payload.payment?.amount || payload.products?.[0]?.price || 0
    transaction_id = payload.id || payload.transaction_id || null
    event_type = payload.status === 'paid' ? 'payment.approved' : 'payment.pending'
    if (payload.products && Array.isArray(payload.products)) {
      product_titles = payload.products.map((product: any) => product.name || 'Unknown').filter(Boolean)
    }
  } else if (platform === 'amplopay') {
    customer_email = payload.customer?.email?.toLowerCase() || 'unknown@example.com'
    customer_name = payload.customer?.name || null
    payment_method = payload.payment_method || null
    amount = payload.amount || 0
    transaction_id = payload.id || payload.transaction_id || null
    event_type = payload.status === 'approved' ? 'payment.approved' : 'payment.pending'
    product_titles = [payload.product_name || 'Unknown']
  }

  return {
    platform,
    event_type,
    customer_email,
    customer_name,
    payment_method,
    amount,
    transaction_id,
    product_titles,
  }
}

serve(async (req: Request) => {
  const origin = req.headers.get('origin') || '*'

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'authorization,x-client-info,apikey,content-type',
      }
    })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Content-Type': 'application/json',
      }
    })
  }

  try {
    const payload = await req.json()
    const platform = detectPlatform(payload)
    const product_ids = extractProductIds(payload, platform)

    console.log(`🌐 WEBHOOK UNIFICADA - Platform: ${platform}, Product IDs: ${product_ids.join(', ')}`)

    const webhookData = extractWebhookData(payload, platform)

    console.log(`📧 Email: ${webhookData.customer_email}`)
    console.log(`💰 Valor: ${webhookData.amount}`)
    console.log(`📦 Produtos: ${webhookData.product_titles.join(', ')}`)
    console.log(`🔗 IDs: ${product_ids.join(', ')}`)

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    const result = await supabase
      .from('webhook_logs')
      .insert({
        platform: webhookData.platform,
        event_type: webhookData.event_type,
        status: 'received',
        customer_email: webhookData.customer_email,
        customer_name: webhookData.customer_name,
        amount: webhookData.amount,
        payment_method: webhookData.payment_method,
        transaction_id: webhookData.transaction_id,
        product_ids: product_ids,
        expires_at: expiresAt,
        raw_payload: payload,
      })
      .select()

    if (result.error) {
      console.error('❌ Erro ao inserir webhook:', result.error.message)
      return new Response(JSON.stringify({ error: result.error.message }), {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': origin, 'Content-Type': 'application/json' },
      })
    }

    console.log('✅ Webhook inserido com sucesso')
    const webhookId = result.data?.[0]?.id

    if (webhookData.event_type === 'payment.approved' && webhookId && product_ids.length > 0) {
      console.log('💳 Pagamento aprovado - Processando ativação...')

      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', webhookData.customer_email)
        .maybeSingle()

      if (user) {
        console.log(`👤 Usuário encontrado: ${user.id}`)

        const { data: processResult } = await supabase
          .rpc('process_webhook_payment', {
            p_webhook_id: webhookId,
            p_customer_email: webhookData.customer_email,
            p_product_ids: product_ids,
            p_transaction_id: webhookData.transaction_id,
          })

        if (processResult && processResult[0]) {
          console.log(`✅ Processamento bem-sucedido: ${processResult[0].subscriptions_created} plano(s) ativado(s)`)
        } else {
          console.log(`⚠️ Nenhum plano foi ativado`)
          await supabase
            .from('webhook_logs')
            .update({ status: 'failed', processed_at: new Date().toISOString() })
            .eq('id', webhookId)
        }
      } else {
        console.log(`⏳ Usuário não encontrado - Webhook guardado como PENDING`)
        await supabase
          .from('webhook_logs')
          .update({ status: 'pending', processed_at: new Date().toISOString() })
          .eq('id', webhookId)
      }
    } else if (webhookData.event_type !== 'payment.approved') {
      console.log(`ℹ️ Webhook não aprovado - Status: ${webhookData.event_type}`)
      await supabase
        .from('webhook_logs')
        .update({ status: 'pending', processed_at: new Date().toISOString() })
        .eq('id', webhookId)
    } else {
      console.log(`ℹ️ Webhook registrado mas não processado (sem produtos)`)
    }

    return new Response(JSON.stringify({
      success: true,
      webhook_id: webhookId,
      platform: platform,
      product_ids: product_ids,
      customer_email: webhookData.customer_email,
    }), {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': origin, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error('❌ Erro geral:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Content-Type': 'application/json',
      }
    })
  }
})
```

---

## 📝 Passos para atualizar:

1. **Abra** Supabase Console
2. **Vá** em "Edge Functions" (menu esquerdo)
3. **Clique** em "webhook-unificada"
4. **Clique** em "Edit" (botão no topo)
5. **Selecione TUDO** (Ctrl + A)
6. **Cole** o código acima
7. **Clique** "Deploy" ou salve automaticamente

---

## ✅ Resultado esperado:

Agora quando você gerar um PIX (mesmo sem pagar):
- ✅ Webhook é inserido com status = `'pending'`
- ✅ Aparece no Dashboard Admin
- ✅ Quando pagamento for aprovado, status muda para `'success'`

**Está pronto!** Teste novamente gerando um PIX 🚀
