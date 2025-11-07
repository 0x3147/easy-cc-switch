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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
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
  faTerminal,
  faChevronDown,
  faDownload
} from '@fortawesome/free-solid-svg-icons'

interface EnvironmentStatus {
  nodejs: { installed: boolean; version?: string; majorVersion?: number; path?: string }
  nvm: { installed: boolean; version?: string; path?: string }
}

interface NpmInstallPanelProps {
  environment: EnvironmentStatus
  isRecommended: boolean
  installCommand: string
  onInstallSuccess: () => void
}

const NpmInstallPanel = ({
  environment,
  isRecommended,
  installCommand,
  onInstallSuccess
}: NpmInstallPanelProps) => {
  const [installing, setInstalling] = useState(false)
  const [installDialogOpen, setInstallDialogOpen] = useState(false)
  const [installResult, setInstallResult] = useState<{
    success: boolean
    message: string
    output?: string
  } | null>(null)
  const [installingDependency, setInstallingDependency] = useState<'nvm' | 'codex' | null>(null)

  const nodeVersionValid =
    environment.nodejs.installed &&
    environment.nodejs.majorVersion !== undefined &&
    environment.nodejs.majorVersion >= 18

  const handleInstallCodex = async () => {
    setInstallingDependency('codex')
    setInstallDialogOpen(true)
    setInstalling(true)
    setInstallResult(null)

    try {
      const result = await window.api.installCodexNpm()
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

  const handleInstallNvm = async () => {
    setInstallingDependency('nvm')
    setInstallDialogOpen(true)
    setInstalling(true)
    setInstallResult(null)

    try {
      const result = await window.api.installNvm()
      setInstallResult(result)

      if (result.success) {
        // NVM 安装成功后需要用户重启终端，不自动刷新
        // 用户需要手动点击重新检测
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
        sx={{ mb: 2, border: isRecommended ? '2px solid #1976d2' : '1px solid #e0e0e0' }}
      >
        <AccordionSummary expandIcon={<FontAwesomeIcon icon={faChevronDown} />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <FontAwesomeIcon icon={faTerminal} />
            <Typography sx={{ fontWeight: 600 }}>使用 npm 安装</Typography>
            {isRecommended && (
              <Chip label="推荐" color="primary" size="small" sx={{ ml: 'auto', mr: 2 }} />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            {nodeVersionValid ? (
              <>
                <Alert severity="success" icon={<FontAwesomeIcon icon={faCheckCircle} />}>
                  检测到符合要求的 Node.js 版本，可以直接使用 npm 安装。
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
                  需要先安装 Node.js v18 或更高版本。
                </Alert>
                <Typography variant="body2" gutterBottom sx={{ fontWeight: 500 }}>
                  安装 Node.js 的方式:
                </Typography>
                <List dense>
                  {environment.nvm.installed ? (
                    <>
                      <ListItem>
                        <ListItemIcon>
                          <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#4caf50' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="使用 NVM 安装 Node.js (推荐)"
                          secondary="已检测到 NVM，可以使用它管理 Node.js 版本"
                        />
                      </ListItem>
                      <Box sx={{ pl: 4, pr: 2, pb: 2 }}>
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
                            # 安装最新 LTS 版本{'\n'}
                            nvm install --lts{'\n'}
                            {'\n'}
                            # 使用已安装的 LTS 版本{'\n'}
                            nvm use --lts{'\n'}
                            {'\n'}
                            # 然后安装 Codex{'\n'}
                            {installCommand}
                          </code>
                        </Paper>
                        <Typography variant="caption" color="text.secondary">
                          安装完成后请点击页面底部的"重新检测"按钮
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <>
                      <ListItem>
                        <ListItemIcon>
                          <Typography>1.</Typography>
                        </ListItemIcon>
                        <ListItemText primary="安装 NVM (Node 版本管理器，推荐)" />
                      </ListItem>
                      <Box sx={{ pl: 4, pr: 2, pb: 2 }}>
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<FontAwesomeIcon icon={faDownload} />}
                          onClick={handleInstallNvm}
                          fullWidth
                          sx={{ mb: 1 }}
                        >
                          一键安装 NVM
                        </Button>
                        <Link
                          href="https://github.com/nvm-sh/nvm#installing-and-updating"
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ fontSize: '0.875rem' }}
                        >
                          查看 NVM 安装指南 →
                        </Link>
                      </Box>
                      <ListItem>
                        <ListItemIcon>
                          <Typography>2.</Typography>
                        </ListItemIcon>
                        <ListItemText
                          primary="直接安装 Node.js LTS 版本"
                          secondary={
                            <Link
                              href="https://nodejs.org/"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              访问 Node.js 官网下载 →
                            </Link>
                          }
                        />
                      </ListItem>
                    </>
                  )}
                </List>
              </>
            )}
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* 安装进度对话框 */}
      <Dialog open={installDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {installingDependency === 'codex' ? '安装 Codex' : '安装 NVM'}
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

export default NpmInstallPanel
