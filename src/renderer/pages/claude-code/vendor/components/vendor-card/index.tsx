import { Card, CardContent, Box, Typography, Button, Chip, Stack, IconButton } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencil, faCheck, faTrash, faGripVertical } from '@fortawesome/free-solid-svg-icons'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { VendorConfig } from '@/shared/types/vendor'
import claudeLogo from '@renderer/assets/images/claude-logo.svg'
import zhipuLogo from '@renderer/assets/images/zhipu-color.svg'
import moonshotLogo from '@renderer/assets/images/moonshot.svg'
import minimaxLogo from '@renderer/assets/images/minimax-color.svg'
import alibabaLogo from '@renderer/assets/images/alibaba-color.svg'
import deepseekLogo from '@renderer/assets/images/deepseek-color.svg'
import doubaoLogo from '@renderer/assets/images/doubao-color.svg'

interface VendorCardProps {
  vendor: VendorConfig
  isActive: boolean
  onEdit?: () => void
  onSetActive: () => void
  onDelete?: () => void
}

const VendorCard = ({ vendor, isActive, onEdit, onSetActive, onDelete }: VendorCardProps) => {
  const { t } = useTranslation()

  // 使用 useSortable hook
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: vendor.id
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

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
      case 'doubao':
        return doubaoLogo
      default:
        return claudeLogo // 手动配置默认使用 Claude logo
    }
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
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
          {/* 拖拽手柄 */}
          <Box
            {...attributes}
            {...listeners}
            sx={{
              cursor: isDragging ? 'grabbing' : 'grab',
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              '&:hover': {
                color: 'primary.main'
              }
            }}
          >
            <FontAwesomeIcon icon={faGripVertical} />
          </Box>

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
              {isActive && (
                <Chip label={t('vendor.active')} size="small" color="primary" sx={{ height: 24 }} />
              )}
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
              {isActive ? t('vendor.enabled') : t('vendor.setAsActive')}
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  )
}

export default VendorCard
