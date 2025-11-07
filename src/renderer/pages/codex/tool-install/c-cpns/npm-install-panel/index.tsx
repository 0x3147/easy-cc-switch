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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Link
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheckCircle,
  faExclamationTriangle,
  faTerminal,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons'

interface EnvironmentStatus {
  nodejs: { installed: boolean; version?: string; majorVersion?: number; path?: string }
  nvm: { installed: boolean; version?: string; path?: string }
}

interface NpmInstallPanelProps {
  environment: EnvironmentStatus
  isRecommended: boolean
  installCommand: string
}

const NpmInstallPanel = ({ environment, isRecommended, installCommand }: NpmInstallPanelProps) => {
  const nodeVersionValid =
    environment.nodejs.installed &&
    environment.nodejs.majorVersion !== undefined &&
    environment.nodejs.majorVersion >= 18

  return (
    <Accordion
      defaultExpanded={isRecommended}
      sx={{ mb: 2, border: isRecommended ? '2px solid #1976d2' : '1px solid #e0e0e0' }}
    >
      <AccordionSummary expandIcon={<FontAwesomeIcon icon={faChevronDown} />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          <FontAwesomeIcon icon={faTerminal} />
          <Typography sx={{ fontWeight: 600 }}>使用 npm 安装</Typography>
          {isRecommended && (
            <Chip label="推荐" color="primary" size="small" sx={{ ml: 'auto', mr: 2 }} />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          {nodeVersionValid ? (
            <>
              <Alert severity="success" icon={<FontAwesomeIcon icon={faCheckCircle} />}>
                检测到符合要求的 Node.js 版本，可以直接使用 npm 安装。
              </Alert>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                  执行以下命令安装 Codex:
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
                  <code>{installCommand}</code>
                </Paper>
              </Box>
            </>
          ) : (
            <>
              <Alert severity="warning" icon={<FontAwesomeIcon icon={faExclamationTriangle} />}>
                需要先安装 Node.js v18 或更高版本。
              </Alert>
              <Typography variant="body2" gutterBottom sx={{ fontWeight: 500 }}>
                安装 Node.js 的方式:
              </Typography>
              <List dense>
                {environment.nvm.installed ? (
                  <>
                    <ListItem>
                      <ListItemIcon>
                        <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#4caf50' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="使用 NVM 安装 Node.js (推荐)"
                        secondary="已检测到 NVM，可以使用它管理 Node.js 版本"
                      />
                    </ListItem>
                    <Box sx={{ pl: 4, pr: 2, pb: 2 }}>
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
                        <code>
                          # 安装最新 LTS 版本{'\n'}
                          nvm install --lts{'\n'}
                          {'\n'}
                          # 使用已安装的 LTS 版本{'\n'}
                          nvm use --lts{'\n'}
                          {'\n'}
                          # 然后安装 Codex{'\n'}
                          {installCommand}
                        </code>
                      </Paper>
                    </Box>
                  </>
                ) : (
                  <>
                    <ListItem>
                      <ListItemIcon>
                        <Typography>1.</Typography>
                      </ListItemIcon>
                      <ListItemText
                        primary="安装 NVM (Node 版本管理器，推荐)"
                        secondary={
                          <Link
                            href="https://github.com/nvm-sh/nvm#installing-and-updating"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            查看 NVM 安装指南 →
                          </Link>
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Typography>2.</Typography>
                      </ListItemIcon>
                      <ListItemText
                        primary="直接安装 Node.js LTS 版本"
                        secondary={
                          <Link href="https://nodejs.org/" target="_blank" rel="noopener noreferrer">
                            访问 Node.js 官网下载 →
                          </Link>
                        }
                      />
                    </ListItem>
                  </>
                )}
              </List>
            </>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}

export default NpmInstallPanel
