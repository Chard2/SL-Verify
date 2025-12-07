export interface Business {
    [x: string]: any
    owner_email: any
    contact_email: any
    owner_name: any
    id: string
    name: string
    registration_number: string
    status: 'verified' | 'provisionally_verified' | 'unverified' | 'under_review'
    registration_date: string
    address: string
    phone?: string | null
    email?: string | null
    website?: string | null
    sector?: string | null
    region?: string | null
    authenticity_score: number
    certificate_url?: string | null
    tax_id?: string | null
    year_founded?: number | null
    website_url?: string | null
    social_links?: string[] | null
    documents?: Array<{
      type: 'registration_certificate' | 'tax_certificate' | 'owner_id' | 'business_license' | 'utility_bill' | 'other'
      url: string
      name: string
      uploaded_at: string
    }> | null
    created_at: string
    updated_at: string
  }
  
  export interface SimilarBusiness {
    id: string
    name: string
    registration_number: string
    similarity_score: number
    risk_level: 'high' | 'medium' | 'low'
  }
  
  export interface VerificationEvent {
    id: string
    business_id: string
    event_type: string
    description?: string | null
    verifier_id?: string | null
    metadata?: Record<string, any> | null
    created_at: string
  }
  
  export interface BusinessFormData {
    tax_id_number: {
      trim(): unknown tax_id_number: any 
}
    contact_person: {
      trim(): unknown contact_person: any 
}
    description: {
      trim(): unknown description: any 
}
    employees_count: { employees_count: any }
    annual_revenue: {
      trim(): unknown annual_revenue: any 
}
    business_type: { business_type: any }
    established_year: { established_year: any }
    ownership_type: { ownership_type: any }
    name: string
    registration_number: string
    status: Business['status']
    registration_date: string
    address: string
    phone?: string
    email?: string
    website?: string
    sector?: string
    region?: string
    authenticity_score?: number
    tax_id?: string
    year_founded?: number | null
    website_url?: string
    social_links?: string[]
    documents?: Array<{
      type: 'registration_certificate' | 'tax_certificate' | 'owner_id' | 'business_license' | 'utility_bill' | 'other'
      url: string
      name: string
      uploaded_at: string
    }>
  }
  
  export interface BusinessStats {
    total: number
    verified: number
    provisionally_verified: number
    under_review: number
    unverified: number
  }
  
  export interface SearchFilters {
    status?: Business['status'] | ''
    region?: string
    sector?: string
    query?: string
  }