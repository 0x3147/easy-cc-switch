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
}
