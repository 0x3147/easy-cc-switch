import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@': resolve('src')
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    resolve: {
      alias: {
        '@': resolve('src')
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve('src'),
        '@renderer': resolve('src/renderer')
      }
    },
    plugins: [react()]
  }
})
