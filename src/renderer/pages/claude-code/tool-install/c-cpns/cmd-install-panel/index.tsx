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
  Button,
  CircularProgress,
  AlertTitle
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTerminal,
  faChevronDown,
  faInfoCircle,
  faDownload,
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons'

interface CmdInstallPanelProps {
  isSelected: boolean
  onInstallSuccess?: () => void
}

const CmdInstallPanel = ({ isSelected, onInstallSuccess }: CmdInstallPanelProps) => {
  const [isInstalling, setIsInstalling] = useState(false)
  const [installResult, setInstallResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  // 安装 Claude Code
  const handleInstall = async () => {
    setIsInstalling(true)
    setInstallResult(null)
    try {
      const result = await window.api.installClaudeCodeCmd()
      setInstallResult(result)
      if (result.success && onInstallSuccess) {
        // 延迟一下再重新检测，让用户看到成功消息
        setTimeout(() => {
          onInstallSuccess()
        }, 1500)
      }
    } catch (error) {
      setInstallResult({
        success: false,
        message: `安装失败：${error instanceof Error ? error.message : '未知错误'}`
      })
    } finally {
      setIsInstalling(false)
    }
  }

  return (
    <Accordion
      defaultExpanded={isSelected}
      sx={{ border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0' }}
    >
      <AccordionSummary expandIcon={<FontAwesomeIcon icon={faChevronDown} />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FontAwesomeIcon icon={faTerminal} />
          <Typography sx={{ fontWeight: 600 }}>使用 CMD 脚本安装</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          <Alert severity="info" icon={<FontAwesomeIcon icon={faInfoCircle} />}>
            这种方式会自动下载并安装 Claude Code。
          </Alert>

          {/* 安装按钮 */}
          <Box>
            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={
                isInstalling ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <FontAwesomeIcon icon={faDownload} />
                )
              }
              onClick={handleInstall}
              disabled={isInstalling}
            >
              {isInstalling ? '正在安装 Claude Code...' : '一键安装 Claude Code'}
            </Button>
          </Box>

          {/* 安装结果 */}
          {installResult && (
            <Alert
              severity={installResult.success ? 'success' : 'error'}
              icon={
                <FontAwesomeIcon icon={installResult.success ? faCheckCircle : faTimesCircle} />
              }
            >
              <AlertTitle sx={{ fontWeight: 600 }}>
                {installResult.success ? '安装成功' : '安装失败'}
              </AlertTitle>
              {installResult.message}
            </Alert>
          )}

          {/* 手动安装命令（备用） */}
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{ fontWeight: 500 }}
            >
              或打开命令提示符（CMD），并手动执行以下命令:
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
              <code>
                curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del
                install.cmd
              </code>
            </Paper>
          </Box>
          <Alert severity="warning">
            <Typography variant="body2">
              请确保系统已安装 curl 命令。如果提示找不到 curl，可以先安装 Git for Windows 或使用
              PowerShell 方式。
            </Typography>
          </Alert>
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}

export default CmdInstallPanel
