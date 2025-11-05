import { ipcMain } from 'electron'
import { execSync } from 'child_process'
import * as os from 'os'
import { TOOL_CHANNELS } from '@/shared/ipc-channels'
import type { PlatformInfo, ClaudeCodeCheckResult, HomebrewCheckResult } from '@/shared/types/tool'

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
        // Windows: 检查 claude-code 命令是否可用
        command = 'where claude-code'
      } else {
        // macOS/Linux: 检查 claude-code 命令是否可用
        command = 'which claude-code'
      }

      const output = execSync(command, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] })
      const path = output.trim().split('\n')[0] // 获取第一个结果

      if (path) {
        // 尝试获取版本号
        try {
          const versionOutput = execSync('claude-code --version', {
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
}
