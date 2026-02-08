'use client'

import { Search, RefreshCw, Sun, Moon, Monitor, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '@/contexts/AppContext'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/utils'

export function Header() {
  const {
    searchQuery,
    setSearchQuery,
    refreshAllSubscriptions
  } = useApp()
  
  const { theme, setTheme, toggleTheme, resolvedTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleRefresh = async () => {
    await refreshAllSubscriptions()
  }

  const handleExportPDF = () => {
    window.location.href = '/pdf-export'
  }

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* 移动端搜索遮罩层 */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      <header className="border-b bg-white dark:bg-zinc-950">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* 左侧：Logo 和搜索（移动端隐藏搜索） */}
          <div className="flex items-center gap-6 flex-1">
            {/* 移动端菜单按钮 */}
            <button
              onClick={handleMobileMenuToggle}
              className="md:hidden p-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              RSSWeb
            </h1>

            {/* 桌面端搜索框 */}
            <div className="relative hidden md:flex flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="搜索文章..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "w-full pl-10 pr-4 py-2 text-sm",
                  "bg-zinc-100 dark:bg-zinc-900",
                  "border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500",
                  "rounded-lg outline-none transition-all",
                  "text-zinc-900 dark:text-zinc-50",
                  "placeholder:text-zinc-400"
                )}
              />
            </div>
          </div>

          {/* 桌面端操作按钮 */}
          <div className="hidden md:flex items-center gap-2">
            {/* 主题切换按钮 */}
            <div className="relative group">
              <button
                onClick={toggleTheme}
                className="p-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
                title="切换主题"
              >
                {resolvedTheme === 'dark' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </button>
              
              {/* 主题选择下拉菜单 */}
              <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="p-1">
                  <button
                      onClick={() => setTheme('light')}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                        "hover:bg-zinc-100 dark:hover:bg-zinc-900",
                        "text-zinc-700 dark:text-zinc-300",
                        theme === 'light' && "bg-zinc-100 dark:bg-zinc-900 font-medium"
                      )}
                  >
                    <Sun className="h-4 w-4" />
                    浅色
                  </button>
                  <button
                      onClick={() => setTheme('dark')}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                        "hover:bg-zinc-100 dark:hover:bg-zinc-900",
                        "text-zinc-700 dark:text-zinc-300",
                        theme === 'dark' && "bg-zinc-100 dark:bg-zinc-900 font-medium"
                      )}
                  >
                    <Moon className="h-4 w-4" />
                    深色
                  </button>
                  <button
                      onClick={() => setTheme('system')}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                        "hover:bg-zinc-100 dark:hover:bg-zinc-900",
                        "text-zinc-700 dark:text-zinc-300",
                        theme === 'system' && "bg-zinc-100 dark:bg-zinc-900 font-medium"
                      )}
                  >
                    <Monitor className="h-4 w-4" />
                    跟随系统
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              刷新
            </button>
          </div>
        </div>

        {/* 移动端操作菜单 */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shadow-lg z-50">
            <div className="p-4 space-y-4">
              {/* 搜索框 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="搜索文章..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "w-full pl-10 pr-4 py-2.5 text-sm",
                    "bg-zinc-100 dark:bg-zinc-900",
                    "border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500",
                    "rounded-lg outline-none transition-all",
                    "text-zinc-900 dark:text-zinc-50",
                    "placeholder:text-zinc-400"
                  )}
                />
              </div>

              {/* 操作按钮 */}
              <div className="space-y-2">
                <button
                  onClick={handleRefresh}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  刷新订阅
                </button>

                <button
                  onClick={() => window.location.href = '/pdf-export'}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                >
                  导出 PDF
                </button>

                <button
                  onClick={() => window.location.href = '/import-export'}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                >
                  导入/导出
                </button>

                <button
                  onClick={() => window.location.href = '/subscriptions'}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                >
                  订阅管理
                </button>

                {/* 主题切换 */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 px-2">
                    主题
                  </p>
                  <button
                    onClick={() => setTheme('light')}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Sun className="h-4 w-4" />
                    浅色
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Moon className="h-4 w-4" />
                    深色
                  </button>
                  <button
                    onClick={() => setTheme('system')}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Monitor className="h-4 w-4" />
                    跟随系统
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
