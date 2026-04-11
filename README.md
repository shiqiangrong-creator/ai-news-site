# AI 资讯聚合网站

一个基于 Next.js 的每日 AI 资讯聚合网站，自动抓取量子位、机器之心等优质 AI 资讯源的内容，并使用 DeepSeek AI 生成智能摘要。

## 功能特性

- 📰 **多源聚合**：自动抓取量子位、机器之心 RSS 源
- 🤖 **AI 摘要**：使用 DeepSeek API 为每篇文章生成 100 字以内的中文摘要
- 🔍 **全文搜索**：基于 FlexSearch 的前端搜索功能
- ⭐ **收藏功能**：localStorage 本地收藏喜欢的文章
- 🏷️ **分类筛选**：按来源网站快速筛选
- 📱 **响应式设计**：适配桌面和移动设备

## 技术栈

- **框架**：Next.js 14 (App Router)
- **部署**：Vercel (静态导出)
- **AI**：DeepSeek API
- **搜索**：FlexSearch
- **样式**：CSS Modules / Tailwind

## 项目结构

```
ai-news-site/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 首页
│   ├── layout.tsx         # 布局
│   └── globals.css        # 全局样式
├── components/             # React 组件
│   ├── ArticleCard.tsx    # 文章卡片
│   ├── ArticleList.tsx    # 文章列表
│   ├── FilterBar.tsx      # 筛选栏
│   └── useFavorites.ts    # 收藏 Hook
├── lib/                    # 工具函数
│   ├── rss.ts            # RSS 解析
│   ├── deepseek.ts       # AI 摘要
│   └── search.ts         # 搜索功能
├── scripts/                # 脚本
│   └── fetch-news.ts     # 抓取脚本
├── data/                   # 数据目录
│   └── articles.json      # 文章数据
└── .github/workflows/      # GitHub Actions
    └── update-news.yml   # 自动更新工作流
```

## 快速开始

### 本地开发

```bash
# 克隆项目
git clone <your-repo-url>
cd ai-news-site

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 构建生产版本

```bash
npm run build
npm run export
```

## 部署指南

### Vercel 部署

1. **Fork 本项目** 到你的 GitHub 仓库

2. **配置环境变量**
   - 登录 Vercel Dashboard
   - 导入项目
   - 在 Settings → Environment Variables 中添加：
     - `DEEPSEEK_API_KEY`: 你的 DeepSeek API Key

3. **部署项目**
   - Vercel 会自动检测 Next.js 项目并配置构建命令
   - 建议使用 `npm run build` 作为构建命令

### GitHub Actions 自动更新

1. **配置 GitHub Secrets**
   - 进入 Settings → Secrets and variables → Actions
   - 添加以下 Secret：
     - `DEEPSEEK_API_KEY`: DeepSeek API Key
     - `VERCEL_TOKEN`: Vercel 访问令牌
     - `VERCEL_ORG_ID`: Vercel 组织 ID
     - `VERCEL_PROJECT_ID`: Vercel 项目 ID

2. **工作流说明**
   - 每 6 小时自动执行一次
   - 抓取最新 RSS 内容
   - 生成 AI 摘要
   - 提交并推送到 GitHub
   - 自动触发 Vercel 部署

## 获取 DeepSeek API Key

1. 访问 [DeepSeek 开放平台](https://platform.deepseek.com/)
2. 注册/登录账号
3. 在 API Keys 页面创建新的 API Key
4. 注意保管好 API Key，不要泄露给他人

## RSS 源

- **量子位**: `https://www.qbitai.com/feed`
- **机器之心**: `https://rsshub.app/jiqizhixin`

## 手动更新数据

```bash
# 设置环境变量
export DEEPSEEK_API_KEY="your-api-key"

# 运行抓取脚本
npm run fetch-news
```

## License

MIT License
