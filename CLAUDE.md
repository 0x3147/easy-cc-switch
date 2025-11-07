# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

EasyCCSwitch 是一个基于 Electron 的桌面应用，用于管理 Claude Code 和 Codex 两款 AI 编码工具的多供应商配置。支持智谱、月之暗面、MINIMAX、DeepSeek、IdealAB 等国产大模型供应商的快速切换。

## 常用命令

### 开发相关
- `npm run dev` - 启动开发模式（支持热重载）
- `npm run typecheck` - 运行 TypeScript 类型检查（包括 Node 和 Web 环境）
- `npm run typecheck:node` - 仅检查主进程和 preload 的类型
- `npm run typecheck:web` - 仅检查渲染进程的类型
- `npm run lint` - 运行 ESLint 代码检查
- `npm run format` - 使用 Prettier 格式化代码

### 构建相关
- `npm run build` - 构建应用（先执行类型检查）
- `npm run build:mac` - 构建 macOS 应用程序
- `npm run build:win` - 构建 Windows 应用程序
- `npm run build:linux` - 构建 Linux 应用程序
- `npm run build:unpack` - 构建但不打包（用于调试）

## 核心架构

### Electron 三进程架构

项目遵循标准的 Electron 架构模式：

1. **主进程 (Main Process)** - `src/main/`
   - 入口: `src/main/index.ts`
   - 负责创建窗口、管理应用生命周期
   - 通过 IPC handlers 处理渲染进程的请求
   - 读写文件系统（配置文件操作）

2. **渲染进程 (Renderer Process)** - `src/renderer/`
   - React 18 单页应用
   - 使用 React Router 6 管理路由
   - Material-UI 7 提供 UI 组件
   - 通过 `window.api` 与主进程通信

3. **预加载脚本 (Preload Script)** - `src/preload/`
   - 桥接主进程和渲染进程
   - 暴露安全的 IPC API 到渲染进程
   - 类型定义在 `src/preload/index.d.ts`

### IPC 通信机制

所有 IPC 通道名称集中定义在 `src/shared/ipc-channels.ts`，按功能分组：
- `WINDOW_CHANNELS` - 窗口控制（最小化、最大化、关闭）
- `VENDOR_CHANNELS` - Claude Code 供应商配置管理
- `CODEX_CHANNELS` - Codex 供应商配置管理
- `TOOL_CHANNELS` - 工具检测和进程管理

### 数据持久化

使用 `electron-store` 实现本地数据存储：

- **vendor-store** (`src/main/store/vendor-store.ts`)
  - 管理 Claude Code 供应商配置列表
  - 存储当前激活的供应商 ID
  - 配置文件: `~/.config/EasyCCSwitch/vendor-configs.json`

- **codex-store** (`src/main/store/codex-store.ts`)
  - 管理 Codex 供应商配置列表
  - 存储当前激活的 Codex 供应商 ID
  - 配置文件: `~/.config/EasyCCSwitch/codex-configs.json`

### 配置文件写入机制

应用通过直接操作外部工具的配置文件来实现配置切换：

**Claude Code 配置** (`src/main/ipc-handler/vendor-handler.ts`):
- 配置文件: `~/.claude/settings.json`
- **完全覆盖策略**: `saveClaudeConfig` 函数会完全重建配置对象，确保不同供应商配置之间不会相互干扰
- 关键字段: `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_BASE_URL`, 可选字段仅在配置中明确提供时才写入

**Codex 配置** (`src/main/ipc-handler/codex-handler.ts`):
- 配置文件: `~/.codex/config.toml` 和 `~/.codex/auth.json`
- 使用 `toml` 库解析和序列化 TOML 格式
- 支持复杂的嵌套配置结构（model_providers）

### 进程管理

应用可以检测和终止 Claude Code/Codex 进程 (`src/main/ipc-handler/tool-handler.ts`):

**进程检测**:
- Windows: 使用 `tasklist` 命令
- macOS/Linux: 使用 `ps + grep` 组合（比 pgrep 更可靠）

**进程终止**:
- Windows: 先尝试优雅关闭 (`taskkill`)，失败则强制终止 (`taskkill /F`)
- macOS/Linux: 先发送 SIGTERM (`pkill -x`)，等待 1 秒后检查，如仍在运行则发送 SIGKILL (`pkill -9 -x`)
- 使用 `-x` 标志精确匹配进程名，避免误杀相似名称的进程

## 类型系统

核心类型定义在 `src/shared/types/`:

- `vendor.ts` - Claude Code 供应商配置相关类型
  - `VendorConfig` - 供应商配置数据结构
  - `ClaudeSettings` - Claude settings.json 文件结构
  - `AddVendorRequest` - 包含配置和是否立即生效标志

- `codex.ts` - Codex 供应商配置相关类型
  - `CodexVendorConfig` - Codex 供应商配置数据结构
  - `CodexConfig` - config.toml 文件结构
  - `CodexAuth` - auth.json 文件结构

- `tool.ts` - 工具检测相关类型

## UI 路由结构

路由配置在 `src/renderer/routes/index.tsx`:
- `/claude-code/tool-install` - Claude Code 工具安装检测页
- `/claude-code/vendor` - Claude Code 供应商配置管理页
- `/codex/tool-install` - Codex 工具安装检测页
- `/codex/vendor` - Codex 供应商配置管理页

## 关键实现细节

### 无边框窗口实现
- 主窗口使用 `frame: false` 创建无边框窗口
- 自定义标题栏组件: `src/renderer/components/title-bar/index.tsx`
- macOS 使用 `titleBarStyle: 'hiddenInset'` 保持原生交通灯按钮

### 供应商预设配置
每个供应商都有预设的配置模板（API Base URL、模型名称等），用户只需输入 Token 即可快速配置。这些预设定义在对应的页面组件中。

### 立即生效功能
添加供应商配置时，可选择"立即生效"：
- 勾选时，配置会同时保存到 electron-store 并写入工具配置文件
- 不勾选时，仅保存到 electron-store，需要手动点击"启用"按钮才会写入

### SVG 图标资源
各供应商的官方 Logo 存储在 `src/renderer/assets/images/`，用于增强品牌识别度。
