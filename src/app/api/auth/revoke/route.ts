import { sessionService } from '@/lib/session-service'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { sessionToken, userId, revokeAll, revokedBy, reason } = await request.json()

    if (revokeAll && userId) {
      await sessionService.revokeAllUserSessions(userId, revokedBy, reason)
    } else if (sessionToken) {
      await sessionService.revokeSession(sessionToken, revokedBy, reason)
    } else {
      return NextResponse.json(
        { error: 'sessionToken or userId required' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Revoke session error:', error)
    return NextResponse.json(
      { error: 'Failed to revoke session' },
      { status: 500 }
    )
  }
}