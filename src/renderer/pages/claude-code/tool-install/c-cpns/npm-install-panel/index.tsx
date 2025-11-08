import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Alert,
  AlertTitle,
  CircularProgress,
  Collapse,
  Chip
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheckCircle,
  faTimesCircle,
  faTerminal,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons'

interface NpmInstallPanelProps {
  isSelected: boolean
  onInstallSuccess: () => void
}

const NpmInstallPanel = ({ isSelected, onInstallSuccess }: NpmInstallPanelProps) => {
  const [installing, setInstalling] = useState(false)
  const [installResult, setInstallResult] = useState<{
    success: boolean
    message: string
    output?: string
  } | null>(null)

  const handleInstall = async () => {
    setInstalling(true)
    setInstallResult(null)

    try {
      const result = await window.api.installClaudeCodeNpm()
      setInstallResult(result)

      if (result.success) {
        // 等待 2 秒后刷新状态
        setTimeout(() => {
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

  if (!isSelected) {
    return null
  }

  return (
    <Box>
      <Alert severity="info" icon={<FontAwesomeIcon icon={faInfoCircle} />} sx={{ mb: 2 }}>
        <AlertTitle sx={{ fontWeight: 600 }}>npm 安装说明</AlertTitle>
        <Typography variant="body2" sx={{ mb: 1 }}>
          通过 npm 全局安装 Claude Code CLI 工具。此方式适合所有平台（macOS、Windows、Linux）。
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>前置要求：</strong>
        </Typography>
        <Box component="ul" sx={{ mt: 0.5, pl: 2.5, mb: 0 }}>
          <li>
            <Typography variant="body2">Node.js ≥ v18.0.0</Typography>
          </li>
          <li>
            <Typography variant="body2">npm 或 yarn</Typography>
          </li>
        </Box>
      </Alert>

      <Box
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          mb: 2
        }}
      >
        <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.secondary', mb: 1 }}>
          $ npm install -g @anthropic-ai/claude-code
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleInstall}
          disabled={installing}
          startIcon={
            installing ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <FontAwesomeIcon icon={faTerminal} />
            )
          }
        >
          {installing ? '安装中...' : '一键安装'}
        </Button>

        {installResult && (
          <Chip
            icon={
              <FontAwesomeIcon
                icon={installResult.success ? faCheckCircle : faTimesCircle}
                style={{ fontSize: '1rem' }}
              />
            }
            label={installResult.success ? '安装成功' : '安装失败'}
            color={installResult.success ? 'success' : 'error'}
            size="medium"
          />
        )}
      </Box>

      {installResult && (
        <Collapse in={!!installResult}>
          <Alert
            severity={installResult.success ? 'success' : 'error'}
            icon={
              <FontAwesomeIcon icon={installResult.success ? faCheckCircle : faTimesCircle} />
            }
            sx={{ mb: 2 }}
          >
            <AlertTitle sx={{ fontWeight: 600 }}>
              {installResult.success ? '安装成功' : '安装失败'}
            </AlertTitle>
            <Typography variant="body2">{installResult.message}</Typography>

            {installResult.output && (
              <Box
                sx={{
                  mt: 1,
                  p: 1,
                  bgcolor: 'rgba(0,0,0,0.05)',
                  borderRadius: 1,
                  maxHeight: 200,
                  overflow: 'auto'
                }}
              >
                <Typography
                  variant="caption"
                  component="pre"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    m: 0
                  }}
                >
                  {installResult.output}
                </Typography>
              </Box>
            )}
          </Alert>
        </Collapse>
      )}

      <Alert severity="warning" icon={<FontAwesomeIcon icon={faInfoCircle} />}>
        <Typography variant="body2">
          <strong>注意：</strong>如果安装失败，请检查：
        </Typography>
        <Box component="ul" sx={{ mt: 0.5, pl: 2.5, mb: 0 }}>
          <li>
            <Typography variant="body2">Node.js 版本是否 ≥ v18</Typography>
          </li>
          <li>
            <Typography variant="body2">网络连接是否正常</Typography>
          </li>
          <li>
            <Typography variant="body2">是否有足够的权限（可能需要 sudo 或管理员权限）</Typography>
          </li>
        </Box>
      </Alert>
    </Box>
  )
}

export default NpmInstallPanel
