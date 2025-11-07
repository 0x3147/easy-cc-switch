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

interface CurlInstallPanelProps {
  isSelected: boolean
}

const CurlInstallPanel = ({ isSelected }: CurlInstallPanelProps) => {
  return (
    <Accordion
      defaultExpanded={isSelected}
      sx={{ border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0' }}
    >
      <AccordionSummary expandIcon={<FontAwesomeIcon icon={faChevronDown} />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FontAwesomeIcon icon={faTerminal} />
          <Typography sx={{ fontWeight: 600 }}>使用 cURL 脚本安装</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          <Alert severity="info" icon={<FontAwesomeIcon icon={faInfoCircle} />}>
            这种方式会自动下载并安装 Claude Code，无需 Homebrew。
          </Alert>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
              在终端中执行以下命令:
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
              <code>curl -fsSL https://claude.ai/install.sh | bash</code>
            </Paper>
          </Box>
          <Alert severity="warning">
            <Typography variant="body2">
              请确保您的系统已启用执行脚本的权限。安装完成后可能需要重启终端。
            </Typography>
          </Alert>
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}

export default CurlInstallPanel
