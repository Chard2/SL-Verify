'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

// Type definitions based on your database schema
interface Business {
  id: string
  name: string
  registration_number: string
  status: 'verified' | 'provisionally_verified' | 'unverified' | 'under_review'
  registration_date: string
  address: string
  phone?: string
  email?: string
  website?: string
  sector?: string
  region?: string
  authenticity_score: number
  certificate_url?: string
  created_at: string
  updated_at: string
}

export default function VerificationsPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Use useCallback to memoize the fetch function
  const fetchBusinesses = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBusinesses(data as Business[] || [])
    } catch (error) {
      console.error('Error fetching businesses:', error)
      setBusinesses([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBusinesses()
  }, [fetchBusinesses])

  // Apply filters
  const filteredBusinesses = businesses.filter(business => {
    // Apply status filter
    if (statusFilter !== 'all' && business.status !== statusFilter) {
      return false
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        business.name.toLowerCase().includes(query) ||
        business.registration_number.toLowerCase().includes(query) ||
        (business.sector?.toLowerCase() || '').includes(query) ||
        (business.region?.toLowerCase() || '').includes(query) ||
        (business.address?.toLowerCase() || '').includes(query)
      )
    }
    
    return true
  })

  // Calculate pagination values
  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedBusinesses = filteredBusinesses.slice(startIndex, endIndex)

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Handle items per page change
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value)
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Show first page, last page, and pages around current page
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)
      
      // Adjust if we're near the start
      if (currentPage <= 3) {
        startPage = 2
        endPage = 4
      }
      
      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3
        endPage = totalPages - 1
      }
      
      pageNumbers.push(1)
      if (startPage > 2) pageNumbers.push('...')
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }
      if (endPage < totalPages - 1) pageNumbers.push('...')
      if (totalPages > 1) pageNumbers.push(totalPages)
    }
    
    return pageNumbers
  }

  const getStatusColor = (status: Business['status']) => {
    switch(status) {
      case 'verified':
        return 'bg-green-50 text-green-700'
      case 'provisionally_verified':
        return 'bg-blue-50 text-blue-700'
      case 'under_review':
        return 'bg-yellow-50 text-yellow-700'
      case 'unverified':
        return 'bg-gray-50 text-gray-700'
      default:
        return 'bg-gray-50 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" text="Loading business verifications..." />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            View and manage all registered businesses
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          {[
            { 
              label: 'Total', 
              count: businesses.length, 
              color: 'bg-gray-50 border border-gray-200'
            },
            { 
              label: 'Verified', 
              count: businesses.filter(b => b.status === 'verified').length, 
              color: 'bg-green-50 border border-green-200'
            },
            { 
              label: 'Review', 
              count: businesses.filter(b => b.status === 'under_review').length, 
              color: 'bg-yellow-50 border border-yellow-200'
            },
            { 
              label: 'Pending', 
              count: businesses.filter(b => b.status === 'provisionally_verified' || b.status === 'unverified').length, 
              color: 'bg-red-100 border border-red-100'
            },
          ].map((stat, index) => (
            <div 
              key={index} 
              className={`rounded p-3 ${stat.color}`}
            >
              <div className="text-lg font-bold text-gray-900 mb-0.5">
                {stat.count}
              </div>
              <div className="text-xs text-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded border border-gray-200 p-3 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search businesses..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1) // Reset to first page when searching
                }}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1) // Reset to first page when filtering
                }}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All </option>
                <option value="verified">Verified</option>
                <option value="under_review">Under Review</option>
                <option value="provisionally_verified">Provisionally Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count and Items Per Page - FIXED FOR MOBILE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">
              {filteredBusinesses.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, filteredBusinesses.length)}
            </span> of <span className="font-semibold text-gray-900">{filteredBusinesses.length}</span> businesses
          </div>
          
          {/* Items per page selector - Desktop only, moved from mobile */}
          <div className="hidden md:flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">
              Show:
            </label>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600 whitespace-nowrap">per page</span>
          </div>
        </div>

        {/* Desktop Table (hidden on mobile) */}
        <div className="hidden md:block bg-white rounded border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Business Name
                  </th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Registration
                  </th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Contact
                  </th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Location
                  </th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedBusinesses.map((business) => (
                  <tr key={business.id} className="hover:bg-gray-50">
                    {/* Business Name Column */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <div className="text-xs font-medium text-gray-900">{business.name}</div>
                        {business.sector && (
                          <div className="text-xs text-gray-500">{business.sector}</div>
                        )}
                      </div>
                    </td>

                    {/* Registration Column */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-xs">
                        <div className="text-gray-900">{business.registration_number}</div>
                        <div className="text-gray-500">
                          {new Date(business.registration_date).toLocaleDateString()}
                        </div>
                      </div>
                    </td>

                    {/* Contact Column */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-xs space-y-0.5">
                        {business.phone && (
                          <div className="text-gray-700">{business.phone}</div>
                        )}
                        {business.email && (
                          <div className="text-gray-700">{business.email}</div>
                        )}
                        {business.website && (
                          <div className="text-blue-600">
                            {business.website.replace(/^https?:\/\//, '')}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Location Column */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-xs">
                        <div className="text-gray-700">{business.address}</div>
                        {business.region && (
                          <div className="text-gray-500">{business.region}</div>
                        )}
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(business.status)}`}>
                        <span className="capitalize">
                          {business.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>

                    {/* Score Column */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-xs">
                        <div className={`font-bold ${
                          business.authenticity_score >= 80 ? 'text-green-600' :
                          business.authenticity_score >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {business.authenticity_score}%
                        </div>
                        <div className="text-gray-500">
                          {new Date(business.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {filteredBusinesses.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-sm font-medium text-gray-900 mb-1">No businesses found</div>
              <p className="text-xs text-gray-500">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search criteria'
                  : 'No businesses registered'}
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-gray-600">
                  Page {currentPage} of {totalPages} • Updated just now
                </div>
                
                {/* Pagination Controls */}
                <div className="flex items-center gap-1">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded border ${
                      currentPage === 1
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {/* Page Numbers */}
                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page as number)}
                        className={`px-3 py-1 rounded border text-sm ${
                          currentPage === page
                            ? 'border-blue-500 bg-blue-50 text-blue-600 font-medium'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                  
                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded border ${
                      currentPage === totalPages
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Go to Page (Desktop only) */}
                <div className="hidden lg:flex items-center gap-2">
                  <span className="text-xs text-gray-600">Go to:</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const page = parseInt(e.target.value)
                      if (!isNaN(page) && page >= 1 && page <= totalPages) {
                        handlePageChange(page)
                      }
                    }}
                    onBlur={(e) => {
                      if (e.target.value === '') {
                        e.target.value = currentPage.toString()
                      }
                    }}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Cards (visible only on mobile) */}
        <div className="md:hidden space-y-3">
          {paginatedBusinesses.length === 0 ? (
            <div className="bg-white rounded border border-gray-200 p-6 text-center">
              <div className="text-sm font-medium text-gray-900 mb-1">No businesses found</div>
              <p className="text-xs text-gray-500">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search criteria'
                  : 'No businesses registered'}
              </p>
            </div>
          ) : (
            paginatedBusinesses.map((business) => (
              <div key={business.id} className="bg-white rounded border border-gray-200 p-4">
                {/* Card Header */}
                <div className="mb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{business.name}</h3>
                      <div className="text-xs text-gray-500 mt-0.5">{business.registration_number}</div>
                    </div>
                    <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(business.status)}`}>
                      <span className="capitalize">
                        {business.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Content - Grid Layout */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {/* Column 1 */}
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Reg Date</div>
                      <div className="text-xs text-gray-900">
                        {new Date(business.registration_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Score</div>
                      <div className={`text-xs font-bold ${
                        business.authenticity_score >= 80 ? 'text-green-600' :
                        business.authenticity_score >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {business.authenticity_score}%
                      </div>
                    </div>
                    {business.sector && (
                      <div>
                        <div className="text-xs text-gray-500 mb-0.5">Sector</div>
                        <div className="text-xs text-gray-900">{business.sector}</div>
                      </div>
                    )}
                  </div>

                  {/* Column 2 */}
                  <div className="space-y-2">
                    {business.phone && (
                      <div>
                        <div className="text-xs text-gray-500 mb-0.5">Phone</div>
                        <div className="text-xs text-gray-900">{business.phone}</div>
                      </div>
                    )}
                    {business.email && (
                      <div>
                        <div className="text-xs text-gray-500 mb-0.5">Email</div>
                        <div className="text-xs text-gray-900">{business.email}</div>
                      </div>
                    )}
                    {business.region && (
                      <div>
                        <div className="text-xs text-gray-500 mb-0.5">Region</div>
                        <div className="text-xs text-gray-900">{business.region}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address Section */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-0.5">Address</div>
                  <div className="text-xs text-gray-900">{business.address}</div>
                </div>

                {/* Footer */}
                <div className="pt-2 border-t border-gray-100 mt-2">
                  <div className="text-xs text-gray-500">
                    Updated: {new Date(business.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Mobile Pagination - CLEANED UP */}
        {filteredBusinesses.length > 0 && (
          <div className="md:hidden mt-4">
            <div className="bg-white rounded border border-gray-200 p-4">
              {/* Page info */}
              <div className="text-center mb-3">
                <div className="text-xs text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredBusinesses.length)} of {filteredBusinesses.length}
                </div>
              </div>
              
              {/* Simple Previous/Next controls */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-1 px-4 py-2 rounded text-sm font-medium ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </button>
                
                <div className="flex items-center gap-1">
                  {[currentPage - 1, currentPage, currentPage + 1]
                    .filter(page => page >= 1 && page <= totalPages)
                    .map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
                          currentPage === page
                            ? 'bg-blue-600 text-white font-medium'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-1 px-4 py-2 rounded text-sm font-medium ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}