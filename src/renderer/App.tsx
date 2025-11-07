import { ThemeProvider, CssBaseline } from '@mui/material'
import { lightTheme, darkTheme } from './theme'
import { ThemeContextProvider, useTheme } from './contexts/ThemeContext'
import AppRoutes from './routes'

function AppContent(): React.JSX.Element {
  const { mode } = useTheme()
  const theme = mode === 'light' ? lightTheme : darkTheme

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
