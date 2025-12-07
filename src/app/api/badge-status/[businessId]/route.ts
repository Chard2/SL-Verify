import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const { businessId } = params

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('businesses')
      .select('id, name, registration_number, status, authenticity_score')
      .eq('id', businessId)
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    // Cast to any to avoid TypeScript inference issues
    const business = data as any

    // Return badge-friendly data
    return NextResponse.json({
      id: business.id,
      name: business.name,
      registration_number: business.registration_number,
      status: business.status,
      authenticity_score: business.authenticity_score,
      verified: business.status === 'verified',
      badge_url: `${process.env.NEXT_PUBLIC_APP_URL}/business/${business.id}`
    })
  } catch (error: any) {
    console.error('Badge status error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch badge status' },
      { status: 500 }
    )
  }
}