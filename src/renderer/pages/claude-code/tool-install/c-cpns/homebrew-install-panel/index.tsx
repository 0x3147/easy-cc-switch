import {
  Box,
  Typography,
  Paper,
  Stack,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Link
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheckCircle,
  faExclamationTriangle,
  faCoffee,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons'

interface EnvironmentStatus {
  homebrew: { installed: boolean; version?: string; path?: string }
}

interface HomebrewInstallPanelProps {
  environment: EnvironmentStatus
  isSelected: boolean
}

const HomebrewInstallPanel = ({ environment, isSelected }: HomebrewInstallPanelProps) => {
  return (
    <Accordion
      defaultExpanded={isSelected}
      sx={{ border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0' }}
    >
      <AccordionSummary expandIcon={<FontAwesomeIcon icon={faChevronDown} />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          <FontAwesomeIcon icon={faCoffee} />
          <Typography sx={{ fontWeight: 600 }}>使用 Homebrew 安装</Typography>
          {isSelected && (
            <Chip label="推荐" color="primary" size="small" sx={{ ml: 'auto', mr: 2 }} />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          {environment.homebrew.installed ? (
            <>
              <Alert severity="success" icon={<FontAwesomeIcon icon={faCheckCircle} />}>
                检测到 Homebrew，可以直接使用它安装 Claude Code。
              </Alert>
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                  sx={{ fontWeight: 500 }}
                >
                  执行以下命令安装 Claude Code:
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
                  <code>brew install --cask claude-code</code>
                </Paper>
              </Box>
            </>
          ) : (
            <>
              <Alert severity="warning" icon={<FontAwesomeIcon icon={faExclamationTriangle} />}>
                需要先安装 Homebrew。
              </Alert>
              <Typography variant="body2" gutterBottom>
                Homebrew 是 macOS 上最流行的包管理器，可以方便地安装和管理各种软件。
              </Typography>
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                  sx={{ fontWeight: 500 }}
                >
                  安装 Homebrew:
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: 'grey.900',
                    color: 'common.white',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    mb: 1
                  }}
                >
                  <code>
                    /bin/bash -c "$(curl -fsSL
                    https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
                  </code>
                </Paper>
                <Link
                  href="https://brew.sh/"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ fontSize: '0.875rem' }}
                >
                  查看 Homebrew 官方网站 →
                </Link>
              </Box>
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                  sx={{ fontWeight: 500 }}
                >
                  安装完成后，再执行:
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
                  <code>brew install --cask claude-code</code>
                </Paper>
              </Box>
            </>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}

export default HomebrewInstallPanel
