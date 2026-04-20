/**
 * Supabase 错误代码中文映射
 * 来源:
 * - Auth: https://supabase.com/docs/guides/auth/debugging/error-codes
 * - Storage: https://deepwiki.com/supabase/supabase-js/6.6-storage-error-handling
 * - Database: https://supabase.com/docs/guides/api/rest/postgrest-error-codes
 */

// ==================== Auth 错误码 ====================
const authErrorCodeMap: Record<string, string> = {
  // 认证凭证相关
  'invalid_credentials': '登录凭证无效，请检查邮箱和密码',
  'email_not_confirmed': '邮箱尚未验证，请先查收验证邮件',
  'email_exists': '该邮箱已被注册',
  'user_not_found': '用户不存在',
  'user_already_exists': '该用户已存在',
  'invalid_email': '邮箱地址格式无效',
  'email_address_invalid': '不支持此邮箱域名，请使用真实邮箱',
  'email_address_not_authorized': '无法向此邮箱发送邮件，请联系管理员',
  'email_conflict_identity_not_deletable': '无法取消链接此邮箱，可能导致账户冲突',

  // 密码相关
  'weak_password': '密码强度不足，请使用更强的密码',
  'same_password': '新密码不能与当前密码相同',

  // 速率限制
  'over_request_rate_limit': '请求过于频繁，请几分钟后重试',
  'over_email_send_rate_limit': '邮件发送过于频繁，请稍后再试',
  'over_sms_send_rate_limit': '短信发送过于频繁，请稍后再试',

  // 会话相关
  'session_expired': '登录状态已过期，请重新登录',
  'session_not_found': '登录状态不存在，请重新登录',
  'refresh_token_not_found': '登录状态已失效，请重新登录',
  'refresh_token_already_used': '登录状态已失效，请重新登录',

  // 注册登录限制
  'signup_disabled': '注册功能已关闭',
  'email_provider_disabled': '邮箱登录已禁用',
  'phone_provider_disabled': '手机号登录已禁用',
  'phone_exists': '该手机号已被注册',
  'phone_not_confirmed': '手机号尚未验证',
  'otp_disabled': '魔法链接登录已禁用',
  'otp_expired': '登录链接已过期，请重新获取',
  'anonymous_provider_disabled': '匿名登录已禁用',

  // OAuth 相关
  'oauth_provider_not_supported': '该第三方登录方式已禁用',
  'provider_disabled': '该登录方式已禁用',
  'bad_oauth_callback': '第三方登录回调失败，请重试',
  'bad_oauth_state': '登录状态验证失败，请重试',
  'provider_email_needs_verification': '邮箱未验证，验证邮件已发送至您的邮箱',

  // MFA 相关
  'mfa_verification_failed': '多因素验证失败，请检查验证码',
  'mfa_verification_rejected': '多因素验证被拒绝',
  'mfa_challenge_expired': '多因素验证已超时，请重新验证',
  'mfa_factor_not_found': '未找到多因素验证设备',
  'mfa_factor_name_conflict': '多因素设备名称重复',
  'mfa_ip_address_mismatch': '验证 IP 地址不一致',
  'mfa_totp_enroll_not_enabled': 'TOTP 多因素认证未启用',
  'mfa_totp_verify_not_enabled': 'TOTP 多因素验证未启用',
  'mfa_phone_enroll_not_enabled': '短信多因素认证未启用',
  'mfa_phone_verify_not_enabled': '短信多因素验证未启用',
  'mfa_web_authn_enroll_not_enabled': 'WebAuthn 多因素认证未启用',
  'mfa_web_authn_verify_not_enabled': 'WebAuthn 多因素验证未启用',
  'mfa_verified_factor_exists': '已存在验证通过的多因素设备',
  'too_many_enrolled_mfa_factors': '多因素设备数量已达上限',
  'insufficient_aal': '需要更高安全级别，请完成多因素认证',

  // SAML/SSO 相关
  'saml_provider_disabled': '企业单点登录已禁用',
  'saml_idp_not_found': '未找到身份提供商',
  'saml_idp_already_exists': '该身份提供商已配置',
  'saml_assertion_no_email': '未收到邮箱信息',
  'saml_assertion_no_user_id': '未收到用户标识',
  'saml_entity_id_mismatch': '身份提供商配置不匹配',
  'saml_metadata_fetch_failed': '无法获取身份提供商元数据',
  'saml_relay_state_expired': '单点登录会话已过期',
  'saml_relay_state_not_found': '单点登录会话不存在',
  'user_sso_managed': '该账户受 SSO 管理，部分信息无法修改',
  'sso_domain_already_exists': '该域名已被其他身份提供商使用',
  'sso_provider_not_found': '未找到单点登录配置',
  'user_is_saml_user': '不支持此操作',

  // 重新认证
  'reauthentication_needed': '需要重新验证身份才能继续操作',
  'reauthentication_not_valid': '重新验证失败，请重新获取验证码',

  // 身份链接
  'identity_already_exists': '该账户已绑定其他登录方式',
  'identity_not_found': '未找到关联的登录方式',
  'single_identity_not_deletable': '无法删除唯一登录方式',
  'manual_linking_disabled': '账户绑定功能已禁用',

  // 邀请相关
  'invite_not_found': '邀请已过期或已被使用',

  // 授权相关
  'no_authorization': '请求缺少认证信息',
  'not_admin': '需要管理员权限',
  'bad_jwt': '认证令牌无效',

  // 验证/参数错误
  'validation_failed': '输入信息格式不正确，请检查',
  'bad_json': '请求格式错误',
  'request_timeout': '请求超时，请重试',

  // Hook 相关
  'hook_timeout': '服务器处理超时，请重试',
  'hook_timeout_after_retry': '服务器处理超时，请稍后重试',
  'hook_payload_invalid_content_type': '服务器配置错误',
  'hook_payload_over_size_limit': '请求数据过大',

  // 其他
  'conflict': '操作冲突，可能存在并发请求',
  'unexpected_failure': '服务异常，请稍后重试',
  'user_banned': '账户已被禁用，请联系管理员',
  'sms_send_failed': '短信发送失败，请检查配置',
  'captcha_failed': '验证失败，请重试',
  'bad_code_verifier': '验证流程错误，请重试',
  'flow_state_expired': '登录流程已过期，请重新操作',
  'flow_state_not_found': '登录流程不存在，请重新操作',
}

