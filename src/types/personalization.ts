export interface QuickAction {
  title: string
  href: string
  icon: string
}

export interface Recommendation {
  id: string
  title: string
  authority: {
    id: string
    name: string
    code: string
  }
  createdAt: Date
}

export interface RecentUpdate {
  id: string
  title: string
  authority: {
    name: string
  }
  createdAt: Date
}

export interface SearchHistoryItem {
  query: string
  timestamp: Date
  resultCount: number
}

export interface DownloadItem {
  document: {
    title: string
  }
  timestamp: Date
}

export interface UserWithPreferences {
  id: string
  name: string | null
  email: string
  preferences: {
    businessType?: string | null
    preferredAuthorities: string[]
    experienceLevel?: string | null
  } | null
  searchHistory: SearchHistoryItem[]
  downloads: DownloadItem[]
}

export interface DashboardData {
  user: {
    id: string
    name: string
    email: string
    preferences: {
      businessType?: string | null
      preferredAuthorities: string[]
      experienceLevel?: string | null
    } | null
  }
  recommendations: Recommendation[]
  updates: RecentUpdate[]
  quickActions: QuickAction[]
  recentActivity: {
    searches: SearchHistoryItem[]
    downloads: DownloadItem[]
  }
}