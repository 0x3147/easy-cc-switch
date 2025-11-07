import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type ThemeMode = 'light' | 'dark'

interface ThemeContextType {
  mode: ThemeMode
  toggleTheme: () => void
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

export const ThemeContextProvider = ({ children }: ThemeProviderProps) => {
  // 从 localStorage 读取保存的主题，默认为浅色
  const [mode, setMode] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem('theme-mode')
    return (savedTheme as ThemeMode) || 'light'
  })

  // 切换主题
  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme-mode', newMode)
      return newMode
    })
  }

  // 监听系统主题变化（可选）
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      // 如果用户没有手动设置主题，跟随系统
      const savedTheme = localStorage.getItem('theme-mode')
      if (!savedTheme) {
        setMode(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return <ThemeContext.Provider value={{ mode, toggleTheme }}>{children}</ThemeContext.Provider>
}
