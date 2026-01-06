# Redis 服务使用指南

## 📋 概述

Redis 是一个高性能的内存数据存储系统，项目已集成 Redis 用于：
- 🔐 权限路由缓存
- 👤 会话管理
- 🎯 在线用户管理
- ⚡ 性能优化

**当前状态**: ✅ Redis 7.0.15 已启动并运行

---

## 🚀 快速启动

### 启动 Redis 服务

```bash
# 方式1: 使用启动脚本（推荐）
./start-redis.sh

# 方式2: 直接命令
redis-server --daemonize yes --port 6379
```

### 停止 Redis 服务

```bash
# 方式1: 使用停止脚本（推荐）
./stop-redis.sh

# 方式2: 直接命令
redis-cli shutdown save
```

### 检查 Redis 状态

```bash
# 方式1: 使用状态检查脚本（推荐）
./redis-status.sh

# 方式2: 直接命令
redis-cli ping
redis-cli info
```

---

## 📊 Redis 配置信息

### 连接信息
- **主机**: `127.0.0.1` (localhost)
- **端口**: `6379`
- **数据库**: 16 个（0-15）
- **模式**: Standalone（单机模式）

### 性能配置
- **最大内存**: 512MB
- **淘汰策略**: LRU（最近最少使用）
- **持久化**: RDB + AOF

### 当前状态
```
✅ 版本: Redis 7.0.15
✅ 运行模式: Standalone
✅ 已用内存: 1.38M
✅ 连接客户端: 2
✅ 数据库键数: 547
```

---

## 🔧 常用命令

### 基础命令

```bash
# 测试连接
redis-cli ping
# 输出: PONG

# 进入交互式命令行
redis-cli

# 查看所有键
redis-cli KEYS "*"

# 查看键的类型
redis-cli TYPE key_name

# 删除键
redis-cli DEL key_name

# 清空当前数据库
redis-cli FLUSHDB

# 清空所有数据库
redis-cli FLUSHALL
```

### 字符串操作

```bash
# 设置值
redis-cli SET key value

# 获取值
redis-cli GET key

# 设置值并指定过期时间（秒）
redis-cli SETEX key 3600 value

# 增加数值
redis-cli INCR counter

# 减少数值
redis-cli DECR counter
```

### 列表操作

```bash
# 向列表左端添加元素
redis-cli LPUSH list_name value

# 向列表右端添加元素
redis-cli RPUSH list_name value

# 获取列表长度
redis-cli LLEN list_name

# 获取列表范围内的元素
redis-cli LRANGE list_name 0 -1
```

### 哈希操作

```bash
# 设置哈希字段
redis-cli HSET hash_name field value

# 获取哈希字段
redis-cli HGET hash_name field

# 获取所有哈希字段
redis-cli HGETALL hash_name

# 删除哈希字段
redis-cli HDEL hash_name field
```

### 集合操作

```bash
# 添加集合成员
redis-cli SADD set_name member

# 获取集合所有成员
redis-cli SMEMBERS set_name

# 检查成员是否存在
redis-cli SISMEMBER set_name member

# 删除集合成员
redis-cli SREM set_name member
```

### 有序集合操作

```bash
# 添加有序集合成员
redis-cli ZADD zset_name score member

# 获取有序集合所有成员
redis-cli ZRANGE zset_name 0 -1

# 获取成员分数
redis-cli ZSCORE zset_name member

# 删除有序集合成员
redis-cli ZREM zset_name member
```

---

## 🔐 项目中的 Redis 使用

### 权限缓存

```typescript
// 自动缓存权限数据
// 位置: server/src/services/redis.service.ts

// 缓存权限路由
await redisService.set('permissions:user:123', permissionData, 3600);

// 获取缓存的权限
const cached = await redisService.get('permissions:user:123');

// 清除权限缓存
await redisService.del('permissions:user:123');
```

### 会话管理

```typescript
// 存储用户会话
await redisService.set(`session:${sessionId}`, userData, 86400);

// 获取会话数据
const session = await redisService.get(`session:${sessionId}`);

// 删除会话
await redisService.del(`session:${sessionId}`);
```

