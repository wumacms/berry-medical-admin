# 发布功能部署指南

## ✅ 已完成的代码实现

### 1. Edge Function (后端)
**文件**: `supabase/functions/trigger-deploy/index.ts`

功能：接收前端请求，调用 GitHub API 触发 workflow_dispatch

### 2. Composable (前端)
**文件**: `composables/useDeploy.ts`

功能：封装部署逻辑，提供 `triggerDeploy()` 方法

### 3. 导航栏按钮 (UI)
**文件**: `layouts/default.vue`

功能：在顶部导航栏添加"发布网站"按钮

---

## 🔧 需要完成的配置步骤

### 步骤 1: 创建 GitHub Personal Access Token

1. 访问: https://github.com/settings/tokens?type=beta
2. 点击 **"Generate new token"** → **"Generate new token (classic)"**
3. 配置 Token:
   - **Note**: `berry-medical-deploy`
   - **Expiration**: 选择 `No expiration` 或合适的时间
   - **Scopes**: 勾选以下权限
     - ✅ **repo** (完整仓库访问权限)
     - ✅ **workflow** (更新 GitHub Actions workflow)
4. 点击 **"Generate token"**
5. **复制生成的 Token** (形如: `ghp_xxxxxxxxxxxx`)

---

### 步骤 2: 配置 Supabase 环境变量

#### 方法 A: 通过 Supabase Dashboard (推荐)

1. 访问: https://supabase.com/dashboard/project/ksfefrrvqvksrglprbyu/settings/functions
2. 在 **"Edge Functions Secrets"** 部分，点击 **"Add new secret"**
3. 添加以下环境变量:

| Secret Name | Value | 说明 |
|-------------|-------|------|
| `GITHUB_TOKEN` | `ghp_xxxxxxxxxxxx` | 步骤 1 中创建的 GitHub PAT |

#### 方法 B: 通过 Supabase CLI

```bash
# 安装 Supabase CLI (如果未安装)
npm install -g supabase

# 登录 Supabase
supabase login

# 设置环境变量
supabase secrets set GITHUB_TOKEN=ghp_xxxxxxxxxxxx --project-ref ksfefrrvqvksrglprbyu
```

---

### 步骤 3: 部署 Edge Function

#### 方法 A: 通过 Supabase Dashboard (简单)

1. 访问: https://supabase.com/dashboard/project/ksfefrrvqvksrglprbyu/functions
2. 点击 **"Create a new function"**
3. 配置:
   - **Function name**: `trigger-deploy`
   - **Verify JWT**: ✅ 启用 (确保只有登录用户能触发)
4. 将 `supabase/functions/trigger-deploy/index.ts` 的代码粘贴到编辑器
5. 点击 **"Deploy"**

#### 方法 B: 通过 Supabase CLI (推荐用于生产)

```bash
# 进入项目目录
cd /Users/devlink/code/github/wumacms/berry-medical/berry-medical-admin

# 链接 Supabase 项目
supabase link --project-ref ksfefrrvqvksrglprbyu

# 部署 Edge Function
supabase functions deploy trigger-deploy --project-ref ksfefrrvqvksrglprbyu
```

---

### 步骤 4: 测试功能

#### 4.1 本地测试

```bash
# 启动后台管理系统
cd /Users/devlink/code/github/wumacms/berry-medical/berry-medical-admin
npm run dev
```

1. 访问: http://localhost:3001/berry-medical-admin/
2. 登录后台管理系统
3. 点击顶部导航栏的 **"发布网站"** 按钮
4. 确认弹窗提示
5. 检查是否显示成功消息

#### 4.2 验证 GitHub Actions

1. 访问: https://github.com/wumacms/berry-medical-web/actions
2. 应该看到新的 workflow 运行记录
3. 点击进入查看构建进度

---

## 🐛 常见问题排查

### 问题 1: Edge Function 返回 500 错误

**可能原因**: `GITHUB_TOKEN` 环境变量未配置或配置错误

**解决方法**:
1. 检查 Supabase Dashboard 的 Functions Secrets 是否正确配置
2. 确认 Token 有正确的权限 (repo + workflow)

---

### 问题 2: GitHub API 返回 404 错误

**可能原因**: `owner`、`repo` 或 `workflow_id` 参数错误

**解决方法**:
1. 确认仓库路径: `wumacms/berry-medical-web`
2. 确认 workflow 文件名: `deploy.yml`
3. 检查 Composable 中的默认配置是否正确

---

### 问题 3: JWT 验证失败

**可能原因**: Edge Function 启用了 JWT 验证，但前端未正确传递 Token

**解决方法**:
1. 确认前端已登录 (Supabase Auth)
2. 检查 `@nuxtjs/supabase` 模块是否正确配置
3. 查看浏览器控制台的详细错误信息

---

## 📝 可选增强功能

### 1. 添加发布日志记录

创建数据库表记录每次发布:

```sql
CREATE TABLE deploy_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_by UUID REFERENCES auth.users(id),
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending',
  github_run_id INTEGER,
  completed_at TIMESTAMPTZ
);
```

### 2. 查询构建状态

在 Edge Function 中添加查询 GitHub Actions 运行状态的功能:

```typescript
// 获取最新的 workflow run
const statusUrl = `${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/runs?per_page=1`;
const statusResponse = await fetch(statusUrl, {
  headers: {
    'Authorization': `Bearer ${githubToken}`,
    'Accept': 'application/vnd.github.v3+json',
  }
});
```

---

## 🚀 生产环境部署

### 部署后台管理系统

如果使用 Vercel:

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

**重要**: 确保在 Vercel 中配置以下环境变量:
- `NUXT_PUBLIC_SUPABASE_URL`
- `NUXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## 📚 相关文档

- [Supabase Edge Functions 文档](https://supabase.com/docs/guides/functions)
- [GitHub Actions API 文档](https://docs.github.com/en/rest/actions/workflows)
- [Nuxt 3 文档](https://nuxt.com/docs)

---

## ✅ 部署检查清单

- [ ] GitHub PAT 已创建并复制
- [ ] Supabase 环境变量 `GITHUB_TOKEN` 已配置
- [ ] Edge Function `trigger-deploy` 已部署
- [ ] 本地测试通过 (点击按钮能触发构建)
- [ ] GitHub Actions 能看到新的运行记录
- [ ] (可选) 数据库表 `deploy_logs` 已创建

---

**需要帮助？** 查看 `docs/deploy-feature-plan.md` 了解详细的技术实现方案。
