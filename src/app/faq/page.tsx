'use client'

import React, { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

interface FAQItem {
  question: string
  answer: string
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs: FAQItem[] = [
    {
      question: 'What is SL-Verify?',
      answer: 'SL-Verify is the official business verification platform of the Government of Sierra Leone. It allows citizens, businesses, banks, and investors to verify the legitimacy of registered businesses in Sierra Leone.'
    },
    {
      question: 'How do I search for a business?',
      answer: 'You can search for a business using either the business name or registration number. Simply enter your search term in the search bar on the homepage and click search. Our system uses advanced matching to find businesses even with slight variations in spelling.'
    },
    {
      question: 'What information can I see about a business?',
      answer: 'For each verified business, you can view: registration number, registration date, business status (verified, under review, etc.), authenticity score, contact information (address, phone, email), sector and region, and verification history.'
    },
    {
      question: 'How accurate is the information?',
      answer: 'All information is sourced directly from the official Sierra Leone Business Registry. Our platform maintains a 99.9% accuracy rate and is updated regularly to ensure data integrity.'
    },
    {
      question: 'What does the authenticity score mean?',
      answer: 'The authenticity score is a percentage that indicates how verified and legitimate a business is. It\'s calculated based on registration status, compliance history, and verification checks. Higher scores indicate more reliable businesses.'
    },
    {
      question: 'Can I download verification certificates?',
      answer: 'Yes, once you view a business profile, you can download official verification certificates and reports for your records. These certificates can be used for legal and business purposes.'
    },
    {
      question: 'Is there an API available?',
      answer: 'Yes, we provide API access for institutions, banks, and developers who want to integrate business verification into their systems. Visit our API Documentation page for more details.'
    },
    {
      question: 'How do I report a fraudulent business?',
      answer: 'If you encounter a business that appears to be fraudulent or has incorrect information, you can use the "Report Issue" button on any business profile page. Our team will investigate and take appropriate action.'
    },
    {
      question: 'Is the service free?',
      answer: 'Yes, basic business verification is free for all users. However, API access and premium features may require registration for institutional users.'
    },
    {
      question: 'How often is the database updated?',
      answer: 'Our database is updated in real-time as new businesses are registered and verified. Verification statuses are updated immediately when changes occur in the official registry.'
    },
    {
      question: 'Can I verify businesses offline?',
      answer: 'Yes, you can generate QR codes for businesses that can be scanned offline. The QR codes link directly to the business verification page and work even without an internet connection once scanned.'
    },
    {
      question: 'Who can use this platform?',
      answer: 'SL-Verify is available to everyone: citizens verifying businesses before transactions, banks checking loan applicants, investors validating partners, and businesses verifying their own status.'
    }
  ]
  const heroBgImage = '/work.jpg'

  return (
    <div className="min-h-screen bg-gray-50">
      <Header/>
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
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <HelpCircle className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Find answers to common questions about SL-Verify and business verification in Sierra Leone.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-8">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          
        </div>
      </section>
      <Footer/>
    </div>
  )
}

