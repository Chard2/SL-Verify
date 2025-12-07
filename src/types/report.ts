export interface Report {
    id: string
    business_id: string
    description: string
    reporter_email?: string | null
    status: 'pending' | 'reviewed' | 'rejected'
    created_at: string
    reviewed_at?: string | null
    reviewer_id?: string | null
    business?: {
      name: string
      registration_number: string
    }
  }
  
  export interface ReportFormData {
    business_id: string
    description: string
    reporter_email?: string
  }
  
  export interface ReportWithBusiness extends Report {
    business: {
      id: string
      name: string
      registration_number: string
      status: string
    }
  }
  
  export interface AuditLog {
    id: string
    user_id: string | null
    action: string
    entity_type: string
    entity_id: string | null
    changes: Record<string, any> | null
    ip_address: string | null
    created_at: string
  }