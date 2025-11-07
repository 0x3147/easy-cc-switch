import { ipcMain } from 'electron'
import { execSync, spawn } from 'child_process'
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

  // 卸载 Claude Code
  ipcMain.handle(
    TOOL_CHANNELS.UNINSTALL_CLAUDE_CODE,
    async (): Promise<{ success: boolean; message: string }> => {
      try {
        const platform = process.platform

        // 先检查 Claude Code 是否已安装
        let isInstalled = false
        try {
          const command = platform === 'win32' ? 'where claude' : 'which claude'
          execSync(command, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] })
          isInstalled = true
        } catch {
          isInstalled = false
        }

        if (!isInstalled) {
          return {
            success: false,
            message: 'Claude Code 未安装'
          }
        }

        // macOS: 尝试使用 Homebrew 卸载
        if (platform === 'darwin') {
          try {
            execSync('brew uninstall --cask claude-code', {
              encoding: 'utf-8',
              stdio: ['pipe', 'pipe', 'pipe']
            })
            return {
              success: true,
              message: '已通过 Homebrew 成功卸载 Claude Code'
            }
          } catch {
            return {
              success: false,
              message: '卸载失败：请手动运行 "brew uninstall --cask claude-code" 或查看官方文档'
            }
          }
        }

        // Windows: 提示用户手动卸载
        if (platform === 'win32') {
          return {
            success: false,
            message: '请通过 Windows 设置中的"应用和功能"手动卸载 Claude Code'
          }
        }

        // Linux: 提示用户手动卸载
        return {
          success: false,
          message: '请参考官方文档手动卸载 Claude Code'
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

  // 卸载 Codex
  ipcMain.handle(
    TOOL_CHANNELS.UNINSTALL_CODEX,
    async (): Promise<{ success: boolean; message: string }> => {
      try {
        const platform = process.platform

        // 先检查 Codex 是否已安装
        let isInstalled = false
        try {
          const command = platform === 'win32' ? 'where codex' : 'which codex'
          execSync(command, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] })
          isInstalled = true
        } catch {
          isInstalled = false
        }

        if (!isInstalled) {
          return {
            success: false,
            message: 'Codex 未安装'
          }
        }

        // 尝试使用 npm 卸载
        try {
          execSync('npm uninstall -g @openai/codex', {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe']
          })
          return {
            success: true,
            message: '已通过 npm 成功卸载 Codex'
          }
        } catch (npmError) {
          // npm 卸载失败，尝试 homebrew (仅 macOS)
          if (platform === 'darwin') {
            try {
              execSync('brew uninstall codex', {
                encoding: 'utf-8',
                stdio: ['pipe', 'pipe', 'pipe']
              })
              return {
                success: true,
                message: '已通过 Homebrew 成功卸载 Codex'
              }
            } catch (brewError) {
              return {
                success: false,
                message: '卸载失败：无法通过 npm 或 Homebrew 卸载 Codex'
              }
            }
          }

          return {
            success: false,
            message: '卸载失败：npm uninstall 命令执行失败'
          }
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
            const versionOutput = execSync(`bash -c "source ${nvmScript} && nvm --version"`, {
              encoding: 'utf-8',
              stdio: ['pipe', 'pipe', 'ignore']
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
