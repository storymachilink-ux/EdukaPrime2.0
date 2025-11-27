import { supabase } from './supabase';

export type NotificationType =
  | 'badge'
  | 'new_content'
  | 'plan_expiring'
  | 'plan_expired'
  | 'system'
  | 'achievement'
  | 'download'
  | 'video'
  | 'bonus';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  metadata?: any;
  action_url?: string;
  action_label?: string;
  read: boolean;
  created_at: string;
  read_at?: string;
  is_pinned?: boolean;
  expires_at?: string;
  days_to_expire?: number;
  is_active?: boolean;
  target_audience?: string;
}

/**
 * Cria uma nova notificação para um usuário
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  options?: {
    icon?: string;
    metadata?: any;
    action_url?: string;
    action_label?: string;
  }
): Promise<{ success: boolean; notification?: Notification; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        icon: options?.icon,
        metadata: options?.metadata || {},
        action_url: options?.action_url,
        action_label: options?.action_label,
        read: false,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, notification: data };
  } catch (error: any) {
    console.error('Erro ao criar notificação:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Busca todas as notificações de um usuário
 */
export async function getUserNotifications(
  userId: string,
  options?: {
    limit?: number;
    unreadOnly?: boolean;
  }
): Promise<{ data: Notification[]; error?: string }> {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.unreadOnly) {
      query = query.eq('read', false);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data: data || [] };
  } catch (error: any) {
    console.error('Erro ao buscar notificações:', error);
    return { data: [], error: error.message };
  }
}

/**
 * Conta notificações não lidas
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error('Erro ao contar notificações não lidas:', error);
    return 0;
  }
}

/**
 * Marca uma notificação como lida
 */
export async function markAsRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', notificationId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao marcar notificação como lida:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Marca todas as notificações como lidas
 */
export async function markAllAsRead(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao marcar todas como lidas:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Deleta uma notificação
 */
export async function deleteNotification(notificationId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('notifications').delete().eq('id', notificationId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao deletar notificação:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Deleta todas as notificações lidas de um usuário
 */
export async function deleteAllRead(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .eq('read', true);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao deletar notificações lidas:', error);
    return { success: false, error: error.message };
  }
}

// ========== NOTIFICAÇÕES ESPECÍFICAS ==========

/**
 * Cria notificação de badge conquistada
 */
export async function notifyBadgeEarned(
  userId: string,
  badgeName: string,
  badgeIcon: string,
  badgeId: string
) {
  return createNotification(userId, 'badge', '🏆 Nova Conquista!', `Você conquistou a badge "${badgeName}"!`, {
    icon: badgeIcon,
    metadata: { badge_id: badgeId },
    action_url: '/dashboard',
    action_label: 'Ver Conquistas',
  });
}

/**
 * Cria notificação de novo conteúdo disponível
 */
export async function notifyNewContent(
  userId: string,
  contentType: 'atividade' | 'video' | 'bonus',
  contentTitle: string,
  contentId: string
) {
  const icons = {
    atividade: '📚',
    video: '🎥',
    bonus: '🎁',
  };

  const types = {
    atividade: 'Nova Atividade',
    video: 'Novo Vídeo',
    bonus: 'Novo Bônus',
  };

  const urls = {
    atividade: '/atividades',
    video: '/videos',
    bonus: '/bonus',
  };

  return createNotification(
    userId,
    'new_content',
    `${icons[contentType]} ${types[contentType]} Disponível!`,
    `${contentTitle} foi adicionado à plataforma!`,
    {
      icon: icons[contentType],
      metadata: { content_type: contentType, content_id: contentId },
      action_url: urls[contentType],
      action_label: 'Ver Agora',
    }
  );
}

/**
 * Cria notificação de plano expirando
 */
export async function notifyPlanExpiring(userId: string, daysLeft: number) {
  return createNotification(
    userId,
    'plan_expiring',
    '⚠️ Plano Expirando',
    `Seu plano expira em ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}. Renove para continuar com acesso total!`,
    {
      icon: '⚠️',
      metadata: { days_left: daysLeft },
      action_url: '/planos',
      action_label: 'Renovar Plano',
    }
  );
}

/**
 * Cria notificação de plano expirado
 */
export async function notifyPlanExpired(userId: string) {
  return createNotification(
    userId,
    'plan_expired',
    '🔒 Plano Expirado',
    'Seu plano expirou. Renove agora para recuperar o acesso aos conteúdos!',
    {
      icon: '🔒',
      action_url: '/planos',
      action_label: 'Renovar Agora',
    }
  );
}

/**
 * Cria notificação de sistema/admin
 */
export async function notifySystem(userId: string, title: string, message: string, icon?: string) {
  return createNotification(userId, 'system', title, message, {
    icon: icon || '📢',
  });
}

// ========== FUNÇÕES ADMINISTRATIVAS ==========

/**
 * Envia notificação para múltiplos usuários (broadcast)
 */
export async function sendBroadcastNotification(
  type: NotificationType,
  title: string,
  message: string,
  options?: {
    icon?: string;
    action_url?: string;
    action_label?: string;
    is_pinned?: boolean;
    days_to_expire?: number;
    target_audience?: 'all' | 'plan_1' | 'plan_2' | 'plan_3';
  }
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    let userIds: string[] = [];

    // Buscar usuários baseado no público alvo
    if (options?.target_audience === 'all') {
      const { data, error } = await supabase.from('users').select('id');
      if (error) throw error;
      userIds = data.map((u) => u.id);
    } else if (options?.target_audience?.startsWith('plan_')) {
      const planNumber = parseInt(options.target_audience.split('_')[1]);
      const { data, error } = await supabase.from('users').select('id').eq('plano_ativo', planNumber);
      if (error) throw error;
      userIds = data.map((u) => u.id);
    }

    // Criar notificações em lote
    const notifications = userIds.map((userId) => ({
      user_id: userId,
      type,
      title,
      message,
      icon: options?.icon || '📢',
      action_url: options?.action_url,
      action_label: options?.action_label,
      is_pinned: options?.is_pinned || false,
      days_to_expire: options?.days_to_expire,
      target_audience: options?.target_audience || 'all',
      read: false,
      is_active: true,
    }));

    const { error } = await supabase.from('notifications').insert(notifications);

    if (error) throw error;

    return { success: true, count: notifications.length };
  } catch (error: any) {
    console.error('Erro ao enviar broadcast:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Busca todas as notificações (admin)
 */
export async function getAllNotificationsAdmin(filters?: {
  type?: NotificationType;
  is_active?: boolean;
  is_pinned?: boolean;
}): Promise<{ data: any[]; error?: string }> {
  try {
    let query = supabase
      .from('notifications')
      .select('*, users(nome, email)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }
    if (filters?.is_pinned !== undefined) {
      query = query.eq('is_pinned', filters.is_pinned);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data: data || [] };
  } catch (error: any) {
    console.error('Erro ao buscar notificações admin:', error);
    return { data: [], error: error.message };
  }
}

/**
 * Desativa notificações expiradas manualmente
 */
export async function deactivateExpiredNotifications(): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('deactivate_expired_notifications');

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao desativar notificações expiradas:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Deleta uma notificação (admin)
 */
export async function deleteNotificationAdmin(notificationId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('notifications').delete().eq('id', notificationId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao deletar notificação (admin):', error);
    return { success: false, error: error.message };
  }
}

/**
 * Atualiza uma notificação (admin)
 */
export async function updateNotificationAdmin(
  notificationId: string,
  updates: Partial<Notification>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('notifications').update(updates).eq('id', notificationId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao atualizar notificação (admin):', error);
    return { success: false, error: error.message };
  }
}
