import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import {
  Ticket,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  Eye,
  MessageSquare,
  Send,
  X,
  User,
  Mail,
  Phone,
  FileText,
  Calendar,
  Trash2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TicketData {
  id: string;
  user_id: string;
  category: string;
  title: string;
  description: string;
  contact_email: string;
  contact_whatsapp: string;
  file_url: string | null;
  link: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  user?: {
    nome: string;
    email: string;
  };
}

interface TicketResponse {
  id: string;
  message: string;
  created_at: string;
  is_internal: boolean;
  admin_id: string;
}

export default function GestaoTickets() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [responses, setResponses] = useState<TicketResponse[]>([]);
  const [newResponse, setNewResponse] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [loadingResponse, setLoadingResponse] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('tickets')
      .select('*, users(nome, email)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar tickets:', error);
      setTickets([]);
    } else {
      setTickets(data || []);
    }

    setLoading(false);
  };

  const loadResponses = async (ticketId: string) => {
    const { data, error } = await supabase
      .from('ticket_responses')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao carregar respostas:', error);
      setResponses([]);
    } else {
      setResponses(data || []);
    }
  };

  const handleViewTicket = async (ticket: TicketData) => {
    setSelectedTicket(ticket);
    await loadResponses(ticket.id);
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    const { error } = await supabase.rpc('update_ticket_status', {
      p_ticket_id: ticketId,
      p_status: newStatus
    });

    if (error) {
      alert(`Erro: ${error.message}`);
    } else {
      alert(`✅ Status atualizado para: ${getStatusInfo(newStatus).label}`);
      loadTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    }
  };

  const handleSendResponse = async () => {
    if (!newResponse.trim() || !selectedTicket) return;

    setLoadingResponse(true);

    const { error } = await supabase.rpc('create_ticket_response', {
      p_ticket_id: selectedTicket.id,
      p_message: newResponse,
      p_is_internal: isInternal
    });

    setLoadingResponse(false);

    if (error) {
      alert(`Erro: ${error.message}`);
    } else {
      alert(`✅ ${isInternal ? 'Nota interna' : 'Resposta'} enviada!`);
      setNewResponse('');
      setIsInternal(false);
      await loadResponses(selectedTicket.id);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm('⚠️ Tem certeza que deseja excluir este ticket? Esta ação não pode ser desfeita.')) {
      return;
    }

    const { error } = await supabase.rpc('delete_ticket', {
      p_ticket_id: ticketId
    });

    if (error) {
      alert(`Erro ao excluir: ${error.message}`);
    } else {
      alert('✅ Ticket excluído com sucesso!');
      await loadTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(null);
      }
    }
  };

  const getCategoryInfo = (category: string) => {
    const categories: Record<string, { label: string; color: string; bg: string }> = {
      problemas: { label: 'Problemas', color: 'text-red-700', bg: 'bg-red-100' },
      contribuicao: { label: 'Contribuição', color: 'text-green-700', bg: 'bg-green-100' },
      pedir_atividades: { label: 'Pedir Atividades', color: 'text-purple-700', bg: 'bg-purple-100' },
    };
    return categories[category] || { label: category, color: 'text-gray-700', bg: 'bg-gray-100' };
  };

  const getStatusInfo = (status: string) => {
    const statuses: Record<string, { label: string; icon: any; color: string; bg: string }> = {
      aberto: { label: 'Aberto', icon: Clock, color: 'text-blue-700', bg: 'bg-blue-100' },
      em_andamento: { label: 'Em Andamento', icon: AlertCircle, color: 'text-yellow-700', bg: 'bg-yellow-100' },
      resolvido: { label: 'Resolvido', icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-100' },
      aprovado: { label: 'Aprovado', icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-100' },
      recusado: { label: 'Recusado', icon: XCircle, color: 'text-red-700', bg: 'bg-red-100' },
      atendido: { label: 'Atendido', icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-100' },
    };
    return statuses[status] || { label: status, icon: Clock, color: 'text-gray-700', bg: 'bg-gray-100' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesCategory = filterCategory === 'all' || ticket.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesSearch =
      searchTerm === '' ||
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesStatus && matchesSearch;
  });

  const ticketStats = {
    total: tickets.length,
    abertos: tickets.filter((t) => t.status === 'aberto').length,
    em_andamento: tickets.filter((t) => t.status === 'em_andamento').length,
    resolvidos: tickets.filter((t) => ['resolvido', 'aprovado', 'atendido'].includes(t.status)).length,
  };

  return (
    <AdminLayout>
      <div className="p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <Ticket className="w-10 h-10 text-purple-600" />
            Gestão de Tickets
          </h1>
          <p className="text-gray-600">Gerencie e responda todos os tickets de suporte</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-100">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-3xl font-bold text-gray-900">{ticketStats.total}</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 shadow-lg border-2 border-blue-200">
            <p className="text-sm text-blue-700 mb-1">Abertos</p>
            <p className="text-3xl font-bold text-blue-900">{ticketStats.abertos}</p>
          </div>

          <div className="bg-yellow-50 rounded-xl p-4 shadow-lg border-2 border-yellow-200">
            <p className="text-sm text-yellow-700 mb-1">Em Andamento</p>
            <p className="text-3xl font-bold text-yellow-900">{ticketStats.em_andamento}</p>
          </div>

          <div className="bg-green-50 rounded-xl p-4 shadow-lg border-2 border-green-200">
            <p className="text-sm text-green-700 mb-1">Resolvidos</p>
            <p className="text-3xl font-bold text-green-900">{ticketStats.resolvidos}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Buscar
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por título, usuário..."
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Categoria
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              >
                <option value="all">Todas</option>
                <option value="problemas">Problemas</option>
                <option value="contribuicao">Contribuição</option>
                <option value="pedir_atividades">Pedir Atividades</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              >
                <option value="all">Todos</option>
                <option value="aberto">Aberto</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="resolvido">Resolvido</option>
                <option value="aprovado">Aprovado</option>
                <option value="atendido">Atendido</option>
                <option value="recusado">Recusado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Tickets */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum ticket encontrado</h3>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Criado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTickets.map((ticket) => {
                  const categoryInfo = getCategoryInfo(ticket.category);
                  const statusInfo = getStatusInfo(ticket.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${categoryInfo.bg} ${categoryInfo.color}`}>
                          {categoryInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{ticket.user?.nome || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{ticket.user?.email || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{ticket.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{ticket.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 w-fit ${statusInfo.bg} ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(ticket.created_at)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewTicket(ticket)}
                            className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4 text-purple-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteTicket(ticket.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            title="Excluir ticket"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal de Detalhes */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-4xl w-full my-8">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Ticket className="w-8 h-8 text-white" />
                    <div>
                      <h3 className="text-2xl font-bold text-white">{selectedTicket.title}</h3>
                      <p className="text-white/80 text-sm">Ticket #{selectedTicket.id.substring(0, 8)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {/* Informações do Ticket */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Usuário
                      </p>
                      <p className="font-semibold text-gray-900">{selectedTicket.user?.nome}</p>
                      <p className="text-sm text-gray-600">{selectedTicket.user?.email}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Data de Criação
                      </p>
                      <p className="font-semibold text-gray-900">{formatDate(selectedTicket.created_at)}</p>
                    </div>

                    {selectedTicket.contact_email && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          Email de Contato
                        </p>
                        <p className="text-sm text-gray-900">{selectedTicket.contact_email}</p>
                      </div>
                    )}

                    {selectedTicket.contact_whatsapp && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          WhatsApp
                        </p>
                        <p className="text-sm text-gray-900">{selectedTicket.contact_whatsapp}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Descrição */}
                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Descrição
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.description}</p>
                  </div>
                </div>

                {/* Links/Arquivos */}
                {(selectedTicket.link || selectedTicket.file_url) && (
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-900 mb-2">Anexos</h4>
                    <div className="space-y-2">
                      {selectedTicket.link && (
                        <a
                          href={selectedTicket.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-600 hover:text-blue-700 underline text-sm"
                        >
                          🔗 {selectedTicket.link}
                        </a>
                      )}
                      {selectedTicket.file_url && (
                        <a
                          href={selectedTicket.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-600 hover:text-blue-700 underline text-sm"
                        >
                          📎 Download do arquivo
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Alterar Status */}
                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 mb-3">Alterar Status</h4>
                  <div className="flex gap-2 flex-wrap">
                    {['aberto', 'em_andamento', 'resolvido', 'aprovado', 'recusado', 'atendido'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleUpdateStatus(selectedTicket.id, status)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          selectedTicket.status === status
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {getStatusInfo(status).label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Respostas */}
                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Histórico de Respostas ({responses.length})
                  </h4>

                  {responses.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">Nenhuma resposta ainda</p>
                  ) : (
                    <div className="space-y-3 mb-4">
                      {responses.map((response) => (
                        <div
                          key={response.id}
                          className={`p-4 rounded-lg ${
                            response.is_internal ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-blue-50 border-2 border-blue-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded ${
                                response.is_internal ? 'bg-yellow-200 text-yellow-900' : 'bg-blue-200 text-blue-900'
                              }`}
                            >
                              {response.is_internal ? '🔒 Nota Interna' : '💬 Resposta'}
                            </span>
                            <span className="text-xs text-gray-500">{formatDate(response.created_at)}</span>
                          </div>
                          <p className="text-gray-700">{response.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Formulário de Nova Resposta */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <textarea
                      value={newResponse}
                      onChange={(e) => setNewResponse(e.target.value)}
                      placeholder="Digite sua resposta..."
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none mb-3"
                    />

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isInternal}
                          onChange={(e) => setIsInternal(e.target.checked)}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">Nota interna (não visível para o usuário)</span>
                      </label>

                      <button
                        onClick={handleSendResponse}
                        disabled={!newResponse.trim() || loadingResponse}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {loadingResponse ? (
                          'Enviando...'
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Enviar {isInternal ? 'Nota' : 'Resposta'}
                          </>
                        )}
                      </button>
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
