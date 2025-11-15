import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
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
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material'
import type { ClaudeProjectConfig } from '@/shared/types/claude-project'
import type { McpServerConfig } from '@/shared/types/mcp'
import McpEditDialog from './components/mcp-edit-dialog'

export default function ProjectConfig() {
  const [projects, setProjects] = useState<ClaudeProjectConfig[]>([])
  const [selectedProject, setSelectedProject] = useState<ClaudeProjectConfig | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mcpDialogOpen, setMcpDialogOpen] = useState(false)
  const [mcpExpanded, setMcpExpanded] = useState(false)
  const [editingMcp, setEditingMcp] = useState<{ name: string; config: any } | null>(null)

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

    // 从 enabledMcpjsonServers 和 disabledMcpjsonServers 中移除
    const newEnabledMcpjsonServers = (selectedProject.enabledMcpjsonServers || []).filter(
      (serverName) => serverName !== name
    )
    const newDisabledMcpjsonServers = (selectedProject.disabledMcpjsonServers || []).filter(
      (serverName) => serverName !== name
    )

    setSelectedProject({
      ...selectedProject,
      mcpServers: newMcpServers,
      enabledMcpjsonServers: newEnabledMcpjsonServers,
      disabledMcpjsonServers: newDisabledMcpjsonServers
    })
  }

  const handleToggleMcpStatus = (name: string) => {
    if (!selectedProject) return

    const enabledServers = selectedProject.enabledMcpjsonServers || []
    const disabledServers = selectedProject.disabledMcpjsonServers || []
    const isEnabled = enabledServers.includes(name)

    if (isEnabled) {
      // 禁用：从 enabled 移到 disabled
      setSelectedProject({
        ...selectedProject,
        enabledMcpjsonServers: enabledServers.filter((n) => n !== name),
        disabledMcpjsonServers: [...disabledServers, name]
      })
    } else {
      // 启用：从 disabled 移到 enabled
      setSelectedProject({
        ...selectedProject,
        enabledMcpjsonServers: [...enabledServers, name],
        disabledMcpjsonServers: disabledServers.filter((n) => n !== name)
      })
    }
  }

  const handleSaveMcp = (name: string, config: McpServerConfig, enableImmediately: boolean) => {
    if (!selectedProject) return

    // 如果是编辑模式且名称发生了变化，删除旧的配置
    if (editingMcp && editingMcp.name !== name) {
      const newMcpServers = { ...selectedProject.mcpServers }
      delete newMcpServers[editingMcp.name]

      // 从 enabledMcpjsonServers 和 disabledMcpjsonServers 中移除旧名称
      let newEnabledMcpjsonServers = (selectedProject.enabledMcpjsonServers || []).filter(
        (serverName) => serverName !== editingMcp.name
      )
      let newDisabledMcpjsonServers = (selectedProject.disabledMcpjsonServers || []).filter(
        (serverName) => serverName !== editingMcp.name
      )

      // 根据 enableImmediately 决定添加到哪个数组
      if (enableImmediately) {
        newEnabledMcpjsonServers = [...newEnabledMcpjsonServers, name]
      } else {
        newDisabledMcpjsonServers = [...newDisabledMcpjsonServers, name]
      }

      setSelectedProject({
        ...selectedProject,
        mcpServers: { ...newMcpServers, [name]: config },
        enabledMcpjsonServers: newEnabledMcpjsonServers,
        disabledMcpjsonServers: newDisabledMcpjsonServers
      })
    } else {
      // 添加或更新配置
      let newEnabledMcpjsonServers = (selectedProject.enabledMcpjsonServers || []).filter(
        (serverName) => serverName !== name
      )
      let newDisabledMcpjsonServers = (selectedProject.disabledMcpjsonServers || []).filter(
        (serverName) => serverName !== name
      )

      // 根据 enableImmediately 决定添加到哪个数组
      if (enableImmediately) {
        newEnabledMcpjsonServers = [...newEnabledMcpjsonServers, name]
      } else {
        newDisabledMcpjsonServers = [...newDisabledMcpjsonServers, name]
      }

      setSelectedProject({
        ...selectedProject,
        mcpServers: { ...selectedProject.mcpServers, [name]: config },
        enabledMcpjsonServers: newEnabledMcpjsonServers,
        disabledMcpjsonServers: newDisabledMcpjsonServers
      })
    }

    setEditingMcp(null)
    setMcpDialogOpen(false)
  }

  const handleEditMcp = (name: string, config: any) => {
    setEditingMcp({ name, config })
    setMcpDialogOpen(true)
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
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
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

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1.5
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  MCP 服务器 ({Object.keys(selectedProject.mcpServers).length})
                </Typography>
                <Button
                  size="small"
                  onClick={() => {
                    setEditingMcp(null)
                    setMcpDialogOpen(true)
                  }}
                >
                  添加 MCP
                </Button>
              </Box>
              <Box>
                {Object.keys(selectedProject.mcpServers).length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    未配置 MCP 服务器
                  </Typography>
                ) : (
                  <>
                    {Object.entries(selectedProject.mcpServers)
                      .slice(0, mcpExpanded ? undefined : 3)
                      .map(([name, config]) => {
                        const isEnabled = selectedProject.enabledMcpjsonServers?.includes(name) ?? false
                        return (
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
                              alignItems: 'center',
                              opacity: isEnabled ? 1 : 0.6,
                              transition: 'opacity 0.3s'
                            }}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" fontWeight={600}>
                                  {name}
                                </Typography>
                                <Chip
                                  label={isEnabled ? '已启用' : '已禁用'}
                                  size="small"
                                  color={isEnabled ? 'success' : 'default'}
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {config.command || config.url}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleToggleMcpStatus(name)}
                                title={isEnabled ? '禁用' : '启用'}
                              >
                                <Switch checked={isEnabled} size="small" />
                              </IconButton>
                              <IconButton size="small" onClick={() => handleEditMcp(name, config)}>
                                <SettingsIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteMcp(name)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        )
                      })}
                    {Object.keys(selectedProject.mcpServers).length > 3 && (
                      <Button
                        size="small"
                        fullWidth
                        onClick={() => setMcpExpanded(!mcpExpanded)}
                        sx={{ mt: 1 }}
                      >
                        {mcpExpanded
                          ? '收起'
                          : `展开更多 (${Object.keys(selectedProject.mcpServers).length - 3})`}
                      </Button>
                    )}
                  </>
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

      <McpEditDialog
        open={mcpDialogOpen}
        editingMcp={editingMcp}
        onClose={() => {
          setMcpDialogOpen(false)
          setEditingMcp(null)
        }}
        onSave={handleSaveMcp}
      />
    </Box>
  )
}
