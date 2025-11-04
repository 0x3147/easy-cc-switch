import { Box, Typography, Paper } from '@mui/material'

const SubAgentPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Sub Agent配置
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography color="text.secondary">Sub Agent配置内容区域</Typography>
      </Paper>
    </Box>
  )
}

export default SubAgentPage
