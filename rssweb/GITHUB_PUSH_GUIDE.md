# GitHub 提交和推送指南

## 📊 当前 Git 状态

✅ **Git 已初始化**
✅ **初始提交已完成**
- **Commit Hash**: 938769b
- **文件数量**: 62 个文件，19,184 行代码
- **Git 用户**: RSSWeb AI
- **Git 邮箱**: rssweb@example.com

✅ **本地仓库状态**: 准备推送到 GitHub

---

## 🚀 下一步：推送到 GitHub

### 方式一：使用 GitHub CLI（推荐）

#### 步骤 1：安装 GitHub CLI（如果还没有安装）

```bash
# macOS / Linux
brew install gh

# Windows (使用 Chocolatey)
choco install gh

# 或者下载安装包
# 访问: https://github.com/cli
```

#### 步骤 2：登录到 GitHub

```bash
# 登录（会打开浏览器进行授权）
gh auth login
```

#### 步骤 3：创建 GitHub 仓库

```bash
# 在 rssweb 目录下执行
cd /root/.openclaw/workspace/rssweb

# 创建新仓库（公开）
gh repo create RSSWeb --public --description "现代 RSS 阅读器 - 基于 Next.js、React、TypeScript 构建" --source=false --push=false
```

#### 步骤 4：推送代码到 GitHub

```bash
# 添加远程仓库（GitHub CLI 会自动添加）
# 或者手动添加
git remote add origin https://github.com/YOUR_USERNAME/RSSWeb.git

# 推送到 GitHub
git push -u origin master
```

#### 步骤 5：验证推送

```bash
# 查看远程仓库信息
gh repo view

# 或者访问 GitHub 网页查看
# https://github.com/YOUR_USERNAME/RSSWeb
```

---

### 方式二：手动创建仓库（适合不熟悉 CLI 的用户）

#### 步骤 1：在 GitHub 上创建新仓库

1. 访问 GitHub: https://github.com/new
2. 填写仓库信息：
   - **Repository name**: RSSWeb
   - **Description**: 现代 RSS 阅读器 - 基于 Next.js、React、TypeScript 构建
   - **Visibility**: ☑️ Public
3. 点击 "Create repository"

#### 步骤 2：添加远程仓库

```bash
# 在 rssweb 目录下执行
cd /root/.openclaw/workspace/rssweb

# 添加远程仓库（替换 YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/RSSWeb.git
```

#### 步骤 3：推送代码

```bash
# 推送到 GitHub
git push -u origin master
```

#### 步骤 4：验证推送

访问 GitHub 仓库查看：
https://github.com/YOUR_USERNAME/RSSWeb

---

### 方式三：使用 GitHub Desktop（GUI 客户端）

#### 步骤 1：安装 GitHub Desktop

访问: https://desktop.github.com/

#### 步骤 2：登录并克隆仓库

1. 登录 GitHub Desktop
2. 点击 "File" -> "Clone repository"
3. 选择 "URL" 标签
4. 输入仓库 URL: `https://github.com/YOUR_USERNAME/RSSWeb.git`
5. 选择本地路径: `/root/.openclaw/workspace/RSSWeb`

#### 步骤 3：推送代码

1. 在 GitHub Desktop 中选择 RSSWeb 仓库
2. 点击 "Publish branch" 或 "Push origin"

---

## 📋 仓库信息

### 推荐的仓库设置

**仓库名称**: RSSWeb

**描述**:
```
现代 RSS 阅读器 - 基于 Next.js、React、TypeScript 构建

核心功能：
- ✅ RSS 订阅管理（添加、编辑、删除、验证）
- ✅ 文章阅读器（全文、已读/收藏、响应式）
- ✅ 高级搜索（时间范围、标签过滤）
- ✅ OPML 导入/导出（支持主流阅读器）
- ✅ 双模型支持（Big Model + Gemini）
- ✅ 自动切换和重置时间探测
- ✅ 完整的测试系统

技术栈：
- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS v4
- shadcn/ui

项目特点：
- 响应式设计（移动优先）
- 数据持久化（localStorage）
- 类型安全（TypeScript 严格模式）
- 完整的错误处理和测试
```

**首页 URL**: https://github.com/YOUR_USERNAME/RSSWeb

**主题标签** (建议添加)：
```
nextjs, react, typescript, rss, reader, feed, aggregator,
web-app, rss-reader, rss-feed, subscription-manager,
tailwindcss, shadcn-ui
```

**License**: MIT License

---

## 🎯 项目亮点

### 核心功能

1. **订阅管理**
   - 添加/编辑/删除 RSS 订阅源
   - RSS URL 验证和解析
   - 分类管理（技术、新闻、博客等）
   - 订阅源信息展示

2. **文章阅读**
   - 文章列表展示（未读/已读状态）
   - 文章详情阅读视图
   - 标记已读/未读
   - 收藏/取消收藏文章
   - 全文内容加载

3. **高级搜索**
   - 全局搜索文章
   - 按订阅源过滤
   - 按时间范围过滤
   - 按标签过滤
   - 自定义排序（最新/最旧）

