'use client'

import React from 'react'
import { WifiOff } from 'lucide-react'
import { useOffline } from '@/lib/hooks/useOffline'

export function OfflineNotice() {
  const isOffline = useOffline()

  if (!isOffline) return null

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-yellow-500 text-white px-4 py-3 shadow-lg animate-slide-down">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <WifiOff className="w-5 h-5" />
        <p className="text-sm font-medium">
          You're offline. Some features may be limited. We'll sync your data when you're back online.
        </p>
      </div>
    </div>
  )
}