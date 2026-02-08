/**
 * 测试设置文件 - 配置全局测试环境和 mock
 */

import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// 全局 afterEach：清理所有 mock
afterEach(() => {
  cleanup()
})

// 扩展 expect
expect.extend({
  toHaveBeenCalledWithTime(received, duration) {
    const pass = typeof received === 'function' && Date.now() - received.mock?.calls?.[0]?.[0] > duration
    if (!pass) {
      return {
        message: () => `expected function to be called within ${duration}ms`,
        pass: false
      }
    } else {
      return {
        message: () => `expected function not to be called within ${duration}ms`,
        pass: true
      }
    }
  },

  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling
    if (pass) {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: true
      }
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false
      }
    }
  }
})

// 测试超时配置
vi.setConfig({
  testTimeout: 10000, // 10秒超时
  hookTimeout: 5000, // 5秒 hook超时
})

// Mock performance API
global.performance = {
  now: () => Date.now(),
  mark: () => {},
  measure: () => ({ duration: 0 }) as any
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback: any, options?: any) {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() { return [] }
  root = null
  rootMargin = ''
  thresholds = []
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback: any) {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: query.includes('dark') ? true : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {}
  })
})

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

// Mock sessionStorage
const sessionStorageMock = (() => {
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

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
})

// Mock fetch
global.fetch = vi.fn()

// Mock navigator
Object.defineProperty(navigator, 'userAgent', {
  writable: true,
  value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
})

// Mock location
Object.defineProperty(window, 'location', {
  writable: true,
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
    reload: vi.fn()
  }
})

// Mock history
const pushState = vi.fn()
const replaceState = vi.fn()
const back = vi.fn()
const forward = vi.fn()

global.history = {
  pushState,
  replaceState,
  back,
  forward,
  length: 1,
  state: {}
}

// Mock DOMParser
global.DOMParser = class DOMParser {
  parseFromString(xml: string, type: string) {
    const doc = document.implementation.createDocument()
    
    if (type === 'text/xml') {
      // 简单的 XML 解析模拟
      const matches = xml.match(/<outline\s+([^>]*)>/g) || []
      matches.forEach(match => {
        const outline = doc.createElement('outline')
        const attrs = match.match(/(\w+)=["']([^"']*)["']/g) || []
        attrs.forEach(attr => {
          const [, key, value] = attr
          outline.setAttribute(key, value)
        })
        doc.documentElement.appendChild(outline)
      })
    }
    
    return doc
  }
}

// Mock KeyboardEvent
global.KeyboardEvent = class KeyboardEvent {
  constructor(type: string, eventInitDict?: any) {
    super(type, eventInitDict)
    this.key = eventInitDict?.key || ''
  }
}

// console 模拟
const originalConsole = global.console

global.console = {
  ...originalConsole,
  log: (...args: any[]) => originalConsole.log('[TEST]', ...args),
  error: (...args: any[]) => originalConsole.error('[TEST]', ...args),
  warn: (...args: any[]) => originalConsole.warn('[TEST]', ...args),
  info: (...args: any[]) => originalConsole.info('[TEST]', ...args)
}

// 环境变量
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_APP_NAME = 'RSSWeb Test'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
