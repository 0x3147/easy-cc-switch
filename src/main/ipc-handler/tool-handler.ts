import { ipcMain } from 'electron'
import { execSync, spawn } from 'child_process'
import { join } from 'path'
import * as os from 'os'
import { TOOL_CHANNELS } from '@/shared/ipc-channels'
import type {
  PlatformInfo,
  ClaudeCodeCheckResult,
  CodexCheckResult,
  NodeCheckResult,
  NvmCheckResult,
  HomebrewCheckResult,
  InstallResult
} from '@/shared/types/tool'
import { toolCacheStore } from '../store/tool-cache-store'

/**
 * 快速验证 Claude Code 是否存在（仅检测命令是否可用）
 */
async function quickCheckClaudeCode(): Promise<boolean> {
  try {
    const platform = process.platform
    const command = platform === 'win32' ? 'where claude' : 'which claude'
    execSync(command, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
      timeout: 3000
    })
    return true
  } catch {
    return false
  }
}

/**
 * 快速验证 Codex 是否存在（仅检测命令是否可用）
 */
async function quickCheckCodex(): Promise<boolean> {
  try {
    const platform = process.platform
    const command = platform === 'win32' ? 'where codex' : 'which codex'
    execSync(command, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
      timeout: 3000
    })
    return true
  } catch {
    return false
  }
}

/**
 * 执行完整的 Claude Code 检测（包含版本号等详细信息）
 */
async function fullCheckClaudeCode(): Promise<ClaudeCodeCheckResult> {
  try {
    const platform = process.platform

    // 优先检测是否通过 npm 安装
    try {
      const npmList = execSync('npm list -g @anthropic-ai/claude-code --depth=0', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore'],
        timeout: 5000
      })

      // 如果 npm list 成功，说明通过 npm 安装
      if (npmList && !npmList.includes('(empty)')) {
        // 获取 npm 全局包路径
        const npmRoot = execSync('npm root -g', {
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'ignore'],
          timeout: 5000
        }).trim()

        const npmPath = join(npmRoot, '@anthropic-ai', 'claude-code')

        // 尝试获取版本号
        try {
          const versionOutput = execSync('claude --version', {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'ignore'],
            timeout: 5000
          })
          const version = versionOutput.trim()

          return {
            installed: true,
            path: npmPath,
            version,
            installMethod: 'npm'
          }
        } catch {
          // 无法获取版本，但已安装
          return {
            installed: true,
            path: npmPath,
            installMethod: 'npm'
          }
        }
      }
    } catch {
      // npm 检测失败，继续检测其他安装方式
    }

    // 检查 claude 命令是否可用（非 npm 安装方式）
    let command: string
    if (platform === 'win32') {
      command = 'where claude'
    } else {
      command = 'which claude'
    }

    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
      timeout: 5000
    })
    const path = output.trim().split('\n')[0]

    if (path) {
      // 判断安装方式
      let installMethod: 'homebrew' | 'script' | 'unknown' = 'unknown'

      // macOS: 检查是否通过 Homebrew 安装
      if (platform === 'darwin') {
        if (path.includes('/opt/homebrew/') || path.includes('/usr/local/Cellar/')) {
          installMethod = 'homebrew'
        } else if (path.includes('/usr/local/bin/') || path.includes('/.local/bin/')) {
          // 通过脚本安装通常在这些目录
          installMethod = 'script'
        }
      } else if (platform === 'win32') {
        // Windows: 通过脚本安装通常在 AppData 或 Program Files
        if (path.includes('AppData') || path.includes('Program Files')) {
          installMethod = 'script'
        }
      }

      // 尝试获取版本号
      try {
        const versionOutput = execSync('claude --version', {
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'ignore'],
          timeout: 5000
        })
        const version = versionOutput.trim()

        return {
          installed: true,
          path,
          version,
          installMethod
        }
      } catch {
        return {
          installed: true,
          path,
          installMethod
        }
      }
    }

    return { installed: false }
  } catch {
    return { installed: false }
  }
}

/**
 * 执行完整的 Codex 检测（包含版本号等详细信息）
 */
async function fullCheckCodex(): Promise<CodexCheckResult> {
  try {
    const platform = process.platform

    // 优先检测是否通过 npm 安装
    try {
      const npmList = execSync('npm list -g @openai/codex --depth=0', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore'],
        timeout: 5000
      })

      // 如果 npm list 成功，说明通过 npm 安装
      if (npmList && !npmList.includes('(empty)')) {
        // 获取 npm 全局包路径
        const npmRoot = execSync('npm root -g', {
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'ignore'],
          timeout: 5000
        }).trim()

        const npmPath = join(npmRoot, '@openai', 'codex')

        // 尝试获取版本号
        try {
          const versionOutput = execSync('codex --version', {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'ignore'],
            timeout: 5000
          })
          const version = versionOutput.trim()

          return {
            installed: true,
            path: npmPath,
            version,
            installMethod: 'npm'
          }
        } catch {
          // 无法获取版本，但已安装
          return {
            installed: true,
            path: npmPath,
            installMethod: 'npm'
          }
        }
      }
    } catch {
      // npm 检测失败，继续检测其他安装方式
    }

    // 检查 codex 命令是否可用（非 npm 安装方式）
    let command: string
    if (platform === 'win32') {
      command = 'where codex'
    } else {
      command = 'which codex'
    }

    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
      timeout: 5000
    })
    const path = output.trim().split('\n')[0]

    if (path) {
      // 判断安装方式
      let installMethod: 'homebrew' | 'unknown' = 'unknown'

      // macOS: 检查是否通过 Homebrew 安装
      if (platform === 'darwin') {
        if (path.includes('/opt/homebrew/') || path.includes('/usr/local/Cellar/')) {
          installMethod = 'homebrew'
        }
      }

      // 尝试获取版本号
      try {
        const versionOutput = execSync('codex --version', {
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'ignore'],
          timeout: 5000
        })
        const version = versionOutput.trim()

        return {
          installed: true,
          path,
          version,
          installMethod
        }
      } catch {
        return {
          installed: true,
          path,
          installMethod
        }
      }
    }

    return { installed: false }
  } catch {
    return { installed: false }
  }
}

