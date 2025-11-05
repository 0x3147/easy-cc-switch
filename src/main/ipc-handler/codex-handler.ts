import { ipcMain } from 'electron'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { homedir } from 'os'
import { existsSync } from 'fs'
import * as toml from 'toml'
import { CODEX_CHANNELS } from '@/shared/ipc-channels'
import type {
  CodexConfig,
  CodexAuth,
  CodexVendorConfig,
  AddCodexVendorRequest
} from '@/shared/types/codex'
import { codexVendorStore } from '../store/codex-store'

/**
 * 获取 Codex 配置目录路径
 */
function getCodexConfigDir(): string {
  return join(homedir(), '.codex')
}

/**
 * 获取 Codex config.toml 文件路径
 */
function getCodexConfigPath(): string {
  return join(getCodexConfigDir(), 'config.toml')
}

/**
 * 获取 Codex auth.json 文件路径
 */
function getCodexAuthPath(): string {
  return join(getCodexConfigDir(), 'auth.json')
}

/**
 * 将 CodexConfig 对象转换为 TOML 字符串
 */
function configToToml(config: CodexConfig): string {
  let tomlStr = `model_provider = "${config.model_provider}"\n`
  tomlStr += `model = "${config.model}"\n`
  tomlStr += `model_reasoning_effort = "${config.model_reasoning_effort}"\n`
  tomlStr += `disable_response_storage = ${config.disable_response_storage}\n\n`

  // 添加供应商配置
  for (const [key, provider] of Object.entries(config.model_providers)) {
    tomlStr += `[model_providers.${key}]\n`
    tomlStr += `name = "${provider.name}"\n`
    tomlStr += `base_url = "${provider.base_url}"\n`
    tomlStr += `wire_api = "${provider.wire_api}"\n`
    tomlStr += `requires_openai_auth = ${provider.requires_openai_auth}\n\n`
  }

  return tomlStr
}

/**
 * 读取 Codex 配置
 */
async function readCodexConfig(): Promise<CodexVendorConfig | null> {
  try {
    const configPath = getCodexConfigPath()
    const authPath = getCodexAuthPath()

    // 检查文件是否存在
    if (!existsSync(configPath) || !existsSync(authPath)) {
      return null
    }

    // 读取 config.toml
    const configContent = await readFile(configPath, 'utf-8')
    const config = toml.parse(configContent) as CodexConfig

    // 读取 auth.json
    const authContent = await readFile(authPath, 'utf-8')
    const auth: CodexAuth = JSON.parse(authContent)

    // 获取当前激活的供应商配置
    const providerKey = config.model_provider
    const provider = config.model_providers[providerKey]

    if (!provider) {
      return null
    }

    // 转换为 CodexVendorConfig 格式
    return {
      id: 'default',
      name: '默认配置',
      providerKey,
      baseUrl: provider.base_url,
      apiKey: auth.OPENAI_API_KEY || '',
      model: config.model,
      reasoningEffort: config.model_reasoning_effort,
      wireApi: provider.wire_api,
      isDefault: true
    }
  } catch (error) {
    console.error('读取 Codex 配置失败:', error)
    return null
  }
}

/**
 * 保存 Codex 配置
 */
