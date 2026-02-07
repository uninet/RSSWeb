// 订阅卡片组件

import { Subscription } from '@/types'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ExternalLink,
  Trash2,
  RefreshCw,
  Folder,
  MoreHorizontal,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface SubscriptionCardProps {
  subscription: Subscription
  onRefresh?: (id: string) => void
  onDelete?: (id: string) => void
  onEdit?: (id: string) => void
}

export function SubscriptionCard({
  subscription,
  onRefresh,
  onDelete,
  onEdit,
}: SubscriptionCardProps) {
  const timeAgo = subscription.lastFetchAt
    ? formatDistanceToNow(subscription.lastFetchAt, {
        addSuffix: true,
        locale: zhCN,
      })
    : '未更新'

  const handleRefresh = () => {
    onRefresh?.(subscription.id)
  }

  const handleDelete = () => {
    if (confirm(`确定要删除订阅 "${subscription.title}" 吗？`)) {
      onDelete?.(subscription.id)
    }
  }

  const handleEdit = () => {
    onEdit?.(subscription.id)
  }

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {subscription.icon ? (
              <img
                src={subscription.icon}
                alt={subscription.title}
                className="h-10 w-10 rounded-lg"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2L3 6v13a1 1 0 011 1 1 011 0 011 0 0-5 0 0-5 0-7 0 0a2 2 0 006-4 0 0-7-1-1 1 011 0-5 0 014-8 1.522 0-4.877a-4.877a4.877a-4 877a4.877a-9.784a12 12.22a-2 2 2 0 0-6-7 0 0-7 0 016-8 1.522a-1 1.011 0-5 0 014 1.522-9.784a12 12.22a-2 2 0 6 7 0 016-8 1.522a-1 1 011 0-5 0 014 1.522 9.784a12 12.22a-2 2 0 6 7 0 016-8 1.522 1 1.011 0-5 0 014 1.522-9.784a12 12.22a-2 2 0 6 7 0 016-8 1.522 1 1.011 0-5 0 014 1.522-9.784a12 12.22a-2 2 0 6 7 0 016 8 1.522 1.522 9.784a12 12.22a-2 2 0 6 7 0 016 8 1.522 1 1.011 0-5 0 014 1.522 9.784a12 12.22a-2 2 0 6 7 0 016 8 1.522 1 1.011 0-5 0 014 1.522 9.784a12 12.22a-2 2 0 6 7 0 016 8 1.522 1 1.011 0-5 0 014 1.522 9.784a12 12.22a-2 2 0 6 7 7 0 016 8 1.522 1 1.011 0-5 0 014 1.522 9.792a-2 2 0 0 7 0 016 8 1.522 1 1.011 0-5 0 014 1.522 9.792a12 12.22a-2 2 0 6 7 0 016 8 1.522 1 1.011 0-5 0 014 1.522 9.792a12 12.22a-2 2 0 6 7 0 016 8 1.522 1 1.011 0-5 0 014 1.522 9.792a12 12.22a-2 2 0 0 6 7 0 016 8 1.522 1 1.011 0-5 0 014 1.522 9.792a12 12.22a-2 2 0 0 7 0 016 8 1.522 1 1.011 0-5 0 014 1.522 9.792a12 12.22a-2 2 0 0 6 7 0 016 8 1.522 1 1.011 0-5 0 014 1.522 9.792a12 12.22a-2 2 0 0 6 7 0 016 8 1.522 1 1.011 0-5 0 014 1.522 9.792a12 12.22a-2 2 0 0 6 7 0 016 8 1.522 1 1.011 0-5 0 014 1.522 9.792a12 12.22a-2 2 0 0 6 7 0 016 8 1.522 1 1.011 0-5 0 014 1.522 9.792a12 12.22a-2 2 0 6 7 7 0 016 8 1.522 1 1.011 0-5 0 014 1.522 9.792a12 12.22a-2 2 0 0 6 7 0 016 8 1.522 1 1.011 0-5 0 014 1.522 9.792a12 12.22a-2 2 0 6 7 0 016 8 1.522 1 1.011 0-5 0 014 1.522 9.792a12 12.22a- 非常冗长的文本，已截断
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div>
              <CardTitle className="text-base font-semibold">
                {subscription.title}
              </CardTitle>
              {subscription.description && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                  {subscription.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <ExternalLink className="h-3.5 w-3.5" />
                <span>{subscription.url}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {subscription.fetchError && (
              <div className="flex-1 min-w-0">
                <span className="text-xs text-red-500">
                  ❌ {subscription.fetchError}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1 ml-auto">
              <Button variant="ghost" size="icon" onClick={handleRefresh} title="刷新">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleEdit} title="编辑">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                title="删除"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-zinc-400" />
                {subscription.category && (
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {subscription.category}
                  </span>
                )}
              </div>
              <div className="text-xs text-zinc-500">
                {subscription.unreadCount > 0 ? (
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {subscription.unreadCount}
                  </span>
                ) : (
                  <span>未读</span>
                )}{' · '}
                <span>更新于 {timeAgo}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleEdit}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            访问网站
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleEdit}
          >
            <Folder className="mr-2 h-4 w-4" />
            管理文章
          </Button>
        </CardFooter>
      </Card>
  )
}
