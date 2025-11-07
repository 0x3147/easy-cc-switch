import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  AlertTitle,
  Paper,
  Chip,
  Stack,
  CircularProgress,
  Divider,
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faTerminal,
  faCoffee,
  faChevronDown,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons'

type InstallStatus = 'checking' | 'installed' | 'not-installed'
type Platform = 'macos' | 'windows' | 'linux' | 'unsupported'
type InstallMethod = 'npm' | 'homebrew'

interface EnvironmentStatus {
  nodejs: { installed: boolean; version?: string; majorVersion?: number; path?: string }
  nvm: { installed: boolean; version?: string; path?: string }
  homebrew: { installed: boolean; version?: string; path?: string }
}

const CodexToolInstall = () => {
  const [installStatus, setInstallStatus] = useState<InstallStatus>('checking')
  const [platform, setPlatform] = useState<Platform>('unsupported')
  const [installPath, setInstallPath] = useState('')
  const [environment, setEnvironment] = useState<EnvironmentStatus>({
    nodejs: { installed: false },
    nvm: { installed: false },
    homebrew: { installed: false }
  })
  const [recommendedMethod, setRecommendedMethod] = useState<InstallMethod>('npm')

  // 检测所有环境状态
  useEffect(() => {
    detectEnvironment()
  }, [])

  const detectEnvironment = async () => {
    try {
      // 获取平台信息
      const platformInfo = await window.api.getPlatformInfo()
      console.log('Platform info:', platformInfo)

      let detectedPlatform: Platform = 'unsupported'
      if (platformInfo.platform === 'darwin') {
        detectedPlatform = 'macos'
      } else if (platformInfo.platform === 'win32') {
        detectedPlatform = 'windows'
      } else if (platformInfo.platform === 'linux') {
        detectedPlatform = 'linux'
      }
      setPlatform(detectedPlatform)

      // 并行检测所有依赖
      const [codexResult, nodejsResult, nvmResult, homebrewResult] = await Promise.all([
        window.api.checkCodex(),
        window.api.checkNodejs(),
        window.api.checkNvm(),
        detectedPlatform === 'macos' ? window.api.checkHomebrew() : Promise.resolve({ installed: false })
      ])

      console.log('Codex check:', codexResult)
      console.log('Node.js check:', nodejsResult)
      console.log('NVM check:', nvmResult)
      console.log('Homebrew check:', homebrewResult)

      // 更新环境状态
      setEnvironment({
        nodejs: nodejsResult,
        nvm: nvmResult,
        homebrew: homebrewResult
      })

      // 检查 Codex 安装状态
      if (codexResult.installed) {
        setInstallStatus('installed')
        if (codexResult.path) {
          setInstallPath(codexResult.path)
        }
      } else {
        setInstallStatus('not-installed')
        // 根据环境状态推荐安装方式
        determineRecommendedMethod(nodejsResult, homebrewResult, detectedPlatform)
      }
    } catch (error) {
      console.error('Failed to detect environment:', error)
      setInstallStatus('not-installed')
    }
  }

  const determineRecommendedMethod = (
    nodejsResult: EnvironmentStatus['nodejs'],
    homebrewResult: EnvironmentStatus['homebrew'],
    detectedPlatform: Platform
  ) => {
    // 如果有 Node.js >= 18，优先推荐 npm
    if (nodejsResult.installed && nodejsResult.majorVersion && nodejsResult.majorVersion >= 18) {
      setRecommendedMethod('npm')
    }
    // 如果是 macOS 且有 Homebrew，推荐 homebrew
    else if (detectedPlatform === 'macos' && homebrewResult.installed) {
      setRecommendedMethod('homebrew')
    }
    // 默认推荐 npm
    else {
      setRecommendedMethod('npm')
    }
  }

  const getInstallCommand = (method: InstallMethod): string => {
    if (method === 'homebrew') {
      return 'brew install codex'
    } else {
      return 'npm install -g @openai/codex'
    }
  }

  // 已安装状态页面
  if (installStatus === 'installed') {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
              工具安装
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Codex 已成功安装
            </Typography>
          </Box>
        </Box>

        <Alert severity="success" icon={<FontAwesomeIcon icon={faCheckCircle} />} sx={{ mb: 3 }}>
          <AlertTitle sx={{ fontWeight: 600 }}>Codex 已安装</AlertTitle>
          您的系统已经正确安装 Codex，您可以直接使用。
        </Alert>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              安装信息
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  安装位置
                </Typography>
                <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'grey.50', fontFamily: 'monospace' }}>
                  {installPath}
                </Paper>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  平台
                </Typography>
                <Chip
                  label={platform === 'macos' ? 'macOS' : platform === 'windows' ? 'Windows' : 'Linux'}
                  color="primary"
                  size="small"
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    )
  }

  // 检测中状态
  if (installStatus === 'checking') {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
              工具安装
            </Typography>
            <Typography variant="body2" color="text.secondary">
              正在检测系统环境...
            </Typography>
          </Box>
        </Box>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
              <CircularProgress size={48} sx={{ mb: 3 }} />
              <Typography variant="body1" color="text.secondary">
                正在检测 Codex 和依赖环境...
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    )
  }

  // 未安装 - 安装向导页面
  const nodeVersionValid = environment.nodejs.installed &&
    environment.nodejs.majorVersion !== undefined &&
    environment.nodejs.majorVersion >= 18

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
            工具安装
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Codex 支持通过 npm 或 Homebrew 安装
          </Typography>
        </Box>
      </Box>

      {/* 平台不支持提示 */}
      {platform === 'unsupported' && (
        <Alert severity="error" icon={<FontAwesomeIcon icon={faTimesCircle} />} sx={{ mb: 3 }}>
          <AlertTitle sx={{ fontWeight: 600 }}>不支持的平台</AlertTitle>
          当前仅支持 macOS、Windows 和 Linux 平台。
        </Alert>
      )}

      {platform !== 'unsupported' && (
        <>
          {/* 环境检测结果 */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                环境检测
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={2}>
                {/* Node.js 检测 */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FontAwesomeIcon
                      icon={nodeVersionValid ? faCheckCircle : faTimesCircle}
                      style={{ color: nodeVersionValid ? '#4caf50' : '#f44336' }}
                    />
                    <Typography variant="body1">Node.js (≥ v18)</Typography>
                  </Box>
                  {environment.nodejs.installed ? (
                    <Chip
                      label={environment.nodejs.version || '已安装'}
                      color={nodeVersionValid ? 'success' : 'warning'}
                      size="small"
                    />
                  ) : (
                    <Chip label="未安装" color="default" size="small" />
                  )}
                </Box>

                {/* 显示版本过低警告 */}
                {environment.nodejs.installed && !nodeVersionValid && (
                  <Alert severity="warning" icon={<FontAwesomeIcon icon={faExclamationTriangle} />}>
                    检测到 Node.js 版本低于 v18，Codex 需要 Node.js v18 或更高版本。
                  </Alert>
                )}

                {/* NVM 检测 */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FontAwesomeIcon
                      icon={environment.nvm.installed ? faCheckCircle : faInfoCircle}
                      style={{ color: environment.nvm.installed ? '#4caf50' : '#9e9e9e' }}
                    />
                    <Typography variant="body1">NVM (Node 版本管理器)</Typography>
                  </Box>
                  {environment.nvm.installed ? (
                    <Chip label={environment.nvm.version || '已安装'} color="success" size="small" />
                  ) : (
                    <Chip label="未安装" color="default" size="small" />
                  )}
                </Box>

                {/* Homebrew 检测 (仅 macOS) */}
                {platform === 'macos' && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FontAwesomeIcon
                        icon={environment.homebrew.installed ? faCheckCircle : faInfoCircle}
                        style={{ color: environment.homebrew.installed ? '#4caf50' : '#9e9e9e' }}
                      />
                      <Typography variant="body1">Homebrew</Typography>
                    </Box>
                    {environment.homebrew.installed ? (
                      <Chip label={environment.homebrew.version || '已安装'} color="success" size="small" />
                    ) : (
                      <Chip label="未安装" color="default" size="small" />
                    )}
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* 安装方式推荐 */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                推荐安装方式
              </Typography>
              <Divider sx={{ my: 2 }} />

              {/* 方式 1: npm 安装 */}
              <Accordion
                defaultExpanded={recommendedMethod === 'npm'}
                sx={{ mb: 2, border: recommendedMethod === 'npm' ? '2px solid #1976d2' : '1px solid #e0e0e0' }}
              >
                <AccordionSummary expandIcon={<FontAwesomeIcon icon={faChevronDown} />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <FontAwesomeIcon icon={faTerminal} />
                    <Typography sx={{ fontWeight: 600 }}>使用 npm 安装</Typography>
                    {recommendedMethod === 'npm' && (
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
                            <code>{getInstallCommand('npm')}</code>
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
                                    {getInstallCommand('npm')}
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
                                    <Link
                                      href="https://nodejs.org/"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
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

              {/* 方式 2: Homebrew 安装 (仅 macOS) */}
              {platform === 'macos' && (
                <Accordion
                  defaultExpanded={recommendedMethod === 'homebrew'}
                  sx={{ border: recommendedMethod === 'homebrew' ? '2px solid #1976d2' : '1px solid #e0e0e0' }}
                >
                  <AccordionSummary expandIcon={<FontAwesomeIcon icon={faChevronDown} />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <FontAwesomeIcon icon={faCoffee} />
                      <Typography sx={{ fontWeight: 600 }}>使用 Homebrew 安装</Typography>
                      {recommendedMethod === 'homebrew' && (
                        <Chip label="推荐" color="primary" size="small" sx={{ ml: 'auto', mr: 2 }} />
                      )}
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      {environment.homebrew.installed ? (
                        <>
                          <Alert severity="success" icon={<FontAwesomeIcon icon={faCheckCircle} />}>
                            检测到 Homebrew，可以直接使用它安装 Codex。
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
                              <code>{getInstallCommand('homebrew')}</code>
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
                            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
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
                              <code>/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"</code>
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
                        </>
                      )}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              )}
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Alert severity="info">
                  <Typography variant="body2">
                    安装完成后，请点击下方按钮重新检测环境。
                  </Typography>
                </Alert>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="contained" size="large" onClick={detectEnvironment}>
                    重新检测
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => window.open('https://github.com/openai/codex', '_blank')}
                  >
                    查看 Codex 文档
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  )
}

export default CodexToolInstall
