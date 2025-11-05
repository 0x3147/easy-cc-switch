import { ElectronAPI } from '@electron-toolkit/preload'
import type { VendorConfig, AddVendorRequest } from '@/shared/types/vendor'
import type { PlatformInfo, ClaudeCodeCheckResult, HomebrewCheckResult } from '@/shared/types/tool'
import type { CodexVendorConfig, AddCodexVendorRequest } from '@/shared/types/codex'

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
  checkHomebrew: () => Promise<HomebrewCheckResult>
  getCodexConfig: () => Promise<CodexVendorConfig | null>
  saveCodexConfig: (config: CodexVendorConfig) => Promise<boolean>
  getAllCodexVendors: () => Promise<CodexVendorConfig[]>
  addCodexVendor: (request: AddCodexVendorRequest) => Promise<boolean>
  deleteCodexVendor: (id: string) => Promise<boolean>
  updateCodexVendor: (id: string, updates: Partial<CodexVendorConfig>) => Promise<boolean>
  activateCodexVendor: (id: string) => Promise<boolean>
  getActiveCodexVendorId: () => Promise<string | null>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
