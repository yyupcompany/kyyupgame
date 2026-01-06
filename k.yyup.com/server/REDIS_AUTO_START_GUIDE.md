# Redis 自动启动集成指南

## 📋 概述

已将 Redis 自动检测和启动功能集成到后端开发脚本中。现在运行 `npm run dev` 时，系统会自动：

1. ✅ 检查 Redis 是否运行
2. 🚀 如果未运行，自动启动 Redis
3. 📊 显示 Redis 连接状态
4. ▶️ 启动后端服务

## 🎯 使用方式

### 方式 1: 标准开发模式（推荐）

```bash
cd server
npm run dev
```

**输出示例：**
```
📋 检查 Redis 服务状态...
✅ Redis 服务已运行
   连接地址: redis://127.0.0.1:6379

[后端服务启动...]
```

### 方式 2: 快速启动模式

```bash
cd server
npm run dev:fast
```

不清理端口，直接启动（如果端口被占用会失败）

### 方式 3: 监听模式（自动重启）

```bash
cd server
npm run dev:watch
```

代码变更时自动重启服务

### 方式 4: 调试模式

```bash
cd server
npm run dev:debug
```

启用 Node.js 调试器

### 方式 5: 后台运行

```bash
cd server
npm run dev:bg
```

在后台运行，日志输出到 `server.log`

## 🔧 脚本说明

### check-redis.js (Node.js 版本)

- **位置**: `server/scripts/check-redis.js`
- **功能**: 跨平台 Redis 检测和启动
- **特点**:
  - 自动检测 Redis 运行状态
  - 失败时自动启动 Redis
  - 支持 Linux、macOS、Windows
  - 彩色输出提示

### check-redis.sh (Bash 版本)

- **位置**: `server/scripts/check-redis.sh`
- **功能**: Linux/macOS 专用脚本
- **使用**: `bash scripts/check-redis.sh`

### check-redis.bat (Batch 版本)

- **位置**: `server/scripts/check-redis.bat`
- **功能**: Windows 专用脚本
- **使用**: `scripts\check-redis.bat`

## 📝 修改的脚本

以下 npm 脚本已添加 Redis 检测：

| 脚本 | 命令 | 说明 |
|------|------|------|
| dev | `npm run dev` | 标准开发模式 |
| dev:fast | `npm run dev:fast` | 快速启动 |
| dev:bash | `npm run dev:bash` | Bash 版本 |
| dev:win | `npm run dev:win` | Windows 版本 |
| dev:cmd | `npm run dev:cmd` | CMD 版本 |
| dev:debug | `npm run dev:debug` | 调试模式 |
| dev:debug:watch | `npm run dev:debug:watch` | 调试+监听 |
| dev:watch | `npm run dev:watch` | 监听模式 |
| dev:bg | `npm run dev:bg` | 后台运行 |

## 🚨 故障排除

### 问题 1: Redis 未安装

**错误信息:**
```
❌ Redis 未安装
```

**解决方案:**

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install redis-server
```

**macOS:**
```bash
brew install redis
```

**Windows:**
- 使用 WSL: `wsl redis-server`
- 或下载 Windows 版本: https://github.com/microsoftarchive/redis/releases

### 问题 2: Redis 启动失败

**错误信息:**
```
❌ Redis 启动失败
```

**解决方案:**

1. 检查端口 6379 是否被占用:
   ```bash
   # Linux/Mac
   lsof -i :6379
   
   # Windows
   netstat -ano | findstr :6379
   ```

2. 手动启动 Redis:
   ```bash
   redis-server --port 6379
   ```

3. 查看 Redis 日志:
   ```bash
   tail -f /tmp/redis.log
   ```

### 问题 3: 权限不足

**错误信息:**
```
Permission denied
```

**解决方案:**

```bash
# 给脚本添加执行权限
chmod +x server/scripts/check-redis.sh
chmod +x server/scripts/check-redis.js
```

## 🔌 连接信息

- **主机**: 127.0.0.1 (localhost)
- **端口**: 6379
- **数据库**: 0-15
- **连接字符串**: `redis://127.0.0.1:6379`

## 📊 验证 Redis 连接

### 方式 1: 使用 redis-cli

```bash
redis-cli ping
# 输出: PONG

redis-cli info server
# 显示 Redis 服务器信息
```

### 方式 2: 使用检测脚本

```bash
# Linux/Mac
bash server/scripts/check-redis.sh

# Windows
server\scripts\check-redis.bat

# 或使用根目录脚本
./redis-status.sh
```

### 方式 3: 在代码中验证

```typescript
import { redisService } from '@/services/redis.service';

// 检查连接
const isConnected = await redisService.isConnected();
console.log('Redis 连接状态:', isConnected);
```

## 🎯 最佳实践

### 1. 开发环境启动

```bash
# 推荐方式：同时启动前后端
npm run start:all

# 或分别启动
npm run start:backend  # 自动检测并启动 Redis
npm run start:frontend
```

### 2. 监听模式开发

```bash
cd server
npm run dev:watch
```

代码变更时自动重启，Redis 保持运行

### 3. 调试模式

```bash
cd server
npm run dev:debug
```

启用 Node.js 调试器，可在 Chrome DevTools 中调试

### 4. 后台运行

```bash
cd server
npm run dev:bg

# 查看日志
tail -f server.log

# 停止服务
npm run stop:backend
```

## 🔄 工作流程

```
npm run dev
    ↓
检查 Redis 状态
    ↓
Redis 未运行? → 启动 Redis
    ↓
清理占用的端口
    ↓
启动后端服务 (ts-node)
    ↓
服务就绪，可以开发
```

## 📚 相关文档

- [Redis 使用指南](../REDIS_USAGE_GUIDE.md)
- [Redis 启动报告](../REDIS_STARTUP_REPORT.md)
- [后端开发指南](./README.md)

## 💡 提示

- Redis 会在后台运行，不需要额外的终端窗口
- 如果需要停止 Redis，使用: `redis-cli shutdown`
- 如果需要查看 Redis 状态，使用: `redis-cli info`
- 所有开发脚本都会自动检测 Redis，无需手动启动

---

**最后更新**: 2025-10-28
**状态**: ✅ 已启用

