'use client'

import React from 'react'
import { Code, FileText, Book, HelpCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function ResourcesPage() {
  const resources = [
    {
      title: 'How It Works',
      description: 'Learn how to use SL-Verify to verify businesses in Sierra Leone.',
      icon: Book,
      href: '/how-it-works',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'FAQ',
      description: 'Find answers to frequently asked questions about our platform.',
      icon: HelpCircle,
      href: '/faq',
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'API Documentation',
      description: 'Integrate business verification into your systems with our API.',
      icon: Code,
      href: '/api-docs',
      color: 'bg-purple-50 text-purple-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FileText className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Resources</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Everything you need to know about using SL-Verify
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resources.map((resource, index) => {
              const Icon = resource.icon
              return (
                <Link
                  key={index}
                  href={resource.href}
                  className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-all group"
                >
                  <div className={`w-16 h-16 ${resource.color} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{resource.title}</h3>
                  <p className="text-gray-600 mb-4">{resource.description}</p>
                  <div className="flex items-center text-blue-600 font-medium">
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}

