import { ThemeProvider, CssBaseline, Box } from '@mui/material'
import { lightTheme } from './theme'
import TitleBar from './components/title-bar'

function App(): React.JSX.Element {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          backgroundColor: 'background.default',
          overflow: 'hidden'
        }}
      >
        <TitleBar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            overflow: 'auto'
          }}
        >
          {/* 主要内容区域 */}
          <Box sx={{ p: 3 }}>
            <div>应用主体内容</div>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
