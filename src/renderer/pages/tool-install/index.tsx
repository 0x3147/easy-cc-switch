import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  AlertTitle,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Chip,
  Stack,
  CircularProgress,
  Divider,
  Link
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheckCircle,
  faTimesCircle,
  faDownload,
  faTerminal,
  faCoffee
} from '@fortawesome/free-solid-svg-icons'

type InstallMethod = 'native' | 'npm'
type NativeMethod = 'homebrew' | 'curl' | 'powershell'
type InstallStatus = 'checking' | 'installed' | 'not-installed'
type Platform = 'macos' | 'windows' | 'unsupported'

const ToolInstall = () => {
  const [installStatus, setInstallStatus] = useState<InstallStatus>('checking')
  const [platform, setPlatform] = useState<Platform>('unsupported')
  const [installMethod, setInstallMethod] = useState<InstallMethod>('native')
  const [nativeMethod, setNativeMethod] = useState<NativeMethod>('homebrew')
  const [homebrewInstalled, setHomebrewInstalled] = useState(false)
  const [installPath, setInstallPath] = useState('')
  const [activeStep, setActiveStep] = useState(0)

  // 检测平台和 Claude Code 安装状态
  useEffect(() => {
    detectPlatformAndStatus()
  }, [])

  const detectPlatformAndStatus = async () => {
    try {
      // 获取平台信息
      const platformInfo = await window.api.getPlatformInfo()
      console.log('Platform info:', platformInfo)

      let detectedPlatform: Platform = 'unsupported'
      if (platformInfo.platform === 'darwin') {
        detectedPlatform = 'macos'
        setNativeMethod('homebrew')

        // 检测 Homebrew 是否安装
        const homebrewResult = await window.api.checkHomebrew()
        console.log('Homebrew check result:', homebrewResult)
        setHomebrewInstalled(homebrewResult.installed)
      } else if (platformInfo.platform === 'win32') {
        detectedPlatform = 'windows'
        setNativeMethod('powershell')
      }

      setPlatform(detectedPlatform)

      // 检测 Claude Code 安装状态
      const claudeCodeResult = await window.api.checkClaudeCode()
      console.log('Claude Code check result:', claudeCodeResult)
      setInstallStatus(claudeCodeResult.installed ? 'installed' : 'not-installed')

      if (claudeCodeResult.installed && claudeCodeResult.path) {
        setInstallPath(claudeCodeResult.path)
      }
    } catch (error) {
      console.error('Failed to detect platform and status:', error)
      // 错误情况下，仍然设置为未安装状态，但不改变平台检测
      setInstallStatus('not-installed')
      // 如果平台检测失败，尝试使用 process.platform 作为备选
      const fallbackPlatform = process.platform
      if (fallbackPlatform === 'darwin') {
        setPlatform('macos')
        setNativeMethod('homebrew')
      } else if (fallbackPlatform === 'win32') {
        setPlatform('windows')
        setNativeMethod('powershell')
      } else {
        setPlatform('unsupported')
      }
    }
  }

  const handleInstall = () => {
    // 打开外部链接到官方安装指南
    const installUrl = 'https://claude.ai/docs/installation'
    window.open(installUrl, '_blank')
  }

  const getInstallCommand = () => {
    if (platform === 'macos') {
      return nativeMethod === 'homebrew'
        ? 'brew install --cask claude-code'
        : 'curl -fsSL https://claude.ai/install.sh | bash'
    } else if (platform === 'windows') {
      return 'irm https://claude.ai/install.ps1 | iex'
    }
    return ''
  }

  const steps = ['检测环境', '选择安装方式', '安装 Claude Code']

  // 已安装状态页面
  if (installStatus === 'installed') {
    return (
      <Box>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}
        >
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
              工具安装
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Claude Code 已成功安装
            </Typography>
          </Box>
        </Box>

        <Alert severity="success" icon={<FontAwesomeIcon icon={faCheckCircle} />} sx={{ mb: 3 }}>
          <AlertTitle sx={{ fontWeight: 600 }}>Claude Code 已安装</AlertTitle>
          您的系统已经正确安装 Claude Code，您可以直接使用。
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
                <Paper
                  variant="outlined"
                  sx={{ p: 1.5, bgcolor: 'grey.50', fontFamily: 'monospace' }}
                >
                  {installPath}
                </Paper>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  平台
                </Typography>
                <Chip
                  label={platform === 'macos' ? 'macOS' : 'Windows'}
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
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}
        >
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
                正在检测 Claude Code 安装状态...
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    )
  }

  // 未安装 - 安装向导页面
  return (
    <Box>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}
      >
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
            工具安装
          </Typography>
          <Typography variant="body2" color="text.secondary">
            按照下方步骤安装 Claude Code
          </Typography>
        </Box>
      </Box>

      {/* 平台不支持提示 */}
      {platform === 'unsupported' && (
        <Alert severity="error" icon={<FontAwesomeIcon icon={faTimesCircle} />} sx={{ mb: 3 }}>
          <AlertTitle sx={{ fontWeight: 600 }}>不支持的平台</AlertTitle>
          当前仅支持 macOS 和 Windows 平台。
        </Alert>
      )}

      {platform !== 'unsupported' && (
        <>
          {/* 进度条 */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>

          {/* 步骤 1: 环境检测 */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#4caf50' }} />
                步骤 1: 环境检测
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    当前平台
                  </Typography>
                  <Chip
                    label={platform === 'macos' ? 'macOS' : 'Windows'}
                    color="success"
                    icon={<FontAwesomeIcon icon={faCheckCircle} />}
                  />
                </Box>
                <Alert severity="info">
                  系统检测到您正在使用 {platform === 'macos' ? 'macOS' : 'Windows'}{' '}
                  操作系统，已为您预选推荐的安装方式。
                </Alert>
              </Stack>
            </CardContent>
          </Card>

          {/* 步骤 2: 选择安装方式 */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <FontAwesomeIcon icon={faDownload} />
                步骤 2: 选择安装方式
              </Typography>
              <Divider sx={{ my: 2 }} />

              {/* 安装类型选择 */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                  sx={{ fontWeight: 500 }}
                >
                  安装类型
                </Typography>
                <RadioGroup
                  value={installMethod}
                  onChange={(e) => setInstallMethod(e.target.value as InstallMethod)}
                >
                  <FormControlLabel
                    value="native"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          Native 安装 (推荐)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          使用系统原生工具安装，性能更优
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="npm"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          NPM 安装 (即将推出)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          通过 Node.js 包管理器安装
                        </Typography>
                      </Box>
                    }
                    disabled
                  />
                </RadioGroup>
              </Box>

              {/* Native 安装方式 */}
              {installMethod === 'native' && (
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ fontWeight: 500 }}
                  >
                    安装方法
                  </Typography>

                  {platform === 'macos' && (
                    <RadioGroup
                      value={nativeMethod}
                      onChange={(e) => setNativeMethod(e.target.value as NativeMethod)}
                    >
                      <FormControlLabel
                        value="homebrew"
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}
                            >
                              <FontAwesomeIcon icon={faCoffee} />
                              Homebrew (推荐)
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              macOS 包管理器，方便管理和更新
                            </Typography>
                          </Box>
                        }
                      />
                      <FormControlLabel
                        value="curl"
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}
                            >
                              <FontAwesomeIcon icon={faTerminal} />
                              cURL 脚本
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              使用 shell 脚本自动安装
                            </Typography>
                          </Box>
                        }
                      />
                    </RadioGroup>
                  )}

                  {platform === 'windows' && (
                    <Box>
                      <FormControlLabel
                        value="powershell"
                        control={<Radio checked />}
                        label={
                          <Box>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}
                            >
                              <FontAwesomeIcon icon={faTerminal} />
                              PowerShell 脚本
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              使用 PowerShell 脚本自动安装
                            </Typography>
                          </Box>
                        }
                        disabled
                      />
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* 步骤 3: 安装指引 */}
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <FontAwesomeIcon icon={faTerminal} />
                步骤 3: 安装 Claude Code
              </Typography>
              <Divider sx={{ my: 2 }} />

              {/* Homebrew 未安装提示 */}
              {platform === 'macos' && nativeMethod === 'homebrew' && !homebrewInstalled && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <AlertTitle sx={{ fontWeight: 600 }}>检测到您未安装 Homebrew</AlertTitle>
                  请先安装 Homebrew，或选择使用 cURL 方式安装。
                  <Link
                    href="https://brew.sh/"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ display: 'block', mt: 1 }}
                  >
                    查看 Homebrew 安装指南 →
                  </Link>
                </Alert>
              )}

              <Stack spacing={2}>
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ fontWeight: 500 }}
                  >
                    执行以下命令安装
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      bgcolor: 'grey.900',
                      color: 'common.white',
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      position: 'relative'
                    }}
                  >
                    <code>{getInstallCommand()}</code>
                  </Paper>
                </Box>

                <Alert severity="info">
                  <Typography variant="body2">
                    请打开{platform === 'macos' ? '终端 (Terminal)' : 'PowerShell'}
                    ，复制并执行上述命令。安装完成后，请刷新此页面以验证安装。
                  </Typography>
                </Alert>

                <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
                  <Button variant="contained" size="large" onClick={detectPlatformAndStatus}>
                    重新检测
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => window.open('https://claude.ai/docs/installation', '_blank')}
                  >
                    查看官方文档
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

export default ToolInstall
