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
 * 检查 CLAUDE.md 文件是否存在
 * @returns 文件是否存在
 */
async function checkClaudeMdExists(): Promise<boolean> {
  try {
    const filePath = getClaudeMdPath()
    await fs.access(filePath)
    return true
  } catch (error) {
    return false
  }
}

/**
 * 创建 CLAUDE.md 文件（带默认内容）
 * @returns 是否创建成功
 */
async function createClaudeMd(): Promise<boolean> {
  try {
    const filePath = getClaudeMdPath()
    const dirPath = path.dirname(filePath)

    // 确保目录存在
    await fs.mkdir(dirPath, { recursive: true })

    // 默认模板内容
    const defaultContent = `# Claude 全局规则配置

这是 Claude Code 的全局规则文件，在此编写的规则将对所有项目生效。

## 使用说明

- 此文件位于：\`~/.claude/CLAUDE.md\`
- 支持 Markdown 格式编写
- 可以定义代码风格、命名规范、常用指令等全局规则

## 示例规则

### 代码规范
- 使用 TypeScript 编写代码
- 遵循 ESLint 规则
- 优先使用函数式编程

### 响应风格
- 提供简洁明了的回答
- 代码注释使用中文
`

    // 写入默认内容
    await fs.writeFile(filePath, defaultContent, 'utf-8')
    return true
  } catch (error) {
    console.error('创建 CLAUDE.md 文件失败:', error)
    return false
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

  // 检查 CLAUDE.md 是否存在
  ipcMain.handle(MARKDOWN_CHANNELS.CHECK_CLAUDE_MD_EXISTS, async () => {
    return await checkClaudeMdExists()
  })

  // 创建 CLAUDE.md
  ipcMain.handle(MARKDOWN_CHANNELS.CREATE_CLAUDE_MD, async () => {
    return await createClaudeMd()
  })
}
