import { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  AlertTitle,
  Paper,
  Chip,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faTrash } from '@fortawesome/free-solid-svg-icons'

type Platform = 'macos' | 'windows' | 'unsupported'

interface InstalledStatusProps {
  platform: Platform
  installPath: string
  onUninstallSuccess: () => void
}

const InstalledStatus = ({ platform, installPath, onUninstallSuccess }: InstalledStatusProps) => {
  const [uninstallDialogOpen, setUninstallDialogOpen] = useState(false)
  const [uninstalling, setUninstalling] = useState(false)
  const [uninstallError, setUninstallError] = useState('')

  const handleUninstallClick = () => {
    setUninstallDialogOpen(true)
    setUninstallError('')
  }

  const handleUninstallConfirm = async () => {
    setUninstalling(true)
    setUninstallError('')

    try {
      const result = await window.api.uninstallClaudeCode()

      if (result.success) {
        setUninstallDialogOpen(false)
        // 通知父组件卸载成功，重新检测
        onUninstallSuccess()
      } else {
        setUninstallError(result.message)
      }
    } catch (error) {
      setUninstallError(`卸载失败：${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setUninstalling(false)
    }
  }

  const handleUninstallCancel = () => {
    setUninstallDialogOpen(false)
    setUninstallError('')
  }

  const getPlatformLabel = () => {
    switch (platform) {
      case 'macos':
        return 'macOS'
      case 'windows':
        return 'Windows'
      default:
        return 'Unknown'
    }
  }

  return (
    <Box>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}
      >
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
            工具安装
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Claude Code 已成功安装
          </Typography>
        </Box>
      </Box>

      <Alert severity="success" icon={<FontAwesomeIcon icon={faCheckCircle} />} sx={{ mb: 3 }}>
        <AlertTitle sx={{ fontWeight: 600 }}>Claude Code 已安装</AlertTitle>
        您的系统已经正确安装 Claude Code，您可以直接使用。
      </Alert>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            安装信息
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                安装位置
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50'),
                  fontFamily: 'monospace'
                }}
              >
                {installPath}
              </Paper>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                平台
              </Typography>
              <Chip label={getPlatformLabel()} color="primary" size="small" />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            卸载 Claude Code
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Alert severity="warning" sx={{ mb: 2 }}>
            卸载 Claude Code 将移除系统中的工具，但不会影响您的配置文件。
          </Alert>
          <Button
            variant="outlined"
            color="error"
            startIcon={<FontAwesomeIcon icon={faTrash} />}
            onClick={handleUninstallClick}
          >
            卸载 Claude Code
          </Button>
        </CardContent>
      </Card>

      {/* 卸载确认对话框 */}
      <Dialog open={uninstallDialogOpen} onClose={handleUninstallCancel}>
        <DialogTitle>确认卸载</DialogTitle>
        <DialogContent>
          <DialogContentText>
            您确定要卸载 Claude Code 吗？此操作将移除系统中的工具，但不会影响您的配置文件。
          </DialogContentText>
          {uninstallError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {uninstallError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUninstallCancel} disabled={uninstalling}>
            取消
          </Button>
          <Button
            onClick={handleUninstallConfirm}
            color="error"
            variant="contained"
            disabled={uninstalling}
            startIcon={uninstalling ? <CircularProgress size={16} /> : null}
          >
            {uninstalling ? '卸载中...' : '确认卸载'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default InstalledStatus
