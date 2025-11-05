import { useState } from 'react'
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

interface AddVendorDialogProps {
  open: boolean
  onClose: () => void
  onAdd: (config: VendorConfig, applyImmediately: boolean) => Promise<void>
}

// 预定义的供应商配置
const PRESET_VENDORS = {
  zhipu: {
    name: '智谱',
    logo: zhipuLogo,
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    opusModel: 'glm-4.6',
    sonnetModel: 'glm-4.6',
    haikuModel: 'glm-4.5-air'
  },
  moonshot: {
    name: '月之暗面',
    logo: moonshotLogo,
    baseUrl: 'https://api.kimi.com/coding',
    opusModel: 'kimi-for-coding',
    sonnetModel: 'kimi-for-coding',
    haikuModel: undefined
  },
  minimax: {
    name: 'MINIMAX',
    logo: minimaxLogo,
    baseUrl: 'https://api.minimax.chat/v1',
    opusModel: undefined,
    sonnetModel: undefined,
    haikuModel: undefined
  },
  idealab: {
    name: 'IdealAB',
    logo: alibabaLogo,
    baseUrl: ' https://idealab.alibaba-inc.com/api/openai/v1/chat/completions',
    opusModel: 'qwen3-coder-plus',
    sonnetModel: 'qwen3-coder-plus',
    haikuModel: 'qwen3-coder-plus'
  }
} as const

type PresetVendorKey = keyof typeof PRESET_VENDORS

