import { useState, useEffect } from 'react'
import { Box, Typography, Stack, Alert, Snackbar, Fab } from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import CodexVendorCard from './components/codex-vendor-card'
import CodexVendorConfigDialog from './components/codex-vendor-config-dialog'
import type { CodexVendorConfig } from '@/shared/types/codex'

const CodexVendorPage = () => {
  const [vendors, setVendors] = useState<CodexVendorConfig[]>([])
  const [activeVendorId, setActiveVendorId] = useState<string | null>(null)
  const [editingVendor, setEditingVendor] = useState<CodexVendorConfig | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })

  // 初始化加载数据
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // 加载所有供应商配置
      const allVendors = await window.api.getAllCodexVendors()
      setVendors(allVendors)

      // 如果 store 为空，尝试从 ~/.codex 导入默认配置
      if (allVendors.length === 0) {
        const codexConfig = await window.api.getCodexConfig()
        if (codexConfig) {
          // 将默认配置添加到 store 并立即激活
          await window.api.addCodexVendor({
            config: codexConfig,
            applyImmediately: true // 立即激活，这样会同时保存激活状态
          })
          // 重新加载
          const updatedVendors = await window.api.getAllCodexVendors()
          setVendors(updatedVendors)
          setActiveVendorId(codexConfig.id)
        }
      } else {
        // 从 store 中恢复激活状态
        const activeId = await window.api.getActiveCodexVendorId()
        setActiveVendorId(activeId)
      }
    } catch (error) {
      console.error('加载数据失败:', error)
    }
  }

  const handleAdd = () => {
    setDialogMode('add')
    setEditingVendor(null)
    setDialogOpen(true)
  }

  const handleEdit = (vendor: CodexVendorConfig) => {
    setDialogMode('edit')
    setEditingVendor(vendor)
    setDialogOpen(true)
  }

  const handleSave = async (config: CodexVendorConfig, applyImmediately: boolean) => {
    try {
      let success = false

      if (dialogMode === 'add') {
        success = await window.api.addCodexVendor({ config, applyImmediately })
        if (success) {
          setSnackbar({
            open: true,
            message: applyImmediately ? '添加成功并已生效！' : '添加成功！',
            severity: 'success'
          })
          if (applyImmediately) {
            setActiveVendorId(config.id)
          }
        }
      } else {
        success = await window.api.updateCodexVendor(config.id, config)
        if (success && applyImmediately) {
          // 如果勾选了立即生效，激活该配置
          success = await window.api.activateCodexVendor(config.id)
          if (success) {
            setActiveVendorId(config.id)
          }
        }
        if (success) {
          setSnackbar({
            open: true,
            message: applyImmediately ? '更新成功并已生效！' : '更新成功！',
            severity: 'success'
          })
        }
      }

      if (success) {
        await loadData()
      } else {
        setSnackbar({
          open: true,
          message: '操作失败，请重试',
          severity: 'error'
        })
      }
    } catch (error) {
      console.error('保存配置失败:', error)
      setSnackbar({
        open: true,
        message: '操作失败',
        severity: 'error'
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个供应商配置吗？')) {
      return
    }

    try {
      const success = await window.api.deleteCodexVendor(id)
      if (success) {
        setSnackbar({
          open: true,
          message: '删除成功！',
          severity: 'success'
        })
        await loadData()
      } else {
        setSnackbar({
          open: true,
          message: '删除失败，请重试',
          severity: 'error'
        })
      }
    } catch (error) {
      console.error('删除供应商失败:', error)
      setSnackbar({
        open: true,
        message: '删除失败',
        severity: 'error'
      })
    }
  }

  const handleActivate = async (id: string) => {
    try {
      const success = await window.api.activateCodexVendor(id)
      if (success) {
        setSnackbar({
          open: true,
          message: '已切换供应商！',
          severity: 'success'
        })
        setActiveVendorId(id)
      } else {
        setSnackbar({
          open: true,
          message: '切换失败，请重试',
          severity: 'error'
        })
      }
    } catch (error) {
      console.error('切换供应商失败:', error)
      setSnackbar({
        open: true,
        message: '切换失败',
        severity: 'error'
      })
    }
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* 标题和添加按钮 */}
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}
      >
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
            Codex 供应商配置
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            配置不同的 Codex API 供应商，切换使用不同的服务
          </Typography>
        </Box>

        {/* 添加按钮 */}
        <Fab color="primary" aria-label="add" size="medium" onClick={handleAdd}>
          <FontAwesomeIcon icon={faPlus} />
        </Fab>
      </Box>

      <Stack spacing={2}>
        {/* 供应商卡片列表 */}
        {vendors.map((vendor) => (
          <CodexVendorCard
            key={vendor.id}
            vendor={vendor}
            isActive={activeVendorId === vendor.id}
            onEdit={() => handleEdit(vendor)}
            onSetActive={() => handleActivate(vendor.id)}
            onDelete={() => handleDelete(vendor.id)}
          />
        ))}
      </Stack>

      {/* 添加/编辑供应商对话框 */}
      <CodexVendorConfigDialog
        open={dialogOpen}
        mode={dialogMode}
        config={editingVendor}
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

export default CodexVendorPage
