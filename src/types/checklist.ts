import { DocumentType, Prisma } from '@prisma/client'

export type BusinessType = 'banking' | 'insurance' | 'fintech' | 'payments' | 'asset-management' | 'microfinance'

export type ServiceType = 
  | 'deposit-taking' 
  | 'lending' 
  | 'payment-processing' 
  | 'foreign-exchange'
  | 'investment-advisory' 
  | 'insurance-underwriting' 
  | 'asset-custody' 
  | 'remittances'
  | 'cryptocurrency' 
  | 'mobile-money' 
  | 'peer-to-peer-lending'

export type CompanySize = 'small' | 'medium' | 'large'

export type AuthorityCode = 'BOB' | 'NBFIRA' | 'FIA'

// Authority information structure
export interface Authority {
  id: string
  name: string
  code: AuthorityCode
  website?: string
}

// Contact information structure
export interface AuthorityContactInfo {
  phone?: string
  email?: string
  address?: string
  website?: string
  applicationPortal?: string
  officeHours?: string
  emergencyContact?: string
}

// Document reference structure
export interface DocumentReference {
  id: string
  title: string
  type: DocumentType
  fileUrl?: string
}

// Timeline phase structure
export interface TimelinePhase {
  phase: string
  description: string
  duration: string
  requirements: string[]
}

// Individual requirement in checklist
export interface ChecklistRequirement {
  id: string
  title: string
  description: string
  mandatory: boolean
  estimatedCost?: number
  estimatedTimeframe?: string
  dependencies: string[]
  authority: Authority
  document: DocumentReference
  forms: string[]
  documents: string[]
}

// Authority-specific checklist section
export interface AuthorityChecklist {
  authority: {
    id: string
    name: string
    code: AuthorityCode
    website?: string
    contactInfo?: AuthorityContactInfo
  }
  requirements: ChecklistRequirement[]
}

// Summary statistics for checklist
export interface ChecklistSummary {
  totalRequirements: number
  mandatoryCount: number
  optionalCount: number
  estimatedCost: number
  estimatedTimeframe: string
  authoritiesInvolved: number
}

// Complete compliance checklist structure
export interface ComplianceChecklist {
  businessType: BusinessType
  serviceTypes: ServiceType[]
  authorities: AuthorityChecklist[]
  summary: ChecklistSummary
  generatedAt: Date
  nextSteps: string[]
  timeline: TimelinePhase[]
}

// API request structure
export interface ChecklistRequest {
  businessType: BusinessType
  serviceTypes: ServiceType[]
  location?: string
  companySize?: CompanySize
}

// Successful API response
export interface ChecklistApiResponse {
  success: true
  checklist: ComplianceChecklist
  downloadUrl?: string
}

// Error API response
export interface ChecklistApiError {
  success: false
  error: string
  message: string
  validationErrors?: Record<string, string[]>
}

// Options for checklist generation
export interface ChecklistGenerationOptions {
  location?: string
  companySize?: CompanySize
  accountId?: string
}

// Prisma types for requirements with relations
export type RequirementWithDocument = Prisma.ComplianceRequirementGetPayload<{
  include: {
    document: {
      include: {
        authority: {
          select: {
            id: true
            name: true
            code: true
            website: true
            contactInfo: true
          }
        }
      }
    }
  }
}>

export type DocumentWithAuthority = Prisma.DocumentGetPayload<{
  include: {
    authority: {
      select: {
        id: true
        name: true
        code: true
        website: true
      }
    }
  }
}>

// Recent checklist download structure
export interface RecentChecklistDownload {
  id: string
  downloadType: string
  timestamp: Date
}

// Checklist history response
export interface ChecklistHistoryResponse {
  success: true
  recentChecklists: RecentChecklistDownload[]
}

// Validation error structure
export interface ValidationErrors {
  businessType?: string[]
  serviceTypes?: string[]
  companySize?: string[]
  location?: string[]
}

// Extended checklist request with optional metadata
export interface ExtendedChecklistRequest extends ChecklistRequest {
  priority?: 'low' | 'medium' | 'high'
  targetLaunchDate?: Date
  existingLicenses?: string[]
  specialRequirements?: string[]
}

// Cost breakdown structure
export interface CostBreakdown {
  authorityCode: AuthorityCode
  authorityName: string
  applicationFees: number
  consultingFees?: number
  legalFees?: number
  miscellaneous?: number
  total: number
}

// Enhanced summary with cost breakdown
export interface EnhancedChecklistSummary extends ChecklistSummary {
  costBreakdown: CostBreakdown[]
  criticalPath: string[] // Requirements that can't be done in parallel
  optionalOptimizations: string[] // Suggestions to speed up process
}

// Dependency relationship structure
export interface RequirementDependency {
  requirementId: string
  dependsOn: string[]
  blockedBy: string[]
  canRunInParallel: string[]
}

// Progress tracking structure
export interface ChecklistProgress {
  checklistId: string
  accountId: string
  requirements: {
    requirementId: string
    status: 'not-started' | 'in-progress' | 'submitted' | 'approved' | 'rejected'
    submittedDate?: Date
    approvedDate?: Date
    notes?: string
  }[]
  overallProgress: number // Percentage
  estimatedCompletion?: Date
}

// Authority-specific guidance
export interface AuthorityGuidance {
  authorityCode: AuthorityCode
  keyContacts: {
    name: string
    role: string
    email?: string
    phone?: string
  }[]
  applicationProcess: string[]
  commonPitfalls: string[]
  timelineTips: string[]
  requiredMeetings?: {
    type: string
    when: string
    purpose: string
  }[]
}