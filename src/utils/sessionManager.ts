/**
 * Session Manager - Gerencia logout automático e timer de sessão
 */

// Configurações
const SESSION_CONFIG = {
  MAX_DURATION: 24 * 60 * 60 * 1000, // 24 horas em ms
  CHECK_INTERVAL: 60 * 1000, // Verificar a cada 1 minuto
  STORAGE_KEYS: {
    SESSION_START: 'edukaprime_session_start',
    SESSION_VALID: 'edukaprime_session_valid',
    LAST_ACTIVITY: 'edukaprime_last_activity'
  }
} as const;

export class SessionManager {
  private static checkInterval: NodeJS.Timeout | null = null;
  private static isInitialized = false;

  /**
   * Inicia o gerenciamento de sessão
   */
  static initialize(): void {
    if (this.isInitialized) return;

    console.log('🔐 [SESSION MANAGER] Inicializando gerenciamento de sessão...');

    // Se existe marca de potencial refresh, remover (indica que a página carregou)
    const potentialRefresh = sessionStorage.getItem('edukaprime_potential_refresh');
    if (potentialRefresh === 'true') {
      console.log('🔄 [SESSION MANAGER] Página recarregou com sucesso - não era fechamento');
      sessionStorage.removeItem('edukaprime_potential_refresh');
    }

    // Configurar logout ao fechar navegador
    this.setupBrowserCloseDetection();

    // Configurar timer de sessão
    this.setupSessionTimer();

    // Verificar se sessão ainda é válida
    this.checkSessionValidity();

    this.isInitialized = true;
    console.log('✅ [SESSION MANAGER] Inicializado com sucesso');
  }

