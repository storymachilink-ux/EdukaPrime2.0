import { AmploPayWebhookData } from '../types/amplopay';
import { AuthService } from './auth';
import { API_CONFIG } from '../constants/api';

export class WebhookHandler {
  /**
   * Processa dados recebidos do webhook da AmploPay
   * Esta função seria chamada pelo endpoint do servidor
   */
  static async processWebhook(webhookData: AmploPayWebhookData): Promise<boolean> {
    try {
      console.log('📨 Processando webhook AmploPay:', {
        event: webhookData.event,
        email: webhookData.client.email,
        offerCode: webhookData.offerCode,
        status: webhookData.transaction.status
      });

      // Validações
      if (!this.validateWebhook(webhookData)) {
        throw new Error('Webhook inválido');
      }

      // Processar apenas pagamentos aprovados
      if (webhookData.event === 'TRANSACTION_PAID' &&
          webhookData.transaction.status === 'COMPLETED') {

        // Liberar acesso para o usuário
        AuthService.storeUserAccess(webhookData);

        console.log('✅ Acesso liberado com sucesso:', {
          email: webhookData.client.email,
          plano: this.getplanTypeFromOffer(webhookData.offerCode),
          valor: webhookData.transaction.amount
        });

        // Em produção, aqui você poderia:
        // - Salvar no banco de dados
        // - Enviar email de boas-vindas
        // - Criar usuário no Supabase
        // - Integrar com outros sistemas

        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Erro ao processar webhook:', error);
      throw error;
    }
  }

  /**
   * Valida se o webhook é legítimo
   */
  private static validateWebhook(data: AmploPayWebhookData): boolean {
    // Verificar token obrigatório
    if (data.token !== API_CONFIG.REQUIRED_ACCESS_TOKEN) {
      console.error('❌ Token inválido:', data.token);
      return false;
    }

    // Verificar estrutura mínima
    if (!data.client?.email || !data.transaction?.id || !data.offerCode) {
      console.error('❌ Dados obrigatórios ausentes');
      return false;
    }

    // Verificar offer codes válidos
    const validOffers = ['LIGRMS3', 'ZMTP2IV', 'VBAQ4J3'];
    if (!validOffers.includes(data.offerCode)) {
      console.error('❌ Offer code inválido:', data.offerCode);
      return false;
    }

    return true;
  }

  /**
   * Converte offer code para nome do plano
   */
  private static getplanTypeFromOffer(offerCode: string): string {
    const mapping = {
      'LIGRMS3': 'Plano Essencial',
      'ZMTP2IV': 'Plano Evoluir',
      'VBAQ4J3': 'Plano Prime'
    };
    return mapping[offerCode as keyof typeof mapping] || 'Plano Desconhecido';
  }

  /**
   * Endpoint de exemplo para receber webhooks
   * Esta seria a implementação no seu servidor Node.js/Express
   */
  static getExpressEndpointExample(): string {
    return `
// Endpoint para receber webhooks da AmploPay
// URL: https://edukaprime.com.br/api/webhook/amplopay

app.post('/api/webhook/amplopay', async (req, res) => {
  try {
    console.log('📨 Webhook recebido da AmploPay');

    const webhookData = req.body;

    // Log para debug (remover em produção)
    console.log('Dados do webhook:', JSON.stringify(webhookData, null, 2));

    // Validar Content-Type
    if (req.headers['content-type'] !== 'application/json') {
      return res.status(400).json({
        error: 'Content-Type deve ser application/json'
      });
    }

    // Processar webhook
    const success = await WebhookHandler.processWebhook(webhookData);

    if (success) {
      // Resposta de sucesso para AmploPay
      res.status(200).json({
        success: true,
        message: 'Webhook processado com sucesso',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        error: 'Webhook não processado - condições não atendidas'
      });
    }

  } catch (error) {
    console.error('❌ Erro no endpoint webhook:', error);

    // Sempre retornar erro 500 para problemas internos
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Middleware de segurança (opcional)
app.use('/api/webhook', (req, res, next) => {
  // Verificar IP da AmploPay (se necessário)
  // Verificar assinatura do webhook (se implementado)
  // Rate limiting
  next();
});
`;
  }
}