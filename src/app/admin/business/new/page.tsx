'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle, 
  Upload,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  Briefcase,
  Calendar,
  FileText,
  User,
  Shield,
  X,
  Loader2,
  Info,
  Menu,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

// Define a simple type that matches your database schema
type BusinessInsertData = {
  name: string;
  registration_number: string;
  status: 'unverified' | 'verified' | 'provisionally_verified' | 'under_review';
  registration_date: string;
  address: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  sector?: string | null;
  region?: string | null;
  authenticity_score?: number | null;
  tax_id?: string | null;
  year_founded?: number | null;
  website_url?: string | null;
  documents?: any | null;
  certificate_url?: string | null;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploading?: boolean;
  error?: string;
  progress?: number;
}

export default function NewBusinessPage() {
  const router = useRouter()
  const supabase = createClient()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; title: string; text: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'contact' | 'details' | 'documents'>('basic')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState<Partial<BusinessInsertData>>({})
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [shouldSubmit, setShouldSubmit] = useState(false)
  const [showMobileTabs, setShowMobileTabs] = useState(false)

  // Handle field changes
  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleFileUpload = async (files: FileList) => {
    const newFiles = Array.from(files)
    const allowedTypes = [
      'application/pdf', 
      'image/jpeg', 
      'image/jpg',
      'image/png', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    
    setIsUploading(true)
    
    // Create file objects first
    const fileObjects: UploadedFile[] = newFiles.map((file) => {
      const isValid = allowedTypes.includes(file.type)
      const isSizeValid = file.size <= 20 * 1024 * 1024 // 20MB limit
      
      let error = ''
      if (!isValid) {
        error = 'File type not supported. Please upload PDF, DOC, XLS, JPG, or PNG files.'
      } else if (!isSizeValid) {
        error = `File is too large. Maximum size is 20MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`
      }
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        uploading: !error,
        error,
        progress: 0
      }
    })
    
    setUploadedFiles(prev => [...prev, ...fileObjects])
    
    // Upload files to Supabase Storage
    for (const fileData of fileObjects) {
      if (fileData.error) continue
      
      try {
        // Get the actual file from the FileList
        const file = newFiles.find(f => f.name === fileData.name)
        if (!file) continue
        
        // Update to show uploading
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { ...f, uploading: true, progress: 50 }
            : f
        ))
        
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`
        const filePath = `${fileName}`
        
        // Upload file to Supabase Storage
        const { data, error } = await supabase.storage
          .from('business-documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })
        
        if (error) {
          throw new Error(`File upload failed: ${error.message}`)
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('business-documents')
          .getPublicUrl(filePath)
        
        // Update file with URL
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { ...f, uploading: false, url: urlData.publicUrl, progress: 100 }
            : f
        ))
        
      } catch (error: any) {
        console.error('Upload error:', error)
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { ...f, uploading: false, error: error.message || 'File upload failed. Please try again.' }
            : f
        ))
      }
    }
    
    setIsUploading(false)
  }

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id))
  }

  // Validate current tab before proceeding
  const validateTab = (tab: string): boolean => {
    const errors: Record<string, string> = {}
    
    if (tab === 'basic') {
      if (!formData.name?.trim()) errors.name = 'Business name is required'
      if (!formData.registration_number?.trim()) errors.registration_number = 'Registration number is required'
      if (!formData.registration_date?.trim()) errors.registration_date = 'Registration date is required'
      if (!formData.address?.trim()) errors.address = 'Address is required'
      
      // Validate date format
      if (formData.registration_date) {
        const dateObj = new Date(formData.registration_date)
        if (isNaN(dateObj.getTime())) {
          errors.registration_date = 'Invalid date format'
        } else if (dateObj > new Date()) {
          errors.registration_date = 'Registration date cannot be in the future'
        }
      }
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle tab change with validation
  const handleTabChange = (newTab: 'basic' | 'contact' | 'details' | 'documents') => {
    if (activeTab === 'basic' && !validateTab('basic')) {
      // Don't allow leaving basic tab if validation fails
      return
    }
    
    setActiveTab(newTab)
    setShowMobileTabs(false)
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    
    setIsSubmitting(true)
    setMessage(null)
    
    try {
      console.log('Starting business creation process...')
      
      // Validate all required fields
      if (!validateTab('basic')) {
        setActiveTab('basic')
        throw new Error('Please complete all required fields in the Basic Information tab')
      }
      
      // Prepare documents array from successfully uploaded files
      const documents = uploadedFiles
        .filter(file => file.url && !file.error && !file.uploading)
        .map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          url: file.url,
          uploaded_at: new Date().toISOString()
        }))

      // Build complete data object
      const data: BusinessInsertData = {
        // Required fields from formData
        name: formData.name!,
        registration_number: formData.registration_number!,
        status: formData.status || 'unverified',
        registration_date: formData.registration_date!,
        address: formData.address!,
        
        // Optional fields
        phone: formData.phone?.trim() || null,
        email: formData.email?.trim() || null,
        website: formData.website?.trim() || null,
        sector: formData.sector?.trim() || null,
        region: formData.region?.trim() || null,
        authenticity_score: formData.authenticity_score || 0,
        tax_id: formData.tax_id?.trim() || null,
        year_founded: formData.year_founded || null,
        website_url: formData.website?.trim() || null,
        documents: documents.length > 0 ? documents : null,
      }

      console.log('Attempting to create business with data:', data)

      // Create the business record
      const { error, data: businessData } = await supabase
        .from('businesses')
        .insert(data as any)
        .select()
        .single()

      if (error) {
        console.error('Supabase error details:', error)
        
        let userMessage = 'We encountered an issue while saving the business information.'
        
        if (error.code === '23505') {
          userMessage = 'A business with this registration number already exists. Please use a different registration number.'
        } else if (error.code === '23502') {
          userMessage = 'Missing required information. Please check all required fields are filled.'
        } else if (error.code === '22P02') {
          userMessage = 'Invalid data format. Please check your entries and try again.'
        }
        
        throw new Error(`${userMessage} (Error: ${error.code || 'DB_ERROR'})`)
      }

      if (!businessData) {
        throw new Error('Business creation completed but no data was returned. Please check if the business was created successfully.')
      }

      console.log('Business created successfully:', businessData)
      setMessage({ 
        type: 'success', 
        title: 'Business Created Successfully!',
        text: 'Your new business has been registered in the directory. You will be redirected shortly.' 
      })
      
      setTimeout(() => {
        router.push('/admin/businesses')
      }, 2000)
      
    } catch (error: any) {
      console.error('Business creation error:', error)
      
      let errorTitle = 'Operation Failed'
      let errorMessage = error?.message || 'An unexpected error occurred while creating the business.'
      
      // Clean up the error message for user display
      if (errorMessage.includes('(Error:')) {
        errorMessage = errorMessage.split('(Error:')[0].trim()
      }
      
      setMessage({ 
        type: 'error', 
        title: errorTitle,
        text: errorMessage
      })
      
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setIsSubmitting(false)
      setShouldSubmit(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄'
    if (type.includes('image')) return '🖼️'
    if (type.includes('word') || type.includes('document')) return '📝'
    if (type.includes('excel') || type.includes('sheet')) return '📊'
    return '📎'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group mb-4 sm:mb-6"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm sm:text-base">Back to Businesses</span>
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Register New Business</h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Complete the form below to add a business to the directory</p>
            </div>
            
            <div className="text-xs sm:text-sm text-gray-500 self-end sm:self-auto">
              <span className="text-red-500">*</span> Required fields
            </div>
          </div>
        </div>

        {/* Message Notification */}
        {message && (
          <div className={`rounded-xl border-2 p-4 sm:p-5 mb-4 sm:mb-6 flex items-start gap-3 sm:gap-4 shadow-sm ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className={`flex-shrink-0 p-1.5 sm:p-2 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-red-100 text-red-600'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-base sm:text-lg font-semibold mb-1 ${
                message.type === 'success' 
                  ? 'text-green-800' 
                  : 'text-red-800'
              }`}>
                {message.title}
              </h3>
              <p className={`text-xs sm:text-sm ${
                message.type === 'success' 
                  ? 'text-green-700' 
                  : 'text-red-700'
              }`}>
                {message.text}
              </p>
              {message.type === 'success' && (
                <div className="mt-2 sm:mt-3">
                  <div className="w-full h-1.5 sm:h-2 bg-green-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 animate-progress"></div>
                  </div>
                  <p className="text-xs text-green-600 mt-1">Redirecting to businesses list...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Validation Errors Summary */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-medium text-red-900 mb-1 sm:mb-2">Please fix the following errors:</h4>
                <ul className="text-xs sm:text-sm text-red-700 space-y-0.5 sm:space-y-1">
                  {Object.entries(validationErrors).map(([field, error]) => (
                    <li key={field} className="truncate">• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Tab Selector */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileTabs(!showMobileTabs)}
            className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-3"
          >
            <div className="flex items-center gap-2">
              {activeTab === 'basic' && <Building2 className="w-4 h-4" />}
              {activeTab === 'contact' && <Phone className="w-4 h-4" />}
              {activeTab === 'details' && <FileText className="w-4 h-4" />}
              {activeTab === 'documents' && <Upload className="w-4 h-4" />}
              <span className="font-medium text-sm">
                {activeTab === 'basic' && 'Basic Information'}
                {activeTab === 'contact' && 'Contact Details'}
                {activeTab === 'details' && 'Additional Details'}
                {activeTab === 'documents' && 'Documents'}
              </span>
            </div>
            <Menu className="w-5 h-5 text-gray-500" />
          </button>
          
          {showMobileTabs && (
            <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
              <button
                className={`w-full px-4 py-3 text-left flex items-center gap-2 border-b border-gray-100 ${
                  activeTab === 'basic' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleTabChange('basic')}
              >
                <Building2 className="w-4 h-4" />
                <span className="font-medium text-sm">Basic Information</span>
              </button>
              <button
                className={`w-full px-4 py-3 text-left flex items-center gap-2 border-b border-gray-100 ${
                  activeTab === 'contact' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleTabChange('contact')}
              >
                <Phone className="w-4 h-4" />
                <span className="font-medium text-sm">Contact Details</span>
              </button>
              <button
                className={`w-full px-4 py-3 text-left flex items-center gap-2 border-b border-gray-100 ${
                  activeTab === 'details' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleTabChange('details')}
              >
                <FileText className="w-4 h-4" />
                <span className="font-medium text-sm">Additional Details</span>
              </button>
              <button
                className={`w-full px-4 py-3 text-left flex items-center gap-2 ${
                  activeTab === 'documents' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleTabChange('documents')}
              >
                <Upload className="w-4 h-4" />
                <span className="font-medium text-sm">Documents</span>
              </button>
            </div>
          )}
        </div>

        {/* Main Form Container */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-4 sm:mb-6">
          {/* Desktop Tab Navigation - Hidden on mobile */}
          <div className="hidden lg:block border-b border-gray-200 bg-gray-50">
            <div className="flex overflow-x-auto">
              <button
                className={`px-6 py-4 text-sm font-medium transition-colors flex-shrink-0 ${
                  activeTab === 'basic'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => handleTabChange('basic')}
              >
                <Building2 className="w-4 h-4 inline-block mr-2" />
                Basic Information
              </button>
              <button
                className={`px-6 py-4 text-sm font-medium transition-colors flex-shrink-0 ${
                  activeTab === 'contact'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => handleTabChange('contact')}
              >
                <Phone className="w-4 h-4 inline-block mr-2" />
                Contact Details
              </button>
              <button
                className={`px-6 py-4 text-sm font-medium transition-colors flex-shrink-0 ${
                  activeTab === 'details'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => handleTabChange('details')}
              >
                <FileText className="w-4 h-4 inline-block mr-2" />
                Additional Details
              </button>
              <button
                className={`px-6 py-4 text-sm font-medium transition-colors flex-shrink-0 ${
                  activeTab === 'documents'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => handleTabChange('documents')}
              >
                <Upload className="w-4 h-4 inline-block mr-2" />
                Documents
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-4 sm:p-6 md:p-8">
            {/* Tab 1: Basic Information */}
            {activeTab === 'basic' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-blue-900 mb-1">Required Information</h4>
                      <p className="text-xs text-blue-700">Please complete all fields marked with <span className="text-red-500">*</span> to proceed to next steps.</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 lg:gap-6">
                  {/* Left Column */}
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        required
                        className={`w-full px-3 sm:px-4 py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                          validationErrors.name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter business legal name"
                      />
                      {validationErrors.name && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">{validationErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Registration Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="registration_number"
                        value={formData.registration_number || ''}
                        onChange={(e) => handleFieldChange('registration_number', e.target.value)}
                        required
                        className={`w-full px-3 sm:px-4 py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                          validationErrors.registration_number ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter official registration number"
                      />
                      {validationErrors.registration_number && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">{validationErrors.registration_number}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Registration Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="date"
                          name="registration_date"
                          value={formData.registration_date || ''}
                          onChange={(e) => handleFieldChange('registration_date', e.target.value)}
                          required
                          max={new Date().toISOString().split('T')[0]}
                          className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                            validationErrors.registration_date ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {validationErrors.registration_date && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">{validationErrors.registration_date}</p>
                      )}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="status"
                        value={formData.status || 'unverified'}
                        onChange={(e) => handleFieldChange('status', e.target.value)}
                        required
                        className="w-full px-3 sm:px-4 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                      >
                        <option value="unverified">Unverified</option>
                        <option value="under_review">Under Review</option>
                        <option value="verified">Verified</option>
                        <option value="provisionally_verified">Provisionally Verified</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="address"
                        value={formData.address || ''}
                        onChange={(e) => handleFieldChange('address', e.target.value)}
                        required
                        rows={3}
                        className={`w-full px-3 sm:px-4 py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                          validationErrors.address ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Full physical business address"
                      />
                      {validationErrors.address && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">{validationErrors.address}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6 mt-3 sm:mt-4 lg:grid-cols-2 lg:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sector/Industry
                    </label>
                    <input
                      type="text"
                      name="sector"
                      value={formData.sector || ''}
                      onChange={(e) => handleFieldChange('sector', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Technology, Retail, Manufacturing, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Region/Location
                    </label>
                    <input
                      type="text"
                      name="region"
                      value={formData.region || ''}
                      onChange={(e) => handleFieldChange('region', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="North America, Europe, etc."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Contact Details - ALL OPTIONAL */}
            {activeTab === 'contact' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-blue-900 mb-1">Contact Information</h4>
                      <p className="text-xs text-blue-700">All contact fields are optional. You can provide them later if needed.</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 lg:gap-6">
                  {/* Left Column */}
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone || ''}
                          onChange={(e) => handleFieldChange('phone', e.target.value)}
                          className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email || ''}
                          onChange={(e) => handleFieldChange('email', e.target.value)}
                          className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          placeholder="contact@business.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="url"
                          name="website"
                          value={formData.website || ''}
                          onChange={(e) => handleFieldChange('website', e.target.value)}
                          className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          placeholder="https://www.business.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Person
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          name="contact_person"
                          className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tax ID (TIN)
                      </label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          name="tax_id"
                          value={formData.tax_id || ''}
                          onChange={(e) => handleFieldChange('tax_id', e.target.value)}
                          className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          placeholder="Tax identification number"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Additional Details - ALL OPTIONAL */}
            {activeTab === 'details' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-blue-900 mb-1">Additional Information</h4>
                      <p className="text-xs text-blue-700">These details help with business profiling. All fields are optional.</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 lg:gap-6">
                  {/* Left Column */}
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year Founded
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          name="year_founded"
                          value={formData.year_founded || ''}
                          onChange={(e) => handleFieldChange('year_founded', e.target.value)}
                          min="1900"
                          max={new Date().getFullYear()}
                          className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          placeholder="2020"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Authenticity Score (%)
                      </label>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <input
                          type="range"
                          name="authenticity_score"
                          value={formData.authenticity_score || 50}
                          onChange={(e) => handleFieldChange('authenticity_score', e.target.value)}
                          min="0"
                          max="100"
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm font-medium text-gray-700 w-8 sm:w-12 text-center text-xs sm:text-sm">
                          {formData.authenticity_score || 50}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Can be updated later during verification</p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Notes
                      </label>
                      <textarea
                        name="additional_notes"
                        rows={4}
                        className="w-full px-3 sm:px-4 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="Any additional information about the business"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Documents - OPTIONAL */}
            {activeTab === 'documents' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-blue-900 mb-1">Document Upload</h4>
                      <p className="text-xs text-blue-700">Uploading documents is optional. You can skip this step and add documents later.</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 sm:space-y-6">
                  {/* File Upload Area */}
                  <div 
                    className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 md:p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.currentTarget.classList.add('border-blue-500', 'bg-blue-50')
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault()
                      e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50')
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50')
                      if (e.dataTransfer.files.length > 0) {
                        handleFileUpload(e.dataTransfer.files)
                      }
                    }}
                  >
                    <Upload className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-gray-600 mb-2 text-sm sm:text-base font-medium">Drag and drop files here or click to upload</p>
                    <p className="text-xs text-gray-500 mb-4 sm:mb-6">
                      Supported: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 20MB each)
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        document.getElementById('file-upload')?.click()
                      }}
                      className="px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin inline" />
                          Uploading...
                        </>
                      ) : (
                        'Select Files to Upload'
                      )}
                    </button>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) {
                          handleFileUpload(e.target.files)
                        }
                      }}
                      disabled={isUploading}
                    />
                  </div>
                  
                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200">
                        <h3 className="text-xs sm:text-sm font-medium text-gray-900">
                          Uploaded Documents ({uploadedFiles.filter(f => f.url && !f.error).length}/{uploadedFiles.length})
                        </h3>
                      </div>
                      <div className="divide-y divide-gray-200 max-h-64 sm:max-h-96 overflow-y-auto">
                        {uploadedFiles.map((file) => (
                          <div key={file.id} className="px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                              <div className={`p-1.5 sm:p-2 rounded ${
                                file.uploading ? 'bg-blue-100' :
                                file.error ? 'bg-red-100' :
                                file.url ? 'bg-green-100' : 'bg-gray-100'
                              }`}>
                                <span className="text-sm sm:text-base">{getFileIcon(file.type)}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                  {file.uploading && (
                                    <span className="text-xs text-blue-600 whitespace-nowrap">Uploading...</span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 truncate">
                                  {formatFileSize(file.size)} • {file.type.split('/')[1]?.toUpperCase() || 'File'}
                                </p>
                                {file.error && (
                                  <p className="text-xs text-red-600 mt-0.5 truncate">{file.error}</p>
                                )}
                                {file.url && (
                                  <p className="text-xs text-green-600 mt-0.5">✓ Ready for submission</p>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeFile(file.id)
                              }}
                              className="text-gray-400 hover:text-red-600 p-1 ml-1 sm:ml-2 flex-shrink-0"
                              disabled={file.uploading}
                            >
                              <X className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Form Navigation */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
                <div className="w-full sm:w-auto">
                  {activeTab !== 'basic' && (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs = ['basic', 'contact', 'details', 'documents']
                        const currentIndex = tabs.indexOf(activeTab)
                        handleTabChange(tabs[currentIndex - 1] as any)
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 text-gray-700 hover:text-gray-900 font-medium transition-colors flex items-center gap-2 justify-center sm:justify-start"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                    disabled={isSubmitting || isUploading}
                  >
                    Cancel
                  </button>
                  
                  {activeTab === 'documents' ? (
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleSubmit()}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center text-sm sm:text-base"
                        disabled={isSubmitting || isUploading || uploadedFiles.some(f => f.uploading)}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                            Submit Registration
                          </>
                        )}
                      </button>
                      
                      {/* Skip button - just goes to submit without doing anything else */}
                      <button
                        type="button"
                        onClick={() => handleSubmit()}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                        disabled={isSubmitting}
                      >
                        Skip and Submit
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs = ['basic', 'contact', 'details', 'documents']
                        const currentIndex = tabs.indexOf(activeTab)
                        handleTabChange(tabs[currentIndex + 1] as any)
                      }}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center text-sm sm:text-base"
                    >
                      Continue
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              {activeTab === 'basic' && 'Step 1: Basic Information'}
              {activeTab === 'contact' && 'Step 2: Contact Details'}
              {activeTab === 'details' && 'Step 3: Additional Information'}
              {activeTab === 'documents' && 'Step 4: Documents'}
            </span>
            <span className="text-xs sm:text-sm text-gray-500">
              {['basic', 'contact', 'details', 'documents'].indexOf(activeTab) + 1} of 4
            </span>
          </div>
          <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ 
                width: `${(['basic', 'contact', 'details', 'documents'].indexOf(activeTab) + 1) * 25}%` 
              }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        
        .animate-progress {
          animation: progress 2s ease-in-out;
        }
        
        /* Improve touch targets on mobile */
        @media (max-width: 640px) {
          input, select, textarea, button {
            font-size: 16px; /* Prevents iOS zoom on focus */
          }
        }
      `}</style>
    </div>
  )
}