
// import { PrismaClient} from '@prisma/client'
import type {
  SearchFilters,
  SearchResult,
  PaginationOptions,
  DocumentWithRelations,
  SearchFacets,
  SearchHistoryEntry,
  PopularSearch,
  AdvancedSearchParams,
  AdvancedSearchResult,
  DocumentWhereInput
} from '@/types/search'
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export class SearchService {
  /**
   * Main search function for documents
   */
  static async searchDocuments(
    query: string,
    filters: SearchFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 20 },
    accountId?: string
  ): Promise<SearchResult> {
    const { page, limit } = pagination
    const offset = (page - 1) * limit

    try {
      // Build the search WHERE clause
      const where = this.buildSearchWhere(query, filters)

      // Execute search with pagination
      const [documents, totalCount] = await Promise.all([
        prisma.document.findMany({
          where,
          include: {
            authority: {
              select: {
                id: true,
                name: true,
                code: true,
                website: true
              }
            },
            requirements: {
              select: {
                id: true,
                title: true,
                mandatory: true,
                businessTypes: true,
                serviceTypes: true
              }
            }
          },
          skip: offset,
          take: limit,
          orderBy: [
            { createdAt: 'desc' },
            { title: 'asc' }
          ]
        }) as Promise<DocumentWithRelations[]>,
        prisma.document.count({ where })
      ])

      // Save search history for authenticated users
      if (accountId && query.trim()) {
        await this.saveSearchHistory(accountId, query, filters, totalCount)
      }

      // Generate facets for the UI
      const facets = await this.generateSearchFacets(where)

      return {
        documents,
        totalCount,
        facets
      }
    } catch (error) {
      console.error('Document search failed:', error)
      throw new Error('Search operation failed')
    }
  }

  /**
   * Build the Prisma WHERE clause for document search
   */
  private static buildSearchWhere(query: string, filters: SearchFilters): DocumentWhereInput {
    const conditions: DocumentWhereInput[] = []

    // Text search across multiple fields
    if (query.trim()) {
      const searchTerms = query.trim().split(' ').filter(term => term.length > 0)
      
      conditions.push({
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: searchTerms } },
          { category: { contains: query, mode: 'insensitive' } },
          { subcategory: { contains: query, mode: 'insensitive' } }
        ]
      })
    }

    // Authority filter
    if (filters.authorities?.length) {
      conditions.push({
        authority: { 
          code: { in: filters.authorities } 
        }
      })
    }

    // Document type filter
    if (filters.documentTypes?.length) {
      conditions.push({
        type: { in: filters.documentTypes }
      })
    }

    // Category filter
    if (filters.categories?.length) {
      conditions.push({
        category: { in: filters.categories }
      })
    }

    // Business type filter (searches in requirements)
    if (filters.businessTypes?.length) {
      conditions.push({
        requirements: {
          some: {
            businessTypes: {
              hasSome: filters.businessTypes
            }
          }
        }
      })
    }

    // Date range filter
    if (filters.dateRange) {
      conditions.push({
        createdAt: {
          gte: filters.dateRange.from,
          lte: filters.dateRange.to
        }
      })
    }

    return conditions.length > 0 ? { AND: conditions } : {}
  }

  /**
   * Generate search facets for filtering UI
   */
  private static async generateSearchFacets(baseWhere: DocumentWhereInput): Promise<SearchFacets> {
    try {
      const [authorities, types, categories] = await Promise.all([
        // Authority facets
        prisma.document.groupBy({
          by: ['authorityId'],
          where: baseWhere,
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } }
        }),
        // Document type facets
        prisma.document.groupBy({
          by: ['type'],
          where: baseWhere,
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } }
        }),
        // Category facets
        prisma.document.groupBy({
          by: ['category'],
          where: baseWhere,
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } }
        })
      ])

      // Get authority names
      const authorityIds = authorities.map(a => a.authorityId)
      const authorityData = await prisma.regulatoryAuthority.findMany({
        where: { id: { in: authorityIds } },
        select: { id: true, name: true, code: true }
      })

      const authorityMap = new Map(
        authorityData.map(auth => [auth.id, auth.name])
      )

      return {
        authorities: authorities.map(a => ({
          name: authorityMap.get(a.authorityId) ?? 'Unknown Authority',
          count: a._count.id
        })),
        types: types.map(t => ({
          name: t.type,
          count: t._count.id
        })),
        categories: categories.map(c => ({
          name: c.category,
          count: c._count.id
        }))
      }
    } catch (error) {
      console.error('Failed to generate search facets:', error)
      return {
        authorities: [],
        types: [],
        categories: []
      }
    }
  }

  /**
   * Save search history for authenticated users
   */
  private static async saveSearchHistory(
    accountId: string,
    query: string,
    filters: SearchFilters,
    resultCount: number
  ): Promise<void> {
    try {
      // Ensure account exists first
      await prisma.account.upsert({
        where: { id: accountId },
        update: {},
        create: {
          id: accountId,
          email: 'external@user.com', // Will be updated by session
          name: 'External User'
        }
      })

      // Save search history
      await prisma.searchHistory.create({
        data: {
          accountId,
          query,
          filters: filters as Prisma.JsonObject,
          resultCount
        }
      })
    } catch (error) {
      console.error('Failed to save search history:', error)
      // Don't throw - search should continue even if history fails
    }
  }

  /**
   * Get popular search terms
   */
  static async getPopularSearches(limit: number = 10): Promise<PopularSearch[]> {
    try {
      const popularSearches = await prisma.searchHistory.groupBy({
        by: ['query'],
        _count: { query: true },
        where: {
          query: { not: '' },
          timestamp: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        orderBy: { _count: { query: 'desc' } },
        take: limit
      })

      return popularSearches.map(search => ({
        query: search.query,
        count: search._count.query
      }))
    } catch (error) {
      console.error('Failed to get popular searches:', error)
      return []
    }
  }

  /**
   * Get user's recent searches
   */
  static async getUserRecentSearches(accountId: string, limit: number = 10): Promise<SearchHistoryEntry[]> {
    try {
      const recentSearches = await prisma.searchHistory.findMany({
        where: { accountId },
        orderBy: { timestamp: 'desc' },
        take: limit,
        select: {
          query: true,
          timestamp: true,
          resultCount: true
        }
      })

      return recentSearches
    } catch (error) {
      console.error('Failed to get user recent searches:', error)
      return []
    }
  }

  /**
   * Advanced search with more complex filtering
   */
  static async advancedSearch(
    searchParams: AdvancedSearchParams,
    pagination: PaginationOptions = { page: 1, limit: 20 }
  ): Promise<AdvancedSearchResult> {
    
    const { page, limit } = pagination
    const offset = (page - 1) * limit

    const conditions: DocumentWhereInput[] = []

    // Handle different query types
    if (searchParams.exactPhrase) {
      conditions.push({
        OR: [
          { title: { contains: searchParams.exactPhrase, mode: 'insensitive' } },
          { description: { contains: searchParams.exactPhrase, mode: 'insensitive' } },
          { content: { contains: searchParams.exactPhrase, mode: 'insensitive' } }
        ]
      })
    }

    if (searchParams.anyWords?.length) {
      const wordConditions = searchParams.anyWords.map(word => ({
        title: { contains: word, mode: Prisma.QueryMode.insensitive },
        description: { contains: word, mode: Prisma.QueryMode.insensitive },
        content: { contains: word, mode: Prisma.QueryMode.insensitive }
      }));

      conditions.push({
        OR: wordConditions.map(cond => [
          { title: cond.title },
          { description: cond.description },
          { content: cond.content }
        ]).flat()
      });
    }

    if (searchParams.excludeWords?.length) {
      searchParams.excludeWords.forEach(word => {
        conditions.push({
          AND: [
            { title: { not: { contains: word } } },
            { description: { not: { contains: word } } },
            { content: { not: { contains: word } } }
          ]
        })
      })
    }

    // Add other filters
    if (searchParams.authority) {
      conditions.push({ authority: { code: searchParams.authority } })
    }

    if (searchParams.documentType) {
      conditions.push({ type: searchParams.documentType })
    }

    if (searchParams.category) {
      conditions.push({ category: searchParams.category })
    }

    if (searchParams.dateFrom || searchParams.dateTo) {
      const dateFilter: Prisma.DateTimeFilter = {}
      if (searchParams.dateFrom) dateFilter.gte = searchParams.dateFrom
      if (searchParams.dateTo) dateFilter.lte = searchParams.dateTo
      conditions.push({ createdAt: dateFilter })
    }

    if (searchParams.tags?.length) {
      conditions.push({ tags: { hasSome: searchParams.tags } })
    }

    const where: DocumentWhereInput = conditions.length > 0 ? { AND: conditions } : {}

    try {
      const [documents, totalCount] = await Promise.all([
        prisma.document.findMany({
          where,
          include: {
            authority: {
              select: {
                id: true,
                name: true,
                code: true,
                website: true
              }
            },
            requirements: {
              select: {
                id: true,
                title: true,
                mandatory: true,
                businessTypes: true,
                serviceTypes: true
              }
            }
          },
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }) as Promise<DocumentWithRelations[]>,
        prisma.document.count({ where })
      ])

      return {
        documents,
        totalCount,
        searchParams
      }
    } catch (error) {
      console.error('Advanced search failed:', error)
      throw new Error('Advanced search operation failed')
    }
  }
}