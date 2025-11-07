import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  Stack,
  Alert,
  Snackbar,
  Fab,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faInbox } from '@fortawesome/free-solid-svg-icons'
import VendorCard from './components/vendor-card'
import VendorConfigDialog from './components/vendor-config-dialog'
import AddVendorDialog from './components/add-vendor-dialog'
import type { VendorConfig } from '@/shared/types/vendor'

const VendorPage = () => {
  const { t } = useTranslation()
  const [vendors, setVendors] = useState<VendorConfig[]>([])
  const [activeVendorId, setActiveVendorId] = useState<string | null>(null)
  const [editingVendor, setEditingVendor] = useState<VendorConfig | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })
  const [killProcessDialog, setKillProcessDialog] = useState({
    open: false,
    isProcessing: false,
    pendingAction: null as (() => Promise<void>) | null
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
            applyImmediately: true // 立即激活，这样会同时保存激活状态
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

  // 检查并提示用户是否需要杀掉进程
  const checkAndPromptKillProcess = async () => {
    const isRunning = await window.api.checkClaudeCodeRunning()
    if (isRunning) {
      setKillProcessDialog({
        open: true,
        isProcessing: false,
        pendingAction: null
      })
    }
  }

  // 执行杀进程操作
  const handleKillProcess = async () => {
    setKillProcessDialog((prev) => ({ ...prev, isProcessing: true }))
    try {
      const success = await window.api.killClaudeCode()
      if (success) {
        setSnackbar({
          open: true,
          message: t('vendor.killSuccess'),
          severity: 'success'
        })
      } else {
        setSnackbar({
          open: true,
          message: t('vendor.killFailed'),
          severity: 'error'
        })
      }
    } catch (error) {
      console.error('终止进程失败:', error)
      setSnackbar({
        open: true,
        message: t('vendor.killFailed'),
        severity: 'error'
      })
    } finally {
      setKillProcessDialog({
        open: false,
        isProcessing: false,
        pendingAction: null
      })
    }
  }

  const handleAdd = async (config: VendorConfig, applyImmediately: boolean) => {
    try {
      const success = await window.api.addVendor({ config, applyImmediately })
      if (success) {
        setSnackbar({
          open: true,
          message: applyImmediately ? t('vendor.addSuccessAndActive') : t('vendor.addSuccess'),
          severity: 'success'
        })
        if (applyImmediately) {
          setActiveVendorId(config.id)
          // 如果立即生效，提示用户是否需要重启进程
          await checkAndPromptKillProcess()
        }
        await loadData()
      } else {
        setSnackbar({
          open: true,
          message: t('vendor.operationFailed'),
          severity: 'error'
        })
      }
    } catch (error) {
      console.error('添加供应商失败:', error)
      setSnackbar({
        open: true,
        message: t('vendor.operationFailed'),
        severity: 'error'
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
          message: t('vendor.updateSuccess'),
          severity: 'success'
        })
        await loadData()
        setEditDialogOpen(false)

        // 如果更新的是当前激活的配置，提示重启进程
        if (config.id === activeVendorId) {
          await checkAndPromptKillProcess()
        }
      } else {
        setSnackbar({
          open: true,
          message: t('vendor.operationFailed'),
          severity: 'error'
        })
      }
    } catch (error) {
      console.error('更新供应商失败:', error)
      setSnackbar({
        open: true,
        message: t('vendor.operationFailed'),
        severity: 'error'
      })
    }
  }

  const handleDelete = async (id: string) => {
    // 检查是否为当前激活的配置
    if (id === activeVendorId) {
      setSnackbar({
        open: true,
        message: t('vendor.cannotDeleteActive'),
        severity: 'error'
      })
      return
    }

    if (!confirm(t('vendor.confirmDelete'))) {
      return
    }

    try {
      const success = await window.api.deleteVendor(id)
      if (success) {
        setSnackbar({
          open: true,
          message: t('vendor.deleteSuccess'),
          severity: 'success'
        })
        await loadData()
      } else {
        setSnackbar({
          open: true,
          message: t('vendor.operationFailed'),
          severity: 'error'
        })
      }
    } catch (error) {
      console.error('删除供应商失败:', error)
      setSnackbar({
        open: true,
        message: t('vendor.operationFailed'),
        severity: 'error'
      })
    }
  }

  const handleActivate = async (id: string) => {
    try {
      const success = await window.api.activateVendor(id)
      if (success) {
        setSnackbar({
          open: true,
          message: t('vendor.activateSuccess'),
          severity: 'success'
        })
        setActiveVendorId(id)
        // 切换供应商后提示重启进程
        await checkAndPromptKillProcess()
      } else {
        setSnackbar({
          open: true,
          message: t('vendor.operationFailed'),
          severity: 'error'
        })
      }
    } catch (error) {
      console.error('切换供应商失败:', error)
      setSnackbar({
        open: true,
        message: t('vendor.operationFailed'),
        severity: 'error'
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
          mb: 1
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
            {t('vendor.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {t('vendor.description')}
          </Typography>
        </Box>

        {/* 添加按钮 */}
        <Fab color="primary" aria-label="add" size="medium" onClick={() => setAddDialogOpen(true)}>
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
              borderColor: 'divider'
            }}
          >
            <Box sx={{ mb: 2 }}>
              <FontAwesomeIcon
                icon={faInbox}
                style={{ fontSize: '64px', color: '#bdbdbd', opacity: 0.6 }}
              />
            </Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t('vendor.noVendors')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('vendor.noVendorsDesc')}
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

      {/* 进程终止提示对话框 */}
      <Dialog
        open={killProcessDialog.open}
        onClose={() =>
          !killProcessDialog.isProcessing &&
          setKillProcessDialog({ ...killProcessDialog, open: false })
        }
      >
        <DialogTitle>{t('vendor.killProcessTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('vendor.killProcessMessage')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setKillProcessDialog({ ...killProcessDialog, open: false })}
            disabled={killProcessDialog.isProcessing}
          >
            {t('vendor.killProcessCancel')}
          </Button>
          <Button
            onClick={handleKillProcess}
            variant="contained"
            color="primary"
            disabled={killProcessDialog.isProcessing}
            startIcon={killProcessDialog.isProcessing ? <CircularProgress size={20} /> : null}
          >
            {killProcessDialog.isProcessing
              ? t('vendor.killProcessing')
              : t('vendor.killProcessConfirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default VendorPage
