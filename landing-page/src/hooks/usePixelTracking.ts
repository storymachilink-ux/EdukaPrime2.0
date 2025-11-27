/**
 * Hook para rastrear eventos de conversão no pixel Utmify
 * Pixel ID: 68f824a9079b2e60c11eb824
 * Rastreia cliques em botões de checkout e compra
 */

export const usePixelTracking = () => {
  /**
   * Rastreia um evento de clique em botão de checkout/compra
   * @param planName - Nome do plano/produto (ex: 'essencial', 'evoluir', 'prime')
   * @param price - Preço do plano/produto
   */
  const trackCheckoutClick = (planName: string, price?: number) => {
    try {
      // Trigger Utmify pixel event
      if (window.utmifyTrack) {
        window.utmifyTrack('checkout_clicked', {
          plan: planName,
          price: price,
          timestamp: new Date().toISOString(),
        })
      }

      console.log(`[Utmify Pixel] Checkout clicked - Plan: ${planName}, Price: ${price}`)
    } catch (error) {
      console.error('[Pixel Tracking Error]', error)
    }
  }

  /**
   * Rastreia abertura de checkout
   */
  const trackCheckoutOpen = (planName: string, price?: number) => {
    trackCheckoutClick(planName, price)
  }

  /**
   * Rastreia clique em botão de compra de produto especial
   */
  const trackProductClick = (productName: string, price?: number) => {
    trackCheckoutClick(productName, price)
  }

  return {
    trackCheckoutOpen,
    trackProductClick,
  }
}

// Type augmentation para window
declare global {
  interface Window {
    utmifyTrack?: (eventName: string, data: Record<string, any>) => void
    pixelId?: string
  }
}
