import { ThemeProvider, CssBaseline } from '@mui/material'
import { lightTheme, darkTheme } from './theme'
import { ThemeContextProvider, useTheme } from './contexts/ThemeContext'
import './i18n' // 初始化 i18n
import AppRoutes from './routes'

function AppContent(): React.JSX.Element {
  const { actualTheme } = useTheme()
  const theme = actualTheme === 'light' ? lightTheme : darkTheme

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRoutes />
    </ThemeProvider>
  )
}

function App(): React.JSX.Element {
  return (
    <ThemeContextProvider>
      <AppContent />
    </ThemeContextProvider>
  )
}

export default App
