import { ipcMain } from 'electron'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { homedir } from 'os'
import { existsSync } from 'fs'
import { VENDOR_CHANNELS } from '../../shared/ipc-channels'
import type { ClaudeSettings, VendorConfig } from '../../shared/types/vendor'

/**
 * 获取 Claude settings.json 文件路径
 */
function getClaudeSettingsPath(): string {
  return join(homedir(), '.claude', 'settings.json')
}

/**
 * 读取 Claude 配置
 */
async function readClaudeConfig(): Promise<VendorConfig | null> {
  try {
    const settingsPath = getClaudeSettingsPath()

    // 检查文件是否存在
    if (!existsSync(settingsPath)) {
      return null
    }

    // 读取文件内容
    const content = await readFile(settingsPath, 'utf-8')
    const settings: ClaudeSettings = JSON.parse(content)

    // 提取需要的配置
    return {
      token: settings.env.ANTHROPIC_AUTH_TOKEN || '',
      baseUrl: settings.env.ANTHROPIC_BASE_URL || '',
      apiTimeout: settings.env.API_TIMEOUT_MS,
      opusModel: settings.env.ANTHROPIC_DEFAULT_OPUS_MODEL,
      sonnetModel: settings.env.ANTHROPIC_DEFAULT_SONNET_MODEL,
      haikuModel: settings.env.ANTHROPIC_DEFAULT_HAIKU_MODEL
    }
  } catch (error) {
    console.error('读取 Claude 配置失败:', error)
    return null
  }
}

/**
 * 保存 Claude 配置
 */
async function saveClaudeConfig(config: VendorConfig): Promise<boolean> {
  try {
    const settingsPath = getClaudeSettingsPath()
    const claudeDir = join(homedir(), '.claude')

    // 确保目录存在
    if (!existsSync(claudeDir)) {
      await mkdir(claudeDir, { recursive: true })
    }

    // 读取现有配置（如果存在）
    let settings: ClaudeSettings = {
      env: {
        ANTHROPIC_AUTH_TOKEN: '',
        ANTHROPIC_BASE_URL: '',
        CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: 1
      }
    }

    if (existsSync(settingsPath)) {
      try {
        const content = await readFile(settingsPath, 'utf-8')
        settings = JSON.parse(content)
      } catch (error) {
        console.warn('读取现有配置失败，将使用默认配置:', error)
      }
    }

    // 更新配置
    settings.env.ANTHROPIC_AUTH_TOKEN = config.token
    settings.env.ANTHROPIC_BASE_URL = config.baseUrl

    // 更新可选配置
    if (config.apiTimeout !== undefined) {
      settings.env.API_TIMEOUT_MS = config.apiTimeout
    }
    if (config.opusModel !== undefined) {
      settings.env.ANTHROPIC_DEFAULT_OPUS_MODEL = config.opusModel
    }
    if (config.sonnetModel !== undefined) {
      settings.env.ANTHROPIC_DEFAULT_SONNET_MODEL = config.sonnetModel
    }
    if (config.haikuModel !== undefined) {
      settings.env.ANTHROPIC_DEFAULT_HAIKU_MODEL = config.haikuModel
    }

    // 写入文件
    await writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')

    return true
  } catch (error) {
    console.error('保存 Claude 配置失败:', error)
    return false
  }
}

/**
 * 注册供应商配置相关的 IPC 事件处理器
 */
export function registerVendorHandler() {
  // 读取 Claude 配置
  ipcMain.handle(VENDOR_CHANNELS.GET_CLAUDE_CONFIG, async () => {
    return await readClaudeConfig()
  })

  // 保存 Claude 配置
  ipcMain.handle(VENDOR_CHANNELS.SAVE_CLAUDE_CONFIG, async (_, config: VendorConfig) => {
    return await saveClaudeConfig(config)
  })
}