async function saveCodexConfig(vendorConfig: CodexVendorConfig): Promise<boolean> {
  try {
    const configDir = getCodexConfigDir()
    const configPath = getCodexConfigPath()
    const authPath = getCodexAuthPath()

    // 确保目录存在
    if (!existsSync(configDir)) {
      await mkdir(configDir, { recursive: true })
    }

    // 读取现有配置或使用默认配置
    let config: CodexConfig = {
      model_provider: vendorConfig.providerKey,
      model: vendorConfig.model || 'gpt-5',
      model_reasoning_effort: vendorConfig.reasoningEffort || 'high',
      disable_response_storage: true,
      model_providers: {}
    }

    // 如果文件存在，读取现有配置
    if (existsSync(configPath)) {
      try {
        const content = await readFile(configPath, 'utf-8')
        const existingConfig = toml.parse(content) as CodexConfig
        config.model_providers = existingConfig.model_providers || {}
      } catch (error) {
        console.warn('读取现有 config.toml 失败，将使用默认配置:', error)
      }
    }

    // 更新或添加供应商配置
    config.model_provider = vendorConfig.providerKey
    config.model = vendorConfig.model || config.model
    config.model_reasoning_effort = vendorConfig.reasoningEffort || config.model_reasoning_effort

    config.model_providers[vendorConfig.providerKey] = {
      name: vendorConfig.providerKey,
      base_url: vendorConfig.baseUrl,
      wire_api: vendorConfig.wireApi || 'responses',
      requires_openai_auth: true
    }

    // 写入 config.toml
    const tomlContent = configToToml(config)
    await writeFile(configPath, tomlContent, 'utf-8')

    // 写入 auth.json
    const auth: CodexAuth = {
      OPENAI_API_KEY: vendorConfig.apiKey
    }
    await writeFile(authPath, JSON.stringify(auth, null, 2), 'utf-8')

    return true
  } catch (error) {
    console.error('保存 Codex 配置失败:', error)
    return false
  }
}

/**
 * 注册 Codex 供应商配置相关的 IPC 事件处理器
 */
export function registerCodexHandler() {
  // 读取 Codex 配置（默认配置）
  ipcMain.handle(CODEX_CHANNELS.GET_CODEX_CONFIG, async () => {
    return await readCodexConfig()
  })

  // 保存 Codex 配置
  ipcMain.handle(CODEX_CHANNELS.SAVE_CODEX_CONFIG, async (_, config: CodexVendorConfig) => {
    return await saveCodexConfig(config)
  })

  // 获取所有供应商配置
  ipcMain.handle(CODEX_CHANNELS.GET_ALL_CODEX_VENDORS, async () => {
    return codexVendorStore.getAllVendors()
  })

  // 添加供应商配置
  ipcMain.handle(CODEX_CHANNELS.ADD_CODEX_VENDOR, async (_, request: AddCodexVendorRequest) => {
    try {
      // 添加到 store
      codexVendorStore.addVendor(request.config)

      // 如果立即生效，保存到 Codex 配置
      if (request.applyImmediately) {
        const success = await saveCodexConfig(request.config)
        if (success) {
          codexVendorStore.setActiveVendorId(request.config.id)
        }
        return success
      }

      return true
    } catch (error) {
      console.error('添加 Codex 供应商配置失败:', error)
      return false
    }
  })

  // 删除供应商配置
  ipcMain.handle(CODEX_CHANNELS.DELETE_CODEX_VENDOR, async (_, id: string) => {
    return codexVendorStore.deleteVendor(id)
  })

  // 更新供应商配置
  ipcMain.handle(
    CODEX_CHANNELS.UPDATE_CODEX_VENDOR,
    async (_, id: string, updates: Partial<CodexVendorConfig>) => {
      return codexVendorStore.updateVendor(id, updates)
    }
  )

  // 激活供应商配置
  ipcMain.handle(CODEX_CHANNELS.ACTIVATE_CODEX_VENDOR, async (_, id: string) => {
    try {
      // 从 store 中获取供应商配置
      const vendors = codexVendorStore.getAllVendors()
      const vendor = vendors.find((v) => v.id === id)

      if (!vendor) {
        return false
      }

      // 将配置写入 ~/.codex/config.toml 和 auth.json
      const success = await saveCodexConfig(vendor)
      if (success) {
        codexVendorStore.setActiveVendorId(id)
      }
      return success
    } catch (error) {
      console.error('激活 Codex 供应商配置失败:', error)
      return false
    }
  })

  // 获取当前激活的供应商 ID
  ipcMain.handle(CODEX_CHANNELS.GET_ACTIVE_CODEX_VENDOR_ID, async () => {
    return codexVendorStore.getActiveVendorId()
  })
}
