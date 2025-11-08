import { ElectronAPI } from '@electron-toolkit/preload'
import type { VendorConfig, AddVendorRequest } from '@/shared/types/vendor'
import type {
  PlatformInfo,
  ClaudeCodeCheckResult,
  CodexCheckResult,
  NodeCheckResult,
  NvmCheckResult,
  HomebrewCheckResult,
  InstallResult
} from '@/shared/types/tool'
import type { CodexVendorConfig, AddCodexVendorRequest } from '@/shared/types/codex'
import type { ClaudeProjectConfig, UpdateProjectConfigRequest } from '@/shared/types/claude-project'
import type { McpServerItem, McpServerConfig } from '@/shared/types/mcp'

interface API {
  windowMinimize: () => void
  windowMaximize: () => void
  windowClose: () => void
  getPlatform: () => string
  getClaudeConfig: () => Promise<VendorConfig | null>
  saveClaudeConfig: (config: VendorConfig) => Promise<boolean>
  getAllVendors: () => Promise<VendorConfig[]>
  addVendor: (request: AddVendorRequest) => Promise<boolean>
  deleteVendor: (id: string) => Promise<boolean>
  updateVendor: (id: string, updates: Partial<VendorConfig>) => Promise<boolean>
  activateVendor: (id: string) => Promise<boolean>
  getActiveVendorId: () => Promise<string | null>
  getPlatformInfo: () => Promise<PlatformInfo>
  checkClaudeCode: () => Promise<ClaudeCodeCheckResult>
  checkClaudeCodeCached: () => Promise<ClaudeCodeCheckResult>
  uninstallClaudeCode: () => Promise<{ success: boolean; message: string }>
  installClaudeCodeNpm: () => Promise<InstallResult>
  installClaudeCodeHomebrew: () => Promise<InstallResult>
  installClaudeCodeCurl: () => Promise<InstallResult>
  installClaudeCodePowershell: () => Promise<InstallResult>
  installClaudeCodeCmd: () => Promise<InstallResult>
  checkCodex: () => Promise<CodexCheckResult>
  checkCodexCached: () => Promise<CodexCheckResult>
  uninstallCodex: () => Promise<{ success: boolean; message: string }>
  checkNodejs: () => Promise<NodeCheckResult>
  checkNvm: () => Promise<NvmCheckResult>
  checkHomebrew: () => Promise<HomebrewCheckResult>
  checkClaudeCodeRunning: () => Promise<boolean>
  killClaudeCode: () => Promise<boolean>
  checkCodexRunning: () => Promise<boolean>
  killCodex: () => Promise<boolean>
  installCodexNpm: () => Promise<InstallResult>
  installCodexHomebrew: () => Promise<InstallResult>
  installHomebrew: () => Promise<InstallResult>
  installNvm: () => Promise<InstallResult>
  refreshToolCache: () => Promise<void>
  getCodexConfig: () => Promise<CodexVendorConfig | null>
  saveCodexConfig: (config: CodexVendorConfig) => Promise<boolean>
  getAllCodexVendors: () => Promise<CodexVendorConfig[]>
  addCodexVendor: (request: AddCodexVendorRequest) => Promise<boolean>
  deleteCodexVendor: (id: string) => Promise<boolean>
  updateCodexVendor: (id: string, updates: Partial<CodexVendorConfig>) => Promise<boolean>
  activateCodexVendor: (id: string) => Promise<boolean>
  getActiveCodexVendorId: () => Promise<string | null>
  getThemeMode: () => Promise<'light' | 'dark' | 'system'>
  setThemeMode: (mode: 'light' | 'dark' | 'system') => Promise<boolean>
  getLanguage: () => Promise<string>
  setLanguage: (language: string) => Promise<boolean>
  getAllSettings: () => Promise<{ themeMode: 'light' | 'dark' | 'system'; language: string }>
  getClaudeMd: () => Promise<string>
  saveClaudeMd: (content: string) => Promise<boolean>
  checkClaudeMdExists: () => Promise<boolean>
  createClaudeMd: () => Promise<boolean>
  getAllProjects: () => Promise<ClaudeProjectConfig[]>
  updateProject: (request: UpdateProjectConfigRequest) => Promise<void>
  deleteProject: (path: string) => Promise<void>
  getAllMcpServers: () => Promise<McpServerItem[]>
  addMcpServer: (name: string, config: McpServerConfig) => Promise<boolean>
  updateMcpServer: (oldName: string, newName: string, config: McpServerConfig) => Promise<boolean>
  deleteMcpServer: (name: string) => Promise<boolean>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
