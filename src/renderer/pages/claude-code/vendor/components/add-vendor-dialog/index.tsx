import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Collapse,
  IconButton,
  Typography,
  Divider,
  FormControlLabel,
  Checkbox,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Link
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp, faFire } from '@fortawesome/free-solid-svg-icons'
import type { VendorConfig } from '@/shared/types/vendor'
import zhipuLogo from '@renderer/assets/images/zhipu-color.svg'
import moonshotLogo from '@renderer/assets/images/moonshot.svg'
import minimaxLogo from '@renderer/assets/images/minimax-color.svg'
import alibabaLogo from '@renderer/assets/images/alibaba-color.svg'
import deepseekLogo from '@renderer/assets/images/deepseek-color.svg'
import doubaoLogo from '@renderer/assets/images/doubao-color.svg'

interface AddVendorDialogProps {
  open: boolean
  onClose: () => void
  onAdd: (config: VendorConfig, applyImmediately: boolean) => Promise<void>
}

// 预设供应商配置接口
interface PresetVendorConfig {
  name: string
  logo: string
  baseUrl: string
  apiTimeout?: number
  model?: string
  smallFastModel?: string
  opusModel?: string
  sonnetModel?: string
  haikuModel?: string
}

// 预定义的供应商配置
const PRESET_VENDORS: Record<string, PresetVendorConfig> = {
  zhipu: {
    name: '智谱',
    logo: zhipuLogo,
    baseUrl: 'https://open.bigmodel.cn/api/anthropic',
    model: 'glm-4.6',
    smallFastModel: 'glm-4.6',
    opusModel: 'glm-4.6',
    sonnetModel: 'glm-4.6',
    haikuModel: 'glm-4.5-air'
  },
  moonshot: {
    name: '月之暗面',
    logo: moonshotLogo,
    baseUrl: 'https://api.kimi.com/coding',
    model: 'kimi-for-coding',
    smallFastModel: 'kimi-for-coding',
    opusModel: 'kimi-for-coding',
    sonnetModel: 'kimi-for-coding',
    haikuModel: 'kimi-for-coding'
  },
  minimax: {
    name: 'MINIMAX',
    logo: minimaxLogo,
    baseUrl: 'https://api.minimaxi.com/anthropic',
    model: 'MiniMax-M2',
    smallFastModel: 'MiniMax-M2',
    opusModel: 'MiniMax-M2',
    sonnetModel: 'MiniMax-M2',
    haikuModel: 'MiniMax-M2',
    apiTimeout: 3000000
  },
  idealab: {
    name: 'IdealAB',
    logo: alibabaLogo,
    baseUrl: ' https://idealab.alibaba-inc.com/api/openai/v1/chat/completions',
    model: 'qwen3-coder-plus',
    smallFastModel: 'qwen3-coder-plus',
    opusModel: 'qwen3-coder-plus',
    sonnetModel: 'qwen3-coder-plus',
    haikuModel: 'qwen3-coder-plus'
  },
  deepseek: {
    name: 'DeepSeek',
    logo: deepseekLogo,
    baseUrl: 'https://api.deepseek.com/anthropic',
    model: 'deepseek-chat',
    smallFastModel: 'deepseek-chat',
    opusModel: 'deepseek-chat',
    sonnetModel: 'deepseek-chat',
    haikuModel: 'deepseek-chat'
  },
  doubao: {
    name: '豆包',
    logo: doubaoLogo,
    baseUrl: 'https://ark.cn-beijing.volces.com/api/coding',
    model: 'doubao-seed-code-preview-latest',
    smallFastModel: 'doubao-seed-code-preview-latest',
    opusModel: 'doubao-seed-code-preview-latest',
    sonnetModel: 'doubao-seed-code-preview-latest',
    haikuModel: 'doubao-seed-code-preview-latest'
  }
}

type PresetVendorKey = keyof typeof PRESET_VENDORS

