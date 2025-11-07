import { Card, CardContent, Box, Typography, Stack, IconButton, Chip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencil, faTrash, faServer, faGlobe, faBolt } from '@fortawesome/free-solid-svg-icons'
import type { McpServerItem } from '@/shared/types/mcp'

interface McpCardProps {
  server: McpServerItem
  onEdit?: () => void
  onDelete?: () => void
}

const McpCard = ({ server, onEdit, onDelete }: McpCardProps) => {
  const { t } = useTranslation()

  // 根据服务器类型获取图标和颜色
  const getTypeInfo = () => {
    switch (server.type) {
      case 'stdio':
        return { icon: faServer, color: '#4caf50', label: 'STDIO' }
      case 'http':
        return { icon: faGlobe, color: '#2196f3', label: 'HTTP' }
      case 'sse':
        return { icon: faBolt, color: '#ff9800', label: 'SSE' }
      default:
        return { icon: faServer, color: '#9e9e9e', label: 'Unknown' }
    }
  }

  const typeInfo = getTypeInfo()

  // 获取服务器配置的简要描述
  const getDescription = () => {
    if (server.type === 'stdio') {
      return `${server.config.command} ${server.config.args?.join(' ') || ''}`
    } else if (server.type === 'http' || server.type === 'sse') {
      return server.config.url
    }
    return ''
  }

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: 'primary.light',
          boxShadow: 1
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {/* 类型图标 */}
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: `${typeInfo.color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <FontAwesomeIcon icon={typeInfo.icon} style={{ fontSize: '20px', color: typeInfo.color }} />
          </Box>

          {/* 信息区域 */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {server.name}
              </Typography>
              <Chip
                label={typeInfo.label}
                size="small"
                sx={{
                  height: 24,
                  backgroundColor: `${typeInfo.color}15`,
                  color: typeInfo.color,
                  fontWeight: 600
                }}
              />
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {getDescription()}
            </Typography>
          </Box>

          {/* 操作按钮 */}
          <Stack direction="row" spacing={1} alignItems="center">
            {onEdit && (
              <IconButton size="small" onClick={onEdit} color="primary">
                <FontAwesomeIcon icon={faPencil} size="sm" />
              </IconButton>
            )}
            {onDelete && (
              <IconButton size="small" onClick={onDelete} color="error">
                <FontAwesomeIcon icon={faTrash} size="sm" />
              </IconButton>
            )}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  )
}

export default McpCard
