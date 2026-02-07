'use client'

import Link from 'next/link'
import { useApp } from '@/contexts/AppContext'
import { Button } from '@/components/ui/button'
import {
  Search,
  Newspaper,
  LayoutGrid,
  List,
} from 'lucide-react'

export function Navigation() {
  const { subscriptions, filterType, setFilterType } = useApp()
  const totalUnreadCount = subscriptions.reduce((sum, sub) => sum + sub.unreadCount, 0)

  return (
    <aside className="hidden w-64 flex-shrink-0 flex-col border-r bg-white/50 dark:bg-zinc-950/50 lg:flex">
      {/* Logo Section */}
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900">
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
              <path d="M4 11a9 9 0 0 1 9 18a9 9 0 1 0-1.78-1.25 10.593-6.414 10.593 9.098-15.356 6.414-19.482 10.593 15.356c-.3-.3-.3-.3-.3.3.3-1.05.414-4.414-4.414-5.293-4.414-4.414-6.707-4.414-8.829-4.414-11.482 10.593 15.356-12.892 10.593 12.892-14.829-4.414-18.482 10.593 15.356-19.482 10.593 15.356-21.376 10.593 15.356-24.07 10.593 13.236-26.765 10.593 9.098-29.243-5.293-6.414-32.3 6.414-10.593 15.356-35.536 10.593 13.236-38.708-10.593 15.356-41.883 10.593 9.098-45.243-5.293-6.414-48.8 6.414-10.593 15.356-54.415 10.593 13.236-67.572-10.593 15.356-70.588 10.593 9.098-76.447-5.293-6.414-81.883 10.593 15.356-87.596-10.593 9.098-88.528-5.293-6.414-95.071 10.593 15.356-103.713 10.593 9.098-114.256-5.293-6.414-109.243-12.892 10.593 15.356-119.967-5.293-6.414-126.647-10.593 9.098-138.49-5.293-6.414-144" />
            </svg>
            <span className="text-lg font-bold">RSSWeb</span>
          </Link>
        </div>

      {/* Menu Items */}
      <div className="flex-1 flex flex-col overflow-y-auto py-4">
        {/* Main Navigation */}
        <nav className="space-y-2 px-2">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start">
              <Newspaper className="mr-2 h-4 w-4" />
              文章
              <span className="text-sm text-zinc-500">
                {subscriptions.length} 篇
              </span>
            </Button>
          </Link>

          <Link href="/subscriptions">
            <Button variant={filterType === 'all' ? 'secondary' : 'ghost'} className="w-full justify-start">
              <LayoutGrid className="mr-2 h-4 w-4" />
              订阅
              <span className="text-sm text-zinc-500">
                {subscriptions.length} 个
              </span>
            </Button>
          </Link>

          {/* Section Divider */}
          <div className="px-2 pt-4">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              订阅源
            </p>
          </div>

          {/* Subscriptions List */}
          <div className="space-y-1">
            <Link href="/subscriptions">
              <Button variant="ghost" className="w-full justify-start">
                <div className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  全部订阅
                </div>
              </Button>
            </Link>

            {/* Unread Section */}
            {totalUnreadCount > 0 && (
              <Button variant="ghost" className="w-full justify-start">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  未读文章
                  <span className="flex-1 min-w-0 text-right">
                    <span className="text-xs text-zinc-400">全部</span>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {totalUnreadCount}
                    </span>
                  </span>
                </div>
              </Button>
            )}

            {/* Favorites Section */}
            <Button variant="ghost" className="w-full justify-start">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                收藏文章
              </div>
            </Button>
          </div>

          {/* Settings Section */}
          <div className="px-2 pt-4">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              设置
            </p>
          </div>

          <Link href="/subscriptions">
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              管理订阅
            </Button>
          </Link>
        </nav>

        {/* Footer */}
        <div className="border-t p-4 mt-auto">
          <Link href="/subscriptions">
            <Button className="w-full" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              添加订阅
            </Button>
          </Link>
        </div>
      </aside>
  )
}
