import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthContext } from "@/lib/auth-middleware"
// import { ActivityType } from "@prisma/client"
// import { ActivityType } from "@prisma/client"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get auth context from your session system
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const authContext = await getAuthContext(request)
    
    // Uncomment when you want to enforce auth
    // if (!authContext.isAuthenticated) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const { id } = params

    const caseData = await prisma.case.findUnique({
      where: { id },
      include: {
        activities: {
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
    // if (authContext.user?.role === "AGENT" && caseData.assignedToUserId !== authContext.user?.id) {
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
// export async function PUT(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const authContext = await getAuthContext(request)
    
//     if (!authContext.isAuthenticated || !authContext.user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const { id } = params
//     const body = await request.json()

//     // Get current case to check permissions and track changes
//     const currentCase = await prisma.case.findUnique({
//       where: { id }
//     })

//     if (!currentCase) {
//       return NextResponse.json({ error: "Case not found" }, { status: 404 })
//     }

//     // Check permissions - for now, allow all authenticated users
//     // You can add role-based checks later
//     const canUpdate = authContext.isAuthenticated

//     if (!canUpdate) {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 })
//     }

//     // Basic validation (you can add Zod schema later)
//     const allowedFields = [
//       'title', 'description', 'status', 'priority', 'category', 
//       'contactName', 'contactEmail', 'contactPhone', 
//       'assignedToUserId', 'assignedToEmail', 'assignedToName',
//       'dueDate'
//     ]

//     const validatedData: Record<string, any> = {}
//     for (const field of allowedFields) {
//       if (body[field] !== undefined) {
//         validatedData[field] = body[field]
//       }
//     }

//     // Prepare activities for changes
//     const activities: {
//       caseId: string
//       userId?: string
//       userEmail?: string
//       userName?: string
//       type: ActivityType
//       title: string
//       content: string
//     }[] = []

//     // Track status changes
//     if (validatedData.status && validatedData.status !== currentCase.status) {
//       activities.push({
//         caseId: id,
//         userId: authContext.user.id,
//         userEmail: authContext.user.email,
//         userName: authContext.user.name,
//         type: ActivityType.STATUS_CHANGED,
//         title: "Status Changed",
//         content: `Status changed from ${currentCase.status} to ${validatedData.status}`,
//       })

//       // Set resolved/closed timestamps
//       if (validatedData.status === "RESOLVED") {
//         validatedData.resolvedAt = new Date()
//       } else if (validatedData.status === "CLOSED") {
//         validatedData.closedAt = new Date()
//       }
//     }

//     // Track assignment changes
//     if (validatedData.assignedToUserId !== undefined && 
//         validatedData.assignedToUserId !== currentCase.assignedToUserId) {
//       if (validatedData.assignedToUserId) {
//         activities.push({
//           caseId: id,
//           userId: authContext.user.id,
//           userEmail: authContext.user.email,
//           userName: authContext.user.name,
//           type: ActivityType.ASSIGNED,
//           title: "Case Reassigned",
//           content: `Case assigned to ${validatedData.assignedToName || validatedData.assignedToEmail || 'unknown user'}`,
//         })
//       } else {
//         activities.push({
//           caseId: id,
//           userId: authContext.user.id,
//           userEmail: authContext.user.email,
//           userName: authContext.user.name,
//           type: ActivityType.ASSIGNED,
//           title: "Case Unassigned",
//           content: "Case unassigned from agent",
//         })
//       }
//     }

//     // Update case with transaction
//     const result = await prisma.$transaction(async (tx) => {
//       // Update the case
//       const updatedCase = await tx.case.update({
//         where: { id },
//         data: {
//           ...validatedData,
//           updatedAt: new Date(),
//         }
//       })

//       // Create activity records
//       if (activities.length > 0) {
//         await tx.caseActivity.createMany({
//           data: activities
//         })
//       }

//       return updatedCase
//     })

//     return NextResponse.json({
//       message: "Case updated successfully",
//       case: result
//     })

//   } catch (error) {
//     console.error("Error updating case:", error)
    
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     )
//   }
// }

// DELETE /api/cases/[id] - Delete case (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authContext = await getAuthContext(request)
    
    // Only allow admins to delete cases
    if (!authContext.isAuthenticated || authContext.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Delete case and all related records (cascade is handled by schema)
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