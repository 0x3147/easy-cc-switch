import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
  Stack,
  CircularProgress,
  Divider
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle, faDownload, faTerminal, faCoffee } from '@fortawesome/free-solid-svg-icons'
import InstalledStatus from './c-cpns/installed-status'
import EnvironmentStatusCard from './c-cpns/environment-status-card'
import HomebrewInstallPanel from './c-cpns/homebrew-install-panel'
import CurlInstallPanel from './c-cpns/curl-install-panel'
import PowershellInstallPanel from './c-cpns/powershell-install-panel'
import CmdInstallPanel from './c-cpns/cmd-install-panel'

type InstallMethod = 'native' | 'npm'
type NativeMethod = 'homebrew' | 'curl' | 'powershell' | 'cmd'
type InstallStatus = 'checking' | 'installed' | 'not-installed'
type Platform = 'macos' | 'windows' | 'unsupported'

interface EnvironmentStatus {
  homebrew: { installed: boolean; version?: string; path?: string }
}

const ToolInstall = () => {
  const { t } = useTranslation()
  const [installStatus, setInstallStatus] = useState<InstallStatus>('checking')
  const [platform, setPlatform] = useState<Platform>('unsupported')
  const [installMethod, setInstallMethod] = useState<InstallMethod>('native')
  const [nativeMethod, setNativeMethod] = useState<NativeMethod>('homebrew')
  const [environment, setEnvironment] = useState<EnvironmentStatus>({
    homebrew: { installed: false }
  })
  const [installPath, setInstallPath] = useState('')

  // 检测平台和 Claude Code 安装状态
  useEffect(() => {
    detectPlatformAndStatus()
  }, [])

  const detectPlatformAndStatus = async (forceRefresh = false) => {
    try {
      // 如果需要强制刷新，先清除缓存
      if (forceRefresh) {
        await window.api.refreshToolCache()
      }

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
        setEnvironment({
          homebrew: homebrewResult
        })
      } else if (platformInfo.platform === 'win32') {
        detectedPlatform = 'windows'
        setNativeMethod('powershell')
      }

      setPlatform(detectedPlatform)

      // 检测 Claude Code 安装状态（强制刷新时使用完整检测，否则使用缓存）
      const claudeCodeResult = forceRefresh
        ? await window.api.checkClaudeCode()
        : await window.api.checkClaudeCodeCached()
      console.log(
        `Claude Code check result ${forceRefresh ? '(force)' : '(cached)'}:`,
        claudeCodeResult
      )
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

  const steps = [
    t('toolInstall.steps.detectEnv'),
    t('toolInstall.steps.selectMethod'),
    t('toolInstall.steps.install')
  ]

  // 已安装状态页面
  if (installStatus === 'installed') {
    return (
      <InstalledStatus
        platform={platform}
        installPath={installPath}
        onUninstallSuccess={detectPlatformAndStatus}
      />
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
              {t('toolInstall.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('toolInstall.checking')}
            </Typography>
          </Box>
        </Box>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
              <CircularProgress size={48} sx={{ mb: 3 }} />
              <Typography variant="body1" color="text.secondary">
                {t('toolInstall.checkingStatus')}
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
            {t('toolInstall.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('toolInstall.notInstalled')}
          </Typography>
        </Box>
      </Box>

      {/* 平台不支持提示 */}
      {platform === 'unsupported' && (
        <Alert severity="error" icon={<FontAwesomeIcon icon={faTimesCircle} />} sx={{ mb: 3 }}>
          <AlertTitle sx={{ fontWeight: 600 }}>{t('toolInstall.unsupportedPlatform')}</AlertTitle>
          {t('toolInstall.unsupportedPlatformDesc')}
        </Alert>
      )}

      {platform !== 'unsupported' && (
        <>
          {/* 进度条 */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stepper activeStep={0} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>

          {/* 环境检测卡片 */}
          <EnvironmentStatusCard platform={platform} environment={environment} />

          {/* 步骤 2: 选择安装方式 */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <FontAwesomeIcon icon={faDownload} />
                {t('toolInstall.steps.selectMethod')}
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
                  {t('toolInstall.installType')}
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
                          {t('toolInstall.nativeInstall')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('toolInstall.nativeInstallDesc')}
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
                          {t('toolInstall.npmInstall')} ({t('toolInstall.comingSoon')})
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('toolInstall.npmInstallDesc')}
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
                    {t('toolInstall.installMethod')}
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
                              {t('toolInstall.homebrew')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {t('toolInstall.homebrewDesc')}
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
                              {t('toolInstall.curlScript')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {t('toolInstall.curlScriptDesc')}
                            </Typography>
                          </Box>
                        }
                      />
                    </RadioGroup>
                  )}

                  {platform === 'windows' && (
                    <RadioGroup
                      value={nativeMethod}
                      onChange={(e) => setNativeMethod(e.target.value as NativeMethod)}
                    >
                      <FormControlLabel
                        value="powershell"
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
                              {t('toolInstall.powershellScript')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {t('toolInstall.powershellScriptDesc')}
                            </Typography>
                          </Box>
                        }
                      />
                      <FormControlLabel
                        value="cmd"
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
                              {t('toolInstall.cmdScript')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {t('toolInstall.cmdScriptDesc')}
                            </Typography>
                          </Box>
                        }
                      />
                    </RadioGroup>
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
                {t('toolInstall.steps.install')}
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Stack spacing={2}>
                {/* macOS 安装面板 */}
                {platform === 'macos' && (
                  <>
                    <HomebrewInstallPanel
                      environment={environment}
                      isSelected={nativeMethod === 'homebrew'}
                      onInstallSuccess={detectPlatformAndStatus}
                    />
                    <CurlInstallPanel
                      isSelected={nativeMethod === 'curl'}
                      onInstallSuccess={detectPlatformAndStatus}
                    />
                  </>
                )}

                {/* Windows 安装面板 */}
                {platform === 'windows' && (
                  <>
                    <PowershellInstallPanel
                      isSelected={nativeMethod === 'powershell'}
                      onInstallSuccess={detectPlatformAndStatus}
                    />
                    <CmdInstallPanel
                      isSelected={nativeMethod === 'cmd'}
                      onInstallSuccess={detectPlatformAndStatus}
                    />
                  </>
                )}

                <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => detectPlatformAndStatus(true)}
                  >
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
