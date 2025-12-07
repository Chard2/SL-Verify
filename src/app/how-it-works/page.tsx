'use client'

import React from 'react'
import { Search, CheckCircle, Download, Shield, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function HowItWorksPage() {
  const steps = [
    {
      number: '1',
      title: 'Search',
      description: 'Enter the business name or registration number in the search bar above.',
      icon: Search,
      color: 'bg-blue-500'
    },
    {
      number: '2',
      title: 'Verify',
      description: 'Review the business profile, registration status, and compliance information.',
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      number: '3',
      title: 'Confirm',
      description: 'Download a verification certificate or report for your records.',
      icon: Download,
      color: 'bg-purple-500'
    }
  ]

  const features = [
    {
      title: 'Instant Verification',
      description: 'Get verification results in seconds, not days. Our system searches through thousands of registered businesses instantly.'
    },
    {
      title: 'Official Records',
      description: 'All data is sourced directly from the official Sierra Leone Business Registry, ensuring accuracy and reliability.'
    },
    {
      title: 'Fraud Prevention',
      description: 'Our similarity detection system alerts you to potential duplicate or suspicious business names before you make a decision.'
    },
    {
      title: 'Complete Profiles',
      description: 'Access comprehensive business information including registration details, status, authenticity scores, and more.'
    }
  ]
  const heroBgImage = '/work.jpg'


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section 
      className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16"
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
        
        <div className="max-w-7xl py-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Verify any business in Sierra Leone in three simple steps. Our platform makes business verification fast, easy, and reliable.
            </p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="relative">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 h-full">
                    <div className={`w-16 h-16 ${step.color} text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto`}>
                      {step.number}
                    </div>
                    <div className="flex justify-center mb-4">
                      <Icon className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3 text-center">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-center">
                      {step.description}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link href="/search">
              <Button variant="primary" size="lg">
                Start Verifying Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Use SL-Verify?
            </h2>
            <p className="text-xl text-gray-600">
              Built with cutting-edge technology to ensure accuracy and reliability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-900 rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Need Help?</h2>
            <p className="text-white mb-6">
              If you have questions about how to use our platform or need assistance with verification, 
              check out our FAQ section or contact our support team.
            </p>
            <div className="flex text-white flex-col sm:flex-row gap-4">
              <Link href="/faq">
                <Button variant="secondary">
                  View FAQ
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="ghost"
                className='text-white border-2 '>
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

