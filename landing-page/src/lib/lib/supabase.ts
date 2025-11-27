import { createClient } from '@supabase/supabase-js'

// Carregar credenciais das variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validar que as variáveis existem
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '⚠️ Credenciais do Supabase não encontradas!\n' +
    'Verifique se o arquivo .env existe e contém:\n' +
    '- VITE_SUPABASE_URL\n' +
    '- VITE_SUPABASE_ANON_KEY'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          plano_ativo: number
          data_ativacao: string | null
          is_admin: boolean
          plano_teste: number | null
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          plano_ativo?: number
          data_ativacao?: string | null
          is_admin?: boolean
          plano_teste?: number | null
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          plano_ativo?: number
          data_ativacao?: string | null
          is_admin?: boolean
          plano_teste?: number | null
        }
      }
      atividades: {
        Row: {
          id: string
          title: string
          age_range: string
          description: string
          image: string | null
          category: string
          niche: string | null
          drive_url: string
          available_for_plans: number[]
          is_custom: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          age_range: string
          description: string
          image?: string | null
          category: string
          niche?: string | null
          drive_url: string
          available_for_plans?: number[]
          is_custom?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          age_range?: string
          description?: string
          image?: string | null
          category?: string
          niche?: string | null
          drive_url?: string
          available_for_plans?: number[]
          is_custom?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      videos: {
        Row: {
          id: string
          title: string
          description: string
          youtube_url: string
          thumbnail: string | null
          category: string
          duration: string | null
          available_for_plans: number[]
          is_custom: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          youtube_url: string
          thumbnail?: string | null
          category: string
          duration?: string | null
          available_for_plans?: number[]
          is_custom?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          youtube_url?: string
          thumbnail?: string | null
          category?: string
          duration?: string | null
          available_for_plans?: number[]
          is_custom?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      bonus: {
        Row: {
          id: string
          title: string
          description: string
          drive_url: string
          icon: string | null
          category: string
          available_for_plans: number[]
          is_custom: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          drive_url: string
          icon?: string | null
          category: string
          available_for_plans?: number[]
          is_custom?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          drive_url?: string
          icon?: string | null
          category?: string
          available_for_plans?: number[]
          is_custom?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}