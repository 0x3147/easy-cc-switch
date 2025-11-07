import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  WINDOW_CHANNELS,
  VENDOR_CHANNELS,
  TOOL_CHANNELS,
  CODEX_CHANNELS
} from '@/shared/ipc-channels'
import type { VendorConfig, AddVendorRequest } from '@/shared/types/vendor'
import type {
  PlatformInfo,
  ClaudeCodeCheckResult,
  CodexCheckResult,
  NodeCheckResult,
  NvmCheckResult,
  HomebrewCheckResult
} from '@/shared/types/tool'
import type { CodexVendorConfig, AddCodexVendorRequest } from '@/shared/types/codex'

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
  checkCodex: (): Promise<CodexCheckResult> => ipcRenderer.invoke(TOOL_CHANNELS.CHECK_CODEX),
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
  getActiveCodexVendorId: () => ipcRenderer.invoke(CODEX_CHANNELS.GET_ACTIVE_CODEX_VENDOR_ID)
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
