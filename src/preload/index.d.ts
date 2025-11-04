import { ElectronAPI } from '@electron-toolkit/preload'
import type { VendorConfig } from '../shared/types/vendor'

interface API {
  windowMinimize: () => void
  windowMaximize: () => void
  windowClose: () => void
  getPlatform: () => string
  getClaudeConfig: () => Promise<VendorConfig | null>
  saveClaudeConfig: (config: VendorConfig) => Promise<boolean>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
