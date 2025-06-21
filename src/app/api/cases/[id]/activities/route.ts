import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { addCaseActivitySchema } from "@/lib/validations/auth"
import { ActivityType } from "@prisma/client"

// GET /api/cases/[id]/activities - Get case activities
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: caseId } = params
    const { searchParams } = new URL(request.url)
    const includeInternal = searchParams.get("includeInternal") === "true"

    // Check if case exists and user has access
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      select: { id: true, assignedToId: true }
    })

    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Check permissions
    const canViewInternal = 
      session.user.role === "ADMIN" ||
      session.user.role === "SUPERVISOR" ||
      (session.user.role === "AGENT" && caseData.assignedToId === session.user.id)

    if (session.user.role === "AGENT" && caseData.assignedToId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Build where clause
    const where: any = { caseId }
    
    // Filter internal activities based on permissions
    if (!canViewInternal || !includeInternal) {
      where.isInternal = false
    }

    const activities = await prisma.caseActivity.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ activities })

  } catch (error) {
    console.error("Error fetching case activities:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/cases/[id]/activities - Add new activity/comment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: caseId } = params
    const body = await request.json()

    // Check if case exists and user has access
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      select: { id: true, assignedToId: true }
    })

    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Check permissions
    const canAddActivity = 
      session.user.role === "ADMIN" ||
      session.user.role === "SUPERVISOR" ||
      (session.user.role === "AGENT" && caseData.assignedToId === session.user.id)

    if (!canAddActivity) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Validate input
    const validatedData = addCaseActivitySchema.parse(body)

    // Create activity
    const activity = await prisma.caseActivity.create({
      data: {
        caseId,
        userId: session.user.id,
        type: ActivityType.COMMENT,
        title: validatedData.title,
        content: validatedData.content,
        isInternal: validatedData.isInternal,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    // Update case's updatedAt timestamp
    await prisma.case.update({
      where: { id: caseId },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json({
      message: "Activity added successfully",
      activity
    })

  } catch (error) {
    console.error("Error adding case activity:", error)
    
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