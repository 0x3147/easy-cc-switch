import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  IconButton,
  Stack,
  Chip
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrash, faServer, faGlobe, faBolt } from '@fortawesome/free-solid-svg-icons'
import type { McpServerType, McpServerConfig } from '@/shared/types/mcp'

interface AddMcpDialogProps {
  open: boolean
  onClose: () => void
  onAdd: (name: string, config: McpServerConfig) => void
}

const AddMcpDialog = ({ open, onClose, onAdd }: AddMcpDialogProps) => {
  const { t } = useTranslation()
  const [serverType, setServerType] = useState<McpServerType>('stdio')
  const [serverName, setServerName] = useState('')

  // stdio 配置
  const [command, setCommand] = useState('')
  const [args, setArgs] = useState<string[]>([])
  const [argInput, setArgInput] = useState('')
  const [envVars, setEnvVars] = useState<Array<{ key: string; value: string }>>([])

  // http/sse 配置
  const [url, setUrl] = useState('')
  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>([])

  const handleClose = () => {
    // 重置表单
    setServerType('stdio')
    setServerName('')
    setCommand('')
    setArgs([])
    setArgInput('')
    setEnvVars([])
    setUrl('')
    setHeaders([])
    onClose()
  }

  const handleAdd = () => {
    if (!serverName.trim()) {
      alert(t('mcp.serverNameRequired'))
      return
    }

    let config: McpServerConfig

    if (serverType === 'stdio') {
      if (!command.trim()) {
        alert(t('mcp.commandRequired'))
        return
      }
      const env: Record<string, string> = {}
      envVars.forEach((item) => {
        if (item.key && item.value) {
          env[item.key] = item.value
        }
      })
      config = {
        type: 'stdio',
        command: command.trim(),
        args: args.length > 0 ? args : undefined,
        env: Object.keys(env).length > 0 ? env : undefined
      }
    } else {
      if (!url.trim()) {
        alert(t('mcp.urlRequired'))
        return
      }
      const headerObj: Record<string, string> = {}
      headers.forEach((item) => {
        if (item.key && item.value) {
          headerObj[item.key] = item.value
        }
      })
      config = {
        type: serverType,
        url: url.trim(),
        headers: Object.keys(headerObj).length > 0 ? headerObj : undefined
      }
    }

    onAdd(serverName.trim(), config)
    handleClose()
  }

  const addArg = () => {
    if (argInput.trim()) {
      setArgs([...args, argInput.trim()])
      setArgInput('')
    }
  }

  const removeArg = (index: number) => {
    setArgs(args.filter((_, i) => i !== index))
  }

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: '', value: '' }])
  }

  const updateEnvVar = (index: number, field: 'key' | 'value', value: string) => {
    const newEnvVars = [...envVars]
    newEnvVars[index][field] = value
    setEnvVars(newEnvVars)
  }

  const removeEnvVar = (index: number) => {
    setEnvVars(envVars.filter((_, i) => i !== index))
  }

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }])
  }

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers]
    newHeaders[index][field] = value
    setHeaders(newHeaders)
  }

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{t('mcp.addServer')}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {/* 服务器名称 */}
          <TextField
            fullWidth
            label={t('mcp.serverName')}
            value={serverName}
            onChange={(e) => setServerName(e.target.value)}
            sx={{ mb: 3 }}
            required
          />

          {/* 服务器类型选择 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t('mcp.serverType')}
            </Typography>
            <ToggleButtonGroup
              value={serverType}
              exclusive
              onChange={(_, value) => value && setServerType(value)}
              fullWidth
            >
              <ToggleButton value="stdio">
                <FontAwesomeIcon icon={faServer} style={{ marginRight: '8px' }} />
                STDIO
              </ToggleButton>
              <ToggleButton value="http">
                <FontAwesomeIcon icon={faGlobe} style={{ marginRight: '8px' }} />
                HTTP
              </ToggleButton>
              <ToggleButton value="sse">
                <FontAwesomeIcon icon={faBolt} style={{ marginRight: '8px' }} />
                SSE
              </ToggleButton>
            </ToggleButtonGroup>

            {/* 类型说明 */}
            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: 'action.hover',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>{t(`mcp.typeDescription.${serverType}.title`)}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {t(`mcp.typeDescription.${serverType}.description`)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                {t(`mcp.typeDescription.${serverType}.example`)}
              </Typography>
            </Box>
          </Box>

          {/* STDIO 配置 */}
          {serverType === 'stdio' && (
            <Box>
              <TextField
                fullWidth
                label={t('mcp.command')}
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                sx={{ mb: 2 }}
                required
                placeholder="npx"
              />

              {/* 参数列表 */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2">{t('mcp.arguments')}</Typography>
                  <Button
                    size="small"
                    onClick={addArg}
                    disabled={!argInput.trim()}
                    startIcon={<FontAwesomeIcon icon={faPlus} />}
                  >
                    {t('mcp.add')}
                  </Button>
                </Box>
                <TextField
                  fullWidth
                  size="small"
                  value={argInput}
                  onChange={(e) => setArgInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && argInput.trim() && addArg()}
                  placeholder="eg: @playwright/mcp@latest"
                  sx={{ mb: 1 }}
                />
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {args.map((arg, index) => (
                    <Chip
                      key={index}
                      label={arg}
                      onDelete={() => removeArg(index)}
                      size="small"
                    />
                  ))}
                </Stack>
              </Box>

              {/* 环境变量 */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2">{t('mcp.environmentVariables')}</Typography>
                  <Button size="small" onClick={addEnvVar} startIcon={<FontAwesomeIcon icon={faPlus} />}>
                    {t('mcp.add')}
                  </Button>
                </Box>
                {envVars.map((env, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      size="small"
                      placeholder={t('mcp.key')}
                      value={env.key}
                      onChange={(e) => updateEnvVar(index, 'key', e.target.value)}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      size="small"
                      placeholder={t('mcp.value')}
                      value={env.value}
                      onChange={(e) => updateEnvVar(index, 'value', e.target.value)}
                      sx={{ flex: 1 }}
                    />
                    <IconButton size="small" onClick={() => removeEnvVar(index)} color="error">
                      <FontAwesomeIcon icon={faTrash} size="sm" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* HTTP/SSE 配置 */}
          {(serverType === 'http' || serverType === 'sse') && (
            <Box>
              <TextField
                fullWidth
                label={t('mcp.url')}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                sx={{ mb: 2 }}
                required
                placeholder="https://example.com/mcp"
              />

              {/* Headers */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2">{t('mcp.headers')}</Typography>
                  <Button size="small" onClick={addHeader} startIcon={<FontAwesomeIcon icon={faPlus} />}>
                    {t('mcp.add')}
                  </Button>
                </Box>
                {headers.map((header, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      size="small"
                      placeholder={t('mcp.headerKey')}
                      value={header.key}
                      onChange={(e) => updateHeader(index, 'key', e.target.value)}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      size="small"
                      placeholder={t('mcp.headerValue')}
                      value={header.value}
                      onChange={(e) => updateHeader(index, 'value', e.target.value)}
                      sx={{ flex: 1 }}
                    />
                    <IconButton size="small" onClick={() => removeHeader(index)} color="error">
                      <FontAwesomeIcon icon={faTrash} size="sm" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('common.cancel')}</Button>
        <Button onClick={handleAdd} variant="contained">
          {t('common.add')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddMcpDialog
