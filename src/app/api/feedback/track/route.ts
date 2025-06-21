import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"

// Schema for tracking request
const trackCaseSchema = z.object({
  caseNumber: z.string().min(1, "Case number is required"),
  contactEmail: z.string().email("Valid email address is required"),
})

// POST /api/feedback/track - Track case status (public endpoint)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { caseNumber, contactEmail } = trackCaseSchema.parse(body)

    // Find case by case number and contact email for security
    const caseData = await prisma.case.findFirst({
      where: {
        caseNumber,
        contactEmail,
      },
      select: {
        id: true,
        caseNumber: true,
        title: true,
        status: true,
        priority: true,
        category: true,
        createdAt: true,
        updatedAt: true,
        resolvedAt: true,
        closedAt: true,
        assignedTo: {
          select: {
            name: true,
            email: true,
          }
        },
        activities: {
          where: {
            isInternal: false, // Only show public activities
          },
          select: {
            id: true,
            type: true,
            title: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                name: true,
              }
            }
          },
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    })

    if (!caseData) {
      return NextResponse.json(
        { error: "Case not found. Please check your case number and email address." },
        { status: 404 }
      )
    }

    // Calculate case age and estimated resolution time
    const caseAge = Math.floor((new Date().getTime() - caseData.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    
    // Simple SLA calculation (can be made more sophisticated)
    const getSLAInfo = (priority: string, createdAt: Date) => {
      const slaHours = {
        'LOW': 72,
        'MEDIUM': 48,
        'HIGH': 24,
        'URGENT': 8
      }[priority] || 48

      const dueDate = new Date(createdAt.getTime() + (slaHours * 60 * 60 * 1000))
      const isOverdue = new Date() > dueDate && !['RESOLVED', 'CLOSED'].includes(caseData.status)

      return {
        dueDate,
        isOverdue,
        slaHours
      }
    }

    const slaInfo = getSLAInfo(caseData.priority, caseData.createdAt)

    return NextResponse.json({
      case: {
        ...caseData,
        caseAge,
        slaInfo
      },
      statusInfo: {
        OPEN: "Your case has been received and is awaiting assignment.",
        IN_PROGRESS: "Your case is currently being investigated by our team.",
        RESOLVED: "Your case has been resolved. If you're satisfied, no further action is needed.",
        CLOSED: "Your case has been closed.",
        CANCELLED: "Your case has been cancelled."
      }[caseData.status]
    })

  } catch (error) {
    console.error("Error tracking case:", error)
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to track case. Please try again." },
      { status: 500 }
    )
  }
}