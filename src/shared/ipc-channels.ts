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
 * 所有 IPC channels 的联合类型
 */
export type IpcChannel =
  | (typeof WINDOW_CHANNELS)[keyof typeof WINDOW_CHANNELS]
  | (typeof APP_CHANNELS)[keyof typeof APP_CHANNELS]
