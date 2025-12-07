// 'use client'

// import React, { useState, useEffect } from 'react'
// import { Input } from '@/components/ui/Input'
// import { Button } from '@/components/ui/Button'
// import { validateBusinessForm, type ValidationError } from '@/lib/utils/validation'
// import { REGIONS, SECTORS } from '@/lib/constants'
// import type { Business, BusinessFormData } from '@/types'
// import { Building2, MapPin, Phone, Mail, Globe, Briefcase, TrendingUp, FileText, Upload, X, Link as LinkIcon, Calendar } from 'lucide-react'
// import { createClient } from '@/lib/supabase/client'
// import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

// interface BusinessFormProps {
//   business?: Business
//   onSubmit: (data: BusinessFormData) => Promise<void>
//   onCancel: () => void
// }

// interface Document {
//   type: 'registration_certificate' | 'tax_certificate' | 'owner_id' | 'business_license' | 'utility_bill' | 'other'
//   url: string
//   name: string
//   uploaded_at: string
// }

// export function BusinessForm({ business, onSubmit, onCancel }: BusinessFormProps) {
//   const supabase = createClient();
//   const [formData, setFormData] = useState<BusinessFormData>({
//     name: business?.name || '',
//     registration_number: business?.registration_number || '',
//     status: business?.status || 'unverified',
//     registration_date: business?.registration_date || '',
//     address: business?.address || '',
//     phone: business?.phone || '',
//     email: business?.email || '',
//     website: business?.website || '',
//     sector: business?.sector || '',
//     region: business?.region || '',
//     authenticity_score: business?.authenticity_score ?? 0,
//     tax_id_number: business?.tax_id_number || '',
//     contact_person: business?.contact_person || '',
//     description: business?.description || '',
//     employees_count: business?.employees_count ?? 0,
//     operational_status: business?.operational_status || '',
//     website_url: business?.website_url || '',
//     social_links: business?.social_links || [],
//     documents: business?.documents || []
//   });

//   const [errors, setErrors] = useState<ValidationError[]>([]);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
//   const [socialLinkInput, setSocialLinkInput] = useState('')

//   const documentTypes = [
//     { value: 'registration_certificate', label: 'Registration Certificate' },
//     { value: 'tax_certificate', label: 'Tax Certificate' },
//     { value: 'owner_id', label: 'ID of Owner / Director' },
//     { value: 'business_license', label: 'Business License' },
//     { value: 'utility_bill', label: 'Utility Bill (Address Confirmation)' },
//     { value: 'other', label: 'Other Supporting Documents' }
//   ]

//   const handleChange = (field: keyof BusinessFormData, value: any) => {
//     setFormData(prev => ({ ...prev, [field]: value }))
//     setErrors(prev => prev.filter(e => e.field !== field))
//   }

//   const handleFileUpload = async (file: File, type: Document['type']) => {
//     try {
//       setUploadingDoc(type)
//       const fileExt = file.name.split('.').pop()
//       const fileName = `${Math.random()}.${fileExt}`
//       const filePath = `business-documents/${fileName}`

//       const { error: uploadError } = await supabase.storage
//         .from('business-documents')
//         .upload(filePath, file)

//       if (uploadError) throw uploadError

//       const { data: { publicUrl } } = supabase.storage
//         .from('business-documents')
//         .getPublicUrl(filePath)

//       const newDoc: Document = {
//         type,
//         url: publicUrl,
//         name: file.name,
//         uploaded_at: new Date().toISOString()
//       }

//       const currentDocs = (formData.documents as Document[]) || []
//       handleChange('documents', [...currentDocs, newDoc])
//     } catch (error: any) {
//       console.error('Error uploading file:', error)
//       setErrors(prev => [...prev, { field: 'documents', message: `Failed to upload ${file.name}: ${error.message}` }])
//     } finally {
//       setUploadingDoc(null)
//     }
//   }

//   const removeDocument = (index: number) => {
//     const currentDocs = (formData.documents as Document[]) || []
//     handleChange('documents', currentDocs.filter((_, i) => i !== index))
//   }

//   const addSocialLink = () => {
//     if (!socialLinkInput.trim()) return
//     const currentLinks = (formData.social_links as string[]) || []
//     handleChange('social_links', [...currentLinks, socialLinkInput.trim()])
//     setSocialLinkInput('')
//   }

//   const removeSocialLink = (index: number) => {
//     const currentLinks = (formData.social_links as string[]) || []
//     handleChange('social_links', currentLinks.filter((_, i) => i !== index))
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     const validationErrors = validateBusinessForm(formData)
//     if (validationErrors.length > 0) {
//       setErrors(validationErrors)
//       return
//     }
//     setIsSubmitting(true)
//     try {
//       await onSubmit(formData)
//     } catch (error) {
//       console.error('Error submitting form:', error)
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const getError = (field: string) => errors.find(e => e.field === field)?.message

