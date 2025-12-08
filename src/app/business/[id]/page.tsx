'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  MapPin, Phone, Mail, Globe, Calendar, Building2, 
  Share2, QrCode, Flag, Download, ExternalLink, ArrowLeft, 
  CheckCircle, XCircle, AlertCircle, FileText, Shield,
  Users, Briefcase, Award, Clock, Info, BadgeCheck, Sparkles
} from 'lucide-react'
import { VerificationBadge } from '@/components/business/VerificationBadge'
import { QRCodeModal } from '@/components/business/QRCodeModal'
import { FileViewer } from '@/components/business/FileViewer'
import { VerificationTimeline } from '@/components/business/VerificationTimeline'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeBusinesses } from '@/lib/hooks/useRealtime'
import { formatDate, formatPhoneNumber } from '@/lib/utils/formatters'
import type { Business } from '@/types'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function BusinessProfilePage() {
  const params = useParams()
  const router = useRouter()
  const businessId = params.id as string

  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportDescription, setReportDescription] = useState('')
  const [reportEmail, setReportEmail] = useState('')
  const [submittingReport, setSubmittingReport] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [copied, setCopied] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    fetchBusiness()
  }, [businessId])

  useRealtimeBusinesses(businessId, () => {
    fetchBusiness()
  })

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const fetchBusiness = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single()

      if (error) throw error
      if (!data) {
        setError('Business not found')
        return
      }
      setBusiness(data)
    } catch (err: any) {
      console.error('Error fetching business:', err)
      setError(err.message || 'Failed to load business')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Verify ${business?.name}`,
          text: `Verify ${business?.name} on Sierra Leone Business Directory`,
          url
        })
      } catch (error) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setMessage({ type: 'success', text: 'Link copied to clipboard!' })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reportDescription.trim()) {
      setMessage({ type: 'error', text: 'Please provide a description' })
      return
    }

    setSubmittingReport(true)
    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          business_id: businessId,
          description: reportDescription,
          reporter_email: reportEmail || null
        } as any)

      if (error) throw error
      setMessage({ type: 'success', text: 'Report submitted successfully. Thank you!' })
      setReportModalOpen(false)
      setReportDescription('')
      setReportEmail('')
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit report. Please try again.' })
    } finally {
      setSubmittingReport(false)
    }
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      verified: { label: 'Verified', icon: BadgeCheck, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
      provisionally_verified: { label: 'Provisionally Verified', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
      under_review: { label: 'Under Review', icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
      unverified: { label: 'Unverified', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
    }
    return configs[status as keyof typeof configs] || configs.unverified
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <LoadingSpinner size="lg" text="Loading business details..." />
      </div>
    )
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Alert type="error" title="Error">{error || 'Business not found'}</Alert>
          <Button onClick={() => router.back()} variant="secondary" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />Go Back
          </Button>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(business.status)
  const StatusIcon = statusConfig.icon

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header/>
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button onClick={() => router.back()} className="group flex items-center gap-2 text-blue-100 hover:text-white mb-6 transition-all">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Search</span>
          </button>

          {message && (
            <div className={`rounded-xl border-2 p-4 mb-6 flex items-start gap-3 backdrop-blur-xl ${
              message.type === 'success' ? 'bg-green-900/30 border-green-400/50 text-green-100' : 
              message.type === 'error' ? 'bg-red-900/30 border-red-400/50 text-red-100' : 
              'bg-blue-900/30 border-blue-400/50 text-blue-100'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> :
               message.type === 'error' ? <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> :
               <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1">
              <div className={`inline-flex items-center gap-2 px-4 py-2 ${statusConfig.bg} backdrop-blur-xl rounded-full mb-4 border ${statusConfig.border}`}>
                <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                <span className={`text-sm font-semibold ${statusConfig.color}`}>{statusConfig.label}</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{business.name}</h1>

              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 mb-6">
                <Building2 className="w-5 h-5 text-blue-200" />
                <div>
                  <p className="text-xs text-blue-200">Registration Number</p>
                  <p className="font-mono font-bold text-white">{business.registration_number}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button onClick={() => setQrModalOpen(true)} className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2">
                  <QrCode className="w-5 h-5" />QR Code
                </button>
                <button onClick={handleShare} className="px-6 py-3 bg-white/10 backdrop-blur-xl text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20 flex items-center gap-2">
                  <Share2 className="w-5 h-5" />{copied ? 'Copied!' : 'Share'}
                </button>
                <button onClick={() => setReportModalOpen(true)} className="px-6 py-3 bg-white/10 backdrop-blur-xl text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20 flex items-center gap-2">
                  <Flag className="w-5 h-5" />Report
                </button>
              </div>
            </div>

            <div className="w-full lg:w-80 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />Verification Score
              </h3>
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-white mb-2">{business.authenticity_score}%</div>
                <div className="text-blue-200 text-sm">Authenticity Score</div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-200">Registration</span>
                  <span className="text-white font-semibold">Confirmed</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-200">Documents</span>
                  <span className="text-white font-semibold">Verified</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-200">Compliance</span>
                  <span className="text-white font-semibold">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-500 mb-1">Address</p>
                    <p className="text-gray-900 leading-relaxed">{business.address}</p>
                  </div>
                </div>

                {business.phone && (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-500 mb-1">Phone</p>
                      <a href={`tel:${business.phone}`} className="text-gray-900 font-medium hover:text-blue-600 transition-colors">
                        {formatPhoneNumber(business.phone)}
                      </a>
                    </div>
                  </div>
                )}

                {business.email && (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-500 mb-1">Email</p>
                      <a href={`mailto:${business.email}`} className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                        {business.email}
                      </a>
                    </div>
                  </div>
                )}

                {business.website && (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-500 mb-1">Website</p>
                      <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 transition-colors">
                        {business.website}<ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Business Details */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">Business Details</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {business.sector && (
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                    <p className="text-sm font-semibold text-gray-500 mb-2">Sector</p>
                    <p className="text-lg font-bold text-gray-900">{business.sector}</p>
                  </div>
                )}
                {business.region && (
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                    <p className="text-sm font-semibold text-gray-500 mb-2">Region</p>
                    <p className="text-lg font-bold text-gray-900">{business.region}</p>
                  </div>
                )}
                {business.registration_date && (
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <p className="text-sm font-semibold text-gray-500 mb-2">Registered</p>
                    <p className="text-lg font-bold text-gray-900">{formatDate(business.registration_date)}</p>
                  </div>
                )}
                {business.tax_id && (
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-100">
                    <p className="text-sm font-semibold text-gray-500 mb-2">Tax ID</p>
                    <p className="text-lg font-bold text-gray-900 font-mono">{business.tax_id}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            {business.documents && (business.documents as any[]).length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900">Supporting Documents</h2>
                </div>
                <div className="p-6 space-y-3">
                  {(business.documents as any[]).map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{doc.name}</p>
                          <p className="text-sm text-gray-500 capitalize">{doc.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
                        <Download className="w-5 h-5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certificate */}
            {business.certificate_url && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Certificate</h2>
                <FileViewer fileUrl={business.certificate_url} fileName={`${business.registration_number}-certificate.pdf`} fileType="pdf" />
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <VerificationTimeline businessId={businessId} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trust Indicators */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-200">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />Trust Indicators
                </h3>
              </div>
              <div className="p-6 space-y-3">
                {business.status === 'verified' && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900">Officially Verified</span>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900">Registration Confirmed</span>
                </div>
                {business.certificate_url && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900">Certificate Available</span>
                  </div>
                )}
              </div>
            </div>

            {/* Last Updated */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Last Updated</h4>
                  <p className="text-sm text-gray-600">{formatDate(business.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <QRCodeModal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} businessId={businessId} businessName={business.name} />

      <Modal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} title="Report an Issue" size="md">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Help us maintain accuracy by reporting any issues with this business listing.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Describe the issue..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Email (optional)</label>
            <input type="email" value={reportEmail} onChange={(e) => setReportEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="your.email@example.com" />
            <p className="text-xs text-gray-500 mt-1">Provide your email if you'd like updates</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={(e) => { e.preventDefault(); handleSubmitReport(e as any); }} variant="primary" isLoading={submittingReport}>Submit Report</Button>
            <Button onClick={() => setReportModalOpen(false)} variant="secondary">Cancel</Button>
          </div>
        </div>
      </Modal>
<Footer/>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  )
}