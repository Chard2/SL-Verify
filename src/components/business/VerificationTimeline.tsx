'use client'

import React, { useEffect, useState } from 'react'
import { CheckCircle, Clock, FileText, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime } from '@/lib/utils/formatters'
import type { VerificationEvent } from '@/types'

interface VerificationTimelineProps {
  businessId: string
}

export function VerificationTimeline({ businessId }: VerificationTimelineProps) {
  const [events, setEvents] = useState<VerificationEvent[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchEvents()

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`verification-events-${businessId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'verification_events',
          filter: `business_id=eq.${businessId}`
        },
        (payload) => {
          setEvents(prev => [payload.new as VerificationEvent, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [businessId])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('verification_events')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        // If table doesn't exist, silently fail and show empty state
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.warn('Verification events table not found. Run the database migration.')
          setEvents([])
          return
        }
        throw error
      }
      setEvents(data || [])
    } catch (error: any) {
      console.error('Error fetching events:', error)
      // Set empty array on error to show empty state instead of crashing
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'verified':
      case 'approved':
        return CheckCircle
      case 'document_uploaded':
        return Upload
      case 'under_review':
        return Clock
      default:
        return FileText
    }
  }

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'verified':
      case 'approved':
        return 'bg-green-100 text-green-600'
      case 'document_uploaded':
        return 'bg-blue-100 text-blue-600'
      case 'under_review':
        return 'bg-yellow-100 text-yellow-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>No verification history available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Verification History
      </h3>

      <div className="space-y-3">
        {events.map((event, index) => {
          const Icon = getEventIcon(event.event_type)
          const colorClass = getEventColor(event.event_type)

          return (
            <div 
              key={event.id}
              className="flex gap-3 pb-4 border-b border-gray-100 last:border-0"
            >
              <div className={`p-2 rounded-full ${colorClass} flex-shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-medium text-gray-900 capitalize">
                    {event.event_type.replace(/_/g, ' ')}
                  </p>
                  <time className="text-xs text-gray-500 whitespace-nowrap">
                    {formatRelativeTime(event.created_at)}
                  </time>
                </div>
                
                {event.description && (
                  <p className="text-sm text-gray-600">{event.description}</p>
                )}
                
                {event.metadata && (
                  <div className="mt-2 text-xs text-gray-500">
                    {JSON.stringify(event.metadata)}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}