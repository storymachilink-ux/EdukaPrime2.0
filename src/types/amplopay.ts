export interface AmploPayWebhookData {
  event: string;
  token: string;
  offerCode: string;
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
    cpf: string;
    cnpj: string | null;
    address: {
      country: string;
      zipCode: string;
      state: string;
      city: string;
      neighborhood: string;
      street: string;
      number: string;
      complement: string;
    };
  };
  transaction: {
    id: string;
    identifier: string;
    paymentMethod: string;
    status: string;
    originalAmount: number;
    originalCurrency: string;
    currency: string;
    exchangeRate: number;
    amount: number;
    createdAt: string;
    payedAt: string;
    boletoInformation: any | null;
    pixInformation: any | null;
  };
  subscription: {
    id: string;
    identifier: string;
    intervalCount: number;
    intervalType: string;
    startAt: string;
    cycle: number;
    status: string;
  };
  orderItems: Array<{
    id: string;
    price: number;
    product: {
      id: string;
      name: string;
      externalId: string;
    };
  }>;
  trackProps: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  };
}

export interface UserAccess {
  token: string;
  planType: 'essencial' | 'evoluir' | 'prime';
  email: string;
  name: string;
  accessGrantedAt: string;
  expiresAt?: string;
}