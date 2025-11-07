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
