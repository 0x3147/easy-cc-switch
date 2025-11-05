import { Box, Typography, Paper } from '@mui/material'

const CodexToolInstall = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Codex 工具安装
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
        <Typography color="text.secondary">Codex 工具安装功能即将上线，敬请期待...</Typography>
      </Paper>
    </Box>
  )
}

export default CodexToolInstall
