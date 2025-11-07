import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  AlertTitle,
  Stack,
  CircularProgress
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import InstalledStatus from './c-cpns/installed-status'
import EnvironmentStatusCard from './c-cpns/environment-status-card'
import NpmInstallPanel from './c-cpns/npm-install-panel'
import HomebrewInstallPanel from './c-cpns/homebrew-install-panel'

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
    setInstallStatus('checking')
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
        detectedPlatform === 'macos'
          ? window.api.checkHomebrew()
          : Promise.resolve({ installed: false })
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
      <InstalledStatus
        platform={platform}
        installPath={installPath}
        onUninstallSuccess={detectEnvironment}
      />
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
          <EnvironmentStatusCard platform={platform} environment={environment} />

          {/* 安装方式推荐 */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                推荐安装方式
              </Typography>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }} />

              {/* npm 安装面板 */}
              <NpmInstallPanel
                environment={environment}
                isRecommended={recommendedMethod === 'npm'}
                installCommand={getInstallCommand('npm')}
                onInstallSuccess={detectEnvironment}
              />

              {/* Homebrew 安装面板 (仅 macOS) */}
              {platform === 'macos' && (
                <HomebrewInstallPanel
                  environment={environment}
                  isRecommended={recommendedMethod === 'homebrew'}
                  installCommand={getInstallCommand('homebrew')}
                  onInstallSuccess={detectEnvironment}
                />
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
