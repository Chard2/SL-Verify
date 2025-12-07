export * from './database'
export * from './business'
export * from './report'

// Additional utility types
export type Status = 'idle' | 'loading' | 'success' | 'error'

export interface ApiResponse<T> {
  data?: T
  error?: string
  status: Status
}

export interface PaginationParams {
  page: number
  limit: number
  total?: number
}

export interface SearchParams {
  query: string
  type: 'name' | 'number'
  filters?: {
    status?: string
    region?: string
    sector?: string
  }
}

export interface BadgeConfig {
  size: 'small' | 'medium' | 'large'
  theme: 'light' | 'dark'
  showScore: boolean
}

export interface EmbedCode {
  html: string
  preview: string
}

// User types (for authentication)
export interface UserProfile {
  id: string
  email: string
  role: 'verifier' | 'admin' | 'user'
  created_at: string
}

// Dashboard stats
export interface DashboardStats {
  total_businesses: number
  verified_businesses: number
  pending_reports: number
  recent_verifications: number
  growth_rate: number
}

// CSV Upload
export interface CsvUploadResult {
  success: number
  failed: number
  errors: Array<{
    row: number
    message: string
  }>
}

// Notification types
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  timestamp: Date
}