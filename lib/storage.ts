import { Subscription, Article, Category } from '@/types'

const STORAGE_KEYS = {
  SUBSCRIPTIONS: 'rssweb-subscriptions',
  ARTICLES: 'rssweb-articles',
  CATEGORIES: 'rssweb-categories',
} as const

// 订阅源存储
export const subscriptionStorage = {
  getAll(): Subscription[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS)
    return data ? JSON.parse(data) : []
  },

  save(subscriptions: Subscription[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions))
  },

  add(subscription: Subscription): void {
    const subscriptions = this.getAll()
    subscriptions.push(subscription)
    this.save(subscriptions)
  },

  update(id: string, updates: Partial<Subscription>): void {
    const subscriptions = this.getAll()
    const index = subscriptions.findIndex(s => s.id === id)
    if (index !== -1) {
      subscriptions[index] = { ...subscriptions[index], ...updates }
      this.save(subscriptions)
    }
  },

  delete(id: string): void {
    const subscriptions = this.getAll().filter(s => s.id !== id)
    this.save(subscriptions)
  },

  get(id: string): Subscription | undefined {
    return this.getAll().find(s => s.id === id)
  }
}

// 文章存储
export const articleStorage = {
  getAll(): Article[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(STORAGE_KEYS.ARTICLES)
    return data ? JSON.parse(data) : []
  },

  save(articles: Article[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles))
  },

  add(article: Article): void {
    const articles = this.getAll()
    articles.push(article)
    this.save(articles)
  },

  update(id: string, updates: Partial<Article>): void {
    const articles = this.getAll()
    const index = articles.findIndex(a => a.id === id)
    if (index !== -1) {
      articles[index] = { ...articles[index], ...updates }
      this.save(articles)
    }
  },

  delete(id: string): void {
    const articles = this.getAll().filter(a => a.id !== id)
    this.save(articles)
  },

  getBySubscription(subscriptionId: string): Article[] {
    return this.getAll().filter(a => a.subscriptionId === subscriptionId)
  },

  get(id: string): Article | undefined {
    return this.getAll().find(a => a.id === id)
  }
}

// 分类存储
export const categoryStorage = {
  getAll(): Category[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES)
    return data ? JSON.parse(data) : []
  },

  save(categories: Category[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
  },

  add(category: Category): void {
    const categories = this.getAll()
    categories.push(category)
    this.save(categories)
  },

  update(id: string, updates: Partial<Category>): void {
    const categories = this.getAll()
    const index = categories.findIndex(c => c.id === id)
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updates }
      this.save(categories)
    }
  },

  delete(id: string): void {
    const categories = this.getAll().filter(c => c.id !== id)
    this.save(categories)
  },

  get(id: string): Category | undefined {
    return this.getAll().find(c => c.id === id)
  }
}

// 重置所有数据（用于开发测试）
export function resetAllData(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTIONS)
  localStorage.removeItem(STORAGE_KEYS.ARTICLES)
  localStorage.removeItem(STORAGE_KEYS.CATEGORIES)
  initSampleData()
}

