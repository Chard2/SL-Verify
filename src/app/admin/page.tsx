"use client"

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { 
  CheckCircle, AlertTriangle, Building2, Flag, 
  BarChart3, Activity, Shield, AlertCircle,
  ArrowUpRight, TrendingUp, Bell, Clock,
  Eye, Zap, Users, FileText, ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'

interface DashboardStats {
  total: number
  verified: number
  under_review: number
  pending_reports: number
  similarity_alerts: number
  recent_verifications: number
}

interface Business {
  id: string
  name: string
  status: string
  created_at: string
  registration_number?: string
}

interface SimilarPair {
  business1: Business
  business2: Business
  similarity: number
}

interface ActivityItem {
  id: string
  type: string
  title: string
  description: string
  time: string
  color: string
}

interface BusinessRecord {
  id: number
  name: string
  registration_number?: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    verified: 0,
    under_review: 0,
    pending_reports: 0,
    similarity_alerts: 0,
    recent_verifications: 0
  })
  const [loading, setLoading] = useState(true)
  const [similarPairs, setSimilarPairs] = useState<SimilarPair[]>([])
  const [alertLoading, setAlertLoading] = useState(true)
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([])
  const [pendingVerificationCountState, setPendingVerificationCountState] = useState<number>(0)
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      console.log('No authenticated user, redirecting to login')
      router.push('/auth/login')
      return
    }

    if (user) {
      fetchStats()
      fetchSimilarityAlerts()
      fetchRecentActivities()
      
      const interval = setInterval(() => {
        fetchStats()
        fetchSimilarityAlerts()
        fetchRecentActivities()
      }, 30000)

      const timeout = setTimeout(() => {
        if (loading) {
          console.warn('Dashboard loading timeout - forcing display')
          setLoading(false)
        }
      }, 10000)

      return () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }
    }
  }, [user, authLoading, router])

  const fetchStats = async () => {
    try {
      const [totalRes, verifiedRes, underReviewRes, pendingReportsRes, pendingVerificationRes] = await Promise.all([
        supabase.from('businesses').select('*', { count: 'exact', head: true }),
        supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('status', 'verified'),
        supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('status', 'under_review'),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('businesses').select('*', { count: 'exact', head: true })
          .or('status.is.null,status.eq.pending,status.eq.submitted,status.neq.verified,status.neq.under_review')
      ])

      console.log('Stats fetched:', {
        total: totalRes.count,
        verified: verifiedRes.count,
        under_review: underReviewRes.count,
        pending_reports: pendingReportsRes.count,
        pending_verification: pendingVerificationRes.count
      })

      let alertsCount = 0
      try {
        const alertsRes = await supabase
          .from('similarity_alerts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')
        alertsCount = alertsRes.count || 0
      } catch (alertsError) {
        console.log('Similarity alerts table not found, using calculated value')
      }

      // Get recent verifications (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const { count: recentVerifications } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString())
        .eq('status', 'verified')

      setStats({
        total: totalRes.count || 0,
        verified: verifiedRes.count || 0,
        under_review: underReviewRes.count || 0,
        pending_reports: pendingReportsRes.count || 0,
        recent_verifications: recentVerifications || 0,
        similarity_alerts: alertsCount || similarPairs.length
      })

      setPendingVerificationCountState(pendingVerificationRes.count || 0)
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStats({
        total: 0,
        verified: 0,
        under_review: 0,
        pending_reports: 0,
        recent_verifications: 0,
        similarity_alerts: 0
      })
      setPendingVerificationCountState(0)
    } finally {
      setLoading(false)
    }
  }

  const fetchSimilarityAlerts = async () => {
    try {
      setAlertLoading(true)
      
      // First, check if we can connect to the database
      const { data: testData, error: testError } = await supabase
        .from('businesses')
        .select('id')
        .limit(1)

      if (testError) {
        console.error('Database connection error:', testError)
        setSimilarPairs([])
        setAlertLoading(false)
        return
      }

      // Fetch businesses for similarity check
      const { data: businesses, error } = await supabase
        .from('businesses')
        .select('id, name, registration_number')
        .order('id', { ascending: true })
        .limit(200) // Reduced from 500 for better performance

      if (error) {
        console.error('Error fetching businesses for similarity:', error)
        setSimilarPairs([])
        return
      }

      if (!businesses || businesses.length === 0) {
        console.log('No businesses found for similarity check')
        setSimilarPairs([])
        return
      }

      console.log(`Processing ${businesses.length} businesses for similarity checks`)

      const pairs: SimilarPair[] = []
      const processed = new Set<string>()

      // Use a more efficient approach for similarity checking
      for (let i = 0; i < businesses.length; i++) {
        const b1 = businesses[i] as BusinessRecord
        for (let j = i + 1; j < businesses.length; j++) {
          const b2 = businesses[j] as BusinessRecord
          const key = [b1.id, b2.id].sort().join('-')

          if (processed.has(key)) continue
          processed.add(key)

          // Skip if names are identical (trivial case)
          if (b1.name === b2.name) {
            pairs.push({
              business1: {
                id: String(b1.id),
                name: b1.name,
                status: '',
                created_at: '',
                registration_number: b1.registration_number
              },
              business2: {
                id: String(b2.id),
                name: b2.name,
                status: '',
                created_at: '',
                registration_number: b2.registration_number
              },
              similarity: 1.0
            })
            continue
          }

          const similarity = calculateSimilarity(b1.name.toLowerCase(), b2.name.toLowerCase())
          
          if (similarity > 0.6) {
            pairs.push({
              business1: {
                id: String(b1.id),
                name: b1.name,
                status: '',
                created_at: '',
                registration_number: b1.registration_number
              },
              business2: {
                id: String(b2.id),
                name: b2.name,
                status: '',
                created_at: '',
                registration_number: b2.registration_number
              },
              similarity: similarity
            })
          }
        }
      }

      pairs.sort((a, b) => b.similarity - a.similarity)
      const filteredPairs = pairs.slice(0, 5)
      
      console.log(`Found ${filteredPairs.length} similar pairs`)
      setSimilarPairs(filteredPairs)
    } catch (error) {
      console.error('Error in fetchSimilarityAlerts:', error)
      setSimilarPairs([])
    } finally {
      setAlertLoading(false)
    }
  }

  const fetchRecentActivities = async () => {
    try {
      // Fetch the most recent activities from the activity log approach
      const { data: businesses, error: businessError } = await supabase
        .from('businesses')
        .select('id, name, status, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(6)

      const { data: reports, error: reportError } = await supabase
        .from('reports')
        .select('id, description, created_at, status')
        .order('created_at', { ascending: false })
        .limit(6)

      if (businessError || reportError) {
        console.error('Error fetching activities:', businessError || reportError)
        return
      }

      const activities: ActivityItem[] = []

      // Add business activities
      ;(businesses || []).forEach((business: any) => {
        if (business.status === 'verified') {
          activities.push({
            id: business.id,
            type: 'verification',
            title: 'Business Verified',
            description: business.name,
            time: formatTime(new Date(business.updated_at || business.created_at)),
            color: 'border-emerald-200 bg-emerald-50'
          })
        } else if (business.status === 'under_review') {
          activities.push({
            id: business.id,
            type: 'review',
            title: 'Business Under Review',
            description: business.name,
            time: formatTime(new Date(business.created_at)),
            color: 'border-amber-200 bg-amber-50'
          })
        } else {
          activities.push({
            id: business.id,
            type: 'creation',
            title: 'New Business Registered',
            description: business.name,
            time: formatTime(new Date(business.created_at)),
            color: 'border-blue-200 bg-blue-50'
          })
        }
      })

      // Add report activities
      ;(reports || []).forEach((report: any) => {
        activities.push({
          id: report.id,
          type: 'report',
          title: report.status === 'pending' ? 'New Fraud Report' : 'Fraud Report Processed',
          description: report.description?.substring(0, 50) + (report.description?.length > 50 ? '...' : '') || 'Fraud report',
          time: formatTime(new Date(report.created_at)),
          color: report.status === 'pending' ? 'border-rose-200 bg-rose-50' : 'border-violet-200 bg-violet-50'
        })
      })

      // Sort by time (newest first) and take only 6
      activities.sort((a, b) => {
        const timeA = getTimeValue(a.time)
        const timeB = getTimeValue(b.time)
        return timeB - timeA
      })

      setRecentActivities(activities.slice(0, 6))
    } catch (error) {
      console.error('Error fetching recent activities:', error)
      setRecentActivities([])
    }
  }

  const calculateSimilarity = (str1: string, str2: string): number => {
    // Simple similarity calculation - consider using a library for production
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    // Check for exact match first
    if (str1 === str2) return 1.0
    
    // Check for containing
    if (longer.includes(shorter)) return 0.9
    
    const distance = simpleSimilarity(longer, shorter)
    return (longer.length - distance) / longer.length
  }

  const simpleSimilarity = (str1: string, str2: string): number => {
    // A simpler implementation for better performance
    const set1 = new Set(str1.split(''))
    const set2 = new Set(str2.split(''))
    
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    const union = new Set([...set1, ...set2])
    
    return 1 - (intersection.size / union.size)
  }

  const getRiskLevel = (similarity: number): { level: string; color: string } => {
    if (similarity > 0.8) return { level: 'High', color: 'bg-red-100 text-red-700 border-red-200' }
    if (similarity > 0.6) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' }
    return { level: 'Low', color: 'bg-green-100 text-green-700 border-green-200' }
  }

  const formatTime = (date: Date): string => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days === 1) return 'Yesterday'
    return `${days}d ago`
  }

  const getTimeValue = (timeStr: string): number => {
    if (timeStr === 'Just now') return 0
    if (timeStr.includes('m')) return parseInt(timeStr) * 60 // minutes
    if (timeStr.includes('h')) return parseInt(timeStr) * 3600 // hours
    if (timeStr === 'Yesterday') return 86400 // 1 day
    if (timeStr.includes('d')) return parseInt(timeStr) * 86400 // days
    return 999999 // fallback
  }

  if (authLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner size="lg" text="Checking authentication..." />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner size="lg" text="Redirecting to login..." />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  const kpiCards = [
    {
      title: 'Total Businesses',
      value: stats.total.toLocaleString(),
      icon: Building2,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      trend: 'All registered',
      isPositive: true
    },
    {
      title: 'Verified',
      value: stats.verified.toLocaleString(),
      icon: CheckCircle,
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      trend: `${stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}% success rate`,
      isPositive: true
    },
    {
      title: 'Under Review',
      value: stats.under_review.toLocaleString(),
      icon: AlertTriangle,
      color: 'bg-gradient-to-br from-amber-500 to-amber-600',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      trend: 'Needs attention',
      isPositive: false
    },
    {
      title: 'Pending Reports',
      value: stats.pending_reports.toLocaleString(),
      icon: Flag,
      color: 'bg-gradient-to-br from-rose-500 to-rose-600',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      trend: 'Urgent action',
      isPositive: false
    },
  ]

  // Calculate pending verification count
  const pendingVerificationCount = stats.total - stats.verified - stats.under_review
  
  // Calculate percentages for chart
  const verifiedPercentage = stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0
  const underReviewPercentage = stats.total > 0 ? Math.round((stats.under_review / stats.total) * 100) : 0
  const pendingVerificationPercentage = stats.total > 0 ? Math.round((pendingVerificationCount / stats.total) * 100) : 0

  return (
    <div className="space-y-6 bg-gray-50/50 p-2 rounded-xl">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your system.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => (
          <div
            key={index}
            className={`${kpi.color} rounded-xl p-5 text-white transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl shadow-md`}
          >
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">{kpi.value}</div>
              <div className="text-lg font-medium mb-2">{kpi.title}</div>
              <div className="text-sm opacity-90">{kpi.trend}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Business Verification Status</h2>
              <p className="text-sm text-gray-500 mt-1">Distribution of business verification status</p>
            </div>
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            {[
              { 
                label: 'Verified', 
                value: stats.verified, 
                color: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
                percentage: verifiedPercentage
              },
              { 
                label: 'Under Review', 
                value: stats.under_review, 
                color: 'bg-gradient-to-r from-amber-400 to-amber-500',
                percentage: underReviewPercentage
              },
              { 
                label: 'Pending Verification', 
                value: pendingVerificationCount, 
                color: 'bg-gradient-to-r from-rose-400 to-rose-500',
                percentage: pendingVerificationPercentage
              },
            ].map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color.replace('bg-gradient-to-r', 'bg').replace('from-emerald-400 to-emerald-500', 'bg-emerald-500').replace('from-amber-400 to-amber-500', 'bg-amber-500').replace('from-rose-400 to-rose-500', 'bg-rose-500')}`}></div>
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                    <p className="text-xs text-gray-500">{item.percentage}% of total</p>
                  </div>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          
         
        </div>
      </div>

      {/* Alert Center & Recent Activity - Equal width */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert Center */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col h-[500px]">
          <div className="p-6 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Alert Center</h2>
                <p className="text-sm text-gray-500 mt-1">Active similarity alerts and notifications</p>
              </div>
              <Bell className="w-5 h-5 text-rose-600" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {alertLoading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="md" text="Loading alerts..." />
              </div>
            ) : similarPairs.length > 0 ? (
              <div className="space-y-4">
                {similarPairs.map((pair, index) => {
                  const risk = getRiskLevel(pair.similarity)
                  return (
                    <div key={index} className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${risk.color}`}>
                            {risk.level} Risk ({Math.round(pair.similarity * 100)}% similar)
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate">{pair.business1.name}</p>
                          <p className="text-xs text-gray-500">Reg: {pair.business1.registration_number || 'N/A'}</p>
                        </div>
                        
                        <div className="flex items-center justify-center">
                          <div className="h-px w-8 bg-gray-300"></div>
                          <span className="px-2 text-xs text-gray-500">vs</span>
                          <div className="h-px w-8 bg-gray-300"></div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate">{pair.business2.name}</p>
                          <p className="text-xs text-gray-500">Reg: {pair.business2.registration_number || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-gray-500">No active alerts</p>
                <p className="text-sm text-gray-400 mt-1">All systems are running smoothly</p>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-100 flex-shrink-0">
            <Link href="/admin/similarity">
              <button className="w-full py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md">
                <Eye className="w-4 h-4" />
                View All Alerts ({similarPairs.length})
              </button>
            </Link>
          </div>
        </div>

        {/* Recent Activity - Scrollable */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col shadow-sm h-[500px]">
          <div className="p-6 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                <p className="text-sm text-gray-500 mt-1">Latest system activities and events</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-blue-600">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium bg-blue-100 text-blue-600 px-2 py-1 rounded-full animate-pulse">
                  Live
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border ${activity.color} transform transition-all duration-300 hover:shadow-sm shadow-sm`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">{activity.time}</span>
                        </div>
                        <p className="text-sm text-gray-700 truncate">{activity.description}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-300 mx-auto mb-3">
                    <Activity className="w-12 h-12" />
                  </div>
                  <p className="text-gray-500">No recent activities</p>
                  <p className="text-sm text-gray-400 mt-1">Activities will appear here automatically</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 flex-shrink-0">
            <button 
              onClick={() => router.push('/admin/activity-logs')}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md"
            >
              <ArrowUpRight className="w-4 h-4" />
              View All Activity Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}