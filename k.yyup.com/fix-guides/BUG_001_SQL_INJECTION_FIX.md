# Bug #1 修复指南 - SQL注入漏洞

## 问题描述
代码中存在多处使用字符串拼接直接构建SQL查询的情况，极易导致SQL注入攻击。

## 严重级别
**严重** - 需要立即修复

## 受影响的文件
- `server/src/seeders/20240318000000-init.ts`
  - 行号: 109, 263, 304, 320, 140-143

## 漏洞代码

### 位置1: 第109行
```typescript
// ❌ 危险：直接拼接 permission.code
const [existing] = await queryInterface.sequelize.query(
  `SELECT id FROM permissions WHERE code = '${permission.code}'`
);
```

### 位置2: 第304行
```typescript
// ❌ 危险：直接拼接用户ID和角色ID
const [existingUserRoles] = await queryInterface.sequelize.query(
  `SELECT * FROM user_roles WHERE user_id = ${adminUserId} AND role_id = ${adminRoleId}`
);
```

### 位置3: 第320行
```typescript
// ❌ 危险：直接拼接权限ID数组
await queryInterface.sequelize.query(
  `DELETE FROM role_permissions WHERE role_id = ${adminRoleId} AND permission_id IN (${permissionIds.join(',')})`
);
```

## 修复方案

### 步骤 1: 修复第109行

**修复前：**
```typescript
const [existing] = await queryInterface.sequelize.query(
  `SELECT id FROM permissions WHERE code = '${permission.code}'`
);
```

**修复后：**
```typescript
const [existing] = await queryInterface.sequelize.query(
  `SELECT id FROM permissions WHERE code = ?`,
  {
    replacements: [permission.code],
    type: Sequelize.QueryTypes.SELECT
  }
);
```

### 步骤 2: 修复第263行和第304行

**修复前：**
```typescript
const [existingUserRoles] = await queryInterface.sequelize.query(
  `SELECT * FROM user_roles WHERE user_id = ${adminUserId} AND role_id = ${adminRoleId}`
);
```

**修复后：**
```typescript
const [existingUserRoles] = await queryInterface.sequelize.query(
  `SELECT * FROM user_roles WHERE user_id = ? AND role_id = ?`,
  {
    replacements: [adminUserId, adminRoleId],
    type: Sequelize.QueryTypes.SELECT
  }
);
```

### 步骤 3: 修复第320行 - 数组参数

**修复前：**
```typescript
await queryInterface.sequelize.query(
  `DELETE FROM role_permissions WHERE role_id = ${adminRoleId} AND permission_id IN (${permissionIds.join(',')})`
);
```

**修复后（方式1 - 使用 Sequelize IN 语法）：**
```typescript
await queryInterface.sequelize.query(
  `DELETE FROM role_permissions WHERE role_id = ? AND permission_id IN (?)`,
  {
    replacements: [adminRoleId, permissionIds],
    type: Sequelize.QueryTypes.DELETE
  }
);
```

**修复后（方式2 - 使用 repeat）：**
```typescript
const placeholders = permissionIds.map(() => '?').join(',');
await queryInterface.sequelize.query(
  `DELETE FROM role_permissions WHERE role_id = ? AND permission_id IN (${placeholders})`,
  {
    replacements: [adminRoleId, ...permissionIds],
    type: Sequelize.QueryTypes.DELETE
  }
);
```

### 步骤 4: 修复 task.service.ts 中的类似问题

**修复前：**
```typescript
const [pendingResult] = await this.db.query(
  `SELECT COUNT(*) as count FROM tasks WHERE status = 'pending' ${whereClause ? 'AND ' + whereClause.replace('WHERE', '') : ''}`,
  params
);
```

