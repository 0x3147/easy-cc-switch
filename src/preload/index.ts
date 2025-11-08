import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  WINDOW_CHANNELS,
  VENDOR_CHANNELS,
  TOOL_CHANNELS,
  CODEX_CHANNELS,
  SETTINGS_CHANNELS,
  MARKDOWN_CHANNELS,
  CLAUDE_PROJECT_CHANNELS,
  MCP_CHANNELS
} from '@/shared/ipc-channels'
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

// Custom APIs for renderer
const api = {
  // 窗口控制
  windowMinimize: () => ipcRenderer.send(WINDOW_CHANNELS.MINIMIZE),
  windowMaximize: () => ipcRenderer.send(WINDOW_CHANNELS.MAXIMIZE),
  windowClose: () => ipcRenderer.send(WINDOW_CHANNELS.CLOSE),
  // 获取平台
  getPlatform: () => process.platform,
  // 供应商配置
  getClaudeConfig: () => ipcRenderer.invoke(VENDOR_CHANNELS.GET_CLAUDE_CONFIG),
  saveClaudeConfig: (config: VendorConfig) =>
    ipcRenderer.invoke(VENDOR_CHANNELS.SAVE_CLAUDE_CONFIG, config),
  getAllVendors: () => ipcRenderer.invoke(VENDOR_CHANNELS.GET_ALL_VENDORS),
  addVendor: (request: AddVendorRequest) => ipcRenderer.invoke(VENDOR_CHANNELS.ADD_VENDOR, request),
  deleteVendor: (id: string) => ipcRenderer.invoke(VENDOR_CHANNELS.DELETE_VENDOR, id),
  updateVendor: (id: string, updates: Partial<VendorConfig>) =>
    ipcRenderer.invoke(VENDOR_CHANNELS.UPDATE_VENDOR, id, updates),
  activateVendor: (id: string) => ipcRenderer.invoke(VENDOR_CHANNELS.ACTIVATE_VENDOR, id),
  getActiveVendorId: () => ipcRenderer.invoke(VENDOR_CHANNELS.GET_ACTIVE_VENDOR_ID),
  // 工具安装
  getPlatformInfo: (): Promise<PlatformInfo> => ipcRenderer.invoke(TOOL_CHANNELS.GET_PLATFORM_INFO),
  checkClaudeCode: (): Promise<ClaudeCodeCheckResult> =>
    ipcRenderer.invoke(TOOL_CHANNELS.CHECK_CLAUDE_CODE),
  checkClaudeCodeCached: (): Promise<ClaudeCodeCheckResult> =>
    ipcRenderer.invoke(TOOL_CHANNELS.CHECK_CLAUDE_CODE_CACHED),
  uninstallClaudeCode: (): Promise<{ success: boolean; message: string }> =>
    ipcRenderer.invoke(TOOL_CHANNELS.UNINSTALL_CLAUDE_CODE),
  installClaudeCodeNpm: (): Promise<InstallResult> =>
    ipcRenderer.invoke(TOOL_CHANNELS.INSTALL_CLAUDE_CODE_NPM),
  installClaudeCodeHomebrew: (): Promise<InstallResult> =>
    ipcRenderer.invoke(TOOL_CHANNELS.INSTALL_CLAUDE_CODE_HOMEBREW),
  installClaudeCodeCurl: (): Promise<InstallResult> =>
    ipcRenderer.invoke(TOOL_CHANNELS.INSTALL_CLAUDE_CODE_CURL),
  installClaudeCodePowershell: (): Promise<InstallResult> =>
    ipcRenderer.invoke(TOOL_CHANNELS.INSTALL_CLAUDE_CODE_POWERSHELL),
  installClaudeCodeCmd: (): Promise<InstallResult> =>
    ipcRenderer.invoke(TOOL_CHANNELS.INSTALL_CLAUDE_CODE_CMD),
  checkCodex: (): Promise<CodexCheckResult> => ipcRenderer.invoke(TOOL_CHANNELS.CHECK_CODEX),
  checkCodexCached: (): Promise<CodexCheckResult> =>
    ipcRenderer.invoke(TOOL_CHANNELS.CHECK_CODEX_CACHED),
  uninstallCodex: (): Promise<{ success: boolean; message: string }> =>
    ipcRenderer.invoke(TOOL_CHANNELS.UNINSTALL_CODEX),
  checkNodejs: (): Promise<NodeCheckResult> => ipcRenderer.invoke(TOOL_CHANNELS.CHECK_NODEJS),
  checkNvm: (): Promise<NvmCheckResult> => ipcRenderer.invoke(TOOL_CHANNELS.CHECK_NVM),
  checkHomebrew: (): Promise<HomebrewCheckResult> =>
    ipcRenderer.invoke(TOOL_CHANNELS.CHECK_HOMEBREW),
  checkClaudeCodeRunning: (): Promise<boolean> =>
    ipcRenderer.invoke(TOOL_CHANNELS.CHECK_CLAUDE_CODE_RUNNING),
  killClaudeCode: (): Promise<boolean> => ipcRenderer.invoke(TOOL_CHANNELS.KILL_CLAUDE_CODE),
  checkCodexRunning: (): Promise<boolean> => ipcRenderer.invoke(TOOL_CHANNELS.CHECK_CODEX_RUNNING),
  killCodex: (): Promise<boolean> => ipcRenderer.invoke(TOOL_CHANNELS.KILL_CODEX),
  installCodexNpm: (): Promise<InstallResult> =>
    ipcRenderer.invoke(TOOL_CHANNELS.INSTALL_CODEX_NPM),
  installCodexHomebrew: (): Promise<InstallResult> =>
    ipcRenderer.invoke(TOOL_CHANNELS.INSTALL_CODEX_HOMEBREW),
  installHomebrew: (): Promise<InstallResult> => ipcRenderer.invoke(TOOL_CHANNELS.INSTALL_HOMEBREW),
  installNvm: (): Promise<InstallResult> => ipcRenderer.invoke(TOOL_CHANNELS.INSTALL_NVM),
  refreshToolCache: (): Promise<void> => ipcRenderer.invoke(TOOL_CHANNELS.REFRESH_TOOL_CACHE),
  // Codex 供应商配置
  getCodexConfig: () => ipcRenderer.invoke(CODEX_CHANNELS.GET_CODEX_CONFIG),
  saveCodexConfig: (config: CodexVendorConfig) =>
    ipcRenderer.invoke(CODEX_CHANNELS.SAVE_CODEX_CONFIG, config),
  getAllCodexVendors: () => ipcRenderer.invoke(CODEX_CHANNELS.GET_ALL_CODEX_VENDORS),
  addCodexVendor: (request: AddCodexVendorRequest) =>
    ipcRenderer.invoke(CODEX_CHANNELS.ADD_CODEX_VENDOR, request),
  deleteCodexVendor: (id: string) => ipcRenderer.invoke(CODEX_CHANNELS.DELETE_CODEX_VENDOR, id),
  updateCodexVendor: (id: string, updates: Partial<CodexVendorConfig>) =>
    ipcRenderer.invoke(CODEX_CHANNELS.UPDATE_CODEX_VENDOR, id, updates),
  activateCodexVendor: (id: string) => ipcRenderer.invoke(CODEX_CHANNELS.ACTIVATE_CODEX_VENDOR, id),
  getActiveCodexVendorId: () => ipcRenderer.invoke(CODEX_CHANNELS.GET_ACTIVE_CODEX_VENDOR_ID),
  // 用户设置
  getThemeMode: (): Promise<'light' | 'dark' | 'system'> =>
    ipcRenderer.invoke(SETTINGS_CHANNELS.GET_THEME_MODE),
  setThemeMode: (mode: 'light' | 'dark' | 'system'): Promise<boolean> =>
    ipcRenderer.invoke(SETTINGS_CHANNELS.SET_THEME_MODE, mode),
  getLanguage: (): Promise<string> => ipcRenderer.invoke(SETTINGS_CHANNELS.GET_LANGUAGE),
  setLanguage: (language: string): Promise<boolean> =>
    ipcRenderer.invoke(SETTINGS_CHANNELS.SET_LANGUAGE, language),
  getAllSettings: (): Promise<{ themeMode: 'light' | 'dark' | 'system'; language: string }> =>
    ipcRenderer.invoke(SETTINGS_CHANNELS.GET_ALL_SETTINGS),
  // Markdown 编辑器
  getClaudeMd: (): Promise<string> => ipcRenderer.invoke(MARKDOWN_CHANNELS.GET_CLAUDE_MD),
  saveClaudeMd: (content: string): Promise<boolean> =>
    ipcRenderer.invoke(MARKDOWN_CHANNELS.SAVE_CLAUDE_MD, content),
  checkClaudeMdExists: (): Promise<boolean> =>
    ipcRenderer.invoke(MARKDOWN_CHANNELS.CHECK_CLAUDE_MD_EXISTS),
  createClaudeMd: (): Promise<boolean> => ipcRenderer.invoke(MARKDOWN_CHANNELS.CREATE_CLAUDE_MD),
  // Claude 项目配置
  getAllProjects: (): Promise<ClaudeProjectConfig[]> =>
    ipcRenderer.invoke(CLAUDE_PROJECT_CHANNELS.GET_ALL_PROJECTS),
  updateProject: (request: UpdateProjectConfigRequest): Promise<void> =>
    ipcRenderer.invoke(CLAUDE_PROJECT_CHANNELS.UPDATE_PROJECT, request),
  deleteProject: (path: string): Promise<void> =>
    ipcRenderer.invoke(CLAUDE_PROJECT_CHANNELS.DELETE_PROJECT, path),
  // 全局 MCP 配置
  getAllMcpServers: (): Promise<McpServerItem[]> =>
    ipcRenderer.invoke(MCP_CHANNELS.GET_ALL_MCP_SERVERS),
  addMcpServer: (name: string, config: McpServerConfig): Promise<boolean> =>
    ipcRenderer.invoke(MCP_CHANNELS.ADD_MCP_SERVER, name, config),
  updateMcpServer: (oldName: string, newName: string, config: McpServerConfig): Promise<boolean> =>
    ipcRenderer.invoke(MCP_CHANNELS.UPDATE_MCP_SERVER, oldName, newName, config),
  deleteMcpServer: (name: string): Promise<boolean> =>
    ipcRenderer.invoke(MCP_CHANNELS.DELETE_MCP_SERVER, name)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
