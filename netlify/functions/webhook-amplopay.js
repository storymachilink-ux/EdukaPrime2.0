const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Mapeamento de product.id para planos (GGCheckout)
const PRODUCT_PLAN_MAPPING = {
  'lDGnSUHPwxWlHBlPEIFy': { level: 1, name: 'Plano Essencial' },
  'WpjID8aV49ShaQ07ABzP': { level: 2, name: 'Plano Evoluir' },
  'eOGqcq0IbQnJUpjKRpsG': { level: 3, name: 'Plano Prime' }
};

// Função: Registrar webhook em webhook_logs e retornar ID
async function logWebhook(payload, customer, payment, product, eventType) {
  const { data, error } = await supabase
    .from('webhook_logs')
    .insert({
      event_type: eventType,
      status: 'pending',
      customer_email: customer?.email,
      customer_name: customer?.name || null,
      customer_phone: customer?.phone || null,
      product_id: product?.id,
      plan_name: PRODUCT_PLAN_MAPPING[product?.id]?.name || 'Desconhecido',
      payment_id: payment?.id,
      payment_method: payment?.method,
      amount: payment?.amount || 0,
      raw_payload: payload,
      platform: 'GGCHECKOUT'
    })
    .select('id')
    .single();

  if (error) {
    console.error('⚠️ Erro ao registrar webhook em webhook_logs (não crítico):', error);
    return null;
  }

  return data?.id || null;
}

