import { Card, CardContent, Box, Typography, Button, Chip, Stack } from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencil, faCheck } from '@fortawesome/free-solid-svg-icons'
import type { VendorInfo } from '../../../../../shared/types/vendor'

interface VendorCardProps {
  vendor: VendorInfo
  isActive: boolean
  onEdit: () => void
  onSetActive: () => void
}

const VendorCard = ({ vendor, isActive, onEdit, onSetActive }: VendorCardProps) => {
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
        {' '}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {' '}
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
              {vendor.config?.baseUrl || vendor.defaultUrl}
            </Typography>
          </Box>
          {/* 操作按钮 */}
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FontAwesomeIcon icon={faPencil} />}
              onClick={onEdit}
            >
              编辑
            </Button>
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