  /**
   * Configura detecção de fechamento do navegador
   */
  private static setupBrowserCloseDetection(): void {
    console.log('👀 [SESSION MANAGER] Configurando detecção de fechamento...');

    // Detectar quando a aba/navegador está sendo fechado
    // NOTA: Não invalidar sessão no beforeunload pois ele também dispara no refresh
    window.addEventListener('beforeunload', (event) => {
      console.log('🚪 [SESSION MANAGER] Evento beforeunload detectado');

      // Marcar temporariamente que pode ser um refresh
      sessionStorage.setItem('edukaprime_potential_refresh', 'true');

      // Não invalidar sessão aqui - pode ser apenas um refresh
      // A invalidação só acontecerá se a aba não recarregar em 5 segundos
      setTimeout(() => {
        // Se depois de 5 segundos ainda não houve reload, é fechamento real
        const potentialRefresh = sessionStorage.getItem('edukaprime_potential_refresh');
        if (potentialRefresh === 'true') {
          console.log('🚪 [SESSION MANAGER] Confirmado fechamento real do navegador');
          this.invalidateSession();
          sessionStorage.removeItem('edukaprime_potential_refresh');
        }
      }, 5000);
    });

    // Detectar quando a aba fica inativa por muito tempo
    let isVisible = true;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isVisible = false;
        console.log('👁️ [SESSION MANAGER] Aba ficou oculta');

        // Se ficar oculta por mais de 30 minutos, invalidar
        setTimeout(() => {
          if (!isVisible && document.hidden) {
            console.log('⏰ [SESSION MANAGER] Aba oculta por muito tempo, invalidando sessão...');
            this.invalidateSession();
            this.forceLogout('Sessão expirada por inatividade');
          }
        }, 30 * 60 * 1000); // 30 minutos
      } else {
        isVisible = true;
        console.log('👁️ [SESSION MANAGER] Aba ficou visível novamente');
        this.updateLastActivity();
      }
    });

    // Detectar atividade do usuário
    const activityEvents = ['click', 'keypress', 'scroll', 'mousemove'];
    const throttledUpdate = this.throttle(this.updateLastActivity.bind(this), 60000); // 1 minuto

    activityEvents.forEach(event => {
      document.addEventListener(event, throttledUpdate, { passive: true });
    });
  }

  /**
   * Configura timer de sessão de 24h
   */
  private static setupSessionTimer(): void {
    console.log('⏰ [SESSION MANAGER] Configurando timer de 24h...');

    // Verificar a cada minuto se a sessão expirou
    this.checkInterval = setInterval(() => {
      this.checkSessionValidity();
    }, SESSION_CONFIG.CHECK_INTERVAL);
  }

  /**
   * Verifica se a sessão ainda é válida
   */
  private static checkSessionValidity(): void {
    const sessionStart = localStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.SESSION_START);
    const sessionValid = localStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.SESSION_VALID);

    // Se não há sessão ativa, não fazer nada
    if (!sessionStart || sessionValid !== 'true') {
      return;
    }

    const startTime = parseInt(sessionStart);
    const currentTime = Date.now();
    const sessionDuration = currentTime - startTime;

    console.log('🔍 [SESSION MANAGER] Verificando validade da sessão...', {
      sessionDuration: Math.round(sessionDuration / 1000 / 60), // em minutos
      maxDuration: Math.round(SESSION_CONFIG.MAX_DURATION / 1000 / 60), // em minutos
      isValid: sessionDuration < SESSION_CONFIG.MAX_DURATION
    });

    // Se passou de 24h, expirar sessão
    if (sessionDuration > SESSION_CONFIG.MAX_DURATION) {
      console.log('⏰ [SESSION MANAGER] Sessão expirou após 24h');
      this.forceLogout('Sua sessão expirou após 24 horas por segurança');
    }
  }

  /**
   * Marca início de nova sessão
   */
  static startSession(): void {
    const now = Date.now();
    localStorage.setItem(SESSION_CONFIG.STORAGE_KEYS.SESSION_START, now.toString());
    localStorage.setItem(SESSION_CONFIG.STORAGE_KEYS.SESSION_VALID, 'true');
    localStorage.setItem(SESSION_CONFIG.STORAGE_KEYS.LAST_ACTIVITY, now.toString());

    console.log('🚀 [SESSION MANAGER] Nova sessão iniciada', {
      startTime: new Date(now).toLocaleString(),
      expiresAt: new Date(now + SESSION_CONFIG.MAX_DURATION).toLocaleString()
    });
  }

  /**
   * Invalida sessão atual
   */
  static invalidateSession(): void {
    localStorage.setItem(SESSION_CONFIG.STORAGE_KEYS.SESSION_VALID, 'false');
    console.log('❌ [SESSION MANAGER] Sessão invalidada');
  }

  /**
   * Atualiza última atividade
   */
  private static updateLastActivity(): void {
    const now = Date.now();
    localStorage.setItem(SESSION_CONFIG.STORAGE_KEYS.LAST_ACTIVITY, now.toString());
  }

  /**
   * Força logout com mensagem
   */
  private static forceLogout(reason: string): void {
    console.log('🚨 [SESSION MANAGER] Forçando logout:', reason);

    // Limpar dados
    this.invalidateSession();
    localStorage.clear();
    sessionStorage.clear();

    // Mostrar notificação
    this.showLogoutNotification(reason);

    // Recarregar página após um tempo
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  }

  /**
   * Mostra notificação de logout
   */
  private static showLogoutNotification(reason: string): void {
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #EF4444, #DC2626);
        color: white;
        padding: 24px 32px;
        border-radius: 16px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        z-index: 999999;
        font-family: system-ui, -apple-system, sans-serif;
        text-align: center;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
      ">
        <div style="font-size: 48px; margin-bottom: 16px;">⏰</div>
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">
          Sessão Expirada
        </div>
        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 16px;">
          ${reason}
        </div>
        <div style="font-size: 12px; opacity: 0.8;">
          Redirecionando em 3 segundos...
        </div>
      </div>
      <style>
        @keyframes slideIn {
          from { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
          to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      </style>
    `;

    document.body.appendChild(notification);
  }

  /**
   * Verifica se sessão é válida
   */
  static isSessionValid(): boolean {
    const sessionValid = localStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.SESSION_VALID);
    const sessionStart = localStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.SESSION_START);

    if (!sessionStart || sessionValid !== 'true') {
      return false;
    }

    const startTime = parseInt(sessionStart);
    const currentTime = Date.now();
    const sessionDuration = currentTime - startTime;

    return sessionDuration < SESSION_CONFIG.MAX_DURATION;
  }

  /**
   * Cleanup ao destruir
   */
  static cleanup(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isInitialized = false;
    console.log('🧹 [SESSION MANAGER] Cleanup realizado');
  }

  /**
   * Função de throttle para evitar muitas chamadas
   */
  private static throttle(func: Function, limit: number) {
    let inThrottle: boolean;
    return function(this: any) {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  }

  /**
   * Obtém informações da sessão para debug
   */
  static getSessionInfo() {
    const sessionStart = localStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.SESSION_START);
    const sessionValid = localStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.SESSION_VALID);
    const lastActivity = localStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.LAST_ACTIVITY);

    return {
      isValid: this.isSessionValid(),
      startTime: sessionStart ? new Date(parseInt(sessionStart)).toLocaleString() : null,
      lastActivity: lastActivity ? new Date(parseInt(lastActivity)).toLocaleString() : null,
      sessionValid: sessionValid === 'true',
      remainingTime: sessionStart ?
        Math.max(0, SESSION_CONFIG.MAX_DURATION - (Date.now() - parseInt(sessionStart))) : 0
    };
  }
}

// Auto-inicialização quando o módulo é importado
console.log('🔐 [SESSION MANAGER] Módulo carregado');
SessionManager.initialize();