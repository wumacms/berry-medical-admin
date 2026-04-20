# 贝瑞医疗 - 管理后台

基于 Nuxt 3 + Tailwind CSS + Supabase 构建的后台管理系统。

## 技术栈

- **框架**: Nuxt 3
- **样式**: Tailwind CSS
- **数据库**: Supabase
- **语言**: TypeScript

## 功能模块

- 仪表盘 - 数据统计和快捷操作
- 新闻管理 - 新闻的增删改查
- 页面管理 - 自定义页面和区块管理
- 联系表单 - 查看和管理用户提交的表单
- 网站配置 - 网站基础信息和 SEO 配置

## 快速开始

### 1. 安装依赖

```bash
npm install
# 或
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并配置 Supabase 连接信息：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
NUXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NUXT_PUBLIC_CDN_BASE_URL=https://your-cdn-url.com
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000/berry-medical-admin/` 查看后台管理系统。

### 4. 构建生产版本

```bash
npm run build
```

### 5. 预览生产版本

```bash
npm run preview
```

## 数据库表结构

本后台管理系统依赖以下 Supabase 数据表：

- `news` - 新闻
- `pages` - 页面
- `blocks` - 页面区块
- `contact_submissions` - 联系表单
- `system_settings` - 系统设置

请确保在 Supabase 中创建这些表结构。

## 目录结构

```
berry-medical-admin/
├── assets/              # 静态资源
├── components/          # Vue 组件
├── composables/         # 组合式函数
├── layouts/             # 布局文件
├── middleware/          # 中间件
├── pages/               # 页面
│   ├── index.vue        # 仪表盘
│   ├── login.vue        # 登录页
│   ├── news/            # 新闻管理
│   ├── pages/           # 页面管理
│   ├── contacts.vue     # 联系表单
│   └── settings.vue     # 网站配置
├── public/              # 公共资源
├── nuxt.config.ts       # Nuxt 配置
├── tailwind.config.js   # Tailwind 配置
└── package.json         # 依赖管理
```

## 许可证

MIT
