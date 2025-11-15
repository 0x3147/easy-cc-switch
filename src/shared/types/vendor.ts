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
    /** 默认模型（可选） */
    ANTHROPIC_MODEL?: string
    /** 默认快速小模型（可选） */
    ANTHROPIC_SMALL_FAST_MODEL?: string
    /** 默认 Opus 模型（可选） */
    ANTHROPIC_DEFAULT_OPUS_MODEL?: string
    /** 默认 Sonnet 模型（可选） */
    ANTHROPIC_DEFAULT_SONNET_MODEL?: string
    /** 默认 Haiku 模型（可选） */
    ANTHROPIC_DEFAULT_HAIKU_MODEL?: string
    /** 其他可能的环境变量 */
    [key: string]: string | number | undefined
  }
  /** MCP 服务器配置（保留用户的 MCP 配置） */
  mcpServers?: Record<string, unknown>
  /** 启用的插件列表（保留用户的插件配置） */
  enabledPlugins?: Record<string, boolean>
  /** 其他可能的配置字段（hooks、commands 等） */
  [key: string]: unknown
}

/**
 * 供应商配置表单数据
 */
export interface VendorConfig {
  /** 供应商 ID */
  id: string
  /** 供应商名称（用户自定义） */
  name: string
  /** API Token */
  token: string
  /** API 基础 URL */
  baseUrl: string
  /** API 超时时间（可选，单位：毫秒） */
  apiTimeout?: number
  /** 默认模型（可选） */
  model?: string
  /** 默认快速小模型（可选） */
  smallFastModel?: string
  /** 默认 Opus 模型（可选） */
  opusModel?: string
  /** 默认 Sonnet 模型（可选） */
  sonnetModel?: string
  /** 默认 Haiku 模型（可选） */
  haikuModel?: string
  /** 是否为默认配置（从 .claude/settings.json 读取） */
  isDefault?: boolean
  /** 预设供应商标识（可选，用于显示对应的 logo） */
  vendorKey?: 'zhipu' | 'moonshot' | 'minimax' | 'idealab' | 'deepseek' | 'doubao'
}

/**
 * 添加供应商配置的请求参数
 */
export interface AddVendorRequest {
  /** 供应商配置 */
  config: VendorConfig
  /** 是否立即生效 */
  applyImmediately: boolean
}
