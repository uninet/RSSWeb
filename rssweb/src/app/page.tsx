// 主页面 - 增强版（集成模型系统）

'use client'

import { useState } from 'react'
import { useApp } from '@/contexts/AppContext'
import { useAutoRefresh } from '@/models/useAutoRefresh'
import {
  Search,
  Plus,
  List,
  Grid,
  Filter,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Pause,
  Play,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArticleCard } from '@/components/ArticleCard'

export default function HomePage() {
  const {
    filteredArticles,
    subscriptions,
    filterType,
    sortOrder,
    viewMode,
    searchQuery,
    setFilterType,
    setSortOrder,
    setViewMode,
    setSearchQuery,
    markAsRead,
    toggleFavorite,
    markAllAsRead,
    // 模型相关
    currentProvider,
    lastSwitchTime,
    quotaStatus,
    switchToBigModel,
    switchToGemini,
  } = useApp()

  // 自动刷新功能
  const {
    isRefreshing,
    lastRefreshTime,
    refreshCount,
    isPaused,
    refreshAllSubscriptions,
    togglePause,
  } = useAutoRefresh()

  const unreadCount = filteredArticles.filter((a) => !a.isRead).length
  const favoriteCount = filteredArticles.filter((a) => a.isFavorite).length

  const handleVisit = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  const handleRefreshAll = async () => {
    await refreshAllSubscriptions()
  }

  const formatTime = (isoString: string | null) => {
    if (!isoString) return '从未刷新'
    return new Date(isoString).toLocaleString('zh-CN')
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm dark:bg-zinc-950/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 11a9 9 0 0 1 9 18a9 9 0 1 9 0 1 1.78-1.25 10.593-6.414 10.593-9.098-15.356-12.892-10.593 15.356-19.482-10.593 15.356-21.376-10.593 13.236-26.765-10.593 9.098-29.243-5.293-6.414-32.3-6.414-10.593 15.356-37.536-10.593 15.356-41.883-10.593 15.356-48.8 6.414-10.593 15.356-54.415-10.593 15.356-59.967-5.293-6.414-64.883-10.593 15.356-70.588-10.593 9.098-76.447-5.293-6.414-81.883-10.593 15.356-85.396-10.593 9.098-88.528-5.293-6.414-96" />
                </svg>
              </div>
              <h1 className="text-xl font-bold">RSSWeb</h1>
            </div>

            {/* Model Status */}
            <div className="flex items-center gap-2">
              {currentProvider === 'big-model' && quotaStatus?.isExhausted ? (
                <Button variant="ghost" size="sm" className="text-amber-600" asChild>
                  <a href="/model-test">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    额度已用完
                  </a>
                </Button>
              ) : currentProvider === 'gemini' ? (
                <Button variant="ghost" size="sm" className="text-green-600" asChild>
                  <a href="/model-test">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Gemini
                  </a>
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="text-amber-600" asChild>
                  <a href="/model-test">
                    <Zap className="h-4 w-4 mr-2" />
                    Big Model
                  </a>
                </Button>
              )}

              {/* 自动刷新控制 */}
              <div className="flex items-center gap-2">
                {isRefreshing ? (
                  <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                ) : isPaused ? (
                  <Play className="h-4 w-4 text-zinc-500" />
                ) : (
                  <Pause className="h-4 w-4 text-zinc-500" />
                )}
                <div className="flex items-center gap-1 text-xs text-zinc-500">
                  {isPaused ? (
                    <span>已暂停</span>
                  ) : isRefreshing ? (
                    <span>刷新中...</span>
                  ) : (
                    <>
                      <span>刷新</span>
                      <span className="font-semibold">{refreshCount} 次</span>
                    </>
                  )}
                </div>
              </div>

              {/* 最后刷新时间 */}
              {lastRefreshTime && (
                <div className="flex items-center gap-1 text-xs text-zinc-500">
                  <span>上次刷新:</span>
                  <span className="font-semibold">
                    {formatTime(lastRefreshTime.toISOString())}
                  </span>
                </div>
              )}
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  type="search"
                  placeholder="搜索文章..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <List className="h-4 w-4" />
                      全部 ({filteredArticles.length})
                    </div>
                  </SelectItem>
                  <SelectItem value="unread">
                    <div className="flex items-center gap-2">
                      <List className="h-4 w-4" />
                      未读 ({unreadCount})
                    </div>
                  </SelectItem>
                  <SelectItem value="favorite">
                    <div className="flex items-center gap-2">
                      <List className="h-4 w-4" />
                      收藏 ({favoriteCount})
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">最新在前</SelectItem>
                  <SelectItem value="asc">最旧在前</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                title={viewMode === 'list' ? '网格视图' : '列表视图'}
              >
                {viewMode === 'list' ? (
                  <Grid className="h-4 w-4" />
                ) : (
                  <List className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Subscriptions List */}
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="sticky top-20">
              <div className="space-y-4">
                <h2 className="mb-4 text-sm font-semibold text-zinc-500">
                  订阅源 ({subscriptions.length})
                </h2>
                <div className="space-y-2">
                  {subscriptions.length === 0 ? (
                    <div className="py-8 text-center text-sm text-zinc-500">
                      <p className="mb-2">还没有订阅源</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => console.log('Add subscription')}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        添加订阅
                      </Button>
                    </div>
                  ) : (
                    subscriptions.map((subscription) => (
                      <div
                        key={subscription.id}
                        className="flex items-center gap-3 rounded-lg p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                      >
                        {subscription.icon && (
                          <img
                            src={subscription.icon}
                            alt={subscription.title}
                            className="h-5 w-5 rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                            {subscription.title}
                          </p>
                          {subscription.category && (
                            <p className="truncate text-xs text-zinc-500">
                              {subscription.category}
                            </p>
                          )}
                        </div>
                        {subscription.unreadCount > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                            {subscription.unreadCount > 99 ? '99+' : subscription.unreadCount}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Quick Actions */}
                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      asChild
                    >
                      <a href="/model-test">
                        <Zap className="h-4 w-4 mr-2" />
                        模型测试
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      asChild
                    >
                      <a href="/subscriptions">
                        <Plus className="h-4 w-4 mr-2" />
                        添加订阅
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content - Article List */}
          <main className="flex-1 min-w-0">
            {/* Stats Bar */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  {filterType === 'all' && '全部文章'}
                  {filterType === 'unread' && '未读文章'}
                  {filterType === 'favorite' && '收藏文章'}
                </h2>
                <p className="text-sm text-zinc-500">
                  共 {filteredArticles.length} 篇
                  {unreadCount > 0 && ` · ${unreadCount} 篇未读`}
                </p>
              </div>
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  全部标记为已读
                </Button>
              )}
            </div>

            {/* Articles Grid/List */}
            {filteredArticles.length === 0 ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                    <Filter className="h-8 w-8 text-zinc-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">没有文章</h3>
                  <p className="text-sm text-zinc-500">
                    {searchQuery
                      ? `未找到包含 "${searchQuery}" 的文章`
                      : filterType === 'unread'
                      ? '没有未读文章'
                      : filterType === 'favorite'
                      ? '还没有收藏文章'
                      : subscriptions.length === 0
                      ? '还没有添加订阅源'
                      : '没有文章'}
                  </p>
                  {subscriptions.length === 0 && (
                    <Button onClick={() => console.log('Add subscription')}>
                      <Plus className="mr-2 h-4 w-4" />
                      添加第一个订阅
                    </Button>
                  )}
                  {searchQuery && (
                    <Button variant="outline" onClick={() => setSearchQuery('')}>
                      清除搜索
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3'
                    : 'space-y-4'
                }
              >
                {filteredArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onRead={markAsRead}
                    onFavorite={toggleFavorite}
                    onVisit={handleVisit}
                    compact={viewMode === 'grid'}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
