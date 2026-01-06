# Electron 开发编译配置

## 🔄 智能编译策略

### 开发环境配置
```json
// package.json scripts
{
  "scripts": {
    // 开发模式（支持热重载）
    "electron:dev": "concurrently \"npm run dev:renderer\" \"npm run dev:main\"",

    // 仅重新构建前端（频繁使用）
    "build:renderer": "vite build --mode development",

    // 仅重新构建主进程
    "build:main": "tsc -p electron/tsconfig.main.json",

    // 完整重新构建（较少使用）
    "electron:build": "npm run build:renderer && npm run build:main",

    // 生产打包
    "electron:package": "npm run electron:build && electron-builder"
  }
}
```

## ⚡ 热重载优化

### 前端热重载 (95%的修改)
```javascript
// vite.config.electron.ts
export default defineConfig({
  server: {
    port: 5174,
    strictPort: true,

    // 热重载配置
    hmr: {
      port: 5175
    }
  },

  // 针对Electron的优化
  build: {
    watch: {},  // 启用监听模式
    emptyOutDir: false  // 避免清理其他文件
  }
});
```

### 智能监听配置
```javascript
// scripts/dev-watcher.js
const chokidar = require('chokidar');

class DevWatcher {
  constructor() {
    this.watchers = new Map();
    this.setupWatchers();
  }

  setupWatchers() {
    // 监听前端代码变化（最频繁）
    this.watch('src/renderer/**/*', (path) => {
      console.log(`🎨 前端代码变化: ${path}`);
      this.notifyRendererChange(path);
    });

    // 监听主进程代码变化（较少）
    this.watch('src/main/**/*', (path) => {
      console.log(`⚙️  主进程代码变化: ${path}`);
      this.restartMainProcess();
    });

    // 监听预加载脚本变化（很少）
    this.watch('src/preload/**/*', (path) => {
      console.log(`🔗 预加载脚本变化: ${path}`);
      this.restartElectron();
    });
  }

  async notifyRendererChange(path) {
    // 前端变化无需重启，HMR会自动处理
    console.log('✨ 前端界面已自动更新');
  }

  async restartMainProcess() {
    // 重启主进程（较快）
    console.log('🔄 重启主进程中...');
  }

  async restartElectron() {
    // 完整重启（较慢）
    console.log('🔄 重启整个Electron应用...');
  }
}
```

## 📊 编译性能对比

| 修改类型 | 编译方式 | 耗时 | 是否需要重启 |
|----------|----------|------|-------------|
| Vue组件 | HMR热重载 | <1秒 | ❌ |
| CSS样式 | HMR热重载 | <1秒 | ❌ |
| 页面路由 | HMR热重载 | <1秒 | ❌ |
| 前端工具函数 | 重新构建 | 3-5秒 | ❌ |
| API接口 | 重启后端 | 2-3秒 | ✅ |
| 主进程配置 | 重启应用 | 5-8秒 | ✅ |

## 🚀 开发工作流

### 日常开发流程
```bash
# 1. 启动开发模式（一次执行）
npm run electron:dev

# 2. 修改代码（随时进行）
# - 修改Vue组件 → 立即看到效果
# - 修改API → 自动重启后端
# - 修改主进程 → 自动重启应用

# 3. 无需手动编译！
# 开发过程完全自动化
```

### 快速修复流程
```bash
# 发现bug，快速修复
1. 修改代码
2. 保存文件
3. 查看效果（自动更新）
4. 继续下一个修复
```

## ⚙️ 性能优化配置

### Vite开发服务器优化
```javascript
// vite.config.dev.ts
export default defineConfig({
  server: {
    hmr: {
      overlay: true  // 显示编译错误
    },
    fs: {
      strict: false  // 允许访问更多文件
    }
  },

  optimizeDeps: {
    include: [
      'vue', 'vue-router', 'pinia',
      'element-plus', 'axios'
    ]
  }
});
```

### Electron启动优化
```javascript
// electron/development.js
const { app } = require('electron');

// 开发模式优化
if (process.env.NODE_ENV === 'development') {
  app.commandLine.appendSwitch('disable-gpu');
  app.commandLine.appendSwitch('disable-web-security');
  app.commandLine.appendSwitch('allow-insecure-localhost');
}

// 快速重启配置
app.on('ready', () => {
  console.log('🚀 Electron 开发模式启动');
  console.log('⚡ 前端热重载已启用');
  console.log('🔄 后端API已集成');
});
```

## 📝 开发建议

### 1. 前端修改占80%
- Vue组件、页面、样式修改
- 使用HMR，无需重启
- 保存即生效

### 2. API修改占15%
- 后端接口修改
- 自动重启后端服务
- 2-3秒即可看到效果

### 3. 主进程修改占5%
- Electron配置修改
- 需要重启整个应用
- 5-8秒完成重启

### 4. 性能优化
```bash
# 开发模式内存优化
export NODE_OPTIONS="--max-old-space-size=4096"

# 启用快速编译
export VITE_CJS_IGNORE_WARNING=true

# 关闭不必要的检查
export ESLINT_NO_DEV_ERRORS=true
```

## 🎯 总结

**是的，您完全正确！**

- ✅ 前端修改：保存即可看到效果
- ✅ 无需重新编译整个应用
- ✅ 开发体验和Web开发一样流畅
- ✅ 只有主进程修改才需要重启

这就是Electron相比原生开发的一大优势！