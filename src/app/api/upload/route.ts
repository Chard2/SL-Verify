import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Check authentication
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is a verifier
    const isVerifier = user.user_metadata?.role === 'verifier'
    if (!isVerifier) {
      return NextResponse.json(
        { error: 'Forbidden - Verifier role required' },
        { status: 403 }
      )
    }

    // Read file content
    const text = await file.text()
    const rows = text.split('\n').slice(1) // Skip header

    let success = 0
    let failed = 0
    const errors: Array<{ row: number; message: string }> = []

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i].trim()
      if (!row) continue

      try {
        const columns = row.split(',')
        
        const businessData = {
          name: columns[0],
          registration_number: columns[1],
          status: columns[2] || 'unverified',
          registration_date: columns[3],
          address: columns[4],
          phone: columns[5] || null,
          email: columns[6] || null,
          website: columns[7] || null,
          sector: columns[8] || null,
          region: columns[9] || null,
          authenticity_score: parseInt(columns[10] || '0')
        }

        const { error } = await supabase
          .from('businesses')
          .insert(businessData as any)

        if (error) throw error
        success++
      } catch (error: any) {
        failed++
        errors.push({ 
          row: i + 2, 
          message: error.message 
        })
      }
    }

    return NextResponse.json({
      success,
      failed,
      errors,
      message: `Upload complete: ${success} successful, ${failed} failed`
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    )
  }
}
