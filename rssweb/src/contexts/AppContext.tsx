// 全局应用状态管理 - 更新版

'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAnchors } from '@/models/useAnchors'
import { useQuotaReset } from '@/models/useQuotaReset'
import { useModelCall } from '@/models/useModelCall'
import {
  Subscription,
  Article,
  AppSettings,
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
  // RSS 数据
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
  
  // 过滤和排序
  filterType: FilterType
  sortOrder: SortOrder
  viewMode: ViewMode
  searchQuery: string
  setFilterType: (type: FilterType) => void
  setSortOrder: (order: SortOrder) => void
  setViewMode: (mode: ViewMode) => void
  setSearchQuery: (query: string) => void
  
  // 模型相关
  modelUsage: ModelUsage
  sendModelRequest: (prompt: string, provider?: ModelProvider) => Promise<any>
  switchToBigModel: () => void
  switchToGemini: () => void
  checkModelRecovery: () => Promise<boolean>
  
  // 数据刷新
  refreshData: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  // RSS 数据状态
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  
  // 过滤和排序状态
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [searchQuery, setSearchQuery] = useState('')
  
  // 获取模型、锚点和重置状态
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

  // 初始化示例数据
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
            pubDate: Date.now() - 3600000, // 1 hour ago
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
            pubDate: Date.now() - 7200000, // 2 hours ago
            author: 'Next.js Team',
            isRead: true,
            isFavorite: true,
            tags: ['tutorial', 'server-actions'],
          },
          {
            id: 'art-3',
            subscriptionId: 'sub-1',
            title: 'Optimizing Images in Next.js',
            link: 'https://nextjs.org/blog/image-optimization',
            description:
              'Discover best practices for optimizing images in your Next.js applications...',
            content:
              'Discover best practices for optimizing images in your Next.js applications to improve performance and user experience.',
            pubDate: Date.now() - 86400000, // 1 day ago
            author: 'Next.js Team',
            isRead: false,
            isFavorite: false,
            tags: ['performance', 'images'],
          },
          {
            id: 'art-4',
            subscriptionId: 'sub-2',
            title: 'AI Startup Raises $100M Series A',
            link: 'https://techcrunch.com/2025/02/ai-startup-series-a',
            description:
              'An artificial intelligence startup has raised $100 million in Series A funding...',
            content:
              'An artificial intelligence startup has raised $100 million in Series A funding to expand its operations and develop new products.',
            pubDate: Date.now() - 1800000, // 30 minutes ago
            author: 'TechCrunch',
            isRead: false,
            isFavorite: false,
            tags: ['ai', 'funding'],
          },
          {
            id: 'art-5',
            subscriptionId: 'sub-2',
            title: 'New Programming Language Challenges JavaScript',
            link: 'https://techcrunch.com/2025/02/new-language',
            description:
              'A new programming language claims to offer better performance and developer experience...',
            content:
              'A new programming language claims to offer better performance and developer experience than JavaScript for web development.',
            pubDate: Date.now() - 5400000, // 1.5 hours ago
            author: 'TechCrunch',
            isRead: false,
            isFavorite: true,
            tags: ['programming', 'javascript'],
          },
          {
            id: 'art-6',
            subscriptionId: 'sub-3',
            title: 'Understanding React\'s useLayoutEffect',
            link: 'https://overreacted.io/use-layout-effect',
            description:
              'A deep dive into useLayoutEffect and when to use it over useEffect...',
            content:
              'A deep dive into useLayoutEffect and when to use it over useEffect. Learn the subtle differences and use cases.',
            pubDate: Date.now() - 10800000, // 3 hours ago
            author: 'Dan Abramov',
            isRead: false,
            isFavorite: false,
            tags: ['react', 'hooks'],
          },
        ]

        // 保存示例数据
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

  // 过滤文章
  const filteredArticles = articles
    .filter((article) => {
      // 过滤类型
      if (filterType === 'unread' && article.isRead) return false
      if (filterType === 'favorite' && !article.isFavorite) return false

      // 搜索过滤
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

  // 订阅操作
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

  // 过滤和排序操作
  const setFilterType = (type: FilterType) => {
    setFilterType(type)
  }

  const setSortOrder = (order: SortOrder) => {
    setSortOrder(order)
  }

  const setViewMode = (mode: ViewMode) => {
    setViewMode(mode)
    settingsStorage.update('viewMode', mode)
  }

  const setSearchQuery = (query: string) => {
    setSearchQuery(query)
  }

  // 模型请求（占位，实际实现在模型切换系统中）
  const sendModelRequest = async (prompt: string, provider?: ModelProvider): Promise<any> => {
    console.log('Model request (placeholder):', { prompt, provider })
    // 实际的模型请求逻辑会在模型切换系统中实现
    return { provider: provider || 'big-model', data: {} }
  }

  // 数据刷新
  const refreshData = () => {
    setSubscriptions(subscriptionStorage.getAll())
    setArticles(articleStorage.getAll())
  }

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
        sendModelRequest,
        refreshData,
        // 模型相关
        currentProvider,
        lastSwitchTime,
        quotaStatus,
        anchors,
        quotaReset,
        switchToBigModel,
        switchToGemini,
        checkModelRecovery,
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
