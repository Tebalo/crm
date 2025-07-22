import { sessionService } from '@/lib/session-service'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { sessionToken, tokenHash } = await request.json()

    const session = await sessionService.validateSession(sessionToken, tokenHash)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error('Validate session error:', error)
    return NextResponse.json(
      { error: 'Failed to validate session' },
      { status: 500 }
    )
  }
}