// 初始化示例数据
export function initSampleData(): void {
  if (typeof window === 'undefined') return

  // 检查是否已有数据
  if (subscriptionStorage.getAll().length > 0) return

  // 示例订阅源
  const sampleSubscriptions: Subscription[] = [
    {
      id: 'tech-1',
      title: 'TechCrunch',
      url: 'https://techcrunch.com/feed/',
      description: '科技新闻和创业资讯',
      category: '技术',
      addedAt: Date.now(),
      unreadCount: 5
    },
    {
      id: 'news-1',
      title: 'BBC News',
      url: 'https://feeds.bbci.co.uk/news/rss.xml',
      description: '全球新闻资讯',
      category: '新闻',
      addedAt: Date.now() - 3600000,
      unreadCount: 3
    },
    {
      id: 'blog-1',
      title: 'Hacker News',
      url: 'https://news.ycombinator.com/rss',
      description: '技术社区讨论',
      category: '技术',
      addedAt: Date.now() - 7200000,
      unreadCount: 8
    }
  ]

  // 示例文章
  const sampleArticles: Article[] = [
    {
      id: 'art-1',
      subscriptionId: 'tech-1',
      title: 'AI 技术的新突破：大模型正在改变一切',
      link: 'https://example.com/1',
      description: '最新的 AI 技术突破展示了大模型在各个领域的应用潜力。从编程辅助到创意写作，AI 正在成为人们日常工作的得力助手。本文将探讨 AI 技术的最新进展和未来发展方向。',
      content: `<h2>AI 技术的最新突破</h2>
        <p>近年来，人工智能技术取得了突飞猛进的发展。特别是大语言模型（LLM）的出现，让 AI 能够理解自然语言、生成高质量文本、编写代码等。</p>
        
        <h3>主要进展</h3>
        <ul>
          <li><strong>模型规模不断扩大</strong>：从 GPT-3 到 GPT-4，参数规模呈指数增长</li>
          <li><strong>多模态能力增强</strong>：能够同时处理文本、图像、音频等多种数据</li>
          <li><strong>推理能力提升</strong>：能够进行复杂的逻辑推理和问题解决</li>
          <li><strong>上下文理解加深</strong>：能够处理更长的上下文，保持连贯性</li>
        </ul>
        
        <h3>应用场景</h3>
        <p>AI 技术正在改变各行各业：</p>
        <ul>
          <li><strong>软件开发</strong>：辅助编程、代码审查、自动测试</li>
          <li><strong>内容创作</strong>：文案写作、创意生成、辅助翻译</li>
          <li><strong>客户服务</strong>：智能客服、自动问答、情感分析</li>
          <li><strong>医疗健康</strong>：辅助诊断、药物研发、医学影像分析</li>
        </ul>
        
        <h3>未来展望</h3>
        <p>AI 技术的发展潜力巨大，但也面临挑战，如数据安全、伦理问题、能源消耗等。我们需要在推动技术进步的同时，确保其负责任地发展。</p>`,
      pubDate: Date.now() - 3600000,
      isRead: false,
      isFavorite: false,
      tags: ['AI', '技术']
    },
    {
      id: 'art-2',
      subscriptionId: 'tech-1',
      title: 'Next.js 16 发布：带来革命性更新',
      link: 'https://example.com/2',
      description: 'Next.js 16 带来了许多新特性，包括更快的编译速度、更好的性能优化、全新的 API 设计等。',
      content: `<h2>Next.js 16 的新特性</h2>
        <p>Next.js 16 是 Vercel 团队最新发布的主要版本，带来了许多令人兴奋的改进和新特性。</p>
        
        <h3>Turbopack 默认启用</h3>
        <p>Turbopack 是 Rust 编写的打包工具，相比 Webpack 提供了显著的性能提升。在 Next.js 16 中，Turbopack 现在默认启用，大大提高了开发和构建速度。</p>
        
        <h3>服务器组件增强</h3>
        <p>服务器组件（Server Components）得到了进一步的增强，提供了更好的性能和开发体验。新的 API 让服务器组件更加灵活易用。</p>
        
        <h3>流式渲染</h3>
        <p>流式渲染（Streaming SSR）得到了改进，现在支持更多的场景，让页面加载更快，用户体验更好。</p>
        
        <h3>其他改进</h3>
        <ul>
          <li>更小的包体积</li>
          <li>更好的 TypeScript 支持</li>
          <li>改进的 API 路由</li>
          <li>优化的图片处理</li>
        </ul>`,
      pubDate: Date.now() - 7200000,
      isRead: false,
      isFavorite: true,
      tags: ['Next.js', '前端', 'React']
    },
    {
      id: 'art-3',
      subscriptionId: 'news-1',
      title: '全球气候峰会召开：各国承诺加强合作',
      link: 'https://example.com/3',
      description: '各国领导人齐聚一堂，讨论气候变化应对方案。会议达成了多项重要共识，包括减少碳排放、推动绿色能源发展等。',
      content: `<h2>全球气候峰会概况</h2>
        <p>第 28 届联合国气候变化大会（COP28）于 2023 年在迪拜举行。来自全球 190 多个国家的代表参加了本次会议，共同探讨应对气候变化的全球行动方案。</p>
        
        <h3>主要成果</h3>
        <ul>
          <li><strong>首次提及"化石燃料转型"</strong>：大会首次在协议中明确提及逐步摆脱化石燃料</li>
          <li><strong>可再生能源目标</strong>：设定到 2030 年将全球可再生能源容量提高两倍的目标</li>
          <li><strong>资金承诺</strong>：发达国家承诺提供更多资金帮助发展中国家应对气候变化</li>
          <li><strong>损失与损害基金</strong>：正式成立损失与损害基金机制</li>
        </ul>
        
        <h3>中国的角色</h3>
        <p>作为全球最大的发展中国家和最大的碳排放国，中国在本次峰会上发挥了积极作用。中国承诺到 2030 年实现碳达峰，到 2060 年实现碳中和，并采取了一系列实际行动。</p>`,
      pubDate: Date.now() - 10800000,
      isRead: true,
      isFavorite: false,
      tags: ['新闻', '环境', '气候']
    },
    {
      id: 'art-4',
      subscriptionId: 'blog-1',
      title: '如何提高编程效率：10 个实用技巧',
      link: 'https://example.com/4',
      description: '在日常编程工作中，提高效率可以让我们更快地完成任务，也有更多时间学习和成长。本文分享了 10 个实用的技巧。',
      content: `<h2>提高编程效率的技巧</h2>
        <p>作为开发者，我们总是希望能够在更短的时间内完成更多的工作。以下是一些经过实践验证的技巧。</p>
        
        <h3>1. 掌握键盘快捷键</h3>
        <p>熟练使用键盘快捷键可以大大提高操作速度。无论是 IDE 还是浏览器，都有丰富的快捷键值得学习。</p>
        
        <h3>2. 使用代码片段</h3>
        <p>将常用的代码模式保存为片段，可以快速插入代码，减少重复输入。</p>
        
        <h3>3. 自动化重复任务</h3>
        <p>使用脚本或工具自动化重复性任务，如构建、部署、测试等。</p>
        
        <h3>4. 优化开发环境</h3>
        <p>配置好开发工具和插件，打造适合自己的高效开发环境。</p>
        
        <h3>5. 掌握版本控制</h3>
        <p>熟练使用 Git 等版本控制工具，可以更好地管理代码历史和协作。</p>
        
        <h3>6. 写可测试的代码</h3>
        <p>从设计阶段就考虑测试，让代码更容易测试和维护。</p>
        
        <h3>7. 持续学习</h3>
        <p>技术发展迅速，持续学习新工具和新技术可以保持竞争力。</p>`,
      pubDate: Date.now() - 14400000,
      isRead: false,
      isFavorite: false,
      tags: ['编程', '效率', '技巧']
    }
  ]

  // 示例分类
  const sampleCategories: Category[] = [
    { id: 'cat-1', name: '技术', color: '#3b82f6' },
    { id: 'cat-2', name: '新闻', color: '#ef4444' },
    { id: 'cat-3', name: '博客', color: '#10b981' }
  ]

  subscriptionStorage.save(sampleSubscriptions)
  articleStorage.save(sampleArticles)
  categoryStorage.save(sampleCategories)
}
