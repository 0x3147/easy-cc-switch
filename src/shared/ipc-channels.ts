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
 * 所有 IPC channels 的联合类型
 */
export type IpcChannel =
  | (typeof WINDOW_CHANNELS)[keyof typeof WINDOW_CHANNELS]
  | (typeof APP_CHANNELS)[keyof typeof APP_CHANNELS]
  | (typeof VENDOR_CHANNELS)[keyof typeof VENDOR_CHANNELS]
