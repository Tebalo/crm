import { PrismaClient } from '@prisma/client'
// import { getAuthContext } from '@/lib/auth-middleware'
import type {
  ComplianceChecklist,
  ChecklistRequirement,
  AuthorityChecklist,
  ChecklistSummary,
  BusinessType,
  ServiceType,
  //CompanySize,
  TimelinePhase,
  RequirementWithDocument,
  ChecklistGenerationOptions,
  AuthorityContactInfo,
  AuthorityCode
} from '@/types/checklist'

const prisma = new PrismaClient()

export class ChecklistService {
  private static readonly VALID_BUSINESS_TYPES: BusinessType[] = [
    'banking', 'insurance', 'fintech', 'payments', 'asset-management', 'microfinance'
  ]

  private static readonly VALID_SERVICE_TYPES: ServiceType[] = [
    'deposit-taking', 'lending', 'payment-processing', 'foreign-exchange',
    'investment-advisory', 'insurance-underwriting', 'asset-custody', 'remittances',
    'cryptocurrency', 'mobile-money', 'peer-to-peer-lending'
  ]

  /**
   * Generate compliance checklist based on business type and services
   */
  static async generateComplianceChecklist(
    businessType: BusinessType,
    serviceTypes: ServiceType[],
    options: ChecklistGenerationOptions = {}
  ): Promise<ComplianceChecklist> {
    try {
      // Validate inputs
      this.validateChecklistRequest(businessType, serviceTypes)

      // Find all applicable requirements
      const requirements = await this.findApplicableRequirements(businessType, serviceTypes)

      // Group requirements by authority
      const authoritiesMap = await this.groupRequirementsByAuthority(requirements)

      // Calculate summary statistics
      const summary = this.calculateChecklistSummary(requirements, authoritiesMap)

      // Generate timeline
      const timeline = this.generateImplementationTimeline(authoritiesMap)

      // Generate next steps
      const nextSteps = this.generateNextSteps(authoritiesMap)

      const checklist: ComplianceChecklist = {
        businessType,
        serviceTypes,
        authorities: Object.values(authoritiesMap),
        summary,
        generatedAt: new Date(),
        nextSteps,
        timeline
      }

      // Save checklist generation to analytics if user is authenticated
      if (options.accountId) {
        await this.saveChecklistGeneration(options.accountId, checklist)
      }

      return checklist
    } catch (error) {
      console.error('Checklist generation failed:', error)
      throw new Error('Failed to generate compliance checklist')
    }
  }

  /**
   * Validate checklist request parameters
   */
  private static validateChecklistRequest(businessType: BusinessType, serviceTypes: ServiceType[]): void {
    if (!businessType || !this.VALID_BUSINESS_TYPES.includes(businessType)) {
      throw new Error(`Invalid business type. Must be one of: ${this.VALID_BUSINESS_TYPES.join(', ')}`)
    }

    if (!serviceTypes || serviceTypes.length === 0) {
      throw new Error('At least one service type must be specified')
    }

    const invalidServices = serviceTypes.filter(service => !this.VALID_SERVICE_TYPES.includes(service))
    if (invalidServices.length > 0) {
      throw new Error(`Invalid service types: ${invalidServices.join(', ')}`)
    }
  }

  /**
   * Find all applicable compliance requirements
   */
  private static async findApplicableRequirements(
    businessType: BusinessType, 
    serviceTypes: ServiceType[]
  ): Promise<RequirementWithDocument[]> {
    const requirements = await prisma.complianceRequirement.findMany({
      where: {
        AND: [
          { businessTypes: { hasSome: [businessType] } },
          { serviceTypes: { hasSome: serviceTypes } }
        ]
      },
      include: {
        document: {
          include: { 
            authority: {
              select: {
                id: true,
                name: true,
                code: true,
                website: true,
                contactInfo: true
              }
            }
          }
        }
      },
      orderBy: [
        { mandatory: 'desc' },
        { estimatedCost: 'asc' }
      ]
    })

    return requirements
  }

  /**
   * Group requirements by regulatory authority
   */
  private static async groupRequirementsByAuthority(
    requirements: RequirementWithDocument[]
  ): Promise<Record<string, AuthorityChecklist>> {
    const authoritiesMap: Record<string, AuthorityChecklist> = {}

    for (const req of requirements) {
      const authorityCode = req.document.authority.code

      if (!authoritiesMap[authorityCode]) {
        // Parse contact info safely
        const contactInfo = this.parseContactInfo(req.document.authority.contactInfo)
        
        authoritiesMap[authorityCode] = {
          authority: {
            id: req.document.authority.id,
            name: req.document.authority.name,
            code: req.document.authority.code as AuthorityCode,
            website: req.document.authority.website || undefined,
            contactInfo
          },
          requirements: []
        }
      }

      const checklistReq: ChecklistRequirement = {
        id: req.id,
        title: req.title,
        description: req.description,
        mandatory: req.mandatory,
        estimatedCost: req.estimatedCost || undefined,
        estimatedTimeframe: req.estimatedTimeframe || undefined,
        dependencies: req.dependencies,
        authority: {
          id: req.document.authority.id,
          name: req.document.authority.name,
          code: req.document.authority.code as AuthorityCode,
          website: req.document.authority.website || undefined
        },
        document: {
          id: req.document.id,
          title: req.document.title,
          type: req.document.type,
          fileUrl: req.document.fileUrl || undefined
        },
        forms: await this.getRequiredForms(req.id),
        documents: await this.getRequiredDocuments(req.id)
      }

      authoritiesMap[authorityCode].requirements.push(checklistReq)
    }

    return authoritiesMap
  }

