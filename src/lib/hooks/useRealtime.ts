'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function useRealtimeBusinesses(businessId: string | null, onUpdate: (payload: any) => void) {
  const supabase = createClient()

  useEffect(() => {
    if (!businessId) return

    const channel: RealtimeChannel = supabase
      .channel(`business-${businessId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'businesses',
          filter: `id=eq.${businessId}`
        },
        (payload) => {
          onUpdate(payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [businessId])
}
