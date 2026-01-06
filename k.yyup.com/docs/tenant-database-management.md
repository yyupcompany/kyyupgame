# 多租户数据库管理指南

## 概述

本系统提供了完整的多租户数据库管理解决方案，支持批量迁移、同步和健康检查功能。

## 核心功能

### 1. 批量数据库迁移
使用 Sequalize CLI 批量执行迁移脚本到所有租户数据库。

```bash
# 执行迁移（默认并发5个）
npm run tenant:migrate

# 高并发模式（10个并发）
npm run tenant:migrate:batch
```

### 2. 结构同步
使用模板数据库同步所有租户的数据库结构。

```bash
# 同步所有租户数据库结构
npm run tenant:sync
```

### 3. 种子数据更新
批量更新所有租户的种子数据。

```bash
# 更新种子数据
npm run tenant:seed
```

### 4. 健康检查
检查所有租户数据库结构是否与模板一致。

```bash
# 执行健康检查
npm run tenant:health
```

### 5. 回滚失败迁移
回滚失败的数据库迁移。

```bash
# 回滚失败的迁移
npm run tenant:rollback
```

### 6. 数据库备份
备份所有租户数据库。

```bash
# 备份数据库
npm run tenant:backup
```

## 配置说明

配置文件位置：`scripts/tenant-db-config.json`

```json
{
  "templateDatabase": "template_db",
  "migrationSettings": {
    "concurrency": 5,      // 并发数
    "batchSize": 10,       // 批处理大小
    "retryAttempts": 3,    // 重试次数
    "retryDelay": 5000     // 重试延迟（毫秒）
  },
  "backupSettings": {
    "enabled": true,       // 是否启用备份
    "compression": true,   // 是否压缩备份文件
    "retentionDays": 30    // 备份保留天数
  },
  "connection": {
    "host": "localhost",
    "port": 3306,
    "username": "root",
    "password": "your_password"
  }
}
```

## 工作流程

### 开发新功能后的数据库更新

1. **创建迁移文件**
   ```bash
   cd server
   npx sequelize-cli migration:generate --name your-migration-name
   ```

2. **编写迁移逻辑**
   ```javascript
   // 示例：添加新字段
   module.exports = {
     up: async (queryInterface, Sequelize) => {
       await queryInterface.addColumn('users', 'new_field', {
         type: Sequelize.STRING,
         allowNull: false
       });
     },
     down: async (queryInterface, Sequelize) => {
       await queryInterface.removeColumn('users', 'new_field');
     }
   };
   ```

3. **测试迁移**
   ```bash
   # 先在测试环境测试
   DATABASE_URL=mysql://user:pass@localhost:3306/test_db \
   npx sequelize-cli db:migrate
   ```

4. **执行批量迁移**
   ```bash
   npm run tenant:migrate
   ```

5. **验证结果**
   ```bash
   npm run tenant:health
   ```

### 应急回滚流程

1. **识别失败的租户**
   - 查看迁移日志
   - 检查错误报告

2. **执行回滚**
   ```bash
   npm run tenant:rollback
   ```

3. **恢复备份**（如果需要）
   ```bash
   # 从备份文件恢复
   mysql -u root -p tenant_db < backup_file.sql
   ```

## 最佳实践

### 1. 迁移文件编写规范

- 总是提供 `up` 和 `down` 方法
- 使用事务确保数据一致性
- 避免长时间运行的锁定操作
- 考虑性能影响，对大表操作使用批处理

### 2. 并发控制

- 根据数据库性能调整并发数
- 监控数据库负载
- 在低峰期执行大规模迁移

### 3. 备份策略

- 迁移前自动备份
- 定期备份重要数据
- 测试备份恢复流程

### 4. 监控和告警

- 设置迁移监控
- 配置失败告警
- 保留操作日志

## 故障排除

### 常见问题

1. **连接超时**
   - 检查数据库连接配置
   - 增加连接池大小
   - 调整超时设置

2. **迁移失败**
   - 查看详细错误日志
   - 检查SQL语法
   - 验证数据完整性

3. **性能问题**
   - 减少并发数
   - 增加批次间隔
   - 优化SQL语句

### 日志位置

- 迁移日志：`logs/batch-migration.log`
- 同步报告：`reports/tenant-db-sync-*.json`
- 备份文件：`backups/`

## 高级功能

### 1. 自定义迁移脚本

创建自定义迁移脚本处理复杂场景：

```javascript
const TenantMigrator = require('./batch-db-migrator');

const migrator = new TenantMigrator();
await migrator.loadTenantConfigs();

// 自定义逻辑
for (const tenant of migrator.tenantConfigs) {
  // 执行特定操作
}
```

### 2. 增量同步

只同步有差异的租户：

```javascript
const sync = new TenantDatabaseSync();
const templateSchema = await sync.getTemplateSchema();
const tenantDb = 'tenant_123';
const tenantSchema = await sync.getTenantSchema(tenantDb);
const differences = sync.compareSchemas(templateSchema, tenantSchema);

if (differences.length > 0) {
  await sync.syncTenantDatabase(tenantDb, differences);
}
```

### 3. 数据验证

迁移后验证数据完整性：

```javascript
// 添加到 migration 文件
const validateMigration = async () => {
  const results = await db.query(`
    SELECT COUNT(*) as count
    FROM users
    WHERE new_field IS NULL
  `);

  if (results[0].count > 0) {
    throw new Error('Migration validation failed');
  }
};
```

## 安全考虑

1. **权限控制**
   - 使用专门的迁移账户
   - 限制不必要的权限
   - 定期轮换密码

2. **数据保护**
   - 加密敏感数据
   - 使用SSL连接
   - 审计操作日志

3. **网络安全**
   - 限制数据库访问IP
   - 使用VPN或私有网络
   - 配置防火墙规则

## 性能优化建议

1. **批量操作**
   - 使用批量插入/更新
   - 减少网络往返次数
   - 合理设置批大小

2. **索引优化**
   - 添加必要的索引
   - 避免过度索引
   - 定期分析查询计划

3. **连接管理**
   - 使用连接池
   - 及时释放连接
   - 监控连接使用情况