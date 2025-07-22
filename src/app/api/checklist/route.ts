import { NextRequest, NextResponse } from 'next/server'
import { ChecklistService } from '@/lib/checklist-service'
import { getAuthContext } from '@/lib/auth-middleware'
import type { 
  ChecklistRequest, 
  ChecklistApiResponse, 
  ChecklistApiError, 
  BusinessType,
  ServiceType,
  CompanySize
} from '@/types/checklist'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function isValidBusinessType(value: string): value is BusinessType {
  const validTypes: BusinessType[] = [
    'banking', 'insurance', 'fintech', 'payments', 'asset-management', 'microfinance'
  ]
  return validTypes.includes(value as BusinessType)
}

function isValidServiceType(value: string): value is ServiceType {
  const validTypes: ServiceType[] = [
    'deposit-taking', 'lending', 'payment-processing', 'foreign-exchange',
    'investment-advisory', 'insurance-underwriting', 'asset-custody', 'remittances',
    'cryptocurrency', 'mobile-money', 'peer-to-peer-lending'
  ]
  return validTypes.includes(value as ServiceType)
}

function isValidCompanySize(value: string): value is CompanySize {
  const validSizes: CompanySize[] = ['small', 'medium', 'large']
  return validSizes.includes(value as CompanySize)
}

export async function POST(request: NextRequest): Promise<NextResponse<ChecklistApiResponse | ChecklistApiError>> {
  try {
    // Parse and validate request body
    const body = await request.json()
    
    // Type-safe extraction with validation
    const businessType = body.businessType as string
    const serviceTypes = Array.isArray(body.serviceTypes) 
      ? body.serviceTypes as string[] 
      : []
    const location = typeof body.location === 'string' ? body.location : undefined
    const companySize = typeof body.companySize === 'string' ? body.companySize : undefined

    // Validation errors collection
    const validationErrors: Record<string, string[]> = {}

    // Validate business type
    if (!businessType) {
      validationErrors.businessType = ['Business type is required']
    } else if (!isValidBusinessType(businessType)) {
      validationErrors.businessType = [
        `Invalid business type. Must be one of: banking, insurance, fintech, payments, asset-management, microfinance`
      ]
    }

    // Validate service types
    if (!serviceTypes || serviceTypes.length === 0) {
      validationErrors.serviceTypes = ['At least one service type is required']
    } else {
      const invalidServices = serviceTypes.filter(service => !isValidServiceType(service))
      if (invalidServices.length > 0) {
        validationErrors.serviceTypes = [
          `Invalid service types: ${invalidServices.join(', ')}. Valid types are: deposit-taking, lending, payment-processing, foreign-exchange, investment-advisory, insurance-underwriting, asset-custody, remittances, cryptocurrency, mobile-money, peer-to-peer-lending`
        ]
      }
    }

    // Validate company size if provided
    if (companySize && !isValidCompanySize(companySize)) {
      validationErrors.companySize = ['Company size must be: small, medium, or large']
    }

    // Return validation errors if any
    if (Object.keys(validationErrors).length > 0) {
      const errorResponse: ChecklistApiError = {
        success: false,
        error: 'Validation failed',
        message: 'Invalid request parameters',
        validationErrors
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Get user authentication context
    const authContext = await getAuthContext(request)

    // Type-safe parameters for checklist generation
    const validatedRequest: ChecklistRequest = {
      businessType: businessType as BusinessType,
      serviceTypes: serviceTypes as ServiceType[],
      location,
      companySize: companySize as CompanySize | undefined
    }

    // Generate compliance checklist
    const checklist = await ChecklistService.generateComplianceChecklist(
      validatedRequest.businessType,
      validatedRequest.serviceTypes,
      {
        location: validatedRequest.location,
        companySize: validatedRequest.companySize,
        accountId: authContext.user?.id
      }
    )

    // Build successful response
    const response: ChecklistApiResponse = {
      success: true,
      checklist,
      downloadUrl: `/api/checklist/${checklist.generatedAt.getTime()}/download` // Optional PDF download
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Checklist generation failed:', error)

    const errorResponse: ChecklistApiError = {
      success: false,
      error: 'Checklist generation failed',
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// Optional: GET method to retrieve previously generated checklists
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const authContext = await getAuthContext(request)
    
    if (!authContext.isAuthenticated || !authContext.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Define the structure for recent checklist data
    interface RecentChecklistDownload {
      id: string
      downloadType: string
      timestamp: Date
    }

    // Get user's recent checklist generations from download history
    const recentChecklists: RecentChecklistDownload[] = await prisma.download.findMany({
      where: {
        accountId: authContext.user.id,
        downloadType: 'checklist'
      },
      orderBy: { timestamp: 'desc' },
      take: 10,
      select: {
        id: true,
        downloadType: true,
        timestamp: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      recentChecklists 
    })

  } catch (error) {
    console.error('Failed to get checklist history:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve checklist history' },
      { status: 500 }
    )
  }
}