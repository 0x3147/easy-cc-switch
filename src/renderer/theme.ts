import { createTheme } from '@mui/material/styles'

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1e40af',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#8b5cf6',
      light: '#a78bfa',
      dark: '#7c3aed',
      contrastText: '#ffffff'
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff'
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)'
    },
    divider: 'rgba(0, 0, 0, 0.08)'
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(',')
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px'
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '4px',
            '&:hover': {
              background: 'rgba(0, 0, 0, 0.3)'
            }
          }
        }
      }
    }
  }
})

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#60a5fa',
      light: '#93c5fd',
      dark: '#3b82f6',
      contrastText: '#000000'
    },
    secondary: {
      main: '#a78bfa',
      light: '#c4b5fd',
      dark: '#8b5cf6',
      contrastText: '#000000'
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b'
    },
    text: {
      primary: 'rgba(255, 255, 255, 0.95)',
      secondary: 'rgba(255, 255, 255, 0.7)'
    },
    divider: 'rgba(255, 255, 255, 0.1)'
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(',')
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px'
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.3)'
            }
          }
        }
      }
    }
  }
})
