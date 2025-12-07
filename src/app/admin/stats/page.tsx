'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart3, TrendingUp, Users, Building2, CheckCircle, AlertTriangle } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface AnalyticsData {
  totalBusinesses: number
  verifiedBusinesses: number
  pendingVerifications: number
  fraudReports: number
  recentRegistrations: number[]
  verificationTrends: Array<{ date: string; count: number }>
}

export default function StatsPage() {
  const [data, setData] = useState<AnalyticsData>({
    totalBusinesses: 0,
    verifiedBusinesses: 0,
    pendingVerifications: 0,
    fraudReports: 0,
    recentRegistrations: [],
    verificationTrends: []
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)

      const [
        totalRes,
        verifiedRes,
        pendingRes,
        reportsRes
      ] = await Promise.all([
        supabase.from('businesses').select('*', { count: 'exact', head: true }),
        supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('status', 'verified'),
        supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('status', 'under_review'),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ])

      // Get recent registrations (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const { data: recentData } = await supabase
        .from('businesses')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true })

      // Group by day
      const dailyCounts: { [key: string]: number } = {}
      recentData?.forEach(business => {
        const date = new Date(business.created_at).toISOString().split('T')[0]
        dailyCounts[date] = (dailyCounts[date] || 0) + 1
      })

      const trends = Object.entries(dailyCounts).map(([date, count]) => ({
        date,
        count
      }))

      setData({
        totalBusinesses: totalRes.count || 0,
        verifiedBusinesses: verifiedRes.count || 0,
        pendingVerifications: pendingRes.count || 0,
        fraudReports: reportsRes.count || 0,
        recentRegistrations: Object.values(dailyCounts),
        verificationTrends: trends
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    )
  }

  const stats = [
    {
      title: 'Total Businesses',
      value: data.totalBusinesses,
      icon: Building2,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Verified',
      value: data.verifiedBusinesses,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Pending',
      value: data.pendingVerifications,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      change: '-3%'
    },
    {
      title: 'Fraud Reports',
      value: data.fraudReports,
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: '+2'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">System performance and usage metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                  <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Registrations</h2>
          {data.recentRegistrations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No recent registrations</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.verificationTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{new Date(trend.date).toLocaleDateString()}</span>
                  <div className="flex items-center gap-2 flex-1 mx-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(trend.count / Math.max(...data.recentRegistrations, 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">{trend.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Verification Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Verified</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(data.verifiedBusinesses / Math.max(data.totalBusinesses, 1)) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-12 text-right">
                  {data.totalBusinesses > 0 ? Math.round((data.verifiedBusinesses / data.totalBusinesses) * 100) : 0}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Under Review</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${(data.pendingVerifications / Math.max(data.totalBusinesses, 1)) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-12 text-right">
                  {data.totalBusinesses > 0 ? Math.round((data.pendingVerifications / data.totalBusinesses) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
