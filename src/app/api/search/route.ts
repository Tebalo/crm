import { NextRequest, NextResponse } from 'next/server'
import { DocumentType } from '@prisma/client'
import { SearchService } from '@/lib/search-service'
import { getAuthContext } from '@/lib/auth-middleware'
import type { 
  SearchFilters, 
  SearchApiResponse, 
  SearchApiError,
  SearchContext 
} from '@/types/search'

export async function GET(request: NextRequest): Promise<NextResponse<SearchApiResponse | SearchApiError>> {
  try {
    // Parse search parameters
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') ?? ''
    const page = parseInt(searchParams.get('page') ?? '1')
    const authorities = searchParams.getAll('authority')
    const types = searchParams.getAll('type') as DocumentType[]
    const categories = searchParams.getAll('category')
    
    // Parse date range if provided
    let dateRange: { from: Date; to: Date } | undefined
    const fromDate = searchParams.get('from')
    const toDate = searchParams.get('to')
    if (fromDate && toDate) {
      dateRange = {
        from: new Date(fromDate),
        to: new Date(toDate)
      }
    }

    // Get user authentication context
    const authContext = await getAuthContext(request)

    // Build filters object
    const filters: SearchFilters = {
      authorities: authorities.length > 0 ? authorities : undefined,
      documentTypes: types.length > 0 ? types : undefined,
      categories: categories.length > 0 ? categories : undefined,
      dateRange
    }

    // Execute search
    const results = await SearchService.searchDocuments(
      query,
      filters,
      { page, limit: 20 },
      authContext.user?.id
    )

    // Build user context for response
    const userContext: SearchContext = {
      isAuthenticated: authContext.isAuthenticated,
      accountId: authContext.user?.id,
      userEmail: authContext.user?.email,
      userName: authContext.user?.name
    }

    // Build response
    const responseData: SearchApiResponse = {
      ...results,
      userContext
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Search API error:', error)
    
    const errorResponse: SearchApiError = {
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// POST method for complex search queries
export async function POST(request: NextRequest): Promise<NextResponse<SearchApiResponse | SearchApiError>> {
  try {
    const body = await request.json()
    
    // Validate and extract search parameters with proper types
    const { 
      query = '', 
      filters = {}, 
      page = 1, 
      limit = 20 
    }: {
      query?: string
      filters?: SearchFilters
      page?: number
      limit?: number
    } = body

    // Get user authentication context
    const authContext = await getAuthContext(request)

    // Execute search
    const results = await SearchService.searchDocuments(
      query,
      filters,
      { page, limit },
      authContext.user?.id
    )

    // Build user context for response
    const userContext: SearchContext = {
      isAuthenticated: authContext.isAuthenticated,
      accountId: authContext.user?.id,
      userEmail: authContext.user?.email,
      userName: authContext.user?.name
    }

    // Build response
    const responseData: SearchApiResponse = {
      ...results,
      userContext
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Search POST API error:', error)
    
    const errorResponse: SearchApiError = {
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}