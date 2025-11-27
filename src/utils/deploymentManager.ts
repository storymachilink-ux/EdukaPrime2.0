/**
 * Deployment Manager - Gerencia invalidação de cache e sessões entre deploys
 */

// Versão da aplicação - IMPORTANTE: Atualize este número a cada deploy
export const APP_VERSION = '1.0.0';

// Chaves para storage
const STORAGE_KEYS = {
  APP_VERSION: 'edukaprime_app_version',
  SESSION_VALID: 'edukaprime_session_valid',
  LAST_CHECK: 'edukaprime_last_version_check'
} as const;

export class DeploymentManager {
  /**
   * Verifica se a versão da aplicação mudou desde o último acesso
   */
  static checkVersionCompatibility(): boolean {
    try {
      const storedVersion = localStorage.getItem(STORAGE_KEYS.APP_VERSION);
      const currentVersion = APP_VERSION;

      console.log('🔍 [VERSION CHECK]', {
        stored: storedVersion,
        current: currentVersion,
        isFirstVisit: !storedVersion
      });

      // Se não há versão armazenada (primeira visita), armazenar atual
      if (!storedVersion) {
        localStorage.setItem(STORAGE_KEYS.APP_VERSION, currentVersion);
        localStorage.setItem(STORAGE_KEYS.SESSION_VALID, 'true');
        return true;
      }

      // Se as versões são diferentes, houve deploy
      if (storedVersion !== currentVersion) {
        console.log('🚨 [VERSION MISMATCH] Deploy detectado, invalidando sessões...');
        this.handleVersionMismatch(storedVersion, currentVersion);
        return false;
      }

      // Versões iguais, tudo OK
      return true;
    } catch (error) {
      console.error('❌ [VERSION CHECK ERROR]', error);
      // Em caso de erro, assumir que precisa resetar
      this.forceReset();
      return false;
    }
  }

  /**
   * Lida com incompatibilidade de versão (novo deploy detectado)
   */
  private static handleVersionMismatch(oldVersion: string, newVersion: string): void {
    console.log(`🔄 [DEPLOY DETECTED] ${oldVersion} → ${newVersion}`);

    // Limpar todos os dados relacionados à sessão
    this.clearAllUserData();

    // Atualizar para nova versão
    localStorage.setItem(STORAGE_KEYS.APP_VERSION, newVersion);
    localStorage.setItem(STORAGE_KEYS.SESSION_VALID, 'false');

    // Mostrar notificação para o usuário
    this.showUpdateNotification();
  }

  /**
   * Limpa todos os dados do usuário mantendo apenas configurações essenciais
   */
  static clearAllUserData(): void {
    console.log('🧹 [CLEARING USER DATA] Limpando dados de sessão...');

    // Lista de itens a preservar (configurações que podem persistir)
    const itemsToPreserve = [
      'theme', // Tema escuro/claro
      'language', // Idioma preferido
      STORAGE_KEYS.APP_VERSION, // Versão da app
      STORAGE_KEYS.LAST_CHECK // Último check de versão
    ];

    // Obter todos os itens do localStorage
    const allItems: { [key: string]: string } = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        allItems[key] = localStorage.getItem(key) || '';
      }
    }

    // Limpar tudo
    localStorage.clear();
    sessionStorage.clear();

    // Restaurar apenas itens preservados
    itemsToPreserve.forEach(key => {
      if (allItems[key] !== undefined) {
        localStorage.setItem(key, allItems[key]);
      }
    });

    console.log('✅ [USER DATA CLEARED] Dados de sessão limpos, configurações preservadas');
  }

  /**
   * Reset forçado em caso de erro
   */
  private static forceReset(): void {
    console.log('⚠️ [FORCE RESET] Resetando aplicação devido a erro...');
    this.clearAllUserData();
    localStorage.setItem(STORAGE_KEYS.APP_VERSION, APP_VERSION);
    localStorage.setItem(STORAGE_KEYS.SESSION_VALID, 'false');
  }

  /**
   * Mostra notificação sobre atualização da aplicação
   */
  private static showUpdateNotification(): void {
    // Criar notificação toast
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #F59E0B, #D97706);
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        z-index: 10000;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        font-weight: 500;
        max-width: 350px;
        animation: slideIn 0.3s ease-out;
      ">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 18px;">🚀</span>
          <div>
            <div style="font-weight: 600; margin-bottom: 4px;">
              EdukaPrime foi atualizado!
            </div>
            <div style="font-size: 12px; opacity: 0.9;">
              Faça login novamente para acessar as novas funcionalidades.
            </div>
          </div>
        </div>
      </div>
      <style>
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      </style>
    `;

    document.body.appendChild(notification);

    // Remover após 5 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 5000);
  }

  /**
   * Verifica se a sessão atual é válida
   */
  static isSessionValid(): boolean {
    return localStorage.getItem(STORAGE_KEYS.SESSION_VALID) === 'true';
  }

  /**
   * Marca sessão como válida (chamado após login bem-sucedido)
   */
  static markSessionAsValid(): void {
    localStorage.setItem(STORAGE_KEYS.SESSION_VALID, 'true');
    console.log('✅ [SESSION VALID] Sessão marcada como válida');
  }

  /**
   * Invalida sessão atual
   */
  static invalidateSession(): void {
    localStorage.setItem(STORAGE_KEYS.SESSION_VALID, 'false');
    console.log('❌ [SESSION INVALID] Sessão invalidada');
  }

  /**
   * Força atualização da página para aplicar mudanças
   */
  static forceRefresh(): void {
    console.log('🔄 [FORCE REFRESH] Atualizando página...');
    window.location.reload();
  }

  /**
   * Obtém informações de versão para debug
   */
  static getVersionInfo() {
    return {
      currentVersion: APP_VERSION,
      storedVersion: localStorage.getItem(STORAGE_KEYS.APP_VERSION),
      sessionValid: this.isSessionValid(),
      lastCheck: localStorage.getItem(STORAGE_KEYS.LAST_CHECK)
    };
  }
}

// Auto-execução na importação do módulo
console.log('🚀 [DEPLOYMENT MANAGER] Iniciando verificação de versão...');
const isCompatible = DeploymentManager.checkVersionCompatibility();

if (!isCompatible) {
  console.log('⚠️ [DEPLOYMENT MANAGER] Versão incompatível detectada');
}