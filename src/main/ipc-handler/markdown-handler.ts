import { ipcMain } from 'electron'
import { MARKDOWN_CHANNELS } from '../../shared/ipc-channels'
import * as fs from 'fs/promises'
import * as path from 'path'
import { homedir } from 'os'

/**
 * 获取 CLAUDE.md 文件路径
 */
function getClaudeMdPath(): string {
  return path.join(homedir(), '.claude', 'CLAUDE.md')
}

/**
 * 读取 CLAUDE.md 文件内容
 * @returns Markdown 文件内容，如果文件不存在返回空字符串
 */
async function getClaudeMd(): Promise<string> {
  try {
    const filePath = getClaudeMdPath()
    const content = await fs.readFile(filePath, 'utf-8')
    return content
  } catch (error) {
    console.warn('读取 CLAUDE.md 文件失败:', error)
    // 如果文件不存在，返回空字符串
    return ''
  }
}

/**
 * 保存 CLAUDE.md 文件内容
 * @param content Markdown 文件内容
 * @returns 是否保存成功
 */
async function saveClaudeMd(content: string): Promise<boolean> {
  try {
    const filePath = getClaudeMdPath()
    const dirPath = path.dirname(filePath)

    // 确保目录存在
    await fs.mkdir(dirPath, { recursive: true })

    // 写入文件
    await fs.writeFile(filePath, content, 'utf-8')
    return true
  } catch (error) {
    console.error('保存 CLAUDE.md 文件失败:', error)
    return false
  }
}

/**
 * 注册 Markdown 相关的 IPC 处理器
 */
export function registerMarkdownHandlers(): void {
  // 读取 CLAUDE.md
  ipcMain.handle(MARKDOWN_CHANNELS.GET_CLAUDE_MD, async () => {
    return await getClaudeMd()
  })

  // 保存 CLAUDE.md
  ipcMain.handle(MARKDOWN_CHANNELS.SAVE_CLAUDE_MD, async (_, content: string) => {
    return await saveClaudeMd(content)
  })
}
