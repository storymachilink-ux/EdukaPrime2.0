import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

// Mapeamento de product.id para planos (GGCheckout)
const PRODUCT_PLAN_MAPPING = {
  'lDGnSUHPwxWlHBlPEIFy': { level: 1, name: 'Plano Essencial' },
  'WpjID8aV49ShaQ07ABzP': { level: 2, name: 'Plano Evoluir' },
  'eOGqcq0IbQnJUpjKRpsG': { level: 3, name: 'Plano Prime' }
};

// Webhook secret para AmploPay - será carregado da tabela webhook_secrets
// Mantém fallback para variável de ambiente por compatibilidade
let AMPLOPAY_WEBHOOK_SECRET = Deno.env.get('AMPLOPAY_WEBHOOK_SECRET') || '';

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÃO: Carregar Secret da Tabela webhook_secrets
// ═══════════════════════════════════════════════════════════════════════════

async function loadWebhookSecretFromDatabase(
  supabase: any,
  platform: string
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('webhook_secrets')
      .select('secret')
      .eq('platform', platform)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.warn(`⚠️ Erro ao carregar secret de ${platform} da tabela:`, error.message);
      return AMPLOPAY_WEBHOOK_SECRET; // Fallback para env var
    }

    if (data?.secret) {
      console.log(`✅ Secret de ${platform} carregado da tabela webhook_secrets`);
      return data.secret;
    }

    console.warn(`⚠️ Nenhum secret encontrado na tabela para ${platform}`);
    return AMPLOPAY_WEBHOOK_SECRET; // Fallback para env var
  } catch (error) {
    console.error(`❌ Erro ao carregar secret da tabela:`, error);
    return AMPLOPAY_WEBHOOK_SECRET; // Fallback para env var
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÃO: Validar Assinatura HMAC do Webhook
// ═══════════════════════════════════════════════════════════════════════════

async function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  if (!secret) {
    console.warn(`⚠️ WARNING: Nenhum secret AMPLOPAY_WEBHOOK_SECRET configurado.`)
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

    // Comparação timing-safe
    return computedSignature.toLowerCase() === signature.toLowerCase()
  } catch (error) {
    console.error(`❌ Erro ao validar assinatura HMAC: ${error}`)
    return false
  }
}

Deno.serve(async (req) => {
  // Headers CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Responder a preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  // Apenas aceitar POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📨 WEBHOOK AMPLOPAY RECEBIDO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

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
        headers: corsHeaders
      })
    }

    // Validar assinatura se o secret está configurado
    if (AMPLOPAY_WEBHOOK_SECRET) {
      const isValid = await validateWebhookSignature(payloadText, signature, AMPLOPAY_WEBHOOK_SECRET)
      if (!isValid) {
        console.error(`❌ WEBHOOK REJEITADO: Assinatura inválida para AmploPay`)
        return new Response(JSON.stringify({ error: 'Invalid webhook signature' }), {
          status: 401,
          headers: corsHeaders
        })
      }
      console.log(`✅ WEBHOOK VALIDADO: Assinatura HMAC válida para AmploPay`)
    } else {
      console.warn(`⚠️ WEBHOOK SEM VALIDAÇÃO: Nenhum secret configurado para AmploPay`)
    }

    // Inicializar Supabase Admin Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Carregar secret do banco de dados (com fallback para env var)
    const dbSecret = await loadWebhookSecretFromDatabase(supabase, 'amplopay');
    if (dbSecret) {
      AMPLOPAY_WEBHOOK_SECRET = dbSecret;
    }

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
      return new Response(
        JSON.stringify({
          message: 'Evento ignorado - não é pagamento aprovado',
          event: eventType
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Validar dados obrigatórios
    if (!customer?.email || !product?.id || !payment?.method) {
      console.error('❌ Dados obrigatórios ausentes');
      return new Response(
        JSON.stringify({ error: 'Dados obrigatórios ausentes: email, product.id, payment.method' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Identificar qual plano foi comprado
    const productId = product.id;
    const planInfo = PRODUCT_PLAN_MAPPING[productId];

    if (!planInfo) {
      console.error('❌ Produto não mapeado:', productId);
      console.error('Produtos válidos:', Object.keys(PRODUCT_PLAN_MAPPING));
      return new Response(
        JSON.stringify({
          error: 'Produto não mapeado',
          productId: productId,
          validProducts: Object.keys(PRODUCT_PLAN_MAPPING)
        }),
        { status: 400, headers: corsHeaders }
      );
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

    return new Response(
      JSON.stringify({
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
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('💥 Erro no webhook:', error);

    return new Response(
      JSON.stringify({
        error: 'Erro interno do servidor',
        message: error.message
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
