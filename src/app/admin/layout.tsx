'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { 
  LayoutDashboard, Building2, CheckCircle, Flag, AlertTriangle,
  MapPin, FileText, LogOut,
  ChevronRight, Search, Upload, Menu, X
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading, initialized, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (initialized && !loading && !user && !redirecting) {
      console.log('❌ No user found, redirecting to login...')
      setRedirecting(true)
      router.replace('/auth/login')
    }
  }, [initialized, loading, user, router, redirecting])

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    if (signOut) {
      await signOut()
    }
    router.push('/auth/login')
  }

  if (!initialized || loading || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <LoadingSpinner size="lg" text={redirecting ? "Redirecting..." : "Loading..."} />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/businesses', label: 'Businesses', icon: Building2 },
    { href: '/admin/verifications', label: 'Verifications', icon: CheckCircle },
    { href: '/admin/reports', label: 'Fraud Reports', icon: Flag },
    { href: '/admin/similarity', label: 'Similarity Alerts', icon: AlertTriangle },
    { href: '/admin/inspections', label: 'Field Inspections', icon: MapPin },
    { href: '/admin/analytics', label: 'Reports', icon: FileText },
    { href: '/admin/upload', label: 'Bulk Upload', icon: Upload },
  ]

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 h-[70px]">
        <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Logo and Hamburger Menu for Mobile */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Hamburger Menu for Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              )}
            </button>

            {/* Logo with Shield Image */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Shield Image - Replace with your actual shield image URL */}
              <div className="w-32 h-32 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl flex items-center justify-center">
                <img
                  src="/VERIFY.png"
                  alt="VERIFY Logo"
                  className="w-32 h-32 sm:w-16 sm:h-16"
                  style={{ display: "block" }}
                />
              </div>
              
              <div>
                <h2 className="text-lg sm:text-lg font-bold bg-gradient-to-r from-[#4285F4] to-[#1A73E8] bg-clip-text text-transparent leading-tight sm:leading-normal">
                  SL Verify System
                </h2>
              </div>
            </div>
            
            
          </div>

          {/* Right: User Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
           

            {/* User Avatar and Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#4285F4] to-[#1A73E8] rounded-full flex items-center justify-center text-white font-bold shadow-lg hover:opacity-90 transition-opacity text-sm sm:text-base">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 leading-tight">Admin</p>
                  <p className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-[150px]">{user.email}</p>
                </div>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 top-12 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-3 z-50">
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#4285F4] to-[#1A73E8] rounded-full flex items-center justify-center text-white font-bold">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.email}</p>
                        <span className="text-xs bg-gradient-to-r from-[#4285F4] to-[#1A73E8] text-white px-2 py-1 rounded-full mt-1 inline-block">
                          Admin
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-gray-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {showUserDropdown && (
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowUserDropdown(false)}
              />
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex pt-[70px] h-screen">
        {/* Desktop Sidebar - Unchanged */}
        <aside className="hidden lg:block w-72 h-[calc(100vh-70px)] rounded-tr-[50px] rounded-bl-[60px] bg-gradient-to-b from-[#4285F4] to-[#1A73E8] backdrop-blur-lg shadow-xl fixed left-0 top-[70px] overflow-y-auto">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-[#1A73E8] shadow-lg'
                      : 'text-white hover:bg-white/10'
                  }`}
                  onClick={() => setShowUserDropdown(false)}
                >
                  <div className={isActive ? "p-2 rounded-md bg-blue-50" : ""}>
                    <Icon className={`w-5 h-5 ${
                      isActive ? 'text-[#1A73E8]' : 'text-white'
                    }`} />
                  </div>
                  
                  <span className={`text-sm font-medium ${
                    isActive ? 'text-[#1A73E8]' : 'text-white'
                  }`}>
                    {item.label}
                  </span>
                  
                  <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${
                    isActive 
                      ? 'text-[#1A73E8]' 
                      : 'text-white/0 group-hover:text-white/60'
                  }`} />
                </Link>
              )
            })}
          </nav>
          
          <div className="h-8"></div>
        </aside>

        {/* Mobile Sidebar */}
        <aside className={`lg:hidden fixed top-[70px] left-0 bottom-0 w-72 rounded-tr-[50px] rounded-bl-[60px] bg-gradient-to-b from-[#4285F4] to-[#1A73E8] backdrop-blur-lg shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <nav className="p-4 space-y-1 mt-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-[#1A73E8] shadow-lg'
                      : 'text-white hover:bg-white/10'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className={isActive ? "p-2 rounded-md bg-blue-50" : ""}>
                    <Icon className={`w-5 h-5 ${
                      isActive ? 'text-[#1A73E8]' : 'text-white'
                    }`} />
                  </div>
                  
                  <span className={`text-sm font-medium ${
                    isActive ? 'text-[#1A73E8]' : 'text-white'
                  }`}>
                    {item.label}
                  </span>
                  
                  <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${
                    isActive 
                      ? 'text-[#1A73E8]' 
                      : 'text-white/0 group-hover:text-white/60'
                  }`} />
                </Link>
              )
            })}
          </nav>
          
          <div className="h-8"></div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 h-[calc(100vh-70px)] overflow-y-auto bg-gray-50 transition-all duration-300 ${
          mobileMenuOpen ? 'ml-0' : 'lg:ml-72'
        }`}>
          <div className="p-3 sm:p-4 lg:p-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[calc(100vh-160px)] overflow-hidden">
              <div className="border-b border-gray-100 bg-white px-3 sm:px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-[#4285F4] to-[#1A73E8] bg-clip-text text-transparent">
                      {navItems.find(item => pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href)))?.label || 'Dashboard'}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">
                      Manage and monitor business verifications
                    </p>
                  </div>
                  
                  {/* Desktop breadcrumb */}
                  <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500">
                    <span className="text-gray-400">Admin</span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="font-medium text-gray-700">
                      {navItems.find(item => pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href)))?.label || 'Dashboard'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-3 sm:p-4 md:p-6 lg:p-8">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}