**修复后：**
```typescript
// 完全重构为安全的查询方式
const baseQuery = `SELECT COUNT(*) as count FROM tasks WHERE status = 'pending'`;
const queryParams = [];

if (whereClause) {
  // 将 whereClause 转换为参数化查询
  const safeQuery = this.buildSafeWhereClause(whereClause);
  return await this.db.query(
    `${baseQuery} AND ${safeQuery.clause}`,
    { ...params, replacements: safeQuery.params }
  );
}

return await this.db.query(baseQuery, {
  ...params,
  type: Sequelize.QueryTypes.SELECT
});
```

## 验证步骤

### 1. 代码审查
```bash
# 搜索所有可能存在SQL注入的代码
grep -r "query(" server/src/ | grep -E "(\$\{|\.join\(|\.concat\()" | grep -v ".test.ts"
```

### 2. 单元测试
创建测试文件 `server/src/__tests__/sql-injection.test.ts`:

```typescript
describe('SQL Injection Protection', () => {
  it('should sanitize permission code input', async () => {
    const maliciousCode = "'; DROP TABLE permissions; --";
    const result = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE code = ?`,
      {
        replacements: [maliciousCode],
        type: Sequelize.QueryTypes.SELECT
      }
    );
    expect(result).toBeDefined();
    expect(result.length).toBe(0);
  });

  it('should handle array parameters safely', async () => {
    const maliciousIds = ["1'; DROP TABLE users; --", "2", "3"];
    await queryInterface.sequelize.query(
      `DELETE FROM role_permissions WHERE role_id = ? AND permission_id IN (?)`,
      {
        replacements: [1, maliciousIds],
        type: Sequelize.QueryTypes.DELETE
      }
    );
    // 验证只删除了有效记录
  });
});
```

### 3. 集成测试
运行完整的种子数据初始化：
```bash
cd server && npm run seed-data:complete
```

### 4. 安全扫描
使用 SQL 注入检测工具：
```bash
# 安装 sqlmap
pip install sqlmap

# 测试 API 端点
sqlmap -u "http://localhost:3000/api/permissions?code=test" --batch
```

## 预防措施

### 1. 代码规范
在项目根目录创建 `.augment/rules/sql-injection-prevention.md`:

```markdown
# SQL 注入预防规则

## 禁止模式
- ❌ 字符串拼接构建 SQL
- ❌ 模板字符串直接插入变量
- ❌ 使用用户输入直接构建查询

## 必须使用
- ✅ 参数化查询（使用 ? 或 :parameter）
- ✅ Sequelize ORM 方法
- ✅ 输入验证和清理

## 代码审查检查点
- 所有 `.query()` 调用必须使用 `replacements` 参数
- 所有用户输入必须经过验证
- 禁止直接拼接 SQL 字符串
```

### 2. ESLint 规则
在 `.eslintrc.js` 中添加：

```javascript
{
  "rules": {
    "no-warning-comments": ["error", {
      "terms": ["TODO", "FIXME", "SQL", "注入"],
      "location": "start"
    }]
  }
}
```

### 3. CI/CD 检查
在 `.github/workflows/security-scan.yml` 中添加：

```yaml
name: Security Scan

on: [push, pull_request]

jobs:
  sql-injection-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Check for SQL injection patterns
        run: |
          if grep -rE "query\([^)]*\$\{" server/src/ | grep -v ".test"; then
            echo "Potential SQL injection found!"
            exit 1
          fi
```

## 附加资源

- [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
- [Sequelize 安全最佳实践](https://sequelize.org/master/manual/querying.html)
- [Node.js 安全指南](https://nodejs.org/en/docs/guides/security/)

## 修复完成检查清单

- [ ] 所有字符串拼接查询已替换为参数化查询
- [ ] 所有用户输入都经过验证
- [ ] 单元测试已通过
- [ ] 集成测试已通过
- [ ] 安全扫描已通过
- [ ] 代码审查已完成
- [ ] 文档已更新

---

**修复时间估计**: 2-4 小时
**测试时间估计**: 1-2 小时
**总时间估计**: 3-6 小时
