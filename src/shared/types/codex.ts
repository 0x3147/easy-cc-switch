/**
 * Codex 供应商配置类型定义
 */

/**
 * Codex config.toml 配置结构
 */
export interface CodexConfig {
  /** 模型供应商名称 */
  model_provider: string
  /** 模型名称 (gpt-5 或 gpt-5-codex) */
  model: string
  /** 模型推理努力程度 (high, medium, low, minimal) */
  model_reasoning_effort: string
  /** 是否禁用响应存储 */
  disable_response_storage: boolean
  /** 供应商配置 */
  model_providers: {
    [key: string]: CodexProviderConfig
  }
}

/**
 * Codex 供应商配置
 */
export interface CodexProviderConfig {
  /** 供应商名称 */
  name: string
  /** API Base URL */
  base_url: string
  /** Wire API 类型 */
  wire_api: string
  /** 是否需要 OpenAI 认证 */
  requires_openai_auth: boolean
}

/**
 * Codex auth.json 配置结构
 */
export interface CodexAuth {
  /** OpenAI API Key */
  OPENAI_API_KEY: string
}

/**
 * Codex 供应商配置表单数据
 */
export interface CodexVendorConfig {
  /** 供应商 ID */
  id: string
  /** 供应商名称（用户自定义） */
  name: string
  /** 供应商在 config.toml 中的标识符 (例如: fox, huiyan) */
  providerKey: string
  /** API Base URL */
  baseUrl: string
  /** API Key */
  apiKey: string
  /** 模型名称 (gpt-5 或 gpt-5-codex) */
  model?: string
  /** 模型推理努力程度 (high, medium, low, minimal) */
  reasoningEffort?: string
  /** Wire API 类型 */
  wireApi?: string
  /** 是否为默认配置（从 ~/.codex 读取） */
  isDefault?: boolean
}

/**
 * 添加 Codex 供应商配置的请求参数
 */
export interface AddCodexVendorRequest {
  /** 供应商配置 */
  config: CodexVendorConfig
  /** 是否立即生效 */
  applyImmediately: boolean
}