const AddVendorDialog = ({ open, onClose, onAdd }: AddVendorDialogProps) => {
  const { t } = useTranslation()
  const [tabValue, setTabValue] = useState(0)
  const [formData, setFormData] = useState<Omit<VendorConfig, 'id'>>({
    name: '',
    token: '',
    baseUrl: ''
  })
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [applyImmediately, setApplyImmediately] = useState(false)
  const [saving, setSaving] = useState(false)

  // 快捷配置状态
  const [quickVendor, setQuickVendor] = useState<PresetVendorKey | ''>('')
  const [quickConfigName, setQuickConfigName] = useState('')
  const [quickToken, setQuickToken] = useState('')

  const handleAdd = async () => {
    setSaving(true)
    try {
      let config: VendorConfig

      if (tabValue === 0) {
        // 快捷配置
        if (!quickVendor) return
        const preset = PRESET_VENDORS[quickVendor]
        config = {
          id: `vendor_${Date.now()}`,
          name: quickConfigName || preset.name,
          token: quickToken,
          baseUrl: preset.baseUrl,
          vendorKey: quickVendor as 'zhipu' | 'moonshot' | 'minimax' | 'idealab' | 'deepseek' | 'doubao',
          ...(preset.apiTimeout && { apiTimeout: preset.apiTimeout }),
          ...(preset.model && { model: preset.model }),
          ...(preset.smallFastModel && { smallFastModel: preset.smallFastModel }),
          ...(preset.opusModel && { opusModel: preset.opusModel }),
          ...(preset.sonnetModel && { sonnetModel: preset.sonnetModel }),
          ...(preset.haikuModel && { haikuModel: preset.haikuModel })
        }
      } else {
        // 手动配置
        config = {
          ...formData,
          id: `vendor_${Date.now()}`
        }
      }

      await onAdd(config, applyImmediately)
      handleClose()
    } catch (error) {
      console.error('添加供应商失败:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setTabValue(0)
    setFormData({
      name: '',
      token: '',
      baseUrl: ''
    })
    setShowAdvanced(false)
    setApplyImmediately(false)
    setQuickVendor('')
    setQuickConfigName('')
    setQuickToken('')
    onClose()
  }

  const handleChange =
    (field: keyof Omit<VendorConfig, 'id'>) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value
      }))
    }

  // 检查是否可以提交
  const canSubmit = () => {
    if (tabValue === 0) {
      // 快捷配置：需要供应商、token
      return !saving && quickVendor && quickToken
    } else {
      // 手动配置：需要名称、token、baseUrl
      return !saving && formData.name && formData.token && formData.baseUrl
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('vendor.dialog.addTitle')}</DialogTitle>
      <DialogContent>
        {/* Tab 切换 */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab
              icon={
                <FontAwesomeIcon icon={faFire} style={{ color: '#ff6b35', fontSize: '16px' }} />
              }
              iconPosition="end"
              label={t('vendor.dialog.quickConfig')}
            />
            <Tab label={t('vendor.dialog.manualConfig')} />
          </Tabs>
        </Box>

        {/* 快捷配置 Tab */}
        {tabValue === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* 供应商选择 */}
            <FormControl fullWidth required>
              <InputLabel id="quick-vendor-label">{t('vendor.dialog.vendor')}</InputLabel>
              <Select
                labelId="quick-vendor-label"
                value={quickVendor}
                label={t('vendor.dialog.vendor')}
                onChange={(e) => setQuickVendor(e.target.value as PresetVendorKey)}
              >
                <MenuItem value="zhipu">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      component="img"
                      src={zhipuLogo}
                      sx={{ width: 20, height: 20, objectFit: 'contain' }}
                    />
                    <span>{t('vendor.presetVendors.zhipu')}</span>
                  </Box>
                </MenuItem>
                <MenuItem value="moonshot">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      component="img"
                      src={moonshotLogo}
                      sx={{ width: 20, height: 20, objectFit: 'contain' }}
                    />
                    <span>{t('vendor.presetVendors.moonshot')}</span>
                  </Box>
                </MenuItem>
                <MenuItem value="minimax">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      component="img"
                      src={minimaxLogo}
                      sx={{ width: 20, height: 20, objectFit: 'contain' }}
                    />
                    <span>{t('vendor.presetVendors.minimax')}</span>
                  </Box>
                </MenuItem>
                <MenuItem value="idealab">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      component="img"
                      src={alibabaLogo}
                      sx={{ width: 20, height: 20, objectFit: 'contain' }}
                    />
                    <span>{t('vendor.presetVendors.idealab')}</span>
                  </Box>
                </MenuItem>
                <MenuItem value="deepseek">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      component="img"
                      src={deepseekLogo}
                      sx={{ width: 20, height: 20, objectFit: 'contain' }}
                    />
                    <span>{t('vendor.presetVendors.deepseek')}</span>
                  </Box>
                </MenuItem>
                <MenuItem value="doubao">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      component="img"
                      src={doubaoLogo}
                      sx={{ width: 20, height: 20, objectFit: 'contain' }}
                    />
                    <span>{t('vendor.presetVendors.doubao')}</span>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            {/* 配置名称 */}
            <TextField
              label={t('vendor.dialog.configName')}
              value={quickConfigName}
              onChange={(e) => setQuickConfigName(e.target.value)}
              fullWidth
              placeholder={
                quickVendor
                  ? t('vendor.dialog.configNamePlaceholder', {
                      vendor: PRESET_VENDORS[quickVendor].name
                    })
                  : t('vendor.dialog.configNamePlaceholder', { vendor: '智谱' })
              }
              helperText={t('vendor.dialog.configNameHelper')}
            />

            {/* API Token */}
            <TextField
              label={t('vendor.dialog.apiToken')}
              value={quickToken}
              onChange={(e) => setQuickToken(e.target.value)}
              fullWidth
              required
              placeholder={t('vendor.dialog.apiTokenPlaceholder')}
              helperText={t('vendor.dialog.apiTokenHelper')}
            />

            {/* 智谱官方文档链接 */}
            {quickVendor === 'zhipu' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: -1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  {t('vendor.dialog.howToGetToken')}
                </Typography>
                <Link
                  href="https://bigmodel.cn/glm-coding?utm_source=bigModel&utm_medium=Special&utm_content=glm-code&utm_campaign=Platform_Ops&_channel_track_key=8BAeCdUS"
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  variant="body2"
                >
                  {t('vendor.dialog.viewDocs', { vendor: '智谱' })}
                </Link>
              </Box>
            )}

            {/* 月之暗面官方文档链接 */}
            {quickVendor === 'moonshot' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: -1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  {t('vendor.dialog.howToGetToken')}
                </Typography>
                <Link
                  href="https://www.kimi.com/coding/docs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  variant="body2"
                >
                  {t('vendor.dialog.viewDocs', { vendor: '月之暗面' })}
                </Link>
              </Box>
            )}

            {/* MINIMAX 官方文档链接 */}
            {quickVendor === 'minimax' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: -1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  {t('vendor.dialog.howToGetToken')}
                </Typography>
                <Link
                  href="https://platform.minimaxi.com/subscribe/coding-plan"
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  variant="body2"
                >
                  {t('vendor.dialog.viewDocs', { vendor: 'MINIMAX' })}
                </Link>
              </Box>
            )}

            {/* IdealAB 官方文档链接 */}
            {quickVendor === 'idealab' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: -1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  {t('vendor.dialog.howToGetToken')}
                </Typography>
                <Link
                  href="https://idealab.alibaba-inc.com/ideaTalk#/aistudio/manage/personalResource"
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  variant="body2"
                >
                  {t('vendor.dialog.viewDocs', { vendor: 'IdealAB' })}
                </Link>
              </Box>
            )}

            {/* DeepSeek 官方文档链接 */}
            {quickVendor === 'deepseek' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: -1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  {t('vendor.dialog.howToGetToken')}
                </Typography>
                <Link
                  href="https://platform.deepseek.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  variant="body2"
                >
                  {t('vendor.dialog.viewDocs', { vendor: 'DeepSeek' })}
                </Link>
              </Box>
            )}

            {/* 豆包官方文档链接 */}
            {quickVendor === 'doubao' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: -1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  {t('vendor.dialog.howToGetToken')}
                </Typography>
                <Link
                  href="https://www.volcengine.com/activity/codingplan"
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  variant="body2"
                >
                  {t('vendor.dialog.viewDocs', { vendor: '豆包' })}
                </Link>
              </Box>
            )}

            {/* API Base URL（只读,自动填入） */}
            <TextField
              label={t('vendor.dialog.apiBaseUrl')}
              value={quickVendor ? PRESET_VENDORS[quickVendor].baseUrl : ''}
              fullWidth
              disabled
              helperText={t('vendor.dialog.apiBaseUrlAutoFill')}
            />

            {/* 智谱特有的模型配置 */}
            {quickVendor === 'zhipu' && (
              <>
                <TextField
                  label="ANTHROPIC_MODEL"
                  value="glm-4.6"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.zhipuModel')}
                />
                <TextField
                  label="ANTHROPIC_SMALL_FAST_MODEL"
                  value="glm-4.6"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.zhipuSmallFast')}
                />
                <TextField
                  label="ANTHROPIC_DEFAULT_OPUS_MODEL"
                  value="glm-4.6"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.zhipuOpus')}
                />
                <TextField
                  label="ANTHROPIC_DEFAULT_SONNET_MODEL"
                  value="glm-4.6"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.zhipuSonnet')}
                />
                <TextField
                  label="ANTHROPIC_DEFAULT_HAIKU_MODEL"
                  value="glm-4.5-air"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.zhipuHaiku')}
                />
                <TextField
                  label="API_TIMEOUT_MS"
                  value="3000000"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.zhipuTimeout')}
                />
              </>
            )}

            {/* 月之暗面特有的模型配置 */}
            {quickVendor === 'moonshot' && (
              <>
                <TextField
                  label="ANTHROPIC_MODEL"
                  value="kimi-for-coding"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.moonshotModel')}
                />
                <TextField
                  label="ANTHROPIC_SMALL_FAST_MODEL"
                  value="kimi-for-coding"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.moonshotSmallFast')}
                />
                <TextField
                  label="ANTHROPIC_DEFAULT_OPUS_MODEL"
                  value="kimi-for-coding"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.moonshotOpus')}
                />
                <TextField
                  label="ANTHROPIC_DEFAULT_SONNET_MODEL"
                  value="kimi-for-coding"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.moonshotSonnet')}
                />
                <TextField
                  label="ANTHROPIC_DEFAULT_HAIKU_MODEL"
                  value="kimi-for-coding"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.moonshotHaiku')}
                />
                <TextField
                  label="API_TIMEOUT_MS"
                  value="3000000"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.moonshotTimeout')}
                />
              </>
            )}

            {/* MINIMAX 特有的模型配置 */}
            {quickVendor === 'minimax' && (
              <>
                <TextField
                  label="ANTHROPIC_MODEL"
                  value="MiniMax-M2"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.minimaxModel')}
                />
                <TextField
                  label="ANTHROPIC_SMALL_FAST_MODEL"
                  value="MiniMax-M2"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.minimaxSmallFast')}
                />
                <TextField
                  label="ANTHROPIC_DEFAULT_OPUS_MODEL"
                  value="MiniMax-M2"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.minimaxOpus')}
                />
                <TextField
                  label="ANTHROPIC_DEFAULT_SONNET_MODEL"
                  value="MiniMax-M2"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.minimaxSonnet')}
                />
                <TextField
                  label="ANTHROPIC_DEFAULT_HAIKU_MODEL"
                  value="MiniMax-M2"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.minimaxHaiku')}
                />
                <TextField
                  label="API_TIMEOUT_MS"
                  value="3000000"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.minimaxTimeout')}
                />
              </>
            )}

            {/* IdealAB 特有的模型配置 */}
            {quickVendor === 'idealab' && (
              <>
                <TextField
                  label="ANTHROPIC_MODEL"
                  value="qwen3-coder-plus"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.idealabModel')}
                />
                <TextField
                  label="ANTHROPIC_SMALL_FAST_MODEL"
                  value="qwen3-coder-plus"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.idealabSmallFast')}
                />
                <TextField
                  label="ANTHROPIC_DEFAULT_OPUS_MODEL"
                  value="qwen3-coder-plus"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.idealabOpus')}
                />
                <TextField
                  label="ANTHROPIC_DEFAULT_SONNET_MODEL"
                  value="qwen3-coder-plus"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.idealabSonnet')}
                />
                <TextField
                  label="ANTHROPIC_DEFAULT_HAIKU_MODEL"
                  value="qwen3-coder-plus"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.idealabHaiku')}
                />
                <TextField
                  label="API_TIMEOUT_MS"
                  value="3000000"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.idealabTimeout')}
                />
              </>
            )}

            {/* DeepSeek 特有的模型配置 */}
            {quickVendor === 'deepseek' && (
              <>
                <TextField
                  label="ANTHROPIC_MODEL"
                  value="deepseek-chat"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.deepseekModel')}
                />
                <TextField
                  label="ANTHROPIC_SMALL_FAST_MODEL"
                  value="deepseek-chat"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.deepseekSmallFast')}
                />
                <TextField
                  label="ANTHROPIC_DEFAULT_OPUS_MODEL"
                  value="deepseek-chat"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.deepseekOpus')}
                />
                <TextField
                  label="ANTHROPIC_DEFAULT_SONNET_MODEL"
                  value="deepseek-chat"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.deepseekSonnet')}
                />
                <TextField
                  label="ANTHROPIC_DEFAULT_HAIKU_MODEL"
                  value="deepseek-chat"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.deepseekHaiku')}
                />
                <TextField
                  label="API_TIMEOUT_MS"
                  value="3000000"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.deepseekTimeout')}
                />
              </>
            )}

            {/* 豆包特有的模型配置 */}
            {quickVendor === 'doubao' && (
              <>
                <TextField
                  label="ANTHROPIC_MODEL"
                  value="doubao-seed-code-preview-latest"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.doubaoModel')}
                />
                <TextField
                  label="ANTHROPIC_SMALL_FAST_MODEL"
                  value="doubao-seed-code-preview-latest"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.doubaoSmallFast')}
                />
                <TextField
                  label="ANTHROPIC_DEFAULT_OPUS_MODEL"
                  value="doubao-seed-code-preview-latest"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.doubaoOpus')}
                />
                <TextField
                  label="ANTHROPIC_DEFAULT_SONNET_MODEL"
                  value="doubao-seed-code-preview-latest"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.doubaoSonnet')}
                />
                <TextField
                  label="ANTHROPIC_DEFAULT_HAIKU_MODEL"
                  value="doubao-seed-code-preview-latest"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.doubaoHaiku')}
                />
                <TextField
                  label="API_TIMEOUT_MS"
                  value="3000000"
                  fullWidth
                  disabled
                  helperText={t('vendor.dialog.modelConfig.doubaoTimeout')}
                />
              </>
            )}

            {/* 立即生效选项 */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={applyImmediately}
                  onChange={(e) => setApplyImmediately(e.target.checked)}
                />
              }
              label={t('vendor.dialog.applyImmediately')}
            />
          </Box>
        )}

        {/* 手动配置 Tab */}
        {tabValue === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* 基础配置 */}
            <TextField
              label={t('vendor.dialog.vendorName')}
              value={formData.name}
              onChange={handleChange('name')}
              fullWidth
              required
              placeholder={t('vendor.dialog.vendorNamePlaceholder')}
              helperText={t('vendor.dialog.vendorNameHelper')}
            />

            <TextField
              label={t('vendor.dialog.apiToken')}
              value={formData.token}
              onChange={handleChange('token')}
              fullWidth
              required
              placeholder="sk-ant-xxxxx"
              helperText={t('vendor.dialog.apiTokenHelper')}
            />

            <TextField
              label={t('vendor.dialog.apiBaseUrl')}
              value={formData.baseUrl}
              onChange={handleChange('baseUrl')}
              fullWidth
              required
              placeholder={t('vendor.dialog.apiBaseUrlPlaceholder')}
              helperText={t('vendor.dialog.apiBaseUrlHelper')}
            />

            {/* 高级选项 */}
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  userSelect: 'none',
                  py: 1
                }}
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1 }}>
                  {t('vendor.dialog.advancedOptions')}
                </Typography>
                <IconButton size="small">
                  <FontAwesomeIcon icon={showAdvanced ? faChevronUp : faChevronDown} />
                </IconButton>
              </Box>

              <Collapse in={showAdvanced}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                  <Divider />

                  <TextField
                    label={t('vendor.dialog.apiTimeout')}
                    value={formData.apiTimeout || ''}
                    onChange={handleChange('apiTimeout')}
                    fullWidth
                    type="number"
                    placeholder={t('vendor.dialog.apiTimeoutPlaceholder')}
                    helperText={t('vendor.dialog.apiTimeoutHelper')}
                  />

                  <TextField
                    label={t('vendor.dialog.opusModel')}
                    value={formData.opusModel || ''}
                    onChange={handleChange('opusModel')}
                    fullWidth
                    placeholder={t('vendor.dialog.opusModelPlaceholder')}
                    helperText={t('vendor.dialog.opusModelHelper')}
                  />

                  <TextField
                    label={t('vendor.dialog.sonnetModel')}
                    value={formData.sonnetModel || ''}
                    onChange={handleChange('sonnetModel')}
                    fullWidth
                    placeholder={t('vendor.dialog.sonnetModelPlaceholder')}
                    helperText={t('vendor.dialog.sonnetModelHelper')}
                  />

                  <TextField
                    label={t('vendor.dialog.haikuModel')}
                    value={formData.haikuModel || ''}
                    onChange={handleChange('haikuModel')}
                    fullWidth
                    placeholder={t('vendor.dialog.haikuModelPlaceholder')}
                    helperText={t('vendor.dialog.haikuModelHelper')}
                  />
                </Box>
              </Collapse>
            </Box>

            {/* 立即生效选项 */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={applyImmediately}
                  onChange={(e) => setApplyImmediately(e.target.checked)}
                />
              }
              label={t('vendor.dialog.applyImmediately')}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={saving}>
          {t('vendor.dialog.cancel')}
        </Button>
        <Button onClick={handleAdd} variant="contained" disabled={!canSubmit()}>
          {saving ? t('vendor.dialog.adding') : t('vendor.dialog.add')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddVendorDialog
