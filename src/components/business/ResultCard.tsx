'use client'

import React from 'react'
import Link from 'next/link'
import { MapPin, Phone, Globe, ChevronRight } from 'lucide-react'
import { VerificationBadge } from './VerificationBadge'
import { formatDate } from '@/lib/utils/formatters'
import type { Business } from '@/types'

interface ResultCardProps {
  business: Business
}

export function ResultCard({ business }: ResultCardProps) {
  return (
    <Link href={`/business/${business.id}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group">
        {/* Header */}
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors truncate">
              {business.name}
            </h3>
            <p className="text-sm text-gray-600">
              Reg: {business.registration_number}
            </p>
          </div>
          <VerificationBadge 
            status={business.status} 
            score={business.authenticity_score} 
            size="sm"
          />
        </div>

        {/* Business Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-1">{business.address}</span>
          </div>
          
          {business.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>{business.phone}</span>
            </div>
          )}

          {business.website && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{business.website}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {business.sector && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                {business.sector}
              </span>
            )}
            {business.region && (
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                {business.region}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1 text-sm text-blue-600 font-medium group-hover:gap-2 transition-all">
            View Details
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Registration Date */}
        {business.registration_date && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Registered: {formatDate(business.registration_date)}
            </p>
          </div>
        )}
      </div>
    </Link>
  )
}