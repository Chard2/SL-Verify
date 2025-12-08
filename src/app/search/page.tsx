'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  Filter, SlidersHorizontal, Search, Building2, MapPin, 
  Briefcase, CheckCircle, Clock, AlertCircle, XCircle,
  ArrowUpDown, Grid3x3, List, Sparkles, TrendingUp,
  Shield, X, ChevronDown, ChevronUp, Info
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { REGIONS, SECTORS, ITEMS_PER_PAGE } from '@/lib/constants'
import type { Business, SimilarBusiness } from '@/types'
import {Header} from '@/components/layout/Header'
import {Footer} from '@/components/layout/Footer'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([])
  const [similarBusinesses, setSimilarBusinesses] = useState<SimilarBusiness[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('relevance')
  const [filters, setFilters] = useState({
    status: '',
    region: '',
    sector: ''
  })
  const supabase = createClient()

  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setSearchQuery(query)
      performSearch(query, 'name')
    }
  }, [searchParams])

  useEffect(() => {
    applyFilters()
  }, [businesses, filters, sortBy])

  const performSearch = async (query: string, type: 'name' | 'number') => {
    setLoading(true)
    try {
      let results: Business[] = []

      if (type === 'name') {
        const { data, error } = await supabase
          .rpc('search_businesses_by_name', {
            search_term: query as string,
            similarity_threshold: 0.3
          } as any)
        
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

      setBusinesses(results)
      setCurrentPage(1)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const isRegNumber = searchQuery.match(/^SL-\d{4}-\d+$/i)
      performSearch(searchQuery, isRegNumber ? 'number' : 'name')
    }
  }

  const applyFilters = () => {
    let filtered = [...businesses]

    if (filters.status) {
      filtered = filtered.filter(b => b.status === filters.status)
    }

    if (filters.region) {
      filtered = filtered.filter(b => b.region === filters.region)
    }

    if (filters.sector) {
      filtered = filtered.filter(b => b.sector === filters.sector)
    }

    // Sort
    if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.registered_date || '').getTime() - new Date(a.registered_date || '').getTime())
    }

    setFilteredBusinesses(filtered)
    setCurrentPage(1)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({ status: '', region: '', sector: '' })
    setSearchQuery('')
    setSortBy('relevance')
    setBusinesses([])
    setFilteredBusinesses([])
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      verified: {
        label: 'Verified',
        icon: CheckCircle,
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        gradient: 'from-green-50 to-emerald-50'
      },
      provisionally_verified: {
        label: 'Provisionally Verified',
        icon: Clock,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        gradient: 'from-blue-50 to-cyan-50'
      },
      under_review: {
        label: 'Under Review',
        icon: AlertCircle,
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        gradient: 'from-yellow-50 to-orange-50'
      },
      unverified: {
        label: 'Unverified',
        icon: XCircle,
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        gradient: 'from-red-50 to-pink-50'
      }
    }
    return configs[status as keyof typeof configs] || configs.unverified
  }

  const totalPages = Math.ceil(filteredBusinesses.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedBusinesses = filteredBusinesses.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  const activeFiltersCount = Object.values(filters).filter(v => v).length
  const heroBgImage = '/work.jpg'

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header/>
      {/* Hero Search Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-16 relative overflow-hidden"
      style={{
          background: `
            linear-gradient(
              to bottom,
              rgba(5, 3, 62, 0.95) 0%,
              rgba(0, 9, 23, 0.92) 40%,
              rgba(0, 20, 87, 0.9) 100%
            ),
            url(${heroBgImage})
          `,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      > 
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        </div>
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full mb-4 border border-white/20">
              <Search className="w-4 h-4" />
              <span className="text-sm font-medium">Business Search</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find & Verify Businesses
            </h1>
            <p className="text-blue-100 text-lg">
              Search through thousands of registered businesses in Sierra Leone
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center px-6 py-4">
                  <Search className="w-6 h-6 text-gray-400 mr-4 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by business name or registration number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 text-lg text-gray-900 placeholder-gray-400 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        clearFilters()
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  )}
                  <button 
                    onClick={handleSearch}
                    className="ml-4 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex-shrink-0"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 text-center border border-white/20">
              <div className="text-2xl font-bold">{filteredBusinesses.length}</div>
              <div className="text-blue-200 text-sm">Results</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 text-center border border-white/20">
              <div className="text-2xl font-bold">{activeFiltersCount}</div>
              <div className="text-blue-200 text-sm">Active Filters</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 text-center border border-white/20">
              <div className="text-2xl font-bold">{businesses.filter(b => b.status === 'verified').length}</div>
              <div className="text-blue-200 text-sm">Verified</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sticky top-24">
              {/* Filters Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <SlidersHorizontal className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Filters</h3>
                        {activeFiltersCount > 0 && (
                          <p className="text-xs text-gray-600">{activeFiltersCount} active</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden p-2 hover:bg-white rounded-lg transition-colors"
                    >
                      {showFilters ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Filters Content */}
                <div className={`p-6 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                  {/* Status Filter */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <Shield className="w-4 h-4 text-blue-600" />
                      Verification Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-300 bg-gray-50"
                    >
                      <option value="">All Statuses</option>
                      <option value="verified">✓ Verified</option>
                      <option value="provisionally_verified">⏱ Provisionally Verified</option>
                      <option value="under_review">⚠ Under Review</option>
                      <option value="unverified">✗ Unverified</option>
                    </select>
                  </div>

                  {/* Region Filter */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      Region
                    </label>
                    <select
                      value={filters.region}
                      onChange={(e) => handleFilterChange('region', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-300 bg-gray-50"
                    >
                      <option value="">All Regions</option>
                      {REGIONS.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sector Filter */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      Business Sector
                    </label>
                    <select
                      value={filters.sector}
                      onChange={(e) => handleFilterChange('sector', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-300 bg-gray-50"
                    >
                      <option value="">All Sectors</option>
                      {SECTORS.map(sector => (
                        <option key={sector} value={sector}>{sector}</option>
                      ))}
                    </select>
                  </div>

                  {/* Clear Filters Button */}
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="w-full px-4 py-3 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Clear All Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Info Card */}
              <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Info className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Need Help?</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Use filters to narrow down your search results and find exactly what you're looking for.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Results Section */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Search Results
                  </h2>
                  <p className="text-gray-600">
                    <span className="font-semibold text-blue-600">{filteredBusinesses.length}</span> businesses found
                    {filteredBusinesses.length > 0 && (
                      <span className="text-gray-400 ml-2">
                        • Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredBusinesses.length)}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    <option value="relevance">Sort: Relevance</option>
                    <option value="name">Sort: Name</option>
                    <option value="date">Sort: Date</option>
                  </select>

                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <Grid3x3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Grid/List */}
            {loading ? (
              <div className="flex flex-col justify-center items-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 font-medium">Searching businesses...</p>
              </div>
            ) : paginatedBusinesses.length > 0 ? (
              <>
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
                  {paginatedBusinesses.map((business, idx) => {
                    const statusConfig = getStatusConfig(business.status)
                    const StatusIcon = statusConfig.icon
                    
                    return (
                      <div
                        key={business.id}
                        className="group bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-1"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        {/* Status Banner */}
                        <div className={`bg-gradient-to-r ${statusConfig.gradient} px-6 py-4 border-b ${statusConfig.border}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                              <span className={`text-sm font-semibold ${statusConfig.color}`}>
                                {statusConfig.label}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 font-mono bg-white px-3 py-1 rounded-lg">
                              {business.registration_number}
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {business.name}
                          </h3>

                          <div className="space-y-3 mb-6">
                            <div className="flex items-start gap-3">
                              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-gray-600">{business.region}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <Briefcase className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-gray-600">{business.sector}</p>
                              </div>
                            </div>
                            {business.directors && (
                              <div className="flex items-start gap-3">
                                <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm text-gray-600">
                                    {business.directors.length} Director{business.directors.length > 1 ? 's' : ''}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          <a 
                            href={`/business/${business.id}`}
                            className="block w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 transform group-hover:scale-105 shadow-lg hover:shadow-xl text-center"
                          >
                            View Full Profile
                          </a>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum = i + 1
                        if (totalPages > 5) {
                          if (currentPage > 3) pageNum = currentPage - 2 + i
                          if (currentPage > totalPages - 2) pageNum = totalPages - 4 + i
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-10 h-10 rounded-xl font-semibold transition-all ${
                              currentPage === pageNum
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {searchQuery || activeFiltersCount > 0 ? 'No Results Found' : 'Start Your Search'}
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6 leading-relaxed">
                  {searchQuery || activeFiltersCount > 0
                    ? 'No businesses match your current search criteria. Try adjusting your filters or search terms.'
                    : 'Enter a business name or registration number to begin searching through verified businesses.'}
                </p>
                {(searchQuery || activeFiltersCount > 0) && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
<Footer/>
      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}