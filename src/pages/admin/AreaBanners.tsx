import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Image, Edit, Eye, Monitor, Smartphone, X, Save, Trash2, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface BannerData {
  id: string;
  area: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  button_url: string | null;
  banner_url: string | null;
  active: boolean;
}

const AREA_LABELS: Record<string, { name: string; color: string; icon: string }> = {
  atividades_topo: { name: 'Atividades - Topo', color: 'blue', icon: '📚' },
  atividades_rodape: { name: 'Atividades - Rodapé', color: 'indigo', icon: '📖' },
  bonus_topo: { name: 'Bônus - Topo', color: 'purple', icon: '🎁' },
  bonus_rodape: { name: 'Bônus - Rodapé', color: 'pink', icon: '✨' },
  planos_rodape: { name: 'Planos - Rodapé', color: 'green', icon: '💎' },
  suporte_topo: { name: 'Suporte - Topo', color: 'orange', icon: '🆘' },
};

export default function AreaBanners() {
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBanner, setEditingBanner] = useState<BannerData | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('desktop');
  const [specMode, setSpecMode] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('area_banners')
      .select('*')
      .order('area');

    if (!error && data) {
      setBanners(data);
    }
    setLoading(false);
  };

  const handleEdit = (banner: BannerData) => {
    setEditingBanner({ ...banner });
  };

  const handleSave = async () => {
    if (!editingBanner) return;

    setSaving(true);
    const { error } = await supabase
      .from('area_banners')
      .update({
        title: editingBanner.title,
        description: editingBanner.description,
        image_url: editingBanner.image_url,
        button_url: editingBanner.button_url,
        banner_url: editingBanner.banner_url,
        active: editingBanner.active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', editingBanner.id);

    if (error) {
      alert(`Erro: ${error.message}`);
    } else {
      alert('✅ Banner atualizado com sucesso!');
      await loadBanners();
      setEditingBanner(null);
    }
    setSaving(false);
  };

  const handleClear = async () => {
    if (!editingBanner) return;
    if (!confirm('Tem certeza que deseja limpar este banner?')) return;

    setSaving(true);
    const { error } = await supabase
      .from('area_banners')
      .update({
        title: null,
        description: null,
        image_url: null,
        button_url: null,
        banner_url: null,
        active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', editingBanner.id);

    if (error) {
      alert(`Erro: ${error.message}`);
    } else {
      alert('✅ Banner limpo com sucesso!');
      await loadBanners();
      setEditingBanner(null);
    }
    setSaving(false);
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'from-blue-50 to-blue-100 border-blue-300 text-blue-900',
      indigo: 'from-indigo-50 to-indigo-100 border-indigo-300 text-indigo-900',
      purple: 'from-purple-50 to-purple-100 border-purple-300 text-purple-900',
      pink: 'from-pink-50 to-pink-100 border-pink-300 text-pink-900',
      green: 'from-green-50 to-green-100 border-green-300 text-green-900',
      orange: 'from-orange-50 to-orange-100 border-orange-300 text-orange-900',
    };
    return colors[color] || colors.blue;
  };

  const getSpecifications = () => {
    if (specMode === 'mobile') {
      return {
        title: '📱 Especificações para Mobile:',
        specs: [
          { label: 'Tamanho ideal', value: '750x420 pixels' },
          { label: 'Altura no site', value: '280px (responsivo)' },
          { label: 'Largura máxima', value: '100% da tela' },
          { label: 'Formato', value: 'JPG, PNG ou WebP' },
          { label: 'Proporção', value: '16:9 (recomendado)' },
          { label: 'Visualização', value: 'Imagem inteira visível' },
          { label: 'Dica', value: '⚠️ Deixe conteúdo importante no centro (não coloque text nas extremidades)' },
        ],
      };
    } else {
      return {
        title: '🖥️ Especificações para Desktop:',
        specs: [
          { label: 'Tamanho ideal', value: '1200x280 pixels' },
          { label: 'Altura fixa no site', value: '280px' },
          { label: 'Largura máxima', value: '1280px (responsivo)' },
          { label: 'Formato', value: 'JPG, PNG ou WebP' },
          { label: 'Proporção', value: '4.3:1 (aprox. 16:4)' },
          { label: 'Visualização', value: 'Imagem inteira visível (não corta)' },
          { label: 'Dica', value: '✨ Ideal para hero banners e promoções' },
        ],
      };
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Área de Banners</h1>
          <p className="text-gray-600 mt-1">Configure banners para diferentes seções do site</p>

          {/* Info Box */}
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl">
            <p className="text-sm font-bold text-blue-900 mb-2">📐 Especificações Recomendadas:</p>
            <div className="grid md:grid-cols-2 gap-2 text-xs text-blue-800">
              <div>• <strong>Tamanho ideal:</strong> 1200x280 pixels</div>
              <div>• <strong>Formato:</strong> JPG, PNG ou WebP</div>
              <div>• <strong>Altura no site:</strong> 280px (fixa)</div>
              <div>• <strong>Largura máxima:</strong> 1280px (responsivo)</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((banner) => {
              const areaInfo = AREA_LABELS[banner.area];
              return (
                <div
                  key={banner.id}
                  className={`bg-gradient-to-br ${getColorClasses(areaInfo.color)} rounded-xl shadow-lg p-6 border-2`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-3xl mb-2">{areaInfo.icon}</p>
                      <h3 className="text-lg font-bold">{areaInfo.name}</h3>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        banner.active
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 text-gray-700'
                      }`}
                    >
                      {banner.active ? '✓ Ativo' : '✗ Inativo'}
                    </span>
                  </div>

                  {banner.image_url && (
                    <div className="mb-4 rounded-lg overflow-hidden h-32">
                      <img
                        src={banner.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Sem+Imagem';
                        }}
                      />
                    </div>
                  )}

                  {!banner.image_url && (
                    <div className="mb-4 rounded-lg bg-white/50 h-32 flex items-center justify-center">
                      <p className="text-sm text-gray-500">Sem imagem configurada</p>
                    </div>
                  )}

                  <button
                    onClick={() => handleEdit(banner)}
                    className="w-full py-2 bg-white/80 hover:bg-white text-gray-900 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Configurar
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de Edição */}
        {editingBanner && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    {AREA_LABELS[editingBanner.area].icon}
                    {AREA_LABELS[editingBanner.area].name}
                  </h2>
                  <p className="text-blue-100 text-sm">Configure o banner desta área</p>
                </div>
                <button
                  onClick={() => setEditingBanner(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid lg:grid-cols-2 gap-6 p-6">
                {/* Formulário */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status
                    </label>
                    <button
                      onClick={() => setEditingBanner({ ...editingBanner, active: !editingBanner.active })}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        editingBanner.active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {editingBanner.active ? '✅ Ativo' : '❌ Inativo'}
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Image className="w-4 h-4 inline mr-1" />
                      URL da Imagem
                    </label>
                    <input
                      type="text"
                      value={editingBanner.image_url || ''}
                      onChange={(e) => setEditingBanner({ ...editingBanner, image_url: e.target.value })}
                      placeholder="https://exemplo.com/banner.jpg"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-blue-900">{getSpecifications().title}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSpecMode('desktop')}
                            className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                              specMode === 'desktop'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-blue-700 border border-blue-300'
                            }`}
                          >
                            🖥️ Desktop
                          </button>
                          <button
                            onClick={() => setSpecMode('mobile')}
                            className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                              specMode === 'mobile'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-blue-700 border border-blue-300'
                            }`}
                          >
                            📱 Mobile
                          </button>
                        </div>
                      </div>
                      <ul className="text-xs text-blue-800 space-y-1">
                        {getSpecifications().specs.map((spec, idx) => (
                          <li key={idx}>• <strong>{spec.label}:</strong> {spec.value}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Título (Opcional)
                    </label>
                    <input
                      type="text"
                      value={editingBanner.title || ''}
                      onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                      placeholder="Título do banner"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Descrição (Opcional)
                    </label>
                    <textarea
                      value={editingBanner.description || ''}
                      onChange={(e) => setEditingBanner({ ...editingBanner, description: e.target.value })}
                      placeholder="Descrição do banner"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      URL do Banner Inteiro (Opcional)
                    </label>
                    <input
                      type="text"
                      value={editingBanner.banner_url || ''}
                      onChange={(e) => setEditingBanner({ ...editingBanner, banner_url: e.target.value })}
                      placeholder="https://exemplo.com/destino"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Se preenchido, o banner inteiro será clicável
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      URL do Botão "Ver Mais" (Opcional)
                    </label>
                    <input
                      type="text"
                      value={editingBanner.button_url || ''}
                      onChange={(e) => setEditingBanner({ ...editingBanner, button_url: e.target.value })}
                      placeholder="https://exemplo.com/detalhes"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Mostra botão "Ver Mais" (ignorado se URL do banner estiver preenchida)
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <button
                      onClick={handleSave}
                      disabled={saving || !editingBanner.image_url}
                      className="py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button
                      onClick={handleClear}
                      disabled={saving}
                      className="py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Limpar
                    </button>
                  </div>
                </div>

                {/* Preview */}
                <div className="lg:sticky lg:top-6 lg:self-start">
                  <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-green-500" />
                        Preview
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPreviewMode('mobile')}
                          className={`p-2 rounded-lg transition-colors ${
                            previewMode === 'mobile'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <Smartphone className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setPreviewMode('desktop')}
                          className={`p-2 rounded-lg transition-colors ${
                            previewMode === 'desktop'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <Monitor className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div
                      className={`bg-gray-50 rounded-xl overflow-hidden ${
                        previewMode === 'mobile' ? 'max-w-[375px] mx-auto' : ''
                      }`}
                    >
                      {editingBanner.image_url ? (
                        <div
                          className={`bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden border border-white/50 ${
                            editingBanner.banner_url ? 'cursor-pointer' : ''
                          }`}
                        >
                          <div className="w-full h-48 overflow-hidden">
                            <img
                              src={editingBanner.image_url}
                              alt="Preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/800x200?text=Imagem+Indisponível';
                              }}
                            />
                          </div>

                          {(editingBanner.title || editingBanner.description || editingBanner.button_url) && (
                            <div className="p-6">
                              {editingBanner.title && (
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                  {editingBanner.title}
                                </h3>
                              )}

                              {editingBanner.description && (
                                <p className="text-gray-700 mb-4 text-sm">
                                  {editingBanner.description}
                                </p>
                              )}

                              {editingBanner.button_url && !editingBanner.banner_url && (
                                <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg text-sm">
                                  Ver Mais →
                                </button>
                              )}
                            </div>
                          )}

                          {editingBanner.banner_url && (
                            <div className="px-6 pb-4">
                              <p className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                                <LinkIcon className="w-3 h-3" />
                                Banner inteiro clicável
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-64 flex items-center justify-center text-gray-400">
                          <p className="text-sm">Configure uma imagem para ver o preview</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
