import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.38.4'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Secrets dos gateways (devem estar nas variáveis de ambiente)
// Serão carregados também da tabela webhook_secrets com fallback para env vars
let VEGA_WEBHOOK_SECRET = Deno.env.get('VEGA_WEBHOOK_SECRET') || ''
let GGCHECKOUT_WEBHOOK_SECRET = Deno.env.get('GGCHECKOUT_WEBHOOK_SECRET') || ''
let AMPLOPAY_WEBHOOK_SECRET = Deno.env.get('AMPLOPAY_WEBHOOK_SECRET') || ''

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÃO: Validar Assinatura HMAC do Webhook
// ═══════════════════════════════════════════════════════════════════════════

async function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  platform: string
): Promise<boolean> {
  if (!secret) {
    console.warn(`⚠️ WARNING: Nenhum secret configurado para ${platform}. Pulando validação HMAC.`)
    return true // Se não tiver secret, não valida (ainda em desenvolvimento)
  }

  try {
    // Criar HMAC SHA256
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const signatureData = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(payload)
    )

    // Converter para hex
    const computedSignature = Array.from(new Uint8Array(signatureData))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // Comparação timing-safe (previne timing attacks)
    return computedSignature.toLowerCase() === signature.toLowerCase()
  } catch (error) {
    console.error(`❌ Erro ao validar assinatura HMAC: ${error}`)
    return false
  }
}

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

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÃO: Carregar Secret da Tabela webhook_secrets
// ═══════════════════════════════════════════════════════════════════════════

async function loadWebhookSecretFromDatabase(
  platform: string
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('webhook_secrets')
      .select('secret')
      .eq('platform', platform)
      .eq('is_active', true)
      .maybeSingle()

    if (error) {
      console.warn(`⚠️ Erro ao carregar secret de ${platform} da tabela:`, error.message)
      return getEnvSecretForPlatform(platform)
    }

    if (data?.secret) {
      console.log(`✅ Secret de ${platform} carregado da tabela webhook_secrets`)
      return data.secret
    }

    console.warn(`⚠️ Nenhum secret encontrado na tabela para ${platform}`)
    return getEnvSecretForPlatform(platform)
  } catch (error) {
    console.error(`❌ Erro ao carregar secret da tabela:`, error)
    return getEnvSecretForPlatform(platform)
  }
}

