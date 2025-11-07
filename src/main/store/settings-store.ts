import Store from 'electron-store'

/**
 * 用户设置 Store 数据结构
 */
interface SettingsSchema {
  /** 主题模式 */
  themeMode: 'light' | 'dark' | 'system'
  /** 语言设置 */
  language: string
}

/**
 * 用户设置 Store
 */
class SettingsStore {
  private store: Store<SettingsSchema>

  constructor() {
    this.store = new Store<SettingsSchema>({
      name: 'user-settings',
      defaults: {
        themeMode: 'system',
        language: 'zh'
      }
    })
  }

  /**
   * 获取主题模式
   */
  getThemeMode(): 'light' | 'dark' | 'system' {
    return this.store.get('themeMode', 'system')
  }

  /**
   * 设置主题模式
   */
  setThemeMode(mode: 'light' | 'dark' | 'system'): void {
    this.store.set('themeMode', mode)
  }

  /**
   * 获取语言设置
   */
  getLanguage(): string {
    return this.store.get('language', 'zh')
  }

  /**
   * 设置语言
   */
  setLanguage(language: string): void {
    this.store.set('language', language)
  }

  /**
   * 获取所有设置
   */
  getAllSettings(): SettingsSchema {
    return {
      themeMode: this.getThemeMode(),
      language: this.getLanguage()
    }
  }
}

// 导出单例
export const settingsStore = new SettingsStore()
