/**
 * Claude Code 项目配置类型定义
 */

export interface McpServer {
  command?: string
  args?: string[]
  env?: Record<string, string>
  type?: string
  url?: string
}

export interface ClaudeProjectConfig {
  path: string
  allowedTools: string[]
  mcpContextUris: string[]
  mcpServers: Record<string, McpServer>
  enabledMcpjsonServers: string[]
  disabledMcpjsonServers: string[]
  hasTrustDialogAccepted: boolean
  projectOnboardingSeenCount: number
  hasClaudeMdExternalIncludesApproved: boolean
  hasClaudeMdExternalIncludesWarningShown: boolean
  lastTotalWebSearchRequests?: number
}

export interface ClaudeJson {
  projects: Record<string, Omit<ClaudeProjectConfig, 'path'>>
}

export interface UpdateProjectConfigRequest {
  path: string
  config: Partial<Omit<ClaudeProjectConfig, 'path'>>
}