//   return (
//     <form onSubmit={handleSubmit} className="space-y-8">
//       {/* Basic Information Section */}
//       <div className="space-y-6">
//         <div className="flex items-center gap-3">
//           <div className="p-2 bg-gray-100 rounded-lg">
//             <Building2 className="w-5 h-5 text-gray-700" />
//           </div>
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
//             <p className="text-sm text-gray-500">Enter core business details</p>
//           </div>
//         </div>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="md:col-span-2">
//             <Input
//               label="Business Name *"
//               value={formData.name}
//               onChange={(e) => handleChange('name', e.target.value)}
//               error={getError('name')}
//               placeholder="Enter business name"
//               required
//             />
//           </div>

//           <div className="space-y-6">
//             <Input
//               label="Registration Number *"
//               value={formData.registration_number}
//               onChange={(e) => handleChange('registration_number', e.target.value)}
//               error={getError('registration_number')}
//               placeholder="SL-2023-001234"
//               helperText="Format: SL-YYYY-XXXXXX"
//               required
//             />

//             <Input
//               label="Registration Date *"
//               type="date"
//               value={formData.registration_date}
//               onChange={(e) => handleChange('registration_date', e.target.value)}
//               error={getError('registration_date')}
//               required
//             />
//           </div>

//           <div className="space-y-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Verification Status *
//               </label>
//               <select
//                 value={formData.status}
//                 onChange={(e) => handleChange('status', e.target.value as Business['status'])}
//                 className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors text-sm"
//                 required
//               >
//                 <option value="unverified">Unverified</option>
//                 <option value="under_review">Under Review</option>
//                 <option value="provisionally_verified">Provisionally Verified</option>
//                 <option value="verified">Verified</option>
//               </select>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Contact Information Section */}
//       <div className="space-y-6">
//         <div className="flex items-center gap-3">
//           <div className="p-2 bg-gray-100 rounded-lg">
//             <Phone className="w-5 h-5 text-gray-700" />
//           </div>
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
//             <p className="text-sm text-gray-500">Business contact details</p>
//           </div>
//         </div>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="md:col-span-2">
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-gray-700">
//                 Address *
//               </label>
//               <textarea
//                 value={formData.address}
//                 onChange={(e) => handleChange('address', e.target.value)}
//                 placeholder="Enter full business address"
//                 required
//                 rows={3}
//                 className={`w-full px-3 py-2.5 border rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors text-sm ${
//                   getError('address') ? 'border-red-300' : 'border-gray-300'
//                 }`}
//               />
//               {getError('address') && (
//                 <p className="text-sm text-red-600">{getError('address')}</p>
//               )}
//             </div>
//           </div>

//           <Input
//             label="Phone"
//             type="tel"
//             value={formData.phone}
//             onChange={(e) => handleChange('phone', e.target.value)}
//             error={getError('phone')}
//             placeholder="+232 XX XXX XXX"
//             helperText="Sierra Leone format"
//           />

//           <Input
//             label="Email"
//             type="email"
//             value={formData.email}
//             onChange={(e) => handleChange('email', e.target.value)}
//             error={getError('email')}
//             placeholder="contact@business.sl"
//           />

//           <Input
//             label="Website"
//             type="url"
//             value={formData.website}
//             onChange={(e) => handleChange('website', e.target.value)}
//             error={getError('website')}
//             placeholder="https://business.sl"
//           />
//         </div>
//       </div>

//       {/* Classification Section */}
//       <div className="space-y-6">
//         <div className="flex items-center gap-3">
//           <div className="p-2 bg-gray-100 rounded-lg">
//             <Briefcase className="w-5 h-5 text-gray-700" />
//           </div>
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900">Classification</h3>
//             <p className="text-sm text-gray-500">Business category and location</p>
//           </div>
//         </div>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Business Sector
//             </label>
//             <select
//               value={formData.sector}
//               onChange={(e) => handleChange('sector', e.target.value)}
//               className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors text-sm"
//             >
//               <option value="">Select a sector</option>
//               {SECTORS.map(sector => (
//                 <option key={sector} value={sector}>{sector}</option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Region
//             </label>
//             <select
//               value={formData.region}
//               onChange={(e) => handleChange('region', e.target.value)}
//               className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors text-sm"
//             >
//               <option value="">Select a region</option>
//               {REGIONS.map(region => (
//                 <option key={region} value={region}>{region}</option>
//               ))}
//             </select>
//           </div>

//           <div className="md:col-span-2">
//             <Input
//               label="Authenticity Score"
//               type="number"
//               min="0"
//               max="100"
//               value={formData.authenticity_score}
//               onChange={(e) => handleChange('authenticity_score', parseInt(e.target.value) || 0)}
//               helperText="Score from 0-100"
//             />
//           </div>
//         </div>
//       </div>

