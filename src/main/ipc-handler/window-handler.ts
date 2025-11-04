import { ipcMain, BrowserWindow } from 'electron'
import { WINDOW_CHANNELS } from '@/shared/ipc-channels'

/**
 * 注册窗口控制相关的 IPC 事件处理器
 */
export function registerWindowHandler() {
  // 最小化窗口
  ipcMain.on(WINDOW_CHANNELS.MINIMIZE, () => {
    const window = BrowserWindow.getFocusedWindow()
    if (window) {
      window.minimize()
    }
  })

  // 最大化/还原窗口
  ipcMain.on(WINDOW_CHANNELS.MAXIMIZE, () => {
    const window = BrowserWindow.getFocusedWindow()
    if (window) {
      if (window.isMaximized()) {
        window.unmaximize()
      } else {
        window.maximize()
      }
    }
  })

  // 关闭窗口
  ipcMain.on(WINDOW_CHANNELS.CLOSE, () => {
    const window = BrowserWindow.getFocusedWindow()
    if (window) {
      window.close()
    }
  })
}
