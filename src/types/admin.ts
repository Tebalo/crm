import { DocumentType, Prisma } from '@prisma/client'

export type AdminRole = 'ADMIN' | 'AUTHORITY_ADMIN'

export interface DocumentFormData {
  title: string
  description?: string
  type: DocumentType
  category: string
  subcategory?: string
  tags: string[]
  authorityId: string
  version: string
  effectiveDate?: Date
  expiryDate?: Date
  file?: File
}

export interface ComplianceRequirementFormData {
  title: string
  description: string
  mandatory: boolean
  businessTypes: string[]
  serviceTypes: string[]
  documentId: string
  estimatedCost?: number
  estimatedTimeframe?: string
  dependencies: string[]
}

// Use Prisma's generated type to ensure compatibility
export type DocumentWithDetails = Prisma.DocumentGetPayload<{
  include: {
    authority: {
      select: {
        id: true
        name: true
        code: true
      }
    }
    requirements: {
      select: {
        id: true
        title: true
        mandatory: true
      }
    }
  }
}>

export interface AuthorityOption {
  id: string
  name: string
  code: string
}

export interface AdminStats {
  totalDocuments: number
  totalRequirements: number
  documentsByType: { type: DocumentType; count: number }[]
  documentsByAuthority: { authority: string; count: number }[]
  recentUploads: number
}

export interface UploadProgress {
  isUploading: boolean
  progress: number
  fileName?: string
}

export interface ValidationError {
  field: string
  message: string
}

export interface AdminApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: ValidationError[]
}

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
