'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Business } from '@/types'

export function useBusinesses() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchBusinesses()
  }, [])

  async function fetchBusinesses() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      setBusinesses(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function searchBusinesses(query: string, type: 'name' | 'number' = 'name') {
    try {
      setLoading(true)
      let data

      if (type === 'number') {
        const { data: result, error } = await supabase
          .from('businesses')
          .select('*')
          .ilike('registration_number', `%${query}%`)
        
        if (error) throw error
        data = result
      } else {
        const { data: result, error } = await supabase
          .rpc('search_businesses_by_name', { search_term: query } as any)
        
        if (error) throw error
        data = result
      }

      setBusinesses(data || [])
      return data || []
    } catch (err: any) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  async function getBusinessById(id: string) {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (err: any) {
      setError(err.message)
      return null
    }
  }

  return {
    businesses,
    loading,
    error,
    fetchBusinesses,
    searchBusinesses,
    getBusinessById
  }
}