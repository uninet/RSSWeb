# RSSWeb 项目规划

## 项目目标

构建一个现代化的 RSS 阅读器，提供优秀的用户体验和强大的功能。

## 核心功能

### 1. RSS 订阅管理
- [ ] 添加/删除 RSS 订阅源
- [ ] 分类管理（技术、新闻、博客等）
- [ ] 订阅源刷新和状态监控
- [ ] 导入/导出订阅列表（OPML 格式）

### 2. 文章阅读
- [ ] 文章列表展示（未读/已读状态）
- [ ] 文章详情阅读视图
- [ ] 标记已读/未读
- [ ] 收藏/取消收藏文章
- [ ] 全文内容加载

### 3. 搜索和过滤
- [ ] 全局搜索文章
- [ ] 按订阅源过滤
- [ ] 按日期范围过滤
- [ ] 按标签过滤

### 4. 数据持久化
- [ ] 使用 localStorage 存储订阅和文章数据
- [ ] 考虑 IndexedDB 支持大量文章
- [ ] 数据备份和恢复

## 技术架构

### 前端技术栈
- **框架**: Next.js 16 (App Router)
- **UI 库**: shadcn/ui
- **样式**: Tailwind CSS v4
- **状态管理**: React Context + Hooks
- **数据获取**: fetch API (服务端 + 客户端)
- **RSS 解析**: 自定义解析器（或考虑库）

### 数据模型

```typescript
// 订阅源
interface Subscription {
  id: string
  title: string
  url: string
  description?: string
  icon?: string
  category?: string
  addedAt: number
  lastFetchAt?: number
  fetchError?: string
  unreadCount: number
}

// 文章
interface Article {
  id: string
  subscriptionId: string
  title: string
  link: string
  description: string
  content?: string
  pubDate: number
  author?: string
  isRead: boolean
  isFavorite: boolean
  tags?: string[]
}

// 分类
interface Category {
  id: string
  name: string
  color?: string
}
```

### 目录结构
```
src/
├── app/
│   ├── layout.tsx              # 根布局
│   ├── page.tsx               # 首页（文章列表）
│   ├── read/
│   │   └── [id]/page.tsx      # 文章阅读页
│   ├── subscriptions/
│   │   ├── page.tsx           # 订阅管理页
│   │   └── new/page.tsx       # 添加订阅页
│   └── api/
│       └── rss/
│           └── [url]/route.ts # RSS 代理 API
├── components/
│   ├── ui/                    # shadcn/ui 组件
│   ├── ArticleCard.tsx         # 文章卡片
│   ├── SubscriptionCard.tsx     # 订阅源卡片
│   ├── ArticleList.tsx         # 文章列表
│   ├── ArticleReader.tsx        # 阅读器组件
│   ├── SubscriptionForm.tsx     # 订阅表单
│   └── Navigation.tsx          # 导航组件
├── lib/
│   ├── utils.ts               # 工具函数
│   ├── rss-parser.ts          # RSS 解析器
│   ├── storage.ts             # 数据存储
│   └── api.ts                # API 客户端
├── types/
│   └── index.ts              # TypeScript 类型定义
├── contexts/
│   └── AppContext.tsx        # 全局状态管理
└── hooks/
    └── useSubscriptions.ts    # 自定义 Hooks
```

## UI/UX 设计原则

### 视觉设计
- **配色**: Neutral 主题，简洁专业
- **排版**: 清晰易读，适当的行高和字间距
- **间距**: 一致的间距系统（4px 基准）
- **圆角**: 适当的圆角（8px-12px）
- **阴影**: 轻微的阴影增加层次感

### 交互设计
- **响应式**: 移动优先，适配所有屏幕尺寸
- **加载状态**: 骨架屏和加载动画
- **反馈**: 操作即时反馈（标记已读、收藏等）
- **导航**: 面包屑和侧边栏导航
- **快捷键**: 键盘快捷键支持

### 页面布局

