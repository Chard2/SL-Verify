'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { QrCode, Download, Share2, Copy, Check, Search } from 'lucide-react'
import { generateBusinessQRCode, getBusinessVerificationURL } from '@/lib/utils/qrcode'
import type { Business } from '@/types'

export default function QRCodePage() {
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [business, setBusiness] = useState<Business | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  const handleSearch = async () => {
    if (!registrationNumber.trim()) return

    setLoading(true)
    setBusiness(null)
    setQrCodeUrl('')
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('registration_number', registrationNumber)
        .single()

      if (error) throw error

      if (!data) {
        alert('Business not found')
        return
      }

      setBusiness(data)
      // Auto-generate QR code when business is found
      generateQRCode(data.id)
    } catch (error: any) {
      console.error('Search error:', error)
      alert(error.message || 'Failed to find business')
    } finally {
      setLoading(false)
    }
  }

  const generateQRCode = async (businessId: string) => {
    setGenerating(true)
    try {
      const qr = await generateBusinessQRCode(businessId, {
        width: 400,
        margin: 2,
        color: {
          dark: '#1e40af',
          light: '#ffffff'
        }
      })
      setQrCodeUrl(qr)
    } catch (error) {
      console.error('Error generating QR code:', error)
      alert('Failed to generate QR code')
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!qrCodeUrl || !business) return

    const link = document.createElement('a')
    link.download = `${business.name.replace(/\s+/g, '-')}-qr-code.png`
    link.href = qrCodeUrl
    link.click()
  }

  const handleShare = async () => {
    if (!business) return

    const url = getBusinessVerificationURL(business.id)
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: business.name,
          text: `Verify ${business.name} on Sierra Leone Business Directory`,
          url
        })
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopyURL = () => {
    if (!business) return
    const url = getBusinessVerificationURL(business.id)
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <QrCode className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            QR Code Generator
          </h1>
          <p className="text-gray-600">
            Generate a QR code for your business verification page
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Find Your Business
          </h2>
          <div className="flex gap-3">
            <Input
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
              placeholder="Enter registration number (e.g., SL-2023-001234)"
              className="flex-1"
            />
            <Button onClick={handleSearch} isLoading={loading}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* QR Code Display */}
        {business && (
          <>
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  QR Code for {business.name}
                </h2>
                <Button
                  onClick={() => generateQRCode(business.id)}
                  variant="secondary"
                  size="sm"
                  isLoading={generating}
                >
                  Regenerate
                </Button>
              </div>

              {generating ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Generating QR code...</p>
                </div>
              ) : qrCodeUrl ? (
                <>
                  <div className="flex flex-col items-center">
                    <div className="bg-white p-8 rounded-lg border-2 border-gray-200 inline-block mb-6">
                      <img 
                        src={qrCodeUrl} 
                        alt={`QR code for ${business.name}`}
                        className="w-80 h-80"
                      />
                    </div>

                    <div className="w-full max-w-md space-y-4">
                      <div className="flex gap-3 justify-center">
                        <Button onClick={handleDownload} variant="primary">
                          <Download className="w-4 h-4 mr-2" />
                          Download QR Code
                        </Button>
                        <Button onClick={handleShare} variant="secondary">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Verification URL:</span>
                          <Button
                            onClick={handleCopyURL}
                            variant="ghost"
                            size="sm"
                          >
                            {copied ? (
                              <>
                                <Check className="w-4 h-4 mr-1" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-1" />
                                Copy
                              </>
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600 break-all font-mono">
                          {getBusinessVerificationURL(business.id)}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-gray-600 mb-4">Click "Regenerate" to create QR code</p>
                  <Button onClick={() => generateQRCode(business.id)} variant="primary">
                    Generate QR Code
                  </Button>
                </div>
              )}
            </div>

            {/* Business Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Business Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Name:</span>
                  <p className="font-medium text-gray-900">{business.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Registration Number:</span>
                  <p className="font-medium text-gray-900">{business.registration_number}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Status:</span>
                  <p className="font-medium text-gray-900 capitalize">{business.status.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Authenticity Score:</span>
                  <p className="font-medium text-gray-900">{business.authenticity_score}%</p>
                </div>
              </div>
            </div>

            {/* Usage Instructions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                How to Use Your QR Code
              </h2>
              <div className="space-y-3">
                <Alert type="info" title="Print and Display">
                  <p className="text-sm">
                    Download your QR code and print it. Display it prominently at your business premises, 
                    on your website, or in marketing materials.
                  </p>
                </Alert>
                <Alert type="info" title="Customer Benefits">
                  <p className="text-sm">
                    Customers can scan the QR code with any smartphone camera to instantly verify your 
                    business registration status and authenticity score.
                  </p>
                </Alert>
                <Alert type="info" title="Best Practices">
                  <ul className="text-sm list-disc list-inside space-y-1 mt-2">
                    <li>Ensure the QR code is at least 2cm x 2cm when printed</li>
                    <li>Place it in a well-lit area for easy scanning</li>
                    <li>Keep it clean and free from damage</li>
                    <li>Test scan before displaying to ensure it works</li>
                  </ul>
                </Alert>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!business && !loading && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Find Your Business
            </h3>
            <p className="text-gray-600">
              Enter your business registration number above to generate a QR code
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

