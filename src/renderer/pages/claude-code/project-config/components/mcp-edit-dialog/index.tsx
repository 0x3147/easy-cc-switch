import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  FormControlLabel,
  IconButton,
  Tabs,
  Tab,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Chip,
  Switch
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrash, faServer, faGlobe, faBolt } from '@fortawesome/free-solid-svg-icons'
import type { McpServerConfig, McpServerType } from '@/shared/types/mcp'

interface McpEditDialogProps {
  open: boolean
  editingMcp: { name: string; config: any } | null
  onClose: () => void
  onSave: (name: string, config: McpServerConfig, enableImmediately: boolean) => void
}

const McpEditDialog = ({ open, editingMcp, onClose, onSave }: McpEditDialogProps) => {
  const [tabValue, setTabValue] = useState(0)

  // 表单模式状态
  const [serverName, setServerName] = useState('')
  const [serverType, setServerType] = useState<McpServerType>('stdio')
  const [enableImmediately, setEnableImmediately] = useState(true)

  // stdio 配置
  const [command, setCommand] = useState('')
  const [args, setArgs] = useState<string[]>([])
  const [argInput, setArgInput] = useState('')
  const [envVars, setEnvVars] = useState<Array<{ key: string; value: string }>>([])

  // http/sse 配置
  const [url, setUrl] = useState('')
  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>([])

  // JSON 模式状态
  const [jsonConfig, setJsonConfig] = useState('')

  useEffect(() => {
    if (editingMcp) {
      setServerName(editingMcp.name)
      const config = editingMcp.config

      if (config.type === 'stdio') {
        setServerType('stdio')
        setCommand(config.command || '')
        setArgs(config.args || [])
        setArgInput('')

        if (config.env) {
          setEnvVars(
            Object.entries(config.env).map(([key, value]) => ({
              key,
              value: String(value)
            }))
          )
        } else {
          setEnvVars([])
        }
      } else if (config.type === 'http' || config.type === 'sse') {
        setServerType(config.type)
        setUrl(config.url || '')

        if (config.headers) {
          setHeaders(
            Object.entries(config.headers).map(([key, value]) => ({
              key,
              value: String(value)
            }))
          )
        } else {
          setHeaders([])
        }
      }

      setJsonConfig(JSON.stringify({ [editingMcp.name]: config }, null, 2))
      setEnableImmediately(true)
    } else {
      // 重置所有字段
      resetForm()
    }
  }, [editingMcp, open])

  const resetForm = () => {
    setServerName('')
    setServerType('stdio')
    setCommand('')
    setArgs([])
    setArgInput('')
    setEnvVars([])
    setUrl('')
    setHeaders([])
    setJsonConfig('')
    setEnableImmediately(true)
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

  const handleSave = () => {
    if (tabValue === 0) {
      // 表单模式
      if (!serverName.trim()) {
        alert('请输入服务器名称')
        return
      }

      let config: McpServerConfig

      if (serverType === 'stdio') {
        if (!command.trim()) {
          alert('请输入命令')
          return
        }

        const env: Record<string, string> = {}
        envVars.forEach((envVar) => {
          if (envVar.key.trim() && envVar.value.trim()) {
            env[envVar.key.trim()] = envVar.value.trim()
          }
        })

        config = {
          type: 'stdio',
          command: command.trim(),
          args: args.length > 0 ? args : undefined,
          env: Object.keys(env).length > 0 ? env : undefined
        }
      } else {
        // http 或 sse
        if (!url.trim()) {
          alert('请输入 URL')
          return
        }

        const headerObj: Record<string, string> = {}
        headers.forEach((header) => {
          if (header.key.trim() && header.value.trim()) {
            headerObj[header.key.trim()] = header.value.trim()
          }
        })

        const baseConfig = {
          type: serverType,
          url: url.trim()
        }

        if (Object.keys(headerObj).length > 0) {
          config = {
            ...baseConfig,
            headers: headerObj
          } as McpServerConfig
        } else {
          config = baseConfig as McpServerConfig
        }
      }

      onSave(serverName.trim(), config, enableImmediately)
    } else {
      // JSON 模式
      try {
        const parsed = JSON.parse(jsonConfig)
        const names = Object.keys(parsed)
        if (names.length === 0) {
          alert('JSON 配置中没有找到服务器')
          return
        }
        if (names.length > 1) {
          alert('JSON 配置只能包含一个服务器')
          return
        }
        const name = names[0]
        const config = parsed[name]

        onSave(name, config, enableImmediately)
      } catch (error) {
        alert('JSON 格式错误，请检查后重试')
        return
      }
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{editingMcp ? '编辑 MCP 服务器' : '添加 MCP 服务器'}</DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="表单模式" />
            <Tab label="JSON 模式" />
          </Tabs>
        </Box>

        {tabValue === 0 ? (
          <Box sx={{ pt: 2 }}>
            {/* 服务器名称 */}
            <TextField
              label="服务器名称"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              fullWidth
              required
              placeholder="例如：playwright"
              helperText="唯一标识此 MCP 服务器的名称"
              sx={{ mb: 3 }}
            />

            {/* 服务器类型选择 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                服务器类型
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
            </Box>

            {serverType === 'stdio' ? (
              <>
                {/* 命令 */}
                <TextField
                  label="命令"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  fullWidth
                  required
                  placeholder="例如：npx"
                  helperText="要执行的命令或可执行文件路径"
                  sx={{ mb: 2 }}
                />

                {/* 参数列表 */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      命令参数
                    </Typography>
                    <Button
                      size="small"
                      onClick={addArg}
                      disabled={!argInput.trim()}
                      startIcon={<FontAwesomeIcon icon={faPlus} />}
                    >
                      添加
                    </Button>
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    value={argInput}
                    onChange={(e) => setArgInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && argInput.trim() && addArg()}
                    placeholder="输入参数后按 Enter 或点击添加"
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
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      环境变量
                    </Typography>
                    <Button size="small" onClick={addEnvVar} startIcon={<FontAwesomeIcon icon={faPlus} />}>
                      添加
                    </Button>
                  </Box>
                  {envVars.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                      未配置环境变量
                    </Typography>
                  ) : (
                    envVars.map((envVar, index) => (
                      <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <TextField
                          size="small"
                          value={envVar.key}
                          onChange={(e) => updateEnvVar(index, 'key', e.target.value)}
                          placeholder="变量名"
                          sx={{ flex: 1 }}
                        />
                        <TextField
                          size="small"
                          value={envVar.value}
                          onChange={(e) => updateEnvVar(index, 'value', e.target.value)}
                          placeholder="变量值"
                          sx={{ flex: 2 }}
                        />
                        <IconButton size="small" onClick={() => removeEnvVar(index)} color="error">
                          <FontAwesomeIcon icon={faTrash} size="sm" />
                        </IconButton>
                      </Box>
                    ))
                  )}
                </Box>
              </>
            ) : (
              <>
                {/* URL */}
                <TextField
                  label="URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  fullWidth
                  required
                  placeholder="例如：https://example.com/api"
                  helperText="MCP 服务器的完整 URL 地址"
                  sx={{ mb: 2 }}
                />

                {/* 请求头 */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      请求头
                    </Typography>
                    <Button size="small" onClick={addHeader} startIcon={<FontAwesomeIcon icon={faPlus} />}>
                      添加
                    </Button>
                  </Box>
                  {headers.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                      未配置请求头
                    </Typography>
                  ) : (
                    headers.map((header, index) => (
                      <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <TextField
                          size="small"
                          value={header.key}
                          onChange={(e) => updateHeader(index, 'key', e.target.value)}
                          placeholder="Header 名称"
                          sx={{ flex: 1 }}
                        />
                        <TextField
                          size="small"
                          value={header.value}
                          onChange={(e) => updateHeader(index, 'value', e.target.value)}
                          placeholder="Header 值"
                          sx={{ flex: 2 }}
                        />
                        <IconButton size="small" onClick={() => removeHeader(index)} color="error">
                          <FontAwesomeIcon icon={faTrash} size="sm" />
                        </IconButton>
                      </Box>
                    ))
                  )}
                </Box>
              </>
            )}

            {/* 立即生效选项 */}
            <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={enableImmediately}
                    onChange={(e) => setEnableImmediately(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      立即生效
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      启用后，此 MCP 服务器将立即在 Claude Code 中可用
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Box>
        ) : (
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              粘贴 MCP 服务器的 JSON 配置，例如：
            </Typography>
            <Box
              component="pre"
              sx={{
                p: 2,
                mb: 2,
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100'),
                borderRadius: 1,
                overflow: 'auto',
                fontSize: '0.8125rem',
                lineHeight: 1.6,
                color: 'text.primary',
                fontFamily: '"Consolas", "Monaco", "Courier New", monospace',
                whiteSpace: 'pre',
                margin: 0
              }}
            >
              {`{
  "playwright": {
    "type": "stdio",
    "command": "npx",
    "args": ["@playwright/mcp@latest"]
  }
}`}
            </Box>
            <TextField
              fullWidth
              multiline
              rows={12}
              value={jsonConfig}
              onChange={(e) => setJsonConfig(e.target.value)}
              placeholder="粘贴 JSON 配置..."
              sx={{ fontFamily: 'monospace', mb: 3 }}
            />

            {/* 立即生效选项 */}
            <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={enableImmediately}
                    onChange={(e) => setEnableImmediately(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      立即生效
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      启用后，此 MCP 服务器将立即在 Claude Code 中可用
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button onClick={handleSave} variant="contained">
          {editingMcp ? '保存' : '添加'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default McpEditDialog
