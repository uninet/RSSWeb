// 添加示例订阅和数据

import { Subscription, Article } from '@/types'
import { subscriptionStorage, articleStorage } from '@/lib/storage'
import { convertToArticle, parseRSS } from '@/lib/rss-parser'

/**
 * 初始化示例数据
 */
export async function initializeSampleData() {
  const existingSubscriptions = subscriptionStorage.getAll()

  // 如果已经有数据，不重复添加
  if (existingSubscriptions.length > 0) {
    return
  }

  const sampleSubscriptions: Subscription[] = [
    {
      id: 'sub-1',
      title: 'Next.js Blog',
      url: 'https://nextjs.org/blog/feed.xml',
      description: 'The Next.js Blog',
      category: '技术',
      addedAt: Date.now(),
      unreadCount: 3,
      icon: 'https://nextjs.org/favicon.ico',
    },
    {
      id: 'sub-2',
      title: 'TechCrunch',
      url: 'https://techcrunch.com/feed/',
      description: 'TechCrunch - Reporting on the business of technology, startups, venture capital funding, and Silicon Valley',
      category: '新闻',
      addedAt: Date.now(),
      unreadCount: 5,
      icon: 'https://techcrunch.com/favicon.ico',
    },
    {
      id: 'sub-3',
      title: 'Dan Abramov',
      url: 'https://overreacted.io/rss.xml',
      description: 'Dan Abramov\'s blog about React and programming',
      category: '博客',
      addedAt: Date.now(),
      unreadCount: 2,
    },
  ]

  // 保存示例订阅
  sampleSubscriptions.forEach((sub) => {
    subscriptionStorage.add(sub)
  })

  // 添加一些示例文章
  const sampleArticles: Article[] = [
    {
      id: 'art-1',
      subscriptionId: 'sub-1',
      title: 'Next.js 16 Released: Faster, Smaller, and More Powerful',
      link: 'https://nextjs.org/blog/next-16',
      description:
        'We are excited to announce Next.js 16, the latest release of our framework with significant performance improvements...',
      content:
        'We are excited to announce Next.js 16, the latest release of our framework with significant performance improvements, new features, and better developer experience.',
      pubDate: Date.now() - 3600000, // 1 hour ago
      author: 'Next.js Team',
      isRead: false,
      isFavorite: false,
      tags: ['nextjs', 'release'],
    },
    {
      id: 'art-2',
      subscriptionId: 'sub-1',
      title: 'How to Use Server Actions in Next.js',
      link: 'https://nextjs.org/blog/server-actions',
      description:
        'Learn how to use Server Actions to handle form submissions and mutations in Next.js...',
      content:
        'Learn how to use Server Actions to handle form submissions and mutations in Next.js applications with ease.',
      pubDate: Date.now() - 7200000, // 2 hours ago
      author: 'Next.js Team',
      isRead: true,
      isFavorite: true,
      tags: ['tutorial', 'server-actions'],
    },
    {
      id: 'art-3',
      subscriptionId: 'sub-1',
      title: 'Optimizing Images in Next.js',
      link: 'https://nextjs.org/blog/image-optimization',
      description:
        'Discover best practices for optimizing images in your Next.js applications...',
      content:
        'Discover best practices for optimizing images in your Next.js applications to improve performance and user experience.',
      pubDate: Date.now() - 86400000, // 1 day ago
      author: 'Next.js Team',
      isRead: false,
      isFavorite: false,
      tags: ['performance', 'images'],
    },
    {
      id: 'art-4',
      subscriptionId: 'sub-2',
      title: 'AI Startup Raises $100M Series A',
      link: 'https://techcrunch.com/ai-startup-series-a',
      description:
        'An artificial intelligence startup has raised $100 million in Series A funding...',
      content:
        'An artificial intelligence startup has raised $100 million in Series A funding to expand its operations and develop new products.',
      pubDate: Date.now() - 1800000, // 30 minutes ago
      author: 'TechCrunch',
      isRead: false,
      isFavorite: false,
      tags: ['ai', 'funding'],
    },
    {
      id: 'art-5',
      subscriptionId: 'sub-2',
      title: 'New Programming Language Challenges JavaScript',
      link: 'https://techcrunch.com/new-language',
      description:
        'A new programming language claims to offer better performance and developer experience...',
      content:
        'A new programming language claims to offer better performance and developer experience than JavaScript for web development.',
      pubDate: Date.now() - 5400000, // 1.5 hours ago
      author: 'TechCrunch',
      isRead: false,
      isFavorite: true,
      tags: ['programming', 'javascript'],
    },
  ]

  sampleArticles.forEach((article) => {
    articleStorage.addOrUpdate([article])
  })

  console.log('Sample data initialized')
}
