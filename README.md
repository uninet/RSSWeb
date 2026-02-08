# RSSWeb - 现代化 RSS 阅读器

基于 Next.js 16、React 19 和 Tailwind CSS v4 构建的现代化 RSS 阅读器。

## ✨ 特性

- 📱 **完全响应式** - 移动端、平板、桌面端完美适配
- 🎨 **深色模式** - 支持浅色、深色、跟随系统主题
- 🔍 **智能搜索** - 全局文章搜索和过滤
- ⭐ **收藏管理** - 收藏喜欢的文章
- 📄 **PDF 导出** - 单篇或批量导出文章为 PDF
- 🔄 **OPML 导入/导出** - 跨平台数据迁移
- 📊 **订阅管理** - 分类、编辑、删除、刷新
- 🎯 **实时预览** - 添加订阅源时实时验证 RSS
- 💾 **数据持久化** - 本地存储，无需后端

## 🚀 快速开始

### 安装依赖

\`\`\`bash
npm install
\`\`\`

### 运行开发服务器

\`\`\`bash
npm run dev
\`\`\`

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

\`\`\`bash
npm run build
\`\`\`

## 📦 部署到 Vercel

### 方法一：使用 Vercel CLI（推荐）

\`\`\`bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署
vercel

# 选择以下配置：
# - Project Settings: 推荐使用项目名称
# - Root Directory: ./
# - Build Command: npm run build
# - Output Directory: .next
# - Framework: Next.js
\`\`\`

### 方法二：使用 Vercel Dashboard

1. 访问 [vercel.com/new](https://vercel.com/new)
2. 导入 Git 仓库
3. 选择项目根目录
4. 配置构建设置（会自动检测）
5. 点击 "Deploy"

### 环境变量配置

在 Vercel Dashboard 中添加以下环境变量：

\`\`\`
# 基础配置
NEXT_PUBLIC_APP_NAME=RSSWeb
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# 功能开关
NEXT_PUBLIC_ENABLE_EXPORT_PDF=true
NEXT_PUBLIC_ENABLE_OPML=true
NEXT_PUBLIC_ENABLE_REFRESH=true

# RSS 配置
NEXT_PUBLIC_RSS_CACHE_TTL=3600
NEXT_PUBLIC_MAX_ARTICLES_PER_FEED=50
\`\`\`

### 自定义域名（可选）

1. 在 Vercel 项目设置中
2. 点击 "Domains"
3. 添加你的自定义域名
4. 配置 DNS 记录

## 📋 项目结构

\`\`\`
rssweb-new/
├── app/                      # Next.js App Router
│   ├── api/                 # API 路由
│   │   └── rss/          # RSS 相关 API
│   ├── article/[id]/       # 文章详情页
│   ├── import-export/      # OPML 导入/导出
│   ├── pdf-export/         # PDF 导出页面
│   ├── reset-data/         # 数据重置
│   ├── subscribe/          # 订阅管理
│   ├── subscriptions/       # 订阅列表
│   ├── layout.tsx           # 根布局
│   ├── page.tsx             # 首页
│   └── globals.css          # 全局样式
├── components/              # React 组件
│   ├── Header.tsx          # 顶部导航
│   ├── Sidebar.tsx         # 侧边栏
│   └── ArticleList.tsx     # 文章列表
├── contexts/               # React Context
│   ├── AppContext.tsx      # 应用状态
│   └── ThemeContext.tsx    # 主题管理
├── lib/                    # 工具库
│   ├── utils.ts            # 工具函数
│   ├── storage.ts          # 本地存储
│   ├── rss-parser.ts       # RSS 解析
│   ├── opml.ts             # OPML 处理
│   └── pdf-export.ts        # PDF 导出
├── types/                  # TypeScript 类型
│   └── index.ts
├── public/                 # 静态资源
│   ├── favicon.ico
│   ├── sample.opml
│   └── vercel.svg
├── vercel.json             # Vercel 配置
├── next.config.ts          # Next.js 配置
├── tailwind.config.ts      # Tailwind CSS 配置
├── tsconfig.json           # TypeScript 配置
├── package.json            # 项目配置
└── .env.example            # 环境变量示例
\`\`\`

## 🎨 技术栈

- **框架**: Next.js 16.1.6
- **UI**: React 19.2.3
- **样式**: Tailwind CSS v4
- **类型**: TypeScript 5
- **打包**: Turbopack
- **图标**: Lucide React
- **部署**: Vercel

## 📱 浏览器支持

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)
- 移动浏览器

## 🔧 开发指南

### 添加新功能

1. 在 `components/` 中创建新组件
2. 在 `contexts/` 中添加状态管理
3. 在 `lib/` 中添加工具函数
4. 在 `app/` 中创建新页面

### 代码规范

- 使用 TypeScript 编写所有代码
- 遵循 ESLint 规则
- 使用 Tailwind CSS 进行样式设计
- 保持组件小而可复用

## 📄 许可证

MIT License

## 👨‍💻 作者

uninet

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如有问题，请在 GitHub 提交 Issue。
