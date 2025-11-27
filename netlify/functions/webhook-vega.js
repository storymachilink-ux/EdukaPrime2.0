const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Função: Registrar webhook em webhook_logs e retornar ID
async function logWebhook(payload, customer, product, eventType) {
  const { data, error } = await supabase
    .from('webhook_logs')
    .insert({
      event_type: eventType,
      status: 'pending',
      customer_email: customer?.email,
      customer_name: customer?.name || null,
      customer_phone: customer?.phone || null,
      product_id: product?.code,
      plan_name: product?.title || 'Desconhecido',
      payment_id: payload?.transaction?.id || null,
      payment_method: payload?.transaction?.paymentMethod || 'Desconhecido',
      amount: payload?.transaction?.amount || 0,
      raw_payload: payload,
      platform: 'VEGA'
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
    console.log('📨 WEBHOOK VEGA RECEBIDO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Parse do body
    const payload = JSON.parse(event.body);
    console.log('📦 Payload completo:', JSON.stringify(payload, null, 2));

    // Extrair informações do webhook
    const eventType = payload.event;
    const customer = payload.customer;
    const transaction = payload.transaction;
    const plans = payload.plans || [];

    console.log('📋 Dados extraídos:');
    console.log('  - Evento:', eventType);
    console.log('  - Email:', customer?.email);
    console.log('  - Produtos:', plans.length);
    console.log('  - Transaction ID:', transaction?.id);
    console.log('  - Payment Method:', transaction?.paymentMethod);
    console.log('  - Amount:', transaction?.amount);

    // Validar se é pagamento aprovado
    if (eventType !== 'TRANSACTION_PAID' || transaction?.status !== 'COMPLETED') {
      console.log('⚠️ Evento ignorado (não é pagamento aprovado):', eventType, transaction?.status);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Evento ignorado - não é pagamento aprovado',
          event: eventType,
          status: transaction?.status
        })
      };
    }

    // Validar dados obrigatórios
    if (!customer?.email || plans.length === 0) {
      console.error('❌ Dados obrigatórios ausentes');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Dados obrigatórios ausentes: email, plans' })
      };
    }

    // 🔴 PASSO 1: Registrar webhook em webhook_logs ANTES de processar
    console.log('📝 Registrando webhook em webhook_logs...');
    let webhookId = null;

    // Registrar apenas uma vez para o webhook inteiro
    if (plans.length > 0) {
      webhookId = await logWebhook(payload, customer, plans[0]?.products[0], eventType);
      if (webhookId) {
        console.log(`✅ Webhook registrado com ID: ${webhookId}`);
      }
    }

    // Processar cada plano e seus produtos
    let processedCount = 0;
    let errorCount = 0;

    for (const plan of plans) {
      const products = plan.products || [];

      for (const product of products) {
        try {
          console.log(`\n📦 Processando produto: ${product.code} - ${product.title}`);

          // Buscar plan_id usando product_code do Vega
          const { data: planData, error: planError } = await supabase
            .from('plans_v2')
            .select('id, name, display_name')
            .eq('vega_product_id', product.code)
            .single();

          if (planError || !planData) {
            console.warn(`⚠️ Plano não encontrado para product_code: ${product.code}`);
            errorCount++;
            continue;
          }

          const planId = planData.id;
          const planName = planData.display_name || planData.name || product.title;

          // Buscar usuário pelo email
          const { data: existingUser, error: userError } = await supabase
            .from('users')
            .select('id, email, plano_ativo')
            .eq('email', customer.email.toLowerCase())
            .maybeSingle();

          // Buscar tipo de plano para calcular expiração corretamente
          const { data: planFullData, error: planFullError } = await supabase
            .from('plans_v2')
            .select('payment_type')
            .eq('id', planId)
            .single();

          // Se é plano mensal, expira em 30 dias
          // Se é plano único/vitalício, NUNCA expira (end_date = NULL)
          let expirationDate = null;
          if (planFullData?.payment_type === 'mensal') {
            expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 30);
          }

          if (!existingUser) {
            console.log(`  👤 Usuário não encontrado. Inserindo em ⏳ Planos Pendentes...`);

            // Inserir em pending_plans
            const { error: pendingError } = await supabase
              .from('pending_plans')
              .insert({
                email: customer.email.toLowerCase(),
                plan_id: planId,
                status: 'pending',
                payment_id: transaction.id,
                product_id_gateway: product.code,
                payment_method: transaction.paymentMethod,
                amount_paid: transaction.amount || 0,
                platform: 'VEGA',
                webhook_id: webhookId,
                product_name: product.title || planName,
                product_code: product.code,
                start_date: new Date().toISOString(),
                end_date: expirationDate ? expirationDate.toISOString() : null
              });

            if (pendingError) {
              console.error(`  ❌ Erro ao inserir em pending_plans:`, pendingError);
              errorCount++;
            } else {
              console.log(`  ✅ Plano pendente criado para ${customer.email}`);
              processedCount++;
            }
          } else {
            console.log(`  ✅ Usuário encontrado: ${existingUser.id}`);

            // Criar/atualizar subscription em user_subscriptions
            const { error: subscriptionError } = await supabase
              .from('user_subscriptions')
              .insert({
                user_id: existingUser.id,
                plan_id: planId,
                status: 'active',
                start_date: new Date().toISOString(),
                end_date: expirationDate ? expirationDate.toISOString() : null,
                payment_id: transaction.id,
                product_id_gateway: product.code,
                payment_method: transaction.paymentMethod,
                amount_paid: transaction.amount || 0,
                webhook_id: webhookId
              })
              .on('conflict', {
                ignoreDuplicates: true
              });

            if (subscriptionError) {
              console.error(`  ❌ Erro ao criar subscription:`, subscriptionError);
              errorCount++;
            } else {
              // Atualizar usuário com plano ativo
              const { error: updateError } = await supabase
                .from('users')
                .update({
                  active_plan_id: planId,
                  plano_ativo: planId,
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingUser.id);

              if (updateError) {
                console.error(`  ❌ Erro ao atualizar usuário:`, updateError);
                errorCount++;
              } else {
                console.log(`  ✅ Subscription ativada com sucesso`);
                processedCount++;
              }
            }
          }
        } catch (productError) {
          console.error(`  ❌ Erro ao processar produto:`, productError);
          errorCount++;
        }
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ WEBHOOK PROCESSADO COM SUCESSO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${customer.email}`);
    console.log(`📦 Produtos processados: ${processedCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`💳 Valor total: R$ ${transaction.amount}`);
    console.log(`💳 Método: ${transaction.paymentMethod}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Webhook processado com sucesso',
        data: {
          email: customer.email,
          productsProcessed: processedCount,
          errors: errorCount,
          amount: transaction.amount,
          timestamp: new Date().toISOString()
        }
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
