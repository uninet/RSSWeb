'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Folder,
} from 'lucide-react'
import { SubscriptionCard } from './SubscriptionCard'
import { SubscriptionForm } from './SubscriptionForm'
import { useApp } from '@/contexts/AppContext'

export function SubscriptionList() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'tech' | 'news' | 'blog' | 'other'>('all')

  const { subscriptions, addSubscription } = useApp()

  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (filterType === 'all') return true
    if (filterType === 'other') {
      return !sub.category || sub.category === 'other'
    }
    return sub.category === filterType
  })

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
  }

  const getSubscriptionsByCategory = (categoryId: string) => {
    return subscriptions.filter((sub) => sub.category === categoryId)
  }

  const categories = [
    { id: 'all', name: '全部', count: subscriptions.length },
    { id: 'tech', name: '技术', count: getSubscriptionsByCategory('tech').length },
    { id: 'news', name: '新闻', count: getSubscriptionsByCategory('news').length },
    { id: 'blog', name: '博客', count: getSubscriptionsByCategory('blog').length },
    { id: 'other', name: '其他', count: getSubscriptionsByCategory('other').length },
  ]

  const totalUnreadCount = subscriptions.reduce((sum, sub) => sum + sub.unreadCount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {showAddForm ? '添加订阅' : '我的订阅'}
          </h2>
          <p className="text-sm text-zinc-500">
            共 {subscriptions.length} 个订阅源 · {totalUnreadCount} 篇未读
          </p>
        </div>
        <Button
          size="icon"
          variant="outline"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? (
            <MoreHorizontal className="h-4 w-4" />
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              添加订阅
            </>
          )}
        </Button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <SubscriptionForm
          onCancel={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false)
          }}
        />
      )}

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 text-zinc-400" />
          <Input
            type="search"
            placeholder="搜索订阅源..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="tech">技术</SelectItem>
            <SelectItem value="news">新闻</SelectItem>
            <SelectItem value="blog">博客</SelectItem>
            <SelectItem value="other">其他</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b pb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterType(cat.id as any)}
            className={`relative pb-3 transition-colors ${
              filterType === cat.id
                ? 'text-zinc-900 border-zinc-900'
                : 'text-zinc-500 border-zinc-500 hover:text-zinc-700'
            }`}
          >
            <span className="relative flex items-center gap-2">
              {cat.count > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 text-white text-xs">
                  {cat.count > 99 ? '99+' : cat.count}
                </span>
              )}
              {cat.name}
            </span>
            {filterType === cat.id && (
              <span className="absolute -bottom-px left-0 right-0 h-0.5 w-full bg-zinc-900 transition-all" />
            )}
          </button>
        ))}
      </div>

      {/* Subscriptions Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSubscriptions.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="mx-auto max-w-sm space-y-4">
              <div className="mx-auto w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                <Folder className="h-8 w-8 text-zinc-400" />
              </div>
              <h3 className="text-lg font-semibold">没有订阅</h3>
              <p className="text-sm text-zinc-500">
                {filterType === 'all' && '还没有添加任何订阅源'}
                {filterType !== 'all' && `"${categories.find((c) => c.id === filterType)?.name || filterType}" 分类下没有订阅`}
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                添加第一个订阅
              </Button>
            </div>
          </div>
        )}

        {filteredSubscriptions.map((subscription) => (
          <SubscriptionCard
            key={subscription.id}
            subscription={subscription}
            onRefresh={(id) => console.log('Refresh:', id)}
            onDelete={(id) => console.log('Delete:', id)}
            onEdit={(id) => console.log('Edit:', id)}
          />
        ))}
      </div>
    </div>
  )
}
