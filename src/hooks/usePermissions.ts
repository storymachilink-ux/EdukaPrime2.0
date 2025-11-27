import { useAdminPlan } from './useAdminPlan';

// Plan numbers mapping (database format)
const PLAN_NUMBERS = {
  demo: 0,
  essencial: 1,
  evoluir: 2,
  prime: 3,
  admin: 5
};

export interface Permissions {
  // Activities
  canViewAllActivities: boolean;
  canDownloadEssentialOnly: boolean;
  canDownloadAllActivities: boolean;

  // Areas
  canAccessVideos: boolean;
  canAccessBonus: boolean;
  canAccessVipSupport: boolean;
  canAccessRegularSupport: boolean;
}

export const usePermissions = () => {
  const { effectivePlan, isAdmin } = useAdminPlan();

  // Convert plan name to number (database format)
  const currentPlanNumber = PLAN_NUMBERS[effectivePlan as keyof typeof PLAN_NUMBERS] || 0;

  const permissions: Permissions = {
    // Activities - Everyone can view all, but download restrictions vary
    canViewAllActivities: true,
    canDownloadEssentialOnly: currentPlanNumber === 1,
    canDownloadAllActivities: currentPlanNumber >= 2,

    // Areas access - based on plan numbers (database format)
    canAccessVideos: currentPlanNumber >= 2, // Evoluir (2) and above
    canAccessBonus: currentPlanNumber >= 2,  // Evoluir (2) and above
    canAccessVipSupport: currentPlanNumber >= 3, // Prime (3) and above
    canAccessRegularSupport: true, // Everyone always has regular support
  };

  // Helper functions for specific checks
  const canDownloadActivity = (material: any): boolean => {
    // Admin can always download
    if (isAdmin) return true;

    // For database system: check if current plan number is in availableForPlans array
    if (material.available_for_plans && Array.isArray(material.available_for_plans)) {
      return material.available_for_plans.includes(currentPlanNumber);
    }

    // Fallback for old system
    if (material.availableForPlans) {
      return material.availableForPlans.includes(effectivePlan);
    }

    return false;
  };

  const getUpgradeMessage = (feature: string): string => {
    if (feature === 'vipSupport') {
      return 'Upgrade para Prime para acessar Suporte VIP';
    }

    // For Videos and Bonus
    if (currentPlanNumber === 0) {
      return 'Upgrade para Essencial para acessar esta área';
    } else if (currentPlanNumber === 1) {
      return 'Upgrade para Evoluir para acessar esta área';
    }

    return 'Funcionalidade já liberada';
  };

  const getRequiredPlan = (feature: string): 'essencial' | 'evoluir' | 'prime' => {
    if (feature === 'vipSupport') return 'prime';
    if (currentPlanNumber === 0) return 'essencial';
    return 'evoluir';
  };

  return {
    permissions,
    currentPlan: effectivePlan,
    currentPlanNumber,
    canDownloadActivity,
    getUpgradeMessage,
    getRequiredPlan,
  };
};