// ==================== Storage HTTP 状态码 ====================
const storageStatusCodeMap: Record<string, string> = {
  '400': '请求格式错误，请检查参数',
  '401': '未授权，请重新登录',
  '403': '无权访问此文件或存储桶',
  '404': '文件或存储桶不存在',
  '406': '请求格式不被接受',
  '409': '文件已存在，请使用覆盖模式或删除原文件',
  '412': '文件条件不满足',
  '413': '文件大小超过限制',
  '415': '不支持的文件类型',
  '422': '无法处理此文件',
  '429': '请求过于频繁，请稍后再试',
  '500': '服务器错误，请稍后再试',
  '502': '服务器网关错误，请稍后再试',
  '503': '服务暂时不可用，请稍后再试',
}

// Storage 常见错误消息
const storageMessageMap: Record<string, string> = {
  'bucket not found': '存储桶不存在',
  'object not found': '文件不存在',
  'the resource already exists': '文件已存在',
  'the object exceeded the maximum allowed size': '文件大小超过允许的最大限制',
  'mime type': '不支持的文件类型',
  'file type not allowed': '不允许的文件类型',
  'invalid file name': '无效的文件名',
  'invalid path': '无效的路径',
  'permission denied': '权限不足，无法访问此资源',
  'unauthorized': '未授权，请检查登录状态',
  'storage quota exceeded': '存储空间配额已用完',
  'upload failed': '上传失败，请重试',
  'download failed': '下载失败，请重试',
  'delete failed': '删除失败，请重试',
}

// ==================== Database/PostgREST 错误码 ====================

// PostgreSQL 数据库错误码 (5位数字)
const postgresErrorCodeMap: Record<string, string> = {
  // 唯一性冲突 (最常见)
  '23505': '数据已存在，请勿重复添加',
  '23514': '数据校验失败，请检查输入值',
  '23502': '缺少必填字段',
  '23503': '关联数据不存在或已被删除',

  // 表/列相关
  '42P01': '数据表不存在',
  '42P07': '数据表已存在',
  '42703': '字段不存在',
  '42701': '字段名重复',
  '42883': '函数不存在',

  // 权限相关
  '42501': '权限不足，无法执行此操作',
  '28000': '无效的认证信息',
  '28P01': '密码验证失败',

  // 连接相关
  '08001': '无法连接到数据库服务',
  '08006': '数据库连接已断开',

  // 事务相关
  '40001': '事务冲突，请重试',
  '40P01': '死锁检测，请重试',
  '25006': '只读模式下无法修改数据',

  // 约束相关
  '23000': '数据约束冲突',
  '23001': '违反行安全策略',
  '39P01': '触发器执行异常',
  '39P02': '约束检查异常',

  // 数据类型相关
  '22P02': '数据类型错误，请检查输入格式',
  '22P03': '数值溢出',
  '22P04': '坏的 UTF-8 字符',
  '22P05': '无法转换的字符',

  // 资源限制
  '53000': '数据库资源不足',
  '53100': '磁盘空间不足',
  '53200': '内存不足',
  '53400': '查询语句过于复杂',

  // 语法/解析错误
  '42601': 'SQL 语法错误',
  '42000': '语法错误或访问规则违规',

  // 其他
  'XX000': '数据库内部错误，请稍后重试',
  '58000': '系统错误',
  'F0000': '配置文件错误',
}

