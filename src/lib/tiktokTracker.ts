/**
 * TikTok Pixel Tracker
 * Gerencia eventos e rastreamento do TikTok em todo o site
 */

// Tipo de dados para eventos do TikTok
export interface TikTokEventData {
  [key: string]: any;
}

// Interface para dados de identificação do usuário
export interface TikTokUserIdentifyData {
  email?: string;
  phone_number?: string;
  external_id?: string;
}

// Interface para conteúdo de produtos
export interface TikTokContent {
  content_id: string;
  content_type: 'product' | 'product_group';
  content_name: string;
}

// Função auxiliar para fazer hash SHA-256
async function hashSHA256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Função auxiliar para acessar o objeto global do TikTok
 */
function getTikTokPixel(): any {
  return (window as any).ttq;
}

/**
 * Verifica se o pixel do TikTok está carregado
 */
export function isTikTokPixelReady(): boolean {
  const ttq = getTikTokPixel();
  return ttq !== undefined && ttq !== null;
}

/**
 * Rastreia uma visualização de página
 * @param url - URL da página (opcional, usa window.location.href por padrão)
 */
export function trackPageView(url?: string): void {
  const ttq = getTikTokPixel();
  if (!ttq) {
    console.warn('TikTok Pixel não está carregado ainda');
    return;
  }

  try {
    ttq.page();
    console.log('TikTok: Página visualizada', url || window.location.href);
  } catch (error) {
    console.error('Erro ao rastrear visualização de página no TikTok:', error);
  }
}

/**
 * Rastreia um evento customizado do TikTok
 * @param eventName - Nome do evento (ex: 'Purchase', 'AddToCart', 'ViewContent')
 * @param eventData - Dados adicionais do evento
 */
export function trackEvent(eventName: string, eventData?: TikTokEventData): void {
  const ttq = getTikTokPixel();
  if (!ttq) {
    console.warn('TikTok Pixel não está carregado ainda');
    return;
  }

  try {
    ttq.track(eventName, eventData || {});
    console.log(`TikTok: Evento '${eventName}' rastreado`, eventData);
  } catch (error) {
    console.error(`Erro ao rastrear evento '${eventName}' no TikTok:`, error);
  }
}


/**
 * Rastreia login do usuário
 * @param userId - ID do usuário (opcional)
 * @param method - Método de login (email, google, etc)
 */
