import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthContext } from "@/lib/auth-middleware"
import { ActivityType } from "@prisma/client"

// GET /api/cases - List cases with filtering
export async function GET(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    
    // Uncomment when you want to enforce auth
    if (!authContext.isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const assignedTo = searchParams.get('assignedTo')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}
    
    if (status) where.status = status
    if (priority) where.priority = priority
    if (assignedTo) where.assignedToUserId = assignedTo
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { caseNumber: { contains: search, mode: 'insensitive' } }
      ]
    }

    // If user is not admin, only show their assigned cases
    // if (authContext.user?.role !== "ADMIN" && authContext.user?.id) {
    //   where.assignedToUserId = authContext.user.id
    // }

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where,
        include: {
          _count: {
            select: {
              activities: true,
              attachments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.case.count({ where })
    ])

    return NextResponse.json({
      cases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Error fetching cases:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/cases - Create new case
export async function POST(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    
    // Allow anonymous case creation for now
    const body = await request.json()

    // Basic validation
    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      )
    }

    // Create case with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the case
      const newCase = await tx.case.create({
        data: {
          title: body.title,
          description: body.description,
          priority: body.priority || "MEDIUM",
          category: body.category,
          source: body.source || "WEB_FORM",
          contactName: body.contactName,
          contactEmail: body.contactEmail,
          contactPhone: body.contactPhone,
          dueDate: body.dueDate ? new Date(body.dueDate) : null,
        }
      })

      // Create initial activity
      await tx.caseActivity.create({
        data: {
          caseId: newCase.id,
          userId: authContext.user?.id,
          userEmail: authContext.user?.email || body.contactEmail,
          userName: authContext.user?.name || body.contactName,
          type: ActivityType.CREATED,
          title: "Case Created",
          content: "Case was created",
        }
      })

      return newCase
    })

    return NextResponse.json({
      message: "Case created successfully",
      case: result
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating case:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
