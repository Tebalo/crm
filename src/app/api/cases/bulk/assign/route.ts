import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { ActivityType } from "@prisma/client"

// Schema for bulk assignment
const bulkAssignSchema = z.object({
  caseIds: z.array(z.string()).min(1, "At least one case ID is required"),
  assignedToId: z.string().optional(), // If not provided, unassign
})

// POST /api/cases/bulk/assign - Bulk assign cases to agent
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins and supervisors can bulk assign
    if (!["ADMIN", "SUPERVISOR"].includes(session.user.role!)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { caseIds, assignedToId } = bulkAssignSchema.parse(body)

    // Verify all cases exist
    const cases = await prisma.case.findMany({
      where: { id: { in: caseIds } },
      select: { id: true, title: true, assignedToId: true }
    })

    if (cases.length !== caseIds.length) {
      return NextResponse.json(
        { error: "One or more cases not found" },
        { status: 404 }
      )
    }

    // Get assignee info if provided
    let assignee = null
    if (assignedToId) {
      assignee = await prisma.user.findUnique({
        where: { id: assignedToId },
        select: { id: true, name: true, email: true, role: true, isActive: true }
      })

      if (!assignee) {
        return NextResponse.json(
          { error: "Assignee not found" },
          { status: 404 }
        )
      }

      if (!assignee.isActive) {
        return NextResponse.json(
          { error: "Cannot assign to inactive user" },
          { status: 400 }
        )
      }

      if (!["AGENT", "SUPERVISOR", "ADMIN"].includes(assignee.role)) {
        return NextResponse.json(
          { error: "User cannot be assigned cases" },
          { status: 400 }
        )
      }
    }

    // Bulk update with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update all cases
      await tx.case.updateMany({
        where: { id: { in: caseIds } },
        data: {
          assignedToId: assignedToId || null,
          updatedAt: new Date(),
        }
      })

      // Create activity records for each case
      const activities = cases.map(caseItem => ({
        caseId: caseItem.id,
        userId: session.user.id,
        type: ActivityType.ASSIGNED,
        title: assignedToId ? "Case Assigned" : "Case Unassigned",
        content: assignedToId 
          ? `Case assigned to ${assignee?.name || assignee?.email} via bulk operation`
          : "Case unassigned via bulk operation",
      }))

      await tx.caseActivity.createMany({
        data: activities
      })

      return {
        updatedCount: cases.length,
        assignee: assignee ? {
          name: assignee.name,
          email: assignee.email
        } : null
      }
    })

    return NextResponse.json({
      message: `Successfully ${assignedToId ? 'assigned' : 'unassigned'} ${result.updatedCount} cases`,
      result
    })

  } catch (error) {
    console.error("Error in bulk assignment:", error)
    
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