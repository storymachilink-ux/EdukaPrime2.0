import React from 'react';
import { EducationalActivity } from '../../types/papercraft';
import { ActivityCard } from './ActivityCard';
import { Loader } from 'lucide-react';

interface ActivityListProps {
  activities?: EducationalActivity[];
  loading?: boolean;
  onDownload?: (id: string) => void;
  isAdmin?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  emptyMessage?: string;
  viewMode?: 'grid' | 'list';
}

export function ActivityList({
  activities = [],
  loading = false,
  onDownload,
  isAdmin = false,
  onEdit,
  onDelete,
  emptyMessage = 'Nenhuma atividade disponível',
  viewMode = 'grid',
}: ActivityListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  const containerClass =
    viewMode === 'grid'
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
      : 'grid grid-cols-1 gap-4';

  return (
    <div className={containerClass}>
      {activities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          onDownload={onDownload}
          isAdmin={isAdmin}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
