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
  Mail,
  Hash
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
      
      // Only allow status values that match the database enum ('pending' | 'reviewed' | 'rejected'), map 'investigating' as needed
      const safeStatus = status === 'investigating' ? 'pending' : status
      const updatePayload = {
        status: safeStatus,
        reviewed_at: new Date().toISOString(),
        reviewer_id: user?.id || null,
        notes: reviewNotes || null
      }
      console.log('Updating report:', {
        reportId,
        payload: updatePayload
      })

      const { error, data } = await (supabase
        .from('reports') as any)
        .update(updatePayload)
        .eq('id', reportId)
        .select()
        .single()

      if (error) {
        console.error('Supabase update error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      toast.success(`Report marked as ${status}!`)
      
      // Update local state
      setReports(reports.map(report => 
        report.id === reportId 
          ? { 
              ...report, 
              status,
              reviewed_at: updatePayload.reviewed_at || null,
              reviewer_id: updatePayload.reviewer_id || null,
              notes: updatePayload.notes || null
            }
          : report
      ))
      
      setReviewNotes('')
      setIsDetailModalOpen(false)
    } catch (error: any) {
      console.error('Error updating report status:', error)
      
      // Detailed error logging
      const errorInfo = {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      }
      console.error('Error info:', JSON.stringify(errorInfo, null, 2))
      
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

      // Create CSV content
      const csvData = filtered.map(report => ({
        'Report ID': report.id,
        'Business Name': report.business?.name || 'N/A',
        'Registration Number': report.business?.registration_number || 'N/A',
        'Business Address': report.business?.address || 'N/A',
        'Business Status': report.business?.status || 'N/A',
        'Report Description': report.description,
        'Reporter Email': report.reporter_email || 'Anonymous',
        'Reporter Name': report.reporter_name || 'N/A',
        'Status': report.status,
        'Priority': report.priority,
        'Created At': new Date(report.created_at).toLocaleString(),
        'Reviewed At': report.reviewed_at ? new Date(report.reviewed_at).toLocaleString() : 'Not reviewed',
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
            // Handle commas, quotes, and line breaks in cells
            let cellContent = String(cell)
            // Escape quotes by doubling them
            cellContent = cellContent.replace(/"/g, '""')
            // Wrap in quotes if contains commas, quotes, or line breaks
            if (cellContent.includes(',') || cellContent.includes('"') || cellContent.includes('\n')) {
              cellContent = `"${cellContent}"`
            }
            return cellContent
          }).join(',')
        )
      ].join('\n')

      // Create and download file
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `fraud-reports-${new Date().toISOString().slice(0, 10)}.csv`
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
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return

    try {
      setDeletingId(deleteConfirm.id)
      
      const { error, data } = await (supabase
        .from('reports') as any)
        .delete()
        .eq('id', deleteConfirm.id)

      if (error) {
        console.error('Delete error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      // Update local state
      setReports(prev => prev.filter(report => report.id !== deleteConfirm.id))
      
      toast.success(`Report for "${deleteConfirm.businessName}" deleted successfully`)
      setDeleteConfirm(null)
      
      // Close modal if it's open for this report
      if (selectedReport?.id === deleteConfirm.id) {
        setIsDetailModalOpen(false)
      }
    } catch (error: any) {
      console.error('Error deleting report:', error)
      
      const errorMessage = error?.message || error?.toString() || 'Unknown error'
      console.error('Error details:', {
        message: errorMessage,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      })
      
      // Check for RLS policy error
      if (error?.code === '42501' || error?.message?.includes('permission denied')) {
        toast.error('Permission denied. Please check that DELETE policy exists for reports table.')
      } else {
        toast.error(`Failed to delete report: ${errorMessage}`)
      }
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteConfirm(null)
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" text="Loading reports..." />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8">
        {/* Header - Mobile Optimized */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Fraud Reports</h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">Monitor and manage business fraud reports</p>
            </div>
            
            {/* Action Buttons - Mobile Optimized */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={fetchReports}
                  disabled={loading}
                  className="gap-2 px-3 py-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
                
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleExportReports}
                  disabled={exporting || filteredReports.length === 0}
                  className="gap-2 px-3 py-2"
                >
                  <Download className={`w-3.5 h-3.5 ${exporting ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Export CSV</span>
                  <span className="sm:hidden">Export</span>
                </Button>
              </div>
              
              {/* Stats Summary - Mobile Hidden */}
              <div className="hidden md:flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">{filteredReports.length}</span> of <span className="font-semibold">{reports.length}</span> reports
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-4 md:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                      Confirm Delete
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Are you sure you want to delete the report for <span className="font-medium">"{deleteConfirm.businessName}"</span>? 
                      This action cannot be undone.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleDeleteCancel}
                        disabled={deletingId === deleteConfirm.id}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        onClick={handleDeleteConfirm}
                        disabled={deletingId === deleteConfirm.id}
                        className="flex-1"
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

        {/* Search and Filters Card - Mobile Optimized */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4 md:mb-6">
          <div className="p-3 md:p-5">
            {/* Search Input */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* Filters Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Filter className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="w-full pl-8 pr-2 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="investigating">Investigating</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
              
              <div className="relative">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
                  className="w-full pl-2 pr-8 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            
            {/* Results Count - Mobile */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-xs md:text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{filteredReports.length}</span> reports
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs md:text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear search
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reports List - Mobile Card View / Desktop Table View */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Header - Desktop Only */}
          <div className="hidden md:block px-6 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Fraud Reports
              </h2>
              <div className="text-xs text-gray-500">
                Sorted by: Most Recent
              </div>
            </div>
          </div>

          {/* Reports List */}
          {filteredReports.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-full mb-3 md:mb-4">
                <Search className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-1 md:mb-2">No reports found</h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto px-4">
                {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your search criteria'
                  : 'No fraud reports have been submitted yet'}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <div key={report.id} className="p-4 hover:bg-gray-50 transition-colors">
                    {/* Report Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {report.business?.name || 'Unknown Business'}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Hash className="w-3 h-3" />
                          <span>{report.business?.registration_number || 'N/A'}</span>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getStatusColor(report.status)}`}>
                        {getStatusIcon(report.status)}
                        <span className="ml-1 capitalize hidden sm:inline">{report.status}</span>
                      </span>
                    </div>

                    {/* Description Preview */}
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {report.description}
                    </p>

                    {/* Meta Info Row */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-4">
                      {report.reporter_email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span className="truncate max-w-[120px]">
                            {report.reporter_email}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatRelativeTime(report.created_at)}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded ${getPriorityColor(report.priority)}`}>
                        {report.priority}
                      </span>
                    </div>

                    {/* Action Buttons - Mobile */}
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                      <Button
                        onClick={() => window.open(`/business/${report.business_id}`, '_blank')}
                        variant="secondary"
                        size="sm"
                        className="flex-1 justify-center text-xs"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Business
                      </Button>
                      
                      {report.status === 'pending' && (
                        <Button
                          onClick={() => handleViewDetails(report)}
                          variant="primary"
                          size="sm"
                          className="flex-1 justify-center text-xs"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Review
                        </Button>
                      )}
                      
                      {report.status === 'investigating' && (
                        <Button
                          onClick={() => handleViewDetails(report)}
                          variant="primary"
                          size="sm"
                          className="flex-1 justify-center text-xs"
                        >
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Notes
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => handleDeleteClick(report.id, report.business?.name || 'Business')}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs px-2"
                        disabled={deletingId === report.id}
                      >
                        {deletingId === report.id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <Trash2 className="w-3 h-3" />
                          </>
                        )}
                        
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Business / Reporter
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredReports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                        {/* Business/Reporter Info */}
                        <td className="px-4 py-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Building className="w-4 h-4 text-gray-400" />
                              <div className="font-medium text-gray-900 text-sm">
                                {report.business?.name || 'Unknown Business'}
                              </div>
                            </div>
                            <div className="text-xs text-gray-600 mb-2">
                              Reg: {report.business?.registration_number || 'N/A'}
                            </div>
                            {report.reporter_email && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Mail className="w-3 h-3" />
                                <span className="truncate max-w-[180px]">{report.reporter_email}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Description */}
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-700 line-clamp-2 max-w-[300px]">
                            {report.description}
                          </p>
                          {report.evidence_urls && report.evidence_urls.length > 0 && (
                            <div className="mt-1 text-xs text-blue-600">
                              <FileText className="w-3 h-3 inline mr-1" />
                              {report.evidence_urls.length} evidence file(s)
                            </div>
                          )}
                        </td>

                        {/* Status & Priority */}
                        <td className="px-4 py-4">
                          <div className="space-y-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getStatusColor(report.status)}`}>
                              {getStatusIcon(report.status)}
                              <span className="ml-1 capitalize">{report.status}</span>
                            </span>
                            <span className={`block px-2 py-1 rounded text-xs font-medium ${getPriorityColor(report.priority)}`}>
                              {report.priority} priority
                            </span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span>{formatRelativeTime(report.created_at)}</span>
                            </div>
                            {report.reviewed_at && (
                              <div className="text-xs text-gray-500">
                                Reviewed: {formatRelativeTime(report.reviewed_at)}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <Button
                                onClick={() => window.open(`/business/${report.business_id}`, '_blank')}
                                variant="secondary"
                                size="sm"
                                className="gap-1 text-xs"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Business
                              </Button>
                              
                              {report.status === 'pending' && (
                                <Button
                                  onClick={() => handleViewDetails(report)}
                                  variant="primary"
                                  size="sm"
                                  className="gap-1 text-xs"
                                >
                                  <Eye className="w-3 h-3" />
                                  Review
                                </Button>
                              )}
                            </div>
                            
                            <div className="flex gap-2">
                              {report.status === 'investigating' && (
                                <Button
                                  onClick={() => handleViewDetails(report)}
                                  variant="secondary"
                                  size="sm"
                                  className="gap-1 text-xs"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  Add Notes
                                </Button>
                              )}
                              
                              <Button
                                onClick={() => handleDeleteClick(report.id, report.business?.name || 'Business')}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1 text-xs"
                                disabled={deletingId === report.id}
                              >
                                {deletingId === report.id ? (
                                  <LoadingSpinner size="sm" />
                                ) : (
                                  <>
                                    <Trash2 className="w-3 h-3" />
                                    Delete
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Footer - Desktop Only */}
          {filteredReports.length > 0 && (
            <div className="hidden md:block px-6 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div>
                  Showing {filteredReports.length} of {reports.length} reports
                </div>
                <div>
                  Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detail Modal - Responsive */}
        {isDetailModalOpen && selectedReport && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 md:p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">Report Details</h3>
                    <p className="text-xs md:text-sm text-gray-600 mt-1">Review and update report status</p>
                  </div>
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 md:space-y-6">
                  {/* Business Information */}
                  <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                    <h4 className="text-xs md:text-sm font-semibold text-gray-900 mb-2 md:mb-3 uppercase tracking-wider">Business Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Business Name</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{selectedReport.business?.name || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Registration Number</p>
                        <p className="text-sm font-medium text-gray-900">{selectedReport.business?.registration_number || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Business Status</p>
                        <p className="text-sm font-medium text-gray-900 capitalize">{selectedReport.business?.status || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Address</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{selectedReport.business?.address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Report Description */}
                  <div>
                    <h4 className="text-xs md:text-sm font-semibold text-gray-900 mb-2 md:mb-3 uppercase tracking-wider">Report Description</h4>
                    <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedReport.description}</p>
                    </div>
                  </div>

                  {/* Reporter Information */}
                  <div>
                    <h4 className="text-xs md:text-sm font-semibold text-gray-900 mb-2 md:mb-3 uppercase tracking-wider">Reporter Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedReport.reporter_name && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Reporter Name</p>
                          <p className="text-sm font-medium text-gray-900">{selectedReport.reporter_name}</p>
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
                      <h4 className="text-xs md:text-sm font-semibold text-gray-900 mb-2 md:mb-3 uppercase tracking-wider">Evidence</h4>
                      <div className="space-y-2">
                        {selectedReport.evidence_urls.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-xs md:text-sm text-blue-600 hover:text-blue-700 hover:underline truncate"
                          >
                            Evidence {index + 1}: {url}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Review Notes */}
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">
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
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 md:pt-6 border-t border-gray-200">
                    {selectedReport.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleUpdateStatus(selectedReport.id, 'reviewed')}
                          variant="primary"
                          disabled={isUpdating === selectedReport.id}
                          className="flex-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {isUpdating === selectedReport.id ? 'Processing...' : 'Mark Reviewed'}
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
                    
                    {/* Add Action Buttons for other statuses */}
                    {selectedReport.status === 'investigating' && (
                      <Button
                        onClick={() => handleUpdateStatus(selectedReport.id, 'reviewed')}
                        variant="primary"
                        disabled={isUpdating === selectedReport.id}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {isUpdating === selectedReport.id ? 'Processing...' : 'Mark as Reviewed'}
                      </Button>
                    )}
                    
                    {/* Delete Button */}
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