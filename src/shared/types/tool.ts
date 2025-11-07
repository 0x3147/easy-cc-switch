/**
 * 工具安装相关类型定义
 */

/**
 * 平台类型
 */
export type Platform = 'darwin' | 'win32' | 'linux'

/**
 * 平台信息
 */
export interface PlatformInfo {
  /** 平台类型 */
  platform: Platform
  /** 平台显示名称 */
  platformName: string
  /** 系统架构 */
  arch: string
  /** 操作系统版本 */
  osVersion: string
}

/**
 * Claude Code 检测结果
 */
export interface ClaudeCodeCheckResult {
  /** 是否已安装 */
  installed: boolean
  /** 安装路径（如果已安装） */
  path?: string
  /** 版本号（如果已安装） */
  version?: string
}

/**
 * Homebrew 检测结果
 */
export interface HomebrewCheckResult {
  /** 是否已安装 */
  installed: boolean
  /** 安装路径（如果已安装） */
  path?: string
  /** 版本号（如果已安装） */
  version?: string
}

/**
 * Codex 检测结果
 */
export interface CodexCheckResult {
  /** 是否已安装 */
  installed: boolean
  /** 安装路径（如果已安装） */
  path?: string
  /** 版本号（如果已安装） */
  version?: string
}

/**
 * Node.js 检测结果
 */
export interface NodeCheckResult {
  /** 是否已安装 */
  installed: boolean
  /** 安装路径（如果已安装） */
  path?: string
  /** 版本号（如果已安装） */
  version?: string
  /** 主版本号（用于版本检查） */
  majorVersion?: number
}

/**
 * NVM 检测结果
 */
export interface NvmCheckResult {
  /** 是否已安装 */
  installed: boolean
  /** 安装路径（如果已安装） */
  path?: string
  /** 版本号（如果已安装） */
  version?: string
}
