'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { usePermissions, type Permission } from '@/lib/hooks/usePermissions'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'
import { useAuth } from '@/lib/hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: Permission
  requiredPermissions?: Permission[]
  requireAll?: boolean
  fallback?: React.ReactNode
  redirectTo?: string
  accessDeniedMessage?: string
  accessDeniedTitle?: string
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requiredPermissions,
  requireAll = false,
  fallback,
  redirectTo,
  accessDeniedMessage = "You don't have permission to access this page.",
  accessDeniedTitle = "Access Denied"
}: ProtectedRouteProps) {
  const { user, loading, initialized } = useAuth()
  const { can, canAny, canAll } = usePermissions()
  const router = useRouter()
  
  const redirectingRef = useRef(false)

  // Handle authentication redirect
  useEffect(() => {
    if (!initialized || loading || redirectingRef.current) {
      return
    }

    // If no user after initialization, redirect to login
    if (!user) {
      console.log('🔐 No user found, redirecting to login...')
      redirectingRef.current = true
      router.replace('/auth/login')
      return
    }

    // Check permissions if required
    let hasPermission = true
    
    if (requiredPermission && !can(requiredPermission)) {
      hasPermission = false
    } else if (requiredPermissions) {
      hasPermission = requireAll 
        ? canAll(requiredPermissions)
        : canAny(requiredPermissions)
    }

    // Redirect for permission issues
    if (!hasPermission && redirectTo) {
      console.log('🛑 Permission denied, redirecting to:', redirectTo)
      redirectingRef.current = true
      router.replace(redirectTo)
    }
  }, [
    user, 
    loading, 
    initialized, 
    can, 
    canAny, 
    canAll, 
    requiredPermission, 
    requiredPermissions, 
    requireAll, 
    redirectTo, 
    router
  ])

  // Show loading while initializing
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    )
  }

  // If no user after initialization, show loading while redirecting
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Redirecting to login..." />
      </div>
    )
  }

  // Check single permission
  if (requiredPermission && !can(requiredPermission)) {
    if (redirectTo) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" text="Redirecting..." />
        </div>
      )
    }
    return fallback || (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert type="error" title={accessDeniedTitle}>
          {accessDeniedMessage}
        </Alert>
      </div>
    )
  }

  // Check multiple permissions
  if (requiredPermissions) {
    const hasPermission = requireAll 
      ? canAll(requiredPermissions)
      : canAny(requiredPermissions)

    if (!hasPermission) {
      if (redirectTo) {
        return (
          <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner size="lg" text="Redirecting..." />
          </div>
        )
      }
      return fallback || (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Alert type="error" title={accessDeniedTitle}>
            {accessDeniedMessage}
          </Alert>
        </div>
      )
    }
  }

  return <>{children}</>
}