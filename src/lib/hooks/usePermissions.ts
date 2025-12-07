'use client'

import { useAuth } from './useAuth'

type UserRole = 'admin' | 'verifier' | 'viewer';

// Define all permissions
export const PERMISSIONS = {
  // User Management (Admin only)
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  CHANGE_USER_ROLE: 'change_user_role',
  
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
  
  // Settings (Admin only)
  VIEW_SETTINGS: 'view_settings',
  EDIT_SETTINGS: 'edit_settings',
  MANAGE_SYSTEM: 'manage_system'
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// Role-based permissions mapping
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: Object.values(PERMISSIONS) as Permission[],
  verifier: [
    PERMISSIONS.VIEW_BUSINESSES,
    PERMISSIONS.CREATE_BUSINESSES,
    PERMISSIONS.EDIT_BUSINESSES,
    PERMISSIONS.VERIFY_BUSINESSES,
    PERMISSIONS.EXPORT_BUSINESSES,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_REPORTS
  ],
  viewer: [
    PERMISSIONS.VIEW_BUSINESSES,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ANALYTICS
  ]
}

export function usePermissions() {
  const { user } = useAuth()
  const userRole = user?.role as UserRole | undefined

  const can = (permission: Permission): boolean => {
    if (!userRole || !user) return false
    return ROLE_PERMISSIONS[userRole].includes(permission)
  }

  const canAny = (permissions: Permission[]): boolean => {
    if (!userRole || !user) return false
    return permissions.some(permission => ROLE_PERMISSIONS[userRole].includes(permission))
  }

  const canAll = (permissions: Permission[]): boolean => {
    if (!userRole || !user) return false
    return permissions.every(permission => ROLE_PERMISSIONS[userRole].includes(permission))
  }

  return {
    // Permission checks
    can,
    canAny,
    canAll,
    
    // User info
    userRole,
    permissions: PERMISSIONS,
    
    // Role helpers
    isAdmin: userRole === 'admin',
    isVerifier: userRole === 'verifier',
    isViewer: userRole === 'viewer',
    
    // Quick permission checks
    canManageUsers: userRole === 'admin',
    canCreateUsers: userRole === 'admin',
    canViewBusinesses: userRole !== null,
    canEditBusinesses: userRole === 'verifier' || userRole === 'admin',
    canVerifyBusinesses: userRole === 'verifier' || userRole === 'admin'
  }
}