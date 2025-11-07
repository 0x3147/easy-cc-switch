import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
      <DialogTitle>
        {mode === 'add' ? t('codex.vendor.dialog.addTitle') : t('codex.vendor.dialog.editTitle')}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          {/* 基础配置 */}
          <TextField
            label={t('codex.vendor.dialog.configName')}
            value={formData.name}
            onChange={handleChange('name')}
            fullWidth
            required
            placeholder={t('codex.vendor.dialog.configNamePlaceholder')}
            helperText={t('codex.vendor.dialog.configNameHelper')}
          />

          <TextField
            label={t('codex.vendor.dialog.providerKey')}
            value={formData.providerKey}
            onChange={handleChange('providerKey')}
            fullWidth
            required
            placeholder={t('codex.vendor.dialog.providerKeyPlaceholder')}
            helperText={t('codex.vendor.dialog.providerKeyHelper')}
          />

          <TextField
            label={t('codex.vendor.dialog.apiBaseUrl')}
            value={formData.baseUrl}
            onChange={handleChange('baseUrl')}
            fullWidth
            required
            placeholder={t('codex.vendor.dialog.apiBaseUrlPlaceholder')}
            helperText={t('codex.vendor.dialog.apiBaseUrlHelper')}
          />

          <TextField
            label={t('codex.vendor.dialog.apiKey')}
            value={formData.apiKey}
            onChange={handleChange('apiKey')}
            fullWidth
            required
            type="password"
            placeholder={t('codex.vendor.dialog.apiKeyPlaceholder')}
            helperText={t('codex.vendor.dialog.apiKeyHelper')}
          />

          {/* 模型配置 */}
          <FormControl fullWidth required>
            <InputLabel id="model-label">{t('codex.vendor.dialog.model')}</InputLabel>
            <Select
              labelId="model-label"
              value={formData.model}
              label={t('codex.vendor.dialog.model')}
              onChange={(e) => setFormData((prev) => ({ ...prev, model: e.target.value }))}
            >
              <MenuItem value="gpt-5">gpt-5</MenuItem>
              <MenuItem value="gpt-5-codex">gpt-5-codex</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth required>
            <InputLabel id="reasoning-effort-label">
              {t('codex.vendor.dialog.reasoningEffort')}
            </InputLabel>
            <Select
              labelId="reasoning-effort-label"
              value={formData.reasoningEffort}
              label={t('codex.vendor.dialog.reasoningEffortLabel')}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  reasoningEffort: e.target.value
                }))
              }
            >
              <MenuItem value="high">{t('codex.vendor.dialog.reasoningHigh')}</MenuItem>
              <MenuItem value="medium">{t('codex.vendor.dialog.reasoningMedium')}</MenuItem>
              <MenuItem value="low">{t('codex.vendor.dialog.reasoningLow')}</MenuItem>
              <MenuItem value="minimal">{t('codex.vendor.dialog.reasoningMinimal')}</MenuItem>
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
                  <Typography variant="body2">{t('vendor.dialog.applyImmediately')}</Typography>
                </Box>
              }
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={saving}>
          {t('vendor.dialog.cancel')}
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={!canSubmit()}>
          {saving
            ? t('vendor.dialog.saving')
            : mode === 'add'
              ? t('vendor.dialog.add')
              : t('vendor.dialog.save')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CodexVendorConfigDialog
