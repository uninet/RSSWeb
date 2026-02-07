// 全局應用狀態管理 - 完全重寫版（消除重複）

'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { useAnchors } from '@/models/useAnchors'
import { useQuotaReset } from '@/models/useQuotaReset'
import { useModelCall } from '@/models/useModelCall'
import {
  Subscription,
  Article,
  FilterType,
  SortOrder,
  ViewMode,
  ModelProvider,
  ModelUsage,
} from '@/types'
import {
  subscriptionStorage,
  articleStorage,
  settingsStorage,
} from '@/lib/storage'

interface AppContextType {
  // RSS 數據
  subscriptions: Subscription[]
  articles: Article[]
  filteredArticles: Article[]
  
  // RSS 操作
  addSubscription: (subscription: Subscription) => void
  updateSubscription: (id: string, updates: Partial<Subscription>) => void
  deleteSubscription: (id: string) => void
  
  // 文章操作
  markAsRead: (id: string) => void
  markAsUnread: (id: string) => void
  markAllAsRead: () => void
  toggleFavorite: (id: string) => void
  deleteArticle: (id: string) => void
  
  // 過濾和排序
  filterType: FilterType
  sortOrder: SortOrder
  viewMode: ViewMode
  searchQuery: string
  setFilterType: (type: FilterType) => void
  modelUsage: ModelUsage
  sendModelRequest: (prompt: string, provider?: ModelProvider) => Promise<any>
  switchToBigModel: () => void
  switchToGemini: () => void
  checkModelRecovery: () => Promise<boolean>
  
  // 數據刷新
  refreshData: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  // RSS 數據狀態
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  
  // 過濾和排序狀態
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [searchQuery, setSearchQuery] = useState('')
  
  // 獲取模型、錨點和重置狀態
  const { anchors } = useAnchors()
  const { quotaReset } = useQuotaReset()
  const {
    currentProvider,
    lastSwitchTime,
    quotaStatus,
    callModel,
    switchToBigModel,
    switchToGemini,
    checkBigModelRecovery,
  } = useModelCall()

  // 初始化示例數據
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const existingSubscriptions = subscriptionStorage.getAll()
      const existingArticles = articleStorage.getAll()

