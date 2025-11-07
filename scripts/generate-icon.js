#!/usr/bin/env node

/**
 * 生成优化的 Windows ICO 图标
 * 将 PNG 转换为适合 NSIS 的小尺寸 ICO 文件
 */

const toIco = require('to-ico')
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const buildDir = path.join(__dirname, '..', 'build')
const inputPng = path.join(buildDir, 'icon.png')
const outputIco = path.join(buildDir, 'icon.ico')
const backupIco = path.join(buildDir, 'icon.ico.backup')

// ICO 需要的尺寸（减少尺寸以减小文件大小）
const sizes = [16, 32, 48, 64, 128, 256]

console.log('🔨 开始生成优化的 ICO 图标...\n')

// 检查输入文件是否存在
if (!fs.existsSync(inputPng)) {
  console.error('❌ 错误: 找不到源文件 build/icon.png')
  process.exit(1)
}

// 备份原有的 ICO 文件（如果存在）
if (fs.existsSync(outputIco)) {
  console.log('📦 备份原有的 icon.ico 到 icon.ico.backup')
  fs.copyFileSync(outputIco, backupIco)
}

// 生成不同尺寸的 PNG 缓冲区
async function generateIco() {
  try {
    console.log(`🖼️  正在生成 ${sizes.join(', ')} 像素的图标...`)

    const buffers = await Promise.all(
      sizes.map((size) =>
        sharp(inputPng)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .png()
          .toBuffer()
      )
    )

    console.log('🔄 合并为 ICO 文件...')
    const icoBuffer = await toIco(buffers)

    fs.writeFileSync(outputIco, icoBuffer)

    const stats = fs.statSync(outputIco)
    const fileSizeInKB = (stats.size / 1024).toFixed(2)

    console.log('✅ ICO 图标生成成功!')
    console.log(`📄 输出文件: ${outputIco}`)
    console.log(`📊 文件大小: ${fileSizeInKB} KB`)
    console.log(`🎨 包含尺寸: ${sizes.join('x, ')}x 像素`)

    if (stats.size > 500 * 1024) {
      console.warn('⚠️  警告: ICO 文件仍然较大 (> 500KB)，可能需要进一步优化')
    } else {
      console.log('✨ 文件大小合适，可以正常用于 NSIS 打包')
    }

    // 删除备份文件
    if (fs.existsSync(backupIco)) {
      fs.unlinkSync(backupIco)
    }
  } catch (err) {
    console.error('❌ 生成 ICO 失败:', err.message)

    // 如果失败，恢复备份
    if (fs.existsSync(backupIco)) {
      console.log('♻️  恢复原有的 icon.ico')
      fs.copyFileSync(backupIco, outputIco)
      fs.unlinkSync(backupIco)
    }

    process.exit(1)
  }
}

generateIco()
