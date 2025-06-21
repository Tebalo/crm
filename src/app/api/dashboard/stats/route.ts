import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("timeRange") || "30" // days
    const days = parseInt(timeRange)

    // Calculate date range
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Build base where clause based on user role
    const baseWhere: any = {}
    if (session.user.role === "AGENT") {
      baseWhere.assignedToId = session.user.id
    }

    // Get overall statistics
    const [
      totalCases,
      openCases,
      inProgressCases,
      resolvedCases,
      closedCases,
      overdueCount,
      recentCases,
      casesByPriority,
      casesByCategory,
      casesBySource,
      averageResolutionTime,
      casesCreatedOverTime
    ] = await Promise.all([
      // Total cases
      prisma.case.count({ where: baseWhere }),

      // Cases by status
      prisma.case.count({ where: { ...baseWhere, status: "OPEN" } }),
      prisma.case.count({ where: { ...baseWhere, status: "IN_PROGRESS" } }),
      prisma.case.count({ where: { ...baseWhere, status: "RESOLVED" } }),
      prisma.case.count({ where: { ...baseWhere, status: "CLOSED" } }),

      // Overdue cases (simple calculation based on creation date + 48 hours)
      prisma.case.count({
        where: {
          ...baseWhere,
          status: { in: ["OPEN", "IN_PROGRESS"] },
          createdAt: {
            lt: new Date(Date.now() - 48 * 60 * 60 * 1000) // 48 hours ago
          }
        }
      }),

      // Recent cases (last 7 days)
      prisma.case.count({
        where: {
          ...baseWhere,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),

      // Cases by priority
      prisma.case.groupBy({
        by: ["priority"],
        where: baseWhere,
        _count: { priority: true }
      }),

      // Cases by category
      prisma.case.groupBy({
        by: ["category"],
        where: { ...baseWhere, category: { not: null } },
        _count: { category: true },
        orderBy: { _count: { category: "desc" } },
        take: 10
      }),

      // Cases by source
      prisma.case.groupBy({
        by: ["source"],
        where: baseWhere,
        _count: { source: true }
      }),

      // Average resolution time (for resolved cases in the time range)
      prisma.case.findMany({
        where: {
          ...baseWhere,
          status: "RESOLVED",
          resolvedAt: { not: null },
          createdAt: { gte: startDate }
        },
        select: {
          createdAt: true,
          resolvedAt: true,
        }
      }),

      // Cases created over time (for trend analysis)
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM cases 
        WHERE created_at >= ${startDate}
        ${session.user.role === "AGENT" ? prisma.$queryRaw`AND assigned_to_id = ${session.user.id}` : prisma.$queryRaw``}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `
    ])

    // Calculate average resolution time in hours
    let avgResolutionHours = 0
    if (averageResolutionTime.length > 0) {
      const totalResolutionTime = averageResolutionTime.reduce((sum, caseItem) => {
        if (caseItem.resolvedAt && caseItem.createdAt) {
          return sum + (caseItem.resolvedAt.getTime() - caseItem.createdAt.getTime())
        }
        return sum
      }, 0)
      avgResolutionHours = totalResolutionTime / (averageResolutionTime.length * 60 * 60 * 1000)
    }

    // Format priority data
    const priorityStats = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      URGENT: 0,
      ...Object.fromEntries(
        casesByPriority.map(item => [item.priority, item._count.priority])
      )
    }

    // Format source data
    const sourceStats = Object.fromEntries(
      casesBySource.map(item => [item.source, item._count.source])
    )

    // Format category data
    const categoryStats = casesByCategory.map(item => ({
      category: item.category || "Uncategorized",
      count: item._count.category
    }))

    // Calculate case trends
    const totalThisMonth = await prisma.case.count({
      where: {
        ...baseWhere,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    })

    const totalLastMonth = await prisma.case.count({
      where: {
        ...baseWhere,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    })

    const monthlyGrowth = totalLastMonth === 0 ? 0 : 
      ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100

    return NextResponse.json({
      summary: {
        totalCases,
        openCases,
        inProgressCases,
        resolvedCases,
        closedCases,
        overdueCount,
        recentCases,
        avgResolutionHours: Math.round(avgResolutionHours * 100) / 100,
        monthlyGrowth: Math.round(monthlyGrowth * 100) / 100
      },
      charts: {
        casesByPriority: priorityStats,
        casesBySource: sourceStats,
        casesByCategory: categoryStats,
        casesOverTime: casesCreatedOverTime
      },
      timeRange: {
        days,
        startDate,
        endDate: new Date()
      }
    })

  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}