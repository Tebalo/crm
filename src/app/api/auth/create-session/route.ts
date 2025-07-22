import { sessionService } from '@/lib/session-service'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { decodedPayload, accessToken, refreshToken, clientInfo } = body

    // Get client IP from headers
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip')
    
    const sessionData = await sessionService.createSession(
      decodedPayload,
      accessToken,
      refreshToken,
      {
        ...clientInfo,
        ipAddress: ip || clientInfo.ipAddress,
      }
    )

    return NextResponse.json(sessionData)
  } catch (error) {
    console.error('Create session error:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}