'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatRelativeTime } from '@/lib/utils/formatters'
import { 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Eye,
  MessageSquare,
  Calendar,
  User,
  Building,
  RefreshCw,
  Download,
  FileText,
  Shield,
  Flag,
  BarChart3,
  ChevronDown,
  AlertTriangle,
  Clock,
  UserCheck,
  FileWarning,
  TrendingUp,
  Trash2,
  MoreVertical,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import { Database } from '@/types/database'

interface ReportWithBusiness {
  id: string
  business_id: string
  description: string
  reporter_email: string | null
  reporter_name: string | null
  status: 'pending' | 'reviewed' | 'rejected' | 'investigating'
  priority: 'low' | 'medium' | 'high'
  evidence_urls: string[] | null
  created_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  notes: string | null
  business: {
    name: string
    registration_number: string
    status: string
    address: string
  } | null
}

type StatusFilter = 'all' | 'pending' | 'reviewed' | 'rejected' | 'investigating'
type PriorityFilter = 'all' | 'low' | 'medium' | 'high'

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportWithBusiness[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [selectedReport, setSelectedReport] = useState<ReportWithBusiness | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const supabase = createClient()
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; businessName: string } | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [mobileActionMenu, setMobileActionMenu] = useState<string | null>(null)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          business:businesses(name, registration_number, status, address)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReports((data as any) || [])
    } catch (error) {
      console.error('Error fetching reports:', error)
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (reportId: string, status: 'reviewed' | 'rejected' | 'investigating') => {
    try {
      setIsUpdating(reportId)
      
      const { data: { user } } = await supabase.auth.getUser()
      const safeStatus = status === 'investigating' ? 'pending' : status
      const updatePayload = {
        status: safeStatus,
        reviewed_at: new Date().toISOString(),
        reviewer_id: user?.id || null
      }

      const { error, data } = await (supabase
        .from('reports') as any)
        .update(updatePayload)
        .eq('id', reportId)
        .select()
        .single()

      if (error) throw error

      toast.success(`Report marked as ${status}!`)
      
      setReports(reports.map(report => 
        report.id === reportId 
          ? { 
              ...report, 
              status,
              reviewed_at: updatePayload.reviewed_at || null,
              reviewer_id: updatePayload.reviewer_id || null
            }
          : report
      ))
      
      setReviewNotes('')
      setIsDetailModalOpen(false)
    } catch (error: any) {
      console.error('Error updating report status:', error)
      toast.error(`Failed to update report: ${error?.message || 'Unknown error'}`)
    } finally {
      setIsUpdating(null)
    }
  }

  const handleViewDetails = (report: ReportWithBusiness) => {
    setSelectedReport(report)
    setReviewNotes(report.notes || '')
    setIsDetailModalOpen(true)
  }

  const handleExportReports = async () => {
    try {
      setExporting(true)
      
      const filtered = getFilteredReports()
      
      if (filtered.length === 0) {
        toast.error('No reports to export')
        return
      }

      const csvData = filtered.map(report => ({
        ID: report.id,
        'Business Name': report.business?.name || 'N/A',
        'Registration Number': report.business?.registration_number || 'N/A',
        'Business Address': report.business?.address || 'N/A',
        'Business Status': report.business?.status || 'N/A',
        'Report Description': report.description,
        'Reporter Email': report.reporter_email || 'Anonymous',
        'Reporter Name': report.reporter_name || 'N/A',
        'Status': report.status,
        'Priority': report.priority,
        'Created At': new Date(report.created_at).toISOString(),
        'Reviewed At': report.reviewed_at ? new Date(report.reviewed_at).toISOString() : 'Not reviewed',
        'Reviewed By': report.reviewed_by || 'N/A',
        'Notes': report.notes || 'N/A',
        'Evidence URLs': report.evidence_urls ? report.evidence_urls.join('; ') : 'N/A'
      }))

      const headers = Object.keys(csvData[0])
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          headers.map(header => {
            const cell = row[header as keyof typeof row]
            const escaped = String(cell).replace(/"/g, '""')
            return /[,"\n]/.test(escaped) ? `"${escaped}"` : escaped
          }).join(',')
        )
      ].join('\n')

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `fraud-reports-${new Date().toISOString().slice(0, 10)}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`Exported ${filtered.length} report(s) successfully!`)
    } catch (error) {
      console.error('Error exporting reports:', error)
      toast.error('Failed to export reports')
    } finally {
      setExporting(false)
    }
  }

  const handleDeleteClick = (reportId: string, businessName: string) => {
    setDeleteConfirm({ id: reportId, businessName })
    setMobileActionMenu(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return

    try {
      setDeletingId(deleteConfirm.id)
      
      const { error, data } = await (supabase
        .from('reports') as any)
        .delete()
        .eq('id', deleteConfirm.id)
        .select()

      if (error) throw error

      setReports(prev => prev.filter(report => report.id !== deleteConfirm.id))
      toast.success(`Report for "${deleteConfirm.businessName}" deleted successfully`)
      setDeleteConfirm(null)
      
      if (selectedReport?.id === deleteConfirm.id) {
        setIsDetailModalOpen(false)
      }
    } catch (error: any) {
      console.error('Error deleting report:', error)
      toast.error(`Failed to delete report: ${error?.message || 'Unknown error'}`)
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'reviewed': return 'bg-green-50 text-green-700 border-green-200'
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200'
      case 'investigating': return 'bg-blue-50 text-blue-700 border-blue-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending': return <Clock className="w-3 h-3" />
      case 'reviewed': return <CheckCircle className="w-3 h-3" />
      case 'rejected': return <XCircle className="w-3 h-3" />
      case 'investigating': return <Eye className="w-3 h-3" />
      default: return <AlertCircle className="w-3 h-3" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'bg-red-50 text-red-700'
      case 'medium': return 'bg-orange-50 text-orange-700'
      case 'low': return 'bg-green-50 text-green-700'
      default: return 'bg-gray-50 text-gray-700'
    }
  }

  const getFilteredReports = () => {
    return reports.filter(report => {
      const matchesSearch = 
        report.business?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.business?.registration_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.reporter_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.reporter_name?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || report.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })
  }

  const filteredReports = getFilteredReports()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <LoadingSpinner size="lg" text="Loading reports..." />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                Fraud Reports Management
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Monitor and manage business fraud reports and investigations
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <Button
                variant="secondary"
                size="sm"
                onClick={fetchReports}
                disabled={loading}
                className="gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
                <span className="sm:hidden">Ref</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleExportReports}
                disabled={exporting || filteredReports.length === 0}
                className="gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <Download className={`w-3 h-3 sm:w-4 sm:h-4 ${exporting ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
              <div className="p-5 sm:p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                      Confirm Delete
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Are you sure you want to delete the report for <span className="font-medium">"{deleteConfirm.businessName}"</span>? 
                      This action cannot be undone.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setDeleteConfirm(null)}
                        disabled={deletingId === deleteConfirm.id}
                        className="flex-1 sm:flex-none"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        onClick={handleDeleteConfirm}
                        disabled={deletingId === deleteConfirm.id}
                        className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700"
                      >
                        {deletingId === deleteConfirm.id ? (
                          <LoadingSpinner size="sm" text="Deleting..." />
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="font-medium text-sm">Filters</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Search and Filters Card */}
        <div className={`bg-white rounded-lg border border-gray-200 shadow-sm mb-4 sm:mb-6 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="p-4 sm:p-5">
            {/* Search Input */}
            <div className="mb-4 sm:mb-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* Filters */}
            <div className="mt-4 pt-4 border-t border-gray-200 lg:border-t-0 lg:pt-0 lg:mt-0 lg:flex lg:items-center lg:gap-3">
              <div className="flex items-center gap-2 mb-3 lg:mb-0">
                <Filter className="w-4 h-4 text-gray-400 hidden lg:block" />
                <div className="grid grid-cols-2 gap-3 w-full lg:w-auto lg:flex lg:items-center lg:gap-3">
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="investigating">Investigating</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  
                  <div className="relative">
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                    >
                      <option value="all">All Priority</option>
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Results Count */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-xs sm:text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{filteredReports.length}</span> of{' '}
                  <span className="font-semibold text-gray-900">{reports.length}</span> reports
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear search
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Table Header - Mobile Optimized */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Fraud Reports
              </h2>
              <div className="text-xs text-gray-500 hidden sm:block">
                Sorted by: Most Recent
              </div>
            </div>
          </div>

          {/* Reports List */}
          {filteredReports.length === 0 ? (
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full mb-3 sm:mb-4">
                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
              </div>
              <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2">No reports found</h3>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters'
                  : 'No fraud reports have been submitted yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <div key={report.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors relative">
                  {/* Mobile Action Menu */}
                  {mobileActionMenu === report.id && (
                    <div className="absolute right-4 top-4 z-10 bg-white border border-gray-200 rounded-lg shadow-lg w-48">
                      <div className="p-2 space-y-1">
                        <button
                          onClick={() => {
                            window.open(`/business/${report.business_id}`, '_blank')
                            setMobileActionMenu(null)
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Business
                        </button>
                        
                        {report.status === 'pending' && (
                          <button
                            onClick={() => {
                              handleViewDetails(report)
                              setMobileActionMenu(null)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                          >
                            <Eye className="w-4 h-4" />
                            Review
                          </button>
                        )}
                        
                        {report.status === 'investigating' && (
                          <>
                            <button
                              onClick={() => {
                                handleViewDetails(report)
                                setMobileActionMenu(null)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                            >
                              <MessageSquare className="w-4 h-4" />
                              Add Notes
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(report.id, 'reviewed')}
                              disabled={isUpdating === report.id}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                            >
                              <CheckCircle className="w-4 h-4" />
                              {isUpdating === report.id ? 'Processing...' : 'Mark Reviewed'}
                            </button>
                          </>
                        )}
                        
                        <button
                          onClick={() => handleDeleteClick(report.id, report.business?.name || 'Business')}
                          disabled={deletingId === report.id}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                            {report.business?.name || 'Unknown Business'}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 ml-6">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getStatusColor(report.status)}`}>
                            {getStatusIcon(report.status)}
                            <span className="ml-1 capitalize">{report.status}</span>
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(report.priority)}`}>
                            {report.priority} Priority
                          </span>
                        </div>
                      </div>
                      
                      {/* Mobile Action Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setMobileActionMenu(mobileActionMenu === report.id ? null : report.id)
                        }}
                        className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Business Info */}
                    <div className="ml-6">
                      <div className="text-xs sm:text-sm text-gray-600">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">Reg:</span> {report.business?.registration_number || 'N/A'}
                          {report.business?.address && (
                            <>
                              <span className="mx-1">•</span>
                              <span className="truncate">{report.business.address}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Report Description */}
                    <div className="ml-6">
                      <p className="text-xs sm:text-sm text-gray-700 line-clamp-2">{report.description}</p>
                    </div>

                    {/* Meta Information */}
                    <div className="ml-6">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        {report.reporter_email && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span className="truncate max-w-[120px] sm:max-w-[150px]">
                              {report.reporter_name ? `${report.reporter_name}` : report.reporter_email}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatRelativeTime(report.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Evidence Links */}
                    {report.evidence_urls && report.evidence_urls.length > 0 && (
                      <div className="ml-6">
                        <div className="text-xs font-medium text-gray-700 mb-1">Evidence:</div>
                        <div className="flex flex-wrap gap-2">
                          {report.evidence_urls.slice(0, 2).map((url, index) => (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              <FileText className="w-3 h-3" />
                              Evidence {index + 1}
                            </a>
                          ))}
                          {report.evidence_urls.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{report.evidence_urls.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Desktop Action Buttons */}
                    <div className="hidden lg:flex gap-2 mt-2 ml-6">
                      <Button
                        onClick={() => window.open(`/business/${report.business_id}`, '_blank')}
                        variant="secondary"
                        size="sm"
                        className="text-xs"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View Business
                      </Button>
                      
                      {report.status === 'pending' && (
                        <Button
                          onClick={() => handleViewDetails(report)}
                          variant="primary"
                          size="sm"
                          className="text-xs"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Review
                        </Button>
                      )}
                      
                      {report.status === 'investigating' && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleViewDetails(report)}
                            variant="primary"
                            size="sm"
                            className="text-xs"
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Add Notes
                          </Button>
                          <Button
                            onClick={() => handleUpdateStatus(report.id, 'reviewed')}
                            variant="secondary"
                            size="sm"
                            className="text-xs"
                            disabled={isUpdating === report.id}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {isUpdating === report.id ? 'Processing...' : 'Review'}
                          </Button>
                        </div>
                      )}
                      
                      <Button
                        onClick={() => handleDeleteClick(report.id, report.business?.name || 'Business')}
                        variant="ghost"
                        size="sm"
                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={deletingId === report.id}
                      >
                        {deletingId === report.id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          {filteredReports.length > 0 && (
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600">
                <div>
                  Showing {filteredReports.length} of {reports.length} reports
                </div>
                <div className="mt-1 sm:mt-0">
                  Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detail Modal - Mobile Optimized */}
        {isDetailModalOpen && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start lg:items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto">
            <div className="bg-white w-full min-h-screen lg:min-h-auto lg:rounded-lg lg:max-w-2xl lg:max-h-[90vh] lg:overflow-y-auto lg:shadow-xl">
              {/* Modal Header - Sticky on mobile */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Report Details</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">Review and update report status</p>
                </div>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Business Information */}
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3 uppercase tracking-wider">Business Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Business Name</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{selectedReport.business?.name || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Registration Number</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{selectedReport.business?.registration_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Business Status</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{selectedReport.business?.status || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Address</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{selectedReport.business?.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Report Description */}
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3 uppercase tracking-wider">Report Description</h4>
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{selectedReport.description}</p>
                  </div>
                </div>

                {/* Reporter Information */}
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3 uppercase tracking-wider">Reporter Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {selectedReport.reporter_name && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Reporter Name</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{selectedReport.reporter_name}</p>
                      </div>
                    )}
                    {selectedReport.reporter_email && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Reporter Email</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{selectedReport.reporter_email}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Report Date</p>
                      <p className="text-sm font-medium text-gray-900">{formatRelativeTime(selectedReport.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Priority</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">{selectedReport.priority}</p>
                    </div>
                  </div>
                </div>

                {/* Evidence */}
                {selectedReport.evidence_urls && selectedReport.evidence_urls.length > 0 && (
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3 uppercase tracking-wider">Evidence</h4>
                    <div className="space-y-2">
                      {selectedReport.evidence_urls.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-blue-600 hover:text-blue-700 hover:underline break-words"
                        >
                          Evidence {index + 1}: {url}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Review Notes */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3 uppercase tracking-wider">
                    Review Notes
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add review notes or comments..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200 -mx-4 sm:-mx-6 px-4 sm:px-6 pb-4">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    {selectedReport.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleUpdateStatus(selectedReport.id, 'reviewed')}
                          variant="primary"
                          disabled={isUpdating === selectedReport.id}
                          className="flex-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {isUpdating === selectedReport.id ? 'Processing...' : 'Mark as Reviewed'}
                        </Button>
                        <Button
                          onClick={() => handleUpdateStatus(selectedReport.id, 'rejected')}
                          variant="secondary"
                          disabled={isUpdating === selectedReport.id}
                          className="flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          {isUpdating === selectedReport.id ? 'Processing...' : 'Reject'}
                        </Button>
                      </>
                    )}
                    
                    <Button
                      onClick={() => {
                        handleDeleteClick(selectedReport.id, selectedReport.business?.name || 'Business')
                        setIsDetailModalOpen(false)
                      }}
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={deletingId === selectedReport.id}
                    >
                      {deletingId === selectedReport.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}