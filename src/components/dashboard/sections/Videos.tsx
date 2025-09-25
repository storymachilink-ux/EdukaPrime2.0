import React from 'react';
import { Play, Clock } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Video } from '../../../types';

export const Videos: React.FC = () => {
  const videos: Video[] = [
    {
      id: '1',
      title: 'Técnicas de Ensino Lúdico',
      thumbnail: 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
      duration: '15:30',
      category: 'Metodologia'
    },
    {
      id: '2',
      title: 'Gestão de Sala de Aula',
      thumbnail: 'https://images.pexels.com/photos/8613028/pexels-photo-8613028.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
      duration: '22:45',
      category: 'Gestão'
    },
    {
      id: '3',
      title: 'Desenvolvimento Infantil',
      thumbnail: 'https://images.pexels.com/photos/8612991/pexels-photo-8612991.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
      duration: '18:15',
      category: 'Psicologia'
    },
    {
      id: '4',
      title: 'Alfabetização e Letramento',
      thumbnail: 'https://images.pexels.com/photos/4145153/pexels-photo-4145153.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
      duration: '25:20',
      category: 'Português'
    },
    {
      id: '5',
      title: 'Matemática Divertida',
      thumbnail: 'https://images.pexels.com/photos/4145190/pexels-photo-4145190.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
      duration: '20:10',
      category: 'Matemática'
    },
    {
      id: '6',
      title: 'Arte na Educação Infantil',
      thumbnail: 'https://images.pexels.com/photos/8613055/pexels-photo-8613055.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
      duration: '16:35',
      category: 'Artes'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1F1F1F] dark:text-[#F5F5F5] mb-2">
            Vídeos
          </h1>
          <p className="text-[#5C5C5C] dark:text-[#A3A3A3]">
            Aprenda com nossos vídeos educacionais especializados
          </p>
        </div>
        
        <div className="flex gap-2">
          <select className="px-4 py-2 bg-[#F2E9E6] dark:bg-[#252119] border border-[#E9DCD7] dark:border-[#2A2A2A] rounded-[12px] text-[#1F1F1F] dark:text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#111111] dark:focus:ring-white">
            <option>Todas as categorias</option>
            <option>Metodologia</option>
            <option>Gestão</option>
            <option>Psicologia</option>
            <option>Português</option>
            <option>Matemática</option>
            <option>Artes</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <Card key={video.id} hover className="overflow-hidden">
            <div className="aspect-video relative mb-4 group cursor-pointer">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover rounded-[12px]"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-[12px]">
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                  <Play className="w-6 h-6 text-[#111111] ml-1" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {video.duration}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-[#1F1F1F] dark:text-[#F5F5F5] leading-tight">
                  {video.title}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {video.category}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-xs text-[#5C5C5C] dark:text-[#A3A3A3]">
                  <Clock className="w-4 h-4" />
                  <span>{video.duration}</span>
                </div>
                
                <Button variant="primary" size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Assistir
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};