'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Shield,
  AlertTriangle,
  Users,
  RefreshCw
} from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils/formatters'

interface Report {
  id: string
  name: string
  type: string
  generated_at: string
  period: string
  data?: any
}

export default function AnalyticsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [expandedReport, setExpandedReport] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchReports()
  }, [])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const savedReports = localStorage.getItem('generated_reports')
      if (savedReports) {
        setReports(JSON.parse(savedReports))
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
      setMessage({ type: 'error', text: 'Failed to load reports' })
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async (type: string) => {
    try {
      setGenerating(type)
      
      let reportData: any = {}
      let reportName = ''
      let period = ''

      switch (type) {
        case 'verifications':
          const { data: businesses } = await supabase
            .from('businesses')
            .select('id, name, registration_number, status, created_at, updated_at')
            .order('created_at', { ascending: false })

          type BusinessWithStatus = { status: string }
          const verified = (businesses as BusinessWithStatus[] | undefined)?.filter(b => b.status === 'verified').length || 0
          const pending = (businesses as BusinessWithStatus[] | undefined)?.filter(b => b.status === 'under_review').length || 0
          const unverified = (businesses as BusinessWithStatus[] | undefined)?.filter(b => b.status === 'unverified').length || 0

          reportData = {
            total: businesses?.length || 0,
            verified,
            pending,
            unverified,
            businesses: businesses || []
          }
          reportName = 'Verification Report'
          period = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          break

        case 'fraud':
          const { data: fraudReports } = await supabase
            .from('reports')
            .select('*, business:businesses(name, registration_number)')
            .order('created_at', { ascending: false })

          type FraudReport = { status?: string }
          const typedFraudReports = (fraudReports as FraudReport[] | undefined) || []
          reportData = {
            total: typedFraudReports.length,
            pending: typedFraudReports.filter(r => r.status === 'pending').length,
            reviewed: typedFraudReports.filter(r => r.status === 'reviewed').length,
            rejected: typedFraudReports.filter(r => r.status === 'rejected').length,
            reports: typedFraudReports
          }
          reportName = 'Fraud Reports Summary'
          period = 'Last 30 days'
          break

        case 'registrations':
          const { data: registrations } = await supabase
            .from('businesses')
            .select('id, name, registration_number, registration_date, created_at, sector, region')
            .order('created_at', { ascending: false })

          const byMonth: Record<string, number> = {}
          ;((registrations ?? []) as any[]).forEach((b: any) => {
            if (b.created_at) {
              const month = new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
              byMonth[month] = (byMonth[month] || 0) + 1
            }
          })

          reportData = {
            total: registrations?.length || 0,
            byMonth,
            recent: registrations?.slice(0, 50) || []
          }
          reportName = 'Business Registration Trends'
          period = 'Q1 2025'
          break

        case 'similarity':
          const { data: allBusinesses } = await supabase
            .from('businesses')
            .select('id, name, registration_number, status')
            .order('name', { ascending: true })

          const similar: any[] = []
          const names = allBusinesses || []
          for (let i = 0; i < names.length; i++) {
            const business1 = names[i] as { name: string }
            if (!business1 || typeof business1.name !== 'string') continue
            for (let j = i + 1; j < names.length; j++) {
              const business2 = names[j] as { name: string }
              if (!business2 || typeof business2.name !== 'string') continue
              const name1 = business1.name.toLowerCase()
              const name2 = business2.name.toLowerCase()
              if (name1.includes(name2.substring(0, 5)) || name2.includes(name1.substring(0, 5))) {
                similar.push({
                  business1: business1,
                  business2: names[j],
                  similarity: 'high'
                })
              }
            }
          }

          reportData = {
            total: allBusinesses?.length || 0,
            potentialDuplicates: similar.length,
            similar
          }
          reportName = 'Similarity Alerts'
          period = 'Current'
          break
      }

      const newReport: Report = {
        id: `report-${Date.now()}-${type}`,
        name: reportName,
        type,
        generated_at: new Date().toISOString(),
        period,
        data: reportData
      }

      const existingReports = JSON.parse(localStorage.getItem('generated_reports') || '[]')
      existingReports.unshift(newReport)
      const updatedReports = existingReports.slice(0, 20)
      localStorage.setItem('generated_reports', JSON.stringify(updatedReports))
      setReports(updatedReports)

      setMessage({ type: 'success', text: `${reportName} generated!` })
    } catch (error: any) {
      console.error('Error generating report:', error)
      setMessage({ type: 'error', text: `Failed to generate report: ${error.message || 'Unknown error'}` })
    } finally {
      setGenerating(null)
    }
  }

  const downloadReport = async (report: Report) => {
    try {
      setDownloading(report.id)

      if (!report.data) {
        setMessage({ type: 'error', text: 'Report data not available' })
        return
      }

      let csvContent = ''
      let filename = ''

      switch (report.type) {
        case 'verifications':
          filename = `verification-report-${new Date().toISOString().split('T')[0]}.csv`
          csvContent = 'Business Name,Registration Number,Status,Created At\n'
          report.data.businesses?.forEach((b: any) => {
            const name = b.name || 'N/A'
            const regNum = b.registration_number || 'N/A'
            const status = b.status || 'N/A'
            const createdAt = b.created_at ? formatDate(b.created_at) : 'N/A'
            csvContent += `"${name}","${regNum}","${status}","${createdAt}"\n`
          })
          break

        case 'fraud':
          filename = `fraud-reports-${new Date().toISOString().split('T')[0]}.csv`
          csvContent = 'Business Name,Registration Number,Description,Status,Reported At\n'
          report.data.reports?.forEach((r: any) => {
            const businessName = r.business?.name || 'N/A'
            const regNum = r.business?.registration_number || 'N/A'
            csvContent += `"${businessName}","${regNum}","${r.description}","${r.status}","${formatDate(r.created_at)}"\n`
          })
          break

        case 'registrations':
          filename = `registration-trends-${new Date().toISOString().split('T')[0]}.csv`
          csvContent = 'Month,Registrations\n'
          Object.entries(report.data.byMonth || {}).forEach(([month, count]) => {
            csvContent += `"${month}",${count}\n`
          })
          csvContent += '\nRecent Registrations\n'
          csvContent += 'Business Name,Registration Number,Sector,Region,Registration Date\n'
          report.data.recent?.forEach((b: any) => {
            csvContent += `"${b.name}","${b.registration_number}","${b.sector || 'N/A'}","${b.region || 'N/A'}","${formatDate(b.registration_date)}"\n`
          })
          break

        case 'similarity':
          filename = `similarity-alerts-${new Date().toISOString().split('T')[0]}.csv`
          csvContent = 'Business 1 Name,Registration 1,Business 2 Name,Registration 2,Similarity\n'
          report.data.similar?.forEach((s: any) => {
            csvContent += `"${s.business1.name}","${s.business1.registration_number}","${s.business2.name}","${s.business2.registration_number}","${s.similarity}"\n`
          })
          break
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setMessage({ type: 'success', text: 'Report downloaded!' })
    } catch (error: any) {
      console.error('Error downloading report:', error)
      setMessage({ type: 'error', text: `Failed to download report: ${error.message || 'Unknown error'}` })
    } finally {
      setDownloading(null)
    }
  }

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'verifications': return <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
      case 'fraud': return <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
      case 'registrations': return <Users className="w-5 h-5 sm:w-6 sm:h-6" />
      case 'similarity': return <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
      default: return <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
    }
  }

  const getReportColor = (type: string) => {
    switch (type) {
      case 'verifications': return 'bg-blue-100 text-blue-600'
      case 'fraud': return 'bg-red-100 text-red-600'
      case 'registrations': return 'bg-green-100 text-green-600'
      case 'similarity': return 'bg-purple-100 text-purple-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const reportTypes = [
    { 
      id: 'verifications', 
      name: 'Verification Report', 
      description: 'Summary of all verifications',
      icon: <Shield className="w-5 h-5" />
    },
    { 
      id: 'fraud', 
      name: 'Fraud Reports', 
      description: 'Fraud cases and resolutions',
      icon: <AlertTriangle className="w-5 h-5" />
    },
    { 
      id: 'registrations', 
      name: 'Registration Trends', 
      description: 'New business registrations',
      icon: <Users className="w-5 h-5" />
    },
    { 
      id: 'similarity', 
      name: 'Similarity Alerts', 
      description: 'Duplicate name detection',
      icon: <BarChart3 className="w-5 h-5" />
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics & Reports</h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                Generate and download system reports
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchReports}
              disabled={loading}
              className="gap-2 self-start sm:self-auto"
            >
              <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
              <span className="sm:hidden">Ref</span>
            </Button>
          </div>
        </div>

        {/* Message Notification */}
        {message && (
          <div className={`rounded-lg border-2 p-3 sm:p-4 mb-4 sm:mb-6 flex items-start gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
            )}
            <span className="text-xs sm:text-sm font-medium flex-1">{message.text}</span>
          </div>
        )}

        {/* Generate Reports */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Generate New Report
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {reportTypes.map((type) => (
              <div 
                key={type.id} 
                className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getReportColor(type.id)} flex-shrink-0`}>
                    {type.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 truncate">
                      {type.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                      {type.description}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => generateReport(type.id)}
                  variant="primary"
                  size="sm"
                  disabled={generating === type.id}
                  className="w-full justify-center"
                >
                  {generating === type.id ? (
                    <LoadingSpinner size="sm" text="Generating..." />
                  ) : (
                    <>
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="text-xs sm:text-sm">Generate</span>
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Generated Reports */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              Generated Reports
            </h3>
            {reports.length > 0 && (
              <span className="text-xs sm:text-sm text-gray-500">
                {reports.length} report{reports.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8 sm:py-12">
              <LoadingSpinner text="Loading reports..." />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-gray-500 px-4">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full mb-3 sm:mb-4">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
              </div>
              <p className="text-sm sm:text-base">
                No reports generated yet. Generate a report to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div 
                  key={report.id} 
                  className="border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  {/* Report Header */}
                  <div className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg ${getReportColor(report.type)} flex-shrink-0`}>
                          {getReportIcon(report.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-gray-900 text-sm sm:text-base ">
                                {report.name}
                              </h3>
                              <div className="flex items-center flex-wrap gap-1 sm:gap-2 mt-1">
                                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                  <Calendar className="w-3 h-3" />
                                  {report.period}
                                </span>
                                <span className="text-xs text-gray-500">•</span>
                                <span className="text-xs text-gray-500">
                                  Generated {formatDate(report.generated_at)}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => setExpandedReport(
                                expandedReport === report.id ? null : report.id
                              )}
                              className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
                            >
                              {expandedReport === report.id ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          
                          {/* Report Summary Stats */}
                          {report.data && (
                            <div className="mt-2">
                              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                {report.type === 'verifications' && (
                                  <>
                                    <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                                      Total: {report.data.total}
                                    </span>
                                    <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded">
                                      Verified: {report.data.verified}
                                    </span>
                                    <span className="text-xs px-2 py-1 bg-yellow-50 text-yellow-700 rounded">
                                      Pending: {report.data.pending}
                                    </span>
                                  </>
                                )}
                                {report.type === 'fraud' && (
                                  <>
                                    <span className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded">
                                      Total: {report.data.total}
                                    </span>
                                    <span className="text-xs px-2 py-1 bg-yellow-50 text-yellow-700 rounded">
                                      Pending: {report.data.pending}
                                    </span>
                                    <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded">
                                      Reviewed: {report.data.reviewed}
                                    </span>
                                  </>
                                )}
                                {report.type === 'registrations' && (
                                  <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded">
                                    Total Registrations: {report.data.total}
                                  </span>
                                )}
                                {report.type === 'similarity' && (
                                  <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded">
                                    Potential Duplicates: {report.data.potentialDuplicates}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Download Button - Mobile only */}
                    <div className="mt-3 flex lg:hidden">
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => downloadReport(report)}
                        disabled={downloading === report.id}
                        className="w-full justify-center"
                      >
                        {downloading === report.id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <Download className="w-3 h-3 mr-2" />
                            Download
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Download Button - Desktop only */}
                    <div className="mt-3 hidden lg:flex lg:items-center lg:justify-end">
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => downloadReport(report)}
                        disabled={downloading === report.id}
                        className="gap-2"
                      >
                        {downloading === report.id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            Download Report
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Report Details */}
                  {expandedReport === report.id && report.data && (
                    <div className="border-t border-gray-200 p-3 sm:p-4 bg-gray-50">
                      <div className="space-y-4">
                        {/* Report Type Specific Details */}
                        {report.type === 'verifications' && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                            <div className="bg-white p-2 sm:p-3 rounded border">
                              <div className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Total</div>
                              <div className="text-lg sm:text-xl font-semibold text-gray-900">
                                {report.data.total}
                              </div>
                            </div>
                            <div className="bg-white p-2 sm:p-3 rounded border">
                              <div className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Verified</div>
                              <div className="text-lg sm:text-xl font-semibold text-green-600">
                                {report.data.verified}
                              </div>
                            </div>
                            <div className="bg-white p-2 sm:p-3 rounded border">
                              <div className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Pending</div>
                              <div className="text-lg sm:text-xl font-semibold text-yellow-600">
                                {report.data.pending}
                              </div>
                            </div>
                            <div className="bg-white p-2 sm:p-3 rounded border">
                              <div className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Unverified</div>
                              <div className="text-lg sm:text-xl font-semibold text-gray-600">
                                {report.data.unverified}
                              </div>
                            </div>
                          </div>
                        )}

                        {report.type === 'fraud' && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                            <div className="bg-white p-2 sm:p-3 rounded border">
                              <div className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Total</div>
                              <div className="text-lg sm:text-xl font-semibold text-gray-900">
                                {report.data.total}
                              </div>
                            </div>
                            <div className="bg-white p-2 sm:p-3 rounded border">
                              <div className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Pending</div>
                              <div className="text-lg sm:text-xl font-semibold text-yellow-600">
                                {report.data.pending}
                              </div>
                            </div>
                            <div className="bg-white p-2 sm:p-3 rounded border">
                              <div className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Reviewed</div>
                              <div className="text-lg sm:text-xl font-semibold text-green-600">
                                {report.data.reviewed}
                              </div>
                            </div>
                            <div className="bg-white p-2 sm:p-3 rounded border">
                              <div className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Rejected</div>
                              <div className="text-lg sm:text-xl font-semibold text-red-600">
                                {report.data.rejected}
                              </div>
                            </div>
                          </div>
                        )}

                        {report.type === 'registrations' && report.data.byMonth && (
                          <div>
                            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">
                              Monthly Breakdown
                            </h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {Object.entries(report.data.byMonth).map(([month, count]) => (
                                <div key={month} className="flex items-center justify-between bg-white p-2 sm:p-3 rounded border">
                                  <span className="text-xs sm:text-sm text-gray-700">{month}</span>
                                  <span className="text-xs sm:text-sm font-semibold text-gray-900">
                                    {count as number}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {report.type === 'similarity' && report.data.similar && (
                          <div>
                            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">
                              Potential Duplicates ({report.data.similar.length})
                            </h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {report.data.similar.slice(0, 5).map((item: any, index: number) => (
                                <div key={index} className="bg-white p-2 sm:p-3 rounded border">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                      {item.business1.name}
                                    </span>
                                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                                      Similar
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-500 truncate">
                                    {item.business2.name}
                                  </div>
                                </div>
                              ))}
                              {report.data.similar.length > 5 && (
                                <div className="text-center py-2">
                                  <span className="text-xs text-gray-500">
                                    +{report.data.similar.length - 5} more duplicates
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Sample Data Preview */}
                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">
                            Sample Data ({report.type})
                          </h4>
                          <div className="text-xs sm:text-sm text-gray-600 bg-white p-3 rounded border">
                            <p className="line-clamp-3">
                              Report contains detailed information for analysis and export.
                              Click "Download" to get the complete CSV file with all data.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Reports Footer */}
          {reports.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
                <div>
                  Showing {reports.length} report{reports.length !== 1 ? 's' : ''}
                </div>
                <div className="mt-1 sm:mt-0">
                  Reports are stored locally in your browser
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            Reports are generated from live database data and stored locally in your browser
          </p>
        </div>
      </div>
    </div>
  )
}