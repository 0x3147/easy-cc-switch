import type { CodexVendorConfig } from '@/shared/types/codex'

/**
 * Codex 供应商配置存储
 * 用于管理用户添加的多个 Codex 供应商配置
 */
class CodexVendorStore {
  private vendors: CodexVendorConfig[] = []
  private activeVendorId: string | null = null

  /**
   * 获取所有供应商配置
   */
  getAllVendors(): CodexVendorConfig[] {
    return [...this.vendors]
  }

  /**
   * 添加供应商配置
   */
  addVendor(config: CodexVendorConfig): boolean {
    try {
      // 检查 ID 是否已存在
      if (this.vendors.some((v) => v.id === config.id)) {
        console.warn(`供应商 ID ${config.id} 已存在`)
        return false
      }

      this.vendors.push(config)
      return true
    } catch (error) {
      console.error('添加供应商配置失败:', error)
      return false
    }
  }

  /**
   * 删除供应商配置
   */
  deleteVendor(id: string): boolean {
    try {
      const index = this.vendors.findIndex((v) => v.id === id)
      if (index === -1) {
        return false
      }

      this.vendors.splice(index, 1)

      // 如果删除的是当前激活的供应商，清除激活状态
      if (this.activeVendorId === id) {
        this.activeVendorId = null
      }

      return true
    } catch (error) {
      console.error('删除供应商配置失败:', error)
      return false
    }
  }

  /**
   * 更新供应商配置
   */
  updateVendor(id: string, updates: Partial<CodexVendorConfig>): boolean {
    try {
      const vendor = this.vendors.find((v) => v.id === id)
      if (!vendor) {
        return false
      }

      Object.assign(vendor, updates)
      return true
    } catch (error) {
      console.error('更新供应商配置失败:', error)
      return false
    }
  }

  /**
   * 设置激活的供应商 ID
   */
  setActiveVendorId(id: string | null): void {
    this.activeVendorId = id
  }

  /**
   * 获取激活的供应商 ID
   */
  getActiveVendorId(): string | null {
    return this.activeVendorId
  }
}

// 导出单例
export const codexVendorStore = new CodexVendorStore()
