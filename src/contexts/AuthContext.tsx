import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  nome?: string;
  active_plan_id: number;
  has_lifetime_access: boolean;
  is_admin: boolean;
  avatar_url?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  currentPlan: number;
  hasLifetimeAccess: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nome: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasAccessToFeature: (feature: 'atividades' | 'videos' | 'bonus' | 'papercrafts' | 'comunidade' | 'suporte_vip') => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [lastKnownAdminStatus, setLastKnownAdminStatus] = useState<Map<string, boolean>>(new Map());

  // Determinar se usuário deve ser admin (múltiplas estratégias com localStorage cache)
  const isUserAdmin = (user: User, lastKnownStatus?: boolean): boolean => {
    // 1. Verificar JWT claims / user_metadata
    if (user.user_metadata?.is_admin === true) return true;
    if (user.app_metadata?.roles?.includes('admin')) return true;

    // 2. Verificar custom claims em JWT
    const jwtPayload = user.user_metadata as any;
    if (jwtPayload?.admin === true || jwtPayload?.role === 'admin') return true;

    // 3. Verificar localStorage cache (persiste entre page reloads)
    try {
      const cachedAdminStatus = localStorage.getItem(`admin_status_${user.id}`);
      if (cachedAdminStatus === 'true') {
        return true;
      }
    } catch (e) {
      // localStorage pode não estar disponível em alguns contextos
    }

    // 4. Se já foi admin antes (in-memory cache), manter status
    if (lastKnownStatus === true) {
      return true;
    }

    // 5. Email admin (fallback final para email específico)
    const adminEmails = ['admin@edukaprime.com', 'miguel@edukaprime.com', 'joia@hotmail.com'];
    if (user.email && adminEmails.includes(user.email.toLowerCase())) {
      return true;
    }

    return false;
  };

  // Helper para guardar admin status em localStorage
  const cacheAdminStatus = (userId: string, isAdmin: boolean) => {
    try {
      if (isAdmin) {
        localStorage.setItem(`admin_status_${userId}`, 'true');
      } else {
        localStorage.removeItem(`admin_status_${userId}`);
      }
    } catch (e) {
      // localStorage pode não estar disponível
    }
  };

  // Buscar active_plan_id dinamicamente (prefere subscriptions pagas, fallback para active_plan_id do users)
  const fetchActivePlanFromSubscriptions = async (userId: string, fallbackPlanId: number = 0): Promise<number> => {
    try {
      const { data, error } = await supabase.rpc('get_user_subscriptions', { p_user_id: userId });

      if (error) {
        return fallbackPlanId;
      }

      if (data && data.length > 0) {
        return data[0].plan_id;
      }

      return fallbackPlanId;
    } catch (error) {
      return fallbackPlanId;
    }
  };

  const createUserProfile = async (user: User, forceRefresh: boolean = false) => {
    // Se já está buscando perfil e não é refresh forçado, pular
    if (fetchingProfile && !forceRefresh) {
      return;
    }

    try {
      setFetchingProfile(true);

      // Query com timeout de 5 segundos (força resposta)
      const queryPromise = supabase
        .from('users')
        .select('id, email, is_admin, active_plan_id, has_lifetime_access')
        .eq('id', user.id)
        .maybeSingle();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout (Supabase não respondeu em 5s)')), 5000)
      );

      let data, error;
      try {
        const result = await Promise.race([queryPromise, timeoutPromise]);
        data = result?.data;
        error = result?.error;
      } catch (timeoutError) {
        error = timeoutError;
        data = null;
      }

      if (error) {
        // Tentar query ainda mais simples (só ID e email)
        try {
          const { data: simpleData, error: simpleError } = await Promise.race([
            supabase
              .from('users')
              .select('id, email, nome, is_admin')
              .eq('id', user.id)
              .maybeSingle(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Query timeout')), 2000)
            )
          ]) as any;

          if (simpleData) {
            setProfile({
              id: simpleData.id,
              email: simpleData.email,
              nome: simpleData.nome || 'Usuário',
              active_plan_id: 0,
              has_lifetime_access: false,
              is_admin: simpleData.is_admin || false,
              avatar_url: user.user_metadata?.avatar_url || null,
            });
            return;
          }
        } catch (fallbackError) {
          // Fallback silencioso
        }

        // Criar perfil básico mesmo se falhar
        // Usar múltiplas estratégias para determinar admin (localStorage, in-memory cache, JWT, email)
        const lastKnownAdmin = lastKnownAdminStatus.get(user.id);
        const adminStatus = isUserAdmin(user, lastKnownAdmin);

        const basicProfile: UserProfile = {
          id: user.id,
          email: user.email || '',
          nome: user.email?.split('@')[0] || 'Usuário',
          active_plan_id: 0,
          has_lifetime_access: false,
          is_admin: adminStatus,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        };
        setProfile(basicProfile);

        // Cachear o status determinado
        if (adminStatus) {
          cacheAdminStatus(user.id, true);
          setLastKnownAdminStatus(prev => new Map(prev).set(user.id, true));
        }
        return;
      }

      if (data) {
        const existingProfile = data as UserProfile;

        // Garantir que avatar_url é preservado do user metadata se não tiver no banco
        const profileWithAvatar: UserProfile = {
          ...existingProfile,
          avatar_url: existingProfile.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        };
        setProfile(profileWithAvatar);

        // Cachear admin status bem-sucedido (localStorage + in-memory)
        cacheAdminStatus(user.id, existingProfile.is_admin);
        setLastKnownAdminStatus(prev => new Map(prev).set(user.id, existingProfile.is_admin));
      } else {
        const newProfile: UserProfile = {
          id: user.id,
          email: user.email || '',
          nome: user.email?.split('@')[0] || 'Usuário',
          active_plan_id: 0,
          has_lifetime_access: false,
          is_admin: false,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        };
        setProfile(newProfile);
        cacheAdminStatus(user.id, false);
      }
    } catch (error) {
      // Criar perfil mínimo para não travar
      const lastKnownAdmin = lastKnownAdminStatus.get(user.id);
      const adminStatus = isUserAdmin(user, lastKnownAdmin);

      const fallbackProfile: UserProfile = {
        id: user.id,
        email: user.email || '',
        nome: user.email?.split('@')[0] || 'Usuário',
        active_plan_id: 0,
        has_lifetime_access: false,
        is_admin: adminStatus,
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      };
      setProfile(fallbackProfile);

      // Cachear se conseguimos determinar admin
      if (adminStatus) {
        cacheAdminStatus(user.id, true);
        setLastKnownAdminStatus(prev => new Map(prev).set(user.id, true));
      }
    } finally {
      setFetchingProfile(false);
    }
  };

  useEffect(() => {
    // Flag para saber se é a primeira vez
    let isFirstLoad = true;
    let lastProcessedUserId = '';
    let isProcessing = false;

    // Timeout obrigatório para nunca ficar em loading infinito
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 12000); // 12 segundos máximo (aumentado de 6s)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // ⚠️ GUARD: Ignorar eventos duplicados para evitar logout acidental
      // Se o mesmo usuário já está processando, não processar novamente
      if (isProcessing && lastProcessedUserId === session?.user?.id) {
        return;
      }

      // Se não há sessão e já processamos logout, não processar novamente
      if (!session?.user && !lastProcessedUserId) {
        return;
      }

      isProcessing = true;
      try {
        // Sempre atualizar session e user
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          lastProcessedUserId = session.user.id;

          // Carregar profile do usuário
          await createUserProfile(session.user);

          // ═══════════════════════════════════════════════════════════════════════════
          // Ativar pending_plans se houver (com timeout)
          // ═══════════════════════════════════════════════════════════════════════════
          if (session.user.email) {
            // ⚠️ DESABILITAR: Essas RPCs não existem no banco de dados (retornam 404/400)
            // Causam loop infinito ao tentar entrar no admin
            // Será reativado quando as migrations forem criadas

            /*
            try {
              console.log('⏳ Verificando planos pendentes...');

              // Usar Promise.race com timeout para não travar
              const pendingResult = await Promise.race([
                supabase.rpc('activate_pending_plans', {
                  user_id: session.user.id,
                  user_email: session.user.email.toLowerCase()
                }).then(result => result.data),
                new Promise((_, reject) =>
                  setTimeout(() => reject(new Error('RPC timeout')), 2000)
                ) as Promise<any>
              ]);

              if (pendingResult && pendingResult.length > 0) {
                const { activated_count } = pendingResult[0];
                if (activated_count > 0) {
                  console.log(`✅ ${activated_count} plano(s) ativado(s)!`);
                  await createUserProfile(session.user, true);
                }
              }
            } catch (error) {
              console.warn('⚠️ Erro ao ativar pending_plans (continuar mesmo assim):', error);
              // Não falhar o login
            }

            // ═══════════════════════════════════════════════════════════════════════════
            // NOVO: Verificar planos expirados (lazy expiration)
            // ═══════════════════════════════════════════════════════════════════════════
            try {
              console.log('⏳ Verificando planos expirados...');

              // Usar Promise.race com timeout para não travar
              const expireResult = await Promise.race([
                supabase.rpc('expire_plans_if_needed', {
                  p_user_id: session.user.id
                }).then(result => result.data),
                new Promise((_, reject) =>
                  setTimeout(() => reject(new Error('RPC timeout')), 2000)
                ) as Promise<any>
              ]);

              if (expireResult && expireResult.length > 0) {
                const { expired_count, new_plan_id } = expireResult[0];
                if (expired_count > 0) {
                  console.log(`✅ ${expired_count} plano(s) expirado(s)! Novo plano: ${new_plan_id}`);
                  // Recarregar perfil para refletir mudança de plano
                  await createUserProfile(session.user, true);
                }
              }
            } catch (error) {
              console.warn('⚠️ Erro ao verificar expiração (continuar mesmo assim):', error);
              // Não falhar o login
            }
            */
          }
        } else {
          lastProcessedUserId = '';
          setProfile(null);
        }
      } catch (error) {
        // Silent fail - perfil fallback já criado em createUserProfile
      } finally {
        isProcessing = false;
        // Sempre sair do loading na primeira vez
        if (isFirstLoad) {
          clearTimeout(loadingTimeout);
          setLoading(false);
          isFirstLoad = false;
        }
      }
    });

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const redirectUrl = window.location.origin;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });

    if (error) throw error;
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
  };

  const signUp = async (email: string, password: string, nome: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: nome
        }
      }
    });

    if (error) throw error;

    if (data.user) {
      await createUserProfile(data.user);

      try {
        const { data: pendingResult, error: pendingError } = await supabase.rpc(
          'activate_pending_plans',
          {
            user_id: data.user.id,
            user_email: email.toLowerCase()
          }
        );

        if (!pendingError && pendingResult && pendingResult.length > 0) {
          const { activated_count } = pendingResult[0];
          if (activated_count > 0) {
            await createUserProfile(data.user, true);
          }
        }
      } catch (error) {
        // Silent fail
      }

      try {
        const { data: expireResult, error: expireError } = await supabase.rpc(
          'expire_plans_if_needed',
          {
            p_user_id: data.user.id
          }
        );

        if (!expireError && expireResult && expireResult.length > 0) {
          const { expired_count } = expireResult[0];
          if (expired_count > 0) {
            await createUserProfile(data.user, true);
          }
        }
      } catch (error) {
        // Silent fail
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // Verificar acesso a um feature (async - consulta o banco)
  const hasAccessToFeature = async (
    feature: 'atividades' | 'videos' | 'bonus' | 'papercrafts' | 'comunidade' | 'suporte_vip'
  ): Promise<boolean> => {
    // 1. Admin tem acesso total
    if (profile?.is_admin) return true;

    // 2. Se tem acesso vitalício, libera tudo
    if (profile?.has_lifetime_access) return true;

    // 3. Consultar banco se usuário tem acesso a este feature
    if (!user?.id) return false;

    try {
      const { data, error } = await supabase.rpc('user_has_feature_access', {
        p_user_id: user.id,
        p_feature_name: feature,
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      return false;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await createUserProfile(user, true); // forceRefresh = true
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      isAdmin: profile?.is_admin || false,
      currentPlan: profile?.active_plan_id || 0,
      hasLifetimeAccess: profile?.has_lifetime_access || false,
      signInWithGoogle,
      signInWithEmail,
      signUp,
      signOut,
      hasAccessToFeature,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
