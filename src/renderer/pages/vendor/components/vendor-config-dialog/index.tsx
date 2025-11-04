import { useState, useEffect } from 'react'
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
import type { VendorConfig } from '../../../../../shared/types/vendor'

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
  const [formData, setFormData] = useState<VendorConfig>({
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
    setSaving(true)
    try {
      await onSave(formData)
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
      <DialogTitle>编辑 {vendorName} 配置</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* 基础配置 */}
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
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          取消
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!formData.token || !formData.baseUrl || saving}
        >
          {saving ? '保存中...' : '保存'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default VendorConfigDialog
