import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.38.4'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

serve(async (req: Request) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'content-type',
      }
    })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const payload = await req.json()

    console.log('📥 [1] Webhook recebido:', JSON.stringify(payload))

    // DETECTAR PLATAFORMA
    let platform = 'unknown'
    if (payload.items) platform = 'vega'
    else if (payload.products) platform = 'ggcheckout'
    else if (payload.product_id) platform = 'amplopay'

    console.log(`🔍 [2] Plataforma detectada: ${platform}`)

    // EXTRAIR DADOS BÁSICOS
    let customer_email = 'unknown@example.com'
    let customer_name = null
    let amount = 0
    let product_id = null
    let event_type = 'payment.pending'

    if (platform === 'vega') {
      customer_email = payload.customer?.email?.toLowerCase() || 'unknown@example.com'
      customer_name = payload.customer?.name || null
      amount = Math.round((payload.total_price || 0) / 100 * 100) / 100
      product_id = payload.items?.[0]?.code || null
      event_type = payload.status === 'approved' ? 'payment.approved' : 'payment.pending'
    } else if (platform === 'ggcheckout') {
      customer_email = payload.customer?.email?.toLowerCase() || 'unknown@example.com'
      customer_name = payload.customer?.name || null
      amount = payload.payment?.amount || 0
      product_id = payload.products?.[0]?.id || null
      event_type = payload.status === 'paid' ? 'payment.approved' : 'payment.pending'
    } else if (platform === 'amplopay') {
      customer_email = payload.customer?.email?.toLowerCase() || 'unknown@example.com'
      customer_name = payload.customer?.name || null
      amount = payload.amount || 0
      product_id = payload.product_id || null
      event_type = payload.status === 'approved' ? 'payment.approved' : 'payment.pending'
    }

    console.log(`📧 Email: ${customer_email}`)
    console.log(`💰 Valor: ${amount}`)
    console.log(`📦 Product ID: ${product_id}`)
    console.log(`🎯 Status: ${event_type}`)

    // INSERIR EM WEBHOOK_LOGS
    console.log('[3] Inserindo em webhook_logs...')

    const { data: insertData, error: insertError } = await supabase
      .from('webhook_logs')
      .insert({
        platform,
        event_type,
        status: 'received',
        customer_email,
        customer_name,
        amount,
        transaction_id: payload.id || payload.transaction_token || null,
        payment_method: payload.method || payload.payment?.method || null,
        raw_payload: payload,
      })
      .select()

    if (insertError) {
      console.error('❌ Erro ao inserir webhook_logs:', insertError.message)
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ [4] Webhook inserido em webhook_logs')
    const webhookId = insertData?.[0]?.id

    // SE PAGAMENTO APROVADO - PROCESSAR
    if (event_type === 'payment.approved' && customer_email !== 'unknown@example.com') {
      console.log('[5] Pagamento aprovado! Processando...')

      // Buscar plano pelo product_id
      if (product_id) {
        const { data: planData } = await supabase
          .from('plans_v2')
          .select('id, duration_days')
          .or(`vega_product_id.eq.${product_id},ggcheckout_product_id.eq.${product_id},amplopay_product_id.eq.${product_id}`)
          .maybeSingle()

        if (planData) {
          console.log(`✅ Plano encontrado: ${planData.id}`)

          // Buscar usuário
          const { data: userData } = await supabase
            .from('users')
            .select('id')
            .eq('email', customer_email)
            .maybeSingle()

          if (userData) {
            console.log(`✅ Usuário encontrado: ${userData.id}`)

            // Criar subscription
            const endDate = planData.duration_days
              ? new Date(Date.now() + planData.duration_days * 24 * 60 * 60 * 1000).toISOString()
              : null

            const { error: subError } = await supabase
              .from('user_subscriptions')
              .insert({
                user_id: userData.id,
                plan_id: planData.id,
                status: 'active',
                start_date: new Date().toISOString(),
                end_date: endDate,
                payment_id: payload.id || payload.transaction_token,
                amount_paid: amount,
                webhook_id: webhookId,
              })

            if (subError) {
              console.error('❌ Erro ao criar subscription:', subError.message)
            } else {
              console.log('✅ Subscription criada')

              // Atualizar users
              await supabase
                .from('users')
                .update({
                  active_plan_id: planData.id,
                  plano_ativo: planData.id,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', userData.id)

              console.log('✅ Usuário atualizado com novo plano')

              // Atualizar webhook_logs como sucesso
              await supabase
                .from('webhook_logs')
                .update({ status: 'success' })
                .eq('id', webhookId)
            }
          } else {
            console.log(`⏳ Usuário não encontrado. Criando pending_plan...`)

            // Usuário não existe - criar pending_plan
            const { error: pendingError } = await supabase
              .from('pending_plans')
              .insert({
                email: customer_email,
                plan_id: planData.id,
                status: 'pending',
                start_date: new Date().toISOString(),
                end_date: planData.duration_days
                  ? new Date(Date.now() + planData.duration_days * 24 * 60 * 60 * 1000).toISOString()
                  : null,
                payment_id: payload.id || payload.transaction_token,
                amount_paid: amount,
                webhook_id: webhookId,
                platform,
              })

            if (pendingError) {
              console.error('❌ Erro ao criar pending_plan:', pendingError.message)
            } else {
              console.log('✅ Pending plan criado - será ativado ao registrar')

              // Atualizar webhook_logs como sucesso
              await supabase
                .from('webhook_logs')
                .update({ status: 'success' })
                .eq('id', webhookId)
            }
          }
        } else {
          console.warn(`⚠️ Nenhum plano encontrado para product_id: ${product_id}`)
        }
      }
    } else {
      console.log('[5] Pagamento pendente - aguardando confirmação')
    }

    return new Response(
      JSON.stringify({
        success: true,
        webhook_id: webhookId,
        platform,
        message: 'Webhook processado com sucesso'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  } catch (error) {
    console.error('❌ ERRO FATAL:', error instanceof Error ? error.message : String(error))
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})
