# 园区隔离功能实施 - 阶段二完成报告

## 执行时间
2024年12月27日

## 实施内容

### ✅ 任务1：修改JWT Token结构

**修改文件**：`server/src/middlewares/auth.middleware.ts`

**变更内容**：

1. **扩展 AuthenticatedUser 接口**
```typescript
export interface AuthenticatedUser {
  // ... 原有字段
  // 园区隔离相关字段
  primaryKindergartenId?: number;           // 主要所属幼儿园ID
  allowedKindergartenIds?: number[];        // 允许访问的幼儿园ID列表
  dataScope?: 'all' | 'single' | 'none';   // 数据范围
}
```

2. **Demo系统JWT Payload扩展**
```typescript
const token = jwt.sign(
  {
    id: user.id,
    phone: user.phone,
    role: user.role || 'parent',
    isDemo: true,
    // 园区隔离信息
    primaryKindergartenId: user.primary_kindergarten_id || null,
    allowedKindergartenIds: user.allowed_kindergarten_ids ? JSON.parse(user.allowed_kindergarten_ids) : null,
    dataScope: user.data_scope || 'single'
  },
  JWT_SECRET,
  { expiresIn: '7d' }
);
```

### ✅ 任务2：更新认证中间件

**修改文件**：`server/src/middlewares/auth.middleware.ts`

**变更内容**：

1. **扩展用户查询SQL**
   - Demo系统：增加 `primary_kindergarten_id`, `allowed_kindergarten_ids`, `data_scope` 字段
   - 租户系统：同样增加园区隔离字段

2. **填充 req.user 的园区上下文**
```typescript
req.user = {
  // ... 原有字段
  kindergartenId: user.primary_kindergarten_id || 1,
  // 园区隔离信息
  primaryKindergartenId: user.primary_kindergarten_id,
  allowedKindergartenIds: user.allowed_kindergarten_ids ? JSON.parse(user.allowed_kindergarten_ids) : null,
  dataScope: user.data_scope || 'single'
} as any;
```

3. **修改位置**
   - `verifyToken` 中的 Demo系统验证逻辑
   - `verifyToken` 中的租户系统验证逻辑
   - `authenticateWithDemoSystem` 中的登录逻辑
   - `authenticateWithUnifiedAuth` 中的租户登录逻辑

### ✅ 任务3：实现数据范围中间件

**新增文件**：`server/src/middlewares/data-scope.middleware.ts`

**核心功能**：

1. **applyDataScope 中间件**
   - 根据用户 `dataScope` 自动注入园区过滤条件
   - 支持 ALL（全部园区）、SINGLE（单个园区）、NONE（无权限）三种模式
   - 将过滤条件存储在 `req.dataFilter` 中

2. **getDataScopeFilter 工具函数**
   - 在 Service 层使用
   - 构建 Sequelize where 条件
   - 示例：`const where = getDataScopeFilter(req);`

3. **canAccessKindergarten 检查函数**
   - 检查用户是否可以访问指定园区
   - 用于精细化权限控制

4. **logCrossKindergartenAccess 审计函数**
   - 记录跨园数据访问日志
   - 用于安全审计和合规

5. **enforceDataScope 强制检查中间件**
   - 对敏感操作强制检查数据范围
   - 即使是管理员也要遵守指定规则

**使用示例**：

```typescript
// 1. 在路由中应用数据范围中间件
router.get('/students', verifyToken, applyDataScope, studentController.list);

// 2. 在 Controller/Service 中获取过滤条件
import { getDataScopeFilter } from '../middlewares/data-scope.middleware';

async list(req: Request) {
  const where = getDataScopeFilter(req);
  const students = await Student.findAll({ where });
}

// 3. 检查是否可以访问特定园区
import { canAccessKindergarten } from '../middlewares/data-scope.middleware';

if (!canAccessKindergarten(req, student.kindergartenId)) {
  throw new Error('无权访问该园区数据');
}

// 4. 强制数据范围检查（仅允许总园长操作）
router.post('/kindergartens', 
  verifyToken, 
  enforceDataScope([DataScope.ALL]), 
  kindergartenController.create
);
```

## 数据流程

### 认证流程
```
用户登录
  ↓
统一认证/Demo认证
  ↓
查询用户信息（包含园区字段）
  ↓
生成JWT Token（包含园区信息）
  ↓
返回Token给前端
```

### 请求验证流程
```
前端请求（携带Token）
  ↓
verifyToken 中间件
  ↓
解析Token，填充 req.user（包含园区信息）
  ↓
applyDataScope 中间件（可选）
  ↓
注入 req.dataFilter 过滤条件
  ↓
Controller/Service 使用过滤条件
  ↓
返回本园区数据
```

### 数据范围判断逻辑
```
检查 user.dataScope:
├─ dataScope = 'all'
│   ├─ 有 allowedKindergartenIds → 限制在列表范围内
│   └─ 无 allowedKindergartenIds → 无限制（所有园区）
├─ dataScope = 'single'
│   └─ 限制为 primaryKindergartenId
└─ dataScope = 'none'
    └─ 拒绝访问
```

## 核心改进点

### 1. JWT Token 增强

**原 Token Payload**：
```json
{
  "id": 121,
  "phone": "13800138000",
  "role": "admin"
}
```

**新 Token Payload**：
```json
{
  "id": 121,
  "phone": "13800138000",
  "role": "admin",
  "primaryKindergartenId": 1,
  "allowedKindergartenIds": [1, 2, 3],
  "dataScope": "all"
}
```

### 2. 请求上下文增强

