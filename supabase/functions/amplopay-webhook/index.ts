import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface AmploPayWebhookData {
  event: string;
  token: string;
  offerCode: string;
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
    cpf: string;
    cnpj?: string | null;
  };
  transaction: {
    id: string;
    identifier: string;
    paymentMethod: string;
    status: string;
    amount: number;
    currency: string;
    createdAt: string;
    payedAt: string;
  };
  subscription?: {
    id: string;
    identifier: string;
    status: string;
    cycle: number;
  };
}

serve(async (req) => {
  console.log('🚀 [WEBHOOK] Função iniciada')

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔄 [WEBHOOK] Requisição OPTIONS - CORS')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📨 [WEBHOOK] Método:', req.method)
    console.log('🔗 [WEBHOOK] URL:', req.url)

    // Verificar se é POST
    if (req.method !== 'POST') {
      console.error('❌ [WEBHOOK] Método não permitido:', req.method)
      return new Response(
        JSON.stringify({ error: 'Método não permitido' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse do body
    let webhookData: AmploPayWebhookData
    try {
      webhookData = await req.json()
      console.log('📋 [WEBHOOK] Dados recebidos:', {
        event: webhookData.event,
        email: webhookData.client?.email,
        offerCode: webhookData.offerCode,
        transactionStatus: webhookData.transaction?.status,
        transactionId: webhookData.transaction?.id
      })
    } catch (parseError) {
      console.error('❌ [WEBHOOK] Erro ao fazer parse do JSON:', parseError)
      return new Response(
        JSON.stringify({ error: 'JSON inválido' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validar token
    const expectedToken = '21s2yh9n'
    if (webhookData.token !== expectedToken) {
      console.error('❌ [WEBHOOK] Token inválido:', {
        received: webhookData.token,
        expected: expectedToken
      })
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validar dados obrigatórios
    if (!webhookData.client?.email || !webhookData.transaction?.id || !webhookData.offerCode) {
      console.error('❌ [WEBHOOK] Dados obrigatórios ausentes:', {
        hasEmail: !!webhookData.client?.email,
        hasTransactionId: !!webhookData.transaction?.id,
        hasOfferCode: !!webhookData.offerCode
      })
      return new Response(
        JSON.stringify({ error: 'Dados obrigatórios ausentes' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verificar se é pagamento aprovado
    if (webhookData.event === 'TRANSACTION_PAID' && webhookData.transaction.status === 'COMPLETED') {
      console.log('✅ [WEBHOOK] Pagamento aprovado detectado')

      // Conectar ao Supabase
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

      if (!supabaseUrl || !supabaseKey) {
        console.error('❌ [WEBHOOK] Variáveis de ambiente do Supabase não configuradas')
        return new Response(
          JSON.stringify({ error: 'Configuração do servidor incorreta' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      const supabase = createClient(supabaseUrl, supabaseKey)
      console.log('🔗 [WEBHOOK] Conectado ao Supabase')

      // Determinar plano baseado no offer code
      const planMapping: Record<string, { level: number, name: string }> = {
        'LIGRMS3': { level: 1, name: 'Plano Essencial' },
        'ZMTP2IV': { level: 2, name: 'Plano Evoluir' },
        'VBAQ4J3': { level: 3, name: 'Plano Prime' }
      }

      const plan = planMapping[webhookData.offerCode]
      if (!plan) {
        console.error('❌ [WEBHOOK] Offer code inválido:', webhookData.offerCode)
        return new Response(
          JSON.stringify({ error: 'Offer code inválido' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      console.log('📋 [WEBHOOK] Plano identificado:', plan)

      // Verificar se a transação já foi processada
      const { data: existingTransaction } = await supabase
        .from('amplopay_transactions')
        .select('id')
        .eq('transaction_id', webhookData.transaction.id)
        .single()

      if (existingTransaction) {
        console.log('⚠️ [WEBHOOK] Transação já processada anteriormente:', webhookData.transaction.id)
        return new Response(
          JSON.stringify({
            message: 'Transação já processada anteriormente',
            transaction_id: webhookData.transaction.id
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Buscar ou criar usuário no Supabase
      let { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', webhookData.client.email)
        .single()

      if (userError && userError.code === 'PGRST116') {
        // Usuário não existe, criar novo
        console.log('👤 [WEBHOOK] Criando novo usuário:', webhookData.client.email)

        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{
            email: webhookData.client.email,
            plano_ativo: plan.level,
            data_ativacao: new Date().toISOString(),
            is_admin: false,
            created_at: new Date().toISOString()
          }])
          .select()
          .single()

        if (createError) {
          console.error('❌ [WEBHOOK] Erro ao criar usuário:', createError)
          return new Response(
            JSON.stringify({ error: 'Erro ao criar usuário' }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        user = newUser
        console.log('✅ [WEBHOOK] Usuário criado com sucesso')
      } else if (userError) {
        console.error('❌ [WEBHOOK] Erro ao buscar usuário:', userError)
        return new Response(
          JSON.stringify({ error: 'Erro ao buscar usuário' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      } else {
        // Usuário existe, atualizar plano
        console.log('🔄 [WEBHOOK] Atualizando plano do usuário:', webhookData.client.email)

        const { error: updateError } = await supabase
          .from('users')
          .update({
            plano_ativo: plan.level,
            data_ativacao: new Date().toISOString()
          })
          .eq('email', webhookData.client.email)

        if (updateError) {
          console.error('❌ [WEBHOOK] Erro ao atualizar usuário:', updateError)
          return new Response(
            JSON.stringify({ error: 'Erro ao atualizar usuário' }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        console.log('✅ [WEBHOOK] Usuário atualizado com sucesso')
      }

      // Salvar registro da transação para auditoria
      console.log('💾 [WEBHOOK] Salvando registro da transação...')
      const { error: transactionError } = await supabase
        .from('amplopay_transactions')
        .insert([{
          transaction_id: webhookData.transaction.id,
          user_email: webhookData.client.email,
          offer_code: webhookData.offerCode,
          plan_level: plan.level,
          plan_name: plan.name,
          amount: webhookData.transaction.amount,
          currency: webhookData.transaction.currency,
          payment_method: webhookData.transaction.paymentMethod,
          status: webhookData.transaction.status,
          webhook_data: webhookData,
          processed_at: new Date().toISOString()
        }])

      if (transactionError) {
        console.error('⚠️ [WEBHOOK] Erro ao salvar transação (não crítico):', transactionError)
      } else {
        console.log('✅ [WEBHOOK] Transação salva com sucesso')
      }

      console.log('🎉 [WEBHOOK] Processamento concluído com sucesso:', {
        email: webhookData.client.email,
        plano: plan.name,
        valor: webhookData.transaction.amount,
        transactionId: webhookData.transaction.id
      })

      // Resposta de sucesso para AmploPay
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Webhook processado com sucesso',
          user_email: webhookData.client.email,
          plan: plan.name,
          plan_level: plan.level,
          transaction_id: webhookData.transaction.id,
          timestamp: new Date().toISOString()
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Evento não é de pagamento aprovado
    console.log('ℹ️ [WEBHOOK] Evento recebido mas não é pagamento aprovado:', {
      event: webhookData.event,
      status: webhookData.transaction?.status
    })

    return new Response(
      JSON.stringify({
        message: 'Webhook recebido mas não processado - não é pagamento aprovado',
        event: webhookData.event,
        status: webhookData.transaction?.status
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('💥 [WEBHOOK] Erro crítico:', error)

    return new Response(
      JSON.stringify({
        error: 'Erro interno do servidor',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})