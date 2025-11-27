import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getPaperCrafts } from '../../lib/paperCraftService';
import { getEducationalActivities } from '../../lib/educationalActivityService';
import { PaperCraft, EducationalActivity } from '../../types/papercraft';
import { BonusSelector } from './BonusSelector';
import { PaperCraftGrid } from './PaperCraftGrid';
import { ActivityList } from './ActivityList';

interface BonusSectionProps {
  isAdmin?: boolean;
}

export function BonusSection({ isAdmin = false }: BonusSectionProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'activities' | 'papercrafts'>(
    'activities'
  );

  // States for papercrafts
  const [papercrafts, setPapercrafts] = useState<PaperCraft[]>([]);
  const [papercraftsLoading, setPapercraftsLoading] = useState(false);

  // States for activities
  const [activities, setActivities] = useState<EducationalActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // Load papercrafts
  useEffect(() => {
    const loadPapercrafts = async () => {
      setPapercraftsLoading(true);
      const data = await getPaperCrafts();
      setPapercrafts(data);
      setPapercraftsLoading(false);
    };

    loadPapercrafts();
  }, []);

  // Load activities
  useEffect(() => {
    const loadActivities = async () => {
      setActivitiesLoading(true);
      const data = await getEducationalActivities();
      setActivities(data);
      setActivitiesLoading(false);
    };

    loadActivities();
  }, []);

  const handlePapercraftDownload = async (id: string) => {
    if (!user) {
      alert('Você precisa estar logado para fazer download');
      return;
    }

    try {
      // TODO: Implement download functionality
      // This could be implemented with file generation or redirect to file
      console.log('Download papercrafts:', id);
      alert('Download iniciado!');
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      alert('Erro ao fazer download');
    }
  };

  const handleActivityDownload = async (id: string) => {
    if (!user) {
      alert('Você precisa estar logado para fazer download');
      return;
    }

    try {
      // TODO: Implement download functionality
      console.log('Download activity:', id);
      alert('Download iniciado!');
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      alert('Erro ao fazer download');
    }
  };

  return (
    <div className="w-full">
      {/* Bonus Selector */}
      <BonusSelector
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activityCount={activities.length}
        papercraftCount={papercrafts.length}
      />

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'activities' ? (
          <>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Atividades Educacionais BNCC
            </h3>
            <ActivityList
              activities={activities}
              loading={activitiesLoading}
              onDownload={handleActivityDownload}
              isAdmin={isAdmin}
              emptyMessage="Nenhuma atividade disponível no momento"
              viewMode="grid"
            />
          </>
        ) : (
          <>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Coleções de PaperCrafts
            </h3>
            <PaperCraftGrid
              papercrafts={papercrafts}
              loading={papercraftsLoading}
              onDownload={handlePapercraftDownload}
              isAdmin={isAdmin}
              emptyMessage="Nenhum papercraft disponível no momento"
            />
          </>
        )}
      </div>
    </div>
  );
}
