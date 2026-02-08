// Mock 文章数据

export interface Article {
  id: string
  title: string
  link: string
  description: string
  content: string
  pubDate: number
  author: string
  isRead: boolean
  isFavorite: boolean
  tags: string[]
  category: string
}

export const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Next.js 16 Released: Faster, Smaller, and More Powerful',
    link: 'https://nextjs.org/blog/next-16',
    description:
      'We are excited to announce Next.js 16, the latest release of our framework with significant performance improvements, new features, and better developer experience.',
    content: 'We are excited to announce Next.js 16, the latest release of our framework with significant performance improvements, new features, and better developer experience.',
    pubDate: Date.now() - 3600000,
    author: 'Next.js Team',
    isRead: false,
    isFavorite: true,
    tags: ['nextjs', 'release'],
    category: '技术',
  },
  {
    id: '2',
    title: '如何使用 Server Actions in Next.js',
    link: 'https://nextjs.org/blog/server-actions',
    description:
      'Learn how to use Server Actions to handle form submissions and mutations in Next.js applications with ease.',
    content: 'Learn how to use Server Actions to handle form submissions and mutations in Next.js applications with ease.',
    pubDate: Date.now() - 7200000,
    author: 'Next.js Team',
    isRead: false,
    isFavorite: false,
    tags: ['tutorial', 'server-actions'],
    category: '博客',
  },
  {
    id: '3',
    title: 'Dan Abramov 的博客：深入理解 React Hooks',
    link: 'https://overreacted.io/introducing-hooks',
    description:
      'Dan Abramov 探讨 React Hooks 的设计哲学和最佳实践。',
    content: 'Dan Abramov 探讨 React Hooks 的设计哲学和最佳实践。',
    pubDate: Date.now() - 10800000,
    author: 'Dan Abramov',
    isRead: true,
    isFavorite: true,
    tags: ['react', 'hooks'],
    category: '博客',
  },
  {
    id: '4',
    title: 'TechCrunch 最新的初创公司新闻',
    link: 'https://techcrunch.com',
    description:
      'TechCrunch - Reporting on the business of technology, startups, venture capital funding and Silicon Valley.',
    content: 'TechCrunch - Reporting on the business of technology, startups, venture capital funding and Silicon Valley.',
    pubDate: Date.now() - 18000000,
    author: 'TechCrunch Team',
    isRead: false,
    isFavorite: false,
    tags: ['news', 'startup'],
    category: '新闻',
  },
  {
    id: '5',
    title: '使用 TypeScript 5 提升开发体验',
    link: 'https://www.typescriptlang.org/',
    description:
      'TypeScript 5 带来了许多新特性和改进，包括更快的编译、更强大的类型系统和更好的工具支持。',
    content: 'TypeScript 5 带来了许多新特性和改进，包括更快的编译、更强大的类型系统和更好的工具支持。',
    pubDate: Date.now() - 25200000,
    author: 'TypeScript Team',
    isRead: false,
    isFavorite: false,
    tags: ['typescript', 'development'],
    category: '技术',
  },
]
