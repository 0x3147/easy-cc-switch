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
    plugins: [externalizeDepsPlugin()],
    build: {
      // 主进程代码保护
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    }
  },
  preload: {
    resolve: {
      alias: {
        '@': resolve('src')
      }
    },
    plugins: [externalizeDepsPlugin()],
    build: {
      // 预加载脚本代码保护
      minify: 'esbuild'
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve('src'),
        '@renderer': resolve('src/renderer')
      }
    },
    plugins: [react()],
    build: {
      // 渲染进程代码保护
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks(id) {
            // 分包策略
            if (id.includes('node_modules')) {
              if (id.includes('@mui')) {
                return 'vendor-mui'
              }
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react'
              }
              return 'vendor'
            }
            return undefined
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      },
      sourcemap: false,
      chunkSizeWarningLimit: 1000
    }
  }
})
