// src/lib/supabase/superbase.ts
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// IMPORTANT: Pass Database as a generic type parameter
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Export the Database type for use in other files
export type { Database } from '@/types/database'