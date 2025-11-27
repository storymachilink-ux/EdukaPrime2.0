/**
 * Tipos para Papercrafts
 */

export interface PaperCraftItem {
  nº: string;
  nome: string;
  dificuldade: 'Fácil' | 'Médio' | 'Difícil';
  faixa_etaria: string;
  tema: string;
  tipo: 'Papercraft' | 'Atividade';
}

export interface PaperCraft {
  id: string;
  title: string;
  category: string;
  theme?: 'Natal' | 'Halloween'; // Tema da coleção
  difficulty: 'fácil' | 'médio' | 'difícil';
  description: string;
  model_count: string;
  min_age: number;
  max_age: number;
  image_url?: string;
  gif_url?: string; // GIF animado para o modal
  drive_folder_url?: string;
  items_json?: PaperCraftItem[]; // Lista de papers dentro da coleção
  price?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface PaperCraftCreateInput {
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
  is_active?: boolean;
}

export interface PaperCraftUpdateInput {
  title?: string;
  category?: string;
  theme?: 'Natal' | 'Halloween';
  difficulty?: 'fácil' | 'médio' | 'difícil';
  description?: string;
  model_count?: string;
  min_age?: number;
  max_age?: number;
  image_url?: string;
  gif_url?: string;
  drive_folder_url?: string;
  items_json?: PaperCraftItem[];
  price?: number;
  is_active?: boolean;
}

/**
 * Tipos para Atividades Educacionais
 */

export interface EducationalActivity {
  id: string;
  title: string;
  subject: string;
  difficulty: 'fácil' | 'médio' | 'difícil';
  description: string;
  category?: string;
  min_age: number;
  max_age: number;
  has_answer_key: boolean;
  content_url?: string;
  image_url?: string;
  download_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface EducationalActivityCreateInput {
  title: string;
  subject: string;
  difficulty: 'fácil' | 'médio' | 'difícil';
  description: string;
  category?: string;
  min_age: number;
  max_age: number;
  has_answer_key?: boolean;
  content_url?: string;
  image_url?: string;
  is_active?: boolean;
}

export interface EducationalActivityUpdateInput {
  title?: string;
  subject?: string;
  difficulty?: 'fácil' | 'médio' | 'difícil';
  description?: string;
  category?: string;
  min_age?: number;
  max_age?: number;
  has_answer_key?: boolean;
  content_url?: string;
  image_url?: string;
  is_active?: boolean;
}

/**
 * Tipos para Downloads
 */

export interface UserDownload {
  id: string;
  user_id: string;
  activity_id?: string;
  papercraft_id?: string;
  download_type: 'activity' | 'papercraft';
  downloaded_at: string;
}

export interface UserDownloadCreateInput {
  activity_id?: string;
  papercraft_id?: string;
  download_type: 'activity' | 'papercraft';
}