      if (existingSubscriptions.length === 0 && existingArticles.length === 0) {
        console.log('No data found, adding sample data...')
        
        const sampleSubscriptions: Subscription[] = [
          {
            id: 'sub-1',
            title: 'Next.js Blog',
            url: 'https://nextjs.org/blog/feed.xml',
            description: 'The Next.js Blog',
            category: '技术',
            addedAt: Date.now(),
            unreadCount: 3,
            icon: 'https://nextjs.org/favicon.ico',
          },
          {
            id: 'sub-2',
            title: 'TechCrunch',
            url: 'https://techcrunch.com/feed/',
            description: 'TechCrunch - Reporting on the business of technology',
            category: '新闻',
            addedAt: Date.now(),
            unreadCount: 5,
            icon: 'https://techcrunch.com/favicon.ico',
          },
          {
            id: 'sub-3',
            title: 'Dan Abramov',
            url: 'https://overreacted.io/rss.xml',
            description: "Dan Abramov's blog about React and programming",
            category: '博客',
            addedAt: Date.now(),
            unreadCount: 2,
          },
        ]

        const sampleArticles: Article[] = [
          {
            id: 'art-1',
            subscriptionId: 'sub-1',
            title: 'Next.js 16 Released: Faster, Smaller, and More Powerful',
            link: 'https://nextjs.org/blog/next-16',
            description:
              'We are excited to announce Next.js 16, the latest release of our framework with significant performance improvements...',
            content:
              'We are excited to announce Next.js 16, the latest release of our framework with significant performance improvements, new features, and better developer experience.',
            pubDate: Date.now() - 3600000,
            author: 'Next.js Team',
            isRead: false,
            isFavorite: false,
            tags: ['nextjs', 'release'],
          },
          {
            id: 'art-2',
            subscriptionId: 'sub-1',
            title: 'How to Use Server Actions in Next.js',
            link: 'https://nextjs.org/blog/server-actions',
            description:
              'Learn how to use Server Actions to handle form submissions and mutations in Next.js...',
            content:
              'Learn how to use Server Actions to handle form submissions and mutations in Next.js applications with ease.',
            pubDate: Date.now() - 7200000,
            author: 'Next.js Team',
            isRead: true,
            isFavorite: true,
            tags: ['tutorial', 'server-actions'],
          },
        ]

        sampleSubscriptions.forEach((sub) => subscriptionStorage.add(sub))
        sampleArticles.forEach((art) => articleStorage.addOrUpdate([art]))

        setSubscriptions(sampleSubscriptions)
        setArticles(sampleArticles)

        console.log('Sample data initialized:', {
          subscriptions: sampleSubscriptions.length,
          articles: sampleArticles.length,
        })
      } else {
        setSubscriptions(existingSubscriptions)
        setArticles(existingArticles)
      }
    }
  }, [])

  // 過濾文章
  const filteredArticles = articles
    .filter((article) => {
      if (filterType === 'unread' && article.isRead) return false
      if (filterType === 'favorite' && !article.isFavorite) return false

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          article.title.toLowerCase().includes(query) ||
          article.description.toLowerCase().includes(query) ||
          article.author?.toLowerCase().includes(query) ||
          article.tags?.some(tag => tag.toLowerCase().includes(query))
        )
      }

      return true
    })
    .sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1
      return (a.pubDate - b.pubDate) * order
    })

  // 訂閱操作
  const addSubscription = (subscription: Subscription) => {
    subscriptionStorage.add(subscription)
    setSubscriptions([...subscriptions, subscription])
  }

  const updateSubscription = (id: string, updates: Partial<Subscription>) => {
    subscriptionStorage.update(id, updates)
    setSubscriptions(
      subscriptions.map((s) => (s.id === id ? { ...s, ...updates } : s))
    )
  }

  const deleteSubscription = (id: string) => {
    subscriptionStorage.delete(id)
    setSubscriptions(subscriptions.filter((s) => s.id !== id))
    articleStorage.deleteBySubscription(id)
    setArticles(articles.filter((a) => a.subscriptionId !== id))
  }

  // 文章操作
  const markAsRead = (id: string) => {
    articleStorage.markAsRead(id)
    setArticles(
      articles.map((a) => (a.id === id ? { ...a, isRead: true } : a))
    )
  }

  const markAsUnread = (id: string) => {
    articleStorage.markAsUnread(id)
    setArticles(
      articles.map((a) => (a.id === id ? { ...a, isRead: false } : a))
    )
  }

  const markAllAsRead = () => {
    articleStorage.markAllAsRead()
    setArticles(articles.map((a) => ({ ...a, isRead: true })))
  }

  const toggleFavorite = (id: string) => {
    articleStorage.toggleFavorite(id)
    const article = articles.find((a) => a.id === id)
    if (article) {
      setArticles(
        articles.map((a) => (a.id === id ? { ...a, isFavorite: !article.isFavorite } : a))
      )
    }
  }

  const deleteArticle = (id: string) => {
    articleStorage.delete(id)
    setArticles(articles.filter((a) => a.id !== id))
  }

  // 過濾和排序操作
  const setFilterType = (type: FilterType) => setFilterType(type)

  return (
    <AppContext.Provider
      value={{
        subscriptions,
        articles,
        filteredArticles,
        filterType,
        sortOrder,
        viewMode,
        searchQuery,
        setFilterType,
        setSortOrder,
        setViewMode,
        setSearchQuery,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        markAsRead,
        markAsUnread,
        markAllAsRead,
        toggleFavorite,
        deleteArticle,
        modelUsage,
        sendModelRequest,
        refreshData,
        // 模型相關
        currentProvider,
        lastSwitchTime,
        quotaStatus,
        anchors,
        quotaReset,
        switchToBigModel,
        switchToGemini,
        checkBigModelRecovery,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
