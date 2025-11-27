import { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
  Wrench,
  Gift,
  Sparkles,
  Lock,
  Crown,
  ArrowRight,
  CheckCircle,
  X,
  Mail,
  Phone,
  FileText,
  Link as LinkIcon,
  Upload,
  Send,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AreaBanner } from '../components/AreaBanner';
import { supabase } from '../lib/supabase';

export default function Suporte() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [showProblemasModal, setShowProblemasModal] = useState(false);
  const [showContribuicaoModal, setShowContribuicaoModal] = useState(false);
  const [showPedirAtividadesModal, setShowPedirAtividadesModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [problemasForm, setProblemasForm] = useState({
    contact_email: '',
    contact_whatsapp: '',
    title: '',
    description: '',
  });

  const [contribuicaoForm, setContribuicaoForm] = useState({
    contact_email: '',
    contact_whatsapp: '',
    title: '',
    link: '',
    file: null as File | null,
  });

  const [pedirAtividadesForm, setPedirAtividadesForm] = useState({
    contact_email: '',
    contact_whatsapp: '',
    title: '',
    description: '',
  });

  const hasVIPSupport = profile?.active_plan_id === 3 || profile?.acesso_suporte_vip;

  const handlePedirAtividadesClick = () => {
    if (!hasVIPSupport) {
      alert('⭐ Recurso exclusivo para membros PRIME! Faça upgrade do seu plano.');
      navigate('/planos');
      return;
    }
    setShowPedirAtividadesModal(true);
  };

  const resetForms = () => {
    setProblemasForm({ contact_email: '', contact_whatsapp: '', title: '', description: '' });
    setContribuicaoForm({ contact_email: '', contact_whatsapp: '', title: '', link: '', file: null });
    setPedirAtividadesForm({ contact_email: '', contact_whatsapp: '', title: '', description: '' });
  };

  const handleProblemasSubmit = async () => {
    if (!problemasForm.title || !problemasForm.description || (!problemasForm.contact_email && !problemasForm.contact_whatsapp)) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('tickets').insert({
      user_id: profile?.id,
      category: 'problemas',
      title: problemasForm.title,
      description: problemasForm.description,
      contact_email: problemasForm.contact_email || null,
      contact_whatsapp: problemasForm.contact_whatsapp || null,
      status: 'aberto',
    });

    setLoading(false);

    if (error) {
      alert(`Erro: ${error.message}`);
    } else {
      alert('✅ Ticket criado com sucesso! Nossa equipe entrará em contato em breve.');
      setShowProblemasModal(false);
      resetForms();
    }
  };

  const handleContribuicaoSubmit = async () => {
    if (!contribuicaoForm.title || (!contribuicaoForm.contact_email && !contribuicaoForm.contact_whatsapp)) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    setLoading(true);

    let fileUrl = null;

    // Upload de arquivo se houver
    if (contribuicaoForm.file) {
      const fileExt = contribuicaoForm.file.name.split('.').pop();
      const fileName = `${profile?.id}_${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('ticket-attachments')
        .upload(fileName, contribuicaoForm.file);

      if (uploadError) {
        alert(`Erro ao enviar arquivo: ${uploadError.message}`);
        setLoading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from('ticket-attachments').getPublicUrl(fileName);
      fileUrl = publicUrl;
    }

    const { error } = await supabase.from('tickets').insert({
      user_id: profile?.id,
      category: 'contribuicao',
      title: contribuicaoForm.title,
      description: 'Contribuição de material',
      contact_email: contribuicaoForm.contact_email || null,
      contact_whatsapp: contribuicaoForm.contact_whatsapp || null,
      file_url: fileUrl,
      link: contribuicaoForm.link || null,
      status: 'aberto',
    });

    setLoading(false);

    if (error) {
      alert(`Erro: ${error.message}`);
    } else {
      alert('✅ Contribuição enviada! Agradecemos por compartilhar conosco.');
      setShowContribuicaoModal(false);
      resetForms();
    }
  };

  const handlePedirAtividadesSubmit = async () => {
    if (!pedirAtividadesForm.title || !pedirAtividadesForm.description || (!pedirAtividadesForm.contact_email && !pedirAtividadesForm.contact_whatsapp)) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('tickets').insert({
      user_id: profile?.id,
      category: 'pedir_atividades',
      title: pedirAtividadesForm.title,
      description: pedirAtividadesForm.description,
      contact_email: pedirAtividadesForm.contact_email || null,
      contact_whatsapp: pedirAtividadesForm.contact_whatsapp || null,
      status: 'aberto',
    });

    setLoading(false);

    if (error) {
      alert(`Erro: ${error.message}`);
    } else {
      alert('✅ Pedido enviado! Nossa equipe PRIME irá analisar e entrar em contato.');
      setShowPedirAtividadesModal(false);
      resetForms();
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Central de Suporte</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Escolha uma categoria abaixo e nossa equipe estará pronta para ajudá-lo
          </p>
        </div>

        {/* Banner Topo */}
        <AreaBanner area="suporte_topo" />

        {/* Cards de Categorias */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {/* Card Problemas */}
          <div
            onClick={() => setShowProblemasModal(true)}
            className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-gray-100 hover:border-red-300 transform hover:-translate-y-2"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative">
              <div className="w-20 h-20 mb-6 group-hover:scale-110 transition-transform">
                <img src="/problema.webp" alt="Problemas" className="w-full h-full object-contain" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">Problemas</h3>
              <p className="text-gray-600 mb-6">
                Está enfrentando dificuldades? Relate seu problema e nossa equipe irá ajudá-lo.
              </p>

              <div className="inline-flex items-center text-red-600 font-semibold group-hover:gap-3 gap-2 transition-all px-4 py-2 border-2 border-dashed border-red-600 rounded-lg">
                <span>Abrir ticket</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Card Contribuição */}
          <div
            onClick={() => setShowContribuicaoModal(true)}
            className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-gray-100 hover:border-green-300 transform hover:-translate-y-2"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative">
              <div className="w-20 h-20 mb-6 group-hover:scale-110 transition-transform">
                <img src="/contribuicao.webp" alt="Contribuição" className="w-full h-full object-contain" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">Contribuição</h3>
              <p className="text-gray-600 mb-6">
                Tem atividades ou materiais para compartilhar? Envie sua contribuição!
              </p>

              <div className="inline-flex items-center text-green-600 font-semibold group-hover:gap-3 gap-2 transition-all px-4 py-2 border-2 border-dashed border-green-600 rounded-lg">
                <span>Enviar material</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Card Pedir Atividades - PRIME EXCLUSIVE */}
          <div
            onClick={handlePedirAtividadesClick}
            className={`group relative rounded-2xl p-8 shadow-lg transition-all duration-300 cursor-pointer border-2 transform hover:-translate-y-2 ${
              hasVIPSupport
                ? 'backdrop-blur-xl bg-white/30 border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:shadow-purple-500/50 hover:shadow-2xl'
                : 'bg-gray-100 border-gray-300 hover:shadow-xl'
            }`}
          >
            {/* Badge Premium */}
            <div className="absolute -top-3 -right-3">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                <Crown className="w-3 h-3" />
                EXCLUSIVO PRIME
              </div>
            </div>

            {/* Overlay de bloqueio para não-PRIME */}
            {!hasVIPSupport && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-10">
                <div className="text-center">
                  <Lock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-600">Apenas para PRIME</p>
                </div>
              </div>
            )}

            <div className="relative">
              <div className="w-20 h-20 mb-6 group-hover:scale-110 transition-transform">
                <img
                  src="/cartao-vip.webp"
                  alt="Pedir Atividades"
                  className={`w-full h-full object-contain ${!hasVIPSupport ? 'opacity-50' : ''}`}
                />
              </div>

              <h3 className={`text-2xl font-bold mb-3 ${hasVIPSupport ? 'text-gray-900' : 'text-gray-700'}`}>
                Pedir Atividades
              </h3>
              <p className={`mb-6 ${hasVIPSupport ? 'text-gray-800' : 'text-gray-500'}`}>
                Solicite atividades personalizadas de acordo com suas necessidades. Serviço VIP!
              </p>

              <div
                className={`inline-flex items-center font-semibold group-hover:gap-3 gap-2 transition-all px-4 py-2 border-2 border-dashed rounded-lg ${
                  hasVIPSupport ? 'text-purple-600 border-purple-600' : 'text-purple-600 border-purple-600'
                }`}
              >
                <span>{hasVIPSupport ? 'Fazer pedido' : 'Upgrade para PRIME'}</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Benefícios */}
        <div className="max-w-4xl mx-auto mt-16 bg-gradient-to-br from-blue-50/60 to-blue-100/40 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-blue-200/50">
          <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">Por que usar nosso suporte?</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-blue-900 mb-2">Resposta Rápida</h3>
              <p className="text-sm text-blue-800">Equipe dedicada para resolver seus problemas rapidamente</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-blue-900 mb-2">Acompanhamento</h3>
              <p className="text-sm text-blue-800">Receba notificações sobre o status do seu ticket</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-blue-900 mb-2">Histórico</h3>
              <p className="text-sm text-blue-800">Acesse todos os seus tickets anteriores a qualquer momento</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/meus-tickets')}
              className="inline-flex items-center gap-2 px-8 py-3 bg-transparent text-blue-700 font-bold rounded-lg border-2 border-dashed border-blue-600 hover:bg-blue-50 transition-all"
            >
              Ver Meus Tickets
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: Problemas */}
      {showProblemasModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full my-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wrench className="w-8 h-8 text-white" />
                  <h3 className="text-2xl font-bold text-white">Relatar Problema</h3>
                </div>
                <button
                  onClick={() => {
                    setShowProblemasModal(false);
                    resetForms();
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
              <p className="text-white/90 mt-2">Descreva seu problema em detalhes</p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={problemasForm.contact_email}
                    onChange={(e) => setProblemasForm({ ...problemasForm, contact_email: e.target.value })}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={problemasForm.contact_whatsapp}
                    onChange={(e) => setProblemasForm({ ...problemasForm, contact_whatsapp: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500">* Preencha pelo menos um dos contatos acima</p>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Título
                </label>
                <input
                  type="text"
                  value={problemasForm.title}
                  onChange={(e) => setProblemasForm({ ...problemasForm, title: e.target.value })}
                  placeholder="Ex: Erro ao fazer login"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição do Problema</label>
                <textarea
                  value={problemasForm.description}
                  onChange={(e) => setProblemasForm({ ...problemasForm, description: e.target.value })}
                  placeholder="Descreva o problema detalhadamente..."
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleProblemasSubmit}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-semibold hover:from-red-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Enviando...' : <><Send className="w-5 h-5" />Enviar Ticket</>}
                </button>
                <button
                  onClick={() => {
                    setShowProblemasModal(false);
                    resetForms();
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Contribuição */}
      {showContribuicaoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full my-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Gift className="w-8 h-8 text-white" />
                  <h3 className="text-2xl font-bold text-white">Contribuir com Material</h3>
                </div>
                <button
                  onClick={() => {
                    setShowContribuicaoModal(false);
                    resetForms();
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
              <p className="text-white/90 mt-2">Compartilhe atividades ou materiais com nossa comunidade</p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={contribuicaoForm.contact_email}
                    onChange={(e) => setContribuicaoForm({ ...contribuicaoForm, contact_email: e.target.value })}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={contribuicaoForm.contact_whatsapp}
                    onChange={(e) => setContribuicaoForm({ ...contribuicaoForm, contact_whatsapp: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500">* Preencha pelo menos um dos contatos acima</p>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Título
                </label>
                <input
                  type="text"
                  value={contribuicaoForm.title}
                  onChange={(e) => setContribuicaoForm({ ...contribuicaoForm, title: e.target.value })}
                  placeholder="Ex: Atividades de Matemática 3º ano"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Link (opcional)
                </label>
                <input
                  type="url"
                  value={contribuicaoForm.link}
                  onChange={(e) => setContribuicaoForm({ ...contribuicaoForm, link: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload de Arquivo (opcional)
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    setContribuicaoForm({ ...contribuicaoForm, file: e.target.files?.[0] || null })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                <p className="text-xs text-gray-500 mt-1">Máximo 10MB</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleContribuicaoSubmit}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Enviando...' : <><Send className="w-5 h-5" />Enviar Contribuição</>}
                </button>
                <button
                  onClick={() => {
                    setShowContribuicaoModal(false);
                    resetForms();
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Pedir Atividades - PRIME */}
      {showPedirAtividadesModal && hasVIPSupport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl max-w-2xl w-full my-8 shadow-2xl shadow-purple-500/50">
            {/* Header */}
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-bold text-white">Pedir Atividades</h3>
                      <div className="bg-yellow-400 text-purple-900 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        VIP
                      </div>
                    </div>
                    <p className="text-white/90 text-sm">Serviço exclusivo para membros PRIME</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPedirAtividadesModal(false);
                    resetForms();
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={pedirAtividadesForm.contact_email}
                    onChange={(e) => setPedirAtividadesForm({ ...pedirAtividadesForm, contact_email: e.target.value })}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 border-2 border-white/20 bg-white/10 text-white placeholder-white/50 rounded-lg focus:border-white focus:outline-none backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={pedirAtividadesForm.contact_whatsapp}
                    onChange={(e) => setPedirAtividadesForm({ ...pedirAtividadesForm, contact_whatsapp: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-3 border-2 border-white/20 bg-white/10 text-white placeholder-white/50 rounded-lg focus:border-white focus:outline-none backdrop-blur-sm"
                  />
                </div>
              </div>

              <p className="text-xs text-white/70">* Preencha pelo menos um dos contatos acima</p>

              <div>
                <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Título do Pedido
                </label>
                <input
                  type="text"
                  value={pedirAtividadesForm.title}
                  onChange={(e) => setPedirAtividadesForm({ ...pedirAtividadesForm, title: e.target.value })}
                  placeholder="Ex: Atividades de Português para 5º ano"
                  className="w-full px-4 py-3 border-2 border-white/20 bg-white/10 text-white placeholder-white/50 rounded-lg focus:border-white focus:outline-none backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Descrição da Atividade Desejada</label>
                <textarea
                  value={pedirAtividadesForm.description}
                  onChange={(e) => setPedirAtividadesForm({ ...pedirAtividadesForm, description: e.target.value })}
                  placeholder="Descreva detalhadamente a atividade que você está buscando..."
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-white/20 bg-white/10 text-white placeholder-white/50 rounded-lg focus:border-white focus:outline-none resize-none backdrop-blur-sm"
                />
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-white text-sm">
                  <strong>✨ Serviço VIP:</strong> Nossa equipe especializada irá criar atividades personalizadas
                  de acordo com suas necessidades. Você será contatado em breve!
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handlePedirAtividadesSubmit}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-white/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
                >
                  {loading ? 'Enviando...' : <><Send className="w-5 h-5" />Enviar Pedido VIP</>}
                </button>
                <button
                  onClick={() => {
                    setShowPedirAtividadesModal(false);
                    resetForms();
                  }}
                  className="px-6 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors backdrop-blur-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
