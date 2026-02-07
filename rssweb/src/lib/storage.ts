// 本地存储管理

import { Subscription, Article, Category } from '@/types'

const STORAGE_KEYS = {
  SUBSCRIPTIONS: 'rssweb_subscriptions',
  ARTICLES: 'rssweb_articles',
  CATEGORIES: 'rssweb_categories',
  SETTINGS: 'rssweb_settings',
}

// 订阅管理
export const subscriptionStorage = {
  getAll(): Subscription[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS)
    return data ? JSON.parse(data) : []
  },

  save(subscriptions: Subscription[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions))
  },

  add(subscription: Subscription): void {
    const subscriptions = this.getAll()
    subscriptions.push(subscription)
    this.save(subscriptions)
  },

  update(id: string, updates: Partial<Subscription>): void {
    const subscriptions = this.getAll()
    const index = subscriptions.findIndex(s => s.id === id)
    if (index !== -1) {
      subscriptions[index] = { ...subscriptions[index], ...updates }
      this.save(subscriptions)
    }
  },

  delete(id: string): void {
    const subscriptions = this.getAll().filter(s => s.id !== id)
    this.save(subscriptions)
  },

  get(id: string): Subscription | undefined {
    return this.getAll().find(s => s.id === id)
  },
}

// 文章管理
export const articleStorage = {
  getAll(): Article[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(STORAGE_KEYS.ARTICLES)
    return data ? JSON.parse(data) : []
  },

  save(articles: Article[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles))
  },

  addOrUpdate(articles: Article[]): void {
    const existing = this.getAll()
    const existingMap = new Map(existing.map(a => [a.id, a]))

    // 合并新文章，保留已存在的文章的 isRead 和 isFavorite 状态
    const merged = articles.map(article => {
      const existingArticle = existingMap.get(article.id)
      if (existingArticle) {
        return {
          ...article,
          isRead: existingArticle.isRead,
          isFavorite: existingArticle.isFavorite,
        }
      }
      return article
    })

    // 添加新文章（已存在的不会重复）
    const newArticles = merged.filter(
      article => !existingMap.has(article.id)
    )
    const allArticles = [...existing, ...newArticles]

    // 限制存储的文章数量（保留最新的 1000 篇）
    const sortedArticles = allArticles
      .sort((a, b) => b.pubDate - a.pubDate)
      .slice(0, 1000)

    this.save(sortedArticles)
  },

  markAsRead(id: string): void {
    const articles = this.getAll()
    const article = articles.find(a => a.id === id)
    if (article) {
      article.isRead = true
      this.save(articles)
    }
  },

  markAsUnread(id: string): void {
    const articles = this.getAll()
    const article = articles.find(a => a.id === id)
    if (article) {
      article.isRead = false
      this.save(articles)
    }
  },

  markAllAsRead(subscriptionId?: string): void {
    const articles = this.getAll()
    articles.forEach(article => {
      if (!subscriptionId || article.subscriptionId === subscriptionId) {
        article.isRead = true
      }
    })
    this.save(articles)
  },

  toggleFavorite(id: string): void {
    const articles = this.getAll()
    const article = articles.find(a => a.id === id)
    if (article) {
      article.isFavorite = !article.isFavorite
      this.save(articles)
    }
  },

  delete(id: string): void {
    const articles = this.getAll().filter(a => a.id !== id)
    this.save(articles)
  },

  get(id: string): Article | undefined {
    return this.getAll().find(a => a.id === id)
  },

  getBySubscription(subscriptionId: string): Article[] {
    return this.getAll().filter(a => a.subscriptionId === subscriptionId)
  },

  getUnread(): Article[] {
    return this.getAll().filter(a => !a.isRead)
  },

  getFavorite(): Article[] {
    return this.getAll().filter(a => a.isFavorite)
  },

  deleteBySubscription(subscriptionId: string): void {
    const articles = this.getAll().filter(a => a.subscriptionId !== subscriptionId)
    this.save(articles)
  },
}

// 分类管理
export const categoryStorage = {
  getAll(): Category[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES)
    return data ? JSON.parse(data) : [
      { id: 'tech', name: '技术', color: '#3b82f6' },
      { id: 'news', name: '新闻', color: '#ef4444' },
      { id: 'blog', name: '博客', color: '#10b981' },
      { id: 'other', name: '其他', color: '#6b7280' },
    ]
  },

  save(categories: Category[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
  },

  add(category: Category): void {
    const categories = this.getAll()
    categories.push(category)
    this.save(categories)
  },

  update(id: string, updates: Partial<Category>): void {
    const categories = this.getAll()
    const index = categories.findIndex(c => c.id === id)
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updates }
      this.save(categories)
    }
  },

  delete(id: string): void {
    const categories = this.getAll().filter(c => c.id !== id)
    this.save(categories)
  },

  get(id: string): Category | undefined {
    return this.getAll().find(c => c.id === id)
  },
}

// 设置管理
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto'
  viewMode: 'list' | 'grid'
  autoRefresh: boolean
  refreshInterval: number // minutes
  showUnreadOnly: boolean
}

const defaultSettings: AppSettings = {
  theme: 'auto',
  viewMode: 'list',
  autoRefresh: false,
  refreshInterval: 30,
  showUnreadOnly: false,
}

export const settingsStorage = {
  getAll(): AppSettings {
    if (typeof window === 'undefined') return defaultSettings
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings
  },

  save(settings: AppSettings): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
  },

  update<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): void {
    const settings = this.getAll()
    settings[key] = value
    this.save(settings)
  },

  reset(): void {
    this.save(defaultSettings)
  },
}
