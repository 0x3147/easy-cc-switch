import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
            {t('toolInstall.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('toolInstall.installed')}
          </Typography>
        </Box>
      </Box>

      <Alert severity="success" icon={<FontAwesomeIcon icon={faCheckCircle} />} sx={{ mb: 3 }}>
        <AlertTitle sx={{ fontWeight: 600 }}>{t('toolInstall.installed')}</AlertTitle>
        {t('toolInstall.installedDesc')}
      </Alert>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            {t('toolInstall.installInfo')}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t('toolInstall.installLocation')}
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50'),
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  wordBreak: 'break-all',
                  overflowWrap: 'break-word',
                  maxWidth: '100%'
                }}
              >
                {installPath}
              </Paper>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t('toolInstall.platform')}
              </Typography>
              <Chip label={getPlatformLabel()} color="primary" size="small" />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            {t('toolInstall.uninstall')}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Alert severity="warning" sx={{ mb: 2 }}>
            {t('toolInstall.uninstallWarning')}
          </Alert>
          <Button
            variant="outlined"
            color="error"
            startIcon={<FontAwesomeIcon icon={faTrash} />}
            onClick={handleUninstallClick}
          >
            {t('toolInstall.uninstallButton')}
          </Button>
        </CardContent>
      </Card>

      {/* 卸载确认对话框 */}
      <Dialog open={uninstallDialogOpen} onClose={handleUninstallCancel}>
        <DialogTitle>{t('toolInstall.confirmUninstall')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('toolInstall.confirmUninstallDesc')}</DialogContentText>
          {uninstallError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {uninstallError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUninstallCancel} disabled={uninstalling}>
            {t('toolInstall.cancel')}
          </Button>
          <Button
            onClick={handleUninstallConfirm}
            color="error"
            variant="contained"
            disabled={uninstalling}
            startIcon={uninstalling ? <CircularProgress size={16} /> : null}
          >
            {uninstalling ? t('toolInstall.uninstalling') : t('toolInstall.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default InstalledStatus
