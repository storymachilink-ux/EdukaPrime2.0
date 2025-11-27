/**
 * Serviço para gerenciar Atividades Educacionais
 * CRUD completo com validação de permissões
 */

import { supabase } from './supabase';
import {
  EducationalActivity,
  EducationalActivityCreateInput,
  EducationalActivityUpdateInput,
} from '../types/papercraft';

/**
 * Buscar todas as atividades educacionais ativas
 */
export async function getEducationalActivities(filter?: {
  subject?: string;
  difficulty?: string;
  category?: string;
  minAge?: number;
  maxAge?: number;
}): Promise<EducationalActivity[]> {
  try {
    let query = supabase
      .from('educational_activities')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (filter?.subject) {
      query = query.eq('subject', filter.subject);
    }

    if (filter?.category) {
      query = query.eq('category', filter.category);
    }

    if (filter?.difficulty) {
      query = query.eq('difficulty', filter.difficulty);
    }

    if (filter?.minAge !== undefined) {
      query = query.gte('min_age', filter.minAge);
    }

    if (filter?.maxAge !== undefined) {
      query = query.lte('max_age', filter.maxAge);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Erro ao buscar atividades:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar atividades:', error);
    return [];
  }
}

/**
 * Buscar uma atividade educacional específica
 */
export async function getEducationalActivityById(
  id: string
): Promise<EducationalActivity | null> {
  try {
    const { data, error } = await supabase
      .from('educational_activities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar atividade:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar atividade:', error);
    return null;
  }
}

/**
 * Buscar atividades por disciplina
 */
export async function getEducationalActivitiesBySubject(
  subject: string
): Promise<EducationalActivity[]> {
  try {
    const { data, error } = await supabase
      .from('educational_activities')
      .select('*')
      .eq('subject', subject)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar atividades por disciplina:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar atividades:', error);
    return [];
  }
}

/**
 * Buscar atividades por categoria
 */
export async function getEducationalActivitiesByCategory(
  category: string
): Promise<EducationalActivity[]> {
  try {
    const { data, error } = await supabase
      .from('educational_activities')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar atividades por categoria:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar atividades:', error);
    return [];
  }
}

/**
 * Criar nova atividade educacional (apenas admin)
 */
export async function createEducationalActivity(
  input: EducationalActivityCreateInput
): Promise<EducationalActivity | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) {
      throw new Error('Usuário não autenticado. Não é possível criar atividade.');
    }

    const { data, error } = await supabase
      .from('educational_activities')
      .insert([
        {
          ...input,
          created_by: userId,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar atividade:', error);
      throw new Error(error.message);
    }

    console.log('✅ Atividade criada com sucesso:', data);
    return data;
  } catch (error) {
    console.error('❌ Erro ao criar atividade:', error);
    throw error;
  }
}

/**
 * Atualizar atividade educacional (apenas admin)
 */
export async function updateEducationalActivity(
  id: string,
  input: EducationalActivityUpdateInput
): Promise<EducationalActivity | null> {
  try {
    const { data, error } = await supabase
      .from('educational_activities')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar atividade:', error);
      throw new Error(error.message);
    }

    console.log('✅ Atividade atualizada com sucesso:', data);
    return data;
  } catch (error) {
    console.error('❌ Erro ao atualizar atividade:', error);
    throw error;
  }
}

/**
 * Deletar atividade educacional (apenas admin)
 * Nota: usa soft delete (is_active = false)
 */
export async function deleteEducationalActivity(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('educational_activities')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao deletar atividade:', error);
      throw new Error(error.message);
    }

    console.log('✅ Atividade deletada com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao deletar atividade:', error);
    throw error;
  }
}

/**
 * Buscar todas as disciplinas únicas
 */
export async function getEducationalSubjects(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('educational_activities')
      .select('subject')
      .eq('is_active', true)
      .order('subject');

    if (error) {
      console.error('❌ Erro ao buscar disciplinas:', error);
      return [];
    }

    // Remover duplicatas
    const subjects = data?.map((item) => item.subject) || [];
    return [...new Set(subjects)];
  } catch (error) {
    console.error('❌ Erro ao buscar disciplinas:', error);
    return [];
  }
}

/**
 * Buscar todas as categorias únicas
 */
export async function getEducationalCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('educational_activities')
      .select('category')
      .eq('is_active', true)
      .order('category');

    if (error) {
      console.error('❌ Erro ao buscar categorias:', error);
      return [];
    }

    // Remover duplicatas e null
    const categories = data?.map((item) => item.category).filter(Boolean) || [];
    return [...new Set(categories)];
  } catch (error) {
    console.error('❌ Erro ao buscar categorias:', error);
    return [];
  }
}

/**
 * Registrar download de uma atividade
 */
export async function recordEducationalActivityDownload(
  activityId: string,
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_downloads')
      .insert([
        {
          user_id: userId,
          activity_id: activityId,
          download_type: 'activity',
        },
      ]);

    if (error) {
      console.error('❌ Erro ao registrar download:', error);
      return false;
    }

    console.log('✅ Download registrado');
    return true;
  } catch (error) {
    console.error('❌ Erro ao registrar download:', error);
    return false;
  }
}

/**
 * Incrementar contador de downloads de uma atividade
 */
export async function incrementActivityDownloadCount(
  activityId: string
): Promise<boolean> {
  try {
    // Buscar atividade atual
    const activity = await getEducationalActivityById(activityId);
    if (!activity) return false;

    // Incrementar contador
    const { error } = await supabase
      .from('educational_activities')
      .update({ download_count: (activity.download_count || 0) + 1 })
      .eq('id', activityId);

    if (error) {
      console.error('❌ Erro ao incrementar contador:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Erro ao incrementar contador:', error);
    return false;
  }
}
