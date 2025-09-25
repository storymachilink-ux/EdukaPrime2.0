import React, { useState } from 'react';
import { User, Mail, Calendar, Award, CreditCard as Edit3, Save, X } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { useAuth } from '../../../hooks/useAuth';

export const Perfil: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '(11) 99999-9999',
    school: 'Escola Exemplo',
    bio: 'Professora apaixonada por educação infantil com mais de 5 anos de experiência.'
  });

  const handleSave = () => {
    // Aqui você salvaria os dados editados
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      name: user?.name || '',
      email: user?.email || '',
      phone: '(11) 99999-9999',
      school: 'Escola Exemplo',
      bio: 'Professora apaixonada por educação infantil com mais de 5 anos de experiência.'
    });
    setIsEditing(false);
  };

  const stats = [
    { label: 'Atividades Concluídas', value: '45' },
    { label: 'Vídeos Assistidos', value: '28' },
    { label: 'Downloads Realizados', value: '67' },
    { label: 'Dias de Uso', value: '89' }
  ];

  const getPlanInfo = (plan: string) => {
    switch (plan) {
      case 'comecar':
        return { name: 'Plano Começar', color: 'bg-[#F7D7D2] text-[#1F1F1F]' };
      case 'evoluir':
        return { name: 'Plano Evoluir', color: 'bg-[#FBE7A2] text-[#1F1F1F]' };
      case 'tudo-em-um':
        return { name: 'Plano Tudo em Um', color: 'bg-[#059669] text-white' };
      default:
        return { name: 'Plano Básico', color: 'bg-gray-200 text-gray-800' };
    }
  };

  const planInfo = getPlanInfo(user?.plan || 'comecar');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1F1F1F] dark:text-[#F5F5F5] mb-2">
            Perfil
          </h1>
          <p className="text-[#5C5C5C] dark:text-[#A3A3A3]">
            Gerencie suas informações pessoais
          </p>
        </div>
        
        {!isEditing ? (
          <Button variant="secondary" size="md" onClick={() => setIsEditing(true)}>
            <Edit3 className="w-4 h-4 mr-2" />
            Editar Perfil
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-start gap-6 mb-6">
              <div className="relative">
                <img
                  src={user?.avatar || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'}
                  alt={user?.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                {isEditing && (
                  <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#111111] text-white rounded-full flex items-center justify-center text-xs">
                    <Edit3 className="w-3 h-3" />
                  </button>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className={planInfo.color}>
                    <Award className="w-3 h-3 mr-1" />
                    {planInfo.name}
                  </Badge>
                </div>
                
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="text-xl font-bold bg-[#F2E9E6] dark:bg-[#252119] border border-[#E9DCD7] dark:border-[#2A2A2A] rounded-[8px] px-3 py-2 text-[#1F1F1F] dark:text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#111111] dark:focus:ring-white"
                    />
                    <textarea
                      value={editData.bio}
                      onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                      rows={3}
                      className="w-full bg-[#F2E9E6] dark:bg-[#252119] border border-[#E9DCD7] dark:border-[#2A2A2A] rounded-[8px] px-3 py-2 text-[#5C5C5C] dark:text-[#A3A3A3] focus:outline-none focus:ring-2 focus:ring-[#111111] dark:focus:ring-white resize-none"
                      placeholder="Conte um pouco sobre você..."
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-[#1F1F1F] dark:text-[#F5F5F5] mb-2">
                      {editData.name}
                    </h2>
                    <p className="text-[#5C5C5C] dark:text-[#A3A3A3] leading-relaxed">
                      {editData.bio}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#5C5C5C] dark:text-[#A3A3A3]" />
                  <div>
                    <p className="text-sm text-[#5C5C5C] dark:text-[#A3A3A3]">E-mail</p>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        className="bg-[#F2E9E6] dark:bg-[#252119] border border-[#E9DCD7] dark:border-[#2A2A2A] rounded-[6px] px-2 py-1 text-[#1F1F1F] dark:text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-[#111111] dark:focus:ring-white"
                      />
                    ) : (
                      <p className="font-medium text-[#1F1F1F] dark:text-[#F5F5F5]">{editData.email}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-[#5C5C5C] dark:text-[#A3A3A3]" />
                  <div>
                    <p className="text-sm text-[#5C5C5C] dark:text-[#A3A3A3]">Telefone</p>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        className="bg-[#F2E9E6] dark:bg-[#252119] border border-[#E9DCD7] dark:border-[#2A2A2A] rounded-[6px] px-2 py-1 text-[#1F1F1F] dark:text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-[#111111] dark:focus:ring-white"
                      />
                    ) : (
                      <p className="font-medium text-[#1F1F1F] dark:text-[#F5F5F5]">{editData.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#5C5C5C] dark:text-[#A3A3A3]" />
                  <div>
                    <p className="text-sm text-[#5C5C5C] dark:text-[#A3A3A3]">Membro desde</p>
                    <p className="font-medium text-[#1F1F1F] dark:text-[#F5F5F5]">Janeiro 2024</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-[#5C5C5C] dark:text-[#A3A3A3]" />
                  <div>
                    <p className="text-sm text-[#5C5C5C] dark:text-[#A3A3A3]">Instituição</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.school}
                        onChange={(e) => setEditData({ ...editData, school: e.target.value })}
                        className="bg-[#F2E9E6] dark:bg-[#252119] border border-[#E9DCD7] dark:border-[#2A2A2A] rounded-[6px] px-2 py-1 text-[#1F1F1F] dark:text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-[#111111] dark:focus:ring-white"
                      />
                    ) : (
                      <p className="font-medium text-[#1F1F1F] dark:text-[#F5F5F5]">{editData.school}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Stats */}
        <div className="space-y-6">
          <Card>
            <h3 className="font-bold text-[#1F1F1F] dark:text-[#F5F5F5] mb-4">
              Estatísticas
            </h3>
            <div className="space-y-4">
              {stats.map((stat, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-[#5C5C5C] dark:text-[#A3A3A3]">{stat.label}</span>
                  <span className="font-bold text-[#1F1F1F] dark:text-[#F5F5F5]">{stat.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="text-center">
            <h3 className="font-bold text-[#1F1F1F] dark:text-[#F5F5F5] mb-2">
              Nível Educador
            </h3>
            <div className="w-16 h-16 mx-auto mb-3 bg-[#FBE7A2] dark:bg-[#2A2417] rounded-full flex items-center justify-center">
              <Award className="w-8 h-8 text-[#111111] dark:text-[#F5F5F5]" />
            </div>
            <p className="text-lg font-bold text-[#1F1F1F] dark:text-[#F5F5F5] mb-1">Especialista</p>
            <p className="text-sm text-[#5C5C5C] dark:text-[#A3A3A3]">
              Você desbloqueou 75% do conteúdo
            </p>
            <div className="mt-3 bg-[#F2E9E6] dark:bg-[#252119] rounded-full h-2">
              <div className="bg-[#059669] dark:bg-[#10B981] h-2 rounded-full" style={{ width: '75%' }} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};