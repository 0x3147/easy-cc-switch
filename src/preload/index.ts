import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { WINDOW_CHANNELS, VENDOR_CHANNELS } from '@/shared/ipc-channels'
import type { VendorConfig, AddVendorRequest } from '@/shared/types/vendor'

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
  activateVendor: (id: string) => ipcRenderer.invoke(VENDOR_CHANNELS.ACTIVATE_VENDOR, id)
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