//       {/* New: Additional Information Section */}
//       <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
//         <div className="flex items-center gap-3 mb-6">
//           <div className="p-2 bg-indigo-100 rounded-lg">
//             <Calendar className="w-5 h-5 text-indigo-600" />
//           </div>
//           <h3 className="text-xl font-bold text-gray-900">Additional Information</h3>
//         </div>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <Input
//             label="Tax ID"
//             value={formData.tax_id || ''}
//             onChange={(e) => handleChange('tax_id', e.target.value)}
//             placeholder="Enter tax identification number"
//             className="bg-white"
//           />

//           <Input
//             label="Year Founded"
//             type="number"
//             min="1900"
//             max={new Date().getFullYear()}
//             value={formData.year_founded || ''}
//             onChange={(e) => handleChange('year_founded', e.target.value ? parseInt(e.target.value) : null)}
//             placeholder="YYYY"
//             className="bg-white"
//           />

//           <div className="md:col-span-2">
//             <Input
//               label="Website URL"
//               type="url"
//               value={formData.website_url || ''}
//               onChange={(e) => handleChange('website_url', e.target.value)}
//               placeholder="https://example.com"
//               className="bg-white"
//             />
//           </div>

//           {/* Social Links */}
//           <div className="md:col-span-2">
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Social Media Links
//             </label>
//             <div className="flex gap-2 mb-2">
//               <Input
//                 value={socialLinkInput}
//                 onChange={(e) => setSocialLinkInput(e.target.value)}
//                 placeholder="https://facebook.com/yourpage"
//                 className="bg-white flex-1"
//               />
//               <Button
//                 type="button"
//                 variant="secondary"
//                 onClick={addSocialLink}
//               >
//                 <LinkIcon className="w-4 h-4 mr-2" />
//                 Add
//               </Button>
//             </div>
//             {(formData.social_links as string[])?.length > 0 && (
//               <div className="space-y-1">
//                 {(formData.social_links as string[]).map((link, index) => (
//                   <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
//                     <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate flex-1">
//                       {link}
//                     </a>
//                     <button
//                       type="button"
//                       onClick={() => removeSocialLink(index)}
//                       className="text-red-600 hover:text-red-700 ml-2"
//                     >
//                       <X className="w-4 h-4" />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Document Uploads Section */}
//       <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
//         <div className="flex items-center gap-3 mb-6">
//           <div className="p-2 bg-amber-100 rounded-lg">
//             <FileText className="w-5 h-5 text-amber-600" />
//           </div>
//           <h3 className="text-xl font-bold text-gray-900">Document Uploads</h3>
//         </div>

//         <div className="space-y-4">
//           {documentTypes.map((docType) => {
//             const existingDocs = ((formData.documents as Document[]) || []).filter(d => d.type === docType.value)
//             return (
//               <div key={docType.value} className="bg-white rounded-lg p-4 border border-gray-200">
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   {docType.label}
//                 </label>
//                 <input
//                   type="file"
//                   accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
//                   onChange={(e) => {
//                     const file = e.target.files?.[0]
//                     if (file) handleFileUpload(file, docType.value as Document['type'])
//                   }}
//                   className="hidden"
//                   id={`file-${docType.value}`}
//                 />
//                 <label
//                   htmlFor={`file-${docType.value}`}
//                   className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
//                 >
//                   {uploadingDoc === docType.value ? (
//                     <LoadingSpinner size="sm" text="Uploading..." />
//                   ) : (
//                     <>
//                       <Upload className="w-4 h-4 mr-2" />
//                       Upload {docType.label}
//                     </>
//                   )}
//                 </label>
//                 {existingDocs.length > 0 && (
//                   <div className="mt-2 space-y-1">
//                     {existingDocs.map((doc, index) => (
//                       <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
//                         <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate flex-1">
//                           {doc.name}
//                         </a>
//                         <button
//                           type="button"
//                           onClick={() => {
//                             const allDocs = (formData.documents as Document[]) || []
//                             const docIndex = allDocs.findIndex(d => d === doc)
//                             if (docIndex !== -1) removeDocument(docIndex)
//                           }}
//                           className="text-red-600 hover:text-red-700 ml-2"
//                         >
//                           <X className="w-4 h-4" />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )
//           })}
//         </div>
//       </div>

//       {/* Actions */}
//       <div className="pt-6 border-t border-gray-200">
//         <div className="flex flex-col sm:flex-row gap-3">
//           <Button 
//             type="submit" 
//             variant="primary" 
//             isLoading={isSubmitting}
//             className="flex-1 sm:flex-none"
//           >
//             {business ? 'Update Business' : 'Create Business'}
//           </Button>
//           <Button 
//             type="button" 
//             variant="secondary" 
//             onClick={onCancel}
//             className="flex-1 sm:flex-none"
//             disabled={isSubmitting}
//           >
//             Cancel
//           </Button>
//         </div>
//       </div>
//     </form>
//   )
// }