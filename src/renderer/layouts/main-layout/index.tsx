import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCode,
  faRobot,
  faChevronDown,
  faChevronUp,
  faDownload,
  faCog
} from '@fortawesome/free-solid-svg-icons'
import TitleBar from '../../components/title-bar'

const drawerWidth = 240

const menuItems = [
  {
    text: 'Claude Code',
    icon: faCode,
    subItems: [
      {
        text: '工具安装',
        icon: faDownload,
        path: '/tool-install'
      },
      {
        text: '供应商配置',
        icon: faCog,
        path: '/vendor'
      }
    ]
  },
  {
    text: 'Codex供应商',
    icon: faRobot,
    path: '/sub-agent'
  }
]

const MainLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    'Claude Code': true // 默认展开 Claude Code 菜单
  })

  const handleMenuClick = (path: string) => {
    navigate(path)
  }

  const handleToggleMenu = (menuText: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuText]: !prev[menuText]
    }))
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      <TitleBar />

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 左侧菜单栏 */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              position: 'relative',
              borderRight: '1px solid rgba(0, 0, 0, 0.12)'
            }
          }}
        >
          <List sx={{ pt: 2 }}>
            {menuItems.map((item) => (
              <Box key={item.text}>
                {/* 主菜单项 */}
                <ListItem disablePadding sx={{ px: 1 }}>
                  <ListItemButton
                    selected={!item.subItems && location.pathname === item.path}
                    onClick={() => {
                      if (item.subItems) {
                        handleToggleMenu(item.text)
                      } else if (item.path) {
                        handleMenuClick(item.path)
                      }
                    }}
                    sx={{
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
                        minWidth: 40,
                        color:
                          !item.subItems && location.pathname === item.path
                            ? 'inherit'
                            : 'action.active'
                      }}
                    >
                      <FontAwesomeIcon icon={item.icon} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: 14,
                        fontWeight: !item.subItems && location.pathname === item.path ? 600 : 500
                      }}
                    />
                    {item.subItems && (
                      <FontAwesomeIcon
                        icon={openMenus[item.text] ? faChevronUp : faChevronDown}
                        style={{ fontSize: '12px' }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>

                {/* 子菜单项 */}
                {item.subItems && (
                  <Collapse in={openMenus[item.text]} timeout="auto" unmountOnExit>
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
                              primary={subItem.text}
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
        </Drawer>

        {/* 右侧内容区域 */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            overflow: 'auto',
            backgroundColor: 'background.default'
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default MainLayout