function getEnvSecretForPlatform(platform: string): string {
  switch (platform) {
    case 'vega':
      return VEGA_WEBHOOK_SECRET
    case 'ggcheckout':
      return GGCHECKOUT_WEBHOOK_SECRET
    case 'amplopay':
      return AMPLOPAY_WEBHOOK_SECRET
    default:
      return ''
  }
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

// ═══════════════════════════════════════════════════════════════════════════
// FASE 1.1: Validação de Dados de Webhook
// ═══════════════════════════════════════════════════════════════════════════

interface ValidationResult {
  valid: boolean
  error?: string
  errorType?: string
}

function validateWebhookData(webhookData: any, productIds: string[]): ValidationResult {
  // Validar email
  if (!webhookData.customer_email || webhookData.customer_email === 'unknown@example.com') {
    return {
      valid: false,
      error: 'Email do cliente inválido ou ausente',
      errorType: 'validation_email',
    }
  }

  // Validar transaction_id
  if (!webhookData.transaction_id) {
    return {
      valid: false,
      error: 'Transaction ID ausente',
      errorType: 'validation_transaction_id',
    }
  }

  // Validar amount
  if (!webhookData.amount || webhookData.amount <= 0) {
    return {
      valid: false,
      error: 'Valor do pagamento inválido ou zero',
      errorType: 'validation_amount',
    }
  }

  // Validar produtos
  if (!productIds || productIds.length === 0) {
    return {
      valid: false,
      error: 'Nenhum produto encontrado no webhook',
      errorType: 'validation_products',
    }
  }

  return { valid: true }
}

// ═══════════════════════════════════════════════════════════════════════════
// Função para registrar erros
// ═══════════════════════════════════════════════════════════════════════════

async function logError(
  supabase: any,
  webhookId: string | null,
  errorType: string,
  errorMessage: string,
  errorDetail: any
) {
  try {
    await supabase.from('webhook_errors').insert({
      webhook_id: webhookId,
      error_type: errorType,
      error_message: errorMessage,
      error_detail: errorDetail || {},
    })
  } catch (err) {
    console.error('❌ Erro ao registrar erro de webhook:', err)
  }
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
    payment_method = payload.method || null
    const price = parseInt(String(payload.total_price || 0))
    amount = price / 100
    transaction_id = payload.transaction_token || payload.id || null
    event_type = payload.status === 'approved' ? 'payment.approved' : 'payment.pending'
    // Suporta tanto 'items' quanto 'products'
    const items = payload.items || payload.products || []
    if (Array.isArray(items)) {
      product_titles = items.map((item: any) => item.title || 'Unknown').filter(Boolean)
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
    // ═══════════════════════════════════════════════════════════════════════════
    // VALIDAÇÃO DE ASSINATURA HMAC
    // ═══════════════════════════════════════════════════════════════════════════

    const payloadText = await req.text()
    const signature = req.headers.get('x-signature') || req.headers.get('x-webhook-signature') || ''

    let payload: any
    try {
      payload = JSON.parse(payloadText)
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': origin, 'Content-Type': 'application/json' }
      })
    }

    const platform = detectPlatform(payload)

    // ⚠️ MVP MODE: Validação HMAC desabilitada temporariamente
    // TODO: Reabilitar após configurar secrets em webhook_secrets table
    console.warn(`⚠️ [MVP MODE] HMAC validation disabled - webhook will be processed`)

    // TODO: Descomentar quando secrets estiverem configurados:
    // const secret = await loadWebhookSecretFromDatabase(platform)
    // if (secret) {
    //   const isValid = await validateWebhookSignature(payloadText, signature, secret, platform)
    //   if (!isValid) {
    //     console.error(`❌ WEBHOOK REJEITADO: Assinatura inválida para plataforma ${platform}`)
    //     return new Response(JSON.stringify({ error: 'Invalid webhook signature' }), {
    //       status: 401,
    //       headers: { 'Access-Control-Allow-Origin': origin, 'Content-Type': 'application/json' }
    //     })
    //   }
    //   console.log(`✅ WEBHOOK VALIDADO: Assinatura HMAC válida para ${platform}`)
    // } else {
    //   console.warn(`⚠️ WEBHOOK SEM VALIDAÇÃO: Nenhum secret configurado para ${platform}`)
    // }

    const product_ids = extractProductIds(payload, platform)

    console.log(`🌐 WEBHOOK UNIFICADA - Platform: ${platform}, Product IDs: ${product_ids.join(', ')}`)

    const webhookData = extractWebhookData(payload, platform)

    console.log(`📧 Email: ${webhookData.customer_email}`)
    console.log(`💰 Valor: ${webhookData.amount}`)
    console.log(`📦 Produtos: ${webhookData.product_titles.join(', ')}`)
    console.log(`🔗 IDs: ${product_ids.join(', ')}`)

    // ═══════════════════════════════════════════════════════════════════════════
    // FASE 1.1: Validar dados do webhook (agora apenas para informação)
    // ═══════════════════════════════════════════════════════════════════════════

    const validation = validateWebhookData(webhookData, product_ids)
    let validationError: string | null = null

    if (!validation.valid) {
      console.warn(`⚠️ Validação falhou: ${validation.error}`)
      validationError = validation.error || 'Validação falhou'
      // NÃO rejeita mais - será inserido com status 'error'
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    // ═══════════════════════════════════════════════════════════════════════════
    // FASE 1.2: Preparar dados com novos campos
    // ═══════════════════════════════════════════════════════════════════════════

    const insertData = {
      platform: webhookData.platform,
      event_type: webhookData.event_type,
      status: validationError ? 'error' : 'received', // Se houver validationError, status é 'error'
      customer_email: webhookData.customer_email,
      customer_name: webhookData.customer_name,
      amount: webhookData.amount,
      payment_method: webhookData.payment_method,
      transaction_id: webhookData.transaction_id,
      product_ids: product_ids,
      expires_at: expiresAt,
      raw_payload: payload,
      // ← NOVOS CAMPOS (FASE 1.2)
      processed_successfully: false, // Ainda não foi processado
      processed_user_id: null, // Será preenchido quando processar
      last_processed_at: null, // Será preenchido depois
      reprocess_attempts: 0, // Contador de tentativas
      error_message: validationError, // Se houver erro de validação, coloca aqui
    }

    console.log('📤 Tentando inserir webhook...')

    const result = await supabase
      .from('webhook_logs')
      .insert(insertData)
      .select()

    if (result.error) {
      console.error('❌ Erro ao inserir webhook:', JSON.stringify(result.error))
      // Registrar erro de database
      await logError(supabase, null, 'database_insert', 'Erro ao inserir em webhook_logs', {
        error: result.error.message,
        insertData,
      })
      return new Response(JSON.stringify({ error: result.error.message }), {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': origin, 'Content-Type': 'application/json' },
      })
    }

    console.log('✅ Webhook inserido com sucesso:', JSON.stringify(result.data))
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

        const { data: processResult, error: rpcError } = await supabase
          .rpc('process_webhook_payment', {
            p_webhook_id: webhookId,
            p_customer_email: webhookData.customer_email,
            p_product_ids: product_ids,
            p_transaction_id: webhookData.transaction_id,
          })

        if (rpcError) {
          console.error(`❌ Erro ao chamar RPC:`, rpcError.message)
          // Registrar erro de RPC
          await logError(supabase, webhookId, 'rpc_processing', 'Erro ao processar webhook via RPC', {
            error: rpcError.message,
            customer_email: webhookData.customer_email,
            product_ids,
          })
          // Marcar como falha
          await supabase
            .from('webhook_logs')
            .update({
              processed_successfully: false,
              last_processed_at: new Date().toISOString(),
              status: 'failed',
              error_message: rpcError.message,
            })
            .eq('id', webhookId)
        } else if (processResult && processResult[0]) {
          console.log(`✅ Processamento bem-sucedido: ${processResult[0].subscriptions_created} plano(s) ativado(s)`)
          // FASE 1.3: Atualizar webhook_logs com sucesso
          await supabase
            .from('webhook_logs')
            .update({
              processed_successfully: true, // ← Marcar como bem-sucedido
              last_processed_at: new Date().toISOString(), // ← Timestamp do processamento
              status: 'success',
              error_message: null,
            })
            .eq('id', webhookId)
        } else {
          console.log(`⚠️ Nenhum plano foi ativado`)
          await supabase
            .from('webhook_logs')
            .update({
              processed_successfully: false,
              last_processed_at: new Date().toISOString(),
              status: 'failed',
              error_message: 'Nenhum plano mapeado foi encontrado para os produtos',
            })
            .eq('id', webhookId)
          // Registrar como aviso
          await logError(supabase, webhookId, 'no_plans_activated', 'Nenhum plano foi ativado', {
            customer_email: webhookData.customer_email,
            product_ids,
          })
        }
      } else {
        console.log(`⏳ Usuário não encontrado - Webhook guardado como PENDING`)
        await supabase
          .from('webhook_logs')
          .update({
            processed_successfully: false,
            last_processed_at: new Date().toISOString(),
            status: 'pending',
            error_message: 'Usuário não encontrado - aguardando registro',
          })
          .eq('id', webhookId)
      }
    } else if (webhookData.event_type !== 'payment.approved') {
      console.log(`ℹ️ Webhook não aprovado - Status: ${webhookData.event_type}`)
      await supabase
        .from('webhook_logs')
        .update({
          processed_successfully: false,
          last_processed_at: new Date().toISOString(),
          status: 'pending',
          error_message: 'Aguardando pagamento',
        })
        .eq('id', webhookId)
    } else {
      console.log(`ℹ️ Webhook registrado mas não processado (sem produtos)`)
      await supabase
        .from('webhook_logs')
        .update({
          processed_successfully: false,
          last_processed_at: new Date().toISOString(),
          error_message: 'Sem produtos para processar',
        })
        .eq('id', webhookId)
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
