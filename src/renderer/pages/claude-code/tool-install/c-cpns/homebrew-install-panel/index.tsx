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
  CircularProgress,
  AlertTitle
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheckCircle,
  faExclamationTriangle,
  faCoffee,
  faChevronDown,
  faDownload,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons'

interface EnvironmentStatus {
  homebrew: { installed: boolean; version?: string; path?: string }
}

interface HomebrewInstallPanelProps {
  environment: EnvironmentStatus
  isSelected: boolean
  onInstallSuccess?: () => void
}

const HomebrewInstallPanel = ({
  environment,
  isSelected,
  onInstallSuccess
}: HomebrewInstallPanelProps) => {
  const [isInstallingHomebrew, setIsInstallingHomebrew] = useState(false)
  const [homebrewInstallResult, setHomebrewInstallResult] = useState<{
    success: boolean
    message: string
  } | null>(null)
  const [isInstallingClaudeCode, setIsInstallingClaudeCode] = useState(false)
  const [claudeCodeInstallResult, setClaudeCodeInstallResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  // 安装 Homebrew
  const handleInstallHomebrew = async () => {
    setIsInstallingHomebrew(true)
    setHomebrewInstallResult(null)
    try {
      const result = await window.api.installHomebrew()
      setHomebrewInstallResult(result)
      if (result.success && onInstallSuccess) {
        // 延迟一下再重新检测，让用户看到成功消息
        setTimeout(() => {
          onInstallSuccess()
        }, 1500)
      }
    } catch (error) {
      setHomebrewInstallResult({
        success: false,
        message: `安装失败：${error instanceof Error ? error.message : '未知错误'}`
      })
    } finally {
      setIsInstallingHomebrew(false)
    }
  }

  // 安装 Claude Code
  const handleInstallClaudeCode = async () => {
    setIsInstallingClaudeCode(true)
    setClaudeCodeInstallResult(null)
    try {
      const result = await window.api.installClaudeCodeHomebrew()
      setClaudeCodeInstallResult(result)
      if (result.success && onInstallSuccess) {
        // 延迟一下再重新检测，让用户看到成功消息
        setTimeout(() => {
          onInstallSuccess()
        }, 1500)
      }
    } catch (error) {
      setClaudeCodeInstallResult({
        success: false,
        message: `安装失败：${error instanceof Error ? error.message : '未知错误'}`
      })
    } finally {
      setIsInstallingClaudeCode(false)
    }
  }
  return (
    <Accordion
      defaultExpanded={isSelected}
      sx={{ border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0' }}
    >
      <AccordionSummary expandIcon={<FontAwesomeIcon icon={faChevronDown} />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          <FontAwesomeIcon icon={faCoffee} />
          <Typography sx={{ fontWeight: 600 }}>使用 Homebrew 安装</Typography>
          {isSelected && (
            <Chip label="推荐" color="primary" size="small" sx={{ ml: 'auto', mr: 2 }} />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          {environment.homebrew.installed ? (
            <>
              <Alert severity="success" icon={<FontAwesomeIcon icon={faCheckCircle} />}>
                检测到 Homebrew，可以直接使用它安装 Claude Code。
              </Alert>

              {/* Claude Code 安装按钮和状态 */}
              <Box>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={
                    isInstallingClaudeCode ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <FontAwesomeIcon icon={faDownload} />
                    )
                  }
                  onClick={handleInstallClaudeCode}
                  disabled={isInstallingClaudeCode}
                >
                  {isInstallingClaudeCode ? '正在安装 Claude Code...' : '一键安装 Claude Code'}
                </Button>
              </Box>

              {/* Claude Code 安装结果 */}
              {claudeCodeInstallResult && (
                <Alert
                  severity={claudeCodeInstallResult.success ? 'success' : 'error'}
                  icon={
                    <FontAwesomeIcon
                      icon={claudeCodeInstallResult.success ? faCheckCircle : faTimesCircle}
                    />
                  }
                >
                  <AlertTitle sx={{ fontWeight: 600 }}>
                    {claudeCodeInstallResult.success ? '安装成功' : '安装失败'}
                  </AlertTitle>
                  {claudeCodeInstallResult.message}
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
                  或手动执行以下命令:
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
                  <code>brew install --cask claude-code</code>
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

              {/* Homebrew 安装按钮和状态 */}
              <Box>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={
                    isInstallingHomebrew ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <FontAwesomeIcon icon={faDownload} />
                    )
                  }
                  onClick={handleInstallHomebrew}
                  disabled={isInstallingHomebrew}
                >
                  {isInstallingHomebrew ? '正在安装 Homebrew...' : '一键安装 Homebrew'}
                </Button>
              </Box>

              {/* Homebrew 安装结果 */}
              {homebrewInstallResult && (
                <Alert
                  severity={homebrewInstallResult.success ? 'success' : 'error'}
                  icon={
                    <FontAwesomeIcon
                      icon={homebrewInstallResult.success ? faCheckCircle : faTimesCircle}
                    />
                  }
                >
                  <AlertTitle sx={{ fontWeight: 600 }}>
                    {homebrewInstallResult.success ? '安装成功' : '安装失败'}
                  </AlertTitle>
                  {homebrewInstallResult.message}
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
                  或手动执行以下命令:
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
                  <code>brew install --cask claude-code</code>
                </Paper>
              </Box>
            </>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}

export default HomebrewInstallPanel
