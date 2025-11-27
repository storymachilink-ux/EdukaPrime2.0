import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.38.4'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization,x-client-info,apikey,content-type,x-signature',
    'Access-Control-Allow-Methods': 'POST,OPTIONS'
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DETECÇÃO DE PLATAFORMA
// Analisa a estrutura do payload para identificar qual gateway enviou
// ═══════════════════════════════════════════════════════════════════════════
function detectPlatform(payload: any): string {
  // VEGA: tem "plans" array, "products" array, "business_name", "transaction_token"
  if (
    payload.plans &&
    Array.isArray(payload.plans) &&
    payload.products &&
    Array.isArray(payload.products) &&
    payload.transaction_token &&
    payload.business_name === 'Eduka Prime'
  ) {
    return 'vega'
  }

  // GGCHECKOUT: tem "event" e "products" array OU "payment"
  if (
    (payload.event && payload.products && Array.isArray(payload.products)) ||
    (payload.payment && payload.products && Array.isArray(payload.products))
  ) {
    return 'ggcheckout'
  }

  // AMPLOPAY: tem "product_id" + "amount" + "status"
  if (payload.product_id && payload.amount && payload.status) {
    return 'amplopay'
  }

  return 'unknown'
}

// ═══════════════════════════════════════════════════════════════════════════
// EXTRAÇÃO DO PRODUCT ID PADRÃO
// Para Vega: usa payload.products[0].code (ex: "3MGN9O")
// Para GGCheckout: usa payload.products[0].id
// Para Amplopay: usa payload.product_id
// ═══════════════════════════════════════════════════════════════════════════
function extractProductId(payload: any, platform: string): string | null {
  try {
    if (platform === 'vega' && payload.products && Array.isArray(payload.products)) {
      // VEGA: usar 'code' do primeiro produto (ex: "3MGN9O")
      return payload.products[0]?.code || null
    }

    if (platform === 'ggcheckout' && payload.products && Array.isArray(payload.products)) {
      // GGCHECKOUT: usar 'id' do primeiro produto
      return payload.products[0]?.id || null
    }

    if (platform === 'amplopay' && payload.product_id) {
      // AMPLOPAY: usar 'product_id' direto
      return payload.product_id
    }
  } catch (error) {
    console.error(`❌ Erro ao extrair product_id para ${platform}:`, error)
  }

  return null
}

