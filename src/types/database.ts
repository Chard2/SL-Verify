export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string
          name: string
          registration_number: string
          status: 'verified' | 'provisionally_verified' | 'unverified' | 'under_review'
          registration_date: string
          address: string
          phone: string | null
          email: string | null
          website: string | null
          sector: string | null
          region: string | null
          authenticity_score: number
          certificate_url: string | null
          tax_id: string | null
          year_founded: number | null
          website_url: string | null
          social_links: Json | null
          documents: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
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
          authenticity_score?: number
          certificate_url?: string | null
          tax_id?: string | null
          year_founded?: number | null
          website_url?: string | null
          social_links?: Json | null
          documents?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          registration_number?: string
          status?: 'verified' | 'provisionally_verified' | 'unverified' | 'under_review'
          registration_date?: string
          address?: string
          phone?: string | null
          email?: string | null
          website?: string | null
          sector?: string | null
          region?: string | null
          authenticity_score?: number
          certificate_url?: string | null
          tax_id?: string | null
          year_founded?: number | null
          website_url?: string | null
          social_links?: Json | null
          documents?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          business_id: string
          description: string
          reporter_email: string | null
          status: 'pending' | 'reviewed' | 'rejected'
          created_at: string
          reviewed_at: string | null
          reviewer_id: string | null
        }
        Insert: {
          id?: string
          business_id: string
          description: string
          reporter_email?: string | null
          status?: 'pending' | 'reviewed' | 'rejected'
          created_at?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
        }
       
      }
      verification_events: {
        Row: {
          id: string
          business_id: string
          event_type: string
          description: string | null
          verifier_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          event_type: string
          description?: string | null
          verifier_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          event_type?: string
          description?: string | null
          verifier_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      audit_log: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          changes: Json | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          changes?: Json | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          changes?: Json | null
          ip_address?: string | null
          created_at?: string
        }
      }
      inspections: {
        Row: {
          id: string
          business_id: string
          scheduled_date: string
          status: 'scheduled' | 'completed' | 'cancelled'
          inspector_name: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          scheduled_date: string
          status?: 'scheduled' | 'completed' | 'cancelled'
          inspector_name: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          scheduled_date?: string
          status?: 'scheduled' | 'completed' | 'cancelled'
          inspector_name?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      search_businesses_by_name: {
        Args: {
          search_term: string
          similarity_threshold?: number
        }
        Returns: {
          id: string
          name: string
          registration_number: string
          status: string
          similarity_score: number
        }[]
      }
      find_similar_business_names: {
        Args: {
          business_name: string
        }
        Returns: {
          id: string
          name: string
          registration_number: string
          similarity_score: number
          risk_level: string
        }[]
      }
    }
  }
}