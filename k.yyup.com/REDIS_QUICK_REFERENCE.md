# Redis 快速参考卡

## 🚀 快速启动

### 最简单的方式

```bash
cd server
npm run dev
```

**就这样！** Redis 会自动检测并启动。

## 📋 常用命令

### 开发命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 标准开发模式（推荐） |
| `npm run dev:fast` | 快速启动 |
| `npm run dev:watch` | 监听模式（代码变更自动重启） |
| `npm run dev:debug` | 调试模式 |
| `npm run dev:bg` | 后台运行 |

### Redis 命令

| 命令 | 说明 |
|------|------|
| `redis-cli ping` | 测试连接 |
| `redis-cli info` | 查看服务器信息 |
| `redis-cli dbsize` | 查看数据库大小 |
| `redis-cli shutdown` | 停止 Redis |
| `redis-cli flushall` | 清空所有数据 |

### 检测脚本

| 命令 | 说明 |
|------|------|
| `node server/scripts/check-redis.js` | 检测 Redis 状态 |
| `bash server/scripts/check-redis.sh` | Linux/Mac 检测 |
| `server\scripts\check-redis.bat` | Windows 检测 |

## 🔌 连接信息

```
主机: 127.0.0.1
端口: 6379
数据库: 0-15
连接字符串: redis://127.0.0.1:6379
```

## 🎯 工作流程

```
npm run dev
    ↓
✅ Redis 检测
    ├─ 运行中 → 继续
    └─ 未运行 → 自动启动
    ↓
✅ 清理端口
    ↓
✅ 启动后端服务
    ↓
🎉 完成！
```

## 🚨 常见问题

### Q: Redis 未安装怎么办？

**A:** 安装 Redis

```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis

# Windows
# 使用 WSL: wsl redis-server
```

### Q: 端口 6379 被占用怎么办？

**A:** 查看并杀死占用进程

```bash
# 查看占用进程
lsof -i :6379

# 杀死进程
kill -9 <PID>
```

### Q: 如何停止 Redis？

**A:** 使用 redis-cli 停止

```bash
redis-cli shutdown
```

### Q: 如何查看 Redis 状态？

**A:** 使用 redis-cli 查看

```bash
redis-cli info server
redis-cli dbsize
```

### Q: 如何清空 Redis 数据？

**A:** 使用 redis-cli 清空

```bash
redis-cli flushall
```

## 📁 文件位置

| 文件 | 位置 |
|------|------|
| 检测脚本 (Node.js) | `server/scripts/check-redis.js` |
| 检测脚本 (Bash) | `server/scripts/check-redis.sh` |
| 检测脚本 (Batch) | `server/scripts/check-redis.bat` |
| 使用指南 | `server/REDIS_AUTO_START_GUIDE.md` |
| 集成总结 | `REDIS_INTEGRATION_SUMMARY.md` |
| 验证报告 | `REDIS_INTEGRATION_VERIFICATION.md` |

## 💡 提示

✅ Redis 会在后台运行，不需要额外的终端窗口
✅ 所有开发脚本都会自动检测 Redis
✅ 无需手动启动 Redis
✅ 支持跨平台（Linux、macOS、Windows）

## 🔗 相关文档

- [详细使用指南](./server/REDIS_AUTO_START_GUIDE.md)
- [集成总结](./REDIS_INTEGRATION_SUMMARY.md)
- [验证报告](./REDIS_INTEGRATION_VERIFICATION.md)
- [Redis 使用指南](./REDIS_USAGE_GUIDE.md)

---

**快速参考卡** | 2025-10-28

