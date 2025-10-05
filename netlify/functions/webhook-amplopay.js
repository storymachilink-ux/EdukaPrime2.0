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

    // Calcular data de expiração (PIX = 30 dias, Cartão = 90 dias)
    const isPix = payment.method.includes('pix');
    const daysToAdd = isPix ? 30 : 90;
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + daysToAdd);

    console.log(`📅 Método: ${isPix ? 'PIX' : 'Cartão'} → ${daysToAdd} dias de acesso`);
    console.log(`📅 Expira em: ${expirationDate.toISOString()}`);

    // Buscar usuário pelo email
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, email, plano_ativo')
      .eq('email', customer.email.toLowerCase())
      .maybeSingle();

    let userId;

    if (!existingUser) {
      console.log('👤 Usuário não encontrado. Criando conta automaticamente...');

      // Gerar senha aleatória
      const randomPassword = Math.random().toString(36).slice(-12) + 'Aa1!';

      // Criar usuário no Auth
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: customer.email.toLowerCase(),
        password: randomPassword,
        email_confirm: true,
        user_metadata: {
          name: customer.name || customer.email.split('@')[0]
        }
      });

      if (authError) {
        console.error('❌ Erro ao criar usuário no Auth:', authError);
        throw new Error(`Erro ao criar usuário: ${authError.message}`);
      }

      userId = authUser.user.id;
      console.log('✅ Usuário criado no Auth:', userId);

      // Criar perfil na tabela users
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: customer.email.toLowerCase(),
          plano_ativo: planInfo.level,
          data_ativacao: new Date().toISOString()
        });

      if (insertError) {
        console.error('❌ Erro ao criar perfil:', insertError);
        throw new Error(`Erro ao criar perfil: ${insertError.message}`);
      }

      console.log('✅ Perfil criado com sucesso');

    } else {
      userId = existingUser.id;
      console.log('✅ Usuário encontrado:', userId);

      // Atualizar plano do usuário
      const { error: updateError } = await supabase
        .from('users')
        .update({
          plano_ativo: planInfo.level,
          data_ativacao: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('❌ Erro ao atualizar usuário:', updateError);
        throw new Error(`Erro ao atualizar: ${updateError.message}`);
      }

      console.log('✅ Plano atualizado com sucesso');
    }

    // Registrar transação para contabilização na área admin
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        payment_id: payment.id,
        product_id: productId,
        plan_level: planInfo.level,
        plan_name: planInfo.name,
        amount: payment.amount || 0,
        payment_method: payment.method,
        payment_status: payment.status || 'pending',
        event_type: eventType,
        customer_email: customer.email,
        customer_name: customer.name || null,
        customer_phone: customer.phone || null,
        raw_payload: payload,
        processed_at: new Date().toISOString()
      });

    if (transactionError) {
      console.error('⚠️ Erro ao registrar transação (não crítico):', transactionError);
    } else {
      console.log('✅ Transação registrada para contabilização');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ WEBHOOK PROCESSADO COM SUCESSO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${customer.email}`);
    console.log(`📦 Plano: ${planInfo.name} (${planInfo.level})`);
    console.log(`💰 Valor: R$ ${payment.amount}`);
    console.log(`💳 Método: ${isPix ? 'PIX' : 'Cartão'}`);
    console.log(`👤 Ação: ${existingUser ? 'Atualizado' : 'Criado'}`);
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
