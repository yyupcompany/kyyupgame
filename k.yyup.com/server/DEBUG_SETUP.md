# Node.js 调试器配置说明

## 已添加的调试脚本

### package.json 中新增的脚本：
- `dev:debug`: 启动调试模式服务器
- `dev:debug:watch`: 启动调试模式服务器（带文件监听）

### 启动脚本：
- `start-debug.sh`: 简单调试模式启动
- `start-debug-watch.sh`: 调试模式启动（带文件监听）

## 使用方法

### 方法1: 使用npm脚本
```bash
cd /home/devbox/project/server

# 停止当前服务器（Ctrl+C）

# 启动调试模式
npm run dev:debug

# 或者启动调试模式（带文件监听）
npm run dev:debug:watch
```

### 方法2: 使用启动脚本
```bash
cd /home/devbox/project/server

# 停止当前服务器（Ctrl+C）

# 启动调试模式
./start-debug.sh

# 或者启动调试模式（带文件监听）
./start-debug-watch.sh
```

## 调试器连接信息
- **调试端口**: 9229
- **服务端口**: 3000
- **绑定地址**: 0.0.0.0 (允许远程连接)

## 连接调试器
服务器启动后，你可以：
1. 使用Chrome DevTools: 打开 `chrome://inspect`
2. 使用VS Code: 配置调试器连接到 `localhost:9229`
3. 使用MCP Node.js调试器工具

## 注意事项
- 启动前请确保停止当前运行的服务器
- 调试模式会稍微影响性能
- 调试端口9229需要确保没有被其他进程占用