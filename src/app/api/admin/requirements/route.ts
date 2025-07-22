import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireRole } from '@/lib/auth-middleware'
import type { AdminApiResponse, ComplianceRequirementFormData } from '@/types/admin'

const prisma = new PrismaClient()

export async function POST(request: NextRequest): Promise<NextResponse<AdminApiResponse>> {
  try {
    // Require admin role
    await requireRole(request, 'ADMIN')

    const data: ComplianceRequirementFormData = await request.json()

    // Validate required fields
    if (!data.title || !data.description || !data.documentId) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields',
        errors: [
          { field: 'title', message: 'Title is required' },
          { field: 'description', message: 'Description is required' },
          { field: 'documentId', message: 'Document is required' }
        ].filter(error => !data[error.field as keyof ComplianceRequirementFormData])
      }, { status: 400 })
    }

    // Create requirement
    const requirement = await prisma.complianceRequirement.create({
      data: {
        title: data.title,
        description: data.description,
        mandatory: data.mandatory,
        businessTypes: data.businessTypes,
        serviceTypes: data.serviceTypes,
        documentId: data.documentId,
        estimatedCost: data.estimatedCost,
        estimatedTimeframe: data.estimatedTimeframe,
        dependencies: data.dependencies
      }
    })

    return NextResponse.json({
      success: true,
      data: requirement,
      message: 'Requirement created successfully'
    })
  } catch (error) {
    console.error('Failed to create requirement:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to create requirement'
    }, { status: 500 })
  }
}