exports.handler = async (event, context) => {
  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Responder a preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Apenas aceitar POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📨 WEBHOOK GGCHECKOUT RECEBIDO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Parse do body
    const payload = JSON.parse(event.body);
    console.log('📦 Payload completo:', JSON.stringify(payload, null, 2));

    // Extrair informações do webhook
    const eventType = payload.event;
    const customer = payload.customer;
    const payment = payload.payment;
    const product = payload.product;

    console.log('📋 Dados extraídos:');
    console.log('  - Evento:', eventType);
    console.log('  - Email:', customer?.email);
    console.log('  - Product ID:', product?.id);
    console.log('  - Payment Method:', payment?.method);
    console.log('  - Payment Status:', payment?.status);
    console.log('  - Amount:', payment?.amount);

    // Validar se é pagamento aprovado
    if (!['pix.paid', 'card.paid'].includes(eventType)) {
      console.log('⚠️ Evento ignorado (não é pagamento aprovado):', eventType);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Evento ignorado - não é pagamento aprovado',
          event: eventType
        })
      };
    }

    // Validar dados obrigatórios
    if (!customer?.email || !product?.id || !payment?.method) {
      console.error('❌ Dados obrigatórios ausentes');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Dados obrigatórios ausentes: email, product.id, payment.method' })
      };
    }

    // Identificar qual plano foi comprado
    const productId = product.id;
    const planInfo = PRODUCT_PLAN_MAPPING[productId];

    if (!planInfo) {
      console.error('❌ Produto não mapeado:', productId);
      console.error('Produtos válidos:', Object.keys(PRODUCT_PLAN_MAPPING));
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Produto não mapeado',
          productId: productId,
          validProducts: Object.keys(PRODUCT_PLAN_MAPPING)
        })
      };
    }

    console.log(`✅ Plano identificado: ${planInfo.name} (level ${planInfo.level})`);

    // 🔴 PASSO 1: Registrar webhook em webhook_logs ANTES de processar
    console.log('📝 Registrando webhook em webhook_logs...');
    const webhookId = await logWebhook(payload, customer, payment, product, eventType);
    if (webhookId) {
      console.log(`✅ Webhook registrado com ID: ${webhookId}`);
    } else {
      console.warn('⚠️ Webhook não foi registrado, continuando sem webhook_id');
    }

    // Buscar tipo de plano para calcular expiração corretamente
    const { data: planFullData, error: planFullError } = await supabase
      .from('plans_v2')
      .select('payment_type')
      .eq('ggcheckout_product_id', productId)
      .single();

    // Se é plano mensal, expira conforme método (PIX = 30 dias, Cartão = 90 dias)
    // Se é plano único/vitalício, NUNCA expira (end_date = NULL)
    let expirationDate = null;
    if (planFullData?.payment_type === 'mensal') {
      const isPix = payment.method.includes('pix');
      const daysToAdd = isPix ? 30 : 90;
      expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + daysToAdd);
      console.log(`📅 Método: ${isPix ? 'PIX' : 'Cartão'} → ${daysToAdd} dias de acesso`);
      console.log(`📅 Expira em: ${expirationDate.toISOString()}`);
    } else {
      console.log(`📅 Plano vitalício/único → Sem data de expiração`);
    }

    // Buscar usuário pelo email
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, email, plano_ativo')
      .eq('email', customer.email.toLowerCase())
      .maybeSingle();

    let userId;
    let planoPendente = false;

    if (!existingUser) {
      console.log('👤 Usuário não encontrado. Inserindo em ⏳ Planos Pendentes...');

      // 🔴 PASSO 2: Inserir em pending_plans ao invés de criar usuário
      // Buscar plan_id usando product_id do GGCheckout
      const { data: planData, error: planError } = await supabase
        .from('plans_v2')
        .select('id, name, display_name')
        .eq('ggcheckout_product_id', productId)
        .single();

      if (planError || !planData) {
        console.error('❌ Plano não encontrado para product_id:', productId);
        throw new Error(`Plano não encontrado: ${productId}`);
      }

      const planId = planData.id;
      const planName = planData.display_name || planData.name || 'Plano Desconhecido';

      // Inserir em pending_plans
      const { error: pendingError } = await supabase
        .from('pending_plans')
        .insert({
          email: customer.email.toLowerCase(),
          plan_id: planId,
          status: 'pending',
          payment_id: payment.id,
          product_id_gateway: productId,
          payment_method: payment.method,
          amount_paid: payment.amount || 0,
          platform: 'GGCHECKOUT',
          webhook_id: webhookId,
          product_name: planName,
          product_code: productId,
          start_date: new Date().toISOString(),
          end_date: expirationDate ? expirationDate.toISOString() : null
        });

      if (pendingError) {
        console.error('❌ Erro ao inserir em pending_plans:', pendingError);
        throw new Error(`Erro ao criar plano pendente: ${pendingError.message}`);
      }

      planoPendente = true;
      console.log(`✅ Plano pendente criado para ${customer.email}`);

    } else {
      userId = existingUser.id;
      console.log('✅ Usuário encontrado:', userId);

      // Buscar plan_id usando product_id do GGCheckout
      const { data: planData, error: planError } = await supabase
        .from('plans_v2')
        .select('id')
        .eq('ggcheckout_product_id', productId)
        .single();

      if (planError || !planData) {
        console.error('❌ Plano não encontrado para product_id:', productId);
        throw new Error(`Plano não encontrado: ${productId}`);
      }

      // Criar/atualizar subscription em user_subscriptions
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan_id: planData.id,
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: expirationDate ? expirationDate.toISOString() : null,
          payment_id: payment.id,
          product_id_gateway: productId,
          payment_method: payment.method,
          amount_paid: payment.amount || 0,
          webhook_id: webhookId
        })
        .on('conflict', {
          ignoreDuplicates: true
        });

      if (subscriptionError) {
        console.error('❌ Erro ao criar subscription:', subscriptionError);
        throw new Error(`Erro ao criar subscription: ${subscriptionError.message}`);
      }

      // Atualizar usuário com plano ativo
      const { error: updateError } = await supabase
        .from('users')
        .update({
          active_plan_id: planData.id,
          plano_ativo: planData.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('❌ Erro ao atualizar usuário:', updateError);
        throw new Error(`Erro ao atualizar: ${updateError.message}`);
      }

      console.log('✅ Subscription ativada com sucesso');
    }

    // ✅ Transação já foi registrada em webhook_logs no início do processamento
    // Não precisa registrar em 'transactions' também

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ WEBHOOK PROCESSADO COM SUCESSO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${customer.email}`);
    console.log(`📦 Plano: ${planInfo.name} (${planInfo.level})`);
    console.log(`💰 Valor: R$ ${payment.amount}`);
    console.log(`💳 Método: ${isPix ? 'PIX' : 'Cartão'}`);
    console.log(`👤 Ação: ${planoPendente ? '⏳ Plano Pendente' : '✅ Subscription Ativada'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Webhook processado com sucesso',
        data: {
          email: customer.email,
          plan: planInfo.name,
          level: planInfo.level,
          amount: payment.amount,
          expiresAt: expirationDate.toISOString()
        },
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('💥 Erro no webhook:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Erro interno do servidor',
        message: error.message
      })
    };
  }
};
