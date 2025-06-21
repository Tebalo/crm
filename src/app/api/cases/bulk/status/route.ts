import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { ActivityType, CaseStatus } from "@prisma/client"

// Schema for bulk status update
const bulkStatusSchema = z.object({
  caseIds: z.array(z.string()).min(1, "At least one case ID is required"),
  status: z.nativeEnum(CaseStatus),
  comment: z.string().optional(),
})

// POST /api/cases/bulk/status - Bulk update case status
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { caseIds, status, comment } = bulkStatusSchema.parse(body)

    // Get current cases to check permissions
    const cases = await prisma.case.findMany({
      where: { id: { in: caseIds } },
      select: { id: true, status: true, assignedToId: true, title: true }
    })

    if (cases.length !== caseIds.length) {
      return NextResponse.json(
        { error: "One or more cases not found" },
        { status: 404 }
      )
    }

    // Check permissions - agents can only update their assigned cases
    if (session.user.role === "AGENT") {
      const unauthorizedCases = cases.filter(c => c.assignedToId !== session.user.id)
      if (unauthorizedCases.length > 0) {
        return NextResponse.json(
          { error: "Cannot update cases not assigned to you" },
          { status: 403 }
        )
      }
    }

    // Bulk update with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Prepare update data
      const updateData: any = {
        status,
        updatedAt: new Date(),
      }

      // Set timestamps based on status
      if (status === "RESOLVED") {
        updateData.resolvedAt = new Date()
      } else if (status === "CLOSED") {
        updateData.closedAt = new Date()
      }

      // Update all cases
      await tx.case.updateMany({
        where: { id: { in: caseIds } },
        data: updateData
      })

      // Create activity records for each case
      const activities = cases
        .filter(caseItem => caseItem.status !== status) // Only for cases that actually changed
        .map(caseItem => ({
          caseId: caseItem.id,
          userId: session.user.id,
          type: ActivityType.STATUS_CHANGED,
          title: "Status Changed",
          content: `Status changed from ${caseItem.status} to ${status} via bulk operation${comment ? `. Comment: ${comment}` : ''}`,
        }))

      if (activities.length > 0) {
        await tx.caseActivity.createMany({
          data: activities
        })
      }

      return {
        updatedCount: activities.length,
        totalProcessed: cases.length,
        newStatus: status
      }
    })

    return NextResponse.json({
      message: `Successfully updated ${result.updatedCount} cases to ${status}`,
      result
    })

  } catch (error) {
    console.error("Error in bulk status update:", error)
    
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