export interface AuthorityContactInfo {
  phone?: string
  email?: string
  address?: string
  website?: string
  applicationPortal?: string
  officeHours?: string
  emergencyContact?: string
  fax?: string
  postalAddress?: string
  physicalAddress?: string
}

export interface AuthorityFormData {
  name: string
  code: string
  description?: string
  website?: string
  contactInfo: AuthorityContactInfo
}

export interface RegulatoryAuthorityWithStats {
  id: string
  name: string
  code: string
  description?: string
  website?: string
  contactInfo: AuthorityContactInfo
  createdAt: Date
  updatedAt: Date
  _count: {
    documents: number
    faqs: number
  }
}

export interface AuthorityValidationError {
  field: string
  message: string
}

export interface AuthorityApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: AuthorityValidationError[]
}