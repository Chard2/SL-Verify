'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AlertTriangle, Search, ExternalLink } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import type { Business } from '@/types'

export default function SimilarityPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [similarPairs, setSimilarPairs] = useState<Array<{business1: Business, business2: Business, similarity: number}>>([])
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchBusinesses()
  }, [])

  useEffect(() => {
    if (businesses.length > 0) {
      findSimilarBusinesses()
    }
  }, [businesses, searchQuery])

  const fetchBusinesses = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('name', { ascending: true })
        .limit(500)

      if (error) throw error
      setBusinesses(data || [])
    } catch (error) {
      console.error('Error fetching businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  const findSimilarBusinesses = () => {
    const pairs: Array<{business1: Business, business2: Business, similarity: number}> = []
    const processed = new Set<string>()

    for (let i = 0; i < businesses.length; i++) {
      for (let j = i + 1; j < businesses.length; j++) {
        const b1 = businesses[i]
        const b2 = businesses[j]
        const key = [b1.id, b2.id].sort().join('-')
        
        if (processed.has(key)) continue
        processed.add(key)

        const similarity = calculateSimilarity(b1.name.toLowerCase(), b2.name.toLowerCase())
        
        if (similarity > 0.6) {
          pairs.push({
            business1: b1,
            business2: b2,
            similarity: similarity
          })
        }
      }
    }

    pairs.sort((a, b) => b.similarity - a.similarity)
    setSimilarPairs(pairs.slice(0, 50))
  }

  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    if (longer.length === 0) return 1.0
    
    const distance = levenshteinDistance(longer, shorter)
    return (longer.length - distance) / longer.length
  }

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + cost
        )
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  const getRiskLevel = (similarity: number) => {
    if (similarity > 0.8) return { level: 'High', color: 'bg-red-100 text-red-700' }
    if (similarity > 0.6) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-700' }
    return { level: 'Low', color: 'bg-green-100 text-green-700' }
  }

  const filteredPairs = searchQuery 
    ? similarPairs.filter(pair => 
        pair.business1.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pair.business2.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : similarPairs

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" text="Analyzing businesses..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-gray-600">Monitor potential duplicate or similar business names ({similarPairs.length} alerts)</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <Input
          placeholder="Search similar businesses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Alerts List */}
      {filteredPairs.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Similarity Alerts</h3>
          <p className="text-gray-600">No businesses with similar names detected</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPairs.map((pair, index) => {
            const risk = getRiskLevel(pair.similarity)
            return (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${risk.color}`}>
                      {risk.level} Risk ({Math.round(pair.similarity * 100)}% similar)
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-1">{pair.business1.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">Reg: {pair.business1.registration_number}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/business/${pair.business1.id}`)}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-1">{pair.business2.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">Reg: {pair.business2.registration_number}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/business/${pair.business2.id}`)}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
