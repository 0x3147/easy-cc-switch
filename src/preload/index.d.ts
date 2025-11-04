import { ElectronAPI } from '@electron-toolkit/preload'

interface API {
  windowMinimize: () => void
  windowMaximize: () => void
  windowClose: () => void
  getPlatform: () => string
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
