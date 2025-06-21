import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { feedbackSchema } from "@/lib/validations/auth"
import { generateCaseNumber } from "@/lib/utils"
import { ActivityType, CaseSource } from "@prisma/client"

// POST /api/feedback - Submit public feedback (no authentication required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = feedbackSchema.parse(body)

    // Generate unique case number
    const caseNumber = generateCaseNumber()

    // Create case with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the case
      const newCase = await tx.case.create({
        data: {
          title: validatedData.title,
          description: validatedData.description,
          contactName: validatedData.contactName,
          contactEmail: validatedData.contactEmail,
          contactPhone: validatedData.contactPhone,
          category: validatedData.category || "General Feedback",
          source: CaseSource.WEB_FORM,
          caseNumber,
          priority: "MEDIUM", // Default priority for public feedback
        }
      })

      // Create initial activity
      await tx.caseActivity.create({
        data: {
          caseId: newCase.id,
          type: ActivityType.CREATED,
          title: "Feedback Received",
          content: `Feedback submitted via web form by ${validatedData.contactName}`,
        }
      })

      return newCase
    })

    // Return case number for tracking
    return NextResponse.json({
      message: "Feedback submitted successfully",
      caseNumber: result.caseNumber,
      caseId: result.id,
      trackingInfo: {
        message: "Your feedback has been received. You can track its progress using the case number provided.",
        caseNumber: result.caseNumber
      }
    })

  } catch (error) {
    console.error("Error submitting feedback:", error)
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to submit feedback. Please try again." },
      { status: 500 }
    )
  }
}