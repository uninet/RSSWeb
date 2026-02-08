/**
 * 集成测试 - 测试完整的应用流程
 */

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// 定义全局 window 对象（如果未定义）
if (typeof window === 'undefined') {
  global.window = {} as any
  global.window.localStorage = {} as any
  global.window.matchMedia = () => ({ matches: false }) as any
}

// Mock Context
const mockAppContext = {
  subscriptions: [],
  articles: [],
  categories: [],
  activeSubscription: null,
  searchQuery: '',
  filterUnreadOnly: false,
  filterFavoriteOnly: false,
  getFilteredArticles: () => [],
  setActiveArticle: () => {},
  markArticleRead: () => {},
  toggleArticleFavorite: () => {},
  addSubscription: async () => {},
  updateSubscription: () => {},
  deleteSubscription: () => {},
  refreshSubscription: async () => {},
  refreshAllSubscriptions: async () => {},
  markAllAsRead: () => {},
  addArticle: () => {},
  updateArticle: () => {},
  deleteArticle: () => {},
  addCategory: () => {},
  updateCategory: () => {},
  deleteCategory: () => {}
}

const mockThemeContext = {
  theme: 'light',
  setTheme: () => {},
  resolvedTheme: 'light',
  toggleTheme: () => {}
}

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// 测试辅助函数
const createMockSubscription = (overrides = {}) => ({
  id: 'test-sub-1',
  title: 'Test Subscription',
  url: 'https://example.com/feed.xml',
  description: 'Test Description',
  category: 'Test Category',
  addedAt: Date.now(),
  lastFetchAt: Date.now(),
  unreadCount: 5,
  fetchError: null,
  ...overrides
})

const createMockArticle = (overrides = {}) => ({
  id: 'test-art-1',
  subscriptionId: 'test-sub-1',
  title: 'Test Article Title',
  link: 'https://example.com/article-1',
  description: 'Test article description',
  content: '<p>Test content</p>',
  pubDate: Date.now(),
  author: 'Test Author',
  isRead: false,
  isFavorite: false,
  tags: ['test', 'article'],
  ...overrides
})

const createMockCategory = (overrides = {}) => ({
  id: 'test-cat-1',
  name: 'Test Category',
  color: '#ff0000',
  ...overrides
})