export function trackLogin(userId?: string, method: string = 'email'): void {
  trackEvent('Login', {
    user_id: userId,
    login_method: method,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Rastreia inscrição/sign up
 * @param userId - ID do usuário
 * @param email - Email do usuário (opcional)
 */
export function trackSignUp(userId: string, email?: string): void {
  trackEvent('Sign Up', {
    user_id: userId,
    email: email,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Rastreia download de recurso
 * @param resourceId - ID do recurso
 * @param resourceType - Tipo (atividade, video, bonus, etc)
 * @param resourceName - Nome do recurso
 */
export function trackDownload(
  resourceId: string,
  resourceType: string,
  resourceName: string
): void {
  trackEvent('Download', {
    content_id: resourceId,
    content_type: resourceType,
    content_name: resourceName,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Rastreia conclusão de recurso
 * @param resourceId - ID do recurso
 * @param resourceType - Tipo (atividade, video, bonus, etc)
 * @param resourceName - Nome do recurso
 */
export function trackCompleteResource(
  resourceId: string,
  resourceType: string,
  resourceName: string
): void {
  trackEvent('CompleteResource', {
    content_id: resourceId,
    content_type: resourceType,
    content_name: resourceName,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Rastreia busca de conteúdo
 * @param searchQuery - Termo de busca
 * @param resultsCount - Número de resultados encontrados
 */
export function trackSearch(searchQuery: string, resultsCount: number): void {
  trackEvent('Search', {
    search_query: searchQuery,
    results_count: resultsCount,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Rastreia inicialização de aula/vídeo
 * @param contentId - ID do conteúdo
 * @param contentName - Nome do conteúdo
 * @param duration - Duração em segundos (opcional)
 */
export function trackPlayVideo(
  contentId: string,
  contentName: string,
  duration?: number
): void {
  trackEvent('PlayVideo', {
    content_id: contentId,
    content_name: contentName,
    duration: duration,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Identifica um usuário com dados customizados
 * @param userId - ID único do usuário
 * @param userData - Dados adicionais do usuário
 */
export function identifyUser(userId: string, userData?: TikTokEventData): void {
  const ttq = getTikTokPixel();
  if (!ttq) {
    console.warn('TikTok Pixel não está carregado ainda');
    return;
  }

  try {
    const data = {
      user_id: userId,
      ...userData,
    };
    ttq.identify(data);
    console.log('TikTok: Usuário identificado', userId);
  } catch (error) {
    console.error('Erro ao identificar usuário no TikTok:', error);
  }
}

/**
 * Identifica um usuário com dados PII (hasheados)
 * @param userData - Dados do usuário (email, phone_number, external_id)
 */
export async function identifyUserWithPII(userData: TikTokUserIdentifyData): Promise<void> {
  const ttq = getTikTokPixel();
  if (!ttq) {
    console.warn('TikTok Pixel não está carregado ainda');
    return;
  }

  try {
    const identifyData: any = {};

    // Hash email se fornecido
    if (userData.email) {
      identifyData.email = await hashSHA256(userData.email);
    }

    // Hash phone se fornecido
    if (userData.phone_number) {
      identifyData.phone_number = await hashSHA256(userData.phone_number);
    }

    // Hash external_id se fornecido
    if (userData.external_id) {
      identifyData.external_id = await hashSHA256(userData.external_id);
    }

    ttq.identify(identifyData);
    console.log('TikTok: Usuário identificado com PII');
  } catch (error) {
    console.error('Erro ao identificar usuário com PII no TikTok:', error);
  }
}

/**
 * Rastreia visualização de conteúdo com detalhes de produto
 * @param contents - Array de conteúdos
 * @param value - Valor do conteúdo
 * @param currency - Moeda (padrão: BRL)
 */
export function trackViewContent(
  contents: TikTokContent[],
  value?: number,
  currency: string = 'BRL'
): void {
  const eventData: any = {
    contents: contents,
  };

  if (value !== undefined) {
    eventData.value = value;
  }
  if (value !== undefined) {
    eventData.currency = currency;
  }

  trackEvent('ViewContent', eventData);
}

/**
 * Rastreia adição à lista de desejos
 * @param contents - Array de conteúdos
 * @param value - Valor do conteúdo
 * @param currency - Moeda (padrão: BRL)
 */
export function trackAddToWishlist(
  contents: TikTokContent[],
  value?: number,
  currency: string = 'BRL'
): void {
  const eventData: any = {
    contents: contents,
  };

  if (value !== undefined) {
    eventData.value = value;
  }
  if (value !== undefined) {
    eventData.currency = currency;
  }

  trackEvent('AddToWishlist', eventData);
}

/**
 * Rastreia busca com padrão TikTok
 * @param contents - Array de conteúdos
 * @param searchString - Termo de busca
 * @param value - Valor do conteúdo
 * @param currency - Moeda (padrão: BRL)
 */
export function trackSearchTikTok(
  contents: TikTokContent[],
  searchString: string,
  value?: number,
  currency: string = 'BRL'
): void {
  const eventData: any = {
    contents: contents,
    search_string: searchString,
  };

  if (value !== undefined) {
    eventData.value = value;
  }
  if (value !== undefined) {
    eventData.currency = currency;
  }

  trackEvent('Search', eventData);
}

/**
 * Rastreia adição de informações de pagamento
 * @param contents - Array de conteúdos
 * @param value - Valor do conteúdo
 * @param currency - Moeda (padrão: BRL)
 */
export function trackAddPaymentInfo(
  contents: TikTokContent[],
  value?: number,
  currency: string = 'BRL'
): void {
  const eventData: any = {
    contents: contents,
  };

  if (value !== undefined) {
    eventData.value = value;
  }
  if (value !== undefined) {
    eventData.currency = currency;
  }

  trackEvent('AddPaymentInfo', eventData);
}

/**
 * Rastreia adição ao carrinho com padrão TikTok
 * @param contents - Array de conteúdos
 * @param value - Valor do conteúdo
 * @param currency - Moeda (padrão: BRL)
 */
export function trackAddToCartTikTok(
  contents: TikTokContent[],
  value?: number,
  currency: string = 'BRL'
): void {
  const eventData: any = {
    contents: contents,
  };

  if (value !== undefined) {
    eventData.value = value;
  }
  if (value !== undefined) {
    eventData.currency = currency;
  }

  trackEvent('AddToCart', eventData);
}

/**
 * Rastreia inicialização de checkout
 * @param contents - Array de conteúdos
 * @param value - Valor da compra
 * @param currency - Moeda (padrão: BRL)
 */
export function trackInitiateCheckout(
  contents: TikTokContent[],
  value?: number,
  currency: string = 'BRL'
): void {
  const eventData: any = {
    contents: contents,
  };

  if (value !== undefined) {
    eventData.value = value;
  }
  if (value !== undefined) {
    eventData.currency = currency;
  }

  trackEvent('InitiateCheckout', eventData);
}

/**
 * Rastreia conclusão de pedido
 * @param contents - Array de conteúdos
 * @param value - Valor da compra
 * @param currency - Moeda (padrão: BRL)
 */
export function trackPlaceAnOrder(
  contents: TikTokContent[],
  value?: number,
  currency: string = 'BRL'
): void {
  const eventData: any = {
    contents: contents,
  };

  if (value !== undefined) {
    eventData.value = value;
  }
  if (value !== undefined) {
    eventData.currency = currency;
  }

  trackEvent('PlaceAnOrder', eventData);
}

/**
 * Rastreia conclusão de registro/cadastro
 * @param contents - Array de conteúdos
 * @param value - Valor (se aplicável)
 * @param currency - Moeda (padrão: BRL)
 */
export function trackCompleteRegistration(
  contents: TikTokContent[],
  value?: number,
  currency: string = 'BRL'
): void {
  const eventData: any = {
    contents: contents,
  };

  if (value !== undefined) {
    eventData.value = value;
  }
  if (value !== undefined) {
    eventData.currency = currency;
  }

  trackEvent('CompleteRegistration', eventData);
}

/**
 * Rastreia compra com padrão TikTok
 * @param contents - Array de conteúdos
 * @param value - Valor da compra
 * @param currency - Moeda (padrão: BRL)
 */
export function trackPurchaseTikTok(
  contents: TikTokContent[],
  value?: number,
  currency: string = 'BRL'
): void {
  const eventData: any = {
    contents: contents,
  };

  if (value !== undefined) {
    eventData.value = value;
  }
  if (value !== undefined) {
    eventData.currency = currency;
  }

  trackEvent('Purchase', eventData);
}

/**
 * Inicializa rastreamento na página
 * Deve ser chamado uma vez quando a aplicação carrega
 */
export function initializeTikTokTracking(): void {
  if (window.location.pathname.includes('/admin')) {
    return;
  }

  const checkAndInit = () => {
    if (isTikTokPixelReady()) {
      console.log('TikTok Pixel inicializado com sucesso');
      trackPageView();
    } else {
      setTimeout(checkAndInit, 500);
    }
  };

  checkAndInit();
}

/**
 * Rastreia elemento visualizado (para scroll tracking)
 * @param elementId - ID do elemento
 * @param elementName - Nome/descrição do elemento
 */
export function trackViewElement(elementId: string, elementName: string): void {
  trackEvent('ViewElement', {
    element_id: elementId,
    element_name: elementName,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Rastreia clique em botão
 * @param buttonName - Nome do botão
 * @param buttonSection - Seção/página onde o botão está
 */
export function trackButtonClick(buttonName: string, buttonSection?: string): void {
  trackEvent('ButtonClick', {
    button_name: buttonName,
    button_section: buttonSection,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Rastreia erro/problema
 * @param errorMessage - Mensagem de erro
 * @param errorType - Tipo de erro
 * @param errorContext - Contexto adicional
 */
export function trackError(
  errorMessage: string,
  errorType?: string,
  errorContext?: TikTokEventData
): void {
  trackEvent('Error', {
    error_message: errorMessage,
    error_type: errorType,
    ...errorContext,
    timestamp: new Date().toISOString(),
  });
}
