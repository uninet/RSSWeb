// 订阅源
export interface Subscription {
  id: string
  title: string
  url: string
  description?: string
  icon?: string
  category?: string
  addedAt: number
  lastFetchAt?: number
  fetchError?: string
  unreadCount: number
}

// 文章
export interface Article {
  id: string
  subscriptionId: string
  title: string
  link: string
  description: string
  content?: string
  pubDate: number
  author?: string
  isRead: boolean
  isFavorite: boolean
  tags?: string[]
}

// 分类
export interface Category {
  id: string
  name: string
  color?: string
}

// RSS Feed 结构
export interface RSSFeed {
  title: string
  description?: string
  link: string
  items: RSSItem[]
}

// RSS Item 结构
export interface RSSItem {
  title: string
  link: string
  description?: string
  content?: string
  pubDate?: string
  author?: string
  category?: string[]
  guid?: string
}

// 应用状态
export interface AppState {
  subscriptions: Subscription[]
  articles: Article[]
  categories: Category[]
  activeSubscription: string | null
  activeArticle: string | null
  searchQuery: string
  filterUnreadOnly: boolean
  filterFavoriteOnly: boolean
}
