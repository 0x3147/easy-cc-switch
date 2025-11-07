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
          // 暂时禁用手动代码分割以避免循环依赖问题
          manualChunks: undefined,
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      },
      sourcemap: false,
      // 调整 chunk size 警告限制（单位：KB）
      chunkSizeWarningLimit: 2000
    },
    // 确保打包后使用相对路径
    base: './'
  }
})
