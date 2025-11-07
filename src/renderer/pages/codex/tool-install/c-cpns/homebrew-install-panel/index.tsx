import { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Stack,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Link,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheckCircle,
  faExclamationTriangle,
  faCoffee,
  faChevronDown,
  faDownload
} from '@fortawesome/free-solid-svg-icons'

interface EnvironmentStatus {
  homebrew: { installed: boolean; version?: string; path?: string }
}

interface HomebrewInstallPanelProps {
  environment: EnvironmentStatus
  isRecommended: boolean
  installCommand: string
  onInstallSuccess: () => void
}

const HomebrewInstallPanel = ({
  environment,
  isRecommended,
  installCommand,
  onInstallSuccess
}: HomebrewInstallPanelProps) => {
  const [installing, setInstalling] = useState(false)
  const [installDialogOpen, setInstallDialogOpen] = useState(false)
  const [installResult, setInstallResult] = useState<{
    success: boolean
    message: string
    output?: string
  } | null>(null)
  const [installingDependency, setInstallingDependency] = useState<'homebrew' | 'codex' | null>(
    null
  )

  const handleInstallCodex = async () => {
    setInstallingDependency('codex')
    setInstallDialogOpen(true)
    setInstalling(true)
    setInstallResult(null)

    try {
      const result = await window.api.installCodexHomebrew()
      setInstallResult(result)

      if (result.success) {
        // 安装成功后等待 2 秒再关闭对话框并重新检测
        setTimeout(() => {
          setInstallDialogOpen(false)
          onInstallSuccess()
        }, 2000)
      }
    } catch (error) {
      setInstallResult({
        success: false,
        message: `安装失败：${error instanceof Error ? error.message : '未知错误'}`
      })
    } finally {
      setInstalling(false)
    }
  }

  const handleInstallHomebrew = async () => {
    setInstallingDependency('homebrew')
    setInstallDialogOpen(true)
    setInstalling(true)
    setInstallResult(null)

    try {
      const result = await window.api.installHomebrew()
      setInstallResult(result)

      if (result.success) {
        // Homebrew 安装成功后等待 2 秒再关闭对话框并重新检测
        setTimeout(() => {
          setInstallDialogOpen(false)
          onInstallSuccess()
        }, 2000)
      }
    } catch (error) {
      setInstallResult({
        success: false,
        message: `安装失败：${error instanceof Error ? error.message : '未知错误'}`
      })
    } finally {
      setInstalling(false)
    }
  }

  const handleCloseDialog = () => {
    if (!installing) {
      setInstallDialogOpen(false)
      setInstallResult(null)
      setInstallingDependency(null)
    }
  }

  return (
    <>
      <Accordion
        defaultExpanded={isRecommended}
        sx={{ border: isRecommended ? '2px solid #1976d2' : '1px solid #e0e0e0' }}
      >
        <AccordionSummary expandIcon={<FontAwesomeIcon icon={faChevronDown} />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <FontAwesomeIcon icon={faCoffee} />
            <Typography sx={{ fontWeight: 600 }}>使用 Homebrew 安装</Typography>
            {isRecommended && (
              <Chip label="推荐" color="primary" size="small" sx={{ ml: 'auto', mr: 2 }} />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            {environment.homebrew.installed ? (
              <>
                <Alert severity="success" icon={<FontAwesomeIcon icon={faCheckCircle} />}>
                  检测到 Homebrew，可以直接使用它安装 Codex。
                </Alert>
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ fontWeight: 500 }}
                  >
                    方式 1: 一键安装（推荐）
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<FontAwesomeIcon icon={faDownload} />}
                    onClick={handleInstallCodex}
                    fullWidth
                  >
                    一键安装 Codex
                  </Button>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ fontWeight: 500 }}
                  >
                    方式 2: 手动执行命令
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      bgcolor: 'grey.900',
                      color: 'common.white',
                      fontFamily: 'monospace',
                      fontSize: '14px'
                    }}
                  >
                    <code>{installCommand}</code>
                  </Paper>
                </Box>
              </>
            ) : (
              <>
                <Alert severity="warning" icon={<FontAwesomeIcon icon={faExclamationTriangle} />}>
                  需要先安装 Homebrew。
                </Alert>
                <Typography variant="body2" gutterBottom>
                  Homebrew 是 macOS 上最流行的包管理器，可以方便地安装和管理各种软件。
                </Typography>
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ fontWeight: 500 }}
                  >
                    方式 1: 一键安装 Homebrew（推荐）
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<FontAwesomeIcon icon={faDownload} />}
                    onClick={handleInstallHomebrew}
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    一键安装 Homebrew
                  </Button>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ fontWeight: 500 }}
                  >
                    方式 2: 手动安装 Homebrew
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      bgcolor: 'grey.900',
                      color: 'common.white',
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      mb: 1
                    }}
                  >
                    <code>
                      /bin/bash -c "$(curl -fsSL
                      https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
                    </code>
                  </Paper>
                  <Link
                    href="https://brew.sh/"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ fontSize: '0.875rem' }}
                  >
                    查看 Homebrew 官方网站 →
                  </Link>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ fontWeight: 500 }}
                  >
                    安装完成后，再执行:
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      bgcolor: 'grey.900',
                      color: 'common.white',
                      fontFamily: 'monospace',
                      fontSize: '14px'
                    }}
                  >
                    <code>{installCommand}</code>
                  </Paper>
                </Box>
              </>
            )}
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* 安装进度对话框 */}
      <Dialog open={installDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {installingDependency === 'codex' ? '安装 Codex' : '安装 Homebrew'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {installing && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={24} />
                <Typography>正在安装，请稍候...</Typography>
              </Box>
            )}
            {installResult && (
              <Alert severity={installResult.success ? 'success' : 'error'}>
                {installResult.message}
              </Alert>
            )}
            {installResult?.output && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  安装日志:
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: 'grey.900',
                    color: 'common.white',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    maxHeight: '300px',
                    overflow: 'auto'
                  }}
                >
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {installResult.output}
                  </pre>
                </Paper>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={installing}>
            {installing ? '安装中...' : '关闭'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default HomebrewInstallPanel
