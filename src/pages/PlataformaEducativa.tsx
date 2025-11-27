import React from 'react';
import { Dashboard } from './Dashboard';
import { useAuth } from '../hooks/useAuth';

export const PlataformaEducativa: React.FC = () => {
  const { user, profile, currentPlan, hasAnyAccess } = useAuth();

  console.log('📚 [PlataformaEducativa] Acesso:', {
    user: user?.email,
    hasAccess: hasAnyAccess,
    currentPlan,
    isAdmin: profile?.is_admin
  });

  // Usar o componente Dashboard existente como área interna
  return <Dashboard />;
};