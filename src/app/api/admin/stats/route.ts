import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireRole } from '@/lib/auth-middleware'
import type { AdminApiResponse, AdminStats } from '@/types/admin'

const prisma = new PrismaClient()

export async function GET(request: NextRequest): Promise<NextResponse<AdminApiResponse<AdminStats>>> {
  try {
    // Require admin role
    await requireRole(request, 'ADMIN')

    const [
      totalDocuments,
      totalRequirements,
      documentsByType,
      documentsByAuthority,
      recentUploads
    ] = await Promise.all([
      // Total documents count
      prisma.document.count(),
      
      // Total requirements count
      prisma.complianceRequirement.count(),
      
      // Documents grouped by type
      prisma.document.groupBy({
        by: ['type'],
        _count: { type: true },
        orderBy: { _count: { type: 'desc' } }
      }),
      
      // Documents grouped by authority
      prisma.document.groupBy({
        by: ['authorityId'],
        _count: { authorityId: true },
        orderBy: { _count: { authorityId: 'desc' } }
      }),
      
      // Recent uploads (last 7 days)
      prisma.document.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    // Get authority names for the grouped data
    const authorityIds = documentsByAuthority.map(item => item.authorityId)
    const authorities = await prisma.regulatoryAuthority.findMany({
      where: { id: { in: authorityIds } },
      select: { id: true, name: true }
    })

    const authorityMap = new Map(authorities.map(auth => [auth.id, auth.name]))

    const stats: AdminStats = {
      totalDocuments,
      totalRequirements,
      documentsByType: documentsByType.map(item => ({
        type: item.type,
        count: item._count.type
      })),
      documentsByAuthority: documentsByAuthority.map(item => ({
        authority: authorityMap.get(item.authorityId) || 'Unknown',
        count: item._count.authorityId
      })),
      recentUploads
    }

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Failed to fetch admin stats:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch statistics'
    }, { status: 500 })
  }
}
