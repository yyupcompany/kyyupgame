# TC-033: SQL注入防护测试

## 测试用例标识
- **用例编号**: TC-033
- **测试组**: 安全性和权限边界测试
- **测试类型**: 安全测试
- **优先级**: 严重

## 测试目标
验证移动端应用的SQL注入防护机制，确保所有数据库查询都使用参数化查询或ORM安全方法，防止恶意SQL代码执行，保护数据库安全。

## 测试前置条件
1. 应用已正常启动并运行在测试环境
2. 数据库已准备测试数据
3. 应用已启用SQL注入防护机制
4. 具备数据库访问权限用于验证

## 测试步骤

### 步骤1: 登录表单SQL注入测试
1. **尝试登录表单注入**
   ```
   用户名: admin' OR '1'='1' --
   密码: anypassword

   用户名: admin' UNION SELECT * FROM users --
   密码: anypassword

   用户名: ' OR 1=1 #
   密码: anypassword

   用户名: '; DROP TABLE users; --
   密码: anypassword
   ```

2. **验证登录防护**
   - 检查是否允许未授权访问
   - 验证返回适当的错误信息
   - 确认数据库表未被删除

### 步骤2: 搜索功能SQL注入测试
1. **测试搜索框注入**
   ```
   测试输入1: ' OR 1=1 --
   测试输入2: ' UNION SELECT username,password FROM users --
   测试输入3: '; INSERT INTO users VALUES('hacker','password') --
   测试输入4: ' AND (SELECT COUNT(*) FROM users) > 0 --
   测试输入5: ' OR 'a'='a' UNION SELECT * FROM information_schema.tables --
   ```

2. **在家长中心搜索框测试**
   - 导航到家长中心 -> 搜索功能
   - 输入上述SQL注入字符串
   - 点击搜索按钮
   - 观察系统响应

3. **验证查询安全**
   - 检查是否返回了不应显示的数据
   - 验证数据库结构信息未泄露
   - 确认没有恶意SQL执行

### 步骤3: API参数SQL注入测试
1. **测试API端点参数注入**
   ```javascript
   // 测试GET参数注入
   const testGetInjection = async () => {
     const maliciousParams = [
       '?id=1\' OR 1=1 --',
       '?name=\' UNION SELECT * FROM users --',
       '?search=\'; DROP TABLE test; --',
       '?category=\' AND (SELECT COUNT(*) FROM users) > 0 --'
     ];

     for (const param of maliciousParams) {
       const response = await fetch(`/api/students${param}`);
       console.log(`Testing ${param}:`, response.status);
       const data = await response.json();
       console.log('Response data:', data);
     }
   };
   ```

2. **测试POST请求注入**
   ```javascript
   // 测试POST参数注入
   const testPostInjection = async () => {
     const maliciousPayloads = [
       { name: "'; DROP TABLE users; --", age: 25 },
       { email: "test' UNION SELECT * FROM users --", id: 1 },
       { search: "' OR 1=1 #", type: "all" },
       { filter: "' AND (SELECT COUNT(*) FROM users) > 0 --" }
     ];

     for (const payload of maliciousPayloads) {
       const response = await fetch('/api/students/search', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(payload)
       });
       console.log('Payload:', payload, 'Status:', response.status);
     }
   };
   ```

3. **验证API防护**
   - 检查所有注入尝试都被拒绝
   - 验证返回适当的错误信息
   - 确认数据库未受影响

### 步骤4: ID参数SQL注入测试
1. **测试ID注入攻击**
   ```
   正常ID: /api/students/1
   注入ID: /api/students/1' OR 1=1 --
   注入ID: /api/students/999999' UNION SELECT * FROM users --
   注入ID: /api/students/null'; DROP TABLE classes; --
   ```

2. **测试删除操作注入**
   ```
   /api/students/delete/1' OR 1=1 --
   /api/users/delete/999; TRUNCATE TABLE users --
   ```

3. **验证ID参数安全**
   - 确认ID参数被正确验证
   - 验证恶意ID被拒绝
   - 检查数据完整性未受影响

### 步骤5: 时间盲注SQL注入测试
1. **测试时间延迟注入**
   ```
   测试输入: ' AND (SELECT * FROM (SELECT(SLEEP(5)))a) --
   测试输入: '; WAITFOR DELAY '00:00:05' --
   测试输入: ' AND (SELECT COUNT(*) FROM users WHERE SLEEP(5)) --
   ```

2. **测量响应时间**
   - 记录正常请求的响应时间
   - 测试恶意注入的响应时间
   - 验证是否有异常延迟

3. **验证时间攻击防护**
   - 确认没有明显的时间延迟
   - 验证服务器资源未被滥用

## 预期结果

### 正确行为
1. **输入验证**: 所有SQL注入尝试都被拦截或转义
2. **查询安全**: 数据库查询使用参数化查询
3. **错误处理**: 返回适当的错误信息而不泄露系统信息
4. **数据保护**: 数据库结构和数据未受影响
5. **性能稳定**: 响应时间正常，无明显延迟

