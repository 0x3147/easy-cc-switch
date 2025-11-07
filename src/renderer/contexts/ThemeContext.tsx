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
  // 从 localStorage 读取保存的主题，默认为跟随系统
  const [mode, setMode] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem('theme-mode')
    return (savedTheme as ThemeMode) || 'system'
  })

  const [systemTheme, setSystemTheme] = useState<ActualTheme>(getSystemTheme())

  // 计算实际使用的主题
  const actualTheme: ActualTheme = mode === 'system' ? systemTheme : mode

  // 设置主题模式
  const setThemeMode = (newMode: ThemeMode) => {
    setMode(newMode)
    localStorage.setItem('theme-mode', newMode)
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
