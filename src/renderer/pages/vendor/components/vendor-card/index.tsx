import { Card, CardContent, Box, Typography, Button, Chip, Stack, IconButton } from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencil, faCheck, faTrash } from '@fortawesome/free-solid-svg-icons'
import type { VendorConfig } from '@/shared/types/vendor'

interface VendorCardProps {
  vendor: VendorConfig
  isActive: boolean
  onEdit?: () => void
  onSetActive: () => void
  onDelete?: () => void
}

const VendorCard = ({ vendor, isActive, onEdit, onSetActive, onDelete }: VendorCardProps) => {
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
