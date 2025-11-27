// URLs da API
export const API_CONFIG = {
  // URL base da API
  BASE_URL: import.meta.env.MODE === 'production'
    ? 'https://edukaprime.com.br'
    : 'http://localhost:5173',

  // Webhook da AmploPay
  WEBHOOK_AMPLOPAY: 'https://edukaprime.com.br/api/webhook/amplopay',

  // Token de acesso obrigatório (carregado do .env)
  REQUIRED_ACCESS_TOKEN: import.meta.env.VITE_AMPLOPAY_TOKEN || '21s2yh9n'
} as const;

// Headers padrão para requisições
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
} as const;