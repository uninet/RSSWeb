'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Subscription, Article, Category, AppState } from '@/types'
import { subscriptionStorage, articleStorage, categoryStorage, initSampleData } from '@/lib/storage'
import { fetchRSS } from '@/lib/rss-parser'
import { generateId } from '@/lib/utils'

interface AppContextType extends AppState {
  // 订阅源操作
  addSubscription: (subscription: Omit<Subscription, 'id' | 'addedAt' | 'unreadCount'>) => Promise<void>
  updateSubscription: (id: string, updates: Partial<Subscription>) => void
  deleteSubscription: (id: string) => void
  refreshSubscription: (id: string) => Promise<void>
  refreshAllSubscriptions: () => Promise<void>

  // 文章操作
  markArticleRead: (id: string) => void
  markArticleUnread: (id: string) => void
  toggleArticleFavorite: (id: string) => void
  markAllAsRead: (subscriptionId?: string) => void

  // 分类操作
  addCategory: (category: Omit<Category, 'id'>) => void
  updateCategory: (id: string, updates: Partial<Category>) => void
  deleteCategory: (id: string) => void

  // 筛选操作
  setActiveSubscription: (id: string | null) => void
  setActiveArticle: (id: string | null) => void
  setSearchQuery: (query: string) => void
  setFilterUnreadOnly: (value: boolean) => void
  setFilterFavoriteOnly: (value: boolean) => void

