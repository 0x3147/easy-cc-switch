import { Box, Typography } from '@mui/material'

const ToolInstallPage = () => {
  return (
    <Box>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}
      >
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
            工具安装
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            安装和配置 Claude Code 相关工具
          </Typography>
        </Box>
      </Box>

      {/* 页面内容待实现 */}
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}
      >
        <Typography variant="body1" color="text.secondary">
          功能开发中...
        </Typography>
      </Box>
    </Box>
  )
}

export default ToolInstallPage
