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
  Checkbox
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import type { VendorConfig } from '@/shared/types/vendor'

interface AddVendorDialogProps {
  open: boolean
  onClose: () => void
  onAdd: (config: VendorConfig, applyImmediately: boolean) => Promise<void>
}

const AddVendorDialog = ({ open, onClose, onAdd }: AddVendorDialogProps) => {
  const [formData, setFormData] = useState<Omit<VendorConfig, 'id'>>({
    name: '',
    token: '',
    baseUrl: ''
  })
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [applyImmediately, setApplyImmediately] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleAdd = async () => {
    setSaving(true)
    try {
      // 生成唯一 ID
      const config: VendorConfig = {
        ...formData,
        id: `vendor_${Date.now()}`
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
    setFormData({
      name: '',
      token: '',
      baseUrl: ''
    })
    setShowAdvanced(false)
    setApplyImmediately(false)
    onClose()
  }

  const handleChange =
    (field: keyof Omit<VendorConfig, 'id'>) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value
      }))
    }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>添加供应商配置</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={saving}>
          取消
        </Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          disabled={!formData.name || !formData.token || !formData.baseUrl || saving}
        >
          {saving ? '添加中...' : '添加'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddVendorDialog
