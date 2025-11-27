/**
 * Hook para rastrear eventos de conversão no pixel Utmify
 * Pixel ID: 68f824a9079b2e60c11eb824
 * Rastreia cliques em botões de checkout e compra
 * Inclui dados de UTM em todos os eventos para rastreamento completo
 */

import { useUTMCapture } from './useUTMCapture';

export const usePixelTracking = () => {
  // Capturar UTMs da URL
  const { getActiveUTM } = useUTMCapture();

  /**
   * Rastreia um evento de checkout iniciado (IC) no Utmify
   * Com retry logic para garantir que o evento seja disparado
   * Inclui dados de UTM no evento
   * @param planName - Nome do plano/produto
   * @param price - Preço do plano/produto
   * @param onComplete - Callback quando o evento for disparado (para fazer redirect)
   */
  const trackCheckoutClick = (
    planName: string,
    price?: number,
    onComplete?: () => void
  ) => {
    try {
      let retries = 0;
      const maxRetries = 15; // Aumentado para 15 tentativas (1.5 segundos)

      const attemptTrack = () => {
        if (window.utmifyTrack) {
          // Obter parâmetros UTM ativos
          const utm = getActiveUTM();

          console.log('[Utmify] Tentando disparar InitiateCheckout...', {
            planName,
            price,
            utm_source: utm.utm_source,
            utm_campaign: utm.utm_campaign,
          });

          // Usar nome de evento padrão para IC (Initiated Checkout)
          // ✅ IMPORTANTE: Passar UTMs no evento para a Utmify
          try {
            window.utmifyTrack('InitiateCheckout', {
              product: planName,
              value: price,
              currency: 'BRL',
              timestamp: new Date().toISOString(),
              // ✅ DADOS DE UTM - CRÍTICO PARA RASTREAMENTO
              utm_source: utm.utm_source,
              utm_medium: utm.utm_medium,
              utm_campaign: utm.utm_campaign,
              utm_content: utm.utm_content,
              utm_term: utm.utm_term,
            });

            console.log(`✅ [Utmify] InitiateCheckout disparado com sucesso - ${planName} - R$${price}`, {
              utm_source: utm.utm_source,
              utm_medium: utm.utm_medium,
              utm_campaign: utm.utm_campaign,
              utm_content: utm.utm_content,
              utm_term: utm.utm_term,
            });

            // Se onComplete foi fornecido, chamar com delay pequeno (100ms) para garantir registro
            if (onComplete) {
              setTimeout(onComplete, 100);
            }
          } catch (trackError) {
            console.error('[Utmify] Erro ao chamar window.utmifyTrack:', trackError);
            // Mesmo com erro, executar callback
            if (onComplete) {
              setTimeout(onComplete, 50);
            }
          }
        } else if (retries < maxRetries) {
          // Retry a cada 100ms até 1.5 segundos
          retries++;
          console.log(`[Utmify] Aguardando window.utmifyTrack... tentativa ${retries}/${maxRetries}`);
          setTimeout(attemptTrack, 100);
        } else {
          // Se após 15 tentativas ainda não estiver pronto, continuar mesmo assim
          console.warn('[Utmify] Falha ao disparar InitiateCheckout após 15 tentativas - window.utmifyTrack não disponível');
          console.warn('[Utmify] Continuando com redirect mesmo sem rastreamento');
          if (onComplete) {
            onComplete();
          }
        }
      };

      attemptTrack();
    } catch (error) {
      console.error('[Pixel Tracking Error]', error);
      // Mesmo com erro geral, executar callback
      if (onComplete) {
        onComplete();
      }
    }
  };

  /**
   * Rastreia abertura de checkout COM garantia de disparo antes do redirect
   * Use esta função ao invés de trackCheckoutClick diretamente
   */
  const trackCheckoutOpen = (planName: string, price?: number, redirectUrl?: string) => {
    trackCheckoutClick(planName, price, () => {
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    });
  };

  /**
   * Rastreia clique em botão de compra de produto especial
   */
  const trackProductClick = (productName: string, price?: number, redirectUrl?: string) => {
    trackCheckoutOpen(productName, price, redirectUrl);
  };

  return {
    trackCheckoutOpen,
    trackProductClick,
    trackCheckoutClick, // Exportar também para uso direto se precisar
  };
};

// Type augmentation para window
declare global {
  interface Window {
    utmifyTrack?: (eventName: string, data: Record<string, any>) => void
    pixelId?: string
  }
}
