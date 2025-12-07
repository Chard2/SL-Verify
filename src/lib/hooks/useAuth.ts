'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout

    const initializeAuth = async () => {
      try {
        console.log('🔍 useAuth: Starting initialization...')
        
        // Safety timeout - prevent infinite loading
        timeoutId = setTimeout(() => {
          if (mounted && !initialized) {
            console.log('⏰ Auth timeout - forcing initialization complete')
            setLoading(false)
            setInitialized(true)
          }
        }, 5000)
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        clearTimeout(timeoutId)
        
        console.log('useAuth session check:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          error: error?.message
        })
        
        if (mounted) {
          if (session?.user) {
            console.log('✅ useAuth: User found:', session.user.id)
            setUser(session.user)
          } else {
            console.log('❌ useAuth: No session/user found')
            setUser(null)
          }
          setLoading(false)
          setInitialized(true)
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        clearTimeout(timeoutId)
        if (mounted) {
          setUser(null)
          setLoading(false)
          setInitialized(true)
        }
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 useAuth: Auth state changed:', event, !!session)
        
        if (mounted) {
          if (session?.user) {
            setUser(session.user)
          } else {
            setUser(null)
          }
          setLoading(false)
          setInitialized(true)
        }
      }
    )

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [supabase])

  async function signIn(email: string, password: string) {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (data.user) {
        setUser(data.user)
      }
      
      return { data, error }
    } catch (error: any) {
      console.error('Sign in error:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    
    if (!error) {
      setUser(null)
    }
    
    return { error }
  }

  return {
    user,
    loading,
    initialized,
    signIn,
    signOut
  }
}