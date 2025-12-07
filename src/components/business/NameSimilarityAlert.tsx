'use client'

import React from 'react'
import { AlertTriangle, X } from 'lucide-react'
import type { SimilarBusiness } from '@/types'

interface NameSimilarityAlertProps {
  similar: SimilarBusiness[]
  onDismiss: () => void
}

export function NameSimilarityAlert({ similar, onDismiss }: NameSimilarityAlertProps) {
  if (similar.length === 0) return null

  return (
    <div 
      className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mb-6 animate-slide-up"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900 mb-2">
            ⚠️ Similar Business Names Detected
          </h3>
          <p className="text-sm text-amber-800 mb-3">
            We found {similar.length} business{similar.length > 1 ? 'es' : ''} with similar names. 
            This could indicate potential fraud or impersonation. Please verify carefully.
          </p>

          <div className="space-y-2">
            {similar.map((sim, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-lg p-3 border border-amber-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{sim.name}</p>
                    <p className="text-sm text-gray-600">
                      Registration: {sim.registration_number}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      sim.risk_level === 'high'
                        ? 'bg-red-100 text-red-800'
                        : sim.risk_level === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {sim.similarity_score}% similar
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      sim.risk_level === 'high'
                        ? 'bg-red-200 text-red-900'
                        : sim.risk_level === 'medium'
                        ? 'bg-yellow-200 text-yellow-900'
                        : 'bg-green-200 text-green-900'
                    }`}>
                      {sim.risk_level.toUpperCase()} RISK
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-amber-200">
            <p className="text-xs text-amber-700">
              <strong>How similarity is calculated:</strong> We use trigram matching and normalized 
              edit distance algorithms to compare business names. Scores above 85% are considered high risk.
            </p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="text-amber-600 hover:text-amber-800 transition-colors flex-shrink-0"
          aria-label="Dismiss alert"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}