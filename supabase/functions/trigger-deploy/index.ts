/**
 * Edge Function: trigger-deploy
 * 功能: 通过 GitHub API 触发前台项目的 GitHub Actions 构建部署
 */

const GITHUB_API_BASE = "https://api.github.com";
const SUPABASE_URL = "https://ksfefrrvqvksrglprbyu.supabase.co";

// CORS 头 - 模块级别
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  try {
    // 处理 CORS 预检请求
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 解析请求体
    const { action, id, owner, repo, workflow_id, ref = "main" } = await req.json();

    // 获取用户 token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: "未提供认证信息" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 获取 GitHub Token
    const githubToken = Deno.env.get("GITHUB_TOKEN");
    if (!githubToken) {
      return new Response(
        JSON.stringify({ success: false, message: "GitHub Token 未配置" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 统一响应格式
    const jsonResponse = (data: any, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });

    // 处理不同操作
    if (action === "status") {
      // 查询构建状态
      if (!id) {
        return jsonResponse({ success: false, message: "缺少记录 ID" }, 400);
      }
      return await getDeployStatus(id, authHeader);
    }

    if (action === "list") {
      // 获取发布历史
      return await getDeployLogs(authHeader);
    }

    // 触发新构建 - 没有 action 参数时执行
    if (req.method !== "POST") {
      return jsonResponse({ success: false, message: "仅支持 POST 请求" }, 405);
    }

    // 验证必需参数
    if (!owner || !repo || !workflow_id) {
      return jsonResponse({ success: false, message: "缺少必需参数" }, 400);
    }

    // 1. 先获取最新的 workflow runs 获取 run_id
    const runsUrl = `${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/workflows/${workflow_id}/runs?per_page=1`;
    const runsResponse = await fetch(runsUrl, {
      headers: {
        "Authorization": `Bearer ${githubToken}`,
        "Accept": "application/vnd.github.v3+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    const runsData = await runsResponse.json();
    const previousRunId = runsData.workflow_runs?.[0]?.id || 0;

    // 2. 触发 workflow_dispatch
    const triggerUrl = `${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/workflows/${workflow_id}/dispatches`;
    const triggerResponse = await fetch(triggerUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${githubToken}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({ ref, inputs: {} }),
    });

    if (triggerResponse.status !== 204) {
      const errorData = await triggerResponse.json();
      return jsonResponse({
        success: false,
        message: `GitHub API 错误: ${errorData.message || "未知错误"}`,
      }, triggerResponse.status);
    }

    // 3. 等待一下让 GitHub 创建新的 run
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. 重新获取最新的 run_id
    const newRunsResponse = await fetch(runsUrl, {
      headers: {
        "Authorization": `Bearer ${githubToken}`,
        "Accept": "application/vnd.github.v3+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    const newRunsData = await newRunsResponse.json();
    const newRun = newRunsData.workflow_runs?.[0];

    if (!newRun || newRun.id === previousRunId) {
      // 如果没找到新 run，返回成功但不包含 run_id
      return jsonResponse({
        success: true,
        message: "发布已触发！GitHub Actions 正在排队中...",
      });
    }

    // 5. 保存发布记录到数据库
    try {
      const savedLog = await saveDeployLog({
        userToken: authHeader,
        log: {
          owner,
          repo,
          workflow_id,
          run_id: newRun.id,
          status: newRun.status === 'queued' ? 'pending' : newRun.status === 'in_progress' ? 'in_progress' : newRun.status,
          message: `构建 #${newRun.run_number} 已开始`,
          commit_sha: newRun.head_sha,
        },
      });
      console.log("发布记录已保存:", savedLog);
    } catch (e) {
      console.error("保存发布记录失败:", e);
    }

    // 6. 返回成功信息
    return jsonResponse({
      success: true,
      message: `发布已触发！构建 #${newRun.run_number} 正在排队中...`,
      run_id: newRun.id,
      run_number: newRun.run_number,
      status: newRun.status,
      html_url: newRun.html_url,
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: `服务器错误: ${error.message}` }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

// 获取用户 ID
async function getUserId(token: string): Promise<string | null> {
  try {
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!anonKey) {
      console.error("SUPABASE_ANON_KEY 未配置");
      return null;
    }
    
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        "Authorization": token,
        "apikey": anonKey,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error("验证 token 失败:", response.status, errorData);
      return null;
    }
    
    const data = await response.json();
    console.log("用户验证成功:", data.id);
    return data.id || null;
  } catch (e) {
    console.error("获取用户 ID 异常:", e);
    return null;
  }
}

// 保存发布记录
async function saveDeployLog(params: { userToken: string; log: any }) {
  const userId = await getUserId(params.userToken);
  if (!userId) {
    throw new Error("无法获取用户 ID，可能是未登录或 token 无效");
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/deploy_logs`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      "apikey": Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      "Content-Type": "application/json",
      "Prefer": "return=representation",
    },
    body: JSON.stringify({
      user_id: userId,
      ...params.log,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`保存记录失败: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// 获取发布记录列表
async function getDeployLogs(userToken: string) {
  const userId = await getUserId(userToken);
  if (!userId) {
    return new Response(
      JSON.stringify({ success: false, message: "无法获取用户信息" }),
      { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/deploy_logs?user_id=eq.${userId}&order=created_at.desc&limit=20`,
    {
      headers: {
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        "apikey": Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      },
    }
  );

  const data = await response.json();
  return new Response(
    JSON.stringify({ success: true, data }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

// 获取单个构建状态
async function getDeployStatus(id: string, userToken: string) {
  // 如果 id 是纯数字（run_id），直接从 GitHub 获取
  if (/^\d+$/.test(id)) {
    const githubToken = Deno.env.get("GITHUB_TOKEN");
    const runResponse = await fetch(
      `${GITHUB_API_BASE}/repos/wumacms/berry-medical-web/actions/runs/${id}`,
      {
        headers: {
          "Authorization": `Bearer ${githubToken}`,
          "Accept": "application/vnd.github.v3+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!runResponse.ok) {
      return new Response(
        JSON.stringify({ success: false, message: "无法获取构建状态" }),
        { status: runResponse.status, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const runData = await runResponse.json();
    const status = runData.status === 'completed' 
      ? (runData.conclusion === 'success' ? 'success' : runData.conclusion === 'cancelled' ? 'cancelled' : 'failed')
      : (runData.status === 'in_progress' ? 'in_progress' : 'pending');

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: id,
          run_id: runData.id,
          status,
          message: runData.status === 'completed'
            ? `构建${runData.conclusion === 'success' ? '成功' : runData.conclusion}`
            : runData.status === 'in_progress' ? '构建中...' : '排队中',
          html_url: runData.html_url,
          conclusion: runData.conclusion,
        },
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  // 否则按 uuid 查询数据库
  const userId = await getUserId(userToken);
  if (!userId) {
    return new Response(
      JSON.stringify({ success: false, message: "无法获取用户信息" }),
      { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  // 先获取本地记录
  const localResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/deploy_logs?id=eq.${id}&user_id=eq.${userId}`,
    {
      headers: {
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        "apikey": Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      },
    }
  );
  const localData = await localResponse.json();
  const localLog = localData?.[0];

  if (!localLog?.run_id) {
    return new Response(
      JSON.stringify({ success: false, message: "记录不存在或无 run_id" }),
      { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  // 从 GitHub 获取最新状态
  const githubToken = Deno.env.get("GITHUB_TOKEN");
  const runResponse = await fetch(
    `${GITHUB_API_BASE}/repos/${localLog.owner}/${localLog.repo}/actions/runs/${localLog.run_id}`,
    {
      headers: {
        "Authorization": `Bearer ${githubToken}`,
        "Accept": "application/vnd.github.v3+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  const runData = await runResponse.json();

  // 更新本地记录
  const status = runData.status === 'completed' 
    ? (runData.conclusion === 'success' ? 'success' : runData.conclusion === 'cancelled' ? 'cancelled' : 'failed')
    : (runData.status === 'in_progress' ? 'in_progress' : 'pending');

  await fetch(
    `${SUPABASE_URL}/rest/v1/deploy_logs?id=eq.${id}`,
    {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        "apikey": Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
        message: runData.status === 'completed'
          ? `构建${runData.conclusion === 'success' ? '成功' : runData.conclusion}`
          : runData.status === 'in_progress' ? '构建中...' : '排队中',
        finished_at: runData.status === 'completed' ? runData.updated_at : null,
      }),
    }
  );

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        id: localLog.id,
        run_id: localLog.run_id,
        status,
        message: runData.status === 'completed'
          ? `构建${runData.conclusion === 'success' ? '成功' : runData.conclusion}`
          : runData.status === 'in_progress' ? '构建中...' : '排队中',
        html_url: runData.html_url,
        conclusion: runData.conclusion,
      },
    }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}
