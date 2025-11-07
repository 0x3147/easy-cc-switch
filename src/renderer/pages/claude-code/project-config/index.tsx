import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Alert
} from '@mui/material'
import {
  Folder as FolderIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material'
import type { ClaudeProjectConfig } from '@/shared/types/claude-project'

export default function ProjectConfig() {
  const [projects, setProjects] = useState<ClaudeProjectConfig[]>([])
  const [selectedProject, setSelectedProject] = useState<ClaudeProjectConfig | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mcpDialogOpen, setMcpDialogOpen] = useState(false)
  const [mcpJson, setMcpJson] = useState('')

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const data = await window.api.getAllProjects()
      setProjects(data)
    } catch (error) {
      console.error('加载项目配置失败:', error)
    }
  }

  const handleCardClick = (project: ClaudeProjectConfig) => {
    setSelectedProject(project)
    setDialogOpen(true)
  }

  const handleDelete = async (path: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('确定要删除此项目配置吗？')) {
      try {
        await window.api.deleteProject(path)
        await loadProjects()
      } catch (error) {
        console.error('删除项目失败:', error)
      }
    }
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setSelectedProject(null)
  }

  const handleSave = async () => {
    if (!selectedProject) return
    setLoading(true)
    try {
      await window.api.updateProject({
        path: selectedProject.path,
        config: {
          allowedTools: selectedProject.allowedTools,
          mcpContextUris: selectedProject.mcpContextUris,
          mcpServers: selectedProject.mcpServers,
          enabledMcpjsonServers: selectedProject.enabledMcpjsonServers,
          disabledMcpjsonServers: selectedProject.disabledMcpjsonServers,
          hasTrustDialogAccepted: selectedProject.hasTrustDialogAccepted,
          hasClaudeMdExternalIncludesApproved: selectedProject.hasClaudeMdExternalIncludesApproved
        }
      })
      await loadProjects()
      handleDialogClose()
    } catch (error) {
      console.error('保存配置失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMcp = (name: string) => {
    if (!selectedProject) return
    const newMcpServers = { ...selectedProject.mcpServers }
    delete newMcpServers[name]
    setSelectedProject({ ...selectedProject, mcpServers: newMcpServers })
  }

  const handleAddMcp = () => {
    if (!selectedProject || !mcpJson.trim()) return
    try {
      const parsed = JSON.parse(mcpJson)
      setSelectedProject({
        ...selectedProject,
        mcpServers: { ...selectedProject.mcpServers, ...parsed }
      })
      setMcpJson('')
      setMcpDialogOpen(false)
    } catch (error) {
      alert('JSON 格式错误，请检查后重试')
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        项目配置管理
      </Typography>

      {projects.length === 0 ? (
        <Alert severity="info">暂无项目配置，请先在项目中使用 Claude Code</Alert>
      ) : (
        <Stack spacing={2}>
          {projects.map((project) => (
            <Card key={project.path}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <FolderIcon sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {project.path.split(/[/\\]/).pop()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {project.path}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {project.hasTrustDialogAccepted && (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="已信任"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                    {Object.keys(project.mcpServers).length > 0 && (
                      <Chip
                        label={`${Object.keys(project.mcpServers).length} MCP`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<SettingsIcon />}
                      onClick={() => handleCardClick(project)}
                    >
                      配置
                    </Button>
                    <IconButton color="error" onClick={(e) => handleDelete(project.path, e)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>项目配置</DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="项目路径"
                value={selectedProject.path}
                disabled
                sx={{ mb: 3 }}
              />

              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                安全设置
              </Typography>
              <Box sx={{ mb: 3, pl: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedProject.hasTrustDialogAccepted}
                      onChange={(e) =>
                        setSelectedProject({
                          ...selectedProject,
                          hasTrustDialogAccepted: e.target.checked
                        })
                      }
                    />
                  }
                  label="已接受项目信任对话框"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedProject.hasClaudeMdExternalIncludesApproved}
                      onChange={(e) =>
                        setSelectedProject({
                          ...selectedProject,
                          hasClaudeMdExternalIncludesApproved: e.target.checked
                        })
                      }
                    />
                  }
                  label="允许 CLAUDE.md 外部引用"
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  MCP 服务器
                </Typography>
                <Button size="small" onClick={() => setMcpDialogOpen(true)}>
                  添加 MCP
                </Button>
              </Box>
              <Box>
                {Object.keys(selectedProject.mcpServers).length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    未配置 MCP 服务器
                  </Typography>
                ) : (
                  Object.entries(selectedProject.mcpServers).map(([name, config]) => (
                    <Box
                      key={name}
                      sx={{
                        p: 1.5,
                        mb: 1,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {config.command || config.url}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteMcp(name)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>取消</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
            保存
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={mcpDialogOpen} onClose={() => setMcpDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>添加 MCP 服务器</DialogTitle>
        <DialogContent>
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
            rows={8}
            value={mcpJson}
            onChange={(e) => setMcpJson(e.target.value)}
            placeholder="粘贴 JSON 配置..."
            sx={{ fontFamily: 'monospace' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMcpDialogOpen(false)}>取消</Button>
          <Button onClick={handleAddMcp} variant="contained">
            添加
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
