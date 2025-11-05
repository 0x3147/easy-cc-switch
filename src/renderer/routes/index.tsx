import { HashRouter, useRoutes, RouteObject, Navigate } from 'react-router-dom'
import MainLayout from '../layouts/main-layout'
import ClaudeCodeToolInstall from '../pages/claude-code/tool-install'
import ClaudeCodeVendor from '../pages/claude-code/vendor'
import CodexToolInstall from '../pages/codex/tool-install'
import CodexVendor from '../pages/codex/vendor'

const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/claude-code/tool-install" replace />
      },
      {
        path: 'claude-code/tool-install',
        element: <ClaudeCodeToolInstall />
      },
      {
        path: 'claude-code/vendor',
        element: <ClaudeCodeVendor />
      },
      {
        path: 'codex/tool-install',
        element: <CodexToolInstall />
      },
      {
        path: 'codex/vendor',
        element: <CodexVendor />
      }
    ]
  }
]

const Router = () => {
  return useRoutes(routes)
}

const AppRoutes = () => {
  return (
    <HashRouter>
      <Router />
    </HashRouter>
  )
}

export default AppRoutes
