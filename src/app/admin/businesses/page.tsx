'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Building2, 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Filter,
  ChevronLeft,
  ChevronRight,
  Check,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatDate } from '@/lib/utils/formatters'
import type { Business } from '@/types'

const ITEMS_PER_PAGE = 10
const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'verified', label: 'Verified' },
  { value: 'provisionally_verified', label: 'Provisionally Verified' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'unverified', label: 'Unverified' }
] as const

type SortField = 'name' | 'registration_date' | 'authenticity_score' | 'created_at'
type SortDirection = 'asc' | 'desc'

// Delete Confirmation Modal Component
function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  isDeleting 
}: { 
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isDeleting: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fadeIn">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {message}
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  {isDeleting ? (
                    <LoadingSpinner size="sm" text="Deleting..." />
                  ) : (
                    'Delete'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple Checkbox Component
function SimpleCheckbox({ 
  checked, 
  onChange, 
  disabled = false,
  className = ''
}: { 
  checked: boolean; 
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={`flex items-center justify-center w-5 h-5 rounded border ${
        checked 
          ? 'bg-blue-600 border-blue-600' 
          : 'bg-white border-gray-300'
      } ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400'
      } ${className}`}
      aria-checked={checked}
      role="checkbox"
    >
      {checked && (
        <Check className="w-3 h-3 text-white" strokeWidth={3} />
      )}
    </button>
  )
}

// Simple Badge Component
function SimpleBadge({ 
  children, 
  variant = 'default',
  className = ''
}: { 
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'danger' | 'outline';
  className?: string;
}) {
  const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors'
  
  const variantStyles = {
    default: 'bg-blue-100 text-blue-800 border border-blue-200',
    secondary: 'bg-gray-100 text-gray-800 border border-gray-200',
    danger: 'bg-red-100 text-red-800 border border-red-200',
    outline: 'border border-gray-300 text-gray-700 bg-transparent'
  }

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  )
}

export default function BusinessesPage() {
  const router = useRouter()
  const supabase = createClient()
  
  // State management
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedBusinesses, setSelectedBusinesses] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState<{
    id: string;
    name: string;
    isOpen: boolean;
  } | null>(null)
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [totalCount, setTotalCount] = useState(0)

  // Fetch businesses with pagination and filters
  const fetchBusinesses = useCallback(async () => {
    try {
      setLoading(true)
      
      // Build query
      let query = supabase
        .from('businesses')
        .select('*', { count: 'exact' })
      
      // Apply filters
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }
      
      if (searchQuery) {
        query = query.or(`
          name.ilike.%${searchQuery}%,
          registration_number.ilike.%${searchQuery}%,
          email.ilike.%${searchQuery}%,
          sector.ilike.%${searchQuery}%
        `)
      }
      
      // Apply sorting
      query = query.order(sortField, { 
        ascending: sortDirection === 'asc' 
      })
      
      // Apply pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1
      query = query.range(from, to)
      
      const { data, error, count } = await query
      
      if (error) throw error
      
      setBusinesses(data || [])
      setTotalCount(count || 0)
      
    } catch (error) {
      console.error('Error fetching businesses:', error)
      setMessage({ 
        type: 'error', 
        text: 'Failed to load businesses. Please try again.' 
      })
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchQuery, statusFilter, sortField, sortDirection])

  useEffect(() => {
    fetchBusinesses()
  }, [fetchBusinesses])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedBusinesses.size === businesses.length) {
      setSelectedBusinesses(new Set())
    } else {
      setSelectedBusinesses(new Set(businesses.map(b => b.id)))
    }
  }

  const toggleSelectBusiness = (businessId: string) => {
    const newSelected = new Set(selectedBusinesses)
    if (newSelected.has(businessId)) {
      newSelected.delete(businessId)
    } else {
      newSelected.add(businessId)
    }
    setSelectedBusinesses(newSelected)
  }

  // Delete handlers
  const handleDeleteClick = (businessId: string, businessName: string) => {
    setDeleteModal({
      id: businessId,
      name: businessName,
      isOpen: true
    })
  }

  const handleBulkDeleteClick = () => {
    if (selectedBusinesses.size > 0) {
      setBulkDeleteModal(true)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal) return

    try {
      setDeletingId(deleteModal.id)
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', deleteModal.id)

      if (error) throw error

      setMessage({ 
        type: 'success', 
        text: `Business "${deleteModal.name}" deleted successfully` 
      })
      setSelectedBusinesses(prev => {
        const newSet = new Set(prev)
        newSet.delete(deleteModal.id)
        return newSet
      })
      await fetchBusinesses()
      
    } catch (error) {
      console.error('Error deleting business:', error)
      setMessage({ 
        type: 'error', 
        text: 'Failed to delete business. Please try again.' 
      })
    } finally {
      setDeletingId(null)
      setDeleteModal(null)
    }
  }

  const handleBulkDeleteConfirm = async () => {
    try {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .in('id', Array.from(selectedBusinesses))

      if (error) throw error

      const count = selectedBusinesses.size
      setMessage({ 
        type: 'success', 
        text: `Successfully deleted ${count} business${count > 1 ? 'es' : ''}` 
      })
      setSelectedBusinesses(new Set())
      await fetchBusinesses()
      
    } catch (error) {
      console.error('Error deleting businesses:', error)
      setMessage({ 
        type: 'error', 
        text: 'Failed to delete businesses. Please try again.' 
      })
    } finally {
      setBulkDeleteModal(false)
    }
  }

  // Sort handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const config = {
      verified: { 
        label: 'Verified', 
        className: 'bg-green-100 text-green-800 border-green-200',
      },
      provisionally_verified: { 
        label: 'Provisionally Verified', 
        className: 'bg-blue-100 text-blue-800 border-blue-200',
      },
      under_review: { 
        label: 'Under Review', 
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      },
      unverified: { 
        label: 'Unverified', 
        className: 'bg-red-100 text-gray-800 border-gray-200',
      }
    }

    const { label, className } = config[status as keyof typeof config] || config.unverified

    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
        {label}
      </span>
    )
  }

  // Score indicator component
  const ScoreIndicator = ({ score }: { score: number }) => {
    const getColor = (score: number) => {
      if (score >= 80) return 'bg-green-500'
      if (score >= 60) return 'bg-yellow-500'
      return 'bg-red-500'
    }

    return (
      <div className="flex items-center gap-1">
        <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
          <div 
            className={`h-full ${getColor(score)} transition-all duration-300`}
            style={{ width: `${Math.min(score, 100)}%` }}
          />
        </div>
        <span className={`text-xs font-semibold whitespace-nowrap ${
          score >= 80 ? 'text-green-600' :
          score >= 60 ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {score}%
        </span>
      </div>
    )
  }

  // Pagination component
  const Pagination = () => {
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
    
    if (totalPages <= 1) return null

    const renderPageNumbers = () => {
      const pages = []
      const maxVisible = 5
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
      let end = Math.min(totalPages, start + maxVisible - 1)

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
      }

      for (let i = start; i <= end; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`w-8 h-8 flex items-center justify-center text-xs rounded ${
              currentPage === i
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
            aria-current={currentPage === i ? 'page' : undefined}
          >
            {i}
          </button>
        )
      }

      return pages
    }

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-4 border-t bg-gray-50">
        <div className="text-xs text-gray-600 text-center sm:text-left">
          Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
          {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} businesses
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 rounded bg-white"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex gap-1">{renderPageNumbers()}</div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 rounded bg-white"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  // ============================
  // MOBILE VIEW - CARD COMPONENT
  // ============================
  const BusinessCard = ({ business }: { business: Business }) => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Card Header with Selection */}
      <div className="px-3 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <SimpleCheckbox
              checked={selectedBusinesses.has(business.id)}
              onChange={() => toggleSelectBusiness(business.id)}
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900">
                {business.name}
              </h4>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs text-gray-500 font-mono">
                  #{business.registration_number}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <StatusBadge status={business.status} />
              </div>
            </div>
          </div>
          <button
            onClick={() => handleDeleteClick(business.id, business.name)}
            disabled={deletingId === business.id}
            className="ml-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            aria-label="Delete business"
          >
            {deletingId === business.id ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Business Info */}
      <div className="p-3 space-y-3">
        {/* Sector and Registration Date */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-gray-600">
              <Users className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Sector</span>
            </div>
            <div className="text-sm text-gray-900 truncate">
              {business.sector || 'Not specified'}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-gray-600">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Registered</span>
            </div>
            <div className="text-sm text-gray-900">
              {formatDate(business.registration_date)}
            </div>
          </div>
        </div>

        {/* Authenticity Score */}
        <div className="space-y-1">
          <div className="text-xs font-medium text-gray-600">Authenticity Score</div>
          <ScoreIndicator score={business.authenticity_score} />
        </div>

        {/* Contact Info */}
        {(business.email || business.phone) && (
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="text-xs font-medium text-gray-600">Contact</div>
            <div className="space-y-1.5">
              {business.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700 truncate">{business.email}</span>
                </div>
              )}
              {business.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700">{business.phone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Address and Region */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-3">
            {business.address && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Address</span>
                </div>
                <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
                  {business.address}
                </p>
              </div>
            )}
            {business.region && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-600">Region</div>
                <div className="text-sm text-gray-900">{business.region}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  // ============================
  // DESKTOP VIEW - TABLE COMPONENT
  // ============================
  const DesktopTable = () => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-12 px-4 py-3">
                <SimpleCheckbox
                  checked={selectedBusinesses.size === businesses.length && businesses.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Business
                  {sortField === 'name' && (
                    <span className="text-gray-400">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registration
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('authenticity_score')}
              >
                <div className="flex items-center gap-1">
                  Score
                  {sortField === 'authenticity_score' && (
                    <span className="text-gray-400">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('registration_date')}
              >
                <div className="flex items-center gap-1">
                  Registered
                  {sortField === 'registration_date' && (
                    <span className="text-gray-400">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {businesses.map((business) => (
              <tr key={business.id} className="hover:bg-gray-50 transition-colors">
                {/* Selection Checkbox */}
                <td className="px-4 py-3">
                  <SimpleCheckbox
                    checked={selectedBusinesses.has(business.id)}
                    onChange={() => toggleSelectBusiness(business.id)}
                  />
                </td>

                {/* Business Info */}
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {business.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {business.sector || 'No sector specified'}
                    </div>
                  </div>
                </td>

                {/* Registration */}
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900 font-mono">
                    {business.registration_number}
                  </div>
                </td>

                {/* Contact */}
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    {business.email && (
                      <div className="text-sm text-gray-700 truncate max-w-[180px]">
                        {business.email}
                      </div>
                    )}
                    {business.phone && (
                      <div className="text-sm text-gray-700">
                        {business.phone}
                      </div>
                    )}
                  </div>
                </td>

                {/* Score */}
                <td className="px-4 py-3">
                  <ScoreIndicator score={business.authenticity_score} />
                </td>

                {/* Registration Date */}
                <td className="px-4 py-3 text-sm text-gray-900">
                  {formatDate(business.registration_date)}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <StatusBadge status={business.status} />
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteClick(business.id, business.name)}
                      disabled={deletingId === business.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete business"
                      aria-label="Delete business"
                    >
                      {deletingId === business.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination for Desktop */}
      <Pagination />
    </div>
  )

  if (loading && businesses.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" text="Loading businesses..." />
      </div>
    )
  }

  return (
    <>
      {/* Delete Modals */}
      <DeleteConfirmationModal
        isOpen={!!deleteModal?.isOpen}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${deleteModal?.name}"? This action cannot be undone.`}
        isDeleting={deletingId === deleteModal?.id}
      />

      <DeleteConfirmationModal
        isOpen={bulkDeleteModal}
        onClose={() => setBulkDeleteModal(false)}
        onConfirm={handleBulkDeleteConfirm}
        title="Confirm Bulk Delete"
        message={`Are you sure you want to delete ${selectedBusinesses.size} selected business${selectedBusinesses.size > 1 ? 'es' : ''}? This action cannot be undone.`}
        isDeleting={deletingId !== null}
      />

      <div className="space-y-4 pb-4">
        {/* Message Notification */}
        {message && (
          <div className={`rounded-lg border p-3 mx-3 md:mx-0 animate-fadeIn ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : message.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              ) : message.type === 'error' ? (
                <XCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          </div>
        )}

        {/* Header with Actions */}
        <div className="bg-white border-b border-gray-200 px-3 py-1 -mt-4 ">
          <div className="flex flex-col gap-3">
            
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedBusinesses.size > 0 && (
                  <>
                    <div className="flex items-center gap-1 text-sm text-gray-700 bg-blue-50 px-2 py-1 rounded">
                      <Check className="w-3.5 h-3.5 text-blue-600" />
                      <span>{selectedBusinesses.size} selected</span>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleBulkDeleteClick}
                      className="ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
              
              <Link href="/admin/business/new" className="flex-shrink-0 pb-2">
                <Button variant="primary" size="sm">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Business
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="px-3">
          <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search businesses..."
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>

            {/* Status Filter and Sort */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Filter className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full pl-8 pr-2 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={`${sortField}-${sortDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-') as [SortField, SortDirection]
                  setSortField(field)
                  setSortDirection(direction)
                }}
                className="w-full px-2 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="created_at-desc">Newest</option>
                <option value="created_at-asc">Oldest</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="registration_date-desc">Recent Reg.</option>
                <option value="registration_date-asc">Old Reg.</option>
                <option value="authenticity_score-desc">High Score</option>
                <option value="authenticity_score-asc">Low Score</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="px-3">
          <div className="text-sm text-gray-600">
            {searchQuery || statusFilter !== 'all' ? (
              <div className="flex items-center justify-between">
                <span>
                  {businesses.length} of {totalCount} businesses
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                    setCurrentPage(1)
                  }}
                  className="text-xs"
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <span>Total: {totalCount} businesses</span>
            )}
          </div>
        </div>

        {/* =========================== */}
        {/* RESPONSIVE VIEWS */}
        {/* =========================== */}
        
        {/* Mobile Cards - Hidden on desktop */}
        <div className="lg:hidden px-3 space-y-2">
          {businesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
          
          {/* Pagination for Mobile */}
          {businesses.length > 0 && <Pagination />}
        </div>

        {/* Desktop Table - Hidden on mobile */}
        <div className="hidden lg:block">
          <DesktopTable />
        </div>

        {/* Empty State - Shows on both mobile and desktop */}
        {!loading && businesses.length === 0 && (
          <div className="px-3">
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-1">
                {searchQuery ? 'No businesses found' : 'No businesses yet'}
              </h3>
              <p className="text-sm text-gray-600 mb-4 max-w-sm mx-auto">
                {searchQuery 
                  ? 'Try adjusting your search or filters to find what you\'re looking for.'
                  : 'Get started by adding your first business to the directory.'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Link href="/admin/business/new">
                  <Button variant="primary" size="sm">
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add Your First Business
                  </Button>
                </Link>
              )}
              {(searchQuery || statusFilter !== 'all') && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                    setCurrentPage(1)
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Mobile-first responsive design */
        @media (min-width: 640px) {
          .px-3 {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }
        
        @media (min-width: 768px) {
          .px-3 {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
          }
        }
        
        @media (min-width: 1024px) {
          .px-3 {
            padding-left: 2rem;
            padding-right: 2rem;
          }
        }
      `}</style>
    </>
  )
}