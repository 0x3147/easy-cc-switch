import { execSync } from 'child_process'

/**
 * 修复 macOS 打包后应用的 PATH 环境变量问题
 *
 * 在 macOS 上，打包后的 Electron 应用不会继承完整的 shell PATH，
 * 导致 execSync 等命令无法找到通过 Homebrew、nvm 等安装的工具。
 *
 * 此函数会从用户的 shell 中获取完整的 PATH 并设置到 process.env 中。
 */
export function fixPathEnv(): void {
  // 仅在 macOS 上需要修复
  if (process.platform !== 'darwin') {
    return
  }

  // 如果已经在开发模式或 PATH 已包含常用路径，则跳过
  if (process.env.NODE_ENV === 'development') {
    return
  }

  try {
    // 从用户的 shell 中获取完整的 PATH
    // 使用 login shell 确保加载 ~/.zshrc, ~/.bash_profile 等配置文件
    const shell = process.env.SHELL || '/bin/zsh'
    const result = execSync(`${shell} -ilc 'echo $PATH'`, {
      encoding: 'utf-8',
      timeout: 5000,
      stdio: ['pipe', 'pipe', 'ignore']
    })

    const path = result.trim()

    if (path && path.length > 0) {
      // 合并现有 PATH 和 shell PATH，确保不丢失任何路径
      const currentPath = process.env.PATH || ''
      const pathSet = new Set([
        ...path.split(':'),
        ...currentPath.split(':')
      ])

      // 移除空字符串
      pathSet.delete('')

      process.env.PATH = Array.from(pathSet).join(':')

      console.log('[fix-path] PATH 环境变量已修复')
      console.log('[fix-path] PATH:', process.env.PATH)

      // 同时设置其他重要的环境变量（NVM、Homebrew 等）
      try {
        const envVars = execSync(`${shell} -ilc 'env'`, {
          encoding: 'utf-8',
          timeout: 5000,
          stdio: ['pipe', 'pipe', 'ignore']
        })

        // 提取关键环境变量
        const lines = envVars.split('\n')
        for (const line of lines) {
          if (line.startsWith('NVM_DIR=') ||
              line.startsWith('NVM_BIN=') ||
              line.startsWith('NVM_INC=') ||
              line.startsWith('HOMEBREW_')) {
            const [key, ...valueParts] = line.split('=')
            const value = valueParts.join('=')
            if (key && value) {
              process.env[key] = value
            }
          }
        }
      } catch (envError) {
        console.error('[fix-path] 获取环境变量失败:', envError)
      }
    }
  } catch (error) {
    console.error('[fix-path] 修复 PATH 失败:', error)

    // 即使失败，也添加一些常见路径作为兜底
    const fallbackPaths = [
      '/usr/local/bin',
      '/usr/bin',
      '/bin',
      '/usr/sbin',
      '/sbin',
      '/opt/homebrew/bin', // Apple Silicon Mac
      '/usr/local/opt/node/bin',
      process.env.HOME + '/bin'
    ]

    const currentPath = process.env.PATH || ''
    const pathSet = new Set([
      ...currentPath.split(':'),
      ...fallbackPaths
    ])
    pathSet.delete('')

    process.env.PATH = Array.from(pathSet).join(':')
    console.log('[fix-path] 使用兜底 PATH:', process.env.PATH)
  }
}
