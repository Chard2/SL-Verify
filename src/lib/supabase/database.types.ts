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
      user_profiles: {
        Row: {
          id: string
          email: string | null
          first_name: string | null
          last_name: string | null
          full_name: string | null
          department: string | null
          role: 'admin' | 'verifier' | 'viewer'
          status: 'active' | 'inactive' | 'pending'
          avatar_url: string | null
          phone: string | null
          last_sign_in_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          full_name?: string | null
          department?: string | null
          role?: 'admin' | 'verifier' | 'viewer'
          status?: 'active' | 'inactive' | 'pending'
          avatar_url?: string | null
          phone?: string | null
          last_sign_in_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          full_name?: string | null
          department?: string | null
          role?: 'admin' | 'verifier' | 'viewer'
          status?: 'active' | 'inactive' | 'pending'
          avatar_url?: string | null
          phone?: string | null
          last_sign_in_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      user_statistics: {
        Row: {
          total_users: number | null
          total_admins: number | null
          total_verifiers: number | null
          total_viewers: number | null
          active_users: number | null
          inactive_users: number | null
          pending_users: number | null
          active_last_week: number | null
          new_this_month: number | null
        }
      }
    }
    Functions: {
      get_all_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          first_name: string
          last_name: string
          full_name: string
          department: string
          role: string
          status: string
          last_sign_in_at: string
          created_at: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}