/**
 * 注册工具相关的 IPC handlers
 */
export function registerToolHandlers() {
  // 获取平台信息
  ipcMain.handle(TOOL_CHANNELS.GET_PLATFORM_INFO, async (): Promise<PlatformInfo> => {
    const platform = process.platform as PlatformInfo['platform']
    const platformNames = {
      darwin: 'macOS',
      win32: 'Windows',
      linux: 'Linux'
    }

    return {
      platform,
      platformName: platformNames[platform] || 'Unknown',
      arch: process.arch,
      osVersion: os.release()
    }
  })

  // 检测 Claude Code 安装状态（完整检测）
  ipcMain.handle(TOOL_CHANNELS.CHECK_CLAUDE_CODE, async (): Promise<ClaudeCodeCheckResult> => {
    const result = await fullCheckClaudeCode()
    // 更新缓存
    toolCacheStore.setClaudeCodeCache(result)
    return result
  })

  // 检测 Claude Code 安装状态（使用缓存）
  ipcMain.handle(
    TOOL_CHANNELS.CHECK_CLAUDE_CODE_CACHED,
    async (): Promise<ClaudeCodeCheckResult> => {
      // 先尝试从缓存中获取
      const cached = toolCacheStore.getClaudeCodeCache()

      if (cached) {
        // 如果缓存显示已安装，快速验证是否仍然存在
        if (cached.installed) {
          const stillExists = await quickCheckClaudeCode()
          if (stillExists) {
            // 仍然存在，返回缓存
            return cached
          } else {
            // 已被卸载，更新缓存
            const notInstalledResult = { installed: false }
            toolCacheStore.setClaudeCodeCache(notInstalledResult)
            return notInstalledResult
          }
        } else {
          // 缓存显示未安装，快速验证是否已安装
          const nowExists = await quickCheckClaudeCode()
          if (nowExists) {
            // 已安装，执行完整检测并更新缓存
            const fullResult = await fullCheckClaudeCode()
            toolCacheStore.setClaudeCodeCache(fullResult)
            return fullResult
          } else {
            // 仍然未安装，返回缓存
            return cached
          }
        }
      }

      // 无缓存，执行完整检测
      const result = await fullCheckClaudeCode()
      toolCacheStore.setClaudeCodeCache(result)
      return result
    }
  )

  // 刷新工具检测缓存
  ipcMain.handle(TOOL_CHANNELS.REFRESH_TOOL_CACHE, async (): Promise<void> => {
    toolCacheStore.clearAllCache()
  })

  // 卸载 Claude Code
  ipcMain.handle(
    TOOL_CHANNELS.UNINSTALL_CLAUDE_CODE,
    async (): Promise<{ success: boolean; message: string }> => {
      try {
        const platform = process.platform

        // 先检查 Claude Code 是否已安装并获取安装方式
        const checkResult = await fullCheckClaudeCode()

        if (!checkResult.installed) {
          return {
            success: false,
            message: 'Claude Code 未安装'
          }
        }

        const installMethod = checkResult.installMethod || 'unknown'
        console.log(`[卸载] Claude Code 安装方式: ${installMethod}`)

        // 根据安装方式选择卸载方法
        if (installMethod === 'npm') {
          // npm 安装 - 使用 npm 卸载
          try {
            execSync('npm uninstall -g @anthropic-ai/claude-code', {
              encoding: 'utf-8',
              stdio: ['pipe', 'pipe', 'pipe'],
              timeout: 30000
            })
            toolCacheStore.clearClaudeCodeCache()
            return {
              success: true,
              message: '已通过 npm 成功卸载 Claude Code'
            }
          } catch (error) {
            return {
              success: false,
              message: `npm 卸载失败：${error instanceof Error ? error.message : '未知错误'}`
            }
          }
        } else if (installMethod === 'homebrew') {
          // Homebrew 安装 - 使用 brew 卸载
          try {
            execSync('brew uninstall --cask claude-code', {
              encoding: 'utf-8',
              stdio: ['pipe', 'pipe', 'pipe']
            })
            toolCacheStore.clearClaudeCodeCache()
            return {
              success: true,
              message: '已通过 Homebrew 成功卸载 Claude Code'
            }
          } catch (error) {
            return {
              success: false,
              message: `Homebrew 卸载失败：${error instanceof Error ? error.message : '未知错误'}`
            }
          }
        } else if (installMethod === 'script') {
          // 脚本安装 - 根据平台使用不同的卸载方式
          if (platform === 'darwin') {
            // macOS: 提示手动卸载或使用卸载脚本
            return {
              success: false,
              message:
                'Claude Code 通过脚本安装，请运行官方卸载脚本：\ncurl -fsSL https://claude.ai/uninstall.sh | bash'
            }
          } else if (platform === 'win32') {
            // Windows: 尝试多种卸载方式
            // 方式1: PowerShell 卸载脚本
            try {
              const psUninstall = spawn(
                'powershell.exe',
                ['-Command', 'irm https://claude.ai/uninstall.ps1 | iex'],
                {
                  stdio: ['ignore', 'pipe', 'pipe'],
                  timeout: 30000
                }
              )

              const psResult = await new Promise<boolean>((resolve) => {
                psUninstall.on('close', (code) => resolve(code === 0))
                psUninstall.on('error', () => resolve(false))
              })

              if (psResult) {
                toolCacheStore.clearClaudeCodeCache()
                return {
                  success: true,
                  message: '已通过 PowerShell 脚本成功卸载 Claude Code'
                }
              }
            } catch {
              // 继续尝试其他方式
            }

            // 方式2: winget 卸载
            try {
              execSync('winget uninstall "Claude Code"', {
                encoding: 'utf-8',
                stdio: ['pipe', 'pipe', 'pipe'],
                timeout: 30000
              })
              toolCacheStore.clearClaudeCodeCache()
              return {
                success: true,
                message: '已通过 winget 成功卸载 Claude Code'
              }
            } catch {
              // 继续尝试其他方式
            }

            // 方式3: 查找卸载程序
            try {
              const uninstallPaths = [
                join(
                  process.env.LOCALAPPDATA || '',
                  'Programs',
                  'claude-code',
                  'Uninstall Claude Code.exe'
                ),
                join(process.env.PROGRAMFILES || '', 'Claude Code', 'Uninstall.exe'),
                join(process.env['PROGRAMFILES(X86)'] || '', 'Claude Code', 'Uninstall.exe')
              ]

              for (const uninstallPath of uninstallPaths) {
                try {
                  const { existsSync } = await import('fs')
                  if (existsSync(uninstallPath)) {
                    execSync(`"${uninstallPath}" /S`, {
                      encoding: 'utf-8',
                      stdio: ['pipe', 'pipe', 'pipe'],
                      timeout: 30000
                    })
                    toolCacheStore.clearClaudeCodeCache()
                    return {
                      success: true,
                      message: '已通过卸载程序成功卸载 Claude Code'
                    }
                  }
                } catch {
                  continue
                }
              }
            } catch {
              // 所有方式都失败
            }

            // 所有自动卸载方式都失败
            return {
              success: false,
              message:
                '自动卸载失败。请通过以下方式手动卸载：\n1. Windows 设置 > 应用 > 已安装的应用\n2. 搜索 "Claude Code" 并点击卸载'
            }
          }
        }

        // 未知安装方式 - 提供通用卸载建议
        return {
          success: false,
          message:
            '无法确定安装方式。请尝试以下方法卸载：\n' +
            '1. 如果通过 npm 安装: npm uninstall -g @anthropic-ai/claude-code\n' +
            '2. 如果通过 Homebrew 安装: brew uninstall --cask claude-code\n' +
            '3. 如果通过脚本安装: 参考官方文档'
        }
      } catch (error) {
        return {
          success: false,
          message: `卸载失败：${error instanceof Error ? error.message : '未知错误'}`
        }
      }
    }
  )

  // 检测 Homebrew 安装状态（仅 macOS）
  ipcMain.handle(TOOL_CHANNELS.CHECK_HOMEBREW, async (): Promise<HomebrewCheckResult> => {
    try {
      if (process.platform !== 'darwin') {
        return { installed: false }
      }

      const output = execSync('which brew', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore'],
        timeout: 5000
      })
      const path = output.trim()

      if (path) {
        // 尝试获取版本号
        try {
          const versionOutput = execSync('brew --version', {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'ignore'],
            timeout: 5000
          })
          const version = versionOutput.trim().split('\n')[0].replace('Homebrew ', '')

          return {
            installed: true,
            path,
            version
          }
        } catch {
          return {
            installed: true,
            path
          }
        }
      }

      return { installed: false }
    } catch {
      return { installed: false }
    }
  })

  // 检测 Codex 安装状态（完整检测）
  ipcMain.handle(TOOL_CHANNELS.CHECK_CODEX, async (): Promise<CodexCheckResult> => {
    const result = await fullCheckCodex()
    // 更新缓存
    toolCacheStore.setCodexCache(result)
    return result
  })

  // 检测 Codex 安装状态（使用缓存）
  ipcMain.handle(TOOL_CHANNELS.CHECK_CODEX_CACHED, async (): Promise<CodexCheckResult> => {
    // 先尝试从缓存中获取
    const cached = toolCacheStore.getCodexCache()

    if (cached) {
      // 如枟缓存显示已安装，快速验证是否仍然存在
      if (cached.installed) {
        const stillExists = await quickCheckCodex()
        if (stillExists) {
          // 仍然存在，返回缓存
          return cached
        } else {
          // 已被卸载，更新缓存
          const notInstalledResult = { installed: false }
          toolCacheStore.setCodexCache(notInstalledResult)
          return notInstalledResult
        }
      } else {
        // 缓存显示未安装，快速验证是否已安装
        const nowExists = await quickCheckCodex()
        if (nowExists) {
          // 已安装，执行完整检测并更新缓存
          const fullResult = await fullCheckCodex()
          toolCacheStore.setCodexCache(fullResult)
          return fullResult
        } else {
          // 仍然未安装，返回缓存
          return cached
        }
      }
    }

    // 无缓存，执行完整检测
    const result = await fullCheckCodex()
    toolCacheStore.setCodexCache(result)
    return result
  })

  // 卸载 Codex
  ipcMain.handle(
    TOOL_CHANNELS.UNINSTALL_CODEX,
    async (): Promise<{ success: boolean; message: string }> => {
      try {
        // 先检查 Codex 是否已安装并获取安装方式
        const checkResult = await fullCheckCodex()

        if (!checkResult.installed) {
          return {
            success: false,
            message: 'Codex 未安装'
          }
        }

        const installMethod = checkResult.installMethod || 'unknown'
        console.log(`[卸载] Codex 安装方式: ${installMethod}`)

        // 根据安装方式选择卸载方法
        if (installMethod === 'npm') {
          // npm 安装 - 使用 npm 卸载
          try {
            execSync('npm uninstall -g @openai/codex', {
              encoding: 'utf-8',
              stdio: ['pipe', 'pipe', 'pipe'],
              timeout: 30000
            })
            toolCacheStore.clearCodexCache()
            return {
              success: true,
              message: '已通过 npm 成功卸载 Codex'
            }
          } catch (error) {
            return {
              success: false,
              message: `npm 卸载失败：${error instanceof Error ? error.message : '未知错误'}`
            }
          }
        } else if (installMethod === 'homebrew') {
          // Homebrew 安装 - 使用 brew 卸载
          try {
            execSync('brew uninstall codex', {
              encoding: 'utf-8',
              stdio: ['pipe', 'pipe', 'pipe'],
              timeout: 30000
            })
            toolCacheStore.clearCodexCache()
            return {
              success: true,
              message: '已通过 Homebrew 成功卸载 Codex'
            }
          } catch (error) {
            return {
              success: false,
              message: `Homebrew 卸载失败：${error instanceof Error ? error.message : '未知错误'}`
            }
          }
        }

        // 未知安装方式 - 提供通用卸载建议
        return {
          success: false,
          message:
            '无法确定安装方式。请尝试以下方法卸载：\n' +
            '1. 如果通过 npm 安装: npm uninstall -g @openai/codex\n' +
            '2. 如果通过 Homebrew 安装: brew uninstall codex'
        }
      } catch (error) {
        return {
          success: false,
          message: `卸载失败：${error instanceof Error ? error.message : '未知错误'}`
        }
      }
    }
  )

  // 检测 Node.js 安装状态
  ipcMain.handle(TOOL_CHANNELS.CHECK_NODEJS, async (): Promise<NodeCheckResult> => {
    try {
      const platform = process.platform

      let command: string
      if (platform === 'win32') {
        // Windows: 检查 node 命令是否可用
        command = 'where node'
      } else {
        // macOS/Linux: 检查 node 命令是否可用
        command = 'which node'
      }

      const output = execSync(command, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore'],
        timeout: 5000
      })
      const path = output.trim().split('\n')[0] // 获取第一个结果

      if (path) {
        // 尝试获取版本号
        try {
          const versionOutput = execSync('node --version', {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'ignore'],
            timeout: 5000
          })
          const version = versionOutput.trim() // 例如: v18.20.0

          // 提取主版本号
          const majorVersion = parseInt(version.replace('v', '').split('.')[0], 10)

          return {
            installed: true,
            path,
            version,
            majorVersion
          }
        } catch {
          // 无法获取版本，但已安装
          return {
            installed: true,
            path
          }
        }
      }

      return { installed: false }
    } catch {
      // 命令不存在或执行失败
      return { installed: false }
    }
  })

  // 检测 NVM 安装状态
  ipcMain.handle(TOOL_CHANNELS.CHECK_NVM, async (): Promise<NvmCheckResult> => {
    try {
      const platform = process.platform

      if (platform === 'win32') {
        // Windows: 检查 nvm 命令（nvm-windows）
        try {
          const output = execSync('where nvm', {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'ignore'],
            timeout: 5000
          })
          const path = output.trim().split('\n')[0]

          if (path) {
            // Windows 下不执行 nvm version，避免弹出 GUI 警告
            return {
              installed: true,
              path
            }
          }
        } catch {
          return { installed: false }
        }
      } else {
        // macOS/Linux: NVM 通常是 shell 函数，检查 NVM_DIR 环境变量和 nvm.sh 脚本
        const nvmDir = process.env.NVM_DIR || `${process.env.HOME}/.nvm`
        const nvmScript = `${nvmDir}/nvm.sh`

        try {
          // 检查 nvm.sh 是否存在
          execSync(`test -f ${nvmScript}`, { stdio: ['pipe', 'pipe', 'ignore'], timeout: 5000 })

          // 尝试获取版本号
          try {
            // 使用 bash -c 来加载 nvm 并获取版本
            const versionOutput = execSync(`bash -c "source ${nvmScript} && nvm --version"`, {
              encoding: 'utf-8',
              stdio: ['pipe', 'pipe', 'ignore'],
              timeout: 5000
            })
            const version = versionOutput.trim()

            return {
              installed: true,
              path: nvmScript,
              version
            }
          } catch {
            // 无法获取版本，但 nvm.sh 存在
            return {
              installed: true,
              path: nvmScript
            }
          }
        } catch {
          return { installed: false }
        }
      }

      return { installed: false }
    } catch {
      return { installed: false }
    }
  })

  // 检测 Claude Code 是否正在运行
  ipcMain.handle(TOOL_CHANNELS.CHECK_CLAUDE_CODE_RUNNING, async (): Promise<boolean> => {
    try {
      const platform = process.platform
      let command: string

      if (platform === 'win32') {
        // Windows: 检查 claude.exe 进程，并验证输出包含进程名
        command = 'tasklist /FI "IMAGENAME eq claude.exe" /NH'
        const output = execSync(command, {
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'ignore'],
          timeout: 5000
        })
        return output.toLowerCase().includes('claude.exe')
      } else {
        // macOS/Linux: 使用 ps + grep 组合（pgrep 在某些系统上不可靠）
        command = 'ps -ax -o command | grep -E "^claude$"'
        execSync(command, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'], timeout: 5000 })
        return true
      }
    } catch {
      return false
    }
  })

  // 杀掉所有 Claude Code 进程
  ipcMain.handle(TOOL_CHANNELS.KILL_CLAUDE_CODE, async (): Promise<boolean> => {
    try {
      const platform = process.platform

      if (platform === 'win32') {
        // Windows: 先尝试优雅关闭，失败则强制终止
        try {
          execSync('taskkill /IM claude.exe', {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'ignore']
          })
        } catch {
          execSync('taskkill /F /IM claude.exe', {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'ignore']
          })
        }
      } else {
        // macOS/Linux: 先尝试 SIGTERM 优雅退出，失败则使用 SIGKILL
        // 使用 -x 精确匹配进程名，避免误杀
        try {
          execSync('pkill -x claude', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] })
          // 等待进程退出
          await new Promise((resolve) => setTimeout(resolve, 1000))
          // 检查是否还在运行
          try {
            execSync('ps -ax -o command | grep -E "^claude$"', {
              encoding: 'utf-8',
              stdio: ['pipe', 'pipe', 'ignore']
            })
            // 如果还在运行，强制终止
            execSync('pkill -9 -x claude', {
              encoding: 'utf-8',
              stdio: ['pipe', 'pipe', 'ignore']
            })
          } catch {
            // 进程已退出
          }
        } catch {
          // 尝试强制终止
          try {
            execSync('pkill -9 -x claude', {
              encoding: 'utf-8',
              stdio: ['pipe', 'pipe', 'ignore']
            })
          } catch {
            // 没有进程需要杀掉
          }
        }
      }

      return true
    } catch {
      // 如果没有进程被杀掉，也返回 true（因为目标已达成）
      return true
    }
  })

  // 检测 Codex 是否正在运行
  ipcMain.handle(TOOL_CHANNELS.CHECK_CODEX_RUNNING, async (): Promise<boolean> => {
    try {
      const platform = process.platform
      let command: string

      if (platform === 'win32') {
        // Windows: 检查 codex.exe 进程，并验证输出包含进程名
        command = 'tasklist /FI "IMAGENAME eq codex.exe" /NH'
        const output = execSync(command, {
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'ignore'],
          timeout: 5000
        })
        return output.toLowerCase().includes('codex.exe')
      } else {
        // macOS/Linux: 使用 ps + grep 组合（与 Claude Code 检测保持一致）
        command = 'ps -ax -o command | grep -E "^codex$"'
        execSync(command, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'], timeout: 5000 })
        return true
      }
    } catch {
      return false
    }
  })

  // 杀掉所有 Codex 进程
  ipcMain.handle(TOOL_CHANNELS.KILL_CODEX, async (): Promise<boolean> => {
    try {
      const platform = process.platform
      let command: string

      if (platform === 'win32') {
        // Windows: 使用 taskkill
        command = 'taskkill /F /IM codex.exe'
      } else {
        // macOS/Linux: 使用 pkill
        command = 'pkill -9 codex'
      }

      execSync(command, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] })
      return true
    } catch {
      // 如果没有进程被杀掉，也返回 true（因为目标已达成）
      return true
    }
  })

  // 通过 npm 安装 Codex
  ipcMain.handle(TOOL_CHANNELS.INSTALL_CODEX_NPM, async (): Promise<InstallResult> => {
    try {
      const platform = process.platform

      // 1. 检查 Node.js 是否已安装且版本 >= 18
      let nodeInstalled = false
      let nodeMajorVersion = 0

      try {
        const command = platform === 'win32' ? 'where node' : 'which node'
        execSync(command, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] })
        nodeInstalled = true

        // 获取版本
        const versionOutput = execSync('node --version', {
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'ignore']
        })
        const version = versionOutput.trim()
        nodeMajorVersion = parseInt(version.replace('v', '').split('.')[0], 10)
      } catch {
        nodeInstalled = false
      }

      if (!nodeInstalled) {
        return {
          success: false,
          message: '未检测到 Node.js，请先安装 Node.js (≥ v18)'
        }
      }

      if (nodeMajorVersion < 18) {
        return {
          success: false,
          message: `当前 Node.js 版本过低 (v${nodeMajorVersion})，需要 v18 或更高版本`
        }
      }

      // 2. 执行 npm 安装
      return new Promise<InstallResult>((resolve) => {
        const npmCommand = platform === 'win32' ? 'npm.cmd' : 'npm'
        const child = spawn(npmCommand, ['install', '-g', '@openai/codex'], {
          shell: true,
          stdio: ['ignore', 'pipe', 'pipe']
        })

        let output = ''

        child.stdout?.on('data', (data) => {
          output += data.toString()
        })

        child.stderr?.on('data', (data) => {
          output += data.toString()
        })

        child.on('close', (code) => {
          if (code === 0) {
            resolve({
              success: true,
              message: '已成功通过 npm 安装 Codex',
              output
            })
          } else {
            resolve({
              success: false,
              message: `安装失败（退出码: ${code}），请检查网络连接或权限`,
              output
            })
          }
        })

        child.on('error', (error) => {
          resolve({
            success: false,
            message: `安装失败：${error.message}`,
            output
          })
        })
      })
    } catch (error) {
      return {
        success: false,
        message: `安装失败：${error instanceof Error ? error.message : '未知错误'}`
      }
    }
  })

  // 通过 Homebrew 安装 Codex (仅 macOS)
  ipcMain.handle(TOOL_CHANNELS.INSTALL_CODEX_HOMEBREW, async (): Promise<InstallResult> => {
    try {
      if (process.platform !== 'darwin') {
        return {
          success: false,
          message: 'Homebrew 仅支持 macOS 平台'
        }
      }

      // 检查 Homebrew 是否已安装
      let brewInstalled = false
      try {
        execSync('which brew', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] })
        brewInstalled = true
      } catch {
        brewInstalled = false
      }

      if (!brewInstalled) {
        return {
          success: false,
          message: '未检测到 Homebrew，请先安装 Homebrew'
        }
      }

      // 执行 brew 安装
      return new Promise<InstallResult>((resolve) => {
        const child = spawn('brew', ['install', 'codex'], {
          stdio: ['ignore', 'pipe', 'pipe']
        })

        let output = ''

        child.stdout?.on('data', (data) => {
          output += data.toString()
        })

        child.stderr?.on('data', (data) => {
          output += data.toString()
        })

        child.on('close', (code) => {
          if (code === 0) {
            resolve({
              success: true,
              message: '已成功通过 Homebrew 安装 Codex',
              output
            })
          } else {
            resolve({
              success: false,
              message: `安装失败（退出码: ${code}），请检查 Homebrew 配置`,
              output
            })
          }
        })

        child.on('error', (error) => {
          resolve({
            success: false,
            message: `安装失败：${error.message}`,
            output
          })
        })
      })
    } catch (error) {
      return {
        success: false,
        message: `安装失败：${error instanceof Error ? error.message : '未知错误'}`
      }
    }
  })

  // 安装 Homebrew (仅 macOS)
  ipcMain.handle(TOOL_CHANNELS.INSTALL_HOMEBREW, async (): Promise<InstallResult> => {
    try {
      if (process.platform !== 'darwin') {
        return {
          success: false,
          message: 'Homebrew 仅支持 macOS 平台'
        }
      }

      // 检查是否已安装
      let brewInstalled = false
      try {
        execSync('which brew', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] })
        brewInstalled = true
      } catch {
        brewInstalled = false
      }

      if (brewInstalled) {
        return {
          success: false,
          message: 'Homebrew 已经安装'
        }
      }

      // 执行安装脚本
      return new Promise<InstallResult>((resolve) => {
        const installCommand =
          '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'

        const child = spawn(installCommand, [], {
          shell: true,
          stdio: ['ignore', 'pipe', 'pipe']
        })

        let output = ''

        child.stdout?.on('data', (data) => {
          output += data.toString()
        })

        child.stderr?.on('data', (data) => {
          output += data.toString()
        })

        child.on('close', (code) => {
          if (code === 0) {
            resolve({
              success: true,
              message: '已成功安装 Homebrew',
              output
            })
          } else {
            resolve({
              success: false,
              message: `安装失败（退出码: ${code}），请手动访问 https://brew.sh 查看安装说明`,
              output
            })
          }
        })

        child.on('error', (error) => {
          resolve({
            success: false,
            message: `安装失败：${error.message}`,
            output
          })
        })
      })
    } catch (error) {
      return {
        success: false,
        message: `安装失败：${error instanceof Error ? error.message : '未知错误'}`
      }
    }
  })

  // 安装 NVM
  ipcMain.handle(TOOL_CHANNELS.INSTALL_NVM, async (): Promise<InstallResult> => {
    try {
      const platform = process.platform

      if (platform === 'win32') {
        // Windows: 提示用户安装 nvm-windows
        return {
          success: false,
          message:
            'Windows 平台请手动下载安装 nvm-windows：https://github.com/coreybutler/nvm-windows/releases'
        }
      }

      // macOS/Linux: 使用 cURL 安装
      return new Promise<InstallResult>((resolve) => {
        const installCommand =
          'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash'

        const child = spawn(installCommand, [], {
          shell: true,
          stdio: ['ignore', 'pipe', 'pipe']
        })

        let output = ''

        child.stdout?.on('data', (data) => {
          output += data.toString()
        })

        child.stderr?.on('data', (data) => {
          output += data.toString()
        })

        child.on('close', (code) => {
          if (code === 0) {
            resolve({
              success: true,
              message: '已成功安装 NVM，请重启终端或重新加载配置文件后使用',
              output
            })
          } else {
            resolve({
              success: false,
              message: `安装失败（退出码: ${code}），请手动访问 https://github.com/nvm-sh/nvm 查看安装说明`,
              output
            })
          }
        })

        child.on('error', (error) => {
          resolve({
            success: false,
            message: `安装失败：${error.message}`,
            output
          })
        })
      })
    } catch (error) {
      return {
        success: false,
        message: `安装失败：${error instanceof Error ? error.message : '未知错误'}`
      }
    }
  })

  // 通过 npm 安装 Claude Code
  ipcMain.handle(TOOL_CHANNELS.INSTALL_CLAUDE_CODE_NPM, async (): Promise<InstallResult> => {
    try {
      const platform = process.platform

      // 1. 检查 Node.js 是否已安装且版本 >= 18
      let nodeInstalled = false
      let nodeMajorVersion = 0

      try {
        const command = platform === 'win32' ? 'where node' : 'which node'
        execSync(command, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] })
        nodeInstalled = true

        // 获取版本
        const versionOutput = execSync('node --version', {
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'ignore']
        })
        const version = versionOutput.trim()
        nodeMajorVersion = parseInt(version.replace('v', '').split('.')[0], 10)
      } catch {
        nodeInstalled = false
      }

      if (!nodeInstalled) {
        return {
          success: false,
          message: '未检测到 Node.js，请先安装 Node.js (≥ v18)'
        }
      }

      if (nodeMajorVersion < 18) {
        return {
          success: false,
          message: `当前 Node.js 版本过低 (v${nodeMajorVersion})，需要 v18 或更高版本`
        }
      }

      // 2. 执行 npm 安装
      return new Promise<InstallResult>((resolve) => {
        const npmCommand = platform === 'win32' ? 'npm.cmd' : 'npm'
        const child = spawn(npmCommand, ['install', '-g', '@anthropic-ai/claude-code'], {
          shell: true,
          stdio: ['ignore', 'pipe', 'pipe']
        })

        let output = ''

        child.stdout?.on('data', (data) => {
          output += data.toString()
        })

        child.stderr?.on('data', (data) => {
          output += data.toString()
        })

        child.on('close', (code) => {
          if (code === 0) {
            // 清除缓存，确保下次检测能识别到新安装的工具
            toolCacheStore.clearClaudeCodeCache()
            resolve({
              success: true,
              message: '已成功通过 npm 安装 Claude Code',
              output
            })
          } else {
            resolve({
              success: false,
              message: `安装失败（退出码: ${code}），请检查网络连接或权限`,
              output
            })
          }
        })

        child.on('error', (error) => {
          resolve({
            success: false,
            message: `安装失败：${error.message}`,
            output
          })
        })
      })
    } catch (error) {
      return {
        success: false,
        message: `安装失败：${error instanceof Error ? error.message : '未知错误'}`
      }
    }
  })

  // 通过 Homebrew 安装 Claude Code (仅 macOS)
  ipcMain.handle(TOOL_CHANNELS.INSTALL_CLAUDE_CODE_HOMEBREW, async (): Promise<InstallResult> => {
    try {
      if (process.platform !== 'darwin') {
        return {
          success: false,
          message: 'Homebrew 仅支持 macOS 平台'
        }
      }

      // 检查 Homebrew 是否已安装
      let brewInstalled = false
      try {
        execSync('which brew', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] })
        brewInstalled = true
      } catch {
        brewInstalled = false
      }

      if (!brewInstalled) {
        return {
          success: false,
          message: '未检测到 Homebrew，请先安装 Homebrew'
        }
      }

      // 执行 brew 安装
      return new Promise<InstallResult>((resolve) => {
        const child = spawn('brew', ['install', '--cask', 'claude-code'], {
          stdio: ['ignore', 'pipe', 'pipe']
        })

        let output = ''

        child.stdout?.on('data', (data) => {
          output += data.toString()
        })

        child.stderr?.on('data', (data) => {
          output += data.toString()
        })

        child.on('close', (code) => {
          if (code === 0) {
            resolve({
              success: true,
              message: '已成功通过 Homebrew 安装 Claude Code',
              output
            })
          } else {
            resolve({
              success: false,
              message: `安装失败（退出码: ${code}），请检查 Homebrew 配置`,
              output
            })
          }
        })

        child.on('error', (error) => {
          resolve({
            success: false,
            message: `安装失败：${error.message}`,
            output
          })
        })
      })
    } catch (error) {
      return {
        success: false,
        message: `安装失败：${error instanceof Error ? error.message : '未知错误'}`
      }
    }
  })

  // 通过 cURL 脚本安装 Claude Code (仅 macOS)
  ipcMain.handle(TOOL_CHANNELS.INSTALL_CLAUDE_CODE_CURL, async (): Promise<InstallResult> => {
    try {
      if (process.platform !== 'darwin') {
        return {
          success: false,
          message: 'cURL 安装脚本仅支持 macOS 平台'
        }
      }

      // 执行安装脚本
      return new Promise<InstallResult>((resolve) => {
        const installCommand = 'curl -fsSL https://claude.ai/install.sh | bash'

        const child = spawn(installCommand, [], {
          shell: true,
          stdio: ['ignore', 'pipe', 'pipe']
        })

        let output = ''

        child.stdout?.on('data', (data) => {
          output += data.toString()
        })

        child.stderr?.on('data', (data) => {
          output += data.toString()
        })

        child.on('close', (code) => {
          if (code === 0) {
            resolve({
              success: true,
              message: '已成功通过 cURL 脚本安装 Claude Code',
              output
            })
          } else {
            resolve({
              success: false,
              message: `安装失败（退出码: ${code}），请手动访问 https://claude.ai 查看安装说明`,
              output
            })
          }
        })

        child.on('error', (error) => {
          resolve({
            success: false,
            message: `安装失败：${error.message}`,
            output
          })
        })
      })
    } catch (error) {
      return {
        success: false,
        message: `安装失败：${error instanceof Error ? error.message : '未知错误'}`
      }
    }
  })

  // 通过 PowerShell 脚本安装 Claude Code (仅 Windows)
  ipcMain.handle(TOOL_CHANNELS.INSTALL_CLAUDE_CODE_POWERSHELL, async (): Promise<InstallResult> => {
    try {
      if (process.platform !== 'win32') {
        return {
          success: false,
          message: 'PowerShell 安装脚本仅支持 Windows 平台'
        }
      }

      // 执行 PowerShell 安装脚本
      return new Promise<InstallResult>((resolve) => {
        const installCommand = 'irm https://claude.ai/install.ps1 | iex'

        const child = spawn('powershell.exe', ['-Command', installCommand], {
          stdio: ['ignore', 'pipe', 'pipe']
        })

        let output = ''

        child.stdout?.on('data', (data) => {
          output += data.toString()
        })

        child.stderr?.on('data', (data) => {
          output += data.toString()
        })

        child.on('close', (code) => {
          if (code === 0) {
            resolve({
              success: true,
              message: '已成功通过 PowerShell 脚本安装 Claude Code',
              output
            })
          } else {
            resolve({
              success: false,
              message: `安装失败（退出码: ${code}），请手动访问 https://claude.ai 查看安装说明`,
              output
            })
          }
        })

        child.on('error', (error) => {
          resolve({
            success: false,
            message: `安装失败：${error.message}`,
            output
          })
        })
      })
    } catch (error) {
      return {
        success: false,
        message: `安装失败：${error instanceof Error ? error.message : '未知错误'}`
      }
    }
  })

  // 通过 CMD 脚本安装 Claude Code (仅 Windows)
  ipcMain.handle(TOOL_CHANNELS.INSTALL_CLAUDE_CODE_CMD, async (): Promise<InstallResult> => {
    try {
      if (process.platform !== 'win32') {
        return {
          success: false,
          message: 'CMD 安装脚本仅支持 Windows 平台'
        }
      }

      // 执行 CMD 安装脚本
      return new Promise<InstallResult>((resolve) => {
        const installCommand =
          'curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd'

        const child = spawn('cmd.exe', ['/c', installCommand], {
          stdio: ['ignore', 'pipe', 'pipe']
        })

        let output = ''

        child.stdout?.on('data', (data) => {
          output += data.toString()
        })

        child.stderr?.on('data', (data) => {
          output += data.toString()
        })

        child.on('close', (code) => {
          if (code === 0) {
            resolve({
              success: true,
              message: '已成功通过 CMD 脚本安装 Claude Code',
              output
            })
          } else {
            resolve({
              success: false,
              message: `安装失败（退出码: ${code}），请手动访问 https://claude.ai 查看安装说明`,
              output
            })
          }
        })

        child.on('error', (error) => {
          resolve({
            success: false,
            message: `安装失败：${error.message}`,
            output
          })
        })
      })
    } catch (error) {
      return {
        success: false,
        message: `安装失败：${error instanceof Error ? error.message : '未知错误'}`
      }
    }
  })
}
