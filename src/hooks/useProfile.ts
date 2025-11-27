import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  phone?: string;
  institution?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface UseProfileReturn {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<Profile>) => Promise<boolean>;
  changePassword: (newPassword: string) => Promise<boolean>;
}

export const useProfile = (): UseProfileReturn => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user profile on mount
  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Try to get profile from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 = not found, which is ok for new users
        throw profileError;
      }

      // Create profile object with user data and profile data
      const userProfile: Profile = {
        id: user.id,
        phone: profileData?.phone || user.phone || '',
        institution: profileData?.institution || '',
        avatar_url: profileData?.avatar_url || '',
        created_at: user.created_at,
        updated_at: profileData?.updated_at || user.created_at
      };

      // If no profile exists, create one
      if (!profileData) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            phone: user.phone || '',
            institution: '',
            avatar_url: ''
          }]);

        if (insertError) {
          console.warn('Could not create profile:', insertError);
          // Continue without profile data
        }
      }

      setProfile(userProfile);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar perfil');

      // Fallback to user data only
      if (user) {
        setProfile({
          id: user.id,
          phone: user.phone || '',
          institution: '',
          avatar_url: '',
          created_at: user.created_at
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<boolean> => {
    if (!user || !profile) return false;

    try {
      setLoading(true);
      setError(null);

      // Update profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...updates,
          updated_at: new Date().toISOString()
        });

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null);

      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar perfil');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (newPassword: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      return true;
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err instanceof Error ? err.message : 'Erro ao alterar senha');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    changePassword
  };
};