  /**
   * Parse contact info from JSON safely
   */
  private static parseContactInfo(contactInfo: unknown): AuthorityContactInfo | undefined {
    if (!contactInfo || typeof contactInfo !== 'object') {
      return undefined
    }

    const info = contactInfo as Record<string, unknown>
    
    return {
      phone: typeof info.phone === 'string' ? info.phone : undefined,
      email: typeof info.email === 'string' ? info.email : undefined,
      address: typeof info.address === 'string' ? info.address : undefined,
      website: typeof info.website === 'string' ? info.website : undefined,
      applicationPortal: typeof info.applicationPortal === 'string' ? info.applicationPortal : undefined
    }
  }

  /**
   * Get required forms for a requirement
   */
  private static async getRequiredForms(requirementId: string): Promise<string[]> {
    try {
      const forms = await prisma.document.findMany({
        where: {
          AND: [
            { type: 'FORM' },
            { requirements: { some: { id: requirementId } } }
          ]
        },
        select: { title: true }
      })

      return forms.map(form => form.title)
    } catch (error) {
      console.error('Failed to get required forms:', error)
      return []
    }
  }

  /**
   * Get required documents for a requirement
   */
  private static async getRequiredDocuments(requirementId: string): Promise<string[]> {
    try {
      const documents = await prisma.document.findMany({
        where: {
          requirements: { some: { id: requirementId } }
        },
        select: { title: true }
      })

      return documents.map(doc => doc.title)
    } catch (error) {
      console.error('Failed to get required documents:', error)
      return []
    }
  }

  /**
   * Calculate checklist summary statistics
   */
  private static calculateChecklistSummary(
    requirements: RequirementWithDocument[], 
    authoritiesMap: Record<string, AuthorityChecklist>
  ): ChecklistSummary {
    const totalRequirements = requirements.length
    const mandatoryCount = requirements.filter(r => r.mandatory).length
    const optionalCount = totalRequirements - mandatoryCount

    const estimatedCost = requirements
      .filter(r => r.estimatedCost)
      .reduce((sum, r) => sum + (r.estimatedCost || 0), 0)

    const estimatedTimeframe = this.calculateOverallTimeframe(requirements)
    const authoritiesInvolved = Object.keys(authoritiesMap).length

    return {
      totalRequirements,
      mandatoryCount,
      optionalCount,
      estimatedCost,
      estimatedTimeframe,
      authoritiesInvolved
    }
  }

  /**
   * Calculate overall implementation timeframe
   */
  private static calculateOverallTimeframe(requirements: RequirementWithDocument[]): string {
    const timeframes = requirements
      .map(r => r.estimatedTimeframe)
      .filter((timeframe): timeframe is string => Boolean(timeframe))

    if (timeframes.length === 0) return "To be determined"

    // Extract weeks and find maximum (assuming some overlap is possible)
    const weeks = timeframes.map(t => {
      const match = t.match(/(\d+)-?(\d+)?\s*weeks?/i)
      return match ? parseInt(match[2] || match[1]) : 4
    })

    const maxWeeks = Math.max(...weeks)
    const minWeeks = Math.ceil(maxWeeks * 0.7) // Assume some parallelization

    return `${minWeeks}-${maxWeeks} weeks`
  }

  /**
   * Generate implementation timeline
   */
  private static generateImplementationTimeline(authoritiesMap: Record<string, AuthorityChecklist>): TimelinePhase[] {
    const timeline: TimelinePhase[] = [
      {
        phase: "Preparation",
        description: "Gather required documentation and establish corporate structure",
        duration: "2-4 weeks",
        requirements: ["Corporate registration", "Business plan", "Financial projections"]
      },
      {
        phase: "Application Submission",
        description: "Submit applications to relevant regulatory authorities",
        duration: "1-2 weeks",
        requirements: Object.values(authoritiesMap).map(auth => 
          `${auth.authority.name} application`
        )
      },
      {
        phase: "Review Process",
        description: "Regulatory review and potential requests for additional information",
        duration: "8-16 weeks",
        requirements: ["Respond to regulator queries", "Provide additional documentation"]
      },
      {
        phase: "Final Approval",
        description: "Receive licenses and begin operations",
        duration: "2-4 weeks",
        requirements: ["License issuance", "Compliance setup", "Operational readiness"]
      }
    ]

    return timeline
  }

  /**
   * Generate actionable next steps
   */
  private static generateNextSteps(authoritiesMap: Record<string, AuthorityChecklist>): string[] {
    const steps = [
      "Review all mandatory requirements carefully",
      "Ensure your business structure meets regulatory requirements",
      "Prepare required documentation and forms"
    ]

    Object.values(authoritiesMap).forEach(auth => {
      steps.push(`Contact ${auth.authority.name} for specific guidance`)
    })

    steps.push(
      "Consider engaging a regulatory consultant or lawyer",
      "Set up compliance monitoring systems",
      "Plan for ongoing regulatory reporting requirements"
    )

    return steps
  }

  /**
   * Save checklist generation for analytics
   */
  private static async saveChecklistGeneration(
    accountId: string, 
    checklist: ComplianceChecklist
  ): Promise<void> {
    try {
      // This could be saved to a separate analytics table
      await prisma.download.create({
        data: {
          accountId,
          documentId: 'checklist-generated', // Placeholder
          downloadType: 'checklist',
          timestamp: new Date()
        }
      }).catch(() => {
        // Ignore download tracking errors
      })
    } catch (error) {
      console.error('Failed to save checklist generation:', error)
      // Don't throw - checklist generation should succeed even if analytics fail
    }
  }
}
