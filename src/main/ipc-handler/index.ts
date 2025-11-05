import { registerWindowHandler } from './window-handler'
import { registerVendorHandler } from './vendor-handler'
import { registerToolHandlers } from './tool-handler'

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

  // 未来可以在这里注册更多的 handler
  // registerAppHandler()
  // registerFileHandler()
  // registerDatabaseHandler()
  // ...
}