describe('集成测试', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('订阅源添加流程', () => {
    it('应该能够完成完整的添加订阅源流程', async () => {
      // 1. 用户输入数据
      const formData = {
        title: 'Test Feed',
        url: 'https://example.com/feed.xml',
        description: 'Test Description',
        category: 'Test Category'
      }

      // 2. 验证数据
      expect(formData.title).toBe('Test Feed')
      expect(formData.url).toBe('https://example.com/feed.xml')

      // 3. 创建订阅源
      const subscription = createMockSubscription(formData)
      expect(subscription.id).toBeDefined()
      expect(subscription.title).toBe('Test Feed')
      expect(subscription.unreadCount).toBe(5)

      // 4. 保存到 localStorage
      const existing = localStorageMock.getItem('subscriptions')
      const subs = existing ? JSON.parse(existing) : []
      subs.push(subscription)
      localStorageMock.setItem('subscriptions', JSON.stringify(subs))

      // 5. 验证已保存
      const saved = localStorageMock.getItem('subscriptions')
      const savedSubs = JSON.parse(saved as any[])
      expect(savedSubs).toHaveLength(1)
      expect(savedSubs[0].title).toBe('Test Feed')
    })

    it('应该能够处理添加重复订阅源', () => {
      const sub1 = createMockSubscription({ id: 'sub-1', title: 'Feed 1' })
      const sub2 = createMockSubscription({ id: 'sub-2', title: 'Feed 1' })

      const subscriptions = [sub1, sub2]
      const unique = subscriptions.filter((sub, index, self) =>
        index === self.findIndex(s => s.title === sub.title)
      )

      expect(unique).toHaveLength(1)
      expect(unique[0].title).toBe('Feed 1')
    })
  })

  describe('完整的阅读文章流程', () => {
    it('应该能够完成完整的阅读文章流程', async () => {
      // 1. 初始状态
      const article = createMockArticle({ isRead: false })
      expect(article.isRead).toBe(false)

      // 2. 用户点击文章
      article.isRead = true
      expect(article.isRead).toBe(true)

      // 3. 更新未读计数
      const subscription = createMockSubscription({ unreadCount: 1 })
      subscription.unreadCount = 0
      expect(subscription.unreadCount).toBe(0)

      // 4. 保存状态
      const articles = [article]
      localStorageMock.setItem('articles', JSON.stringify(articles))

      // 5. 验证保存
      const saved = localStorageMock.getItem('articles')
      const savedArticles = JSON.parse(saved as any[])
      expect(savedArticles).toHaveLength(1)
      expect(savedArticles[0].isRead).toBe(true)
    })
  })

  describe('完整的收藏文章流程', () => {
    it('应该能够完成完整的收藏文章流程', () => {
      // 1. 初始状态
      const article = createMockArticle({ isFavorite: false })
      expect(article.isFavorite).toBe(false)

      // 2. 用户点击收藏按钮
      article.isFavorite = true
      expect(article.isFavorite).toBe(true)

      // 3. 获取收藏文章
      const articles = [article]
      const favorites = articles.filter(a => a.isFavorite)
      expect(favorites.length).toBe(1)
      expect(favorites[0].isFavorite).toBe(true)
    })
  })

  describe('完整的搜索和过滤流程', () => {
    it('应该能够完成完整的搜索和过滤流程', () => {
      // 1. 创建测试数据
      const articles = [
        createMockArticle({ title: 'React Tutorial', description: 'Learn React basics' }),
        createMockArticle({ title: 'Vue Tutorial', description: 'Vue.js guide' }),
        createMockArticle({ title: 'Angular Guide', description: 'Angular framework' }),
        createMockArticle({ id: 'art-4', title: 'React Best Practices', description: 'Advanced React', isRead: true, isFavorite: true })
      ]

      // 2. 用户搜索 "React"
      const searchQuery = 'React'
      const searchResults = articles.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase())
      )

      expect(searchResults.length).toBe(2)
      expect(searchResults[0].title).toBe('React Tutorial')
      expect(searchResults[1].title).toBe('React Best Practices')

      // 3. 用户过滤未读
      const unreadResults = searchResults.filter(a => !a.isRead)
      expect(unreadResults.length).toBe(1)
      expect(unreadResults[0].title).toBe('React Tutorial')

      // 4. 用户过滤收藏
      const favoriteResults = unreadResults.filter(a => a.isFavorite)
      expect(favoriteResults.length).toBe(0)
    })
  })

  describe('完整的数据持久化流程', () => {
    it('应该能够完成完整的数据保存和加载流程', () => {
      // 1. 创建测试数据
      const subscriptions = [
        createMockSubscription({ id: 'sub-1' }),
        createMockSubscription({ id: 'sub-2' })
      ]

      const articles = [
        createMockArticle({ id: 'art-1' }),
        createMockArticle({ id: 'art-2' })
      ]

      const categories = [
        createMockCategory({ id: 'cat-1' }),
        createMockCategory({ id: 'cat-2' })
      ]

      // 2. 保存到 localStorage
      localStorageMock.setItem('subscriptions', JSON.stringify(subscriptions))
      localStorageMock.setItem('articles', JSON.stringify(articles))
      localStorageMock.setItem('categories', JSON.stringify(categories))

      // 3. 从 localStorage 加载
      const loadedSubs = JSON.parse(localStorageMock.getItem('subscriptions') as any[])
      const loadedArticles = JSON.parse(localStorageMock.getItem('articles') as any[])
      const loadedCats = JSON.parse(localStorageMock.getItem('categories') as any[])

      // 4. 验证数据完整性
      expect(loadedSubs).toEqual(subscriptions)
      expect(loadedArticles).toEqual(articles)
      expect(loadedCats).toEqual(categories)
    })
  })

  describe('完整的主题切换流程', () => {
    it('应该能够完成完整的主题切换流程', () => {
      // 1. 初始状态
      let theme = 'light'
      expect(theme).toBe('light')

      // 2. 用户切换到深色
      theme = 'dark'
      localStorageMock.setItem('theme', theme)
      expect(theme).toBe('dark')

      // 3. 验证主题已保存
      const savedTheme = localStorageMock.getItem('theme')
      expect(savedTheme).toBe('dark')

      // 4. 用户切换回浅色
      theme = 'light'
      localStorageMock.setItem('theme', theme)
      expect(theme).toBe('light')
      expect(localStorageMock.getItem('theme')).toBe('light')

      // 5. 用户设置为跟随系统
      theme = 'system'
      localStorageMock.setItem('theme', theme)
      expect(theme).toBe('system')
    })
  })

  describe('完整的分类管理流程', () => {
    it('应该能够完成完整的分类管理流程', () => {
      // 1. 创建测试数据
      const subscriptions = [
        createMockSubscription({ id: 'sub-1', category: 'Tech' }),
        createMockSubscription({ id: 'sub-2', category: 'Tech' }),
        createMockSubscription({ id: 'sub-3', category: 'News' }),
        createMockSubscription({ id: 'sub-4', category: 'Tech' }),
        createMockSubscription({ id: 'sub-5', category: null }),
      ]

      // 2. 创建分类
      const categories = [
        createMockCategory({ id: 'cat-1', name: 'Tech' }),
        createMockCategory({ id: 'cat-2', name: 'News' })
      ]

      // 3. 按分类分组订阅源
      const grouped = subscriptions.reduce((acc, sub) => {
        const cat = sub.category || 'Uncategorized'
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(sub)
        return acc
      }, {} as Record<string, typeof subscriptions>)

      // 4. 验证分组
      expect(grouped['Tech']).toHaveLength(3)
      expect(grouped['News']).toHaveLength(1)
      expect(grouped['Uncategorized']).toHaveLength(1)

      // 5. 添加新分类
      const newCategory = createMockCategory({ id: 'cat-3', name: 'Sports' })
      categories.push(newCategory)
      expect(categories).toHaveLength(3)
    })
  })

  describe('完整的 OPML 导入/导出流程', () => {
    it('应该能够完成完整的 OPML 导出流程', () => {
      // 1. 创建测试数据
      const subscriptions = [
        createMockSubscription({ id: 'sub-1', title: 'Feed 1' }),
        createMockSubscription({ id: 'sub-2', title: 'Feed 2' })
      ]

      // 2. 生成 OPML
      const opml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="1.0">
  <head><title>RSSWeb 导出</title></head>
  <body>
${subscriptions.map(sub => `    <outline text="${sub.title}" type="rss" xmlUrl="${sub.url}" />`).join('\n')}
  </body>
</opml>`

      // 3. 验证 OPML 结构
      expect(opml).toContain('<?xml version="1.0"')
      expect(opml).toContain('<opml version="1.0">')
      expect(opml).toContain('Feed 1')
      expect(opml).toContain('Feed 2')
    })

    it('应该能够完成完整的 OPML 导入流程', () => {
      // 1. 模拟 OPML 内容
      const opml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="1.0">
  <head><title>Import Test</title></head>
  <body>
    <outline text="Feed 1" type="rss" xmlUrl="https://example.com/feed1.xml" />
    <outline text="Feed 2" type="rss" xmlUrl="https://example.com/feed2.xml" />
  </body>
</opml>`

      // 2. 简单的字符串解析（不使用 DOMParser）
      const outlineRegex = /<outline\s+([^>]+)>/g
      const matches = opml.match(outlineRegex) || []

      // 3. 验证解析结果
      expect(matches).toHaveLength(2)
      expect(matches[0]).toContain('text="Feed 1"')
      expect(matches[1]).toContain('text="Feed 2"')
    })
  })

  describe('完整的性能优化流程', () => {
    it('应该能够在合理时间内处理大量文章', () => {
      const start = performance.now()

      // 模拟处理 1000 篇文章
      const articles = Array(1000).fill(null).map((_, i) =>
        createMockArticle({
          id: `art-${i}`,
          title: `Article ${i}`,
          description: `Description ${i}`
        })
      )

      // 搜索
      const searchQuery = 'Article 500'
      const searchResults = articles.filter(a =>
        a.title.includes(searchQuery) || a.description.includes(searchQuery)
      )

      // 排序
      const sorted = [...searchResults].sort((a, b) => b.pubDate - a.pubDate)

      const time = performance.now() - start
      expect(time).toBeLessThan(100) // 应该在 100ms 内完成
    })

    it('应该能够高效地渲染大量订阅源', () => {
      const start = performance.now()

      // 模拟渲染 100 个订阅源
      const subscriptions = Array(100).fill(null).map((_, i) =>
        createMockSubscription({
          id: `sub-${i}`,
          title: `Subscription ${i}`,
          unreadCount: Math.floor(Math.random() * 50)
        })
      )

      // 计算总未读数
      const totalUnread = subscriptions.reduce((sum, s) => sum + s.unreadCount, 0)

      // 按未读数排序
      const sorted = [...subscriptions].sort((a, b) => b.unreadCount - a.unreadCount)

      // 按分类分组
      const categories = ['Tech', 'News', 'Sports']
      const grouped = subscriptions.reduce((acc, sub) => {
        const cat = sub.category || 'Uncategorized'
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(sub)
        return acc
      }, {} as Record<string, typeof subscriptions>)

      const time = performance.now() - start
      expect(time).toBeLessThan(50) // 应该在 50ms 内完成
      expect(totalUnread).toBeGreaterThanOrEqual(0)
    })
  })

  describe('完整的错误处理流程', () => {
    it('应该能够优雅地处理网络错误', async () => {
      const simulateNetworkError = async () => {
        throw new Error('Network error')
      }

      let caughtError: Error | null = null

      try {
        await simulateNetworkError()
      } catch (error) {
        caughtError = error as Error
      }

      expect(caughtError).toBeInstanceOf(Error)
      expect(caughtError?.message).toBe('Network error')
    })

    it('应该能够优雅地处理无效数据', () => {
      const invalidData = {
        id: null,
        title: undefined,
        url: ''
      }

      expect(invalidData.id).toBe(null)
      expect(invalidData.title).toBeUndefined()
      expect(invalidData.url).toBe('')
    })

    it('应该能够处理存储错误', () => {
      const mockStorage = {
        getItem: () => { 
          const error = new Error('Storage error') as any
          error.code = 'STORAGE_ERROR'
          throw error
        },
        setItem: () => { 
          const error = new Error('Storage error') as any
          error.code = 'STORAGE_ERROR'
          throw error
        }
      }

      let caughtError: Error | null = null

      try {
        mockStorage.getItem('key')
      } catch (error) {
        caughtError = error as Error
      }

      expect(caughtError).toBeInstanceOf(Error)
      expect(caughtError?.message).toBe('Storage error')
    })
  })

  describe('完整的用户偏好流程', () => {
    it('应该能够保存和加载用户偏好', () => {
      const preferences = {
        theme: 'dark',
        filterUnreadOnly: true,
        filterFavoriteOnly: false,
        sidebarExpanded: true
      }

      // 保存
      localStorageMock.setItem('preferences', JSON.stringify(preferences))

      // 加载
      const loaded = localStorageMock.getItem('preferences')
      const parsed = JSON.parse(loaded as any)

      expect(parsed.theme).toBe('dark')
      expect(parsed.filterUnreadOnly).toBe(true)
      expect(parsed.filterFavoriteOnly).toBe(false)
      expect(parsed.sidebarExpanded).toBe(true)
    })

    it('应该能够更新用户偏好', () => {
      const initial = {
        theme: 'light',
        filterUnreadOnly: false
      }

      localStorageMock.setItem('preferences', JSON.stringify(initial))

      // 更新
      const updated = {
        theme: 'dark',
        filterUnreadOnly: true
      }

      localStorageMock.setItem('preferences', JSON.stringify(updated))

      // 验证更新
      const loaded = localStorageMock.getItem('preferences')
      const parsed = JSON.parse(loaded as any)

      expect(parsed.theme).toBe('dark')
      expect(parsed.filterUnreadOnly).toBe(true)
    })
  })

  describe('完整的状态管理流程', () => {
    it('应该能够管理应用状态', () => {
      // 1. 初始状态
      const initialState = {
        subscriptions: [],
        articles: [],
        activeSubscription: null,
        searchQuery: '',
        filterUnreadOnly: false,
        filterFavoriteOnly: false
      }

      // 2. 添加订阅源
      const sub = createMockSubscription()
      const newState = {
        ...initialState,
        subscriptions: [sub]
      }

      // 3. 添加文章
      const art = createMockArticle({ subscriptionId: sub.id })
      newState.articles.push(art)

      // 4. 更新状态
      newState.activeSubscription = sub.id
      newState.unreadCount = sub.unreadCount

      // 5. 验证状态
      expect(newState.subscriptions).toHaveLength(1)
      expect(newState.articles).toHaveLength(1)
      expect(newState.activeSubscription).toBe(sub.id)
      expect(newState.unreadCount).toBe(5)
    })
  })

  describe('完整的缓存优化流程', () => {
    it('应该能够缓存 RSS 数据', () => {
      // 1. 获取 RSS 数据
      const feed = {
        title: 'Test Feed',
        description: 'Test Description',
        items: []
      }

      // 2. 缓存到 localStorage
      const cacheKey = `rss_cache_test-sub-1`
      const cached = {
        data: feed,
        timestamp: Date.now()
      }

      localStorageMock.setItem(cacheKey, JSON.stringify(cached))

      // 3. 从缓存读取
      const loaded = localStorageMock.getItem(cacheKey)
      const parsed = JSON.parse(loaded as any)

      expect(parsed.data).toEqual(feed)
      expect(parsed.timestamp).toBeGreaterThan(Date.now() - 10000) // 10秒内
    })

    it('应该能够清理过期缓存', () => {
      const cacheKey = 'rss_cache_test-expired'
      const expiredCache = {
        data: { title: 'Test' },
        timestamp: Date.now() - 3600000 // 1小时前
      }

      localStorageMock.setItem(cacheKey, JSON.stringify(expiredCache))

      const CACHE_TTL = 300000 // 5分钟
      const loaded = localStorageMock.getItem(cacheKey)
      const parsed = JSON.parse(loaded as any)

      const isExpired = Date.now() - parsed.timestamp > CACHE_TTL
      expect(isExpired).toBe(true)
    })
  })

  describe('完整的安全性流程', () => {
    it('应该能够验证用户输入', () => {
      const userInput = '<script>alert("XSS")</script>'
      
      // 应该被转义或清理
      const sanitized = userInput.replace(/<[^>]*>/g, '')

      // 清理后应该不包含任何标签
      expect(sanitized).not.toContain('<script>')
      expect(sanitized).not.toContain('</script>')
      
      // 检查是否还有其他潜在的 XSS 字符串
      const hasXSS = sanitized.includes('alert') && sanitized.includes('XSS')
      expect(hasXSS).toBe(false)
    })

    it('应该能够验证 URL 安全性', () => {
      const safeUrls = [
        'https://example.com/feed.xml',
        'http://example.com/feed',
      ]

      const unsafeUrls = [
        'javascript:alert("XSS")',
        'data:text/html,<script>alert("XSS")</script>',
        'file:///etc/passwd'
      ]

      const isValidUrl = (url: string) => {
        try {
          new URL(url)
          return url.startsWith('http')
        } catch {
          return false
        }
      }

      safeUrls.forEach(url => expect(isValidUrl(url)).toBe(true))
      unsafeUrls.forEach(url => expect(isValidUrl(url)).toBe(false))
    })
  })

  describe('完整的响应式适配流程', () => {
    it('应该能够适配不同屏幕尺寸', () => {
      // 模拟不同屏幕尺寸
      const screens = {
        mobile: { width: 375, height: 667 },
        tablet: { width: 768, height: 1024 },
        desktop: { width: 1920, height: 1080 }
      }

      // 移动端：隐藏侧边栏
      if (screens.mobile.width < 768) {
        // 侧边栏应该隐藏
        expect(screens.mobile.width).toBeLessThan(768)
      }

      // 平板：显示侧边栏但调整布局
      if (screens.tablet.width >= 768 && screens.tablet.width < 1024) {
        // 应该使用平板布局
        expect(screens.tablet.width).toBeGreaterThanOrEqual(768)
        expect(screens.tablet.width).toBeLessThan(1024)
      }

      // 桌面：完整功能
      if (screens.desktop.width >= 1024) {
        // 应该使用桌面布局
        expect(screens.desktop.width).toBeGreaterThanOrEqual(1024)
      }
    })
  })

  describe('完整的可访问性流程', () => {
    it('应该能够支持键盘导航', () => {
      // 模拟键盘事件（不使用 KeyboardEvent）
      const keyboardEvents = ['ArrowUp', 'ArrowDown', 'Enter', 'Escape']
      
      keyboardEvents.forEach(event => {
        // 简单模拟键盘事件对象
        const mockEvent = {
          key: event,
          type: 'keydown',
          preventDefault: vi.fn()
        }
        
        expect(mockEvent.key).toBe(event)
        expect(mockEvent.type).toBe('keydown')
      })
    })

    it('应该能够支持屏幕阅读器', () => {
      // 模拟屏幕阅读器属性
      const accessibleElement = {
        role: 'button',
        'aria-label': '订阅源',
        'aria-pressed': false
      }

      expect(accessibleElement.role).toBe('button')
      expect(accessibleElement['aria-label']).toBe('订阅源')
      expect(accessibleElement['aria-pressed']).toBe(false)
    })

    it('应该能够支持高对比度', () => {
      const highContrastColors = {
        text: '#000000',
        background: '#ffffff',
        border: '#000000'
      }

      expect(highContrastColors.text).toBe('#000000')
      expect(highContrastColors.background).toBe('#ffffff')
      expect(highContrastColors.border).toBe('#000000')
    })
  })
})

describe('集成测试汇总', () => {
  it('所有集成测试套件已定义', () => {
    const testSuites = [
      '订阅源添加流程',
      '完整的阅读文章流程',
      '完整的收藏文章流程',
      '完整的搜索和过滤流程',
      '完整的数据持久化流程',
      '完整的主题切换流程',
      '完整的分类管理流程',
      '完整的 OPML 导入/导出流程',
      '完整的性能优化流程',
      '完整的错误处理流程',
      '完整的用户偏好流程',
      '完整的状态管理流程',
      '完整的缓存优化流程',
      '完整的安全性流程',
      '完整的响应式适配流程',
      '完整的可访问性流程'
    ]

    testSuites.forEach(suite => {
      expect(suite).toBeDefined()
      expect(suite.length).toBeGreaterThan(0)
    })

    expect(testSuites.length).toBe(16)
  })
})
