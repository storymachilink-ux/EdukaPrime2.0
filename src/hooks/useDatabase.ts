import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { usePermissions } from './usePermissions'

export interface DatabaseAtividade {
  id: string
  title: string
  age_range: string
  description: string
  image?: string
  category: string
  niche?: string
  drive_url: string
  available_for_plans: number[]
  is_custom: boolean
  created_at: string
  updated_at: string
}

export interface DatabaseVideo {
  id: string
  title: string
  description: string
  youtube_url: string
  thumbnail?: string
  category: string
  duration?: string
  available_for_plans: number[]
  is_custom: boolean
  created_at: string
  updated_at: string
}

export interface DatabaseBonus {
  id: string
  title: string
  description: string
  drive_url: string
  icon?: string
  category: string
  available_for_plans: number[]
  is_custom: boolean
  created_at: string
  updated_at: string
}

export function useAtividades() {
  const [atividades, setAtividades] = useState<DatabaseAtividade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAdmin } = useAuth()
  const { currentPlanNumber } = usePermissions()

  const fetchAtividades = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('atividades')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Filter by plan access (unless admin)
      const filteredData = isAdmin
        ? data
        : data?.filter(item =>
            item.available_for_plans.includes(currentPlanNumber)
          ) || []

      setAtividades(filteredData)
    } catch (err: any) {
      console.error('Erro ao buscar atividades:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAtividades()
  }, [currentPlanNumber, isAdmin])

  const addAtividade = async (atividade: Omit<DatabaseAtividade, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('atividades')
        .insert([atividade])
        .select()
        .single()

      if (error) throw error

      setAtividades(prev => [data, ...prev])
      return { data, error: null }
    } catch (err: any) {
      console.error('Erro ao adicionar atividade:', err)
      return { data: null, error: err.message }
    }
  }

  const updateAtividade = async (id: string, updates: Partial<DatabaseAtividade>) => {
    try {
      const { data, error } = await supabase
        .from('atividades')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setAtividades(prev => prev.map(item => item.id === id ? data : item))
      return { data, error: null }
    } catch (err: any) {
      console.error('Erro ao atualizar atividade:', err)
      return { data: null, error: err.message }
    }
  }

  const deleteAtividade = async (id: string) => {
    try {
      const { error } = await supabase
        .from('atividades')
        .delete()
        .eq('id', id)

      if (error) throw error

      setAtividades(prev => prev.filter(item => item.id !== id))
      return { error: null }
    } catch (err: any) {
      console.error('Erro ao deletar atividade:', err)
      return { error: err.message }
    }
  }

  return {
    atividades,
    loading,
    error,
    addAtividade,
    updateAtividade,
    deleteAtividade,
    refetch: fetchAtividades
  }
}

export function useVideos() {
  const [videos, setVideos] = useState<DatabaseVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAdmin } = useAuth()
  const { currentPlanNumber } = usePermissions()

  const fetchVideos = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Filter by plan access (unless admin)
      const filteredData = isAdmin
        ? data
        : data?.filter(item =>
            item.available_for_plans.includes(currentPlanNumber)
          ) || []

      setVideos(filteredData)
    } catch (err: any) {
      console.error('Erro ao buscar vídeos:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [currentPlanNumber, isAdmin])

  const addVideo = async (video: Omit<DatabaseVideo, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .insert([video])
        .select()
        .single()

      if (error) throw error

      setVideos(prev => [data, ...prev])
      return { data, error: null }
    } catch (err: any) {
      console.error('Erro ao adicionar vídeo:', err)
      return { data: null, error: err.message }
    }
  }

  const updateVideo = async (id: string, updates: Partial<DatabaseVideo>) => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setVideos(prev => prev.map(item => item.id === id ? data : item))
      return { data, error: null }
    } catch (err: any) {
      console.error('Erro ao atualizar vídeo:', err)
      return { data: null, error: err.message }
    }
  }

  const deleteVideo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id)

      if (error) throw error

      setVideos(prev => prev.filter(item => item.id !== id))
      return { error: null }
    } catch (err: any) {
      console.error('Erro ao deletar vídeo:', err)
      return { error: err.message }
    }
  }

  return {
    videos,
    loading,
    error,
    addVideo,
    updateVideo,
    deleteVideo,
    refetch: fetchVideos
  }
}

export function useBonus() {
  const [bonus, setBonus] = useState<DatabaseBonus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAdmin } = useAuth()
  const { currentPlanNumber } = usePermissions()

  const fetchBonus = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('bonus')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Filter by plan access (unless admin)
      const filteredData = isAdmin
        ? data
        : data?.filter(item =>
            item.available_for_plans.includes(currentPlanNumber)
          ) || []

      setBonus(filteredData)
    } catch (err: any) {
      console.error('Erro ao buscar bônus:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBonus()
  }, [currentPlanNumber, isAdmin])

  const addBonus = async (bonusItem: Omit<DatabaseBonus, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('bonus')
        .insert([bonusItem])
        .select()
        .single()

      if (error) throw error

      setBonus(prev => [data, ...prev])
      return { data, error: null }
    } catch (err: any) {
      console.error('Erro ao adicionar bônus:', err)
      return { data: null, error: err.message }
    }
  }

  const updateBonus = async (id: string, updates: Partial<DatabaseBonus>) => {
    try {
      const { data, error } = await supabase
        .from('bonus')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setBonus(prev => prev.map(item => item.id === id ? data : item))
      return { data, error: null }
    } catch (err: any) {
      console.error('Erro ao atualizar bônus:', err)
      return { data: null, error: err.message }
    }
  }

  const deleteBonus = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bonus')
        .delete()
        .eq('id', id)

      if (error) throw error

      setBonus(prev => prev.filter(item => item.id !== id))
      return { error: null }
    } catch (err: any) {
      console.error('Erro ao deletar bônus:', err)
      return { error: err.message }
    }
  }

  return {
    bonus,
    loading,
    error,
    addBonus,
    updateBonus,
    deleteBonus,
    refetch: fetchBonus
  }
}