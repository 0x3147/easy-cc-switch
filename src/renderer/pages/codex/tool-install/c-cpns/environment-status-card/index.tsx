import { Box, Typography, Card, CardContent, Chip, Stack, Divider, Alert } from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons'

type Platform = 'macos' | 'windows' | 'linux' | 'unsupported'

interface EnvironmentStatus {
  nodejs: { installed: boolean; version?: string; majorVersion?: number; path?: string }
  nvm: { installed: boolean; version?: string; path?: string }
  homebrew: { installed: boolean; version?: string; path?: string }
}

interface EnvironmentStatusCardProps {
  platform: Platform
  environment: EnvironmentStatus
}

const EnvironmentStatusCard = ({ platform, environment }: EnvironmentStatusCardProps) => {
  const nodeVersionValid =
    environment.nodejs.installed &&
    environment.nodejs.majorVersion !== undefined &&
    environment.nodejs.majorVersion >= 18

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          环境检测
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={2}>
          {/* Node.js 检测 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FontAwesomeIcon
                icon={nodeVersionValid ? faCheckCircle : faTimesCircle}
                style={{ color: nodeVersionValid ? '#4caf50' : '#f44336' }}
              />
              <Typography variant="body1">Node.js (≥ v18)</Typography>
            </Box>
            {environment.nodejs.installed ? (
              <Chip
                label={environment.nodejs.version || '已安装'}
                color={nodeVersionValid ? 'success' : 'warning'}
                size="small"
              />
            ) : (
              <Chip label="未安装" color="default" size="small" />
            )}
          </Box>

          {/* 显示版本过低警告 */}
          {environment.nodejs.installed && !nodeVersionValid && (
            <Alert severity="warning" icon={<FontAwesomeIcon icon={faExclamationTriangle} />}>
              检测到 Node.js 版本低于 v18，Codex 需要 Node.js v18 或更高版本。
            </Alert>
          )}

          {/* NVM 检测 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FontAwesomeIcon
                icon={environment.nvm.installed ? faCheckCircle : faInfoCircle}
                style={{ color: environment.nvm.installed ? '#4caf50' : '#9e9e9e' }}
              />
              <Typography variant="body1">NVM (Node 版本管理器)</Typography>
            </Box>
            {environment.nvm.installed ? (
              <Chip label={environment.nvm.version || '已安装'} color="success" size="small" />
            ) : (
              <Chip label="未安装" color="default" size="small" />
            )}
          </Box>

          {/* Homebrew 检测 (仅 macOS) */}
          {platform === 'macos' && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FontAwesomeIcon
                  icon={environment.homebrew.installed ? faCheckCircle : faInfoCircle}
                  style={{ color: environment.homebrew.installed ? '#4caf50' : '#9e9e9e' }}
                />
                <Typography variant="body1">Homebrew</Typography>
              </Box>
              {environment.homebrew.installed ? (
                <Chip label={environment.homebrew.version || '已安装'} color="success" size="small" />
              ) : (
                <Chip label="未安装" color="default" size="small" />
              )}
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}

export default EnvironmentStatusCard
