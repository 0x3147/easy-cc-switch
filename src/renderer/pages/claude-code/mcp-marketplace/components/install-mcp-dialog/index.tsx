import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert
} from '@mui/material'
import type { McpMarketplaceItem } from '@/shared/types/mcp'
import type { ClaudeProjectConfig } from '@/shared/types/claude-project'

interface InstallMcpDialogProps {
  open: boolean
  item: McpMarketplaceItem | null
  onClose: () => void
  onInstall: (installType: 'global' | 'project', projectPath?: string) => void
}

const InstallMcpDialog = ({ open, item, onClose, onInstall }: InstallMcpDialogProps) => {
  const [installType, setInstallType] = useState<'global' | 'project'>('global')
  const [selectedProject, setSelectedProject] = useState('')
  const [projects, setProjects] = useState<ClaudeProjectConfig[]>([])

  useEffect(() => {
    if (open) {
      loadProjects()
    }
  }, [open])

  const loadProjects = async () => {
    try {
      const data = await window.api.getAllProjects()
      setProjects(data)
    } catch (error) {
      console.error('加载项目列表失败:', error)
    }
  }

  const handleInstall = () => {
    if (installType === 'project' && !selectedProject) {
      alert('请选择要安装到的项目')
      return
    }

    onInstall(installType, installType === 'project' ? selectedProject : undefined)
    handleClose()
  }

  const handleClose = () => {
    setInstallType('global')
    setSelectedProject('')
    onClose()
  }

  if (!item) return null

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>安装 {item.name}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {/* 显示 MCP 信息 */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>{item.name}</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.description}
            </Typography>
          </Alert>

          {/* 安装位置选择 */}
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
              选择安装位置
            </FormLabel>
            <RadioGroup value={installType} onChange={(e) => setInstallType(e.target.value as 'global' | 'project')}>
              <FormControlLabel
                value="global"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      全局安装
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      安装到 Claude Code 全局配置，所有项目都可使用
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="project"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      项目安装
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      仅在指定项目中可用
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>

          {/* 项目选择 */}
          {installType === 'project' && (
            <Box sx={{ mt: 3 }}>
              <FormControl fullWidth>
                <FormLabel sx={{ mb: 1, fontWeight: 600 }}>选择项目</FormLabel>
                {projects.length === 0 ? (
                  <Alert severity="warning">
                    暂无可用项目，请先在 Claude Code 中打开项目
                  </Alert>
                ) : (
                  <Select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      请选择项目
                    </MenuItem>
                    {projects.map((project) => (
                      <MenuItem key={project.path} value={project.path}>
                        <Box>
                          <Typography variant="body2">
                            {project.path.split(/[/\\]/).pop()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {project.path}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                )}
              </FormControl>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>取消</Button>
        <Button
          onClick={handleInstall}
          variant="contained"
          disabled={installType === 'project' && (!selectedProject || projects.length === 0)}
        >
          安装
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default InstallMcpDialog
