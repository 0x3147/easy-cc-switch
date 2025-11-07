/**
 * IPC 通道名称常量
 * 集中管理所有 IPC 通信的 channel 名称，避免硬编码字符串
 * 此文件可在主进程、渲染进程和预加载脚本中共享使用
 */

/**
 * 窗口控制相关 channel
 */
export const WINDOW_CHANNELS = {
  /** 最小化窗口 */
  MINIMIZE: 'window-minimize',
  /** 最大化/还原窗口 */
  MAXIMIZE: 'window-maximize',
  /** 关闭窗口 */
  CLOSE: 'window-close'
} as const

/**
 * 应用相关 channel（预留）
 */
export const APP_CHANNELS = {
  /** 获取应用版本 */
  GET_VERSION: 'app-get-version',
  /** 获取应用路径 */
  GET_PATH: 'app-get-path'
} as const

/**
 * 供应商配置相关 channel
 */
export const VENDOR_CHANNELS = {
  /** 读取 Claude 配置 */
  GET_CLAUDE_CONFIG: 'vendor-get-claude-config',
  /** 保存 Claude 配置 */
  SAVE_CLAUDE_CONFIG: 'vendor-save-claude-config',
  /** 获取所有供应商配置 */
  GET_ALL_VENDORS: 'vendor-get-all-vendors',
  /** 添加供应商配置 */
  ADD_VENDOR: 'vendor-add-vendor',
  /** 删除供应商配置 */
  DELETE_VENDOR: 'vendor-delete-vendor',
  /** 更新供应商配置 */
  UPDATE_VENDOR: 'vendor-update-vendor',
  /** 激活供应商配置 */
  ACTIVATE_VENDOR: 'vendor-activate-vendor',
  /** 获取当前激活的供应商 ID */
  GET_ACTIVE_VENDOR_ID: 'vendor-get-active-vendor-id'
} as const

/**
 * 工具安装相关 channel
 */
export const TOOL_CHANNELS = {
  /** 检测 Claude Code 安装状态 */
  CHECK_CLAUDE_CODE: 'tool-check-claude-code',
  /** 检测 Homebrew 安装状态（仅 macOS） */
  CHECK_HOMEBREW: 'tool-check-homebrew',
  /** 获取系统平台信息 */
  GET_PLATFORM_INFO: 'tool-get-platform-info',
  /** 检测 Claude Code 是否正在运行 */
  CHECK_CLAUDE_CODE_RUNNING: 'tool-check-claude-code-running',
  /** 杀掉所有 Claude Code 进程 */
  KILL_CLAUDE_CODE: 'tool-kill-claude-code',
  /** 检测 Codex 是否正在运行 */
  CHECK_CODEX_RUNNING: 'tool-check-codex-running',
  /** 杀掉所有 Codex 进程 */
  KILL_CODEX: 'tool-kill-codex'
} as const

/**
 * Codex 供应商配置相关 channel
 */
export const CODEX_CHANNELS = {
  /** 读取 Codex 配置 */
  GET_CODEX_CONFIG: 'codex-get-config',
  /** 保存 Codex 配置 */
  SAVE_CODEX_CONFIG: 'codex-save-config',
  /** 获取所有 Codex 供应商配置 */
  GET_ALL_CODEX_VENDORS: 'codex-get-all-vendors',
  /** 添加 Codex 供应商配置 */
  ADD_CODEX_VENDOR: 'codex-add-vendor',
  /** 删除 Codex 供应商配置 */
  DELETE_CODEX_VENDOR: 'codex-delete-vendor',
  /** 更新 Codex 供应商配置 */
  UPDATE_CODEX_VENDOR: 'codex-update-vendor',
  /** 激活 Codex 供应商配置 */
  ACTIVATE_CODEX_VENDOR: 'codex-activate-vendor',
  /** 获取当前激活的 Codex 供应商 ID */
  GET_ACTIVE_CODEX_VENDOR_ID: 'codex-get-active-vendor-id'
} as const

/**
 * 所有 IPC channels 的联合类型
 */
export type IpcChannel =
  | (typeof WINDOW_CHANNELS)[keyof typeof WINDOW_CHANNELS]
  | (typeof APP_CHANNELS)[keyof typeof APP_CHANNELS]
  | (typeof VENDOR_CHANNELS)[keyof typeof VENDOR_CHANNELS]
  | (typeof TOOL_CHANNELS)[keyof typeof TOOL_CHANNELS]
  | (typeof CODEX_CHANNELS)[keyof typeof CODEX_CHANNELS]
