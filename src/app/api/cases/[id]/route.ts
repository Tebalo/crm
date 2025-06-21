import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { updateCaseSchema } from "@/lib/validations/auth"
import { ActivityType } from "@prisma/client"

// GET /api/cases/[id] - Get single case with full details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // if (!session) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const { id } = params

    const caseData = await prisma.case.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        },
        activities: {
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
        },
        attachments: {
          orderBy: { createdAt: "desc" }
        }
      }
    })

    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Check permissions - agents can only view their assigned cases
    // if (session.user.role === "AGENT" && caseData.assignedToId !== session.user.id) {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    // }

    return NextResponse.json({ case: caseData })

  } catch (error) {
    console.error("Error fetching case:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/cases/[id] - Update case
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    // Get current case to check permissions and track changes
    const currentCase = await prisma.case.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (!currentCase) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Check permissions
    const canUpdate = 
      session.user.role === "ADMIN" ||
      session.user.role === "SUPERVISOR" ||
      (session.user.role === "AGENT" && currentCase.assignedToId === session.user.id)

    if (!canUpdate) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Validate input
    const validatedData = updateCaseSchema.parse(body)

    // Prepare activities for changes
    const activities: {
      caseId: string
      userId: string
      type: ActivityType
      title: string
      content: string
    }[] = []

    // Track status changes
    if (validatedData.status && validatedData.status !== currentCase.status) {
      activities.push({
        caseId: id,
        userId: session.user.id,
        type: ActivityType.STATUS_CHANGED,
        title: "Status Changed",
        content: `Status changed from ${currentCase.status} to ${validatedData.status}`,
      })

      // Set resolved/closed timestamps
      if (validatedData.status === "RESOLVED") {
        validatedData.resolvedAt = new Date()
      } else if (validatedData.status === "CLOSED") {
        validatedData.closedAt = new Date()
      }
    }

    // Track assignment changes
    if (validatedData.assignedToId !== undefined && validatedData.assignedToId !== currentCase.assignedToId) {
      if (validatedData.assignedToId) {
        // Get new assignee info
        const newAssignee = await prisma.user.findUnique({
          where: { id: validatedData.assignedToId },
          select: { name: true, email: true }
        })
        
        activities.push({
          caseId: id,
          userId: session.user.id,
          type: ActivityType.ASSIGNED,
          title: "Case Reassigned",
          content: `Case assigned to ${newAssignee?.name || newAssignee?.email}`,
        })
      } else {
        activities.push({
          caseId: id,
          userId: session.user.id,
          type: ActivityType.ASSIGNED,
          title: "Case Unassigned",
          content: "Case unassigned from agent",
        })
      }
    }

    // Update case with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the case
      const updatedCase = await tx.case.update({
        where: { id },
        data: {
          ...validatedData,
          updatedAt: new Date(),
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

      // Create activity records
      if (activities.length > 0) {
        await tx.caseActivity.createMany({
          data: activities
        })
      }

      return updatedCase
    })

    return NextResponse.json({
      message: "Case updated successfully",
      case: result
    })

  } catch (error) {
    console.error("Error updating case:", error)
    
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

// DELETE /api/cases/[id] - Delete case (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Delete case and all related records (cascade)
    await prisma.case.delete({
      where: { id }
    })

    return NextResponse.json({
      message: "Case deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting case:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}