import { AmploPayWebhookData } from '../types/amplopay';
import { AuthService } from './auth';

export class WebhookService {
  // Simular endpoint webhook para desenvolvimento
  static async handleAmploPayWebhook(data: AmploPayWebhookData): Promise<void> {
    try {
      console.log('📨 Webhook recebido:', data);

      // Verificar se é um evento de pagamento
      if (data.event === 'TRANSACTION_PAID' && data.transaction.status === 'COMPLETED') {
        // Processar acesso do usuário
        AuthService.storeUserAccess(data);

        console.log('✅ Acesso liberado para:', data.client.email);
        console.log('📋 Plano:', this.getplanTypeFromOffer(data.offerCode));

        // REMOVIDO redirecionamento - deixar App.tsx gerenciar
        console.log('🎯 [DEBUG] Webhook processado - interface será atualizada automaticamente');
      }
    } catch (error) {
      console.error('❌ Erro ao processar webhook:', error);
      throw error;
    }
  }

  private static getplanTypeFromOffer(offerCode: string): string {
    const offerToPlan: Record<string, string> = {
      'LIGRMS3': 'Plano Essencial',
      'ZMTP2IV': 'Plano Evoluir',
      'VBAQ4J3': 'Plano Prime'
    };

    return offerToPlan[offerCode] || 'Plano Desconhecido';
  }

  // Função para simular callback de pagamento (para desenvolvimento)
  static simulatePaymentCallback(offerCode: string): void {
    const mockWebhookData: AmploPayWebhookData = {
      event: "TRANSACTION_PAID",
      token: "21s2yh9n",
      offerCode,
      client: {
        id: "sim_" + Date.now(),
        name: "Usuário Simulado",
        email: "simulado@edukaprime.com",
        phone: "(11) 98218-9217",
        cpf: "123.123.123-12",
        cnpj: null,
        address: {
          country: "BR",
          zipCode: "01304-000",
          state: "SP",
          city: "São Paulo",
          neighborhood: "Consolação",
          street: "Rua Augusta",
          number: "6312",
          complement: "6 andar"
        }
      },
      transaction: {
        id: "sim_trans_" + Date.now(),
        identifier: "sim-identifier",
        paymentMethod: "CREDIT_CARD",
        status: "COMPLETED",
        originalAmount: 20,
        originalCurrency: "USD",
        currency: "BRL",
        exchangeRate: 5,
        amount: 100,
        createdAt: new Date().toISOString(),
        payedAt: new Date().toISOString(),
        boletoInformation: null,
        pixInformation: null
      },
      subscription: {
        id: "sim_sub_" + Date.now(),
        identifier: "sim-sub-identifier",
        intervalCount: 1,
        intervalType: "MONTHS",
        startAt: new Date().toISOString(),
        cycle: 1,
        status: "ACTIVE"
      },
      orderItems: [{
        id: "sim_item_" + Date.now(),
        price: 100,
        product: {
          id: "sim_product",
          name: "Plano EdukaPrime",
          externalId: "edukaprime_plan"
        }
      }],
      trackProps: {
        utm_source: "simulation",
        utm_medium: "test",
        utm_campaign: "development"
      }
    };

    this.handleAmploPayWebhook(mockWebhookData);
  }
}