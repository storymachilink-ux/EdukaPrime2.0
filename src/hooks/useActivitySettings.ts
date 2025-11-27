import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface ActivitySetting {
  id: string;
  activity_id: string;
  drive_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UseActivitySettingsReturn {
  settings: Record<string, ActivitySetting>;
  loading: boolean;
  error: string | null;
  updateActivityUrl: (activityId: string, driveUrl: string) => Promise<boolean>;
  toggleActivityStatus: (activityId: string, isActive: boolean) => Promise<boolean>;
  refreshSettings: () => Promise<void>;
}

export const useActivitySettings = (): UseActivitySettingsReturn => {
  const [settings, setSettings] = useState<Record<string, ActivitySetting>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar configurações das atividades base
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('activity_settings')
        .select('*');

      if (error) throw error;

      // Converter array em objeto indexado por activity_id
      const settingsMap: Record<string, ActivitySetting> = {};
      data?.forEach(setting => {
        settingsMap[setting.activity_id] = setting;
      });

      setSettings(settingsMap);
    } catch (err: any) {
      console.error('Erro ao buscar configurações:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Atualizar URL de uma atividade base
  const updateActivityUrl = async (activityId: string, driveUrl: string): Promise<boolean> => {
    try {
      setError(null);

      const { error } = await supabase
        .from('activity_settings')
        .upsert({
          activity_id: activityId,
          drive_url: driveUrl,
          is_active: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'activity_id'
        });

      if (error) throw error;

      // Atualizar estado local
      setSettings(prev => ({
        ...prev,
        [activityId]: {
          activity_id: activityId,
          drive_url: driveUrl,
          is_active: true,
          updated_at: new Date().toISOString()
        }
      }));

      return true;
    } catch (err: any) {
      console.error('Erro ao atualizar URL:', err);
      setError(err.message);
      return false;
    }
  };

  // Ativar/Desativar uma atividade base
  const toggleActivityStatus = async (activityId: string, isActive: boolean): Promise<boolean> => {
    try {
      setError(null);

      const { error } = await supabase
        .from('activity_settings')
        .upsert({
          activity_id: activityId,
          drive_url: settings[activityId]?.drive_url || '',
          is_active: isActive,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'activity_id'
        });

      if (error) throw error;

      // Atualizar estado local
      setSettings(prev => ({
        ...prev,
        [activityId]: {
          ...prev[activityId],
          is_active: isActive,
          updated_at: new Date().toISOString()
        }
      }));

      return true;
    } catch (err: any) {
      console.error('Erro ao alterar status:', err);
      setError(err.message);
      return false;
    }
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  return {
    settings,
    loading,
    error,
    updateActivityUrl,
    toggleActivityStatus,
    refreshSettings
  };
};