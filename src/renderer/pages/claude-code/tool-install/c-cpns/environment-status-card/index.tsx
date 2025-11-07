import { Box, Typography, Card, CardContent, Chip, Stack, Divider } from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons'

type Platform = 'macos' | 'windows' | 'unsupported'

interface EnvironmentStatus {
  homebrew: { installed: boolean; version?: string; path?: string }
}

interface EnvironmentStatusCardProps {
  platform: Platform
  environment: EnvironmentStatus
}

const EnvironmentStatusCard = ({ platform, environment }: EnvironmentStatusCardProps) => {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          环境检测
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={2}>
          {/* 平台显示 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#4caf50' }} />
              <Typography variant="body1">操作系统</Typography>
            </Box>
            <Chip
              label={platform === 'macos' ? 'macOS' : platform === 'windows' ? 'Windows' : '不支持'}
              color="success"
              size="small"
            />
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
