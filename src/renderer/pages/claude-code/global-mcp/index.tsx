import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Typography, Stack, Alert, Snackbar, Fab, Paper } from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faInbox } from '@fortawesome/free-solid-svg-icons'
import McpCard from './components/mcp-card'
import AddMcpDialog from './components/add-mcp-dialog'
import EditMcpDialog from './components/edit-mcp-dialog'
import type { McpServerItem, McpServerConfig } from '@/shared/types/mcp'

const GlobalMcpPage = () => {
  const { t } = useTranslation()
  const [servers, setServers] = useState<McpServerItem[]>([])
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingServer, setEditingServer] = useState<McpServerItem | null>(null)
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
      const allServers = await window.api.getAllMcpServers()
      setServers(allServers)
    } catch (error) {
      console.error('加载 MCP 服务器配置失败:', error)
      setSnackbar({
        open: true,
        message: t('mcp.loadFailed'),
        severity: 'error'
      })
    }
  }

  const handleAdd = async (name: string, config: McpServerConfig) => {
    try {
      const success = await window.api.addMcpServer(name, config)
      if (success) {
        setSnackbar({
          open: true,
          message: t('mcp.addSuccess'),
          severity: 'success'
        })
        await loadData()
      } else {
        setSnackbar({
          open: true,
          message: t('mcp.addFailed'),
          severity: 'error'
        })
      }
    } catch (error) {
      console.error('添加 MCP 服务器失败:', error)
      setSnackbar({
        open: true,
        message: t('mcp.addFailed'),
        severity: 'error'
      })
    }
  }

  const handleEdit = (server: McpServerItem) => {
    setEditingServer(server)
    setEditDialogOpen(true)
  }

  const handleUpdate = async (oldName: string, newName: string, config: McpServerConfig) => {
    try {
      const success = await window.api.updateMcpServer(oldName, newName, config)
      if (success) {
        setSnackbar({
          open: true,
          message: t('mcp.updateSuccess'),
          severity: 'success'
        })
        await loadData()
        setEditDialogOpen(false)
      } else {
        setSnackbar({
          open: true,
          message: t('mcp.updateFailed'),
          severity: 'error'
        })
      }
    } catch (error) {
      console.error('更新 MCP 服务器失败:', error)
      setSnackbar({
        open: true,
        message: t('mcp.updateFailed'),
        severity: 'error'
      })
    }
  }

  const handleDelete = async (name: string) => {
    if (!confirm(t('mcp.confirmDelete'))) {
      return
    }

    try {
      const success = await window.api.deleteMcpServer(name)
      if (success) {
        setSnackbar({
          open: true,
          message: t('mcp.deleteSuccess'),
          severity: 'success'
        })
        await loadData()
      } else {
        setSnackbar({
          open: true,
          message: t('mcp.deleteFailed'),
          severity: 'error'
        })
      }
    } catch (error) {
      console.error('删除 MCP 服务器失败:', error)
      setSnackbar({
        open: true,
        message: t('mcp.deleteFailed'),
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
            {t('mcp.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {t('mcp.description')}
          </Typography>
        </Box>

        {/* 添加按钮 */}
        <Fab color="primary" aria-label="add" size="medium" onClick={() => setAddDialogOpen(true)}>
          <FontAwesomeIcon icon={faPlus} />
        </Fab>
      </Box>

      <Stack spacing={2}>
        {/* MCP 服务器卡片列表 */}
        {servers.length > 0 ? (
          servers.map((server) => (
            <McpCard
              key={server.name}
              server={server}
              onEdit={() => handleEdit(server)}
              onDelete={() => handleDelete(server.name)}
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
              {t('mcp.noServers')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('mcp.noServersDesc')}
            </Typography>
          </Paper>
        )}
      </Stack>

      {/* 添加 MCP 服务器对话框 */}
      <AddMcpDialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} onAdd={handleAdd} />

      {/* 编辑 MCP 服务器对话框 */}
      <EditMcpDialog
        open={editDialogOpen}
        server={editingServer}
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

export default GlobalMcpPage
