'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Upload, Download, FileText, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'
import Papa from 'papaparse'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface UploadResult {
  success: number
  failed: number
  errors: Array<{ row: number; message: string }>
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showInstructions, setShowInstructions] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setResult(null)

    try {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const businesses = results.data
          let success = 0
          let failed = 0
          const errors: Array<{ row: number; message: string }> = []

          for (let i = 0; i < businesses.length; i++) {
            const business: any = businesses[i]
            
            try {
              const { error } = await supabase
                .from('businesses')
                .insert({
                  name: business.name,
                  registration_number: business.registration_number,
                  status: business.status || 'unverified',
                  registration_date: business.registration_date,
                  address: business.address,
                  phone: business.phone || null,
                  email: business.email || null,
                  website: business.website || null,
                  sector: business.sector || null,
                  region: business.region || null,
                  authenticity_score: parseInt(business.authenticity_score || '0'),
                  tax_id: business.tax_id || null,
                  year_founded: business.year_founded ? parseInt(business.year_founded) : null,
                  website_url: business.website_url || null
                } as any)

              if (error) throw error
              success++
            } catch (error: any) {
              failed++
              errors.push({ row: i + 2, message: error.message || 'Unknown error' })
            }
          }

          setResult({ success, failed, errors })
          setUploading(false)
          if (success > 0) {
            setMessage({ type: 'success', text: `Successfully uploaded ${success} businesses!` })
          }
          if (failed > 0) {
            setMessage({ type: 'error', text: `Failed to upload ${failed} businesses. Check errors below.` })
          }
        },
        error: (error) => {
          console.error('CSV parse error:', error)
          setMessage({ type: 'error', text: 'Failed to parse CSV file. Please check the file format.' })
          setUploading(false)
        }
      })
    } catch (error) {
      console.error('Upload error:', error)
      setMessage({ type: 'error', text: 'Failed to upload file. Please try again.' })
      setUploading(false)
    }
  }

  const downloadTemplate = () => {
    const template = `name,registration_number,status,registration_date,address,phone,email,website,sector,region,authenticity_score,tax_id,year_founded,website_url
Example Business Ltd,SL-2024-000001,verified,2024-01-01,123 Main St Freetown,+232 76 123 456,info@example.sl,https://example.sl,Technology,Western Area,95,TAX-12345,2020,https://example.sl`
    
    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'business-upload-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-8">
        {/* Message Notification */}
        {message && (
          <div className={`rounded-lg border-2 p-3 md:p-4 mb-4 md:mb-6 flex items-start gap-2 md:gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 mt-0.5" />
            )}
            <span className={`text-xs md:text-sm font-medium flex-1 ${
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {message.text}
            </span>
          </div>
        )}

        {/* Header */}
        <div className="mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Bulk Upload Businesses</h1>
          <p className="text-xs md:text-sm text-gray-600">Upload businesses from a CSV file in bulk</p>
        </div>

        {/* Instructions Toggle */}
        <div className="mb-4 md:mb-6">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex items-center gap-2 text-xs md:text-sm text-blue-600 hover:text-blue-700"
          >
            <Info className="w-3 h-3 md:w-4 md:h-4" />
            {showInstructions ? 'Hide Instructions' : 'Show Upload Instructions'}
          </button>
          
          {showInstructions && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
              <h3 className="text-sm md:text-base font-semibold text-blue-900 mb-2">Upload Instructions</h3>
              <ul className="text-xs md:text-sm text-blue-800 space-y-1 md:space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Download the template CSV file using the button below</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Fill in the required business information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Save the file as a CSV (Comma Separated Values)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Upload the completed CSV file</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Required fields: name, registration_number, registration_date, address</span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
          <div className="space-y-3 md:space-y-4">
            {/* File Selection */}
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                Select CSV File
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="block w-full text-xs md:text-sm text-gray-500 file:mr-2 md:file:mr-4 file:py-2 file:px-3 md:file:px-4 file:rounded-lg file:border-0 file:text-xs md:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                />
                <FileText className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {file && (
                <div className="mt-2 text-xs md:text-sm text-gray-600">
                  Selected: <span className="font-medium truncate">{file.name}</span>
                  <span className="text-gray-500 ml-2">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-2">
              <Button
                onClick={handleUpload}
                variant="primary"
                disabled={!file || uploading}
                className="flex-1 justify-center py-2.5 md:py-3"
                size="sm"
              >
                {uploading ? (
                  <LoadingSpinner size="sm" text="Uploading..." />
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                    Upload CSV
                  </>
                )}
              </Button>
              <Button
                onClick={downloadTemplate}
                variant="secondary"
                className="flex-1 justify-center py-2.5 md:py-3"
                size="sm"
              >
                <Download className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                Download Template
              </Button>
            </div>

            {/* Quick Tips */}
            <div className="pt-3 md:pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                <span className="font-medium">Tip:</span> Maximum recommended upload size is 10MB. For larger files, split into multiple CSVs.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Results */}
        {result && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 animate-fadeIn">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Upload Results</h2>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 md:p-4 text-center">
                <p className="text-xs md:text-sm text-gray-600 mb-1">Successful</p>
                <p className="text-xl md:text-2xl lg:text-3xl font-bold text-green-600">{result.success}</p>
                <div className="flex items-center justify-center mt-1">
                  <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">Uploaded</span>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4 text-center">
                <p className="text-xs md:text-sm text-gray-600 mb-1">Failed</p>
                <p className="text-xl md:text-2xl lg:text-3xl font-bold text-red-600">{result.failed}</p>
                <div className="flex items-center justify-center mt-1">
                  <XCircle className="w-3 h-3 md:w-4 md:h-4 text-red-500 mr-1" />
                  <span className="text-xs text-red-600">Errors</span>
                </div>
              </div>
            </div>

            {/* Errors Section */}
            {result.errors.length > 0 && (
              <div>
                <h3 className="text-sm md:text-base font-semibold text-gray-700 mb-2 md:mb-3">
                  Errors ({result.errors.length})
                </h3>
                <div className="space-y-2 max-h-48 md:max-h-60 overflow-y-auto pr-2">
                  {result.errors.map((error, index) => (
                    <div 
                      key={index} 
                      className="text-xs md:text-sm bg-red-50 border border-red-200 p-2 md:p-3 rounded-lg flex items-start gap-2"
                    >
                      <AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-red-700">Row {error.row}:</span>
                        <span className="text-red-600 ml-1 break-words">{error.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Action Buttons for Errors */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs md:text-sm text-gray-600 mb-3">
                    You can download a CSV with only the failed rows to fix and re-upload.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      // Create CSV of failed rows
                      const failedRows = result.errors.map(error => ({
                        row: error.row,
                        error: error.message
                      }))
                      
                      const csvContent = Papa.unparse(failedRows)
                      const blob = new Blob([csvContent], { type: 'text/csv' })
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = 'upload-errors.csv'
                      a.click()
                      window.URL.revokeObjectURL(url)
                    }}
                    className="text-xs"
                  >
                    <Download className="w-3 h-3 mr-1.5" />
                    Download Error List
                  </Button>
                </div>
              </div>
            )}

            {/* Success Message */}
            {result.success > 0 && (
              <div className="mt-4 p-3 md:p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm md:text-base font-medium text-green-800 mb-1">
                      Upload Complete!
                    </p>
                    <p className="text-xs md:text-sm text-green-700">
                      {result.success} business{result.success !== 1 ? 'es were' : ' was'} successfully added to the directory.
                      {result.failed > 0 && ' Some rows failed to upload (see errors above).'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!result && !file && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-blue-50 rounded-full mb-3 md:mb-4">
              <Upload className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
            </div>
            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">Ready to Upload</h3>
            <p className="text-xs md:text-sm text-gray-600 max-w-md mx-auto mb-4 md:mb-6">
              Select a CSV file containing business information to begin bulk upload
            </p>
            <Button
              onClick={downloadTemplate}
              variant="primary"
              size="sm"
              className="mx-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              Get Template
            </Button>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        /* Custom scrollbar for error list */
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  )
}