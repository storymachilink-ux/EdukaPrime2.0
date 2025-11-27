import { useState, useEffect } from 'react';
import { BASE_ACTIVITIES, type BaseActivity } from '../data/baseActivities';
import { useActivitySettings } from './useActivitySettings';
import { useAtividades, type DatabaseAtividade } from './useDatabase';

// Combined activity interface that includes both base and custom activities
export interface HybridActivity {
  id: string;
  title: string;
  age_range: string;
  description: string;
  image: string;
  category: string;
  niche: string;
  drive_url: string;
  available_for_plans: number[];
  is_custom: boolean;
  is_active: boolean;
  order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UseHybridActivitiesReturn {
  activities: HybridActivity[];
  loading: boolean;
  error: string | null;
  baseActivities: HybridActivity[];
  customActivities: HybridActivity[];
  updateBaseActivityUrl: (activityId: string, driveUrl: string) => Promise<boolean>;
  toggleBaseActivityStatus: (activityId: string, isActive: boolean) => Promise<boolean>;
  addCustomActivity: (activity: Omit<DatabaseAtividade, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error: string | null }>;
  updateCustomActivity: (id: string, activity: Partial<DatabaseAtividade>) => Promise<{ error: string | null }>;
  deleteCustomActivity: (id: string) => Promise<{ error: string | null }>;
  refreshActivities: () => Promise<void>;
}

export const useHybridActivities = (): UseHybridActivitiesReturn => {
  const [combinedActivities, setCombinedActivities] = useState<HybridActivity[]>([]);
  const [overallLoading, setOverallLoading] = useState(true);
  const [overallError, setOverallError] = useState<string | null>(null);

  // Hooks for base activity settings and custom activities
  const { settings, loading: settingsLoading, error: settingsError, updateActivityUrl, toggleActivityStatus, refreshSettings } = useActivitySettings();
  const { atividades: customActivities, loading: customLoading, error: customError, addAtividade, updateAtividade, deleteAtividade } = useAtividades();

  // Convert base activities to hybrid format
  const convertBaseToHybrid = (baseActivity: BaseActivity, setting?: typeof settings[string]): HybridActivity => {
    return {
      id: baseActivity.id,
      title: baseActivity.title,
      age_range: baseActivity.age_range,
      description: baseActivity.description,
      image: baseActivity.image,
      category: baseActivity.category,
      niche: baseActivity.niche,
      drive_url: setting?.drive_url || baseActivity.default_drive_url,
      available_for_plans: baseActivity.available_for_plans,
      is_custom: false,
      is_active: setting?.is_active !== false, // Default to true if no setting
      order: baseActivity.order,
      created_at: setting?.created_at,
      updated_at: setting?.updated_at
    };
  };

  // Convert custom activities to hybrid format
  const convertCustomToHybrid = (customActivity: DatabaseAtividade): HybridActivity => {
    return {
      id: customActivity.id,
      title: customActivity.title,
      age_range: customActivity.age_range,
      description: customActivity.description,
      image: customActivity.image || '',
      category: customActivity.category,
      niche: customActivity.niche || customActivity.category,
      drive_url: customActivity.drive_url,
      available_for_plans: customActivity.available_for_plans,
      is_custom: true,
      is_active: true, // Custom activities are always active
      created_at: customActivity.created_at,
      updated_at: customActivity.updated_at
    };
  };

  // Combine all activities whenever data changes
  useEffect(() => {
    try {
      setOverallLoading(settingsLoading || customLoading);
      setOverallError(settingsError || customError);

      if (!settingsLoading && !customLoading) {
        // Convert base activities with their settings
        const baseHybridActivities = BASE_ACTIVITIES.map(baseActivity =>
          convertBaseToHybrid(baseActivity, settings[baseActivity.id])
        ).filter(activity => activity.is_active); // Only show active base activities

        // Convert custom activities
        const customHybridActivities = customActivities.map(convertCustomToHybrid);

        // Combine and sort: base activities first (by order), then custom activities (by creation date)
        const combined = [
          ...baseHybridActivities.sort((a, b) => (a.order || 0) - (b.order || 0)),
          ...customHybridActivities.sort((a, b) =>
            new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
          )
        ];

        setCombinedActivities(combined);
        setOverallLoading(false);
      }
    } catch (err: any) {
      setOverallError(err.message || 'Erro ao processar atividades');
      setOverallLoading(false);
    }
  }, [settings, settingsLoading, settingsError, customActivities, customLoading, customError]);

  // Separate base and custom activities for admin interface
  const baseActivities = combinedActivities.filter(activity => !activity.is_custom);
  const customActivitiesHybrid = combinedActivities.filter(activity => activity.is_custom);

  // Wrapper functions for managing base activities
  const updateBaseActivityUrl = async (activityId: string, driveUrl: string): Promise<boolean> => {
    const success = await updateActivityUrl(activityId, driveUrl);
    if (success) {
      await refreshSettings();
    }
    return success;
  };

  const toggleBaseActivityStatus = async (activityId: string, isActive: boolean): Promise<boolean> => {
    const success = await toggleActivityStatus(activityId, isActive);
    if (success) {
      await refreshSettings();
    }
    return success;
  };

  // Wrapper functions for managing custom activities
  const addCustomActivity = async (activity: Omit<DatabaseAtividade, 'id' | 'created_at' | 'updated_at'>) => {
    return await addAtividade(activity);
  };

  const updateCustomActivity = async (id: string, activity: Partial<DatabaseAtividade>) => {
    return await updateAtividade(id, activity);
  };

  const deleteCustomActivity = async (id: string) => {
    return await deleteAtividade(id);
  };

  const refreshActivities = async () => {
    await refreshSettings();
    // Custom activities are automatically refreshed by useAtividades hook
  };

  return {
    activities: combinedActivities,
    loading: overallLoading,
    error: overallError,
    baseActivities,
    customActivities: customActivitiesHybrid,
    updateBaseActivityUrl,
    toggleBaseActivityStatus,
    addCustomActivity,
    updateCustomActivity,
    deleteCustomActivity,
    refreshActivities
  };
};