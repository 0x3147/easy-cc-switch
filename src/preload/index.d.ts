import { ElectronAPI } from '@electron-toolkit/preload'
import type { VendorConfig, AddVendorRequest } from '@/shared/types/vendor'
import type { PlatformInfo, ClaudeCodeCheckResult, HomebrewCheckResult } from '@/shared/types/tool'

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
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
