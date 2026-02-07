'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Filter,
  X,
  Clock,
  Calendar,
  Tag,
  Download,
  Upload,
  Zap,
} from 'lucide-react'
import { ArticleCard } from '@/components/ArticleCard'
import { Card, CardContent } from '@/components/ui/card'

export default function AdvancedSearchPage() {
  const {
    filteredArticles,
    subscriptions,
    filterType,
    setFilterType,
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
  } = useApp()

  const [dateRange, setDateRange] = useState<'7days' | '30days' | 'all'>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)

  // 获取所有标签
  useEffect(() => {
    const allTags = new Set<string>()
    articles.forEach((article) => {
      article.tags?.forEach((tag) => allTags.add(tag))
    })
    setSelectedTags(Array.from(allTags).sort())
  }, [filteredArticles])

  // 过滤文章
  const articlesByDate = filteredArticles.filter((article) => {
    const now = Date.now()
    const articleDate = article.pubDate

    if (dateRange === '7days' && now - articleDate > 7 * 24 * 60 * 60 * 1000) {
      return false
    }
    if (dateRange === '30days' && now - articleDate > 30 * 24 * 60 * 60 * 1000) {
      return false
    }

    return true
  })

  const articlesByTag = articlesByDate.filter((article) => {
    if (selectedTags.length === 0) return true
    return article.tags?.some((tag) => selectedTags.includes(tag))
  })

  const filteredAdvancedArticles = articlesByTag

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag)
      } else {
        return [...prev, tag]
      }
    })
  }

  const handleExportOPML = () => {
    const opml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="1.0">
  <head>
    <title>OPML 导出</title>
  </head>
  <body>
    <outline text="我的订阅">
${subscriptions.map((sub) => `      <outline text="${sub.title}" title="${sub.description || ''}" htmlUrl="${sub.url}" xmlUrl="${sub.url}" type="rss" />`).join('\n')}
    </outline>
  </body>
</opml>`

    // 创建下载
    const blob = new Blob([opml], { type: 'text/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'subscriptions.opml'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClearFilters = () => {
    setFilterType('all')
    setSearchQuery('')
    setDateRange('all')
    setSelectedTags([])
  }

  const popularTags = selectedTags.slice(0, 10)

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm dark:bg-zinc-950/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">高级搜索</h1>
            <Button variant="ghost" onClick={() => window.history.back()}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 text-zinc-400" />
              <Input
                type="search"
                placeholder="搜索文章标题、内容、作者..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={handleClearFilters}>
              <X className="h-4 w-4 mr-2" />
              清除
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent>
              <div className="space-y-4">
                {/* Date Range */}
                <div>
                  <label className="text-sm font-medium mb-2">时间范围</label>
                  <div className="flex gap-2">
                    <Button
                      variant={dateRange === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDateRange('all')}
                    >
                      全部
                    </Button>
                    <Button
                      variant={dateRange === '7days' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDateRange('7days')}
                    >
                      近7天
                    </Button>
                    <Button
                      variant={dateRange === '30days' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDateRange('30days')}
                    >
                      近30天
                    </Button>
                  </div>
                </div>

                {/* Tags Filter */}
                <div>
                  <label className="text-sm font-medium mb-2">
                    标签 ({selectedTags.length}/{popularTags.length})
                  </label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {popularTags.map((tag) => (
                      <Button
                        key={tag}
                        variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                  {selectedTags.length > 0 && (
                    <Button variant="outline" size="sm" onClick={() => setSelectedTags([])}>
                      清除标签
                    </Button>
                  )}
                </div>

                {/* Sort Order */}
                <div>
                  <label className="text-sm font-medium mb-2">排序方式</label>
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">最新在前</SelectItem>
                      <SelectItem value="asc">最旧在前</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Advanced Toggle */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {showAdvanced ? '隐藏高级选项' : '显示高级选项'}
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportOPML}>
                      <Download className="h-4 w-4 mr-2" />
                      导出 OPML
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Options */}
          {showAdvanced && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">高级选项</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowAdvanced(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filter by Subscription */}
                <div>
                  <label className="text-sm font-medium mb-2">按订阅源过滤</label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部订阅</SelectItem>
                      {subscriptions.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filter by Read Status */}
                <div>
                  <label className="text-sm font-medium mb-2">按阅读状态过滤</label>
                  <div className="flex gap-2">
                    <Button
                      variant={filterType === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterType('all')}
                    >
                      全部
                    </Button>
                    <Button
                      variant={filterType === 'unread' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterType('unread')}
                    >
                      未读
                    </Button>
                    <Button
                      variant={filterType === 'favorite' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterType('favorite')}
                    >
                      已收藏
                    </Button>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <Calendar className="h-6 w-6 mx-auto mb-2 text-zinc-400" />
                      <div className="text-2xl font-bold">
                        {filteredAdvancedArticles.length}
                      </div>
                      <div className="text-sm text-zinc-500">
                        匹配文章
                      </div>
                    </div>
                    <div>
                      <Clock className="h-6 w-6 mx-auto mb-2 text-zinc-400" />
                      <div className="text-2xl font-bold">
                        {dateRange === 'all' ? '-' : dateRange === '7days' ? '7' : '30'}
                      </div>
                      <div className="text-sm text-zinc-500">
                        天内
                      </div>
                    </div>
                    <div>
                      <Tag className="h-6 w-6 mx-auto mb-2 text-zinc-400" />
                      <div className="text-2xl font-bold">
                        {selectedTags.length}
                      </div>
                      <div className="text-sm text-zinc-500">
                        已选标签
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                搜索结果 ({filteredAdvancedArticles.length})
              </h2>
              <div className="text-sm text-zinc-500">
                {dateRange === 'all'
                  ? '显示全部文章'
                  : dateRange === '7days'
                  ? '显示最近7天的文章'
                  : '显示最近30天的文章'}
              </div>
            </div>
          </div>

          {filteredAdvancedArticles.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <Search className="h-12 w-12 mx-auto mb-4 text-zinc-300" />
                <h3 className="text-lg font-semibold mb-2">没有找到文章</h3>
                <p className="text-sm text-zinc-500">
                  {searchQuery
                    ? `未找到包含 "${searchQuery}" 的文章`
                    : '尝试调整搜索条件或清除过滤'}
                </p>
                <Button onClick={handleClearFilters}>
                  <Zap className="h-4 w-4 mr-2" />
                  清除所有过滤
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredAdvancedArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onRead={(id) => console.log('Mark as read:', id)}
                  onFavorite={(id) => console.log('Toggle favorite:', id)}
                  onVisit={(link) => window.open(link, '_blank')}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
