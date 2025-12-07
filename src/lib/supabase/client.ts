// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

function validateEnvVars() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    )
  }
  
  // Validate URL format
  try {
    new URL(url)
  } catch {
    throw new Error(
      `Invalid Supabase URL format: "${url}". Must be a valid HTTP/HTTPS URL.`
    )
  }
  
  return { url, key }
}

export function createClient() {
  const { url, key } = validateEnvVars()
  return createBrowserClient<Database>(url, key)
}