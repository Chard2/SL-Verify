'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Business } from '@/types'

interface SearchBarProps {
  onSearch: (results: Business[], query: string, type: 'name' | 'number') => void
  onSimilarityAlert?: (similar: any[]) => void
}

export function SearchBar({ onSearch, onSimilarityAlert }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState<'name' | 'number'>('name')
  const [suggestions, setSuggestions] = useState<Business[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Debounced search for suggestions
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(() => {
      fetchSuggestions()
    }, 300)

    return () => clearTimeout(timer)
  }, [query, searchType])

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchSuggestions = async () => {
    try {
      let data: Business[] = []

      if (searchType === 'name') {
        const { data: results, error } = await supabase
          .rpc('search_businesses_by_name', {
            search_term: query,
            similarity_threshold: 0.3
          } as any) // Fix: explicitly type as any to bypass type error
        
        if (error) throw error
        data = results || []
      } else {
        const { data: results, error } = await supabase
          .from('businesses')
          .select('*')
          .ilike('registration_number', `%${query}%`)
          .limit(5)
        
        if (error) throw error
        data = results || []
      }

      setSuggestions(data)
      setShowSuggestions(data.length > 0)
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    }
  }

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsSearching(true)
    setShowSuggestions(false)

    try {
      let results: Business[] = []

      if (searchType === 'name') {
        // Check for similar names first (fraud detection)
        // Remove type arg on .rpc, just use any in input. Type check similar defensively.
        const { data: similar, error: simError } = await supabase
          .rpc('find_similar_business_names', { business_name: query } as any);

        if (!simError && Array.isArray(similar) && (similar as Business[]).length > 0) {
          onSimilarityAlert?.(similar as Business[]);
        }
          // Then search
        const { data, error } = await supabase
          .rpc('search_businesses_by_name', {
            search_term: query,
            similarity_threshold: 0.3
          } as any); // Fix: explicitly type as any to bypass type error

        if (error) throw error
        results = data || []
      } else {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .ilike('registration_number', `%${query}%`)
        
        if (error) throw error
        results = data || []
      }

      onSearch(results, query, searchType)
    } catch (error) {
      console.error('Search error:', error)
      onSearch([], query, searchType)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSuggestionClick = (business: Business) => {
    setQuery(searchType === 'name' ? business.name : business.registration_number)
    setShowSuggestions(false)
    onSearch([business], business.name, searchType)
  }

  return (
    <div className="w-full max-w-3xl mx-auto" ref={searchRef}>
      {/* Search Type Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setSearchType('name')}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            searchType === 'name'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          aria-pressed={searchType === 'name'}
        >
          Search by Name
        </button>
        <button
          onClick={() => setSearchType('number')}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            searchType === 'number'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          aria-pressed={searchType === 'number'}
        >
          Search by Registration #
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder={
                searchType === 'name'
                  ? 'Enter business name...'
                  : 'Enter registration number (e.g., SL-2023-001234)'
              }
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              aria-label={`Search by ${searchType}`}
              aria-autocomplete="list"
              aria-controls="search-suggestions"
              aria-expanded={showSuggestions}
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('')
                  setSuggestions([])
                  setShowSuggestions(false)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            aria-label="Search"
          >
            {isSearching ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Search'
            )}
          </button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            id="search-suggestions"
            className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto"
            role="listbox"
          >
            {suggestions.map((business) => (
              <button
                key={business.id}
                onClick={() => handleSuggestionClick(business)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
                role="option"
              >
                <div className="font-medium text-gray-900">{business.name}</div>
                <div className="text-sm text-gray-600">
                  {business.registration_number} • {business.region}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Helper Text */}
      <p className="mt-2 text-sm text-gray-600">
        {searchType === 'name' 
          ? 'Search by business name with fuzzy matching'
          : 'Enter the full or partial registration number'
        }
      </p>
    </div>
  )
}
