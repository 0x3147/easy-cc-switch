import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type ThemeMode = 'light' | 'dark' | 'system'
type ActualTheme = 'light' | 'dark'

interface ThemeContextType {
  mode: ThemeMode
  actualTheme: ActualTheme
  setThemeMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

// 获取系统主题
const getSystemTheme = (): ActualTheme => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const ThemeContextProvider = ({ children }: ThemeProviderProps) => {
  // 从 electron-store读取保存的主题，默认为跟随系统
  const [mode, setMode] = useState<ThemeMode>('system')
  const [systemTheme, setSystemTheme] = useState<ActualTheme>(getSystemTheme())

  // 初始化时从 electron-store 加载主题设置
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await window.api.getThemeMode()
        setMode(savedTheme)
      } catch (error) {
        console.error('Failed to load theme mode:', error)
      }
    }
    loadTheme()
  }, [])

  // 计算实际使用的主题
  const actualTheme: ActualTheme = mode === 'system' ? systemTheme : mode

  // 设置主题模式
  const setThemeMode = async (newMode: ThemeMode) => {
    setMode(newMode)
    try {
      await window.api.setThemeMode(newMode)
    } catch (error) {
      console.error('Failed to save theme mode:', error)
    }
  }

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return (
    <ThemeContext.Provider value={{ mode, actualTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  )
}
