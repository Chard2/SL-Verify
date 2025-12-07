'use client'

import React, { useEffect, useState } from 'react'
import { Download, X, Share2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { generateQRCode, getBusinessVerificationURL } from '@/lib/utils/qrcode'

interface QRCodeModalProps {
  isOpen: boolean
  onClose: () => void
  businessId: string
  businessName: string
}

export function QRCodeModal({ isOpen, onClose, businessId, businessName }: QRCodeModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (isOpen && !qrCodeUrl) {
      generateCode()
    }
  }, [isOpen, businessId])

  const generateCode = async () => {
    setIsGenerating(true)
    try {
      const url = getBusinessVerificationURL(businessId)
      const qr = await generateQRCode(url)
      setQrCodeUrl(qr)
    } catch (error) {
      console.error('Error generating QR code:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.download = `${businessName.replace(/\s+/g, '-')}-qr-code.png`
    link.href = qrCodeUrl
    link.click()
  }

  const handleShare = async () => {
    const url = getBusinessVerificationURL(businessId)
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: businessName,
          text: `Verify ${businessName} on Sierra Leone Business Directory`,
          url
        })
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Business Verification QR Code" size="md">
      <div className="text-center">
        {isGenerating ? (
          <div className="py-12">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Generating QR code...</p>
          </div>
        ) : qrCodeUrl ? (
          <>
            <div className="bg-white p-6 rounded-lg border-2 border-gray-200 inline-block mb-4">
              <img 
                src={qrCodeUrl} 
                alt={`QR code for ${businessName}`}
                className="w-64 h-64"
              />
            </div>

            <h3 className="font-semibold text-gray-900 mb-2">{businessName}</h3>
            <p className="text-sm text-gray-600 mb-4">
              Scan this QR code to quickly verify this business on any mobile device
            </p>

            {/* Display the URL */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Encoded URL:</p>
              <p className="text-xs text-gray-700 break-all font-mono">
                {getBusinessVerificationURL(businessId)}
              </p>
              {getBusinessVerificationURL(businessId).includes('localhost') && (
                <p className="text-xs text-yellow-600 mt-2">
                  ⚠️ Warning: Using localhost. QR codes will only work on the same device. 
                  Set NEXT_PUBLIC_APP_URL environment variable for production use.
                </p>
              )}
            </div>

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

            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
              <p className="text-xs text-gray-600">
                <strong>How to use:</strong> Print this QR code and display it at your business premises. 
                Customers can scan it to instantly verify your business registration status.
              </p>
            </div>
          </>
        ) : (
          <div className="py-12">
            <p className="text-red-600">Failed to generate QR code. Please try again.</p>
            <Button onClick={generateCode} variant="primary" className="mt-4">
              Retry
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}