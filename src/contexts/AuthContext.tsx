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

  // Buscar active_plan_id dinamicamente (prefere subscriptions pagas, fallback para active_plan_id do users)
  const fetchActivePlanFromSubscriptions = async (userId: string, fallbackPlanId: number = 0): Promise<number> => {
    try {
      const { data, error } = await supabase.rpc('get_user_subscriptions', { p_user_id: userId });

      if (error) {
        console.warn('⚠️ Erro ao buscar subscriptions via RPC, usando fallback:', error.message);
        return fallbackPlanId;
      }

      if (data && data.length > 0) {
        const planId = data[0].plan_id;
        console.log(`✅ Plan ID carregado de subscription: ${planId}`);
        return planId;
      }

      console.log(`ℹ️ Nenhuma subscription ativa encontrada, usando fallback: ${fallbackPlanId}`);
      return fallbackPlanId;
    } catch (error) {
      console.error('❌ Erro ao buscar plan_id das subscriptions:', error);
      return fallbackPlanId;
    }
  };

  const createUserProfile = async (user: User, forceRefresh: boolean = false) => {
    // Se já está buscando perfil e não é refresh forçado, pular
    if (fetchingProfile && !forceRefresh) {
      console.log('⏭️ Já está buscando perfil, pulando...');
      return;
    }

    try {
      setFetchingProfile(true);
      console.log('👤 Buscando perfil para:', user.email);

      // Query com apenas os campos necessários (evita problemas de RLS)
      const { data, error } = await supabase
        .from('users')
        .select('id, email, nome, active_plan_id, has_lifetime_access, is_admin, avatar_url, created_at, updated_at, plano_ativo, status, user_metadata')
        .eq('id', user.id)
        .maybeSingle();

      console.log('👤 Query respondeu. Data:', !!data, 'Error:', !!error);

      if (error) {
        console.warn('⚠️ Erro ao buscar perfil:', error.message);
        // Criar perfil básico mesmo se falhar
        const basicProfile: UserProfile = {
          id: user.id,
          email: user.email || '',
          nome: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
          active_plan_id: 0,
          has_lifetime_access: false,
          is_admin: false,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        };
        setProfile(basicProfile);
        return;
      }

      if (data) {
        console.log('✅ Perfil encontrado em banco');
        const existingProfile = data as UserProfile;
        console.log('   Email:', existingProfile.email);
        console.log('   Nome:', existingProfile.nome);
        console.log('   Is Admin:', existingProfile.is_admin);
        setProfile(existingProfile);
      } else {
        console.log('➕ Criando novo perfil...');
        const newProfile: UserProfile = {
          id: user.id,
          email: user.email || '',
          nome: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
          active_plan_id: 0,
          has_lifetime_access: false,
          is_admin: false,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        };
        setProfile(newProfile);
        console.log('✅ Perfil criado');
      }
    } catch (error) {
      console.error('❌ Erro ao buscar/criar perfil:', error);
      // Criar perfil mínimo para não travar
      const fallbackProfile: UserProfile = {
        id: user.id,
        email: user.email || '',
        nome: user.email?.split('@')[0] || 'Usuário',
        active_plan_id: 0,
        has_lifetime_access: false,
        is_admin: false,
      };
      setProfile(fallbackProfile);
    } finally {
      setFetchingProfile(false);
    }
  };

  useEffect(() => {
    // Flag para saber se é a primeira vez
    let isFirstLoad = true;

    // Timeout obrigatório para nunca ficar em loading infinito
    const loadingTimeout = setTimeout(() => {
      console.warn('⚠️ Loading timeout - forçando saída do loading');
      setLoading(false);
    }, 6000); // 6 segundos máximo

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, 'Session:', session?.user?.email);

      try {
        // Sempre atualizar session e user
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Carregar profile do usuário
          await createUserProfile(session.user);

          // ═══════════════════════════════════════════════════════════════════════════
          // Ativar pending_plans se houver (com timeout)
          // ═══════════════════════════════════════════════════════════════════════════
          if (session.user.email) {
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
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('❌ Erro ao processar auth:', error);
      } finally {
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
    console.log('🔵 Iniciando Google OAuth com redirect:', redirectUrl);

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

    console.log('🔵 Resposta OAuth:', { data, error });
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

      // ═══════════════════════════════════════════════════════════════════════════
      // NOVO: Ativar pending_plans se houver planos pagos aguardando
      // ═══════════════════════════════════════════════════════════════════════════
      console.log('⏳ Verificando planos pendentes para:', data.user.email);

      try {
        const { data: pendingResult, error: pendingError } = await supabase.rpc(
          'activate_pending_plans',
          {
            user_id: data.user.id,
            user_email: email.toLowerCase()
          }
        );

        if (pendingError) {
          console.warn('⚠️ Erro ao ativar planos pendentes:', pendingError.message);
        } else if (pendingResult && pendingResult.length > 0) {
          const { activated_count, plan_id } = pendingResult[0];
          if (activated_count > 0) {
            console.log(`✅ ${activated_count} plano(s) ativado(s) automaticamente! Plan ID: ${plan_id}`);
            // Recarregar perfil com novo plano
            await createUserProfile(data.user, true);
          }
        }
      } catch (error) {
        console.error('❌ Erro ao processar pending_plans:', error);
        // Não lançar erro - usuário foi criado com sucesso mesmo se pending_plans falhar
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
      console.error(`❌ Erro ao verificar acesso a ${feature}:`, error);
      return false;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      console.log('🔄 Refreshing profile...');
      await createUserProfile(user, true); // forceRefresh = true
      console.log('✅ Profile refreshed');
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
