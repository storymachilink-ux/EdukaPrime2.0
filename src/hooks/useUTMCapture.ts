/**
 * Hook para capturar, validar e armazenar parâmetros UTM
 * Centraliza a captura de UTMs em um único lugar
 * Persiste os dados em localStorage para uso entre sessões
 */

interface UTMParams {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
}

const UTM_STORAGE_KEY = 'eduka_utm_params';
const DEFAULT_UTM_PARAMS: UTMParams = {
  utm_source: 'organic',
  utm_medium: '',
  utm_campaign: '',
  utm_content: '',
  utm_term: '',
};

/**
 * Captura parâmetros UTM da URL atual
 * @returns Objeto com parâmetros UTM capturados
 */
export const captureUTMFromURL = (): UTMParams => {
  try {
    const params = new URLSearchParams(window.location.search);

    return {
      utm_source: params.get('utm_source') || DEFAULT_UTM_PARAMS.utm_source,
      utm_medium: params.get('utm_medium') || DEFAULT_UTM_PARAMS.utm_medium,
      utm_campaign: params.get('utm_campaign') || DEFAULT_UTM_PARAMS.utm_campaign,
      utm_content: params.get('utm_content') || DEFAULT_UTM_PARAMS.utm_content,
      utm_term: params.get('utm_term') || DEFAULT_UTM_PARAMS.utm_term,
    };
  } catch (error) {
    console.error('[UTM Capture Error]', error);
    return DEFAULT_UTM_PARAMS;
  }
};

/**
 * Armazena parâmetros UTM no localStorage
 * @param params Parâmetros UTM a armazenar
 */
export const storeUTMParams = (params: UTMParams): void => {
  try {
    localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(params));
    console.log('[UTM Storage] Parâmetros UTM armazenados:', params);
  } catch (error) {
    console.error('[UTM Storage Error]', error);
  }
};

/**
 * Recupera parâmetros UTM do localStorage
 * @returns Parâmetros UTM armazenados ou padrões
 */
export const getStoredUTMParams = (): UTMParams => {
  try {
    const stored = localStorage.getItem(UTM_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('[UTM Retrieve] Parâmetros UTM recuperados:', parsed);
      return parsed;
    }
  } catch (error) {
    console.error('[UTM Retrieve Error]', error);
  }
  return DEFAULT_UTM_PARAMS;
};

/**
 * Limpa parâmetros UTM do localStorage
 */
export const clearUTMParams = (): void => {
  try {
    localStorage.removeItem(UTM_STORAGE_KEY);
    console.log('[UTM Clear] Parâmetros UTM limpos');
  } catch (error) {
    console.error('[UTM Clear Error]', error);
  }
};

/**
 * Hook para usar no React
 * Captura UTMs da URL na primeira renderização e fornece métodos para acessá-las
 */
export const useUTMCapture = () => {
  // Capturar UTMs da URL ao montar o hook
  const utmParams = captureUTMFromURL();

  // Se houver UTMs na URL, armazenar no localStorage
  if (utmParams.utm_source !== DEFAULT_UTM_PARAMS.utm_source ||
      utmParams.utm_medium ||
      utmParams.utm_campaign) {
    storeUTMParams(utmParams);
  }

  return {
    // Parâmetros UTM capturados da URL atual
    currentUTM: utmParams,

    // Parâmetros UTM armazenados (para redireccionamentos)
    storedUTM: getStoredUTMParams(),

    // Função para obter UTM ativo (prioriza URL > localStorage > padrão)
    getActiveUTM: () => {
      const urlUTM = captureUTMFromURL();
      // Se houver UTM na URL, usar; senão usar do localStorage
      return (urlUTM.utm_source !== DEFAULT_UTM_PARAMS.utm_source || urlUTM.utm_campaign)
        ? urlUTM
        : getStoredUTMParams();
    },

    // Função para limpar UTMs armazenadas
    clearUTM: clearUTMParams,
  };
};

export type { UTMParams };
