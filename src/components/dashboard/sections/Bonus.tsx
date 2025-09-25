import React from 'react';
import { Download, FileText, BookOpen, LayoutGrid as Layout } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Bonus } from '../../../types';

export const BonusSection: React.FC = () => {
  const bonusList: Bonus[] = [
    {
      id: '1',
      title: 'Planejamento de Aulas - Guia Completo',
      type: 'pdf',
      description: 'Manual completo para planejamento eficaz de aulas com templates e exemplos práticos.',
      downloadUrl: '#'
    },
    {
      id: '2',
      title: '100 Jogos Educativos',
      type: 'ebook',
      description: 'E-book com jogos e brincadeiras educativas para todas as idades.',
      downloadUrl: '#'
    },
    {
      id: '3',
      title: 'Templates de Atividades',
      type: 'template',
      description: 'Conjunto de templates editáveis para criar suas próprias atividades.',
      downloadUrl: '#'
    },
    {
      id: '4',
      title: 'Avaliação Diagnóstica',
      type: 'pdf',
      description: 'Guia para aplicação e análise de avaliações diagnósticas.',
      downloadUrl: '#'
    },
    {
      id: '5',
      title: 'Educação Inclusiva na Prática',
      type: 'ebook',
      description: 'Strategies para tornar sua sala de aula mais inclusiva e acolhedora.',
      downloadUrl: '#'
    },
    {
      id: '6',
      title: 'Kit de Decoração de Sala',
      type: 'template',
      description: 'Templates para impressão de decorações temáticas para sua sala de aula.',
      downloadUrl: '#'
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return FileText;
      case 'ebook':
        return BookOpen;
      case 'template':
        return Layout;
      default:
        return FileText;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'PDF';
      case 'ebook':
        return 'E-book';
      case 'template':
        return 'Template';
      default:
        return 'Arquivo';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1F1F1F] dark:text-[#F5F5F5] mb-2">
          Bônus
        </h1>
        <p className="text-[#5C5C5C] dark:text-[#A3A3A3]">
          Materiais extras para enriquecer sua prática pedagógica
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bonusList.map((bonus) => {
          const Icon = getIcon(bonus.type);
          
          return (
            <Card key={bonus.id} hover>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-[#F7D7D2] dark:bg-[#2A1F1D] rounded-[12px] flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#111111] dark:text-[#F5F5F5]" strokeWidth={2} />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {getTypeLabel(bonus.type)}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="font-bold text-[#1F1F1F] dark:text-[#F5F5F5] mb-2 leading-tight">
                    {bonus.title}
                  </h3>
                  <p className="text-sm text-[#5C5C5C] dark:text-[#A3A3A3] leading-relaxed">
                    {bonus.description}
                  </p>
                </div>
                
                <Button variant="primary" size="sm" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="bg-[#F2E9E6] dark:bg-[#252119] border border-[#E9DCD7] dark:border-[#2A2A2A]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#FBE7A2] dark:bg-[#2A2417] rounded-full flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-[#111111] dark:text-[#F5F5F5]" strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-bold text-[#1F1F1F] dark:text-[#F5F5F5] mb-2">
              Dica: Organize seus Downloads
            </h3>
            <p className="text-sm text-[#5C5C5C] dark:text-[#A3A3A3] leading-relaxed">
              Crie uma pasta específica para organizar todos os materiais baixados do EdukaPrime. 
              Isso facilitará o acesso rápido aos recursos durante suas aulas.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};