// ═══════════════════════════════════════════════════════════════════════════
// EXTRAÇÃO DOS DADOS DO WEBHOOK
// Normaliza dados de diferentes plataformas para um padrão comum
// ═══════════════════════════════════════════════════════════════════════════
function extractWebhookData(payload: any, platform: string) {
  let customer_email = 'unknown@example.com'
  let customer_name = 'Unknown'
  let payment_method = null
  let amount = 0
  let transaction_id = null
  let event_type = 'payment.pending'
  let product_title = null

  try {
    if (platform === 'vega') {
      // VEGA: customer está em payload.customer
      customer_email = (payload.customer?.email || '').toLowerCase()
      customer_name = payload.customer?.name || 'Unknown'

      // Método de pagamento
      payment_method = payload.method || null

      // Valor em centavos → converter para reais
      const price_cents = parseInt(String(payload.total_price || 0))
      amount = price_cents / 100

      // ID da transação
      transaction_id = payload.transaction_token || null

      // Status: "approved" significa pagamento confirmado
      event_type = payload.status === 'approved' ? 'payment.approved' : 'payment.pending'

      // Título do produto
      product_title = payload.products?.[0]?.title || null
    } else if (platform === 'ggcheckout') {
      // GGCHECKOUT: customer em payload.customer
      customer_email = (payload.customer?.email || '').toLowerCase()
      customer_name = payload.customer?.name || 'Unknown'
      payment_method = payload.payment?.method || null

      // Valor pode estar em payment.amount ou products[0].price
      amount = payload.payment?.amount || payload.products?.[0]?.price || 0

      // Converter se em centavos
      if (amount > 1000) amount = amount / 100

      transaction_id = payload.id || payload.transaction_id || null
      event_type = payload.status === 'paid' ? 'payment.approved' : 'payment.pending'
      product_title = payload.products?.[0]?.name || null
    } else if (platform === 'amplopay') {
      // AMPLOPAY: customer em payload.customer
      customer_email = (payload.customer?.email || '').toLowerCase()
      customer_name = payload.customer?.name || 'Unknown'
      payment_method = payload.payment_method || null
      amount = payload.amount || 0
      transaction_id = payload.id || payload.transaction_id || null
      event_type = payload.status === 'approved' ? 'payment.approved' : 'payment.pending'
      product_title = payload.product_name || null
    }

    // Validar email
    if (!customer_email || customer_email === 'unknown@example.com') {
      console.warn('⚠️ Email não encontrado no payload, usando "unknown@example.com"')
    }
  } catch (error) {
    console.error(`❌ Erro ao extrair dados para ${platform}:`, error)
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

// ═══════════════════════════════════════════════════════════════════════════
// BUSCAR PLANO EM plans_v2
// Procura em vega_product_id, ggcheckout_product_id ou amplopay_product_id
// ═══════════════════════════════════════════════════════════════════════════
async function findPlanByProductId(product_id: string, platform: string) {
  try {
    console.log(`🔎 Buscando plano para ${platform} product_id: ${product_id}`)

    const column_map: Record<string, string> = {
      vega: 'vega_product_id',
      ggcheckout: 'ggcheckout_product_id',
      amplopay: 'amplopay_product_id',
    }

    const column = column_map[platform]
    if (!column) {
      console.error(`❌ Plataforma ${platform} não mapeada em plans_v2`)
      return null
    }

    // Buscar usando o coluna específica da plataforma
    const { data: plans, error } = await supabase
      .from('plans_v2')
      .select('id, name, duration_days')
      .eq(column, product_id)
      .maybeSingle()

    if (error) {
      console.error(`❌ Erro ao buscar plano: ${error.message}`)
      return null
    }

    if (!plans) {
      console.warn(`⚠️ Nenhum plano encontrado para ${column} = ${product_id}`)
      return null
    }

    console.log(`✅ Plano encontrado: ID=${plans.id}, Nome=${plans.name}, Duration=${plans.duration_days}`)
    return plans
  } catch (error) {
    console.error(`❌ ERRO ao buscar plano:`, error)
    return null
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// VERIFICAR IDEMPOTÊNCIA
// Impede duplicação de subscriptions se o webhook for reenviado
// ═══════════════════════════════════════════════════════════════════════════
async function checkDuplicateSubscription(
  user_id: string,
  plan_id: number,
  payment_id: string
) {
  try {
    const { data: existing, error } = await supabase
      .from('user_subscriptions')
      .select('id, status')
      .eq('user_id', user_id)
      .eq('plan_id', plan_id)
      .eq('payment_id', payment_id)
      .maybeSingle()

    if (error) {
      console.error(`❌ Erro ao verificar duplicata: ${error.message}`)
      return null
    }

    if (existing) {
      console.warn(`⚠️ Subscription duplicada já existe: ${existing.id}`)
      return existing
    }

    return null
  } catch (error) {
    console.error(`❌ ERRO ao verificar duplicata:`, error)
    return null
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// VERIFICAR IDEMPOTÊNCIA EM PENDING_PLANS
// Impede duplicação se o webhook for reenviado
// ═══════════════════════════════════════════════════════════════════════════
async function checkDuplicatePendingPlan(
  email: string,
  plan_id: number,
  payment_id: string
) {
  try {
    const { data: existing, error } = await supabase
      .from('pending_plans')
      .select('id, status')
      .eq('email', email)
      .eq('plan_id', plan_id)
      .eq('payment_id', payment_id)
      .maybeSingle()

    if (error) {
      console.error(`❌ Erro ao verificar pending_plan duplicado: ${error.message}`)
      return null
    }

    if (existing) {
      console.warn(`⚠️ Pending plan duplicado já existe: ${existing.id}`)
      return existing
    }

    return null
  } catch (error) {
    console.error(`❌ ERRO ao verificar pending_plan duplicado:`, error)
    return null
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CALCULAR DATA DE EXPIRAÇÃO
// duration_days = null → sem expiração (lifetime)
// duration_days > 0 → expiração em N dias
// ═══════════════════════════════════════════════════════════════════════════
function calculateEndDate(duration_days: number | null): Date | null {
  if (!duration_days || duration_days <= 0) {
    return null // Sem expiração (lifetime)
  }

  const now = new Date()
  const end = new Date(now.getTime() + duration_days * 24 * 60 * 60 * 1000)
  return end
}

// ═══════════════════════════════════════════════════════════════════════════
// PROCESSAR PAGAMENTO APROVADO
// Cria subscription (se user existe) ou pending_plan (se não existe)
// ═══════════════════════════════════════════════════════════════════════════
async function processApprovedPayment(
  webhookData: any,
  product_id: string,
  plan_record: any,
  webhookId: string
) {
  try {
    const end_date = calculateEndDate(plan_record.duration_days)

    console.log(`💳 Processando pagamento aprovado para ${webhookData.customer_email}`)

    // ─────────────────────────────────────────────────────────────────────────
    // BUSCAR USUÁRIO EXISTENTE
    // ─────────────────────────────────────────────────────────────────────────
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', webhookData.customer_email)
      .maybeSingle()

    if (userError) {
      console.error(`❌ Erro ao buscar usuário: ${userError.message}`)
      throw userError
    }

    if (user) {
      // ───────────────────────────────────────────────────────────────────────
      // CENÁRIO 1: USUÁRIO EXISTE → CRIAR SUBSCRIPTION
      // ───────────────────────────────────────────────────────────────────────
      console.log(`👤 Usuário encontrado: ${user.id}`)

      // Verificar duplicata
      const duplicate = await checkDuplicateSubscription(
        user.id,
        plan_record.id,
        webhookData.transaction_id
      )

      if (duplicate) {
        console.log(`✅ Subscription já existe (idempotência), mantendo status: ${duplicate.status}`)
        await supabase
          .from('webhook_logs')
          .update({
            status: 'success',
            processed_at: new Date().toISOString(),
            notes: 'Subscription duplicada ignorada (idempotência)',
          })
          .eq('id', webhookId)

        return { success: true, created: false, subscription_id: duplicate.id }
      }

      // Criar nova subscription
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_id: plan_record.id,
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: end_date?.toISOString() || null,
          payment_id: webhookData.transaction_id,
          product_id_gateway: product_id,
          payment_method: webhookData.payment_method,
          amount_paid: webhookData.amount,
          webhook_id: webhookId,
        })
        .select('id')

      if (subError) {
        console.error(`❌ Erro ao criar subscription: ${subError.message}`)
        await supabase
          .from('webhook_logs')
          .update({
            status: 'failed',
            processed_at: new Date().toISOString(),
            notes: `Erro ao criar subscription: ${subError.message}`,
          })
          .eq('id', webhookId)

        throw subError
      }

      console.log(`✅ Subscription criada: ${subscription[0].id}`)

      // Atualizar usuário com plano ativo
      const { error: updateError } = await supabase
        .from('users')
        .update({
          active_plan_id: plan_record.id,
          plano_ativo: plan_record.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) {
        console.error(`❌ Erro ao atualizar usuário: ${updateError.message}`)
      } else {
        console.log(`✅ Usuário atualizado com plano ativo`)
      }

      // Marcar webhook como sucesso
      await supabase
        .from('webhook_logs')
        .update({
          status: 'success',
          processed_at: new Date().toISOString(),
        })
        .eq('id', webhookId)

      return { success: true, created: true, subscription_id: subscription[0].id }
    } else {
      // ───────────────────────────────────────────────────────────────────────
      // CENÁRIO 2: USUÁRIO NÃO EXISTE → CRIAR PENDING_PLAN
      // ───────────────────────────────────────────────────────────────────────
      console.log(`⏳ Usuário não encontrado. Registrando em pending_plans...`)

      // Verificar duplicata em pending_plans
      const duplicate = await checkDuplicatePendingPlan(
        webhookData.customer_email,
        plan_record.id,
        webhookData.transaction_id
      )

      if (duplicate) {
        console.log(`✅ Pending plan já existe (idempotência), status: ${duplicate.status}`)
        await supabase
          .from('webhook_logs')
          .update({
            status: 'success',
            processed_at: new Date().toISOString(),
            notes: 'Pending plan duplicado ignorado (idempotência)',
          })
          .eq('id', webhookId)

        return { success: true, created: false, pending_plan_id: duplicate.id }
      }

      // Criar pending_plan
      const { data: pending, error: pendingError } = await supabase
        .from('pending_plans')
        .insert({
          email: webhookData.customer_email,
          plan_id: plan_record.id,
          status: 'pending',
          start_date: new Date().toISOString(),
          end_date: end_date?.toISOString() || null,
          payment_id: webhookData.transaction_id,
          product_id_gateway: product_id,
          payment_method: webhookData.payment_method,
          amount_paid: webhookData.amount,
          webhook_id: webhookId,
          platform: webhookData.platform,
        })
        .select('id')

      if (pendingError) {
        console.error(`❌ Erro ao criar pending_plan: ${pendingError.message}`)
        await supabase
          .from('webhook_logs')
          .update({
            status: 'failed',
            processed_at: new Date().toISOString(),
            notes: `Erro ao criar pending_plan: ${pendingError.message}`,
          })
          .eq('id', webhookId)

        throw pendingError
      }

      console.log(`✅ Pending plan criado: ${pending[0].id}. Será ativado quando usuário se registrar.`)

      // Marcar webhook como sucesso mesmo sem usuário
      await supabase
        .from('webhook_logs')
        .update({
          status: 'success',
          processed_at: new Date().toISOString(),
        })
        .eq('id', webhookId)

      return { success: true, created: true, pending_plan_id: pending[0].id }
    }
  } catch (error) {
    console.error(`❌ ERRO ao processar pagamento aprovado:`, error)
    throw error
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HANDLER PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
serve(async (req: Request) => {
  const origin = req.headers.get('origin') || '*'

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'authorization,x-client-info,apikey,content-type,x-signature',
      },
    })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Content-Type': 'application/json',
      },
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
          'Content-Type': 'application/json',
        },
      })
    }

    // ─────────────────────────────────────────────────────────────────────────
    // [2] DETECTAR PLATAFORMA
    // ─────────────────────────────────────────────────────────────────────────
    console.log('🔍 [2] Detectando plataforma...')
    const platform = detectPlatform(payload)
    console.log(`✅ Plataforma detectada: ${platform}`)

    if (platform === 'unknown') {
      console.error('❌ Plataforma desconhecida!')
      return new Response(JSON.stringify({ error: 'Unknown platform' }), {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Content-Type': 'application/json',
        },
      })
    }

    // ─────────────────────────────────────────────────────────────────────────
    // [3] EXTRAIR PRODUCT_ID E DADOS
    // ─────────────────────────────────────────────────────────────────────────
    const product_id = extractProductId(payload, platform)
    console.log(`📦 Product ID extraído: ${product_id}`)

    const webhookData = extractWebhookData(payload, platform)
    console.log(`📧 Email: ${webhookData.customer_email}`)
    console.log(`💰 Valor: R$ ${webhookData.amount.toFixed(2)}`)
    console.log(`🎯 Status: ${webhookData.event_type}`)
    console.log(`🏦 Método: ${webhookData.payment_method || 'N/A'}`)
    console.log(`📦 Product ID: ${product_id || 'não encontrado'}`)
    console.log(`📛 Product Title: ${webhookData.product_title || 'não encontrado'}`)

    // ─────────────────────────────────────────────────────────────────────────
    // [4] REGISTRAR EM WEBHOOK_LOGS (status: "received")
    // ─────────────────────────────────────────────────────────────────────────
    console.log('📝 [3] Registrando em webhook_logs...')
    const { data: logData, error: logError } = await supabase
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
        product_id: product_id,
        product_title: webhookData.product_title,
        raw_payload: payload,
        created_at: new Date().toISOString(),
      })
      .select('id')

    if (logError) {
      console.error('❌ Erro ao inserir em webhook_logs:', logError.message)
      return new Response(JSON.stringify({ error: logError.message }), {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Content-Type': 'application/json',
        },
      })
    }

    const webhookId = logData?.[0]?.id
    console.log(`✅ Webhook registrado: ${webhookId}`)

    // ─────────────────────────────────────────────────────────────────────────
    // [5] SE PAGAMENTO APROVADO: PROCESSAR
    // ─────────────────────────────────────────────────────────────────────────
    if (webhookData.event_type === 'payment.approved') {
      console.log(`💳 [4] Pagamento aprovado! Processando...`)

      if (!product_id) {
        console.error('❌ Product ID não encontrado no payload!')
        await supabase
          .from('webhook_logs')
          .update({
            status: 'failed',
            processed_at: new Date().toISOString(),
            notes: 'Product ID não encontrado',
          })
          .eq('id', webhookId)

        return new Response(JSON.stringify({ error: 'Product ID not found' }), {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': origin,
            'Content-Type': 'application/json',
          },
        })
      }

      // ───────────────────────────────────────────────────────────────────────
      // Buscar plano em plans_v2
      // ───────────────────────────────────────────────────────────────────────
      const plan_record = await findPlanByProductId(product_id, platform)

      if (!plan_record) {
        console.error(`❌ Plano não encontrado para product_id: ${product_id}`)
        await supabase
          .from('webhook_logs')
          .update({
            status: 'failed',
            processed_at: new Date().toISOString(),
            notes: `PLANO_NAO_MAPEADO: ${platform} product_id=${product_id}`,
          })
          .eq('id', webhookId)

        return new Response(JSON.stringify({ error: 'Plan not found' }), {
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': origin,
            'Content-Type': 'application/json',
          },
        })
      }

      // ───────────────────────────────────────────────────────────────────────
      // Processar pagamento (criar subscription ou pending_plan)
      // ───────────────────────────────────────────────────────────────────────
      try {
        const result = await processApprovedPayment(
          webhookData,
          product_id,
          plan_record,
          webhookId
        )

        console.log(`✅ Pagamento processado com sucesso!`)
        return new Response(
          JSON.stringify({
            success: true,
            webhook_id: webhookId,
            platform,
            plan_id: plan_record.id,
            ...result,
          }),
          {
            status: 200,
            headers: {
              'Access-Control-Allow-Origin': origin,
              'Content-Type': 'application/json',
            },
          }
        )
      } catch (error: any) {
        console.error(`❌ ERRO ao processar pagamento:`, error.message)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': origin,
            'Content-Type': 'application/json',
          },
        })
      }
    } else {
      // ───────────────────────────────────────────────────────────────────────
      // PAGAMENTO PENDENTE: Apenas logar, sem criar subscription
      // ───────────────────────────────────────────────────────────────────────
      console.log(
        `ℹ️ [4] Webhook recebido mas pagamento não aprovado (status: ${webhookData.event_type})`
      )

      await supabase
        .from('webhook_logs')
        .update({
          status: 'pending',
          processed_at: new Date().toISOString(),
        })
        .eq('id', webhookId)

      return new Response(
        JSON.stringify({
          success: true,
          webhook_id: webhookId,
          platform,
          message: 'Payment pending, not processed yet',
        }),
        {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': origin,
            'Content-Type': 'application/json',
          },
        }
      )
    }
  } catch (error: any) {
    console.error('❌ ERRO FATAL:', error.message)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    })
  }
})
