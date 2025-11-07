import { ipcMain } from 'electron'
import { homedir } from 'os'
import { join } from 'path'
import { readFile, writeFile } from 'fs/promises'
import { MCP_CHANNELS } from '../../shared/ipc-channels'
import type { McpServerItem, McpServerConfig, McpServers } from '../../shared/types/mcp'

const CLAUDE_JSON_PATH = join(homedir(), '.claude.json')

/**
 * 读取 .claude.json 文件
 */
async function readClaudeJson(): Promise<any> {
  try {
    const content = await readFile(CLAUDE_JSON_PATH, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.error('读取 .claude.json 失败:', error)
    return {}
  }
}

/**
 * 写入 .claude.json 文件
 */
async function writeClaudeJson(data: any): Promise<void> {
  try {
    await writeFile(CLAUDE_JSON_PATH, JSON.stringify(data, null, 2), 'utf-8')
  } catch (error) {
    console.error('写入 .claude.json 失败:', error)
    throw error
  }
}

/**
 * 获取所有 MCP 服务器配置
 */
async function getAllMcpServers(): Promise<McpServerItem[]> {
  const data = await readClaudeJson()
  const mcpServers: McpServers = data.mcpServers || {}

  return Object.entries(mcpServers).map(([name, config]) => ({
    name,
    type: config.type,
    config
  }))
}

/**
 * 添加 MCP 服务器配置
 */
async function addMcpServer(name: string, config: McpServerConfig): Promise<boolean> {
  try {
    const data = await readClaudeJson()

    // 检查服务器名称是否已存在
    if (data.mcpServers && data.mcpServers[name]) {
      console.error(`MCP 服务器 "${name}" 已存在`)
      return false
    }

    // 初始化 mcpServers 对象（如果不存在）
    if (!data.mcpServers) {
      data.mcpServers = {}
    }

    // 添加新的服务器配置
    data.mcpServers[name] = config

    await writeClaudeJson(data)
    return true
  } catch (error) {
    console.error('添加 MCP 服务器失败:', error)
    return false
  }
}

/**
 * 更新 MCP 服务器配置
 */
async function updateMcpServer(
  oldName: string,
  newName: string,
  config: McpServerConfig
): Promise<boolean> {
  try {
    const data = await readClaudeJson()

    if (!data.mcpServers || !data.mcpServers[oldName]) {
      console.error(`MCP 服务器 "${oldName}" 不存在`)
      return false
    }

    // 如果名称改变了，需要删除旧的并添加新的
    if (oldName !== newName) {
      // 检查新名称是否已存在
      if (data.mcpServers[newName]) {
        console.error(`MCP 服务器 "${newName}" 已存在`)
        return false
      }

      delete data.mcpServers[oldName]
      data.mcpServers[newName] = config
    } else {
      // 名称未改变，直接更新配置
      data.mcpServers[oldName] = config
    }

    await writeClaudeJson(data)
    return true
  } catch (error) {
    console.error('更新 MCP 服务器失败:', error)
    return false
  }
}

/**
 * 删除 MCP 服务器配置
 */
async function deleteMcpServer(name: string): Promise<boolean> {
  try {
    const data = await readClaudeJson()

    if (!data.mcpServers || !data.mcpServers[name]) {
      console.error(`MCP 服务器 "${name}" 不存在`)
      return false
    }

    delete data.mcpServers[name]

    await writeClaudeJson(data)
    return true
  } catch (error) {
    console.error('删除 MCP 服务器失败:', error)
    return false
  }
}

/**
 * 注册 MCP 配置相关的 IPC 处理器
 */
export function registerMcpHandlers(): void {
  // 获取所有 MCP 服务器配置
  ipcMain.handle(MCP_CHANNELS.GET_ALL_MCP_SERVERS, async (): Promise<McpServerItem[]> => {
    return await getAllMcpServers()
  })

  // 添加 MCP 服务器配置
  ipcMain.handle(
    MCP_CHANNELS.ADD_MCP_SERVER,
    async (_, name: string, config: McpServerConfig): Promise<boolean> => {
      return await addMcpServer(name, config)
    }
  )

  // 更新 MCP 服务器配置
  ipcMain.handle(
    MCP_CHANNELS.UPDATE_MCP_SERVER,
    async (_, oldName: string, newName: string, config: McpServerConfig): Promise<boolean> => {
      return await updateMcpServer(oldName, newName, config)
    }
  )

  // 删除 MCP 服务器配置
  ipcMain.handle(MCP_CHANNELS.DELETE_MCP_SERVER, async (_, name: string): Promise<boolean> => {
    return await deleteMcpServer(name)
  })
}
