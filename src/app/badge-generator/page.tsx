'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Copy, Check, Shield } from 'lucide-react'

export default function BadgeGeneratorPage() {
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [business, setBusiness] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSearch = async () => {
    if (!registrationNumber.trim()) return

    setLoading(true)
    setBusiness(null)
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('registration_number', registrationNumber.trim())
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          setMessage({ type: 'error', text: 'Business not found with that registration number' })
        } else {
          throw error
        }
        return
      }

      if (!data) {
        setMessage({ type: 'error', text: 'Business not found' })
        return
      }

      setBusiness(data)
    } catch (error: any) {
      console.error('Search error:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to find business. Please check the registration number and try again.' })
    } finally {
      setLoading(false)
    }
  }

  const generateEmbedCode = () => {
    if (!business) return ''

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    return `<a href="${baseUrl}/business/${business.id}" target="_blank" style="display: inline-block; text-decoration: none;">
  <div style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 16px; background: #f0f9ff; border: 1px solid #bfdbfe; border-radius: 8px; font-family: system-ui, -apple-system, sans-serif;">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      <path d="M9 12l2 2 4-4"></path>
    </svg>
    <div>
      <div style="font-weight: 600; color: #1e40af; font-size: 14px;">${business.name}</div>
      <div style="font-size: 12px; color: #64748b;">Verified Business • ${business.authenticity_score}%</div>
    </div>
  </div>
</a>`
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generateEmbedCode())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verification Badge Generator
          </h1>
          <p className="text-gray-600">
            Generate an embeddable verification badge for your business
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
              placeholder="Enter registration number (e.g., SL-2023-001234)"
              className="flex-1"
            />
            <Button onClick={handleSearch} isLoading={loading}>
              Search
            </Button>
          </div>
        </div>

        {/* Badge Preview */}
        {business && (
          <>
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Badge Preview
              </h2>

              <div className="p-8 bg-gray-50 rounded-lg border border-gray-200 flex justify-center">
                <a 
                  href={`/business/${business.id}`}
                  target="_blank"
                  className="inline-block"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-semibold text-blue-900 text-sm">
                        {business.name}
                      </div>
                      <div className="text-xs text-blue-700">
                        Verified Business • {business.authenticity_score}%
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* Embed Code */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Embed Code
                </h2>
                <Button
                  onClick={handleCopy}
                  variant="secondary"
                  size="sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>

              <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-sm text-gray-800 border border-gray-200">
                {generateEmbedCode()}
              </pre>

              <div className="mt-4">
                <Alert type="info" title="How to use">
                  <p className="text-sm">
                    Copy the embed code above and paste it into your website's HTML where you want the badge to appear.
                    The badge is clickable and links directly to your verification page.
                  </p>
                </Alert>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}