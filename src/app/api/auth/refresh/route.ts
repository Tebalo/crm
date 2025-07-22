import { NextRequest, NextResponse } from 'next/server'

const REFRESH_API_URL = "http://74.208.205.44:8019/api/auth_microservice/refresh/"
const DECODE_API_URL = "http://74.208.205.44:8019/api/auth_microservice/decode-token/"

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json()

    // Call external refresh endpoint
    const refreshResponse = await fetch(REFRESH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    })

    if (!refreshResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to refresh token' },
        { status: 401 }
      )
    }

    const refreshData = await refreshResponse.json()

    // Decode new token
    const decodeResponse = await fetch(DECODE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: refreshData.access }),
    })

    if (!decodeResponse.ok) {
      throw new Error('Failed to decode refreshed token')
    }

    const decodedData = await decodeResponse.json()

    return NextResponse.json({
      access: refreshData.access,
      refresh: refreshData.refresh,
      decoded: decodedData.payload,
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    )
  }
}