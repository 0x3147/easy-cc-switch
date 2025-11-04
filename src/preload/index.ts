import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { WINDOW_CHANNELS } from '../shared/ipc-channels'

// Custom APIs for renderer
const api = {
  // 窗口控制
  windowMinimize: () => ipcRenderer.send(WINDOW_CHANNELS.MINIMIZE),
  windowMaximize: () => ipcRenderer.send(WINDOW_CHANNELS.MAXIMIZE),
  windowClose: () => ipcRenderer.send(WINDOW_CHANNELS.CLOSE),
  // 获取平台
  getPlatform: () => process.platform
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