  // 获取过滤后的文章
  getFilteredArticles: () => Article[]
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeSubscription, setActiveSubscription] = useState<string | null>(null)
  const [activeArticle, setActiveArticle] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false)
  const [filterFavoriteOnly, setFilterFavoriteOnly] = useState(false)

  // 初始化数据
  useEffect(() => {
    initSampleData()
    setSubscriptions(subscriptionStorage.getAll())
    setArticles(articleStorage.getAll())
    setCategories(categoryStorage.getAll())
  }, [])

  // 保存订阅源到本地存储
  const saveSubscriptions = (subs: Subscription[]) => {
    setSubscriptions(subs)
    subscriptionStorage.save(subs)
  }

  // 保存文章到本地存储
  const saveArticles = (arts: Article[]) => {
    setArticles(arts)
    articleStorage.save(arts)
  }

  // 保存分类到本地存储
  const saveCategories = (cats: Category[]) => {
    setCategories(cats)
    categoryStorage.save(cats)
  }

  // 添加订阅源
  const addSubscription = async (
    subscription: Omit<Subscription, 'id' | 'addedAt' | 'unreadCount'>
  ) => {
    try {
      // 验证 RSS
      const feed = await fetchRSS(subscription.url)
      if (!feed) {
        throw new Error('无法验证 RSS URL')
      }

      // 创建订阅源
      const newSubscription: Subscription = {
        ...subscription,
        id: generateId(),
        addedAt: Date.now(),
        unreadCount: 0,
        lastFetchAt: Date.now()
      }

      saveSubscriptions([...subscriptions, newSubscription])

      // 自动刷新获取文章
      await refreshSubscription(newSubscription.id)
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '添加订阅源失败')
    }
  }

  // 更新订阅源
  const updateSubscription = (id: string, updates: Partial<Subscription>) => {
    const updated = subscriptions.map(s =>
      s.id === id ? { ...s, ...updates } : s
    )
    saveSubscriptions(updated)
  }

  // 删除订阅源
  const deleteSubscription = (id: string) => {
    // 删除订阅源
    saveSubscriptions(subscriptions.filter(s => s.id !== id))

    // 删除相关文章
    saveArticles(articles.filter(a => a.subscriptionId !== id))

    // 如果当前激活的订阅源被删除，重置激活状态
    if (activeSubscription === id) {
      setActiveSubscription(null)
    }
  }

  // 刷新单个订阅源
  const refreshSubscription = async (id: string) => {
    try {
      const subscription = subscriptions.find(s => s.id === id)
      if (!subscription) return

      // 获取 RSS 内容
      const feed = await fetchRSS(subscription.url)
      if (!feed) {
        throw new Error('无法获取 RSS 内容')
      }

      // 更新订阅源信息
      updateSubscription(id, {
        title: feed.title || subscription.title,
        description: feed.description,
        lastFetchAt: Date.now(),
        fetchError: undefined
      })

      // 解析文章
      const newArticles = feed.items.map(item => ({
        id: generateId(),
        subscriptionId: id,
        title: item.title,
        link: item.link,
        description: item.description || '',
        content: item.content,
        pubDate: item.pubDate ? new Date(item.pubDate).getTime() : Date.now(),
        author: item.author,
        isRead: false,
        isFavorite: false,
        tags: item.category
      }))

      // 合并文章（避免重复）
      const existingArticles = articles.filter(a => a.subscriptionId !== id)
      const allArticles = [...existingArticles, ...newArticles]

      // 按时间排序
      allArticles.sort((a, b) => b.pubDate - a.pubDate)

      saveArticles(allArticles)

      // 更新未读计数
      const unreadCount = allArticles.filter(a => a.subscriptionId === id && !a.isRead).length
      updateSubscription(id, { unreadCount })
    } catch (error) {
      console.error(`刷新订阅源 ${id} 失败:`, error)
      updateSubscription(id, {
        fetchError: error instanceof Error ? error.message : '刷新失败'
      })
    }
  }

  // 刷新所有订阅源
  const refreshAllSubscriptions = async () => {
    const promises = subscriptions.map(s => refreshSubscription(s.id))
    await Promise.allSettled(promises)
  }

  // 标记文章为已读
  const markArticleRead = (id: string) => {
    const article = articles.find(a => a.id === id)
    if (!article || article.isRead) return

    // 更新文章状态
    const updated = articles.map(a =>
      a.id === id ? { ...a, isRead: true } : a
    )
    saveArticles(updated)

    // 更新订阅源未读计数
    if (article.subscriptionId) {
      const subscription = subscriptions.find(s => s.id === article.subscriptionId)
      if (subscription && subscription.unreadCount > 0) {
        updateSubscription(article.subscriptionId, {
          unreadCount: subscription.unreadCount - 1
        })
      }
    }
  }

  // 标记文章为未读
  const markArticleUnread = (id: string) => {
    const article = articles.find(a => a.id === id)
    if (!article || !article.isRead) return

    // 更新文章状态
    const updated = articles.map(a =>
      a.id === id ? { ...a, isRead: false } : a
    )
    saveArticles(updated)

    // 更新订阅源未读计数
    if (article.subscriptionId) {
      const subscription = subscriptions.find(s => s.id === article.subscriptionId)
      if (subscription) {
        updateSubscription(article.subscriptionId, {
          unreadCount: subscription.unreadCount + 1
        })
      }
    }
  }

  // 切换文章收藏状态
  const toggleArticleFavorite = (id: string) => {
    const updated = articles.map(a =>
      a.id === id ? { ...a, isFavorite: !a.isFavorite } : a
    )
    saveArticles(updated)
  }

  // 全部标记为已读
  const markAllAsRead = (subscriptionId?: string) => {
    const targetArticles = subscriptionId
      ? articles.filter(a => a.subscriptionId === subscriptionId && !a.isRead)
      : articles.filter(a => !a.isRead)

    if (targetArticles.length === 0) return

    // 更新文章
    const updated = articles.map(a =>
      !a.isRead && (subscriptionId ? a.subscriptionId === subscriptionId : true)
        ? { ...a, isRead: true }
        : a
    )
    saveArticles(updated)

    // 更新订阅源未读计数
    const updatedSubscriptions = subscriptions.map(s => {
      const unreadCount = articles.filter(
        a => a.subscriptionId === s.id && !a.isRead &&
              (subscriptionId ? s.id === subscriptionId : true)
      ).length
      return { ...s, unreadCount: 0 }
    })
    saveSubscriptions(updatedSubscriptions)
  }

  // 添加分类
  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: generateId()
    }
    saveCategories([...categories, newCategory])
  }

  // 更新分类
  const updateCategory = (id: string, updates: Partial<Category>) => {
    const updated = categories.map(c =>
      c.id === id ? { ...c, ...updates } : c
    )
    saveCategories(updated)
  }

  // 删除分类
  const deleteCategory = (id: string) => {
    saveCategories(categories.filter(c => c.id !== id))
  }

  // 获取过滤后的文章
  const getFilteredArticles = (): Article[] => {
    let filtered = articles

    // 按订阅源过滤
    if (activeSubscription) {
      filtered = filtered.filter(a => a.subscriptionId === activeSubscription)
    }

    // 按搜索关键词过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query)
      )
    }

    // 按未读过滤
    if (filterUnreadOnly) {
      filtered = filtered.filter(a => !a.isRead)
    }

    // 按收藏过滤
    if (filterFavoriteOnly) {
      filtered = filtered.filter(a => a.isFavorite)
    }

    return filtered
  }

  return (
    <AppContext.Provider
      value={{
        subscriptions,
        articles,
        categories,
        activeSubscription,
        activeArticle,
        searchQuery,
        filterUnreadOnly,
        filterFavoriteOnly,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        refreshSubscription,
        refreshAllSubscriptions,
        markArticleRead,
        markArticleUnread,
        toggleArticleFavorite,
        markAllAsRead,
        addCategory,
        updateCategory,
        deleteCategory,
        setActiveSubscription,
        setActiveArticle,
        setSearchQuery,
        setFilterUnreadOnly,
        setFilterFavoriteOnly,
        getFilteredArticles
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
