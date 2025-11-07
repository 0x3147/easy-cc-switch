#!/usr/bin/env node

/**
 * 打包前检查脚本
 * 验证必要的配置和文件是否就绪
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 检查打包环境...\n')

const checks = [
  {
    name: '检查 build 目录',
    check: () => fs.existsSync(path.join(__dirname, 'build')),
    error: 'build 目录不存在'
  },
  {
    name: '检查应用图标',
    check: () => {
      const buildDir = path.join(__dirname, 'build')
      return (
        fs.existsSync(path.join(buildDir, 'icon.ico')) &&
        fs.existsSync(path.join(buildDir, 'icon.icns')) &&
        fs.existsSync(path.join(buildDir, 'icon.png'))
      )
    },
    error: '缺少应用图标文件（icon.ico, icon.icns, icon.png）'
  },
  {
    name: '检查 package.json',
    check: () => {
      const pkg = require('./package.json')
      return pkg.name && pkg.version && pkg.productName
    },
    error: 'package.json 缺少必要字段'
  },
  {
    name: '检查 electron-builder.yml',
    check: () => fs.existsSync(path.join(__dirname, 'electron-builder.yml')),
    error: 'electron-builder.yml 不存在'
  },
  {
    name: '检查 node_modules',
    check: () => fs.existsSync(path.join(__dirname, 'node_modules')),
    error: 'node_modules 不存在，请先运行 npm install'
  }
]

let allPassed = true

checks.forEach((check, index) => {
  const passed = check.check()
  const status = passed ? '✅' : '❌'
  console.log(`${index + 1}. ${status} ${check.name}`)

  if (!passed) {
    console.log(`   ⚠️  ${check.error}`)
    allPassed = false
  }
})

console.log('')

if (allPassed) {
  console.log('✅ 所有检查通过！可以开始打包。')
  console.log('\n推荐的打包命令：')
  console.log('  Windows: npm run build:win')
  console.log('  macOS:   npm run build:mac')
  console.log('  Linux:   npm run build:linux')
  process.exit(0)
} else {
  console.log('❌ 部分检查失败，请修复后再打包。')
  process.exit(1)
}
