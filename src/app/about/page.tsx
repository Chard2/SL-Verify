'use client'

import React from 'react'
import { 
  Shield, Target, Users, Award, Building2, Globe, 
  CheckCircle, TrendingUp, Lock, Zap, Heart, Eye,
  Mail, Phone, MapPin, ArrowRight, Sparkles, Star
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: 'Transparency',
      description: 'We believe in open access to business information to build trust in the economy.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Target,
      title: 'Accuracy',
      description: 'We maintain the highest standards of data accuracy and verification.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Users,
      title: 'Accessibility',
      description: 'Our platform is designed to be accessible to everyone, everywhere.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Award,
      title: 'Integrity',
      description: 'We operate with the highest ethical standards and government oversight.',
      color: 'from-orange-500 to-red-500'
    }
  ]

  
  const features = [
    { icon: Lock, title: 'Government Secured', description: 'Official government platform with enterprise-grade security' },
    { icon: Zap, title: 'Instant Verification', description: 'Real-time access to verified business information' },
    { icon: TrendingUp, title: 'Economic Growth', description: 'Enabling trust and transparency in digital commerce' },
    { icon: Heart, title: 'Citizen First', description: 'Designed to protect and empower Sierra Leone citizens' }
  ]
  const heroBgImage = '/work.jpg'

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header/>
      {/* Hero Section */}
      <section 
      className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-20 overflow-hidden"
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
          
        
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-xl rounded-full mb-6 border border-white/20">
              <Star className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-semibold">Official Government Platform</span>
            </div>
            
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              About <span className="bg-clip-text font-bold text-transparent bg-gradient-to-r from-cyan-300 to-blue-300">SL-Verify</span>
            </h1>
            <p className="text-xl md:text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed font-light">
              The official business verification platform of the Government of Sierra Leone, 
              empowering transparency and trust in our digital economy.
            </p>
          </div>
        </div>
      </section>

      

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-7 py-2 bg-blue-50 rounded-full mb-6 border border-blue-200">
                <span className="text-xl font-semibold text-blue-900">Our Mission</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Building Trust in Sierra Leone's Economy
              </h2>
              
              <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
                <p>
                  SL-Verify was created to provide a <span className="font-semibold text-gray-900">single source of truth</span> for business legitimacy 
                  in Sierra Leone. We aim to protect citizens from fraud, enable informed business decisions, 
                  and build trust in our digital economy.
                </p>
                <p>
                  Operated by the <span className="font-semibold text-gray-900">Ministry of Trade and Industry</span>, our platform ensures that every business 
                  verification is backed by official government records and maintained to the highest standards 
                  of accuracy and security.
                </p>
                <p>
                  We serve citizens, businesses, financial institutions, investors, and government agencies 
                  by providing instant, reliable access to business registration information.
                </p>
              </div>

              
            </div>

            <div className="order-1 lg:order-2 flex justify-center items-center">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-blue-100">
                <img
                  src="/w.jpg"
                  alt="Sierra Leone Government Building"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-700 to-blue-900 opacity-40"></div>
                <div className="absolute bottom-0 left-0 right-0 pb-8 px-8 flex flex-col items-center z-10">
                  <h3 className="text-3xl font-bold text-white mb-4 drop-shadow">Government Backed</h3>
                  <p className="text-blue-100 leading-relaxed text-lg text-center drop-shadow">
                    Official platform operated by the Ministry of Trade and Industry, 
                    ensuring reliability and trustworthiness for all users.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* Values Section */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-7 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-blue-50 rounded-full mb-6 border border-blue-900">
              <Heart className="w-4 h-4 text-blue-900" />
              <span className="text-sm font-semibold text-blue-900">Our Values</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              The Principles That Guide Us
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything we do is driven by these core values
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div key={index} className="group bg-gradient-to-b from-gray-50 to-white rounded-2xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
<Footer/>
      

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  )
}