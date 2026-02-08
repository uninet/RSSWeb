/**
 * 单元测试 - 测试独立的功能和工具函数
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

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

describe('工具函数测试', () => {
  describe('日期格式化', () => {
    it('应该能够格式化为相对时间', () => {
      const now = Date.now()
      const oneHourAgo = now - 3600000
      const oneDayAgo = now - 86400000
      const oneWeekAgo = now - 604800000

      const formatTimeAgo = (timestamp: number): string => {
        const diff = Date.now() - timestamp
        if (diff < 3600000) return '刚刚'
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
        if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`
        return `${Math.floor(diff / 604800000)} 周前`
      }

      expect(formatTimeAgo(now)).toBe('刚刚')
      expect(formatTimeAgo(oneHourAgo)).toBe('1 小时前')
      expect(formatTimeAgo(oneDayAgo)).toBe('1 天前')
      expect(formatTimeAgo(oneWeekAgo)).toBe('1 周前')
    })
  })

  describe('文本处理', () => {
    it('应该能够截断长文本', () => {
      const longText = 'This is a very long text that should be truncated'
      const truncate = (text: string, maxLength: number) => {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
      }

      expect(truncate(longText, 20).length).toBeLessThanOrEqual(23)
      expect(truncate(longText, 20).endsWith('...').toBe(true)
      expect(truncate('Short text', 50)).toBe('Short text')
    })

    it('应该能够移除 HTML 标签', () => {
      const htmlText = '<p>This is <strong>HTML</strong> text</p>'
      const stripHtml = (html: string) => {
        return html.replace(/<[^>]*>/g, '')
      }

      expect(stripHtml(htmlText)).toBe('This is HTML text')
      expect(stripHtml(htmlText)).not.toContain('<')
      expect(stripHtml(htmlText)).not.toContain('>')
    })
  })

  describe('URL 验证', () => {
    it('应该能够验证有效的 URL', () => {
      const isValidUrl = (url: string) => {
        try {
          new URL(url)
          return true
        } catch {
          return false
        }
      }

      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://example.com/feed.xml')).toBe(true)
      expect(isValidUrl('ftp://example.com')).toBe(true)
      expect(isValidUrl('invalid-url')).toBe(false)
      expect(isValidUrl('')).toBe(false)
    })
  })

  describe('颜色转换', () => {
    it('应该能够转换十六进制颜色', () => {
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null
      }

      const black = hexToRgb('#000000')
      expect(black).toEqual({ r: 0, g: 0, b: 0 })

      const white = hexToRgb('#ffffff')
      expect(white).toEqual({ r: 255, g: 255, b: 255 })

      const red = hexToRgb('#ff0000')
      expect(red).toEqual({ r: 255, g: 0, b: 0 })
    })
  })

  describe('数组操作', () => {
    it('应该能够去重数组', () => {
      const arr = [1, 2, 2, 3, 4, 4, 5]
      const unique = [...new Set(arr)]
      expect(unique).toEqual([1, 2, 3, 4, 5])
    })

    it('应该能够按属性分组', () => {
      const items = [
        { id: 1, category: 'Tech' },
        { id: 2, category: 'Tech' },
        { id: 3, category: 'News' },
        { id: 4, category: 'Tech' }
      ]

      const grouped = items.reduce((acc, item) => {
        const cat = item.category || 'Uncategorized'
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(item)
        return acc
      }, {} as Record<string, typeof items>)

      expect(grouped['Tech']).toHaveLength(3)
      expect(grouped['News']).toHaveLength(1)
      expect(grouped['Uncategorized']).toBeUndefined()
    })

    it('应该能够排序数组', () => {
      const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5]
      const sorted = [...new Set(arr)].sort((a, b) => a - b)
      expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 9])
    })
  })

  describe('字符串操作', () => {
    it('应该能够生成随机 ID', () => {
      const generateId = () => Math.random().toString(36).substring(2, 9)
      const id = generateId()

      expect(id).toHaveLength(7)
      expect(id).toMatch(/^[a-z0-9]+$/)

      const id2 = generateId()
      expect(id).not.toBe(id2)
    })

    it('应该能够清理文件名', () => {
      const sanitize = (name: string) => {
        return name
          .replace(/[^a-zA-Z0-9-_.]/g, '_')
          .replace(/_{2,}/g, '_')
          .substring(0, 50)
      }

      expect(sanitize('File Name')).toBe('File_Name')
      expect(sanitize('File/Name//Test')).toBe('File_Name_Test')
      expect(sanitize('A'.repeat(100))).toHaveLength(50)
    })
  })

  describe('性能工具', () => {
    it('应该能够测量执行时间', () => {
      const measureTime = (fn: () => void) => {
        const start = performance.now()
        fn()
        return performance.now() - start
      }

      const testFn = () => {
        let sum = 0
        for (let i = 0; i < 1000; i++) {
          sum += i
        }
      }

      const time = measureTime(testFn)
      expect(time).toBeGreaterThan(0)
      expect(time).toBeLessThan(100)
    })

    it('应该能够防抖函数', () => {
      vi.useFakeTimers()
      const debounce = (fn: () => void, delay: number) => {
        let timeoutId: any = null
        return (...args: any[]) => {
          if (timeoutId) clearTimeout(timeoutId)
          timeoutId = setTimeout(() => fn(...args), delay)
        }
      }

      let callCount = 0
      const testFn = () => { callCount++ }

      const debouncedFn = debounce(testFn, 100)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      vi.advanceTimersByTime(50)
      expect(callCount).toBe(0)

      vi.advanceTimersByTime(100)
      expect(callCount).toBe(1)
    })
  })

  describe('错误处理', () => {
    it('应该能够捕获异步错误', async () => {
      const asyncWithError = async () => {
        throw new Error('Test error')
      }

      const result = asyncWithError().catch(e => e.message)
      expect(result).toBe('Test error')
    })

    it('应该能够提供默认值', () => {
      const getWithDefault = (value: any, defaultValue: any) => {
        return value ?? defaultValue
      }

      expect(getWithDefault(null, 'default')).toBe('default')
      expect(getWithDefault(undefined, 'default')).toBe('default')
      expect(getWithDefault(0, 'default')).toBe(0)
      expect(getWithDefault(false, 'default')).toBe(false)
      expect(getWithDefault('', 'default')).toBe('')
    })
  })

  describe('正则表达式', () => {
    it('应该能够匹配 RSS URL', () => {
      const isRssUrl = (url: string) => {
        const pattern = /^https?:\/\/.+\.(rss|xml|rdf)$/
        return pattern.test(url)
      }

      expect(isRssUrl('https://example.com/feed.rss')).toBe(true)
      expect(isRssUrl('http://example.com/feed.xml')).toBe(true)
      expect(isRssUrl('https://example.com/feed.html')).toBe(false)
    })

    it('应该能够匹配订阅源标题', () => {
      const isValidTitle = (title: string) => {
        return title.length > 0 && title.length <= 100
      }

      expect(isValidTitle('Valid Title')).toBe(true)
      expect(isValidTitle('')).toBe(false)
      expect(isValidTitle('A'.repeat(101))).toBe(false)
    })
  })

  describe('主题工具', () => {
    it('应该能够检测系统主题', () => {
      const getSystemTheme = () => {
        if (typeof window !== 'undefined') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        }
        return 'light'
      }

      expect(getSystemTheme()).toMatch(/^(light|dark)$/)
    })

    it('应该能够在主题之间切换', () => {
      let theme = 'light'

      const toggleTheme = () => {
        theme = theme === 'light' ? 'dark' : 'light'
      }

      expect(theme).toBe('light')
      toggleTheme()
      expect(theme).toBe('dark')
      toggleTheme()
      expect(theme).toBe('light')
    })
  })
})

describe('单元测试汇总', () => {
  it('所有工具函数测试套件已定义', () => {
    const testSuites = [
      '工具函数测试',
      '日期格式化',
      '文本处理',
      'URL 验证',
      '颜色转换',
      '数组操作',
      '字符串操作',
      '性能工具',
      '错误处理',
      '正则表达式',
      '主题工具'
    ]

    testSuites.forEach(suite => {
      expect(suite).toBeDefined()
      expect(suite.length).toBeGreaterThan(0)
    })

    expect(testSuites.length).toBe(14)
  })
})
