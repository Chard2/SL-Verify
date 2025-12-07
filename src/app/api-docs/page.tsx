'use client'

import React, { useState } from 'react'
import { Code, Copy, Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function APIDocsPage() {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const endpoints = [
    {
      method: 'GET',
      path: '/api/badge-status/[businessId]',
      description: 'Get verification status and badge information for a business',
      example: `curl https://slobizverify.gov.sl/api/badge-status/123e4567-e89b-12d3-a456-426614174000`
    },
    {
      method: 'GET',
      path: '/api/businesses/search',
      description: 'Search for businesses by name or registration number',
      example: `curl "https://slobizverify.gov.sl/api/businesses/search?q=ABC+Enterprises"`
    }
  ]

  const codeExamples = [
    {
      title: 'JavaScript/TypeScript',
      language: 'javascript',
      code: `// Search for a business
const response = await fetch(
  'https://slobizverify.gov.sl/api/businesses/search?q=ABC+Enterprises',
  {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  }
);

const data = await response.json();
console.log(data);`
    },
    {
      title: 'Python',
      language: 'python',
      code: `import requests

# Search for a business
response = requests.get(
    'https://slobizverify.gov.sl/api/businesses/search',
    params={'q': 'ABC Enterprises'},
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    }
)

data = response.json()
print(data)`
    },
    {
      title: 'cURL',
      language: 'bash',
      code: `curl -X GET \\
  "https://slobizverify.gov.sl/api/businesses/search?q=ABC+Enterprises" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Code className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">API Documentation</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Integrate business verification into your applications with our RESTful API
            </p>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Getting Started</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Base URL</h3>
              <code className="text-blue-600 font-mono">https://slobizverify.gov.sl/api</code>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication</h3>
              <p className="text-gray-700 mb-2">
                Most endpoints require API key authentication. Include your API key in the Authorization header:
              </p>
              <code className="text-gray-800 font-mono text-sm">
                Authorization: Bearer YOUR_API_KEY
              </code>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Request API Access</h3>
              <p className="text-gray-600 mb-4">
                To get an API key, please contact our support team with details about your use case.
              </p>
              <a
                href="mailto:api@slobizverify.gov.sl"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Request API Key
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* API Endpoints */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">API Endpoints</h2>
          
          <div className="space-y-6">
            {endpoints.map((endpoint, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className={`px-3 py-1 rounded text-sm font-semibold ${
                      endpoint.method === 'GET' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="ml-4 text-gray-800 font-mono">{endpoint.path}</code>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{endpoint.description}</p>
                <div className="bg-gray-900 rounded-lg p-4 relative group">
                  <code className="text-green-400 font-mono text-sm">{endpoint.example}</code>
                  <button
                    onClick={() => copyToClipboard(endpoint.example, `endpoint-${index}`)}
                    className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    {copied === `endpoint-${index}` ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Code Examples</h2>
          
          <div className="space-y-6">
            {codeExamples.map((example, index) => (
              <div key={index} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-800 px-6 py-3 flex items-center justify-between">
                  <h3 className="text-white font-semibold">{example.title}</h3>
                  <button
                    onClick={() => copyToClipboard(example.code, `example-${index}`)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {copied === `example-${index}` ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <pre className="p-6 overflow-x-auto">
                  <code className="text-sm text-gray-800">{example.code}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Help?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Our API support team is here to help you integrate business verification into your systems.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:api@slobizverify.gov.sl"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Contact API Support
            </a>
            <a
              href="/faq"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-700 text-white border-2 border-white rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              View FAQ
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