### 在线用户管理

```typescript
// 记录在线用户
await redisService.sadd('online:users', userId);

// 获取在线用户列表
const onlineUsers = await redisService.smembers('online:users');

// 移除离线用户
await redisService.srem('online:users', userId);
```

---

## 📈 性能监控

### 查看实时统计

```bash
# 查看所有统计信息
redis-cli info

# 查看特定部分的信息
redis-cli info server      # 服务器信息
redis-cli info memory      # 内存使用
redis-cli info stats       # 统计信息
redis-cli info clients     # 客户端信息
redis-cli info keyspace    # 键空间信息
```

### 监控命令执行

```bash
# 实时监控所有命令
redis-cli monitor

# 查看慢查询日志
redis-cli slowlog get 10
redis-cli slowlog len
redis-cli slowlog reset
```

---

## 🐛 故障排除

### Redis 无法连接

```bash
# 检查 Redis 是否运行
ps aux | grep redis-server

# 检查端口是否开放
netstat -tlnp | grep 6379

# 查看 Redis 日志
tail -f /tmp/redis.log

# 重启 Redis
./stop-redis.sh
./start-redis.sh
```

### 内存使用过高

```bash
# 查看内存使用情况
redis-cli info memory

# 查看最大内存限制
redis-cli config get maxmemory

# 修改最大内存限制
redis-cli config set maxmemory 1gb

# 查看淘汰策略
redis-cli config get maxmemory-policy

# 修改淘汰策略
redis-cli config set maxmemory-policy allkeys-lru
```

### 数据丢失

```bash
# 查看持久化状态
redis-cli info persistence

# 手动保存数据
redis-cli save

# 后台保存数据
redis-cli bgsave

# 查看最后保存时间
redis-cli lastsave
```

---

## 📚 相关文档

- **Redis 配置**: `server/src/config/redis.config.ts`
- **Redis 服务**: `server/src/services/redis.service.ts`
- **部署方案**: `docs/Redis部署建设方案.md`
- **官方文档**: https://redis.io/documentation

---

## 🎯 最佳实践

### 1. 键命名规范

```typescript
// 使用冒号分隔的命名空间
'permissions:user:123'
'session:abc123'
'cache:dashboard:stats'
'queue:tasks:pending'
```

### 2. 过期时间设置

```typescript
// 权限缓存: 1小时
const PERMISSION_TTL = 3600;

// 会话: 24小时
const SESSION_TTL = 86400;

// 临时缓存: 5分钟
const TEMP_CACHE_TTL = 300;
```

### 3. 错误处理

```typescript
try {
  const data = await redisService.get('key');
  if (!data) {
    // 从数据库获取
    const dbData = await getFromDatabase();
    // 缓存结果
    await redisService.set('key', dbData, 3600);
    return dbData;
  }
  return data;
} catch (error) {
  console.warn('Redis error:', error);
  // 降级到数据库查询
  return await getFromDatabase();
}
```

### 4. 缓存失效策略

```typescript
// 主动失效
await redisService.del('permissions:user:123');

// 被动失效（过期时间）
await redisService.set('key', value, 3600);

// 批量失效
const keys = await redisService.keys('permissions:*');
await redisService.del(...keys);
```

---

## 🔗 集成到项目

### 后端集成

```typescript
// 在 server/src/index.ts 中
import { redisService } from './services/redis.service';

// 启动时连接
await redisService.connect();

// 在控制器中使用
const cached = await redisService.get('key');
```

### 环境变量配置

```bash
# .env 文件
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_DB=0
REDIS_MODE=standalone
```

---

## 📞 支持

如有问题，请：
1. 检查 Redis 日志: `/tmp/redis.log`
2. 运行状态检查: `./redis-status.sh`
3. 查看项目文档: `docs/Redis部署建设方案.md`

---

**最后更新**: 2025-10-28
**Redis 版本**: 7.0.15
**项目**: 幼儿园管理系统

