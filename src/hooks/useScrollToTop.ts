import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook que faz scroll automático para o topo da página
 * quando há navegação entre rotas
 */
export function useScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    // Scroll para o topo da página
    window.scrollTo(0, 0);

    // Alternativa: usar smooth scroll (remova a linha acima se preferir)
    // window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);
}
