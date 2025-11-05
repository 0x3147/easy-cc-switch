import { Card, CardContent, Box, Typography, Button, Chip, Stack, IconButton } from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencil, faCheck, faTrash } from '@fortawesome/free-solid-svg-icons'
import type { VendorConfig } from '@/shared/types/vendor'
import claudeLogo from '@renderer/assets/images/claude-logo.svg'
import zhipuLogo from '@renderer/assets/images/zhipu-color.svg'
import moonshotLogo from '@renderer/assets/images/moonshot.svg'
import minimaxLogo from '@renderer/assets/images/minimax-color.svg'
import alibabaLogo from '@renderer/assets/images/alibaba-color.svg'
import deepseekLogo from '@renderer/assets/images/deepseek-color.svg'

interface VendorCardProps {
  vendor: VendorConfig
  isActive: boolean
  onEdit?: () => void
  onSetActive: () => void
  onDelete?: () => void
}

const VendorCard = ({ vendor, isActive, onEdit, onSetActive, onDelete }: VendorCardProps) => {
  // 根据 vendorKey 获取对应的 logo
  const getVendorLogo = () => {
    switch (vendor.vendorKey) {
      case 'zhipu':
        return zhipuLogo
      case 'moonshot':
        return moonshotLogo
      case 'minimax':
        return minimaxLogo
      case 'idealab':
        return alibabaLogo
      case 'deepseek':
        return deepseekLogo
      default:
        return claudeLogo // 手动配置默认使用 Claude logo
    }
  }

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: isActive ? 'primary.main' : 'divider',
        borderRadius: 2,
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: isActive ? 'primary.dark' : 'primary.light',
          boxShadow: 1
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {/* Logo */}
          <Box
            component="img"
            src={getVendorLogo()}
            sx={{
              width: 32,
              height: 32,
              objectFit: 'contain',
              flexShrink: 0
            }}
          />

          {/* 信息区域 */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {vendor.name}
              </Typography>
              {isActive && <Chip label="使用中" size="small" color="primary" sx={{ height: 24 }} />}
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
              {vendor.baseUrl}
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
            <Button
              variant={isActive ? 'outlined' : 'contained'}
              size="small"
              startIcon={isActive ? <FontAwesomeIcon icon={faCheck} /> : undefined}
              onClick={onSetActive}
              disabled={isActive}
            >
              {isActive ? '已启用' : '设为启用'}
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  )
}

export default VendorCard
