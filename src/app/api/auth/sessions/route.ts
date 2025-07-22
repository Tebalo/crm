import { sessionService } from '@/lib/session-service'
import { NextRequest, NextResponse } from 'next/server'


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const days = parseInt(searchParams.get('days') || '30')

    const analytics = await sessionService.getSessionAnalytics(userId || undefined, days)

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Get sessions error:', error)
    return NextResponse.json(
      { error: 'Failed to get sessions' },
      { status: 500 }
    )
  }
}