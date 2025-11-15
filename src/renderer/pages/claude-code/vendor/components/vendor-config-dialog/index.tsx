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
  Collapse,
  IconButton,
  Typography,
  Divider
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import type { VendorConfig } from '@/shared/types/vendor'

interface VendorConfigDialogProps {
  open: boolean
  vendorName: string
  config: VendorConfig | null
  onClose: () => void
  onSave: (config: VendorConfig) => Promise<void>
}

const VendorConfigDialog = ({
  open,
  vendorName,
  config,
  onClose,
  onSave
}: VendorConfigDialogProps) => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<Partial<VendorConfig>>({
    token: '',
    baseUrl: ''
  })
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (config) {
      setFormData(config)
    } else {
      setFormData({
        token: '',
        baseUrl: ''
      })
    }
  }, [config, open])

  const handleSave = async () => {
    if (!config) return

    setSaving(true)
    try {
      // 保持原有的 id，但允许修改 name
      const updatedConfig: VendorConfig = {
        ...config,
        ...formData,
        name: formData.name || config.name,
        token: formData.token || '',
        baseUrl: formData.baseUrl || ''
      }
      await onSave(updatedConfig)
      onClose()
    } catch (error) {
      console.error('保存配置失败:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof VendorConfig) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t('vendor.dialog.editTitle', { name: formData.name || vendorName || '配置' })}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* 基础配置 */}
          <TextField
            label={t('vendor.dialog.vendorName')}
            value={formData.name || ''}
            onChange={handleChange('name')}
            fullWidth
            required
            placeholder={t('vendor.dialog.vendorNamePlaceholder')}
            helperText={t('vendor.dialog.vendorNameHelper')}
          />

          <TextField
            label={t('vendor.dialog.apiToken')}
            value={formData.token || ''}
            onChange={handleChange('token')}
            fullWidth
            required
            placeholder="sk-ant-xxxxx"
            helperText={t('vendor.dialog.apiTokenHelper')}
          />

          <TextField
            label={t('vendor.dialog.apiBaseUrl')}
            value={formData.baseUrl || ''}
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
                  label="ANTHROPIC_MODEL"
                  value={formData.model || ''}
                  onChange={handleChange('model')}
                  fullWidth
                  placeholder={t('vendor.dialog.modelPlaceholder')}
                  helperText={t('vendor.dialog.modelHelper')}
                />

                <TextField
                  label="ANTHROPIC_SMALL_FAST_MODEL"
                  value={formData.smallFastModel || ''}
                  onChange={handleChange('smallFastModel')}
                  fullWidth
                  placeholder={t('vendor.dialog.smallFastModelPlaceholder')}
                  helperText={t('vendor.dialog.smallFastModelHelper')}
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
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          {t('vendor.dialog.cancel')}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!formData.name || !formData.token || !formData.baseUrl || saving}
        >
          {saving ? t('vendor.dialog.saving') : t('vendor.dialog.save')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default VendorConfigDialog
