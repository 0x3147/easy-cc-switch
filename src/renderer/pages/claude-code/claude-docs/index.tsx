import { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme as useMuiTheme } from '@mui/material/styles'
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faSave,
  faEye,
  faEdit,
  faBold,
  faItalic,
  faHeading,
  faQuoteLeft,
  faListUl,
  faListOl,
  faLink,
  faImage,
  faCode,
  faFileAlt,
  faPlus
} from '@fortawesome/free-solid-svg-icons'
import SimpleMDE from 'react-simplemde-editor'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import 'easymde/dist/easymde.min.css'

type ViewMode = 'edit' | 'preview'

const ClaudeDocsPage = () => {
  const { t } = useTranslation()
  const muiTheme = useMuiTheme()
  const isDarkMode = muiTheme.palette.mode === 'dark'
  const [content, setContent] = useState<string>('')
  const [originalContent, setOriginalContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fileExists, setFileExists] = useState(false)
  const [creating, setCreating] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('edit')
  const [editorInstance, setEditorInstance] = useState<any>(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })

  // 加载 Markdown 内容
  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    setLoading(true)
    try {
      // 先检查文件是否存在
      const exists = await window.api.checkClaudeMdExists()
      setFileExists(exists)

      if (exists) {
        // 文件存在，加载内容
        const mdContent = await window.api.getClaudeMd()
        setContent(mdContent)
        setOriginalContent(mdContent)
      }
    } catch (error) {
      console.error('加载 CLAUDE.md 失败:', error)
      setSnackbar({
        open: true,
        message: t('claudeDocs.loadFailed'),
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  // 保存内容
  const handleSave = async () => {
    setSaving(true)
    try {
      const success = await window.api.saveClaudeMd(content)
      if (success) {
        setOriginalContent(content)
        setFileExists(true)
        setSnackbar({
          open: true,
          message: t('claudeDocs.saveSuccess'),
          severity: 'success'
        })
      } else {
        setSnackbar({
          open: true,
          message: t('claudeDocs.saveFailed'),
          severity: 'error'
        })
      }
    } catch (error) {
      console.error('保存 CLAUDE.md 失败:', error)
      setSnackbar({
        open: true,
        message: t('claudeDocs.saveFailed'),
        severity: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  // 创建新文件
  const handleCreateFile = async () => {
    setCreating(true)
    try {
      const success = await window.api.createClaudeMd()
      if (success) {
        setSnackbar({
          open: true,
          message: t('claudeDocs.createSuccess'),
          severity: 'success'
        })
        // 重新加载内容
        await loadContent()
      } else {
        setSnackbar({
          open: true,
          message: t('claudeDocs.createFailed'),
          severity: 'error'
        })
      }
    } catch (error) {
      console.error('创建 CLAUDE.md 失败:', error)
      setSnackbar({
        open: true,
        message: t('claudeDocs.createFailed'),
        severity: 'error'
      })
    } finally {
      setCreating(false)
    }
  }

  // 检测是否有未保存的更改
  const hasUnsavedChanges = useMemo(() => {
    return content !== originalContent
  }, [content, originalContent])

  // SimpleMDE 配置
  const editorOptions = useMemo(() => {
    return {
      spellChecker: false,
      placeholder: t('claudeDocs.editorPlaceholder'),
      status: ['lines', 'words', 'cursor'] as any,
      toolbar: false, // 禁用默认工具栏
      minHeight: '500px',
      maxHeight: '70vh'
    }
  }, [t])

  // 编辑器工具栏操作
  const insertMarkdown = (before: string, after: string = '') => {
    if (!editorInstance) return
    const cm = editorInstance.codemirror
    const selection = cm.getSelection()
    const text = selection || '文本'
    cm.replaceSelection(`${before}${text}${after}`)
    cm.focus()
  }

  const handleEditorChange = useCallback((value: string) => {
    setContent(value)
  }, [])

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '60vh'
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  // 文件不存在时的空状态
  if (!fileExists) {
    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
            {t('claudeDocs.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('claudeDocs.description')}
          </Typography>
        </Box>

        <Paper
          sx={{
            p: 8,
            textAlign: 'center',
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: '2px dashed',
            borderColor: 'divider'
          }}
        >
          <Box sx={{ mb: 3 }}>
            <FontAwesomeIcon
              icon={faFileAlt}
              style={{ fontSize: '80px', color: '#bdbdbd', opacity: 0.6 }}
            />
          </Box>
          <Typography variant="h5" color="text.primary" gutterBottom sx={{ fontWeight: 500 }}>
            {t('claudeDocs.noFile')}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
          >
            {t('claudeDocs.noFileDesc')}
          </Typography>
          <Button
            variant="contained"
            size="large"
            color="primary"
            onClick={handleCreateFile}
            disabled={creating}
            startIcon={
              creating ? <CircularProgress size={20} /> : <FontAwesomeIcon icon={faPlus} />
            }
            sx={{ px: 4 }}
          >
            {creating ? t('claudeDocs.creating') : t('claudeDocs.createFile')}
          </Button>
        </Paper>

        {/* 提示消息 */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    )
  }

  return (
    <Box>
      {/* 标题和操作栏 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 3
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
            {t('claudeDocs.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('claudeDocs.description')}
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          {/* 视图切换 */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="edit">
              <FontAwesomeIcon icon={faEdit} style={{ marginRight: '8px' }} />
              {t('claudeDocs.editMode')}
            </ToggleButton>
            <ToggleButton value="preview">
              <FontAwesomeIcon icon={faEye} style={{ marginRight: '8px' }} />
              {t('claudeDocs.previewMode')}
            </ToggleButton>
          </ToggleButtonGroup>

          {/* 保存按钮 */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={!hasUnsavedChanges || saving}
            startIcon={saving ? <CircularProgress size={20} /> : <FontAwesomeIcon icon={faSave} />}
          >
            {saving ? t('claudeDocs.saving') : t('claudeDocs.save')}
          </Button>
        </Stack>
      </Box>

      {/* 未保存更改提示 */}
      {hasUnsavedChanges && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t('claudeDocs.unsavedChanges')}
        </Alert>
      )}

      {/* 编辑器/预览区域 */}
      <Paper
        sx={{
          overflow: 'hidden',
          borderRadius: 2
        }}
      >
        {viewMode === 'edit' ? (
          <Box>
            {/* 自定义工具栏 */}
            <Box
              sx={{
                p: 1,
                borderBottom: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.default',
                display: 'flex',
                gap: 0.5,
                flexWrap: 'wrap'
              }}
            >
              <Tooltip title="粗体">
                <IconButton size="small" onClick={() => insertMarkdown('**', '**')}>
                  <FontAwesomeIcon icon={faBold} fontSize="14px" />
                </IconButton>
              </Tooltip>
              <Tooltip title="斜体">
                <IconButton size="small" onClick={() => insertMarkdown('*', '*')}>
                  <FontAwesomeIcon icon={faItalic} fontSize="14px" />
                </IconButton>
              </Tooltip>
              <Tooltip title="标题">
                <IconButton size="small" onClick={() => insertMarkdown('## ', '')}>
                  <FontAwesomeIcon icon={faHeading} fontSize="14px" />
                </IconButton>
              </Tooltip>

              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

              <Tooltip title="引用">
                <IconButton size="small" onClick={() => insertMarkdown('> ', '')}>
                  <FontAwesomeIcon icon={faQuoteLeft} fontSize="14px" />
                </IconButton>
              </Tooltip>
              <Tooltip title="无序列表">
                <IconButton size="small" onClick={() => insertMarkdown('- ', '')}>
                  <FontAwesomeIcon icon={faListUl} fontSize="14px" />
                </IconButton>
              </Tooltip>
              <Tooltip title="有序列表">
                <IconButton size="small" onClick={() => insertMarkdown('1. ', '')}>
                  <FontAwesomeIcon icon={faListOl} fontSize="14px" />
                </IconButton>
              </Tooltip>

              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

              <Tooltip title="链接">
                <IconButton size="small" onClick={() => insertMarkdown('[', '](url)')}>
                  <FontAwesomeIcon icon={faLink} fontSize="14px" />
                </IconButton>
              </Tooltip>
              <Tooltip title="图片">
                <IconButton size="small" onClick={() => insertMarkdown('![', '](url)')}>
                  <FontAwesomeIcon icon={faImage} fontSize="14px" />
                </IconButton>
              </Tooltip>
              <Tooltip title="代码">
                <IconButton size="small" onClick={() => insertMarkdown('`', '`')}>
                  <FontAwesomeIcon icon={faCode} fontSize="14px" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* 编辑器 */}
            <Box
              sx={{
                '& .EasyMDEContainer': {
                  border: 'none'
                },
                '& .CodeMirror': {
                  borderRadius: 0,
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  lineHeight: 1.6,
                  border: 'none',
                  backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
                  color: isDarkMode ? '#d4d4d4' : '#000000'
                },
                '& .CodeMirror-scroll': {
                  minHeight: '500px'
                },
                '& .CodeMirror-gutters': {
                  backgroundColor: isDarkMode ? '#1e1e1e' : '#f5f5f5',
                  borderRight: isDarkMode ? '1px solid #3e3e3e' : '1px solid #ddd'
                },
                '& .CodeMirror-linenumber': {
                  color: isDarkMode ? '#858585' : '#999'
                },
                '& .CodeMirror-cursor': {
                  borderLeft: isDarkMode ? '1px solid #aeafad' : '1px solid black'
                },
                '& .CodeMirror-selected': {
                  backgroundColor: isDarkMode ? '#264f78' : '#d7d4f0'
                },
                '& .CodeMirror-line::selection, & .CodeMirror-line > span::selection, & .CodeMirror-line > span > span::selection':
                  {
                    backgroundColor: isDarkMode ? '#264f78' : '#d7d4f0'
                  },
                '& .cm-header': {
                  color: isDarkMode ? '#569cd6' : '#0000ff'
                },
                '& .cm-quote': {
                  color: isDarkMode ? '#6a9955' : '#008000'
                },
                '& .cm-link': {
                  color: isDarkMode ? '#4ec9b0' : '#0000ee'
                },
                '& .cm-url': {
                  color: isDarkMode ? '#4ec9b0' : '#0000ee'
                },
                '& .cm-strong': {
                  fontWeight: 'bold',
                  color: isDarkMode ? '#d4d4d4' : '#000000'
                },
                '& .cm-em': {
                  fontStyle: 'italic',
                  color: isDarkMode ? '#d4d4d4' : '#000000'
                },
                '& .CodeMirror-placeholder': {
                  color: isDarkMode ? '#858585' : '#999'
                }
              }}
            >
              <SimpleMDE
                value={content}
                onChange={handleEditorChange}
                options={editorOptions}
                getMdeInstance={(instance) => setEditorInstance(instance)}
              />
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              p: 4,
              minHeight: '500px',
              maxHeight: '70vh',
              overflow: 'auto',
              '& h1': {
                fontSize: '2rem',
                fontWeight: 600,
                mt: 3,
                mb: 2,
                borderBottom: '2px solid',
                borderColor: 'divider',
                pb: 1
              },
              '& h2': {
                fontSize: '1.5rem',
                fontWeight: 600,
                mt: 2.5,
                mb: 1.5
              },
              '& h3': {
                fontSize: '1.25rem',
                fontWeight: 600,
                mt: 2,
                mb: 1
              },
              '& p': {
                mb: 1.5,
                lineHeight: 1.7
              },
              '& code': {
                backgroundColor: 'action.hover',
                px: 0.8,
                py: 0.3,
                borderRadius: 1,
                fontSize: '0.875em',
                fontFamily: 'monospace'
              },
              '& pre': {
                backgroundColor: 'action.hover',
                p: 2,
                borderRadius: 1,
                overflow: 'auto',
                mb: 2
              },
              '& pre code': {
                backgroundColor: 'transparent',
                p: 0
              },
              '& ul, & ol': {
                pl: 3,
                mb: 2
              },
              '& li': {
                mb: 0.5
              },
              '& blockquote': {
                borderLeft: '4px solid',
                borderColor: 'primary.main',
                pl: 2,
                ml: 0,
                fontStyle: 'italic',
                color: 'text.secondary'
              },
              '& table': {
                width: '100%',
                borderCollapse: 'collapse',
                mb: 2
              },
              '& th, & td': {
                border: '1px solid',
                borderColor: 'divider',
                p: 1,
                textAlign: 'left'
              },
              '& th': {
                backgroundColor: 'action.hover',
                fontWeight: 600
              },
              '& img': {
                maxWidth: '100%',
                height: 'auto',
                borderRadius: 1
              },
              '& a': {
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }
            }}
          >
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>
                {t('claudeDocs.emptyContent')}
              </Typography>
            )}
          </Box>
        )}
      </Paper>

      {/* 提示消息 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ClaudeDocsPage