#### 首页（文章列表）
```
┌─────────────────────────────────────────────────┐
│ Header: RSSWeb        [搜索框] [设置]        │
├──────────┬──────────────────────────────────────┤
│ Sidebar  │ Article List                      │
│          │                                  │
│ 订阅列表  │ ┌────────────────────────────┐  │
│          │ │ Article 1 (未读)           │  │
│ 📰 技术   │ ├────────────────────────────┤  │
│          │ │ Article 2 (已读)           │  │
│ 📰 新闻   │ ├────────────────────────────┤  │
│          │ │ Article 3 (未读) ★        │  │
│ 📰 博客   │ └────────────────────────────┘  │
│          │                                  │
│ [添加]   │ [加载更多]                       │
└──────────┴──────────────────────────────────────┘
```

#### 阅读页
```
┌─────────────────────────────────────────────────┐
│ [← 返回]  标题              [★] [标记已读] │
├─────────────────────────────────────────────────┤
│                                          │
│  文章内容...                              │
│                                          │
│                                          │
├─────────────────────────────────────────────────┤
│ 来源: TechCrunch    发布: 2小时前            │
└─────────────────────────────────────────────────┘
```

## 开发路线图

### Phase 1: 基础架构（当前）✅ 已完成
- [x] Next.js 项目初始化
- [x] shadcn/ui 集成
- [x] 基础组件准备
- [x] 数据模型定义
- [x] 存储层实现
- [x] RSS 解析器实现
- [x] API 代理实现
- [x] 全局状态管理（AppContext）
- [x] 基础 UI 组件（ArticleCard）
- [x] 主页面实现
- [x] 导航组件（Navigation）

### Phase 2: 订阅管理✅ 已完成
- [x] 订阅列表页面（含搜索、过滤、分类）
- [x] 添加订阅表单（含 RSS 验证）
- [x] 导航组件（包含订阅统计）
- [x] AppContext 增强（支持订阅 CRUD、文章 CRUD）
- [x] 示例数据自动初始化
- [x] RSS 验证和解析（通过 API 代理）
- [x] 订阅源信息展示
- [x] 分类管理

### Phase 3: 文章阅读✅ 已完成
- [x] 文章阅读页面
- [x] 文章内容加载（支持全文）
- [x] 已读/未读状态管理
- [x] 收藏功能
- [x] 文章元数据展示（来源、作者、标签）
- [x] 返回列表功能

### Phase 4: 高级功能
- [ ] 搜索功能（全局）
- [ ] 过滤和排序（按日期、标签）
- [ ] OPML 导入/导出
- [ ] 自动刷新（定时任务）
- [ ] 离线支持（Service Worker）
- [ ] 导出为 PDF

### Phase 5: 优化和测试
- [ ] 性能优化
- [ ] 单元测试
- [ ] E2E 测试
- [ ] 可访问性优化
- [ ] SEO 优化

### Phase 3: 文章阅读
- [ ] 文章列表页面
- [ ] 文章阅读页面
- [ ] 已读/未读状态管理
- [ ] 收藏功能
- [ ] 全文内容加载

### Phase 4: 高级功能
- [ ] 搜索功能
- [ ] 过滤和排序
- [ ] OPML 导入/导出
- [ ] 自动刷新
- [ ] 离线支持

### Phase 5: 优化和测试
- [ ] 性能优化
- [ ] 单元测试
- [ ] E2E 测试
- [ ] 可访问性优化
- [ ] SEO 优化

## 测试策略

### 单元测试
- 使用 Jest + React Testing Library
- 测试组件渲染
- 测试工具函数
- 测试 RSS 解析逻辑

### 集成测试
- 测试数据存储
- 测试 API 路由
- 测试状态管理

### E2E 测试
- 使用 Playwright
- 测试用户流程
- 测试关键功能

## 性能目标

- **首屏加载**: < 1.5s
- **交互响应**: < 100ms
- **RSS 解析**: < 2s 每个源
- **文章列表渲染**: < 500ms（100项）

## 可访问性目标

- 遵循 WCAG 2.1 AA 标准
- 键盘导航支持
- 屏幕阅读器支持
- 适当的 ARIA 标签
