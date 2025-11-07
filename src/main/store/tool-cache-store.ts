import Store from 'electron-store'
import type { ClaudeCodeCheckResult, CodexCheckResult } from '@/shared/types/tool'

/**
 * 工具缓存数据结构
 */
interface ToolCacheSchema {
  /** Claude Code 安装状态缓存 */
  claudeCode: {
    /** 检测结果 */
    result: ClaudeCodeCheckResult
    /** 最后检测时间戳 */
    lastChecked: number
  } | null
  /** Codex 安装状态缓存 */
  codex: {
    /** 检测结果 */
    result: CodexCheckResult
    /** 最后检测时间戳 */
    lastChecked: number
  } | null
}

/**
 * 工具状态缓存 Store
 * 用于缓存工具的安装状态，减少重复检测
 */
class ToolCacheStore {
  private store: Store<ToolCacheSchema>
  // 缓存有效期：5分钟
  private readonly CACHE_VALIDITY = 5 * 60 * 1000

  constructor() {
    this.store = new Store<ToolCacheSchema>({
      name: 'tool-cache',
      defaults: {
        claudeCode: null,
        codex: null
      }
    })
  }

  /**
   * 获取 Claude Code 缓存
   */
  getClaudeCodeCache(): ClaudeCodeCheckResult | null {
    const cache = this.store.get('claudeCode')
    if (!cache) return null

    // 检查缓存是否过期
    if (Date.now() - cache.lastChecked > this.CACHE_VALIDITY) {
      return null
    }

    return cache.result
  }

  /**
   * 设置 Claude Code 缓存
   */
  setClaudeCodeCache(result: ClaudeCodeCheckResult): void {
    this.store.set('claudeCode', {
      result,
      lastChecked: Date.now()
    })
  }

  /**
   * 清除 Claude Code 缓存
   */
  clearClaudeCodeCache(): void {
    this.store.set('claudeCode', null)
  }

  /**
   * 获取 Codex 缓存
   */
  getCodexCache(): CodexCheckResult | null {
    const cache = this.store.get('codex')
    if (!cache) return null

    // 检查缓存是否过期
    if (Date.now() - cache.lastChecked > this.CACHE_VALIDITY) {
      return null
    }

    return cache.result
  }

  /**
   * 设置 Codex 缓存
   */
  setCodexCache(result: CodexCheckResult): void {
    this.store.set('codex', {
      result,
      lastChecked: Date.now()
    })
  }

  /**
   * 清除 Codex 缓存
   */
  clearCodexCache(): void {
    this.store.set('codex', null)
  }

  /**
   * 清除所有缓存
   */
  clearAllCache(): void {
    this.clearClaudeCodeCache()
    this.clearCodexCache()
  }
}

// 导出单例
export const toolCacheStore = new ToolCacheStore()
