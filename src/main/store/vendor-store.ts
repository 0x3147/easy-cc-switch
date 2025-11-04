import Store from 'electron-store'
import type { VendorConfig } from '@/shared/types/vendor'

/**
 * Store 数据结构
 */
interface StoreSchema {
  vendors: VendorConfig[]
  activeVendorId: string | null
}

/**
 * 供应商配置 Store
 */
class VendorStore {
  private store: Store<StoreSchema>

  constructor() {
    this.store = new Store<StoreSchema>({
      name: 'vendor-configs',
      defaults: {
        vendors: [],
        activeVendorId: null
      }
    })
  }

  /**
   * 获取所有供应商配置
   */
  getAllVendors(): VendorConfig[] {
    return this.store.get('vendors', [])
  }

  /**
   * 添加供应商配置
   */
  addVendor(vendor: VendorConfig): void {
    const vendors = this.getAllVendors()
    vendors.push(vendor)
    this.store.set('vendors', vendors)
  }

  /**
   * 更新供应商配置
   */
  updateVendor(id: string, updates: Partial<VendorConfig>): boolean {
    const vendors = this.getAllVendors()
    const index = vendors.findIndex((v) => v.id === id)
    if (index === -1) return false

    vendors[index] = { ...vendors[index], ...updates }
    this.store.set('vendors', vendors)
    return true
  }

  /**
   * 删除供应商配置
   */
  deleteVendor(id: string): boolean {
    const vendors = this.getAllVendors()
    const newVendors = vendors.filter((v) => v.id !== id)
    if (newVendors.length === vendors.length) return false

    this.store.set('vendors', newVendors)

    // 如果删除的是激活的供应商，清除激活状态
    if (this.getActiveVendorId() === id) {
      this.setActiveVendorId(null)
    }
    return true
  }

  /**
   * 获取当前激活的供应商 ID
   */
  getActiveVendorId(): string | null {
    return this.store.get('activeVendorId', null)
  }

  /**
   * 设置激活的供应商 ID
   */
  setActiveVendorId(id: string | null): void {
    this.store.set('activeVendorId', id)
  }

  /**
   * 获取激活的供应商配置
   */
  getActiveVendor(): VendorConfig | null {
    const activeId = this.getActiveVendorId()
    if (!activeId) return null

    const vendors = this.getAllVendors()
    return vendors.find((v) => v.id === activeId) || null
  }
}

// 导出单例
export const vendorStore = new VendorStore()
