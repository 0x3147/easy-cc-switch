import { ipcMain } from 'electron'
import { execSync } from 'child_process'
import * as os from 'os'
import { TOOL_CHANNELS } from '@/shared/ipc-channels'
import type {
  PlatformInfo,
  ClaudeCodeCheckResult,
  CodexCheckResult,
  NodeCheckResult,
  NvmCheckResult,
  HomebrewCheckResult
} from '@/shared/types/tool'

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

  // 检测 Claude Code 安装状态
  ipcMain.handle(TOOL_CHANNELS.CHECK_CLAUDE_CODE, async (): Promise<ClaudeCodeCheckResult> => {
    try {
      const platform = process.platform

      let command: string
      if (platform === 'win32') {
        // Windows: 检查 claude 命令是否可用
        command = 'where claude'
      } else {
        // macOS/Linux: 检查 claude 命令是否可用
        command = 'which claude'
      }

      const output = execSync(command, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] })
      const path = output.trim().split('\n')[0] // 获取第一个结果

      if (path) {
        // 尝试获取版本号
        try {
          const versionOutput = execSync('claude --version', {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'ignore']
          })
          const version = versionOutput.trim()

          return {
            installed: true,
            path,
            version
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

  // 检测 Homebrew 安装状态（仅 macOS）
  ipcMain.handle(TOOL_CHANNELS.CHECK_HOMEBREW, async (): Promise<HomebrewCheckResult> => {
    try {
      if (process.platform !== 'darwin') {
        return { installed: false }
      }

      const output = execSync('which brew', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore']
      })
      const path = output.trim()

      if (path) {
        // 尝试获取版本号
        try {
          const versionOutput = execSync('brew --version', {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'ignore']
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

  // 检测 Codex 安装状态
  ipcMain.handle(TOOL_CHANNELS.CHECK_CODEX, async (): Promise<CodexCheckResult> => {
    try {
      const platform = process.platform

      let command: string
      if (platform === 'win32') {
        // Windows: 检查 codex 命令是否可用
        command = 'where codex'
      } else {
        // macOS/Linux: 检查 codex 命令是否可用
        command = 'which codex'
      }

      const output = execSync(command, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] })
      const path = output.trim().split('\n')[0] // 获取第一个结果

      if (path) {
        // 尝试获取版本号
        try {
          const versionOutput = execSync('codex --version', {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'ignore']
          })
          const version = versionOutput.trim()

          return {
            installed: true,
            path,
            version
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

      const output = execSync(command, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] })
      const path = output.trim().split('\n')[0] // 获取第一个结果

      if (path) {
        // 尝试获取版本号
        try {
          const versionOutput = execSync('node --version', {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'ignore']
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
            stdio: ['pipe', 'pipe', 'ignore']
          })
          const path = output.trim().split('\n')[0]

          if (path) {
            try {
              const versionOutput = execSync('nvm version', {
                encoding: 'utf-8',
                stdio: ['pipe', 'pipe', 'ignore']
              })
              const version = versionOutput.trim()

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
        } catch {
          return { installed: false }
        }
      } else {
        // macOS/Linux: NVM 通常是 shell 函数，检查 NVM_DIR 环境变量和 nvm.sh 脚本
        const nvmDir = process.env.NVM_DIR || `${process.env.HOME}/.nvm`
        const nvmScript = `${nvmDir}/nvm.sh`

        try {
          // 检查 nvm.sh 是否存在
          execSync(`test -f ${nvmScript}`, { stdio: ['pipe', 'pipe', 'ignore'] })

          // 尝试获取版本号
          try {
            // 使用 bash -c 来加载 nvm 并获取版本
            const versionOutput = execSync(
              `bash -c "source ${nvmScript} && nvm --version"`,
              {
                encoding: 'utf-8',
                stdio: ['pipe', 'pipe', 'ignore']
              }
            )
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
        const output = execSync(command, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] })
        return output.toLowerCase().includes('claude.exe')
      } else {
        // macOS/Linux: 使用 ps + grep 组合（pgrep 在某些系统上不可靠）
        command = 'ps -ax -o command | grep -E "^claude$"'
        execSync(command, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] })
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
        // Windows: 检查 codex.exe 进程
        command = 'tasklist /FI "IMAGENAME eq codex.exe"'
      } else {
        // macOS/Linux: 使用 pgrep 检查 codex 进程
        command = 'pgrep -x codex'
      }

      execSync(command, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] })
      return true
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
}
