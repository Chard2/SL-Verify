// FILE: app/auth/callback/route.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/admin'

  console.log('🔄 Auth callback hit:', { code: !!code, next })

  if (code) {
    const cookieStore = await cookies()
    
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              // Handle middleware cookie setting errors
              console.error('Cookie set error:', error)
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch (error) {
              console.error('Cookie remove error:', error)
            }
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    console.log('🔐 Session exchange:', { 
      success: !!data.session, 
      error: error?.message,
      userId: data.user?.id 
    })

    if (!error && data.session) {
      console.log('✅ Redirecting to:', next)
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // If no code or error, redirect to login
  console.log('❌ No code or error, redirecting to login')
  return NextResponse.redirect(new URL('/auth/login', request.url))
}