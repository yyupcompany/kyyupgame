# 从多连接到共享连接池的迁移指南

## 📋 迁移概述

从每个租户独立连接池 → 所有租户共享一个连接池

**优势：**
- ✅ 连接数从1000+降低到30
- ✅ 内存占用显著降低
- ✅ 初始化时间显著加快
- ✅ 连接复用效率提升

---

## 🔧 迁移步骤

### **第1步：添加新的服务文件**

复制以下文件到你的项目：
- `tenant-database-shared-pool.service.ts` → `src/services/`
- `tenant-resolver-shared-pool.middleware.ts` → `src/middlewares/`
- `auth-shared-pool-example.middleware.ts` → `src/middlewares/`
- `database-initialization.ts` → `src/`

### **第2步：更新环境变量**

在 `.env` 文件中添加：
```env
# 连接池配置
DB_POOL_MAX=30
DB_POOL_MIN=5
```

### **第3步：初始化连接池**

在应用启动文件（如 `main.ts` 或 `app.ts`）中：

```typescript
import { initializeDatabasePool, closeDatabasePool } from './database-initialization';

async function bootstrap() {
  // 1. 初始化数据库连接池
  await initializeDatabasePool();

  // 2. 创建Express应用
  const app = express();

  // 3. 使用新的中间件
  app.use(tenantResolverSharedPoolMiddleware);
  app.use(verifyTokenSharedPool);

  // 4. 启动服务器
  app.listen(3000, () => {
    console.log('服务器启动成功');
  });

  // 5. 优雅关闭
  process.on('SIGTERM', async () => {
    await closeDatabasePool();
    process.exit(0);
  });
}

bootstrap();
```

### **第4步：更新查询语句**

**修改前：**
```typescript
const result = await req.tenantDb.query(`
  SELECT * FROM users WHERE id = ?
`, { replacements: [userId] });
```

**修改后：**
```typescript
const result = await req.tenantDb.query(`
  SELECT * FROM tenant_${req.tenant.code}.users WHERE id = ?
`, { replacements: [userId] });
```

### **第5步：更新所有数据库查询**

需要更新的地方：
- ✅ 所有SELECT查询
- ✅ 所有INSERT查询
- ✅ 所有UPDATE查询
- ✅ 所有DELETE查询
- ✅ 所有JOIN查询

**查找和替换模式：**
```
查找: FROM users
替换: FROM tenant_${req.tenant.code}.users

查找: INTO users
替换: INTO tenant_${req.tenant.code}.users

查找: UPDATE users
替换: UPDATE tenant_${req.tenant.code}.users

查找: DELETE FROM users
替换: DELETE FROM tenant_${req.tenant.code}.users

查找: JOIN users
替换: JOIN tenant_${req.tenant.code}.users
```

### **第6步：测试**

```bash
# 1. 启动应用
npm start

# 2. 检查日志
# 应该看到：
# [数据库] 全局数据库连接成功
# [数据库] 连接池初始化完成

# 3. 测试登录
curl -X POST http://k001.yyup.cc:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"18611141133","password":"xxx"}'

# 4. 测试API请求
curl -X GET http://k001.yyup.cc:3000/api/users \
  -H "Authorization: Bearer token"
```

---

## 📊 验证迁移成功

### **检查连接池状态**

```typescript
// 在任何中间件中
const stats = await tenantDatabaseSharedPoolService.getPoolStats();
console.log('连接池状态:', stats);
// 输出：
// {
//   poolSize: { max: 30, min: 5 },
//   activeConnections: 3,
//   idleConnections: 2
// }
```

### **监控连接数**

```bash
# 查看MySQL连接数
mysql -u root -p -e "SHOW PROCESSLIST;"

# 应该看到：
# - 连接数在5-30之间
# - 不会超过30个
```

### **性能对比**

```
迁移前：
- Sequelize实例数: 100
- 连接数: 100-1000
- 内存占用: 很高
- 启动时间: 慢

迁移后：
- Sequelize实例数: 1
- 连接数: 5-30
- 内存占用: 很低
- 启动时间: 快
```

---

## ⚠️ 常见问题

### **Q1: 如何处理跨数据库JOIN？**

```typescript
// ✅ 支持
SELECT u.*, r.* 
FROM tenant_k001.users u
JOIN tenant_k001.roles r ON u.role_id = r.id

// ✅ 也支持（跨租户）
SELECT u.*, r.* 
FROM tenant_k001.users u
JOIN tenant_k002.roles r ON u.role_id = r.id
```

### **Q2: 如何处理事务？**

```typescript
// ✅ 事务仍然支持
const transaction = await req.tenantDb.transaction();

try {
  await req.tenantDb.query(
    `INSERT INTO tenant_${req.tenant.code}.users ...`,
    { transaction }
  );
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
}
```

### **Q3: 连接池满了怎么办？**

```
如果连接数达到最大值：
1. 新请求会等待（最多30秒）
2. 如果超时，返回错误
3. 解决方案：
   - 增加DB_POOL_MAX
   - 优化查询性能
   - 增加数据库服务器资源
```

### **Q4: 如何监控连接池？**

```typescript
// 定期检查连接池健康状态
setInterval(async () => {
  const isHealthy = await tenantDatabaseSharedPoolService.healthCheck();
  console.log('连接池健康:', isHealthy);
}, 60000); // 每分钟检查一次
```

---

## 🔄 回滚方案

如果需要回滚到旧的实现：

```typescript
// 恢复使用旧的中间件
app.use(tenantResolverMiddleware);  // 旧的
// app.use(tenantResolverSharedPoolMiddleware);  // 新的

// 恢复使用旧的查询方式
const result = await req.tenantDb.query(`SELECT * FROM users`);
// 不需要添加 tenant_${code}. 前缀
```

---

## 📝 总结

| 步骤 | 操作 | 预期结果 |
|------|------|--------|
| 1 | 添加新服务文件 | ✅ 文件就位 |
| 2 | 更新环境变量 | ✅ 配置完成 |
| 3 | 初始化连接池 | ✅ 应用启动 |
| 4 | 更新查询语句 | ✅ 查询正常 |
| 5 | 测试 | ✅ 功能正常 |
| 6 | 验证 | ✅ 连接数正常 |

**预期收益：**
- ✅ 连接数: 1000+ → 30
- ✅ 内存占用: 显著降低
- ✅ 性能: 显著提升
- ✅ 稳定性: 显著提升

