import { useState, useEffect } from 'react'
import { Box, Typography, Stack, Alert, Snackbar } from '@mui/material'
import VendorCard from './components/vendor-card'
import VendorConfigDialog from './components/vendor-config-dialog'
import type { VendorInfo, VendorConfig } from '../../../shared/types/vendor'

const VendorPage = () => {
  const [vendors, setVendors] = useState<VendorInfo[]>([
    {
      id: 'anthropic',
      name: 'Anthropic',
      logo: 'https://www.anthropic.com/images/icons/safari-pinned-tab.svg',
      defaultUrl: 'https://api.anthropic.com'
    },
    {
      id: 'custom',
      name: '自定义供应商',
      logo: '',
      defaultUrl: 'https://'
    }
  ])
  const [activeVendorId, setActiveVendorId] = useState<string>('anthropic')
  const [editingVendor, setEditingVendor] = useState<VendorInfo | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })

  // 加载 Claude 配置
  useEffect(() => {
    loadClaudeConfig()
  }, [])

  const loadClaudeConfig = async () => {
    try {
      const config = await window.api.getClaudeConfig()
      if (config) {
        setVendors((prev) => prev.map((v) => (v.id === 'anthropic' ? { ...v, config } : v)))
      }
    } catch (error) {
      console.error('加载配置失败:', error)
    }
  }

  const handleEdit = (vendor: VendorInfo) => {
    setEditingVendor(vendor)
    setDialogOpen(true)
  }

  const handleSave = async (config: VendorConfig) => {
    try {
      const success = await window.api.saveClaudeConfig(config)
      if (success) {
        // 更新本地状态
        setVendors((prev) => prev.map((v) => (v.id === editingVendor?.id ? { ...v, config } : v)))
        setSnackbar({
          open: true,
          message: '配置保存成功！',
          severity: 'success'
        })
      } else {
        setSnackbar({
          open: true,
          message: '配置保存失败，请重试',
          severity: 'error'
        })
      }
    } catch (error) {
      console.error('保存配置失败:', error)
      setSnackbar({
        open: true,
        message: '配置保存失败',
        severity: 'error'
      })
    }
  }

  const handleSetActive = (vendorId: string) => {
    setActiveVendorId(vendorId)
    setSnackbar({
      open: true,
      message: `已切换到 ${vendors.find((v) => v.id === vendorId)?.name}`,
      severity: 'success'
    })
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
        供应商配置
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        配置不同的 API 供应商，切换使用不同的服务
      </Typography>

      <Stack spacing={2}>
        {vendors.map((vendor) => (
          <VendorCard
            key={vendor.id}
            vendor={vendor}
            isActive={activeVendorId === vendor.id}
            onEdit={() => handleEdit(vendor)}
            onSetActive={() => handleSetActive(vendor.id)}
          />
        ))}
      </Stack>

      {/* 编辑对话框 */}
      <VendorConfigDialog
        open={dialogOpen}
        vendorName={editingVendor?.name || ''}
        config={editingVendor?.config || null}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />

      {/* 提示消息 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default VendorPage
