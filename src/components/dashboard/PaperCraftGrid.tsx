import React, { useEffect, useState } from 'react';
import { PaperCraft } from '../../types/papercraft';
import { PaperCraftCard } from './PaperCraftCard';
import { Loader } from 'lucide-react';

interface PaperCraftGridProps {
  papercrafts?: PaperCraft[];
  loading?: boolean;
  onDownload?: (id: string) => void;
  isAdmin?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  emptyMessage?: string;
}

export function PaperCraftGrid({
  papercrafts = [],
  loading = false,
  onDownload,
  isAdmin = false,
  onEdit,
  onDelete,
  emptyMessage = 'Nenhum papercraft disponível',
}: PaperCraftGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (papercrafts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {papercrafts.map((papercraft) => (
        <PaperCraftCard
          key={papercraft.id}
          papercraft={papercraft}
          onDownload={onDownload}
          isAdmin={isAdmin}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
