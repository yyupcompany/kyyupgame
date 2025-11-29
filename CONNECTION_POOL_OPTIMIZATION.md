# 连接池优化方案 - 从多连接到共享连接池

## 📊 当前架构 vs 优化架构

### **当前架构（低效）**

```
MySQL远端实例
  ├─ tenant_k001
  ├─ tenant_k002
  ├─ tenant_k003
  └─ ...

Node.js应用
  ├─ Sequelize实例1 (pool: 1-10) → tenant_k001
  ├─ Sequelize实例2 (pool: 1-10) → tenant_k002
  ├─ Sequelize实例3 (pool: 1-10) → tenant_k003
  └─ ...

问题：
❌ 100个租户 = 100个Sequelize实例
❌ 100个连接池 = 最多1000个连接
❌ 内存占用过高
❌ 连接数容易超限
```

### **优化架构（高效）**

```
MySQL远端实例
  ├─ tenant_k001
  ├─ tenant_k002
  ├─ tenant_k003
  └─ ...

Node.js应用
  └─ 单个Sequelize实例 (pool: 2-10)
      ├─ SELECT * FROM tenant_k001.users
      ├─ SELECT * FROM tenant_k002.users
      └─ SELECT * FROM tenant_k003.users

优势：
✅ 1个Sequelize实例
✅ 1个连接池 = 最多10个连接
✅ 内存占用低
✅ 连接充足
```

---

## 🔢 性能对比

| 指标 | 当前 | 优化后 | 改进 |
|------|------|--------|------|
| **Sequelize实例数** | 100 | 1 | 100倍 ↓ |
| **连接池数** | 100 | 1 | 100倍 ↓ |
| **最大连接数** | 1000 | 10 | 100倍 ↓ |
| **内存占用** | 很高 | 很低 | 显著 ↓ |
| **初始化时间** | 慢 | 快 | 显著 ↑ |
| **连接复用效率** | 低 | 高 | 显著 ↑ |

---

## 🔧 实现方式

### **方式1：使用完整表名（推荐）**

```typescript
// ✅ 最安全、最清晰
const result = await connection.query(
  `SELECT * FROM tenant_${tenantCode}.users WHERE id = ?`,
  { replacements: [userId] }
);
```

**优点：**
- ✅ 完全隔离，不会混淆
- ✅ 不依赖USE语句
- ✅ 支持跨数据库JOIN
- ✅ 性能最好

### **方式2：使用USE语句**

```typescript
// ⚠️ 需要小心处理并发
await connection.query(`USE tenant_${tenantCode}`);
const result = await connection.query(`SELECT * FROM users WHERE id = ?`);
```

**缺点：**
- ❌ 连接状态可能被其他请求覆盖
- ❌ 并发时容易出错
- ❌ 不推荐在多并发场景使用

### **方式3：使用Sequelize的schema**

```typescript
// ✅ Sequelize原生支持
const result = await connection.query(sql, {
  schema: `tenant_${tenantCode}`
});
```

---

## 📋 迁移步骤

### **第1步：创建共享连接池服务**

```typescript
// tenant-database-shared-pool.service.ts
export class TenantDatabaseSharedPoolService {
  private globalConnection: Sequelize | null = null;

  async initializeGlobalConnection(): Promise<Sequelize> {
    this.globalConnection = new Sequelize({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: 'mysql',
      dialect: 'mysql',
      pool: {
        max: 10,
        min: 2,
        acquire: 30000,
        idle: 10000
      }
    });

    await this.globalConnection.authenticate();
    return this.globalConnection;
  }

  getGlobalConnection(): Sequelize {
    return this.globalConnection!;
  }
}
```

### **第2步：修改中间件使用共享连接**

```typescript
// 修改前
req.tenantDb = await tenantDatabaseService.getTenantConnection(tenantCode);

// 修改后
req.tenantDb = tenantDatabaseSharedPoolService.getGlobalConnection();
req.tenantCode = tenantCode;
```

### **第3步：修改查询语句**

```typescript
// 修改前
const result = await req.tenantDb.query(`SELECT * FROM users`);

// 修改后
const result = await req.tenantDb.query(
  `SELECT * FROM tenant_${req.tenantCode}.users`
);
```

---

## ⚠️ 注意事项

### **1. 表名前缀**

```typescript
// ✅ 正确
SELECT * FROM tenant_k001.users

// ❌ 错误
SELECT * FROM users  // 会查询默认数据库
```

### **2. 并发安全**

```typescript
// ✅ 安全（使用完整表名）
await connection.query(
  `SELECT * FROM tenant_${tenantCode}.users`
);

// ❌ 不安全（依赖USE语句）
await connection.query(`USE tenant_${tenantCode}`);
await connection.query(`SELECT * FROM users`);
```

### **3. 跨数据库JOIN**

```typescript
// ✅ 支持
SELECT u.*, r.* 
FROM tenant_k001.users u
JOIN tenant_k001.roles r ON u.role_id = r.id

// ✅ 也支持
SELECT u.*, r.* 
FROM tenant_k001.users u
JOIN tenant_k002.roles r ON u.role_id = r.id
```

---

## 📊 连接池监控

### **获取连接池状态**

```typescript
const stats = await tenantDatabaseSharedPoolService.getPoolStats();
console.log('连接池状态:', {
  maxConnections: stats.poolSize.max,      // 10
  minConnections: stats.poolSize.min,      // 2
  activeConnections: stats.activeConnections,
  idleConnections: stats.idleConnections
});
```

### **健康检查**

```typescript
const isHealthy = await tenantDatabaseSharedPoolService.healthCheck();
console.log('数据库连接池健康:', isHealthy);
```

---

## 🎯 总结

### **为什么要优化？**

| 问题 | 影响 | 优化后 |
|------|------|--------|
| 连接数过多 | 数据库连接限制 | 最多10个 |
| 内存占用高 | 服务器资源浪费 | 显著降低 |
| 初始化慢 | 启动时间长 | 显著加快 |
| 连接复用低 | 性能下降 | 显著提升 |

### **优化的核心**

```
多个Sequelize实例 (每个1-10连接)
        ↓
单个Sequelize实例 (共享1-10连接)
        ↓
使用完整表名访问不同数据库
        ↓
连接数 ↓ 内存 ↓ 性能 ↑
```

---

## ✅ 建议

1. **立即采用** - 这是一个明显的优化
2. **逐步迁移** - 可以先在新代码中使用
3. **监控效果** - 观察连接数和性能变化
4. **文档更新** - 更新开发文档，说明新的查询方式

