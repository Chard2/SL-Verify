'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { 
  Activity, CheckCircle, XCircle, AlertTriangle, 
  Building2, Flag, Clock, Users, FileText, 
  Search, Filter, Eye, Download, 
  ChevronLeft, ChevronRight, ExternalLink,
  Bell, Shield, User, TrendingUp, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { format } from 'date-fns'

interface Business {
  id: string
  name: string
  status: string
  created_at: string
  updated_at: string
  registration_number?: string
  owner_name?: string
  email?: string
}

interface Report {
  id: string
  business_id: string
  description: string
  status: string
  created_at: string
  reporter_name?: string
  reporter_email?: string
}

interface ActivityItem {
  id: string
  type: string
  title: string
  description: string
  user_email: string
  user_id: string
  metadata: {
    registration_number?: string
    owner_name?: string
    status?: string
    report_id?: string
  }
  created_at: string
  action_type: 'business' | 'report'
}

export default function ActivityLogPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 20

  const supabase = createClient()

  useEffect(() => {
    fetchActivities()
  }, [currentPage, filterType])

  const fetchActivities = async () => {
    try {
      setLoading(true)

      // Fetch businesses activities
      const { data: businesses, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false })

      if (businessError) throw businessError

      // Fetch reports activities
      const { data: reports, error: reportError } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (reportError) throw reportError

      // Transform businesses into activities
      const businessActivities: ActivityItem[] = (businesses as any[] || []).map((business: any) => ({
        id: business.id,
        type: business.status === 'verified' ? 'verification' : 
              business.status === 'under_review' ? 'review' : 'business_created',
        title: business.status === 'verified' ? 'Business Verified' : 
               business.status === 'under_review' ? 'Business Under Review' : 'New Business Registered',
        description: business.name,
        user_email: business.email || 'System',
        user_id: business.id,
        metadata: {
          registration_number: business.registration_number,
          owner_name: business.owner_name,
          status: business.status
        },
        created_at: business.created_at,
        action_type: 'business'
      }))

      // Transform reports into activities
      const reportActivities: ActivityItem[] = (reports as any[] || []).map((report: any) => ({
        id: report.id,
        type: 'report_created',
        title: 'Fraud Report Filed',
        description: (report.description?.substring(0, 100) || 'New fraud report') + '...',
        user_email: report.reporter_email || 'Anonymous',
        user_id: report.business_id || 'unknown',
        metadata: {
          report_id: report.id,
          status: report.status
        },
        created_at: report.created_at,
        action_type: 'report'
      }))

      // Combine all activities
      const allActivities = [...businessActivities, ...reportActivities]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      // Apply filters
      let filteredActivities = allActivities
      
      if (filterType !== 'all') {
        filteredActivities = filteredActivities.filter(activity => activity.type === filterType)
      }

      if (searchQuery) {
        filteredActivities = filteredActivities.filter(activity => 
          activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.user_email.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      // Apply pagination
      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const paginatedActivities = filteredActivities.slice(startIndex, endIndex)

      setActivities(paginatedActivities)
      setTotalItems(filteredActivities.length)
    } catch (error) {
      console.error('Error fetching activities:', error)
      setActivities([])
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchActivities()
  }

  const handleReset = () => {
    setSearchQuery('')
    setFilterType('all')
    setCurrentPage(1)
    fetchActivities()
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'verification':
        return { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' }
      case 'review':
        return { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100' }
      case 'business_created':
        return { icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100' }
      case 'report_created':
        return { icon: Flag, color: 'text-rose-600', bg: 'bg-rose-100' }
      default:
        return { icon: Activity, color: 'text-gray-600', bg: 'bg-gray-100' }
    }
  }

  const getActivityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'verification': 'Verification',
      'review': 'Under Review',
      'business_created': 'Business Created',
      'report_created': 'Fraud Report',
    }
    return labels[type] || type
  }

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return {
        date: format(date, 'MMM dd, yyyy'),
        time: format(date, 'hh:mm a')
      }
    } catch {
      return {
        date: 'Unknown',
        time: 'Unknown'
      }
    }
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  if (loading && activities.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner size="lg" text="Loading activity logs..." />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
            <p className="text-gray-600 mt-1">Track all system activities and user actions</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="secondary" 
              className="flex items-center gap-2"
              onClick={() => fetchActivities()}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Activities
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, description, or user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Activity Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="verification">Verifications</option>
                <option value="review">Under Review</option>
                <option value="business_created">Business Created</option>
                <option value="report_created">Fraud Reports</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {totalItems} activity logs found
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reset Filters
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Activity Logs List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {activities.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {activities.map((activity) => {
                const { icon: Icon, color, bg } = getActivityIcon(activity.type)
                const { date, time } = formatDateTime(activity.created_at)
                
                return (
                  <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${bg}`}>
                          <Icon className={`w-6 h-6 ${color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900">{activity.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${bg} ${color}`}>
                              {getActivityTypeLabel(activity.type)}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-2">{activity.description}</p>
                          
                          <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>{activity.user_email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{date} at {time}</span>
                            </div>
                          </div>

                          {activity.metadata && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {activity.metadata.registration_number && (
                                  <div>
                                    <span className="text-sm font-medium text-gray-700">Registration:</span>
                                    <span className="text-sm text-gray-600 ml-2">{activity.metadata.registration_number}</span>
                                  </div>
                                )}
                                {activity.metadata.status && (
                                  <div>
                                    <span className="text-sm font-medium text-gray-700">Status:</span>
                                    <span className="text-sm text-gray-600 ml-2">{activity.metadata.status}</span>
                                  </div>
                                )}
                                {activity.metadata.owner_name && (
                                  <div>
                                    <span className="text-sm font-medium text-gray-700">Owner:</span>
                                    <span className="text-sm text-gray-600 ml-2">{activity.metadata.owner_name}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {activity.action_type === 'business' && (
                          <Link href={`/admin/businesses/${activity.id}`}>
                            <Button variant="ghost" size="sm" className="flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              View Business
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activity Logs Found</h3>
              <p className="text-gray-600 mb-4">No system activities have been recorded yet.</p>
              <Button onClick={handleReset} className="bg-gradient-to-r from-blue-600 to-blue-700">
                Reset Filters
              </Button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, totalItems)}
                </span>{' '}
                of <span className="font-medium">{totalItems}</span> results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`min-w-[40px] ${currentPage === pageNum ? 'bg-blue-600 text-white' : ''}`}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      

       
    </div>
  )
}