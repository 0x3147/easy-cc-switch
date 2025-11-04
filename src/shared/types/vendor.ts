/**
 * 供应商配置类型定义
 */

/**
 * Claude Settings 配置结构
 */
export interface ClaudeSettings {
  env: {
    /** Anthropic 认证令牌 */
    ANTHROPIC_AUTH_TOKEN: string
    /** Anthropic API 基础 URL */
    ANTHROPIC_BASE_URL: string
    /** 禁用非必要流量 */
    CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: number
    /** API 超时时间（可选） */
    API_TIMEOUT_MS?: number
    /** 默认 Opus 模型（可选） */
    ANTHROPIC_DEFAULT_OPUS_MODEL?: string
    /** 默认 Sonnet 模型（可选） */
    ANTHROPIC_DEFAULT_SONNET_MODEL?: string
    /** 默认 Haiku 模型（可选） */
    ANTHROPIC_DEFAULT_HAIKU_MODEL?: string
  }
}

/**
 * 供应商配置表单数据
 */
export interface VendorConfig {
  /** API Token */
  token: string
  /** API 基础 URL */
  baseUrl: string
  /** API 超时时间（可选，单位：毫秒） */
  apiTimeout?: number
  /** 默认 Opus 模型（可选） */
  opusModel?: string
  /** 默认 Sonnet 模型（可选） */
  sonnetModel?: string
  /** 默认 Haiku 模型（可选） */
  haikuModel?: string
}

/**
 * 供应商信息
 */
export interface VendorInfo {
  /** 供应商 ID */
  id: string
  /** 供应商名称 */
  name: string
  /** 供应商 Logo URL */
  logo: string
  /** 默认 URL */
  defaultUrl: string
  /** 当前配置 */
  config?: VendorConfig
}
