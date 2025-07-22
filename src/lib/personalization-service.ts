import { PrismaClient } from '@prisma/client'
import type {
  DashboardData,
  UserWithPreferences,
  Recommendation,
  RecentUpdate,
  QuickAction,
  SearchHistoryItem,
  DownloadItem
} from '@/types/personalization'

const prisma = new PrismaClient()

export class PersonalizationService {
  static async getPersonalizedDashboard(accountId: string): Promise<DashboardData> {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: {
        preferences: true,
        searchHistory: {
          take: 10,
          orderBy: { timestamp: 'desc' },
          select: {
            query: true,
            timestamp: true,
            resultCount: true
          }
        },
        downloads: {
          take: 5,
          orderBy: { timestamp: 'desc' },
          select: {
            timestamp: true,
            document: {
              select: {
                title: true
              }
            }
          }
        }
      }
    })

    if (!account) {
      throw new Error('Account not found')
    }

    // Transform the account data to match our expected type
    const userWithPreferences: UserWithPreferences = {
      id: account.id,
      name: account.name,
      email: account.email,
      preferences: account.preferences ? {
        businessType: account.preferences.businessType,
        preferredAuthorities: account.preferences.preferredAuthorities,
        experienceLevel: account.preferences.experienceLevel
      } : null,
      searchHistory: account.searchHistory as SearchHistoryItem[],
      downloads: account.downloads as DownloadItem[]
    }

    // Get personalized recommendations
    const recommendations = await this.getRecommendations(userWithPreferences)
    
    // Get relevant updates
    const updates = await this.getRelevantUpdates(userWithPreferences)

    return {
      user: {
        id: userWithPreferences.id,
        name: userWithPreferences.name || userWithPreferences.email,
        email: userWithPreferences.email,
        preferences: userWithPreferences.preferences
      },
      recommendations,
      updates,
      quickActions: this.getQuickActions(userWithPreferences.preferences),
      recentActivity: {
        searches: userWithPreferences.searchHistory,
        downloads: userWithPreferences.downloads
      }
    }
  }

  private static async getRecommendations(account: UserWithPreferences): Promise<Recommendation[]> {
    const prefs = account.preferences
    if (!prefs) return []

    try {
      const documents = await prisma.document.findMany({
        where: {
          OR: [
            // Recommendations based on business type
            prefs.businessType ? { 
              category: { equals: prefs.businessType } 
            } : {},
            // Recommendations based on preferred authorities
            prefs.preferredAuthorities.length > 0 ? {
              authority: { 
                code: { in: prefs.preferredAuthorities } 
              }
            } : {},
            // Recommendations based on search history
            account.searchHistory.length > 0 ? {
              tags: { 
                hasSome: account.searchHistory.map(s => s.query).slice(0, 5) // Limit to recent searches
              }
            } : {}
          ].filter(condition => Object.keys(condition).length > 0) // Remove empty conditions
        },
        include: { 
          authority: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        },
        take: 5,
        orderBy: { createdAt: 'desc' }
      })

      return documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        authority: doc.authority,
        createdAt: doc.createdAt
      }))
    } catch (error) {
      console.error('Failed to get recommendations:', error)
      return []
    }
  }

  private static async getRelevantUpdates(account: UserWithPreferences): Promise<RecentUpdate[]> {
    const prefs = account.preferences
    if (!prefs) return []

    try {
      const documents = await prisma.document.findMany({
        where: {
          AND: [
            { 
              createdAt: { 
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
              } 
            },
            {
              OR: [
                // Updates from preferred authorities
                prefs.preferredAuthorities.length > 0 ? {
                  authority: { 
                    code: { in: prefs.preferredAuthorities } 
                  }
                } : {},
                // Updates in user's business category
                prefs.businessType ? {
                  category: { equals: prefs.businessType }
                } : {}
              ].filter(condition => Object.keys(condition).length > 0)
            }
          ]
        },
        include: { 
          authority: {
            select: {
              name: true
            }
          }
        },
        take: 5,
        orderBy: { createdAt: 'desc' }
      })

      return documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        authority: {
          name: doc.authority.name
        },
        createdAt: doc.createdAt
      }))
    } catch (error) {
      console.error('Failed to get relevant updates:', error)
      return []
    }
  }

  private static getQuickActions(preferences: UserWithPreferences['preferences']): QuickAction[] {
    const actions: QuickAction[] = [
      { title: 'Search Documents', href: '/search', icon: 'search' },
      { title: 'Generate Checklist', href: '/checklist', icon: 'list' }
    ]

    if (preferences?.businessType) {
      actions.push({
        title: `${preferences.businessType} Requirements`,
        href: `/requirements/${preferences.businessType}`,
        icon: 'document'
      })
    }

    return actions
  }

  /**
   * Save or update user preferences
   */
  static async saveUserPreferences(
    accountId: string, 
    preferences: {
      preferredAuthorities?: string[]
      businessType?: string
      experienceLevel?: string
      notificationSettings?: Record<string, unknown>
      dashboardLayout?: Record<string, unknown>
    }
  ): Promise<void> {
    try {
      await prisma.userPreferences.upsert({
        where: { accountId },
        update: {
          ...preferences,
          notificationSettings: JSON.stringify(preferences.notificationSettings || {}),
          dashboardLayout: JSON.stringify(preferences.dashboardLayout || {})
        },
        create: {
          accountId,
          preferredAuthorities: preferences.preferredAuthorities || [],
          businessType: preferences.businessType,
          experienceLevel: preferences.experienceLevel,
          notificationSettings: JSON.stringify(preferences.notificationSettings || {}),
          dashboardLayout: JSON.stringify(preferences.dashboardLayout || {})
        }
      })
    } catch (error) {
      console.error('Failed to save user preferences:', error)
      throw new Error('Failed to save preferences')
    }
  }

  /**
   * Get user preferences
   */
  static async getUserPreferences(accountId: string) {
    try {
      const preferences = await prisma.userPreferences.findUnique({
        where: { accountId }
      })

      return preferences
    } catch (error) {
      console.error('Failed to get user preferences:', error)
      return null
    }
  }

  /**
   * Create subscription for document updates
   */
  static async createSubscription(
    accountId: string,
    subscriptionData: {
      type: 'DOCUMENT_UPDATES' | 'NEW_REGULATIONS' | 'AUTHORITY_NEWS' | 'COMPLIANCE_REMINDERS'
      categories: string[]
      authorities: string[]
      frequency?: string
    }
  ): Promise<void> {
    try {
      await prisma.subscription.create({
        data: {
          accountId,
          type: subscriptionData.type,
          categories: subscriptionData.categories,
          authorities: subscriptionData.authorities,
          frequency: subscriptionData.frequency || 'immediate'
        }
      })
    } catch (error) {
      console.error('Failed to create subscription:', error)
      throw new Error('Failed to create subscription')
    }
  }

  /**
   * Get user subscriptions
   */
  static async getUserSubscriptions(accountId: string) {
    try {
      const subscriptions = await prisma.subscription.findMany({
        where: { accountId, active: true },
        orderBy: { createdAt: 'desc' }
      })

      return subscriptions
    } catch (error) {
      console.error('Failed to get user subscriptions:', error)
      return []
    }
  }
}