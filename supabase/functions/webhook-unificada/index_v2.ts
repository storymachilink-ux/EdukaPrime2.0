import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.38.4'

// Pegar variáveis de ambiente
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// Validar que as variáveis estão configuradas
if (!SUPABASE_URL) {
  console.error('❌ SUPABASE_URL não configurada!')
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurada!')
}

// Criar cliente Supabase
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization,x-client-info,apikey,content-type,x-signature',
    'Access-Control-Allow-Methods': 'POST,OPTIONS'
  }
}

function detectPlatform(payload: any): string {
  if (payload.items && Array.isArray(payload.items)) return 'vega'
  if (payload.products && Array.isArray(payload.products)) return 'ggcheckout'
  if (payload.product_id) return 'amplopay'
  return 'unknown'
}

function extractProductId(payload: any, platform: string): string | null {
  if (platform === 'vega' && payload.items?.[0]?.code) {
    return payload.items[0].code
  }
  if (platform === 'ggcheckout' && payload.products?.[0]?.id) {
    return payload.products[0].id
  }
  if (platform === 'amplopay' && payload.product_id) {
    return payload.product_id
  }
  return null
}

function extractWebhookData(payload: any, platform: string) {
  let customer_email = 'unknown@example.com'
  let customer_name = null
  let payment_method = null
  let amount = 0
  let transaction_id = null
  let event_type = 'payment.pending'
  let product_title = null

  if (platform === 'vega') {
    customer_email = payload.customer?.email?.toLowerCase() || 'unknown@example.com'
    customer_name = payload.customer?.name || null
    payment_method = payload.payment?.method || payload.method || null
    const price = parseInt(String(payload.total_price || 0))
    amount = price / 100
    transaction_id = payload.transaction_token || payload.id || null
    event_type = payload.status === 'approved' ? 'payment.approved' : 'payment.pending'
    product_title = payload.items?.[0]?.title || null
  } else if (platform === 'ggcheckout') {
    customer_email = payload.customer?.email?.toLowerCase() || 'unknown@example.com'
    customer_name = payload.customer?.name || null
    payment_method = payload.payment?.method || null
    amount = payload.payment?.amount || payload.products?.[0]?.price || 0
    transaction_id = payload.id || payload.transaction_id || null
    event_type = payload.status === 'paid' ? 'payment.approved' : 'payment.pending'
    product_title = payload.products?.[0]?.name || null
  } else if (platform === 'amplopay') {
    customer_email = payload.customer?.email?.toLowerCase() || 'unknown@example.com'
    customer_name = payload.customer?.name || null
    payment_method = payload.payment_method || null
    amount = payload.amount || 0
    transaction_id = payload.id || payload.transaction_id || null
    event_type = payload.status === 'approved' ? 'payment.approved' : 'payment.pending'
    product_title = payload.product_name || null
  }

  return {
    platform,
    event_type,
    customer_email,
    customer_name,
    payment_method,
    amount,
    transaction_id,
    product_title,
  }
}

serve(async (req: Request) => {
  const origin = req.headers.get('origin') || '*'

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'authorization,x-client-info,apikey,content-type,x-signature',
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
    console.log('🔄 [1] Recebendo webhook...')
    const payloadText = await req.text()

    let payload: any
    try {
      payload = JSON.parse(payloadText)
    } catch {
      console.error('❌ JSON inválido')
      return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Content-Type': 'application/json'
        }
      })
    }

    console.log('🔍 [2] Detectando plataforma...')
    const platform = detectPlatform(payload)
    console.log(`✅ Plataforma: ${platform}`)

    const product_id = extractProductId(payload, platform)
    console.log(`📦 Product ID: ${product_id}`)

    const webhookData = extractWebhookData(payload, platform)
    console.log(`📧 Email: ${webhookData.customer_email}`)
    console.log(`💰 Valor: ${webhookData.amount}`)
    console.log(`🎯 Status: ${webhookData.event_type}`)

    // ═══════════════════════════════════════════════════════════════════════════
    // INSERIR EM WEBHOOK_LOGS
    // ═══════════════════════════════════════════════════════════════════════════

    console.log('📝 [3] Registrando em webhook_logs...')

    // Testar conexão com Supabase primeiro
    console.log('🔐 Testando autenticação do Supabase...')
    const testQuery = await supabase
      .from('webhook_logs')
      .select('count(*)', { count: 'exact', head: true })

    if (testQuery.error) {
      console.error('❌ Erro de autenticação Supabase:', testQuery.error.message)
      console.error('💡 Verifique se SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão configurados corretamente')
      return new Response(JSON.stringify({
        error: 'Authentication error',
        details: testQuery.error.message
      }), {
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Content-Type': 'application/json'
        }
      })
    }

    // Agora inserir o webhook
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
        raw_payload: payload,
      })
      .select()

    if (result.error) {
      console.error('❌ Erro ao inserir webhook:', result.error.message)
      return new Response(JSON.stringify({ error: result.error.message }), {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Content-Type': 'application/json'
        },
      })
    }

    console.log('✅ Webhook registrado com sucesso')
    const webhookId = result.data?.[0]?.id

    return new Response(JSON.stringify({
      success: true,
      platform,
      webhook_id: webhookId,
      message: 'Webhook recebido e armazenado com sucesso'
    }), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Content-Type': 'application/json'
      },
    })
  } catch (error) {
    console.error('❌ ERRO FATAL:', error)
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    })
  }
})
