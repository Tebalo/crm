import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createCaseSchema } from "@/lib/validations/auth"
import { generateCaseNumber } from "@/lib/utils"
import { ActivityType } from "@prisma/client"

// GET /api/cases - Get all cases with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // if (!session) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")
    const assignedToId = searchParams.get("assignedToId")
    const search = searchParams.get("search")
    const category = searchParams.get("category")

    const skip = (page - 1) * limit

    // Build where clause based on user role
    const where: any = {}
    
    // Agents can only see their assigned cases
    // if (session.user.role === "AGENT") {
    //   where.assignedToId = session.user.id
    // }

    // Apply filters
    if (status) where.status = status
    if (priority) where.priority = priority
    if (assignedToId) where.assignedToId = assignedToId
    if (category) where.category = category
    
    // Search functionality
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { caseNumber: { contains: search, mode: "insensitive" } },
        { contactName: { contains: search, mode: "insensitive" } },
        { contactEmail: { contains: search, mode: "insensitive" } },
      ]
    }

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where,
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          _count: {
            select: {
              activities: true,
              attachments: true,
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.case.count({ where })
    ])

    return NextResponse.json({
      cases,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
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
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createCaseSchema.parse(body)

    // Generate unique case number
    const caseNumber = generateCaseNumber()

    // Create case with transaction to ensure activity is also created
    const result = await prisma.$transaction(async (tx) => {
      // Create the case
      const newCase = await tx.case.create({
        data: {
          ...validatedData,
          caseNumber,
        },
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      })

      // Create initial activity
      await tx.caseActivity.create({
        data: {
          caseId: newCase.id,
          userId: session.user.id,
          type: ActivityType.CREATED,
          title: "Case Created",
          content: `Case created by ${session.user.name || session.user.email}`,
        }
      })

      // Create assignment activity if case is assigned
      if (validatedData.assignedToId) {
        await tx.caseActivity.create({
          data: {
            caseId: newCase.id,
            userId: session.user.id,
            type: ActivityType.ASSIGNED,
            title: "Case Assigned",
            content: `Case assigned to ${newCase.assignedTo?.name || newCase.assignedTo?.email}`,
          }
        })
      }

      return newCase
    })

    return NextResponse.json({
      message: "Case created successfully",
      case: result
    })

  } catch (error) {
    console.error("Error creating case:", error)
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}