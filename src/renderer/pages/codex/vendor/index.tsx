import { Box, Typography, Paper } from '@mui/material'

const CodexVendorPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Codex 供应商配置
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
        <Typography color="text.secondary">Codex 供应商配置内容区域</Typography>
      </Paper>
    </Box>
  )
}

export default CodexVendorPage