### 错误处理
1. **输入拒绝**: 包含SQL语法的输入应被拒绝
2. **安全日志**: 所有注入尝试应被记录
3. **错误信息**: 不暴露数据库结构信息

## 严格验证要求

### 查询参数验证
```typescript
// 验证查询参数被正确转义
const validateQueryParameter = (input: string) => {
  const sqlKeywords = [
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'UNION',
    'OR', 'AND', '--', '#', ';', 'WAITFOR', 'SLEEP'
  ];

  const inputUpper = input.toUpperCase();
  const containsSQL = sqlKeywords.some(keyword =>
    inputUpper.includes(keyword)
  );

  if (containsSQL) {
    throw new Error('Potential SQL injection detected');
  }
};
```

### API响应验证
```typescript
// 验证API响应安全性
const validateAPIResponse = (response: any) => {
  validateRequiredFields(response, ['success', 'data', 'message']);
  validateFieldTypes(response, {
    success: 'boolean',
    data: 'object',
    message: 'string'
  });

  // 确保响应不包含数据库错误信息
  const responseStr = JSON.stringify(response);
  expect(responseStr).not.toMatch(/SQL|database|table|column/i);
  expect(responseStr).not.toMatch(/syntax error|mysql|postgres/i);
};
```

### 数据完整性验证
```typescript
// 验证数据库完整性
const validateDatabaseIntegrity = async () => {
  // 检查关键表是否存在
  const criticalTables = ['users', 'students', 'classes', 'roles'];

  for (const table of criticalTables) {
    try {
      const result = await query(`SELECT COUNT(*) as count FROM ${table}`);
      expect(result.count).toBeGreaterThan(0);
    } catch (error) {
      throw new Error(`Critical table ${table} may be damaged`);
    }
  }
};
```

## 测试数据

### SQL注入向量
```typescript
const sqlInjectionPayloads = {
  unionBased: [
    "' UNION SELECT * FROM users --",
    "' UNION SELECT username,password FROM users --",
    "' UNION SELECT table_name FROM information_schema.tables --"
  ],
  booleanBased: [
    "' OR 1=1 --",
    "' AND '1'='1' --",
    "' AND (SELECT COUNT(*) FROM users) > 0 --"
  ],
  timeBased: [
    "'; WAITFOR DELAY '00:00:05' --",
    "' AND (SELECT * FROM (SELECT(SLEEP(5)))a) --",
    "' AND (SELECT COUNT(*) FROM users WHERE SLEEP(5)) --"
  ],
  errorBased: [
    "' AND (SELECT * FROM (SELECT COUNT(*),CONCAT(version(),FLOOR(RAND(0)*2))x FROM information_schema.tables GROUP BY x)a) --",
    "' AND (SELECT * FROM (SELECT COUNT(*),CONCAT(database(),FLOOR(RAND(0)*2))x FROM information_schema.tables GROUP BY x)a) --"
  ],
  stackedQueries: [
    "'; DROP TABLE test --",
    "'; INSERT INTO users VALUES('hacker','password') --",
    "'; UPDATE users SET password='hacked' --"
  ]
};
```

### 测试账号
```typescript
const testUsers = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
  { id: 2, username: 'teacher1', password: 'teacher123', role: 'teacher' },
  { id: 3, username: 'parent1', password: 'parent123', role: 'parent' }
];
```

## 通过/失败标准

### 通过标准
- [ ] 所有SQL注入尝试都被成功拦截
- [ ] 数据库查询使用参数化查询
- [ ] 错误信息不泄露系统信息
- [ ] 数据库完整性保持完好
- [ ] 响应时间在正常范围内
- [ ] 安全日志记录完整
- [ ] API响应符合规范

### 失败标准
- [ ] SQL注入成功执行
- [ ] 数据库结构信息泄露
- [ ] 数据被未授权修改或删除
- [ ] 系统性能明显下降
- [ ] 错误信息包含敏感信息

## 测试环境要求

### 数据库配置
- 启用查询日志记录
- 配置适当的权限设置
- 定期备份数据库

### 应用配置
- 启用SQL注入防护中间件
- 配置ORM安全设置
- 启用查询参数验证

### 监控工具
- 数据库监控工具
- 应用性能监控
- 安全事件日志系统

## 风险评估

### 严重风险
- 数据泄露和损坏
- 系统完全控制权丢失
- 业务中断和数据丢失

### 缓解措施
- 在隔离的测试环境执行
- 使用专门的测试数据库
- 测试前备份数据
- 监控系统状态

## 相关文档
- [SQL注入防护指南](../../../security/sql-injection-prevention.md)
- [数据库安全最佳实践](../../../security/database-security.md)
- [ORM安全配置](../../../security/orm-security.md)

## 测试历史记录
| 测试日期 | 测试人员 | 测试结果 | 问题描述 | 解决状态 |
|----------|----------|----------|----------|----------|
| 2025-11-24 | Claude | 待测试 | - | - |