import { ThemeProvider, CssBaseline } from '@mui/material'
import { lightTheme } from './theme'
import AppRoutes from './routes'

function App(): React.JSX.Element {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <AppRoutes />
    </ThemeProvider>
  )
}

export default App
