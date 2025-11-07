import { registerWindowHandler } from './window-handler'
import { registerVendorHandler } from './vendor-handler'
import { registerToolHandlers } from './tool-handler'
import { registerCodexHandler } from './codex-handler'
import { registerSettingsHandlers } from './settings-handler'

/**
 * 注册所有 IPC 事件处理器
 */
export function registerAllHandlers() {
  // 注册窗口控制处理器
  registerWindowHandler()

  // 注册供应商配置处理器
  registerVendorHandler()

  // 注册工具安装处理器
  registerToolHandlers()

  // 注册 Codex 供应商配置处理器
  registerCodexHandler()

  // 注册用户设置处理器
  registerSettingsHandlers()

  // 未来可以在这里注册更多的 handler
  // registerAppHandler()
  // registerFileHandler()
  // registerDatabaseHandler()
  // ...
}
