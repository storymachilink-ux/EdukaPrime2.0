import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

type AuthStatus = 'checking' | 'authenticated' | 'anonymous';

type Profile = {
  id: string;
  email: string;
  nome: string | null;
  is_admin: boolean | null;
  active_plan_id: number | null;
  has_lifetime_access: boolean | null;
  avatar_url: string | null;
};

type AuthContextValue = {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  currentPlan: number;
  hasLifetimeAccess: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nome: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasAccessToFeature: (feature: 'atividades' | 'videos' | 'bonus' | 'papercrafts' | 'comunidade' | 'suporte_vip') => Promise<boolean>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>('checking');
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  // 🆕 Ativar planos pendentes após login/signup
  async function activatePendingPlans(userId: string, userEmail: string) {
    try {
      const { data, error } = await supabase.rpc('activate_pending_plans', {
        p_user_id: userId,
        p_user_email: userEmail,
      });

      if (error) {
        console.warn('[AuthContext] Erro ao ativar pending_plans:', error);
        return;
      }

      const result = data?.[0] || { total_activated: 0, last_plan_id: 0 };
      const { total_activated } = result;

      if (total_activated > 0) {
        console.log(`[AuthContext] ✅ ${total_activated} plano(s) ativado(s) com sucesso.`);
      }
    } catch (err) {
      console.error('[AuthContext] Exceção ao ativar pending_plans:', err);
    }
  }

  async function loadProfile(currentUser: User) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, nome, is_admin, active_plan_id, has_lifetime_access, avatar_url')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (error) {
        console.error('[AuthContext] Erro ao carregar profile:', error);
        return;
      }

      setProfile(data as Profile);

      // 🆕 Ativar planos pendentes após carregar profile
      if (data?.email) {
        await activatePendingPlans(currentUser.id, data.email);
      }
    } catch (err) {
      console.error('[AuthContext] Exceção ao carregar profile:', err);
    }
  }

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (error) {
        console.error('[AuthContext] getSession error:', error);
      }

      const currentSession = data.session;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        setStatus('authenticated');
        await loadProfile(currentSession.user);
      } else {
        setStatus('anonymous');
      }
    };

    init();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!isMounted) return;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        setStatus('authenticated');
        loadProfile(currentSession.user);
      } else {
        setStatus('anonymous');
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      subscription?.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    if (error) throw error;
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, nome: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: nome } }
    });
    if (error) throw error;
    if (data.user) {
      await loadProfile(data.user);
      // 🆕 loadProfile já ativa pending_plans, mas podemos ser explícito para garantir
      await activatePendingPlans(data.user.id, email);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setStatus('anonymous');
  };

  const hasAccessToFeature = async (
    feature: 'atividades' | 'videos' | 'bonus' | 'papercrafts' | 'comunidade' | 'suporte_vip'
  ): Promise<boolean> => {
    if (profile?.is_admin) return true;
    if (profile?.has_lifetime_access) return true;
    if (!user?.id) return false;

    try {
      const { data, error } = await supabase.rpc('user_has_feature_access', {
        p_user_id: user.id,
        p_feature_name: feature,
      });
      if (error) throw error;
      return data || false;
    } catch {
      return false;
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    await loadProfile(user);
  };

  const value: AuthContextValue = {
    status,
    session,
    user,
    profile,
    isAdmin: !!profile?.is_admin,
    isAuthenticated: status === 'authenticated',
    currentPlan: profile?.active_plan_id || 0,
    hasLifetimeAccess: profile?.has_lifetime_access || false,
    signInWithGoogle,
    signInWithEmail,
    signUp,
    signOut: handleSignOut,
    hasAccessToFeature,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
