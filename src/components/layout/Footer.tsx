import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10">
                {/* Replace with your actual logo image */}
                <Image
                  src="/VERIFY.png" // Update this path to your actual logo
                  alt="SL-Verify Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
               
              </div>
              <div>
                <div className="text-lg font-bold text-white">SL-Verify</div>
                <div className="text-xs text-gray-400">Sierra Leone Business Registry</div>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              Official business verification directory of the Government of Sierra Leone. 
              Building transparency and trust in our digital economy.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/search" className="hover:text-white transition-colors text-sm">
                  Search Businesses
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors text-sm">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors text-sm">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* For Institutions */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Institutions</h3>
            <ul className="space-y-2">
              <li>
                <Link href="" className="hover:text-white transition-colors text-sm">
                  For Banks
                </Link>
              </li>
              <li>
                <Link href="" className="hover:text-white transition-colors text-sm">
                  For Investors
                </Link>
              </li>
              <li>
                <Link href="" className="hover:text-white transition-colors text-sm">
                  For Government
                </Link>
              </li>
              <li>
                <Link href="" className="hover:text-white transition-colors text-sm">
                  Register Your Business
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span className="text-sm">Ministry of Trade and Industry<br />Freetown, Sierra Leone</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:support@sl-verify.gov.sl" className="hover:text-white transition-colors text-sm">
                  support@sl-verify.gov.sl
                </a>
              </li>
              
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} SL-Verify. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/accessibility" className="text-sm text-gray-400 hover:text-white transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}