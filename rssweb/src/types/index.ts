// RSS 数据模型类型定义

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

export interface Category {
  id: string
  name: string
  color?: string
}

export interface RSSFeed {
  title: string
  description?: string
  link?: string
  icon?: string
  items: RSSItem[]
}

export interface RSSItem {
  title: string
  link: string
  description?: string
  content?: string
  pubDate?: string
  author?: string
  category?: string
}

export type ViewMode = 'list' | 'grid'
export type SortOrder = 'desc' | 'asc'
export type FilterType = 'all' | 'unread' | 'favorite'
