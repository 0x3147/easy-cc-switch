import { ipcMain } from 'electron'
import { SETTINGS_CHANNELS } from '@/shared/ipc-channels'
import { settingsStore } from '../store/settings-store'

/**
 * 注册用户设置相关的 IPC handlers
 */
export function registerSettingsHandlers() {
  // 获取主题模式
  ipcMain.handle(SETTINGS_CHANNELS.GET_THEME_MODE, () => {
    return settingsStore.getThemeMode()
  })

  // 设置主题模式
  ipcMain.handle(SETTINGS_CHANNELS.SET_THEME_MODE, (_, mode: 'light' | 'dark' | 'system') => {
    settingsStore.setThemeMode(mode)
    return true
  })

  // 获取语言设置
  ipcMain.handle(SETTINGS_CHANNELS.GET_LANGUAGE, () => {
    return settingsStore.getLanguage()
  })

  // 设置语言
  ipcMain.handle(SETTINGS_CHANNELS.SET_LANGUAGE, (_, language: string) => {
    settingsStore.setLanguage(language)
    return true
  })

  // 获取所有设置
  ipcMain.handle(SETTINGS_CHANNELS.GET_ALL_SETTINGS, () => {
    return settingsStore.getAllSettings()
  })
}
