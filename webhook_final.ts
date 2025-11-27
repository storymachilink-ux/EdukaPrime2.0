import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

function detectPlatform(payload: any): string {
  if (payload.transaction_token && payload.checkout_tax_amount !== undefined) {
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

// ✨ NOVO: Extrair product_id por plataforma
function extractProductId(payload: any, platform: string): string | null {
  try {
    if (platform === 'vega') {
      // VEGA: procura em products[0].code (principal)
      if (payload.products && Array.isArray(payload.products) && payload.products.length > 0) {
        return payload.products[0].code || payload.products[0].id || null
      }
      // Fallback: items array
      if (payload.items && Array.isArray(payload.items) && payload.items.length > 0) {
        return payload.items[0].code || payload.items[0].id || null
      }
      // Fallback: root level
      return payload.product_id || payload.sku || null
    }

    if (platform === 'ggcheckout') {
      // GGCHECKOUT: procura em products[0].id (principal)
      if (payload.products && Array.isArray(payload.products) && payload.products.length > 0) {
        return payload.products[0].id ||
               payload.products[0].code ||
               payload.products[0].sku ||
               null
      }
      // Fallback: payment.id
      return payload.payment?.id || null
    }

    if (platform === 'amplopay') {
      // AMPLOPAY: procura em product_id (principal)
      if (payload.product_id) {
        return payload.product_id
      }
      // Fallback: orderItems
      if (payload.orderItems && Array.isArray(payload.orderItems) && payload.orderItems.length > 0) {
        return payload.orderItems[0]?.product?.id || null
      }
      return null
    }

    return null
  } catch (error) {
    console.error(`❌ Erro ao extrair product_id para ${platform}:`, error)
    return null
  }
}

// ✨ NOVO: Extrair product_title por plataforma
function extractProductTitle(payload: any, platform: string): string | null {
  try {
    if (platform === 'vega') {
      // VEGA: procura em products[0].title ou name
      if (payload.products && Array.isArray(payload.products) && payload.products.length > 0) {
        return payload.products[0].title ||
               payload.products[0].name ||
               null
      }
      // Fallback: items array
      if (payload.items && Array.isArray(payload.items) && payload.items.length > 0) {
        return payload.items[0].title ||
               payload.items[0].name ||
               null
      }
      return null
    }

    if (platform === 'ggcheckout') {
      // GGCHECKOUT: procura em products[0].name
      if (payload.products && Array.isArray(payload.products) && payload.products.length > 0) {
        return payload.products[0].name ||
               payload.products[0].title ||
               null
      }
      return null
    }

    if (platform === 'amplopay') {
      // AMPLOPAY: procura em orderItems[0].product.name
      if (payload.orderItems && Array.isArray(payload.orderItems) && payload.orderItems.length > 0) {
        return payload.orderItems[0]?.product?.name || null
      }
      return null
    }

    return null
  } catch (error) {
    console.error(`❌ Erro ao extrair product_title para ${platform}:`, error)
    return null
  }
}

function extractWebhookData(payload: any, platform: string) {
  // ✨ Extrair product_id e product_title para todas as plataformas
  const product_id = extractProductId(payload, platform)
  const product_title = extractProductTitle(payload, platform)

  if (platform === 'vega') {
    return {
      platform: 'vega',
      event_type: payload.status === 'approved' ? 'payment.approved' : 'payment.pending',
      customer_email: payload.customer?.email || 'unknown@example.com',
      customer_name: payload.customer?.name || null,
      payment_method: payload.method || null,
      amount: parseInt(String(payload.total_price || 0)) / 100,
      transaction_id: payload.transaction_token || null,
      product_id: product_id,  // ✨ NOVO
      product_title: product_title,  // ✨ NOVO
      raw_payload: payload,
    }
  }

  if (platform === 'ggcheckout') {
    return {
      platform: 'ggcheckout',
      event_type: payload.event || 'unknown',
      customer_email: payload.customer?.email || 'unknown@example.com',
      customer_name: payload.customer?.name || null,
      payment_method: payload.payment?.method || null,
      amount: payload.payment?.amount || 0,
      transaction_id: payload.payment?.id || null,
      product_id: product_id,  // ✨ NOVO
      product_title: product_title,  // ✨ NOVO
      raw_payload: payload,
    }
  }

  if (platform === 'amplopay') {
    return {
      platform: 'amplopay',
      event_type: payload.type || 'unknown',
      customer_email: payload.customer?.email || 'unknown@example.com',
      customer_name: payload.customer?.name || null,
      payment_method: payload.payment_method || null,
      amount: payload.amount || 0,
      transaction_id: payload.transaction_id || null,
      product_id: product_id,  // ✨ NOVO
      product_title: product_title,  // ✨ NOVO
      raw_payload: payload,
    }
  }

  return {
    platform: 'unknown',
    event_type: 'unknown',
    customer_email: 'unknown@example.com',
    customer_name: null,
    payment_method: null,
    amount: 0,
    transaction_id: null,
    product_id: product_id,  // ✨ NOVO
    product_title: product_title,  // ✨ NOVO
    raw_payload: payload,
  }
}

serve(async (req: Request) => {
  console.log('🌐 WEBHOOK UNIFICADA CHAMADA!')

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    })
  }

  try {
    const payload = await req.json()

    const platform = detectPlatform(payload)
    console.log(`📦 Plataforma detectada: ${platform.toUpperCase()}`)

    if (platform === 'unknown') {
      console.warn('⚠️ Plataforma desconhecida, salvando mesmo assim')
    }

    const webhookData = extractWebhookData(payload, platform)
    console.log(`📧 Email: ${webhookData.customer_email}`)
    console.log(`💰 Valor: ${webhookData.amount}`)
    console.log(`📦 Product ID: ${webhookData.product_id || 'não encontrado'}`)
    console.log(`📛 Product Title: ${webhookData.product_title || 'não encontrado'}`)

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
        product_id: webhookData.product_id,  // ✨ NOVO: Product ID extraído
        product_title: webhookData.product_title,  // ✨ NOVO: Product Title extraído
        raw_payload: webhookData.raw_payload,
      })
      .select()

    if (result.error) {
      console.error('❌ Erro ao inserir webhook:', result.error.message)
      return new Response(JSON.stringify({ error: result.error }), {
        status: 500,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      })
    }

    console.log('✅ Webhook inserido com sucesso')

    const webhookId = result.data?.[0]?.id

    if (platform === 'vega' && payload.status === 'approved' && webhookId) {
      console.log('💳 VEGA: Pagamento aprovado - Processando assinatura...')

      const customerEmail = payload.customer?.email?.toLowerCase()

      if (customerEmail) {
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('email', customerEmail)
          .maybeSingle()

        if (user) {
          console.log('👤 Usuário encontrado - Ativando plano')

          await supabase
            .from('users')
            .update({
              plano_ativo: 1,
              data_expiracao_plano: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)

          await supabase
            .from('webhook_logs')
            .update({ status: 'success', processed_at: new Date().toISOString() })
            .eq('id', webhookId)

          console.log('✅ VEGA: Assinatura processada com sucesso')
        } else {
          console.log('ℹ️ VEGA: Usuário não encontrado')
        }
      }
    }

    if (platform === 'ggcheckout' && (payload.event === 'pix.paid' || payload.event === 'card.paid') && webhookId) {
      console.log('💳 GGCHECKOUT: Pagamento aprovado - Processando assinatura...')

      const customerEmail = payload.customer?.email?.toLowerCase()

      if (customerEmail) {
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('email', customerEmail)
          .maybeSingle()

        if (user) {
          console.log('👤 Usuário encontrado - Ativando plano')

          await supabase
            .from('users')
            .update({
              plano_ativo: 1,
              data_expiracao_plano: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)

          await supabase
            .from('webhook_logs')
            .update({ status: 'success', processed_at: new Date().toISOString() })
            .eq('id', webhookId)

          console.log('✅ GGCHECKOUT: Assinatura processada com sucesso')
        }
      }
    }

    return new Response(JSON.stringify({ success: true, platform }), {
      status: 200,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('❌ ERRO FATAL:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    })
  }
})
