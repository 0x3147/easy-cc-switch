import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Tooltip
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronDown,
  faChevronUp,
  faDownload,
  faCog,
  faFileAlt,
  faFolderOpen,
  faChevronLeft,
  faChevronRight,
  faServer,
  faStore
} from '@fortawesome/free-solid-svg-icons'
import TitleBar from '../../components/title-bar'
import claudeLogo from '../../assets/images/claude-logo.svg'
import openaiLogo from '../../assets/images/openai-logo.svg'

const drawerWidth = 240
const drawerCollapsedWidth = 64

type MenuItem = {
  key: string
  iconType: 'image'
  iconSrc: string
  subItems: {
    key: string
    icon: any
    path: string
  }[]
}

const menuItems: MenuItem[] = [
  {
    key: 'claudeCode',
    iconType: 'image' as const,
    iconSrc: claudeLogo,
    subItems: [
      {
        key: 'toolInstall',
        icon: faDownload,
        path: '/claude-code/tool-install'
      },
      {
        key: 'vendorConfig',
        icon: faCog,
        path: '/claude-code/vendor'
      },
      {
        key: 'claudeDocs',
        icon: faFileAlt,
        path: '/claude-code/claude-docs'
      },
      {
        key: 'projectConfig',
        icon: faFolderOpen,
        path: '/claude-code/project-config'
      },
      {
        key: 'globalMcp',
        icon: faServer,
        path: '/claude-code/global-mcp'
      },
      {
        key: 'mcpMarketplace',
        icon: faStore,
        path: '/claude-code/mcp-marketplace'
      }
    ]
  },
  {
    key: 'codex',
    iconType: 'image' as const,
    iconSrc: openaiLogo,
    subItems: [
      {
        key: 'toolInstall',
        icon: faDownload,
        path: '/codex/tool-install'
      },
      {
        key: 'vendorConfig',
        icon: faCog,
        path: '/codex/vendor'
      }
    ]
  }
]

const MainLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    claudeCode: true, // 默认展开 Claude Code 菜单
    codex: false // 默认折叠 Codex 菜单
  })
  const [drawerOpen, setDrawerOpen] = useState(true) // 侧边栏展开状态

  const handleMenuClick = (path: string) => {
    navigate(path)
  }

  const handleToggleMenu = (menuText: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuText]: !prev[menuText]
    }))
  }

  const handleToggleDrawer = () => {
    setDrawerOpen(!drawerOpen)
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      <TitleBar />

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 左侧菜单栏 */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerOpen ? drawerWidth : drawerCollapsedWidth,
            flexShrink: 0,
            transition: 'width 0.3s',
            '& .MuiDrawer-paper': {
              width: drawerOpen ? drawerWidth : drawerCollapsedWidth,
              boxSizing: 'border-box',
              position: 'relative',
              borderRight: '1px solid rgba(0, 0, 0, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'width 0.3s',
              overflowX: 'hidden'
            }
          }}
        >
          {/* 主菜单区域 */}
          <List sx={{ pt: 2, flex: 1 }}>
            {menuItems.map((item) => (
              <Box key={item.key}>
                {/* 主菜单项 */}
                <ListItem disablePadding sx={{ px: 1 }}>
                  <ListItemButton
                    onClick={() => {
                      if (item.subItems) {
                        if (drawerOpen) {
                          handleToggleMenu(item.key)
                        } else {
                          // 收起状态下，点击展开侧边栏并展开菜单
                          setDrawerOpen(true)
                          setOpenMenus((prev) => ({
                            ...prev,
                            [item.key]: true
                          }))
                        }
                      }
                    }}
                    sx={{
                      borderRadius: 1,
                      justifyContent: drawerOpen ? 'initial' : 'center'
                    }}
                  >
                    <Tooltip title={!drawerOpen ? t(`menu.${item.key}`) : ''} placement="right">
                      <ListItemIcon
                        sx={{
                          minWidth: drawerOpen ? 40 : 'unset',
                          mr: drawerOpen ? 2 : 0,
                          justifyContent: 'center'
                        }}
                      >
                        <Box
                          component="img"
                          src={item.iconSrc}
                          sx={{
                            width: 20,
                            height: 20,
                            objectFit: 'contain'
                          }}
                        />
                      </ListItemIcon>
                    </Tooltip>
                    {drawerOpen && (
                      <>
                        <ListItemText
                          primary={t(`menu.${item.key}`)}
                          primaryTypographyProps={{
                            fontSize: 14,
                            fontWeight: 500
                          }}
                        />
                        {item.subItems && (
                          <FontAwesomeIcon
                            icon={openMenus[item.key] ? faChevronUp : faChevronDown}
                            style={{ fontSize: '12px' }}
                          />
                        )}
                      </>
                    )}
                  </ListItemButton>
                </ListItem>

                {/* 子菜单项 */}
                {item.subItems && drawerOpen && (
                  <Collapse in={openMenus[item.key]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.subItems.map((subItem) => (
                        <ListItem key={subItem.path} disablePadding sx={{ px: 1 }}>
                          <ListItemButton
                            selected={location.pathname === subItem.path}
                            onClick={() => handleMenuClick(subItem.path)}
                            sx={{
                              pl: 4,
                              borderRadius: 1,
                              '&.Mui-selected': {
                                backgroundColor: 'primary.main',
                                color: 'primary.contrastText',
                                '&:hover': {
                                  backgroundColor: 'primary.dark'
                                },
                                '& .MuiListItemIcon-root': {
                                  color: 'primary.contrastText'
                                }
                              }
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 36,
                                color:
                                  location.pathname === subItem.path ? 'inherit' : 'action.active'
                              }}
                            >
                              <FontAwesomeIcon icon={subItem.icon} style={{ fontSize: '14px' }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={t(`menu.${subItem.key}`)}
                              primaryTypographyProps={{
                                fontSize: 13,
                                fontWeight: location.pathname === subItem.path ? 600 : 400
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                )}
              </Box>
            ))}
          </List>

          {/* 设置菜单 */}
          <List sx={{ pb: 1 }}>
            <ListItem disablePadding sx={{ px: 1 }}>
              <ListItemButton
                selected={location.pathname === '/settings'}
                onClick={() => handleMenuClick('/settings')}
                sx={{
                  borderRadius: 1,
                  justifyContent: drawerOpen ? 'initial' : 'center',
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark'
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText'
                    }
                  }
                }}
              >
                <Tooltip title={!drawerOpen ? t('menu.settings') : ''} placement="right">
                  <ListItemIcon
                    sx={{
                      minWidth: drawerOpen ? 40 : 'unset',
                      mr: drawerOpen ? 2 : 0,
                      color: location.pathname === '/settings' ? 'inherit' : 'action.active',
                      justifyContent: 'center'
                    }}
                  >
                    <FontAwesomeIcon icon={faCog} style={{ fontSize: '16px' }} />
                  </ListItemIcon>
                </Tooltip>
                {drawerOpen && (
                  <ListItemText
                    primary={t('menu.settings')}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: location.pathname === '/settings' ? 600 : 500
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          </List>

          {/* 折叠/展开按钮 */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              py: 1,
              borderTop: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Tooltip title={drawerOpen ? '收起侧边栏' : '展开侧边栏'} placement="right">
              <IconButton onClick={handleToggleDrawer} size="small">
                <FontAwesomeIcon icon={drawerOpen ? faChevronLeft : faChevronRight} />
              </IconButton>
            </Tooltip>
          </Box>
        </Drawer>

        {/* 右侧内容区域 */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            overflow: 'auto',
            backgroundColor: 'background.default',
            transition: 'margin 0.3s'
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default MainLayout
