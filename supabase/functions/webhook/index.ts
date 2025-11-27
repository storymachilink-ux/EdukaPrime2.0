import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

function detectPlatform(payload: any): string {
  if (payload.transaction_token && payload.checkout_tax_amount) {
    return 'vega'
  }
  if (payload.event && (payload.event.includes('pix.paid') || payload.event.includes('card.paid'))) {
    return 'ggcheckout'
  }
  if (payload.gateway === 'amplopay' || payload.source === 'amplopay') {
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

    console.log('🌐 WEBHOOK UNIFICADA CHAMADA!')
    console.log(`📦 Plataforma detectada: ${platform}`)
    console.log(`🔗 Product IDs: ${product_ids.join(', ')}`)

    let customer_email = 'unknown@example.com'
    let customer_name = null
    let payment_method = null
    let amount = 0
    let transaction_id = null
    let event_type = 'unknown'

    if (platform === 'vega') {
      customer_email = payload.customer?.email?.toLowerCase() || 'unknown@example.com'
      customer_name = payload.customer?.name || null
      payment_method = payload.method || null
      const price = parseInt(String(payload.total_price || 0))
      amount = price / 100
      transaction_id = payload.transaction_token || null
      event_type = payload.status === 'approved' ? 'payment.approved' : 'payment.pending'
    } else if (platform === 'ggcheckout') {
      customer_email = payload.customer?.email?.toLowerCase() || 'unknown@example.com'
      customer_name = payload.customer?.name || null
      payment_method = payload.payment?.method || null
      amount = payload.payment?.amount || 0
      transaction_id = payload.payment?.id || null
      event_type = payload.event || 'unknown'
    } else if (platform === 'amplopay') {
      customer_email = payload.customer?.email?.toLowerCase() || 'unknown@example.com'
      customer_name = payload.customer?.name || null
      payment_method = payload.payment_method || null
      amount = payload.amount || 0
      transaction_id = payload.transaction_id || null
      event_type = payload.type || 'unknown'
    }

    console.log(`📧 Email: ${customer_email}`)
    console.log(`💰 Valor: ${amount}`)

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    const result = await supabase
      .from('webhook_logs')
      .insert({
        platform: platform,
        event_type: event_type,
        status: 'received',
        customer_email: customer_email,
        customer_name: customer_name,
        amount: amount,
        payment_method: payment_method,
        transaction_id: transaction_id,
        product_ids: product_ids,
        expires_at: expiresAt,
        raw_payload: payload,
      })
      .select()

    if (result.error) {
      console.error('❌ Erro ao inserir webhook:', result.error.message)
      return new Response(JSON.stringify({ error: result.error.message }), {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Content-Type': 'application/json',
        }
      })
    }

    console.log('✅ Webhook inserido com sucesso')
    const webhookId = result.data?.[0]?.id

    if (event_type === 'payment.approved' && webhookId && product_ids.length > 0) {
      console.log('💳 Pagamento aprovado - Processando ativação...')

      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', customer_email)
        .maybeSingle()

      if (user) {
        console.log(`👤 Usuário encontrado: ${user.id}`)

        const { data: processResult } = await supabase
          .rpc('process_webhook_payment', {
            p_webhook_id: webhookId,
            p_customer_email: customer_email,
            p_product_ids: product_ids,
            p_transaction_id: transaction_id,
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
    } else if (event_type !== 'payment.approved') {
      console.log(`ℹ️ Webhook não aprovado - Status: ${event_type}`)
      await supabase
        .from('webhook_logs')
        .update({ status: 'pending', processed_at: new Date().toISOString() })
        .eq('id', webhookId)
    } else {
      console.log(`ℹ️ Webhook registrado mas não processado (sem produtos)`)
    }

    return new Response(JSON.stringify({ success: true, platform: platform }), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Content-Type': 'application/json',
      }
    })
  } catch (error) {
    console.error('❌ ERRO FATAL:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      }
    })
  }
})
