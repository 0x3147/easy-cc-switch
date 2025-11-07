import { useEffect } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { lightTheme, darkTheme } from './theme'
import { ThemeContextProvider, useTheme } from './contexts/ThemeContext'
import i18n from './i18n' // 初始化 i18n
import AppRoutes from './routes'

function AppContent(): React.JSX.Element {
  const { actualTheme } = useTheme()
  const theme = actualTheme === 'light' ? lightTheme : darkTheme

  // 初始化时从 electron-store 加载语言设置
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await window.api.getLanguage()
        if (savedLanguage && savedLanguage !== i18n.language) {
          i18n.changeLanguage(savedLanguage)
        }
      } catch (error) {
        console.error('Failed to load language:', error)
      }
    }
    loadLanguage()
  }, [])

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
