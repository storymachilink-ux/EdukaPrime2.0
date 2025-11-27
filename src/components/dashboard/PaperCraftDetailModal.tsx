import React from 'react';
import { X, ExternalLink } from 'lucide-react';

interface PaperCraftItem {
  nº: string;
  nome: string;
  dificuldade: 'Fácil' | 'Médio' | 'Difícil';
  faixa_etaria: string;
  tema: string;
  tipo: 'Papercraft' | 'Atividade';
}

interface PaperCraft {
  id: string;
  title: string;
  category: string;
  theme?: 'Natal' | 'Halloween';
  difficulty: 'fácil' | 'médio' | 'difícil';
  description: string;
  model_count: string;
  min_age: number;
  max_age: number;
  image_url?: string;
  gif_url?: string;
  drive_folder_url?: string;
  items_json?: PaperCraftItem[];
  price?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PaperCraftDetailModalProps {
  papercraft: PaperCraft | null;
  onClose: () => void;
}

export function PaperCraftDetailModal({
  papercraft,
  onClose,
}: PaperCraftDetailModalProps) {
  if (!papercraft) return null;

  // Obter emoji do tema
  const getThemeEmoji = (theme?: string) => {
    switch (theme) {
      case 'Natal':
        return '🎄';
      case 'Halloween':
        return '🎃';
      default:
        return '🎨';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'fácil':
        return 'bg-green-100 text-green-700';
      case 'médio':
        return 'bg-yellow-100 text-yellow-700';
      case 'difícil':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  const items = papercraft.items_json || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">

        {/* Header com Voltar */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 flex items-center justify-between sticky top-0 z-10">
          <button
            onClick={onClose}
            className="text-white hover:opacity-80 transition-opacity font-semibold text-lg flex items-center gap-2 hover:underline"
          >
            ← Voltar
          </button>
          <button
            onClick={onClose}
            className="text-white hover:opacity-80 transition-opacity p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-8 space-y-8">

          {/* Título com Emoji do Tema */}
          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-gray-900">
              {getThemeEmoji(papercraft.theme)}{papercraft.title}
            </h2>
          </div>

          {/* 📖 Descrição Geral */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">📖 Descrição Geral</h3>
            <p className="text-gray-700 leading-relaxed">
              {papercraft.description}
            </p>
          </div>

          {/* GIF Animado (em vez de imagem estática) - sem corte, apenas redimensiona */}
          {papercraft.gif_url && (
            <div className="rounded-2xl overflow-hidden border-4 border-blue-200 shadow-lg bg-gray-100 flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
              <img
                src={papercraft.gif_url}
                alt={`${papercraft.title} demonstração`}
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* 💡 Dica */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-2">💡 Dica</h3>
            <p className="text-blue-800">
              Imprima em papel 120g ou colorido para melhor acabamento e durabilidade dos modelos!
            </p>
          </div>

          {/* 🎯 Ideal para Desenvolver */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">🎯 Ideal para Desenvolver</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
                <p className="text-gray-700 font-semibold text-center">Criatividade</p>
              </div>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
                <p className="text-gray-700 font-semibold text-center">Coordenação Motora</p>
              </div>
              <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4">
                <p className="text-gray-700 font-semibold text-center">Autonomia</p>
              </div>
            </div>
          </div>

          {/* ℹ️ Informações */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">ℹ️ Informações</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Dificuldade</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(papercraft.difficulty)}`}>
                  {getDifficultyLabel(papercraft.difficulty)}
                </span>
              </div>

              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Faixa Etária</p>
                <p className="text-lg font-bold text-gray-800">
                  {papercraft.min_age}-{papercraft.max_age} anos
                </p>
              </div>

              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Tema</p>
                <p className="text-lg font-bold text-gray-800">{papercraft.theme || papercraft.category}</p>
              </div>

              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Sobre</p>
                <p className="text-lg font-bold text-gray-800">{items.length} itens</p>
              </div>
            </div>
          </div>

          {/* 📂 Lista de Papercrafts Disponíveis */}
          {items.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">📂 Lista de Papercrafts Disponíveis</h3>
              <div className="overflow-x-auto border-2 border-gray-200 rounded-xl">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Nº</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Nome do Paper</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Dificuldade</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Faixa Etária</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Tema</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm text-gray-700 font-semibold">{item.nº}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.nome}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor(item.dificuldade.toLowerCase())}`}>
                            {item.dificuldade}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.faixa_etaria}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.tema}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.tipo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 📁 Google Drive */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">📁 Google Drive</h3>
            {papercraft.drive_folder_url ? (
              <a
                href={papercraft.drive_folder_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all hover:shadow-lg active:scale-95"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Abrir Google Drive</span>
              </a>
            ) : (
              <button
                disabled
                className="inline-flex items-center gap-3 px-8 py-4 bg-gray-300 text-gray-600 font-bold rounded-xl cursor-not-allowed"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Google Drive não configurado</span>
              </button>
            )}
            <p className="text-gray-600 text-sm mt-3">
              Clique no botão abaixo para acessar todos os PDFs e arquivos
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
