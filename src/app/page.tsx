'use client'

import React, { useState, useEffect } from 'react'
import { 
  Shield, CheckCircle, Search, Zap, Globe, TrendingUp, 
  Building2, Users, FileText, Lock, BarChart3, Award,
  ArrowRight, Download, Code, AlertTriangle, ChevronDown,
  Star, BadgeCheck, Sparkles
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 8)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: Zap,
      title: 'Instant Verification',
      description: 'Search and verify any business in seconds using name or registration number.',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      icon: AlertTriangle,
      title: 'Fraud Prevention',
      description: 'Protect yourself from fake businesses and online scams before making payments.',
      color: 'from-red-400 to-pink-500'
    },
    {
      icon: FileText,
      title: 'Complete Business Profiles',
      description: 'Access detailed information including registration status, directors, and compliance history.',
      color: 'from-blue-400 to-cyan-500'
    },
    {
      icon: Building2,
      title: 'Bank Integration',
      description: 'Financial institutions can quickly verify SMEs applying for loans and services.',
      color: 'from-purple-400 to-indigo-500'
    },
    {
      icon: TrendingUp,
      title: 'Investor Confidence',
      description: 'Foreign investors can validate local partners and make informed decisions.',
      color: 'from-green-400 to-emerald-500'
    },
    {
      icon: Download,
      title: 'Official Documentation',
      description: 'Download verification certificates and compliance reports for your records.',
      color: 'from-teal-400 to-cyan-500'
    },
    {
      icon: Code,
      title: 'API Access',
      description: 'Integrate business verification directly into your systems with our secure API.',
      color: 'from-indigo-400 to-purple-500'
    },
    {
      icon: Lock,
      title: 'Secure & Reliable',
      description: 'Government-backed platform with enterprise-grade security and 99.9% uptime.',
      color: 'from-gray-400 to-slate-500'
    }
  ]

  const steps = [
    {
      number: '1',
      title: 'Search',
      description: 'Enter the business name or registration number in the search bar above.'
    },
    {
      number: '2',
      title: 'Verify',
      description: 'Review the business profile, registration status, and compliance information.'
    },
    {
      number: '3',
      title: 'Confirm',
      description: 'Download a verification certificate or report for your records.'
    }
  ]

  // Hero section background image
  const heroBgImage = '/work.jpg'

  const handleHeroSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    } else {
      router.push('/search')
    }
  }

  const handleVerifyBusinessClick = () => {
    router.push('/search')
  }

  return (
    <div className="min-h-screen">
      {/* Animated Hero Section with Image and Gradient */}
      <section
        className="relative overflow-hidden text-white py-12 md:py-16 lg:py-20"
        style={{
          background: `
            linear-gradient(
              to bottom,
              rgba(5, 3, 62, 0.95) 0%,
              rgba(0, 9, 23, 0.92) 40%,
              rgba(0, 20, 87, 0.9) 100%
            ),
            url(${heroBgImage})
          `,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 md:w-96 md:h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 md:w-96 md:h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 md:w-96 md:h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-8 md:mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-white/10 backdrop-blur-xl rounded-full mb-6 md:mb-8 border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300 group">
              <Shield className="w-4 h-4 md:w-5 md:h-5 text-green-300 group-hover:scale-110 transition-transform" />
              <span className="text-xs md:text-sm font-semibold tracking-wide">Official Government Platform</span>
              <BadgeCheck className="w-3 h-3 md:w-4 md:h-4 text-green-300" />
            </div>

            {/* Main Heading with Gradient */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-100">
              Verify Any Business<br />in Sierra Leone
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-blue-100/90 max-w-3xl mx-auto mb-3 md:mb-4 leading-relaxed font-light">
              The national transparency platform for validating legally registered businesses.
            </p>
            <p className="text-sm md:text-lg text-blue-200/80 max-w-2xl mx-auto mb-8 md:mb-12 font-light">
              Protect yourself from fraud and build trust in Sierra Leone's digital economy.
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className={`max-w-4xl mx-auto transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className={`relative group transition-all duration-300 ${searchFocused ? 'scale-105' : 'scale-100'}`}>
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative bg-white rounded-xl md:rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center px-4 py-3 sm:px-6 sm:py-5">
                  <div className="flex items-center mb-3 sm:mb-0 sm:mr-4 flex-1">
                    <Search className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 mr-3 sm:mr-4 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Search by business name or registration number..."
                      className="flex-1 text-sm sm:text-base md:text-lg text-gray-900 placeholder-gray-400 focus:outline-none"
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleHeroSearch()}
                    />
                  </div>
                  <button 
                    onClick={handleHeroSearch}
                    className="px-6 py-3 md:px-8 md:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg md:rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
            <p className="text-center text-blue-200/70 text-xs sm:text-sm mt-4 font-light">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
              Example: "ABC Enterprises" or "SL-2024-00123"
            </p>
          </div>

          {/* Scroll Indicator */}
          <div className="text-center mt-12 md:mt-16 animate-bounce">
            <ChevronDown className="w-6 h-6 md:w-8 md:h-8 mx-auto text-blue-300/50" />
          </div>
        </div>
      </section>

      {/* Features Section - Solid Color Background */}
      <section className="py-12 md:py-16 lg:py-20 bg-white/90 relative overflow-hidden">
        {/* Animated Background Elements for Features */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute -bottom-40 left-0 w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Grid Overlay for extra effect */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16 lg:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-800 mb-4 md:mb-6 leading-tight">
              Building Trust in Sierra Leone's Economy
              <div className="h-1.5 w-24 sm:w-28 md:w-32 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mx-auto mt-3 md:mt-4"></div>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-blue-800 max-w-3xl mx-auto font-light leading-relaxed">
              A single source of truth for business legitimacy, designed for citizens, banks, and investors.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              const isActive = activeFeature === index
              return (
                <div 
                  key={index}
                  className={`group relative bg-gradient-to-br ${feature.color} to-blue-500/80 rounded-xl md:rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/10 hover:border-blue-300/30 hover:-translate-y-1 md:hover:-translate-y-2 ${isActive ? 'ring-1 md:ring-2 ring-cyan-300 ring-offset-1 md:ring-offset-2' : ''}`}
                >
                  <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className={`w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-white/10 backdrop-blur-lg rounded-lg md:rounded-xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white drop-shadow-lg" />
                    </div>
                    <h3 className="text-base md:text-lg lg:text-xl font-bold text-white mb-2 md:mb-3 group-hover:text-yellow-200 transition-colors drop-shadow-lg line-clamp-1">
                      {feature.title}
                    </h3>
                    <p className="text-blue-100/80 text-xs sm:text-sm leading-relaxed font-light drop-shadow line-clamp-3">
                      {feature.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 right-1/3 w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16 lg:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-900 mb-4 md:mb-6">
              How It Works
              <div className="h-1.5 w-20 sm:w-22 md:w-24 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full mx-auto mt-3 md:mt-4"></div>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-blue-700 font-light">
              Verify any business in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl md:rounded-2xl p-6 md:p-8 lg:p-10 shadow-xl border border-blue-200 h-full hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 md:hover:-translate-y-2">
                  <div className="relative">
                    <div className="w-16 h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-xl md:rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-bold mb-6 md:mb-8 mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                      {step.number}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-blue-900 mb-3 md:mb-4 text-center">
                      {step.title}
                    </h3>
                    <p className="text-blue-700 text-center leading-relaxed text-sm md:text-base">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 md:-right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 md:w-8 md:h-8 text-blue-400 animate-pulse" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
      className="relative py-12 md:py-16 lg:py-20 bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-950 overflow-hidden"
      style={{
          background: `
            linear-gradient(
              to bottom,
              rgba(5, 3, 62, 0.95) 0%,
              rgba(0, 9, 23, 0.92) 40%,
              rgba(0, 20, 87, 0.9) 100%
            ),
            url(${heroBgImage})
          `,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      > 
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        </div>
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 leading-tight">
            Building Trust in Sierra Leone's<br />Digital Economy
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-blue-200/90 mb-8 md:mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            Join thousands of citizens, businesses, and institutions using SL-Verify to create a safer, more transparent business environment.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center">
            <button 
              onClick={handleVerifyBusinessClick}
              className="group relative px-6 py-4 md:px-8 md:py-4 lg:px-10 lg:py-5 bg-white text-blue-600 rounded-lg md:rounded-xl font-bold text-base md:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative flex items-center justify-center">
                <Search className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 group-hover:scale-110 transition-transform" />
                Verify a Business
              </div>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}