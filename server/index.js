import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Log de requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Webhook AmploPay
app.post('/api/webhook/amplopay', async (req, res) => {
  try {
    console.log('📨 Webhook AmploPay recebido');

    const webhookData = req.body;

    // Log para debug (remover em produção)
    if (process.env.NODE_ENV === 'development') {
      console.log('Dados do webhook:', JSON.stringify(webhookData, null, 2));
    }

    // Validar Content-Type
    if (req.headers['content-type'] !== 'application/json') {
      return res.status(400).json({
        error: 'Content-Type deve ser application/json'
      });
    }

    // Validar token compartilhado AmploPay
    if (webhookData.token !== '21s2yh9n') {
      console.error('❌ Token inválido:', webhookData.token);
      return res.status(401).json({
        error: 'Token inválido'
      });
    }

    // Validar dados obrigatórios
    if (!webhookData.client?.email || !webhookData.transaction?.id || !webhookData.offerCode) {
      console.error('❌ Dados obrigatórios ausentes');
      return res.status(400).json({
        error: 'Dados obrigatórios ausentes'
      });
    }

    // Verificar offer codes válidos
    const validOffers = ['LIGRMS3', 'ZMTP2IV', 'VBAQ4J3'];
    if (!validOffers.includes(webhookData.offerCode)) {
      console.error('❌ Offer code inválido:', webhookData.offerCode);
      return res.status(400).json({
        error: 'Offer code inválido'
      });
    }

    // Processar apenas pagamentos aprovados
    if (webhookData.event === 'TRANSACTION_PAID' &&
        webhookData.transaction.status === 'COMPLETED') {

      // Determinar plano baseado no offer code
      const planMapping = {
        'LIGRMS3': { level: 1, name: 'Plano Essencial' },
        'ZMTP2IV': { level: 2, name: 'Plano Evoluir' },
        'VBAQ4J3': { level: 3, name: 'Plano Prime' }
      };

      const plan = planMapping[webhookData.offerCode];

      // Buscar ou criar usuário no Supabase
      let { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', webhookData.client.email)
        .single();

      if (userError && userError.code === 'PGRST116') {
        // Usuário não existe, criar novo
        console.log('👤 Criando novo usuário:', webhookData.client.email);

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
          .single();

        if (createError) {
          console.error('❌ Erro ao criar usuário:', createError);
          return res.status(500).json({
            error: 'Erro ao criar usuário'
          });
        }

        user = newUser;
      } else if (userError) {
        console.error('❌ Erro ao buscar usuário:', userError);
        return res.status(500).json({
          error: 'Erro ao buscar usuário'
        });
      } else {
        // Usuário existe, atualizar plano
        console.log('🔄 Atualizando plano do usuário:', webhookData.client.email);

        const { error: updateError } = await supabase
          .from('users')
          .update({
            plano_ativo: plan.level,
            data_ativacao: new Date().toISOString()
          })
          .eq('email', webhookData.client.email);

        if (updateError) {
          console.error('❌ Erro ao atualizar usuário:', updateError);
          return res.status(500).json({
            error: 'Erro ao atualizar usuário'
          });
        }
      }

      // Salvar registro da transação para auditoria
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
        }]);

      if (transactionError) {
        console.error('⚠️ Erro ao salvar transação (não crítico):', transactionError);
      }

      console.log('✅ Acesso liberado com sucesso:', {
        email: webhookData.client.email,
        plano: plan.name,
        valor: webhookData.transaction.amount
      });

      // Resposta de sucesso para AmploPay
      res.status(200).json({
        success: true,
        message: 'Webhook processado com sucesso',
        user_email: webhookData.client.email,
        plan: plan.name,
        timestamp: new Date().toISOString()
      });

    } else {
      console.log('ℹ️ Webhook recebido mas não é pagamento aprovado');
      res.status(200).json({
        message: 'Webhook recebido mas não processado - não é pagamento aprovado'
      });
    }

  } catch (error) {
    console.error('💥 Erro crítico no webhook:', error);

    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('💥 Erro não tratado:', error);
  res.status(500).json({
    error: 'Erro interno do servidor'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor webhook rodando na porta ${PORT}`);
  console.log(`📡 Endpoint webhook: http://localhost:${PORT}/api/webhook/amplopay`);
  console.log(`❤️ Health check: http://localhost:${PORT}/health`);
});