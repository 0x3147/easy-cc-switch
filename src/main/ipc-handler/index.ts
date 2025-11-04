import { registerWindowHandler } from './window-handler'

/**
 * 注册所有 IPC 事件处理器
 */
export function registerAllHandlers() {
  // 注册窗口控制处理器
  registerWindowHandler()

  // 未来可以在这里注册更多的 handler
  // registerAppHandler()
  // registerFileHandler()
  // registerDatabaseHandler()
  // ...
}
