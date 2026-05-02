# 网站一键发布功能实现方案

## 概述

本方案实现后台管理系统导航栏的"发布网站"按钮功能，点击后通过 GitHub API 触发前台项目的 GitHub Actions 自动构建部署。

## 技术架构

```
┌─────────────────────────────────────────────────────────────────┐
│                     后台管理系统 (berry-medical-admin)             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │  导航栏按钮  │ →  │  Composable │ →  │  Supabase Edge Fx   │  │
│  │  发布网站    │    │  useDeploy  │    │  trigger-deploy      │  │
│  └─────────────┘    └─────────────┘    └──────────┬──────────┘  │
└─────────────────────────────────────────────────────│─────────────┘
                                                      │
                                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                         GitHub API                              │
│  POST /repos/{owner}/{repo}/actions/workflows/deploy.yml/dispatches │
└─────────────────────────────────────────────────────────────────┘
                                                      │
                                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                   GitHub Actions (berry-medical-web)             │
│  workflow_dispatch 触发 → 安装依赖 → 获取数据 → 构建 → 部署      │
└─────────────────────────────────────────────────────────────────┘
```

## 实现步骤

### 阶段一：后端实现

#### 1.1 创建 Supabase Edge Function

**文件位置**: `supabase/functions/trigger-deploy/index.ts`

**核心功能**:
- 接收前端发布请求
- 使用 GitHub Personal Access Token 调用 GitHub API
- 触发指定 workflow 运行

**关键代码逻辑**:

```typescript
// 1. 验证请求来源（可选：验证用户权限）

// 2. 调用 GitHub API
const response = await fetch(
  `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ref: 'main',  // 触发分支
      inputs: {}   // workflow_dispatch 的输入参数（如有）
    })
  }
)
```

**环境变量配置** (Supabase Dashboard):
- `GITHUB_TOKEN`: GitHub Personal Access Token
- `GITHUB_OWNER`: 仓库所有者 (wumacms)
- `GITHUB_REPO`: 仓库名称 (berry-medical-web)
- `GITHUB_WORKFLOW_ID`: workflow 文件名或 ID (deploy.yml)

#### 1.2 GitHub Personal Access Token 获取

1. 访问 GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. 创建新 Token，配置权限:
   - **Repository access**: 选择 `berry-medical-web` 仓库
   - **Permissions** → **Actions**: 勾选 `Read and write`
3. 保存 Token 并配置到 Supabase Edge Function 环境变量

### 阶段二：前端实现

#### 2.1 创建 deploy Composable

**文件位置**: `composables/useDeploy.ts`

**功能**:
- 提供 `triggerDeploy()` 方法调用 Edge Function
- 管理加载状态和错误处理
- 可选：提供 `getDeployStatus()` 查询构建状态

**接口定义**:

```typescript
interface DeployResponse {
  success: boolean
  message: string
  runId?: number  // GitHub Actions run ID，可用于查询状态
}

async function triggerDeploy(): Promise<DeployResponse>
```

#### 2.2 修改导航栏组件

**文件位置**: `layouts/default.vue`

**修改内容**:

在顶部导航栏的按钮区域添加"发布网站"按钮：

```vue
<!-- 在"访问网站"按钮后添加 -->
<button
  @click="handleDeploy"
  :disabled="deploying"
  class="px-3 py-2 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
>
  <i :class="deploying ? 'fas fa-spinner fa-spin' : 'fas fa-rocket'" class="mr-1"></i>
  {{ deploying ? '发布中...' : '发布网站' }}
</button>
```

**状态和方法**:

```typescript
const deploying = ref(false)

async function handleDeploy() {
  // 1. 确认发布
  if (!confirm('确定要发布网站吗？')) return

  // 2. 调用发布接口
  deploying.value = true
  try {
    const result = await triggerDeploy()
    if (result.success) {
      alert(`发布已触发！构建ID: ${result.runId}`)
    } else {
      alert(`发布失败: ${result.message}`)
    }
  } catch (err) {
    alert('网络错误，请重试')
  } finally {
    deploying.value = false
  }
}
```

### 阶段三：数据库表（可选增强）

#### 3.1 创建发布日志表

**文件位置**: `supabase/migrations/xxx_create_deploy_logs.sql`

```sql
CREATE TABLE deploy_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_by TEXT NOT NULL,
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending',
  github_run_id INTEGER,
  github_run_url TEXT,
  error_message TEXT,
  completed_at TIMESTAMPTZ
);
```

## 文件清单

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 新建 | `supabase/functions/trigger-deploy/index.ts` | 触发 GitHub Actions 的 Edge Function |
| 新建 | `composables/useDeploy.ts` | 前端发布相关逻辑的 Composable |
| 修改 | `layouts/default.vue` | 在导航栏添加发布按钮 |
| 新建 | `supabase/migrations/xxx_create_deploy_logs.sql` | 发布日志表（可选） |

## 安全考虑

1. **Token 安全**: GitHub PAT 仅存储在 Supabase 环境变量中，前端无法直接访问
2. **权限控制**: 可在 Edge Function 中添加用户角色验证，确保只有管理员可以发布
3. **请求限流**: 可在 Edge Function 中添加简单的限流逻辑，防止恶意频繁触发

## 扩展功能（可选）

1. **构建状态轮询**: 点击发布后，每 5 秒查询一次构建状态，显示进度
2. **发布历史记录**: 显示最近 10 次发布记录及状态
3. **Webhook 回调**: GitHub Actions 完成后通过 Webhook 通知更新状态

## 测试验证

1. 在 Supabase 本地环境测试 Edge Function
2. 使用 Postman 或 curl 测试 GitHub API 调用
3. 前端按钮功能测试（正常流程 + 错误处理）

## 部署流程

1. 部署 Supabase Edge Function
2. 配置 GitHub PAT 到 Supabase 环境变量
3. 部署后台管理系统

## 相关文档

- [GitHub Actions REST API](https://docs.github.com/en/rest/actions/workflows?apiVersion=2022-11-28)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [GitHub Personal Access Tokens](https://github.com/settings/tokens)
