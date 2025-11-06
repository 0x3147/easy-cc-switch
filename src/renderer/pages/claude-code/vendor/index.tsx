import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Stack,
  Alert,
  Snackbar,
  Fab,
  Paper,
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faInbox } from '@fortawesome/free-solid-svg-icons'
import VendorCard from './components/vendor-card'
import VendorConfigDialog from './components/vendor-config-dialog'
import AddVendorDialog from './components/add-vendor-dialog'
import type { VendorConfig } from '@/shared/types/vendor'

const VendorPage = () => {
  const [vendors, setVendors] = useState<VendorConfig[]>([])
  const [activeVendorId, setActiveVendorId] = useState<string | null>(null)
  const [editingVendor, setEditingVendor] = useState<VendorConfig | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  })

  // 初始化加载数据
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // 加载所有供应商配置
      const allVendors = await window.api.getAllVendors()
      setVendors(allVendors)

      // 如果 store 为空，尝试从 .claude/settings.json 导入默认配置
      if (allVendors.length === 0) {
        const claudeConfig = await window.api.getClaudeConfig()
        if (claudeConfig) {
          // 将默认配置添加到 store 并立即激活
          await window.api.addVendor({
            config: claudeConfig,
            applyImmediately: true, // 立即激活，这样会同时保存激活状态
          })
          // 重新加载
          const updatedVendors = await window.api.getAllVendors()
          setVendors(updatedVendors)
          setActiveVendorId(claudeConfig.id)
        }
      } else {
        // 从 store 中恢复激活状态
        const activeId = await window.api.getActiveVendorId()
        setActiveVendorId(activeId)
      }
    } catch (error) {
      console.error('加载数据失败:', error)
    }
  }

  const handleAdd = async (config: VendorConfig, applyImmediately: boolean) => {
    try {
      const success = await window.api.addVendor({ config, applyImmediately })
      if (success) {
        setSnackbar({
          open: true,
          message: applyImmediately ? '添加成功并已生效！' : '添加成功！',
          severity: 'success',
        })
        if (applyImmediately) {
          setActiveVendorId(config.id)
        }
        await loadData()
      } else {
        setSnackbar({
          open: true,
          message: '添加失败，请重试',
          severity: 'error',
        })
      }
    } catch (error) {
      console.error('添加供应商失败:', error)
      setSnackbar({
        open: true,
        message: '添加失败',
        severity: 'error',
      })
    }
  }

  const handleEdit = (vendor: VendorConfig) => {
    setEditingVendor(vendor)
    setEditDialogOpen(true)
  }

  const handleUpdate = async (config: VendorConfig) => {
    try {
      const success = await window.api.updateVendor(config.id, config)

      if (success) {
        setSnackbar({
          open: true,
          message: '更新成功！',
          severity: 'success',
        })
        await loadData()
        setEditDialogOpen(false)
      } else {
        setSnackbar({
          open: true,
          message: '更新失败，请重试',
          severity: 'error',
        })
      }
    } catch (error) {
      console.error('更新供应商失败:', error)
      setSnackbar({
        open: true,
        message: '更新失败',
        severity: 'error',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个供应商配置吗？')) {
      return
    }

    try {
      const success = await window.api.deleteVendor(id)
      if (success) {
        setSnackbar({
          open: true,
          message: '删除成功！',
          severity: 'success',
        })
        await loadData()
      } else {
        setSnackbar({
          open: true,
          message: '删除失败，请重试',
          severity: 'error',
        })
      }
    } catch (error) {
      console.error('删除供应商失败:', error)
      setSnackbar({
        open: true,
        message: '删除失败',
        severity: 'error',
      })
    }
  }

  const handleActivate = async (id: string) => {
    try {
      const success = await window.api.activateVendor(id)
      if (success) {
        setSnackbar({
          open: true,
          message: '已切换供应商！',
          severity: 'success',
        })
        setActiveVendorId(id)
      } else {
        setSnackbar({
          open: true,
          message: '切换失败，请重试',
          severity: 'error',
        })
      }
    } catch (error) {
      console.error('切换供应商失败:', error)
      setSnackbar({
        open: true,
        message: '切换失败',
        severity: 'error',
      })
    }
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* 标题和添加按钮 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 1,
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
            Claude Code供应商配置
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            配置不同的 Claude Code API 供应商，切换使用不同的服务
          </Typography>
        </Box>

        {/* 添加按钮 */}
        <Fab
          color="primary"
          aria-label="add"
          size="medium"
          onClick={() => setAddDialogOpen(true)}
        >
          <FontAwesomeIcon icon={faPlus} />
        </Fab>
      </Box>

      <Stack spacing={2}>
        {/* 供应商卡片列表 */}
        {vendors.length > 0 ? (
          vendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              isActive={activeVendorId === vendor.id}
              onEdit={() => handleEdit(vendor)}
              onSetActive={() => handleActivate(vendor.id)}
              onDelete={() => handleDelete(vendor.id)}
            />
          ))
        ) : (
          // 空状态显示
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              backgroundColor: 'background.paper',
              borderRadius: 2,
              border: '2px dashed',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ mb: 2 }}>
              <FontAwesomeIcon
                icon={faInbox}
                style={{ fontSize: '64px', color: '#bdbdbd', opacity: 0.6 }}
              />
            </Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              暂无供应商配置
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              点击右上角的 + 按钮添加您的第一个供应商配置
            </Typography>
          </Paper>
        )}
      </Stack>

      {/* 添加供应商对话框 */}
      <AddVendorDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAdd={handleAdd}
      />

      {/* 编辑供应商对话框 */}
      <VendorConfigDialog
        open={editDialogOpen}
        vendorName={editingVendor?.name || ''}
        config={editingVendor || null}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleUpdate}
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
