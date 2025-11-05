import { HashRouter, useRoutes, RouteObject, Navigate } from 'react-router-dom'
import MainLayout from '../layouts/main-layout'
import ToolInstall from '../pages/tool-install'
import VendorPage from '../pages/vendor'
import SubAgentPage from '../pages/sub-agent'

const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/tool-install" replace />
      },
      {
        path: 'tool-install',
        element: <ToolInstall />
      },
      {
        path: 'vendor',
        element: <VendorPage />
      },
      {
        path: 'sub-agent',
        element: <SubAgentPage />
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
