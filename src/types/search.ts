import { DocumentType, Prisma } from '@prisma/client'

// Basic search interfaces
export interface SearchFilters {
  authorities?: string[]
  documentTypes?: DocumentType[]
  categories?: string[]
  businessTypes?: string[]
  dateRange?: {
    from: Date
    to: Date
  }
}

export interface PaginationOptions {
  page: number
  limit: number
}

export interface SearchFacet {
  name: string
  count: number
}

export interface SearchFacets {
  authorities: SearchFacet[]
  types: SearchFacet[]
  categories: SearchFacet[]
}

// Document with relations
export interface DocumentWithRelations {
  id: string
  title: string
  description: string | null
  content: string | null
  fileUrl: string | null
  fileName: string | null
  fileSize: number | null
  type: DocumentType
  category: string
  subcategory: string | null
  tags: string[]
  version: string
  effectiveDate: Date | null
  expiryDate: Date | null
  createdAt: Date
  updatedAt: Date
  authority: {
    id: string
    name: string
    code: string
    website: string | null
  }
  requirements: {
    id: string
    title: string
    mandatory: boolean
    businessTypes: string[]
    serviceTypes: string[]
  }[]
}

export interface SearchResult {
  documents: DocumentWithRelations[]
  totalCount: number
  facets: SearchFacets
}

// Search history
export interface SearchHistoryEntry {
  query: string
  timestamp: Date
  resultCount: number
}

export interface PopularSearch {
  query: string
  count: number
}

// Advanced search parameters
export interface AdvancedSearchParams {
  query?: string
  exactPhrase?: string
  anyWords?: string[]
  excludeWords?: string[]
  authority?: string
  documentType?: DocumentType
  category?: string
  dateFrom?: Date
  dateTo?: Date
  tags?: string[]
}

export interface AdvancedSearchResult {
  documents: DocumentWithRelations[]
  totalCount: number
  searchParams: AdvancedSearchParams
}

// Prisma where clause type for documents
export type DocumentWhereInput = Prisma.DocumentWhereInput

// Search context
export interface SearchContext {
  isAuthenticated: boolean
  accountId?: string
  userEmail?: string
  userName?: string
}

// API response types
export interface SearchApiResponse {
  documents: DocumentWithRelations[]
  totalCount: number
  facets: SearchFacets
  userContext: SearchContext
}

export interface SearchApiError {
  error: string
  message: string
}