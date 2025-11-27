/**
 * Serviço para gerenciar Papercrafts
 * CRUD completo com validação de permissões
 */

import { supabase } from './supabase';
import {
  PaperCraft,
  PaperCraftCreateInput,
  PaperCraftUpdateInput,
} from '../types/papercraft';

/**
 * Buscar todos os papercrafts ativos
 */
export async function getPaperCrafts(filter?: {
  category?: string;
  difficulty?: string;
  minAge?: number;
  maxAge?: number;
}): Promise<PaperCraft[]> {
  try {
    let query = supabase
      .from('papercrafts')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

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
      console.error('❌ Erro ao buscar papercrafts:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar papercrafts:', error);
    return [];
  }
}

/**
 * Buscar um papercraft específico
 */
export async function getPaperCraftById(id: string): Promise<PaperCraft | null> {
  try {
    const { data, error } = await supabase
      .from('papercrafts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar papercraft:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar papercraft:', error);
    return null;
  }
}

/**
 * Buscar papercrafts por categoria
 */
export async function getPaperCraftsByCategory(category: string): Promise<PaperCraft[]> {
  try {
    const { data, error } = await supabase
      .from('papercrafts')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar papercrafts por categoria:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar papercrafts:', error);
    return [];
  }
}

/**
 * Criar novo papercraft (apenas admin)
 */
export async function createPaperCraft(
  input: PaperCraftCreateInput
): Promise<PaperCraft | null> {
  try {
    // 1. Validar campos obrigatórios
    if (!input.title || !input.category || !input.theme || !input.drive_folder_url) {
      throw new Error('Campos obrigatórios faltando: title, category, theme, drive_folder_url');
    }

    // 2. Obter ID do usuário autenticado
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) {
      throw new Error('Usuário não autenticado. Não é possível criar papercraft.');
    }

    console.log(`📝 Criando papercraft: ${input.title} - User: ${userId}`);

    // 3. Preparar dados para insert (evitar undefined/null em campos UUID)
    const papercraftData = {
      title: input.title,
      category: input.category,
      theme: input.theme,
      difficulty: input.difficulty || 'médio',
      description: input.description || '',
      model_count: input.model_count || '1',
      min_age: input.min_age || 0,
      max_age: input.max_age || 12,
      image_url: input.image_url || null,
      gif_url: input.gif_url || null,
      drive_folder_url: input.drive_folder_url,
      items_json: input.items_json || null,
      price: input.price || null,
      is_active: input.is_active !== false, // Default true
      created_by: userId, // ✅ SEMPRE adicionar o user ID aqui
    };

    // 4. Insert com dados validados
    const { data, error } = await supabase
      .from('papercrafts')
      .insert([papercraftData])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro Supabase ao criar papercraft:', error);
      console.error('❌ Dados enviados:', papercraftData);
      throw new Error(`Erro ao criar papercraft: ${error.message}`);
    }

    console.log('✅ Papercraft criado com sucesso:', data);
    return data;
  } catch (error) {
    console.error('❌ Erro geral ao criar papercraft:', error);
    throw error;
  }
}

/**
 * Atualizar papercraft (apenas admin)
 */
export async function updatePaperCraft(
  id: string,
  input: PaperCraftUpdateInput
): Promise<PaperCraft | null> {
  try {
    const { data, error } = await supabase
      .from('papercrafts')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar papercraft:', error);
      throw new Error(error.message);
    }

    console.log('✅ Papercraft atualizado com sucesso:', data);
    return data;
  } catch (error) {
    console.error('❌ Erro ao atualizar papercraft:', error);
    throw error;
  }
}

/**
 * Deletar papercraft (apenas admin)
 * Nota: usa soft delete (is_active = false)
 */
export async function deletePaperCraft(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('papercrafts')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao deletar papercraft:', error);
      throw new Error(error.message);
    }

    console.log('✅ Papercraft deletado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao deletar papercraft:', error);
    throw error;
  }
}

/**
 * Buscar todas as categorias únicas de papercrafts
 */
export async function getPaperCraftCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('papercrafts')
      .select('category')
      .eq('is_active', true)
      .order('category');

    if (error) {
      console.error('❌ Erro ao buscar categorias:', error);
      return [];
    }

    // Remover duplicatas
    const categories = data?.map((item) => item.category) || [];
    return [...new Set(categories)];
  } catch (error) {
    console.error('❌ Erro ao buscar categorias:', error);
    return [];
  }
}

/**
 * Registrar download de um papercraft
 */
export async function recordPaperCraftDownload(
  papercraftId: string,
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_downloads')
      .insert([
        {
          user_id: userId,
          papercraft_id: papercraftId,
          download_type: 'papercraft',
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
 * Upload de imagem para o Supabase Storage (image_url)
 */
export async function uploadImageToSupabase(file: File): Promise<string | null> {
  try {
    // Gerar um nome único para o arquivo
    const fileExtension = file.name.split('.').pop();
    const fileName = `papercraft-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const filePath = `papercrafts/images/${fileName}`;

    // Upload do arquivo
    const { error: uploadError } = await supabase.storage
      .from('papercrafts')
      .upload(filePath, file);

    if (uploadError) {
      console.error('❌ Erro ao fazer upload de imagem:', uploadError);
      throw new Error(uploadError.message);
    }

    // Obter URL pública
    const { data } = supabase.storage
      .from('papercrafts')
      .getPublicUrl(filePath);

    console.log('✅ Imagem enviada com sucesso:', data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error('❌ Erro ao fazer upload de imagem:', error);
    return null;
  }
}

/**
 * Upload de GIF para o Supabase Storage (gif_url)
 */
export async function uploadGifToSupabase(file: File): Promise<string | null> {
  try {
    // Gerar um nome único para o arquivo
    const fileName = `gif-${Date.now()}-${Math.random().toString(36).substring(7)}.gif`;
    const filePath = `papercrafts/gifs/${fileName}`;

    // Upload do arquivo
    const { error: uploadError } = await supabase.storage
      .from('papercrafts')
      .upload(filePath, file);

    if (uploadError) {
      console.error('❌ Erro ao fazer upload de GIF:', uploadError);
      throw new Error(uploadError.message);
    }

    // Obter URL pública
    const { data } = supabase.storage
      .from('papercrafts')
      .getPublicUrl(filePath);

    console.log('✅ GIF enviado com sucesso:', data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error('❌ Erro ao fazer upload de GIF:', error);
    return null;
  }
}
