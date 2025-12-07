'use client'

import React from 'react'
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'
import type { Business } from '@/types'

interface VerificationBadgeProps {
  status: Business['status']
  score?: number
  size?: 'sm' | 'md' | 'lg'
  showScore?: boolean
}

export function VerificationBadge({ 
  status, 
  score, 
  size = 'md',
  showScore = true 
}: VerificationBadgeProps) {
  const configs = {
    verified: {
      icon: CheckCircle,
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300',
      label: 'Verified'
    },
    provisionally_verified: {
      icon: Clock,
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-300',
      label: 'Provisionally Verified'
    },
    unverified: {
      icon: XCircle,
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-300',
      label: 'Unverified'
    },
    under_review: {
      icon: AlertCircle,
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-300',
      label: 'Under Review'
    }
  }

  const sizes = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const config = configs[status]
  const Icon = config.icon

  return (
    <div 
      className={`inline-flex items-center gap-2 rounded-full border ${config.bg} ${config.text} ${config.border} ${sizes[size]} font-medium`}
      role="status"
      aria-label={`Status: ${config.label}${score ? `, Score: ${score}%` : ''}`}
    >
      <Icon className={iconSizes[size]} />
      <span>{config.label}</span>
      {showScore && score !== undefined && (
        <span className="ml-1 font-semibold">({score}%)</span>
      )}
    </div>
  )
}