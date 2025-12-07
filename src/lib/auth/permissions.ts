// lib/permissions.ts - Minimal version (or delete entirely)

// Remove UserRole type - now just authenticated or not
export type UserRole = 'admin' // Only one role now

export interface Permission {
  id: string
  name: string
  description: string
}

// Only keep permissions if absolutely necessary for UI/UX
export const PERMISSIONS = {
  // User Management
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  
  // Business Management
  VIEW_BUSINESSES: 'view_businesses',
  CREATE_BUSINESSES: 'create_businesses',
  EDIT_BUSINESSES: 'edit_businesses',
  DELETE_BUSINESSES: 'delete_businesses',
  VERIFY_BUSINESSES: 'verify_businesses',
  EXPORT_BUSINESSES: 'export_businesses',
  
  // Dashboard & Analytics
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_REPORTS: 'export_reports',
  
  // System Settings
  VIEW_SETTINGS: 'view_settings',
  EDIT_SETTINGS: 'edit_settings',
  MANAGE_SYSTEM: 'manage_system'
} as const

export type PermissionKey = keyof typeof PERMISSIONS
export type PermissionValue = typeof PERMISSIONS[PermissionKey]

// Simple permission check - always returns true for authenticated users
export const hasPermission = (permission: PermissionValue): boolean => {
  // Simple: If user is authenticated, they have all permissions
  return true
}

// Simple check for any user
export const checkPermission = (permission: PermissionValue, p0?: any): boolean => {
  return true
}

export const canAny = (permissions: PermissionValue[]): boolean => {
  return true
}

export const canAll = (permissions: PermissionValue[]): boolean => {
  return true
}