const AddVendorDialog = ({ open, onClose, onAdd }: AddVendorDialogProps) => {
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
        // 手动配置
        config = {
          ...formData,
          id: `vendor_${Date.now()}`
        }
      } else {
        // 快捷配置
        if (!quickVendor) return
        const preset = PRESET_VENDORS[quickVendor]
        config = {
          id: `vendor_${Date.now()}`,
          name: quickConfigName || preset.name,
          token: quickToken,
          baseUrl: preset.baseUrl,
          vendorKey: quickVendor, // 添加 vendorKey 标识
          ...(preset.opusModel && { opusModel: preset.opusModel }),
          ...(preset.sonnetModel && { sonnetModel: preset.sonnetModel }),
          ...(preset.haikuModel && { haikuModel: preset.haikuModel })
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
      // 手动配置：需要名称、token、baseUrl
      return !saving && formData.name && formData.token && formData.baseUrl
    } else {
      // 快捷配置：需要供应商、token
      return !saving && quickVendor && quickToken
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>添加供应商配置</DialogTitle>
      <DialogContent>
        {/* Tab 切换 */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="手动配置" />
            <Tab
              icon={
                <FontAwesomeIcon icon={faFire} style={{ color: '#ff6b35', fontSize: '16px' }} />
              }
              iconPosition="end"
              label="快捷配置"
            />
          </Tabs>
        </Box>
        {/* 手动配置 Tab */}
        {tabValue === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* 基础配置 */}
            <TextField
              label="供应商名称"
              value={formData.name}
              onChange={handleChange('name')}
              fullWidth
              required
              placeholder="例如：我的 Claude API"
              helperText="自定义供应商名称"
            />

            <TextField
              label="API Token"
              value={formData.token}
              onChange={handleChange('token')}
              fullWidth
              required
              placeholder="sk-ant-xxxxx"
              helperText="请输入你的 API Token"
            />

            <TextField
              label="API Base URL"
              value={formData.baseUrl}
              onChange={handleChange('baseUrl')}
              fullWidth
              required
              placeholder="https://api.anthropic.com"
              helperText="API 服务的基础地址"
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
                  高级选项
                </Typography>
                <IconButton size="small">
                  <FontAwesomeIcon icon={showAdvanced ? faChevronUp : faChevronDown} />
                </IconButton>
              </Box>

              <Collapse in={showAdvanced}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                  <Divider />

                  <TextField
                    label="API Timeout (ms)"
                    value={formData.apiTimeout || ''}
                    onChange={handleChange('apiTimeout')}
                    fullWidth
                    type="number"
                    placeholder="30000"
                    helperText="API 请求超时时间（毫秒）"
                  />

                  <TextField
                    label="Default Opus Model"
                    value={formData.opusModel || ''}
                    onChange={handleChange('opusModel')}
                    fullWidth
                    placeholder="claude-opus-4-20250514"
                    helperText="默认使用的 Opus 模型"
                  />

                  <TextField
                    label="Default Sonnet Model"
                    value={formData.sonnetModel || ''}
                    onChange={handleChange('sonnetModel')}
                    fullWidth
                    placeholder="claude-sonnet-4-20250514"
                    helperText="默认使用的 Sonnet 模型"
                  />

                  <TextField
                    label="Default Haiku Model"
                    value={formData.haikuModel || ''}
                    onChange={handleChange('haikuModel')}
                    fullWidth
                    placeholder="claude-3-5-haiku-20241022"
                    helperText="默认使用的 Haiku 模型"
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
              label="立即生效（将配置写入 ~/.claude/settings.json）"
            />
          </Box>
        )}

        {/* 快捷配置 Tab */}
        {tabValue === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* 供应商选择 */}
            <FormControl fullWidth required>
              <InputLabel id="quick-vendor-label">供应商</InputLabel>
              <Select
                labelId="quick-vendor-label"
                value={quickVendor}
                label="供应商"
                onChange={(e) => setQuickVendor(e.target.value as PresetVendorKey)}
              >
                <MenuItem value="zhipu">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      component="img"
                      src={zhipuLogo}
                      sx={{ width: 20, height: 20, objectFit: 'contain' }}
                    />
                    <span>智谱(GLM)</span>
                  </Box>
                </MenuItem>
                <MenuItem value="moonshot">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      component="img"
                      src={moonshotLogo}
                      sx={{ width: 20, height: 20, objectFit: 'contain' }}
                    />
                    <span>月之暗面(KIMI)</span>
                  </Box>
                </MenuItem>
                <MenuItem value="minimax">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      component="img"
                      src={minimaxLogo}
                      sx={{ width: 20, height: 20, objectFit: 'contain' }}
                    />
                    <span>MINIMAX</span>
                  </Box>
                </MenuItem>
                <MenuItem value="idealab">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      component="img"
                      src={alibabaLogo}
                      sx={{ width: 20, height: 20, objectFit: 'contain' }}
                    />
                    <span>idealab</span>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            {/* 配置名称 */}
            <TextField
              label="配置名称"
              value={quickConfigName}
              onChange={(e) => setQuickConfigName(e.target.value)}
              fullWidth
              placeholder={
                quickVendor ? `我的${PRESET_VENDORS[quickVendor].name}配置` : '例如：我的智谱配置'
              }
              helperText="留空将使用供应商名称作为配置名"
            />

            {/* API Token */}
            <TextField
              label="API Token"
              value={quickToken}
              onChange={(e) => setQuickToken(e.target.value)}
              fullWidth
              required
              placeholder="请输入你的 API Token"
              helperText="请输入对应供应商的 API 密钥"
            />

            {/* 智谱官方文档链接 */}
            {quickVendor === 'zhipu' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: -1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  如何获取API TOKEN？
                </Typography>
                <Link
                  href="https://bigmodel.cn/glm-coding?utm_source=bigModel&utm_medium=Special&utm_content=glm-code&utm_campaign=Platform_Ops&_channel_track_key=8BAeCdUS"
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  variant="body2"
                >
                  查看智谱官方文档
                </Link>
              </Box>
            )}

            {/* 月之暗面官方文档链接 */}
            {quickVendor === 'moonshot' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: -1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  如何获取API TOKEN？
                </Typography>
                <Link
                  href="https://www.kimi.com/coding/docs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  variant="body2"
                >
                  查看月之暗面官方文档
                </Link>
              </Box>
            )}

            {/* IdealAB 官方文档链接 */}
            {quickVendor === 'idealab' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: -1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  如何获取API TOKEN？
                </Typography>
                <Link
                  href="https://idealab.alibaba-inc.com/ideaTalk#/aistudio/manage/personalResource"
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  variant="body2"
                >
                  查看IdealAB官方文档
                </Link>
              </Box>
            )}

            {/* API Base URL（只读，自动填入） */}
            <TextField
              label="API Base URL"
              value={quickVendor ? PRESET_VENDORS[quickVendor].baseUrl : ''}
              fullWidth
              disabled
              helperText="根据所选供应商自动填入"
            />

            {/* 智谱特有的模型配置 */}
            {quickVendor === 'zhipu' && (
              <>
                <TextField
                  label="ANTHROPIC_DEFAULT_OPUS_MODEL"
                  value="glm-4.6"
                  fullWidth
                  disabled
                  helperText="智谱 Opus 模型配置"
                />
                <TextField
                  label="ANTHROPIC_DEFAULT_SONNET_MODEL"
                  value="glm-4.6"
                  fullWidth
                  disabled
                  helperText="智谱 Sonnet 模型配置"
                />
                <TextField
                  label="ANTHROPIC_DEFAULT_HAIKU_MODEL"
                  value="glm-4.5-air"
                  fullWidth
                  disabled
                  helperText="智谱 Haiku 模型配置"
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
                  helperText="月之暗面默认模型配置"
                />
                <TextField
                  label="ANTHROPIC_SMALL_FAST_MODEL"
                  value="kimi-for-coding"
                  fullWidth
                  disabled
                  helperText="月之暗面快速模型配置"
                />
              </>
            )}

            {/* IdealAB 特有的模型配置 */}
            {quickVendor === 'idealab' && (
              <>
                <TextField
                  label="ANTHROPIC_DEFAULT_OPUS_MODEL"
                  value="qwen3-coder-plus"
                  fullWidth
                  disabled
                  helperText="IdealAB Opus 模型配置"
                />
                <TextField
                  label="ANTHROPIC_DEFAULT_SONNET_MODEL"
                  value="qwen3-coder-plus"
                  fullWidth
                  disabled
                  helperText="IdealAB Sonnet 模型配置"
                />
                <TextField
                  label="ANTHROPIC_DEFAULT_HAIKU_MODEL"
                  value="qwen3-coder-plus"
                  fullWidth
                  disabled
                  helperText="IdealAB Haiku 模型配置"
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
              label="立即生效（将配置写入 ~/.claude/settings.json）"
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={saving}>
          取消
        </Button>
        <Button onClick={handleAdd} variant="contained" disabled={!canSubmit()}>
          {saving ? '添加中...' : '添加'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddVendorDialog
