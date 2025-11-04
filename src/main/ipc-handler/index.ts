import { registerWindowHandler } from './window-handler'
import { registerVendorHandler } from './vendor-handler'

/**
 * 注册所有 IPC 事件处理器
 */
export function registerAllHandlers() {
  // 注册窗口控制处理器
  registerWindowHandler()

  // 注册供应商配置处理器
  registerVendorHandler()

  // 未来可以在这里注册更多的 handler
  // registerAppHandler()
  // registerFileHandler()
  // registerDatabaseHandler()
  // ...
}
