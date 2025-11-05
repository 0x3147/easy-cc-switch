import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography
} from '@mui/material'
import type { CodexVendorConfig } from '@/shared/types/codex'

interface CodexVendorConfigDialogProps {
  open: boolean
  /** 弹窗模式：add 添加，edit 编辑 */
  mode: 'add' | 'edit'
  /** 编辑时传入的配置 */
  config?: CodexVendorConfig | null
  onClose: () => void
  onSave: (config: CodexVendorConfig, applyImmediately: boolean) => Promise<void>
}

const CodexVendorConfigDialog = ({
  open,
  mode,
  config,
  onClose,
  onSave
}: CodexVendorConfigDialogProps) => {
  const [formData, setFormData] = useState<Omit<CodexVendorConfig, 'id'>>({
    name: '',
    providerKey: '',
    baseUrl: '',
    apiKey: '',
    model: 'gpt-5',
    reasoningEffort: 'high',
    wireApi: 'responses'
  })
  const [applyImmediately, setApplyImmediately] = useState(false)
  const [saving, setSaving] = useState(false)

  // 编辑模式下初始化表单数据
  useEffect(() => {
    if (mode === 'edit' && config) {
      setFormData({
        name: config.name,
        providerKey: config.providerKey,
        baseUrl: config.baseUrl,
        apiKey: config.apiKey,
        model: config.model || 'gpt-5',
        reasoningEffort: config.reasoningEffort || 'high',
        wireApi: config.wireApi || 'responses'
      })
    } else {
      // 添加模式下重置表单
      setFormData({
        name: '',
        providerKey: '',
        baseUrl: '',
        apiKey: '',
        model: 'gpt-5',
        reasoningEffort: 'high',
        wireApi: 'responses'
      })
    }
    setApplyImmediately(false)
  }, [mode, config, open])

  const handleSave = async () => {
    setSaving(true)
    try {
      const configData: CodexVendorConfig = {
        ...formData,
        id: mode === 'edit' && config ? config.id : `codex_vendor_${Date.now()}`
      }

      await onSave(configData, applyImmediately)
      handleClose()
    } catch (error) {
      console.error('保存 Codex 配置失败:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      providerKey: '',
      baseUrl: '',
      apiKey: '',
      model: 'gpt-5',
      reasoningEffort: 'high',
      wireApi: 'responses'
    })
    setApplyImmediately(false)
    onClose()
  }

  const handleChange =
    (field: keyof Omit<CodexVendorConfig, 'id'>) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value
      }))
    }

  const canSubmit = () => {
    return (
      !saving &&
      formData.name &&
      formData.providerKey &&
      formData.baseUrl &&
      formData.apiKey &&
      formData.model &&
      formData.reasoningEffort &&
      formData.wireApi
    )
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'add' ? '添加 Codex 供应商配置' : '编辑供应商配置'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          {/* 基础配置 */}
          <TextField
            label="配置名称"
            value={formData.name}
            onChange={handleChange('name')}
            fullWidth
            required
            placeholder="例如：我的 Codex 配置"
            helperText="自定义配置名称"
          />

          <TextField
            label="供应商标识符"
            value={formData.providerKey}
            onChange={handleChange('providerKey')}
            fullWidth
            required
            placeholder="例如：fox, huiyan"
            helperText="在 config.toml 中的供应商键名（小写字母，无空格）"
          />

          <TextField
            label="API Base URL"
            value={formData.baseUrl}
            onChange={handleChange('baseUrl')}
            fullWidth
            required
            placeholder="https://code.newcli.com/codex/v1"
            helperText="API 服务的基础地址"
          />

          <TextField
            label="API Key"
            value={formData.apiKey}
            onChange={handleChange('apiKey')}
            fullWidth
            required
            type="password"
            placeholder="sk-xxxxx"
            helperText="请输入你的 API Key"
          />

          {/* 模型配置 */}
          <FormControl fullWidth required>
            <InputLabel id="model-label">模型</InputLabel>
            <Select
              labelId="model-label"
              value={formData.model}
              label="模型"
              onChange={(e) => setFormData((prev) => ({ ...prev, model: e.target.value }))}
            >
              <MenuItem value="gpt-5">gpt-5</MenuItem>
              <MenuItem value="gpt-5-codex">gpt-5-codex</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth required>
            <InputLabel id="reasoning-effort-label">推理程度</InputLabel>
            <Select
              labelId="reasoning-effort-label"
              value={formData.reasoningEffort}
              label="推理努力程度"
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, reasoningEffort: e.target.value }))
              }
            >
              <MenuItem value="high">High (高)</MenuItem>
              <MenuItem value="medium">Medium (中)</MenuItem>
              <MenuItem value="low">Low (低)</MenuItem>
              <MenuItem value="minimal">Minimal (最小)</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth required>
            <InputLabel id="wire-api-label">Wire API</InputLabel>
            <Select
              labelId="wire-api-label"
              value={formData.wireApi}
              label="Wire API"
              onChange={(e) => setFormData((prev) => ({ ...prev, wireApi: e.target.value }))}
            >
              <MenuItem value="responses">responses</MenuItem>
              <MenuItem value="streaming">streaming</MenuItem>
            </Select>
          </FormControl>

          {/* 立即生效选项 */}
          <Box sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={applyImmediately}
                  onChange={(e) => setApplyImmediately(e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">立即生效</Typography>
                  <Typography variant="caption" color="text.secondary">
                    将配置写入 ~/.codex/config.toml 和 auth.json
                  </Typography>
                </Box>
              }
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={saving}>
          取消
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={!canSubmit()}>
          {saving ? '保存中...' : mode === 'add' ? '添加' : '保存'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CodexVendorConfigDialog