// PostgREST API 错误码
const postgRESTErrorCodeMap: Record<string, string> = {
  // 连接错误
  'PGRST000': '数据库连接配置错误',
  'PGRST001': '无法连接到数据库',
  'PGRST002': '数据库模式缓存构建失败',
  'PGRST003': '请求超时，请重试',

  // API 请求错误
  'PGRST100': '查询参数格式错误',
  'PGRST101': '不支持的 HTTP 方法',
  'PGRST102': '请求体格式无效',
  'PGRST103': '请求范围无效',
  'PGRST105': '无效的更新请求',
  'PGRST106': '请求的模式未开放',
  'PGRST107': '不支持的内容类型',
  'PGRST108': '无法筛选嵌入资源',
  'PGRST111': '响应头配置无效',
  'PGRST112': '状态码必须为正整数',
  'PGRST114': 'UPSERT 不支持分页',
  'PGRST115': '主键不匹配',
  'PGRST116': '查询结果数量与预期不符',
  'PGRST117': '不支持的 HTTP 方法',
  'PGRST118': '无法排序嵌入资源',
  'PGRST120': '嵌入资源筛选条件无效',
  'PGRST122': '无效的请求偏好设置',
  'PGRST123': '聚合查询已禁用',
  'PGRST124': '影响行数超出限制',
  'PGRST125': '请求路径无效',
  'PGRST126': 'API 配置未启用',
  'PGRST127': '请求的功能未实现',

  // 模式缓存错误
  'PGRST200': '外键关系已过期或不存在',
  'PGRST201': '嵌入请求不明确',
  'PGRST202': '函数不存在或已过期',
  'PGRST203': '函数参数类型不匹配',
  'PGRST204': '指定的列不存在',
  'PGRST205': '指定的表不存在',

  // 认证错误
  'PGRST300': 'JWT 配置无效',
  'PGRST301': 'JWT 令牌无效',
  'PGRST302': '需要登录才能访问',
  'PGRST303': 'JWT 验证失败',
}

/**
 * 根据错误获取中文提示
 */
export function getErrorMessage(error: any): string {
  if (!error) return '操作失败，请稍后重试'

  // 1. Storage API 错误 - 使用 statusCode
  if (error.name === 'StorageApiError' && error.statusCode) {
    const statusMsg = storageStatusCodeMap[error.statusCode]
    if (statusMsg) return statusMsg
  }

  // 2. Storage 未知错误 - 处理网络错误
  if (error.name === 'StorageUnknownError') {
    const originalError = error.originalError
    if (originalError) {
      if (originalError.message?.includes('fetch')) {
        return '网络连接失败，请检查网络后重试'
      }
      return `操作失败: ${originalError.message || '未知错误'}`
    }
    return '操作失败，请稍后重试'
  }

  // 3. Database 错误 - 检查 code 字段 (PostgREST/PostgreSQL)
  if (error.code) {
    // PostgREST 错误码 (PGRST*)
    if (postgRESTErrorCodeMap[error.code]) {
      return postgRESTErrorCodeMap[error.code]
    }
    // PostgreSQL 错误码 (5位数字)
    if (postgresErrorCodeMap[error.code]) {
      return postgresErrorCodeMap[error.code]
    }
  }

  // 4. Auth 错误 - 优先使用 error.code
  if (error.code && authErrorCodeMap[error.code]) {
    return authErrorCodeMap[error.code]
  }

  // 5. 尝试 error.name
  if (error.name && authErrorCodeMap[error.name]) {
    return authErrorCodeMap[error.name]
  }

  // 6. 尝试 error.message 模糊匹配
  let message = ''
  if (typeof error === 'string') {
    message = error
  } else if (error.message) {
    message = error.message
  } else if (error.error_description) {
    message = error.error_description
  }

  if (message) {
    // Storage 错误消息匹配
    const lowerMessage = message.toLowerCase()
    for (const [key, value] of Object.entries(storageMessageMap)) {
      if (lowerMessage.includes(key)) {
        return value
      }
    }

    // Auth 错误消息模糊匹配
    for (const [key, value] of Object.entries(authErrorCodeMap)) {
      if (lowerMessage.includes(key.replace(/_/g, ' '))) {
        return value
      }
    }
  }

  return message || '操作失败，请稍后重试'
}