4. **OPML 导入/导出**
   - 导出订阅列表为 OPML
   - 从 OPML 文件导入订阅
   - 支持主流 RSS 阅读器（Feedly, Inoreader 等）

5. **双模型支持**
   - Big Model：主要提供商
   - Gemini：备用提供商
   - 自动切换（当 Big Model 额度用完时）
   - 重置时间探测和锚定
   - 模型测试界面

---

## 🔧 技术架构

### 技术栈

- **前端框架**: Next.js 16 (App Router)
- **UI 库**: shadcn/ui
- **样式**: Tailwind CSS v4
- **状态管理**: React Context + Hooks
- **数据获取**: fetch API (服务端 + 客户端）
- **RSS 解析**: 自定义解析器（支持 RSS 2.0 和 Atom）
- **类型系统**: TypeScript 5 (严格模式）

### 项目结构

```
src/
├── app/
│   ├── api/              # API 路由
│   │   ├── model/       # 模型调用 API
│   │   │   ├── big-model/route.ts
│   │   │   └── gemini/route.ts
│   │   ├── rss/[url]/    # RSS 代理
│   │   └── anchor/sync/route.ts  # 锚点同步
│   ├── model-test/       # 模型测试页面
│   ├── reset-test/       # 重置测试页面
│   ├── subscriptions/    # 订阅管理页面
│   ├── read/[id]/        # 文章阅读页面
│   ├── import-export/     # OPML 导入导出
│   ├── search/           # 高级搜索
│   ├── page.tsx          # 主页面
│   └── layout.tsx        # 根布局
├── components/
│   ├── ui/              # shadcn/ui 组件 (7 个)
│   ├── ModelCallTest.tsx
│   ├── ResetDetectorTest.tsx
│   ├── ArticleCard.tsx
│   ├── SubscriptionCard.tsx
│   ├── SubscriptionForm.tsx
│   ├── SubscriptionList.tsx
│   ├── ArticleReader.tsx
│   └── Navigation.tsx
├── models/
│   ├── useModelCall.ts   # 模型调用 Hook
│   ├── useResetDetector.ts  # 重置探测 Hook
│   ├── useAnchors.ts      # 锚点管理 Hook
│   ├── reset-time-detector.ts  # 重置时间探测
│   └── anchors.ts         # 锚点配置
├── contexts/
│   └── AppContext.tsx    # 全局状态管理
├── lib/
│   ├── storage.ts        # 数据存储 (localStorage 封装)
│   ├── rss-parser.ts     # RSS 解析器
│   ├── sample-data.ts     # 示例数据
│   └── utils.ts          # 工具函数
└── types/
    └── index.ts         # TypeScript 类型定义
```

---

## 📝 README.md 建议内容

```markdown
# RSSWeb

现代 RSS 阅读器，基于 Next.js、React、TypeScript 构建。

## 功能特性

- ✅ RSS 订阅管理（添加、编辑、删除、验证）
- ✅ 文章阅读器（全文、已读/收藏、响应式）
- ✅ 高级搜索（时间范围、标签过滤、排序）
- ✅ OPML 导入/导出（支持主流阅读器）
- ✅ 双模型支持（Big Model + Gemini）
- ✅ 自动切换和重置时间探测
- ✅ 完整的测试系统

## 技术栈

- **Next.js** 16
- **React** 19
- **TypeScript** 5
- **Tailwind CSS** v4
- **shadcn/ui**

## 快速开始

\`\`\`bash
# 克隆项目
git clone https://github.com/YOUR_USERNAME/RSSWeb.git

# 进入项目目录
cd RSSWeb

# 安装依赖
npm install

# 启动开发服务器
npm run dev
\`\`\`

访问 http://localhost:3000

## 配置

复制 `.env.example` 为 `.env.local` 并配置：

\`\`bash
BIG_MODEL_API_KEY=your_big_model_api_key
GEMINI_API_KEY=your_gemini_api_key
\`\`\`

## 项目结构

[详细的目录结构说明]

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
```

---

## ⚠️ 常见问题

### 问题 1：推送时提示认证失败

**解决方案**：
- 检查 GitHub 用户名和 Token 是否正确
- 确保 Token 有 `repo` 权限
- 尝试使用 SSH 而不是 HTTPS

### 问题 2：推送速度慢

**解决方案**：
- 考虑使用 SSH 协议
- 检查网络连接
- 分批推送大文件

### 问题 3：文件太大无法推送

**解决方案**：
- 如果仓库是新的，应该可以推送
- 如果遇到限制，可以使用 Git LFS (Large File Storage)
- 或者优化项目结构，减少大文件

---

## 📊 项目统计

- **总文件数**: 62
- **总代码行数**: 19,184
- **主要语言**: TypeScript, JavaScript, CSS
- **项目大小**: ~165,000+ bytes

---

## 🎉 恭喜！

你的 RSSWeb 项目已经准备就绪，可以推送到 GitHub 了！

选择一种方式（GitHub CLI、手动创建、GitHub Desktop），按照步骤操作即可。

如果你遇到任何问题，请随时告诉我！
