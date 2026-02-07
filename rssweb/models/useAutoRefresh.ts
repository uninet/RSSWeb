// 自動刷新 Hook

import { useState, useEffect, useCallback } from 'react'
import { useApp } from '@/contexts/AppContext'

export function useAutoRefresh() {
  const {
    subscriptions,
    addSubscription,
    updateSubscription,
  } = useApp()

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)
  const [refreshCount, setRefreshCount] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [interval, setIntervalValue] = useState(30) // 默 30 分鐘

  // 單個刷新所有訂閱源
  const refreshAllSubscriptions = useCallback(async () => {
    setIsRefreshing(true)
    
    try {
      console.log(`開始刷新 ${subscriptions.length} 個訂閱源...`)
      
      // 使用 Promise.all 並行刷新所有訂閱源
      const refreshPromises = subscriptions.map(async (subscription) => {
        try {
          const response = await fetch(`/api/rss/${encodeURIComponent(subscription.url)}`, {
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache',
            },
          })
          
          if (!response.ok) {
            console.error(`刷新 ${subscription.title} 失敗:`, response.status)
            return {
              subscriptionId: subscription.id,
              success: false,
              error: `HTTP ${response.status}`,
            }
          }
          
          // 解析 RSS Feed
          const text = await response.text()
          const parser = new DOMParser()
          const xmlDoc = parser.parseFromString(text, 'text/xml')
          
          // 提取文章列表（简化解析）
          const items = xmlDoc.querySelectorAll('item')
          const newArticles = Array.from(items).map((item, index) => ({
            id: `art-${subscription.id}-${Date.now()}-${index}`,
            subscriptionId: subscription.id,
            title: item.querySelector('title')?.textContent || '',
            link: item.querySelector('link')?.textContent || '',
            description: item.querySelector('description')?.textContent || '',
            content: item.querySelector('description')?.textContent || '',
            pubDate: new Date(item.querySelector('pubDate')?.textContent || Date.now()).getTime(),
            author: item.querySelector('author')?.textContent || '',
            isRead: false,
            isFavorite: false,
            tags: subscription.category ? [subscription.category] : [],
          }))
          
          return {
            subscriptionId: subscription.id,
            success: true,
            newArticles: newArticles.length,
            title: subscription.title,
          }
        } catch (error) {
          console.error(`解析 ${subscription.title} 失敗:`, error)
          return {
            subscriptionId: subscription.id,
            success: false,
            error: error instanceof Error ? error.message : '未知錯誤',
          }
        }
      })
      
      const results = await Promise.all(refreshPromises)
      
      // 更新所有訂閱源（模擬更新未讀計數）
      let totalNewArticles = 0
      
      results.forEach((result) => {
        if (result.success) {
          totalNewArticles += result.newArticles
          updateSubscription(result.subscriptionId, {
            lastUpdated: Date.now(),
            unreadCount: Math.floor(Math.random() * 5), // 模擬新文章
          })
        }
      })
      
      setLastRefreshTime(new Date())
      setRefreshCount(prev => prev + 1)
      
      console.log(`刷新完成: ${results.filter(r => r.success).length}/${subscriptions.length} 成功`)
      console.log(`新增文章: ${totalNewArticles}`)
      
      return {
        success: true,
        refreshed: results.filter(r => r.success).length,
        failed: results.filter(r => !success).length,
        totalNewArticles,
      }
    } catch (error) {
      console.error('刷新所有訂閱源失敗:', error)
      setIsRefreshing(false)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
      }
    } finally {
      setTimeout(() => setIsRefreshing(false), 2000) // 2 秒後隱藏刷新狀態
    }
  }

  // 刷新單個訂閱源
  const refreshSingleSubscription = useCallback(async (subscriptionId: string) => {
    const subscription = subscriptions.find(s => s.id === subscriptionId)
    
    if (!subscription) {
      console.error(`找不到訂閱源: ${subscriptionId}`)
      return
    }
    
    setIsRefreshing(true)
    
    try {
      console.log(`刷新 ${subscription.title}...`)
      
      const response = await fetch(`/api/rss/${encodeURIComponent(subscription.url)}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
      
      if (!response.ok) {
        console.error(`刷新 ${subscription.title} 失敗:`, response.status)
        return
      }
      
      // 解析 RSS Feed
      const text = await response.text()
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(text, 'text/xml')
      
      // 提取文章列表（简化解析）
      const items = xmlDoc.querySelectorAll('item')
      const newArticles = Array.from(items).slice(0, 10).map((item, index) => ({
        id: `art-${subscription.id}-${Date.now()}-${index}`,
        subscriptionId: subscription.id,
        title: item.querySelector('title')?.textContent || '',
        link: item.querySelector('link')?.textContent || '',
        description: item.querySelector('description')?.textContent || '',
        content: item.querySelector('description')?.textContent || '',
        pubDate: new Date(item.querySelector('pubDate')?.textContent || Date.now()).getTime(),
        author: item.querySelector('author')?.textContent || '',
        isRead: false,
        isFavorite: false,
        tags: subscription.category ? [subscription.category] : [],
      }))
      
      // 更新訂閱源
      updateSubscription(subscription.id, {
        lastUpdated: Date.now(),
        unreadCount: Math.floor(Math.random() * 3),
      })
      
      setLastRefreshTime(new Date())
      console.log(`刷新 ${subscription.title} 完成: ${newArticles.length} 篇新文章`)
      
      return {
        success: true,
        newArticles: newArticles.length,
        title: subscription.title,
      }
    } catch (error) {
      console.error(`刷新 ${subscription.title} 失敗:`, error)
    } finally {
      setTimeout(() => setIsRefreshing(false), 2000)
    }
  }, [subscriptions, updateSubscription])

  // 自動定時刷新
  useEffect(() => {
    if (isPaused) {
      console.log('自動刷新已暫停')
      return
    }
    
    if (subscriptions.length === 0) {
      console.log('沒有訂閱源，跳過自動刷新')
      return
    }
    
    console.log(`設置自動刷新，間隔: ${interval} 分鐘`)
    
    const intervalId = setInterval(async () => {
      // 隨機延遲，避免同時刷新所有訂閱源
      const delay = Math.random() * 60000 // 0-60 秒延遲
      
      setTimeout(async () => {
        await refreshAllSubscriptions()
      }, delay)
    }, interval * 60 * 1000) // 間隔 = 分鐘 * 60 * 1000 毫秒
    
    return () => clearInterval(intervalId)
  }, [subscriptions.length, interval, isPaused])

  // 暫停/恢復自動刷新
  const togglePause = () => {
    setIsPaused(prev => {
      const newState = !prev
      console.log(newState ? '自動刷新已暫停' : '自動刷新已恢復')
      return newState
    })
  }

  // 更改刷新間隔
  const setInterval = (newInterval: number) => {
    if (newInterval < 5) {
      console.warn('刷新間隔不能少於 5 分鐘')
      return
    }
    setIntervalValue(newInterval)
    console.log(`刷新間隔已更新為: ${newInterval} 分鐘`)
  }

  return {
    isRefreshing,
    lastRefreshTime,
    refreshCount,
    isPaused,
    interval,
    refreshAllSubscriptions,
    refreshSingleSubscription,
    togglePause,
    setInterval,
  }
}
