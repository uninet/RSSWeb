'use client'

import { useState, useEffect } from 'react'
import { X, Rss, FolderOpen, CheckCircle2, Plus, Menu, ChevronRight } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'

export function Sidebar() {
  const {
    subscriptions,
    activeSubscription,
    setActiveSubscription,
    categories,
    refreshSubscription
  } = useApp()

  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // 按分类分组订阅源
  const groupedSubscriptions = categories.reduce((acc, category) => {
    acc[category.name] = subscriptions.filter(s => s.category === category.name)
    return acc
  }, {} as Record<string, typeof subscriptions>)

  // 未分类的订阅源
  const ungrouped = subscriptions.filter(s => !s.category)

  const handleRefresh = async (id: string) => {
    await refreshSubscription(id)
  }

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryName)) {
        next.delete(categoryName)
      } else {
        next.add(categoryName)
      }
      return next
    })
  }

  const handleMobileToggle = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  const handleSubscriptionClick = (id: string) => {
    setActiveSubscription(id)
    setIsMobileOpen(false) // 关闭移动端侧边栏
  }

  return (
    <>
      {/* 移动端遮罩层 */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={handleMobileToggle}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={cn(
          "fixed md:relative z-50 h-[calc(100vh-4rem)]",
          "w-72 bg-zinc-50 dark:bg-zinc-950",
          "border-r border-zinc-200 dark:border-zinc-800",
          "flex flex-col",
          "transition-transform duration-300 ease-in-out",
          "md:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* 移动端头部 */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            RSSWeb
          </h2>
          <button
            onClick={handleMobileToggle}
            className="p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 分类 */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              分类
            </h2>
            <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-1">
            <button
              onClick={() => handleSubscriptionClick('')}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                !activeSubscription
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-900"
              )}
            >
              <FolderOpen className="h-4 w-4 flex-shrink-0" />
              <span>全部文章</span>
              <span className="ml-auto text-xs">
                {subscriptions.reduce((sum, s) => sum + s.unreadCount, 0)}
              </span>
            </button>
          </div>
        </div>

        {/* 订阅源列表 */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-4">
            {/* 有分类的 */}
            {categories.map(category => {
              const subs = groupedSubscriptions[category.name] || []
              const isExpanded = expandedCategories.has(category.name)
              if (subs.length === 0) return null

              return (
                <div key={category.id}>
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <span>{category.name}</span>
                    <ChevronRight
                      className={cn(
                        "h-3 w-3 transition-transform",
                        isExpanded && "rotate-90"
                      )}
                    />
                  </button>
                  
                  {isExpanded && (
                    <div className="mt-1 space-y-1 pl-2">
                      {subs.map(sub => (
                        <SubscriptionItem
                          key={sub.id}
                          subscription={sub}
                          isActive={activeSubscription === sub.id}
                          onClick={() => handleSubscriptionClick(sub.id)}
                          onRefresh={() => handleRefresh(sub.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {/* 未分类 */}
            {ungrouped.length > 0 && (
              <div>
                <button
                  onClick={() => toggleCategory('uncategorized')}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-900 transition-colors"
                >
                  <span>未分类</span>
                  <ChevronRight
                    className={cn(
                      "h-3 w-3 transition-transform",
                      expandedCategories.has('uncategorized') && "rotate-90"
                    )}
                  />
                </button>
                
                {expandedCategories.has('uncategorized') && (
                  <div className="mt-1 space-y-1 pl-2">
                    {ungrouped.map(sub => (
                      <SubscriptionItem
                        key={sub.id}
                        subscription={sub}
                        isActive={activeSubscription === sub.id}
                        onClick={() => handleSubscriptionClick(sub.id)}
                        onRefresh={() => handleRefresh(sub.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 添加订阅源按钮 */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => window.location.href = '/subscribe/new'}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            添加订阅源
          </button>
        </div>
      </aside>

      {/* 移动端菜单按钮 */}
      <button
        onClick={handleMobileToggle}
        className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
      >
        {isMobileOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>
    </>
  )
}

interface SubscriptionItemProps {
  subscription: {
    id: string
    title: string
    unreadCount: number
    lastFetchAt?: number
    fetchError?: string
  }
  isActive: boolean
  onClick: () => void
  onRefresh: () => Promise<void>
}

function SubscriptionItem({ subscription, isActive, onClick, onRefresh }: SubscriptionItemProps) {
  return (
    <div className="group">
      <button
        onClick={onClick}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left",
          isActive
            ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-900"
        )}
      >
        <Rss className="h-4 w-4 flex-shrink-0" />
        <span className="truncate flex-1">{subscription.title}</span>
        {subscription.unreadCount > 0 && (
          <span className={cn(
            "text-xs font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0",
            isActive
              ? "bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          )}>
            {subscription.unreadCount}
          </span>
        )}
      </button>
      {subscription.fetchError && (
        <div className="px-3 mt-1">
          <p className="text-xs text-red-600 dark:text-red-400 truncate">
            {subscription.fetchError}
          </p>
        </div>
      )}
      {subscription.lastFetchAt && (
        <div className="px-3 mt-1">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            上次更新: {formatDate(subscription.lastFetchAt)}
          </p>
        </div>
      )}
    </div>
  )
}
