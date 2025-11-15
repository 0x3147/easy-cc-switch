import { Card, CardContent, Box, Typography, Stack, Chip, IconButton, Avatar } from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faDownload,
  faGlobe,
  faCube
} from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import type { McpMarketplaceItem } from '@/shared/types/mcp'

interface MarketplaceCardProps {
  item: McpMarketplaceItem
  onInstall: (item: McpMarketplaceItem) => void
}

const MarketplaceCard = ({ item, onInstall }: MarketplaceCardProps) => {
  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: 3,
          transform: 'translateY(-4px)'
        }
      }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
        {/* 头部：图标和名称 */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'primary.main',
              fontSize: '1.25rem'
            }}
          >
            {item.icon ? (
              <FontAwesomeIcon icon={faCube} />
            ) : (
              item.name.charAt(0).toUpperCase()
            )}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: '1.1rem',
                mb: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {item.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.author}
            </Typography>
          </Box>
        </Box>

        {/* 描述 */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.6
          }}
        >
          {item.description}
        </Typography>

        {/* 标签 */}
        <Stack direction="row" spacing={0.5} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
          {item.tags.slice(0, 3).map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{
                height: 24,
                fontSize: '0.75rem',
                bgcolor: 'action.hover'
              }}
            />
          ))}
        </Stack>

        {/* 底部：操作按钮 */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Stack direction="row" spacing={0.5}>
            {item.repository && (
              <IconButton
                size="small"
                href={item.repository}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'text.secondary' }}
              >
                <FontAwesomeIcon icon={faGithub as any} style={{ fontSize: '1rem' }} />
              </IconButton>
            )}
            {item.website && (
              <IconButton
                size="small"
                href={item.website}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'text.secondary' }}
              >
                <FontAwesomeIcon icon={faGlobe} style={{ fontSize: '1rem' }} />
              </IconButton>
            )}
            <IconButton
              size="small"
              color="primary"
              onClick={() => onInstall(item)}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark'
                }
              }}
            >
              <FontAwesomeIcon icon={faDownload} style={{ fontSize: '1rem' }} />
            </IconButton>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  )
}

export default MarketplaceCard
