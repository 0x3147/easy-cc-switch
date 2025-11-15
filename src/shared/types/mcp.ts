/**
 * MCP 服务器配置类型定义
 */

/**
 * MCP 服务器类型
 */
export type McpServerType = 'stdio' | 'http' | 'sse'

/**
 * stdio 类型的 MCP 服务器配置
 */
export interface StdioMcpServer {
  type: 'stdio'
  command: string
  args?: string[]
  env?: Record<string, string>
}

/**
 * HTTP 类型的 MCP 服务器配置
 */
export interface HttpMcpServer {
  type: 'http'
  url: string
  headers?: Record<string, string>
}

/**
 * SSE 类型的 MCP 服务器配置
 */
export interface SseMcpServer {
  type: 'sse'
  url: string
  headers?: Record<string, string>
}

/**
 * MCP 服务器配置联合类型
 */
export type McpServerConfig = StdioMcpServer | HttpMcpServer | SseMcpServer

/**
 * MCP 服务器配置集合（键为服务器名称）
 */
export interface McpServers {
  [serverName: string]: McpServerConfig
}

/**
 * 全局 MCP 配置（从 .claude.json 读取）
 */
export interface GlobalMcpConfig {
  mcpServers: McpServers
}

/**
 * MCP 服务器配置项（用于 UI 展示）
 */
export interface McpServerItem {
  /** 服务器名称（唯一标识） */
  name: string
  /** 服务器类型 */
  type: McpServerType
  /** 服务器配置 */
  config: McpServerConfig
}

/**
 * MCP 市场项目
 */
export interface McpMarketplaceItem {
  /** 唯一标识 */
  id: string
  /** MCP 名称 */
  name: string
  /** 作者 */
  author: string
  /** 简短描述 */
  description: string
  /** 详细描述 */
  longDescription?: string
  /** 图标 URL 或图标名称 */
  icon?: string
  /** 类别标签 */
  tags: string[]
  /** GitHub 仓库 URL */
  repository?: string
  /** 官方网站 */
  website?: string
  /** NPM 包名 */
  npmPackage?: string
  /** 安装数量 */
  installs?: number
  /** 星标数 */
  stars?: number
  /** 服务器类型 */
  serverType: McpServerType
  /** 预设配置模板 */
  configTemplate: McpServerConfig
}
