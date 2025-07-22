import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { requireRole } from '@/lib/auth-middleware'
import type { AdminApiResponse, AuthorityOption } from '@/types/admin'

const prisma = new PrismaClient()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest): Promise<NextResponse<AdminApiResponse<AuthorityOption[]>>> {
  try {
    // Require admin role
    // await requireRole(request, 'ADMIN')

    const authorities = await prisma.regulatoryAuthority.findMany({
      select: {
        id: true,
        name: true,
        code: true
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: authorities
    })
  } catch (error) {
    console.error('Failed to fetch authorities:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch authorities'
    }, { status: 500 })
  }
}

// export async function POST(request: NextRequest): Promise<NextResponse<AuthorityApiResponse<RegulatoryAuthorityWithStats>>> {
//   try {
//     // Require admin role
//     await requireRole(request, 'ADMIN')

//     const data: AuthorityFormData = await request.json()

//     // Validate required fields at API level
//     if (!data.name || !data.code) {
//       return NextResponse.json({
//         success: false,
//         message: 'Missing required fields',
//         errors: [
//           ...(!data.name ? [{ field: 'name', message: 'Authority name is required' }] : []),
//           ...(!data.code ? [{ field: 'code', message: 'Authority code is required' }] : [])
//         ]
//       }, { status: 400 })
//     }

//     const authority = await AuthorityService.createAuthority(data)

//     return NextResponse.json({
//       success: true,
//       data: authority,
//       message: 'Regulatory authority created successfully'
//     }, { status: 201 })
//   } catch (error: any) {
//     console.error('Failed to create authority:', error)

//     if (error.name === 'ValidationError') {
//       return NextResponse.json({
//         success: false,
//         message: 'Validation failed',
//         errors: error.errors
//       }, { status: 400 })
//     }

//     return NextResponse.json({
//       success: false,
//       message: error.message || 'Failed to create regulatory authority'
//     }, { status: 500 })
//   }
// }
