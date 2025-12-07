'use client'

import { Shield, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-red-100 to-orange-100 rounded-full shadow-lg mb-8">
          <Shield className="w-12 h-12 text-red-600" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Access Denied
        </h1>
        
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 mb-8">
          <p className="text-lg text-gray-700 mb-6">
            You don't have permission to access this page or perform this action.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <h2 className="font-semibold text-yellow-800 mb-3 flex items-center justify-center">
              <Shield className="w-5 h-5 mr-2" />
              Required Permissions
            </h2>
            <p className="text-sm text-yellow-700">
              This resource requires specific permissions that your account doesn't have.
              Please contact your system administrator if you believe this is an error.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="text-left">
              <h3 className="font-medium text-gray-700 mb-2">Possible Reasons:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Your account role doesn't have access to this feature</li>
                <li>• You're trying to access admin-only functionality</li>
                <li>• Your account permissions have been changed</li>
                <li>• You need to be assigned a different role</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          
          <Link href="/dashboard" className="flex-1">
            <Button
              variant="ghost"
              className="w-full flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Button>
          </Link>
          
          <Link href="/auth/login" className="flex-1">
            <Button
              variant="secondary"
              className="w-full"
            >
              Switch Account
            </Button>
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>
            Need help? Contact: <strong>support@slobizverify.gov.sl</strong>
          </p>
        </div>
      </div>
    </div>
  )
}