**原 req.user**：
```typescript
{
  id: 121,
  username: 'admin',
  role: 'admin',
  kindergartenId: 1  // 固定值，不灵活
}
```

**新 req.user**：
```typescript
{
  id: 121,
  username: 'admin',
  role: 'admin',
  kindergartenId: 1,               // 默认园区（向后兼容）
  primaryKindergartenId: 1,        // 主园区
  allowedKindergartenIds: [1,2,3], // 可访问的园区列表
  dataScope: 'all'                 // 数据范围标识
}
```

### 3. 自动数据隔离

**无需手动过滤**：
```typescript
// ❌ 原方式：需要手动添加过滤
const students = await Student.findAll({
  where: { kindergartenId: req.user.kindergartenId }
});
```

**自动注入过滤**：
```typescript
// ✅ 新方式：自动应用过滤
const where = getDataScopeFilter(req);
const students = await Student.findAll({ where });
```

## 安全增强

### 1. 防止越权访问

**场景**：教师试图访问其他园区的学生数据

**防护**：
- Token中只包含教师所属园区
- dataScope = 'single'
- 中间件自动注入 `where.kindergartenId = teacher.kindergartenId`
- 即使前端伪造参数，后端也会强制过滤

### 2. 跨园访问审计

**记录内容**：
- 用户ID、用户所属园区
- 目标园区ID
- 操作类型（read/write/delete）
- 资源类型和ID
- 访问时间

**用途**：
- 检测异常跨园访问
- 合规审计
- 安全分析

### 3. 强制数据范围检查

**场景**：只有总园长可以创建新园区

**实现**：
```typescript
router.post('/kindergartens', 
  verifyToken, 
  enforceDataScope([DataScope.ALL]),  // 强制要求 dataScope = 'all'
  kindergartenController.create
);
```

## 向后兼容性

### ✅ 完全兼容

1. **原有字段保留**
   - `kindergartenId` 字段仍然存在（等于 primaryKindergartenId）
   - 原有依赖 `req.user.kindergartenId` 的代码无需修改

2. **默认值机制**
   - 如果数据库字段为空，使用合理默认值
   - `dataScope` 默认为 'single'（最安全）

3. **可选中间件**
   - `applyDataScope` 是可选的
   - 现有路由无需立即修改
   - 可以逐步应用到敏感路由

### ⚠️ 注意事项

1. **数据库字段必须存在**
   - 需要先执行阶段一的数据库迁移
   - 否则查询会失败

2. **JSON字段解析**
   - `allowedKindergartenIds` 存储为JSON字符串
   - 需要 `JSON.parse()` 解析

3. **NULL值处理**
   - 新用户可能没有园区归属
   - 需要在注册时设置

## 测试建议

### 单元测试

```typescript
describe('Data Scope Middleware', () => {
  it('应该为管理员设置 allowAll = true', () => {
    // 测试 dataScope = 'all'
  });

  it('应该为教师限制为单个园区', () => {
    // 测试 dataScope = 'single'
  });

  it('应该拒绝 dataScope = none 的用户', () => {
    // 测试权限拒绝
  });
});
```

### 集成测试

```typescript
describe('Student API with Data Scope', () => {
  it('教师只能查看本园学生', async () => {
    const token = generateTeacherToken({ kindergartenId: 1 });
    const res = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${token}`);
    
    // 验证返回的学生都属于园区1
    res.body.data.forEach(s => {
      expect(s.kindergartenId).toBe(1);
    });
  });

  it('总园长可以查看所有园区学生', async () => {
    const token = generateChiefPrincipalToken({ dataScope: 'all' });
    const res = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${token}`);
    
    // 应该包含多个园区的学生
  });
});
```

## 性能影响

### 查询性能

**影响**：
- 每个查询增加 `WHERE kindergartenId = ?` 条件
- 如果 `kindergartenId` 字段有索引，性能影响微乎其微

**优化建议**：
```sql
-- 为常用表的 kindergartenId 创建索引
CREATE INDEX idx_students_kindergarten ON students(kindergarten_id);
CREATE INDEX idx_teachers_kindergarten ON teachers(kindergarten_id);
CREATE INDEX idx_classes_kindergarten ON classes(kindergarten_id);
```

### Token大小

**影响**：
- Token增加约50-100字节
- 对网络传输影响可忽略

## 下一步工作

### 阶段三：业务流程开发

1. **总园长开通分园流程**
   - 创建幼儿园
   - 创建分园园长账号
   - 设置园区关联

2. **园长开通教师账号流程**
   - 限制只能为本园开通
   - 自动设置教师园区归属

3. **园长开通家长账号流程**
   - 通过学生关联
   - 自动设置家长园区归属

### 现有代码适配

1. **Controller层适配**
   - 在需要数据隔离的路由添加 `applyDataScope` 中间件
   - 在 Controller 中使用 `getDataScopeFilter(req)`

2. **Service层适配**
   - 接受过滤条件参数
   - 应用到查询条件

3. **测试补充**
   - 为所有涉及数据访问的API添加数据范围测试

## 总结

阶段二已完成认证授权增强，现在系统具备了：

1. ✅ JWT Token包含园区信息
2. ✅ 请求上下文自动填充园区数据
3. ✅ 数据范围自动过滤机制
4. ✅ 跨园访问审计功能
5. ✅ 强制数据范围检查能力

**核心价值**：
- 安全：防止越权访问
- 便捷：自动化数据隔离
- 灵活：支持多种数据范围
- 可审计：记录跨园访问
- 兼容：不影响现有功能
