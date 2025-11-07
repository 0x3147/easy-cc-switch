import {
  Box,
  Typography,
  Paper,
  Stack,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTerminal, faChevronDown, faInfoCircle } from '@fortawesome/free-solid-svg-icons'

interface PowershellInstallPanelProps {
  isSelected: boolean
}

const PowershellInstallPanel = ({ isSelected }: PowershellInstallPanelProps) => {
  return (
    <Accordion
      defaultExpanded={isSelected}
      sx={{ border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0' }}
    >
      <AccordionSummary expandIcon={<FontAwesomeIcon icon={faChevronDown} />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FontAwesomeIcon icon={faTerminal} />
          <Typography sx={{ fontWeight: 600 }}>使用 PowerShell 脚本安装</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          <Alert severity="info" icon={<FontAwesomeIcon icon={faInfoCircle} />}>
            这种方式会自动下载并安装 Claude Code。
          </Alert>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
              以管理员身份打开 PowerShell，并执行以下命令:
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: 'grey.900',
                color: 'common.white',
                fontFamily: 'monospace',
                fontSize: '14px'
              }}
            >
              <code>irm https://claude.ai/install.ps1 | iex</code>
            </Paper>
          </Box>
          <Alert severity="warning">
            <Typography variant="body2">
              请确保以管理员身份运行 PowerShell，并且系统已启用执行脚本的权限。
              如遇到执行策略限制，可以先运行：
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 1,
                mt: 1,
                bgcolor: 'grey.900',
                color: 'common.white',
                fontFamily: 'monospace',
                fontSize: '12px'
              }}
            >
              <code>Set-ExecutionPolicy RemoteSigned -Scope CurrentUser</code>
            </Paper>
          </Alert>
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}

export default PowershellInstallPanel
