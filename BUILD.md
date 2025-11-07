# 打包配置说明

## 安装路径配置

应用已配置为允许用户在安装时自定义安装位置：

- **Windows NSIS 安装包**：
  - `allowToChangeInstallationDirectory: true` - 用户可自选安装路径
  - `oneClick: false` - 使用完整安装向导而非一键安装
  - `perMachine: false` - 默认用户级安装，但允许提权
  - 支持中文和英文安装界面

## 代码保护措施

### 1. ASAR 打包

- 所有应用代码打包到 `app.asar` 文件中
- 防止源代码直接暴露
- 提高加载性能

### 2. 代码压缩与混淆

- 使用 esbuild 进行代码压缩
- 移除调试信息和 console 输出
- 变量名混淆
- 移除注释
- 文件名哈希化

### 3. Source Map 禁用

- 生产环境完全禁用 source map
- 防止逆向工程追踪源代码

### 4. 代码签名（可选）

正式发布时建议配置代码签名：

**Windows 签名：**

```bash
# 设置环境变量
export WIN_CSC_LINK=path/to/certificate.pfx
export WIN_CSC_KEY_PASSWORD=your_password

# 或在 electron-builder.yml 中配置
```

**macOS 签名：**

```bash
export MAC_CSC_LINK=path/to/certificate.p12
export MAC_CSC_KEY_PASSWORD=your_password
```

## 构建命令

### Windows 打包

```bash
# 同时构建 x64 和 ia32 版本
npm run build:win

# 仅构建 x64 版本
npm run build:win:x64
```

### macOS 打包

```bash
npm run build:mac
```

### Linux 打包

```bash
npm run build:linux
```

## 安装包特性

### Windows NSIS 安装包特性

✅ 自定义安装路径
✅ 桌面快捷方式
✅ 开始菜单快捷方式
✅ 多语言支持（中文/英文）
✅ 卸载程序
✅ 可选择是否删除用户数据

### macOS DMG 特性

✅ 拖放式安装
✅ 自动签名（需配置）
✅ Notarization 支持（需配置）

### Linux 支持格式

✅ AppImage（无需安装）
✅ Snap
✅ Deb 包

## 安全建议

1. **代码签名**：正式发布时务必签名，提升用户信任度
2. **HTTPS 分发**：通过 HTTPS 分发安装包
3. **校验和**：提供 SHA256 校验和文件
4. **更新机制**：使用加密的自动更新通道

## 输出文件说明

打包完成后，安装包位于 `dist` 目录：

```
dist/
├── EasyCCSwitch-1.0.0-x64-setup.exe    # Windows 64位安装包
├── EasyCCSwitch-1.0.0-ia32-setup.exe   # Windows 32位安装包
├── EasyCCSwitch-1.0.0.dmg              # macOS 安装包
├── EasyCCSwitch-1.0.0.AppImage         # Linux AppImage
└── ...
```

## 开发环境 vs 生产环境

| 特性         | 开发环境 | 生产环境 |
| ------------ | -------- | -------- |
| 代码压缩     | ❌       | ✅       |
| Source Map   | ✅       | ❌       |
| Console 输出 | ✅       | ❌       |
| ASAR 打包    | ❌       | ✅       |
| 代码混淆     | ❌       | ✅       |
