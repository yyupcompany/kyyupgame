# Bug #9 修复指南 - 租户隔离不完整

## 问题描述
租户隔离机制不够严格，某些路径没有强制租户验证，可能导致数据泄露。用户可能访问到其他租户的数据。

## 严重级别
**严重**

## 受影响的文件
- `server/src/middlewares/auth.middleware.ts`
  - 行号: 751-773
- `server/src/app.ts`
  - 行号: 407-470
- 所有业务 API 控制器

## 漏洞代码

### 漏洞位置: app.ts 第751-773行
```typescript
// ❌ 租户验证路径白名单不完整
const requireTenantPaths = [
  '/api/users',
  '/api/students',
  '/api/teachers',
  '/api/classes',
  '/api/enrollments',
  '/api/activities',
  '/api/reports'
];

// ❌ dashboard 被注释掉，允许不带租户访问
// '/api/dashboard', // ✅ 开发环境允许不带租户访问dashboard
```

### 漏洞分析

1. **白名单不完整**: 许多业务 API 没有包含在白名单中
2. **开发环境例外**: dashboard 被排除在验证之外
3. **缺少默认拒绝**: 没有在白名单中的路径默认允许访问
4. **缺少数据库层验证**: 没有在查询层面强制租户过滤

## 修复方案

### 步骤 1: 创建租户隔离中间件

创建文件 `server/src/middlewares/tenant-isolation.middleware.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * 租户上下文接口
 */
interface TenantContext {
  id: number;
  code: string;
  name: string;
}

/**
 * 扩展 Express Request
 */
declare module 'express' {
  interface Request {
    tenant?: TenantContext;
    isSystemAdmin?: boolean;
  }
}

/**
 * 不需要租户验证的路径
 * 仅用于系统级端点，如健康检查、认证等
 */
const EXEMPT_PATHS = [
  '/health',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/logout',
  '/api/public',
  '/api/docs',
  '/api/swagger'
];

/**
 * 系统管理员专用的路径
 */
const SYSTEM_ADMIN_ONLY_PATHS = [
  '/api/system',
  '/api/admin/tenants',
  '/api/admin/users',
  '/api/admin/settings'
];

/**
 * 检查路径是否豁免租户验证
 */
function isPathExempt(path: string): boolean {
  return EXEMPT_PATHS.some(exemptPath => path.startsWith(exemptPath));
}

/**
 * 检查路径是否需要系统管理员权限
 */
function isSystemAdminPath(path: string): boolean {
  return SYSTEM_ADMIN_ONLY_PATHS.some(adminPath => path.startsWith(adminPath));
}

/**
 * 从请求中提取租户信息
 */
function extractTenantFromRequest(req: Request): TenantContext | null {
  // 从请求头获取
  const tenantId = req.headers['x-tenant-id'];
  const tenantCode = req.headers['x-tenant-code'];

  // 从用户获取
  if (req.user?.kindergartenId) {
    return {
      id: req.user.kindergartenId,
      code: req.user.tenantCode || '',
      name: req.user.tenantName || ''
    };
  }

  // 从查询参数获取（仅开发环境）
  if (process.env.NODE_ENV === 'development') {
    const queryTenantId = req.query.tenantId;
    if (queryTenantId) {
      return {
        id: parseInt(queryTenantId as string),
        code: '',
        name: ''
      };
    }
  }

  return null;
}

/**
 * 租户隔离中间件
 */
export function tenantIsolation(req: Request, res: Response, next: NextFunction) {
  // 检查是否豁免
  if (isPathExempt(req.path)) {
    return next();
  }

  // 检查是否为系统管理员路径
  if (isSystemAdminPath(req.path)) {
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          message: '此操作需要系统管理员权限',
          code: 'SYSTEM_ADMIN_REQUIRED'
        }
      });
    }
    req.isSystemAdmin = true;
    return next();
  }

  // 提取租户信息
  const tenant = extractTenantFromRequest(req);

  if (!tenant) {
    return res.status(400).json({
      success: false,
      error: {
        message: '缺少租户信息',
        code: 'TENANT_REQUIRED',
        hint: '请在请求中提供租户ID或租户代码'
      }
    });
  }

  // 验证租户 ID 有效性
  if (!tenant.id || tenant.id <= 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: '无效的租户ID',
        code: 'INVALID_TENANT_ID'
      }
    });
  }

  // 设置租户上下文
  req.tenant = tenant;

  // 记录租户访问
  logger.debug('[租户隔离]', {
    path: req.path,
    method: req.method,
    tenantId: tenant.id,
    userId: req.user?.id
  });

  next();
}

/**
 * 租户数据查询范围中间件
 * 确保所有查询都包含租户过滤
 */
export function tenantQueryScope(req: Request, res: Response, next: NextFunction) {
  // 覆盖 Sequelize 查询方法，自动添加租户过滤
  const originalAddScope = req.model?.addScope;

  if (originalAddScope && req.tenant) {
    // 为所有模型添加默认租户范围
    req.model.addScope('tenantScope', (tenantId: number) => {
      return {
        where: {
          kindergartenId: tenantId
        }
      };
    });
  }

  next();
}
```

### 步骤 2: 创建数据库行级安全

创建文件 `server/src/models/tenant-model.base.ts`:

```typescript
import { Model } from 'sequelize';

/**
 * 租户模型基类
 * 所有需要租户隔离的模型都应该继承此类
 */
export abstract class TenantModel extends Model {
  // 租户 ID 字段（所有租户隔离的表都需要）
  declare kindergartenId: number;

  /**
   * 自动添加租户过滤的范围
   */
  static addTenantScope(tenantId: number) {
    this.addScope('tenantScope', {
      where: {
        kindergartenId: tenantId
      }
    });
  }

  /**
   * 验证记录是否属于指定租户
   */
  static async belongsToTenant(recordId: number, tenantId: number): Promise<boolean> {
    const record = await this.findOne({
      where: {
        id: recordId,
        kindergartenId: tenantId
      }
    });

    return !!record;
  }
}

/**
 * 使用示例：
 *
 * import { TenantModel } from './tenant-model.base';
 *
 * class User extends TenantModel {
 *   // 其他字段...
 * }
 *
 * // 使用时自动添加租户过滤
 * User.addTenantScope(tenantId);
 * const users = await User.findAll(); // 自动添加 WHERE kindergartenId = tenantId
 */
```

### 步骤 3: 更新模型使用租户基类

**示例：更新 user.model.ts**

```typescript
import { TenantModel } from './tenant-model.base';
import { DataTypes } from 'sequelize';

class User extends TenantModel {
  // 字段定义保持不变
  declare id: number;
  declare username: string;
  declare email: string;
  declare phone: string;

  // kindergartenId 由基类提供
  declare kindergartenId: number;
}

export default User;
```

### 步骤 4: 创建租户验证工具

创建文件 `server/src/utils/tenant-validator.ts`:

```typescript
import { Request } from 'express';
import { ForbiddenError } from './errors';

/**
 * 验证租户访问权限
 */
export function validateTenantAccess(
  req: Request,
  recordKindergartenId: number
): void {
  const tenantId = req.tenant?.id;
  const isSystemAdmin = req.isSystemAdmin;

  // 系统管理员可以访问所有租户数据
  if (isSystemAdmin) {
    return;
  }

  // 验证租户 ID
  if (tenantId !== recordKindergartenId) {
    logger.warn('[租户验证失败]', {
      requestTenantId: tenantId,
      recordTenantId: recordKindergartenId,
      path: req.path,
      userId: req.user?.id
    });

    throw new ForbiddenError('无权访问此资源');
  }
}

/**
 * 为查询添加租户过滤
 */
export function addTenantFilter(req: Request, query: any): any {
  const tenantId = req.tenant?.id;
  const isSystemAdmin = req.isSystemAdmin;

  // 系统管理员可以选择是否过滤租户
  if (isSystemAdmin && req.query.includeAllTenants === 'true') {
    return query;
  }

  // 添加租户过滤
  if (tenantId) {
    query.where = query.where || {};
    query.where.kindergartenId = tenantId;
  }

  return query;
}

/**
 * 批量验证租户访问
 */
export async function validateBatchTenantAccess(
  req: Request,
  recordIds: number[],
  model: any
): Promise<void> {
  const tenantId = req.tenant?.id;
  const isSystemAdmin = req.isSystemAdmin;

  if (isSystemAdmin) {
    return;
  }

  // 查询所有记录，确保它们都属于同一租户
  const records = await model.findAll({
    where: {
      id: recordIds
    },
    attributes: ['id', 'kindergartenId']
  });

  const invalidRecords = records.filter(
    r => r.kindergartenId !== tenantId
  );

  if (invalidRecords.length > 0) {
    throw new ForbiddenError(
      `有 ${invalidRecords.length} 条记录不属于当前租户`
    );
  }
}
```

### 步骤 5: 更新控制器

**示例：更新 user.controller.ts**

```typescript
import { validateTenantAccess, addTenantFilter } from '../../utils/tenant-validator';

// 获取用户列表
export async function getUsers(req: Request, res: Response) {
  // ✅ 自动添加租户过滤
  const query = addTenantFilter(req, {
    where: {
      status: 'active'
    }
  });

  const users = await User.findAll(query);

  res.json({ success: true, data: users });
}

// 获取单个用户
export async function getUserById(req: Request, res: Response) {
  const { id } = req.params;

  const user = await User.findByPk(id);

  if (!user) {
    throw new NotFoundError('用户');
  }

  // ✅ 验证租户访问
  validateTenantAccess(req, user.kindergartenId);

  res.json({ success: true, data: user });
}

// 更新用户
export async function updateUser(req: Request, res: Response) {
  const { id } = req.params;
  const updates = req.body;

  const user = await User.findByPk(id);

  if (!user) {
    throw new NotFoundError('用户');
  }

  // ✅ 验证租户访问
  validateTenantAccess(req, user.kindergartenId);

  // 确保不能修改 kindergartenId
  delete updates.kindergartenId;

  await user.update(updates);

  res.json({ success: true, data: user });
}

// 删除用户
export async function deleteUser(req: Request, res: Response) {
  const { id } = req.params;

  const user = await User.findByPk(id);

  if (!user) {
    throw new NotFoundError('用户');
  }

  // ✅ 验证租户访问
  validateTenantAccess(req, user.kindergartenId);

  await user.destroy();

  res.json({ success: true, message: '用户已删除' });
}
```

### 步骤 6: 更新 app.ts

**修复前：**
```typescript
// ❌ 不完整的租户路径白名单
const requireTenantPaths = [
  '/api/users',
  '/api/students',
  '/api/teachers',
  '/api/classes',
  '/api/enrollments',
  '/api/activities',
  '/api/reports'
];
```

**修复后：**
```typescript
import { tenantIsolation } from './middlewares/tenant-isolation.middleware';

// ✅ 所有 API 路径都需要租户验证（除了豁免的路径）
app.use('/api/', tenantIsolation);

// 豁免的路径在中间件内部定义
```

### 步骤 7: 添加数据库迁移

创建迁移文件 `server/src/migrations/20250103000000-ensure-tenant-id.js`:

```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 确保所有业务表都有 kindergartenId 字段

    const tables = [
      'users',
      'students',
      'teachers',
      'classes',
      'enrollments',
      'activities',
      'notifications',
      'reports'
    ];

    for (const table of tables) {
      // 检查表是否存在 kindergartenId 列
      const tableDescription = await queryInterface.describeTable(table);

      if (!tableDescription.kindergartenId) {
        await queryInterface.addColumn(
          table,
          'kindergartenId',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1, // 默认租户 ID
            references: {
              model: 'kindergartens',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
          }
        );

        console.log(`✅ 已为表 ${table} 添加 kindergartenId 列`);
      }

      // 创建索引
      await queryInterface.addIndex(
        table,
        ['kindergartenId'],
        {
          name: `idx_${table}_kindergarten_id`
        }
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    // 回滚：删除 kindergartenId 列
    // 注意：这会破坏租户隔离，仅在测试环境使用
    if (process.env.NODE_ENV === 'test') {
      const tables = [
        'users',
        'students',
        'teachers',
        'classes',
        'enrollments',
        'activities',
        'notifications',
        'reports'
      ];

      for (const table of tables) {
        await queryInterface.removeColumn(table, 'kindergartenId');
      }
    }
  }
};
```

运行迁移：
```bash
cd server && npx sequelize-cli db:migrate
```

### 步骤 8: 更新环境变量

更新 `server/.env`:

```bash
# ================================
# 租户隔离配置
# ================================

# 是否启用严格的租户隔离
TENANT_ISOLATION_STRICT=true

# 是否允许系统管理员查看所有租户数据
ALLOW_SYSTEM_ADMIN_VIEW_ALL=false

# 默认租户 ID（仅用于开发环境）
DEFAULT_TENANT_ID=1
```

## 验证步骤

### 1. 单元测试
创建文件 `server/src/__tests__/tenant-isolation.test.ts`:

```typescript
import request from 'supertest';
import app from '../src/app';

describe('Tenant Isolation', () => {
  let tenant1Token: string;
  let tenant2Token: string;
  let tenant1UserId: string;
  let tenant2UserId: string;

  beforeAll(async () => {
    // 创建租户1的用户
    const response1 = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'tenant1_user',
        password: 'Test123!@#',
        kindergartenId: 1
      });
    tenant1Token = response1.body.data.accessToken;
    tenant1UserId = response1.body.data.user.id;

    // 创建租户2的用户
    const response2 = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'tenant2_user',
        password: 'Test123!@#',
        kindergartenId: 2
      });
    tenant2Token = response2.body.data.accessToken;
    tenant2UserId = response2.body.data.user.id;
  });

  describe('租户隔离验证', () => {
    it('应该允许租户1访问自己的用户', async () => {
      const response = await request(app)
        .get(`/api/users/${tenant1UserId}`)
        .set('Authorization', `Bearer ${tenant1Token}`)
        .set('X-Tenant-Id', '1');

      expect(response.status).toBe(200);
    });

    it('应该拒绝租户1访问租户2的用户', async () => {
      const response = await request(app)
        .get(`/api/users/${tenant2UserId}`)
        .set('Authorization', `Bearer ${tenant1Token}`)
        .set('X-Tenant-Id', '1');

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('应该在列表查询中自动过滤租户数据', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${tenant1Token}`)
        .set('X-Tenant-Id', '1');

      expect(response.status).toBe(200);
      // 确保只返回租户1的用户
      response.body.data.forEach((user: any) => {
        expect(user.kindergartenId).toBe(1);
      });
    });
  });

  describe('租户验证绕过', () => {
    it('应该拒绝没有租户信息的请求', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${tenant1Token}`);
      // 注意：没有 X-Tenant-Id 头

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('TENANT_REQUIRED');
    });

    it('应该拒绝伪造的租户ID', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${tenant1Token}`)
        .set('X-Tenant-Id', '999999');

      // 应该根据用户实际的 kindergartenId 验证
      expect([400, 403]).toContain(response.status);
    });
  });

  describe('系统管理员', () => {
    it('应该允许系统管理员访问所有租户数据', async () => {
      // 使用系统管理员 token
      const adminResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'admin123'
        });

      const adminToken = adminResponse.body.data.accessToken;

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-Tenant-Id', '1')
        .query({ includeAllTenants: 'true' });

      expect(response.status).toBe(200);
    });
  });
});
```

### 2. 安全测试
创建文件 `server/tests/security/tenant-isolation.test.ts`:

```typescript
import request from 'supertest';
import app from '../src/app';

describe('Tenant Isolation Security Tests', () => {
  it('应该防止租户间数据泄露', async () => {
    // 租户A尝试访问租户B的敏感数据
    const response = await request(app)
      .get('/api/students')
      .set('Authorization', 'Bearer tenantA_token')
      .set('X-Tenant-Id', '1')
      .query({ search: 'tenantB_student_name' });

    // 确保没有返回租户B的数据
    if (response.body.data?.items) {
      response.body.data.items.forEach((item: any) => {
        expect(item.kindergartenId).toBe(1);
      });
    }
  });

  it('应该防止通过修改 ID 访问其他租户数据', async () => {
    // 租户A用户尝试通过枚举ID访问租户B数据
    for (let i = 1; i <= 100; i++) {
      const response = await request(app)
        .get(`/api/students/${i}`)
        .set('Authorization', 'Bearer tenantA_token')
        .set('X-Tenant-Id', '1');

      // 如果找到数据，确保属于租户A
      if (response.status === 200) {
        expect(response.body.data.kindergartenId).toBe(1);
      }
    }
  });

  it('应该防止批量操作中的租户混入', async () => {
    const response = await request(app)
      .post('/api/students/batch')
      .set('Authorization', 'Bearer tenantA_token')
      .set('X-Tenant-Id', '1')
      .send({
        studentIds: [1, 2, 999] // 999 可能属于其他租户
      });

    // 应该拒绝或过滤掉其他租户的数据
    expect([200, 403]).toContain(response.status);
  });
});
```

### 3. 运行测试
```bash
cd server && npm test -- tenant-isolation.test.ts
cd server && npm test -- tenant-isolation-security.test.ts
```

## 修复完成检查清单

- [ ] 租户隔离中间件已创建
- [ ] 租户模型基类已创建
- [ ] 所有业务模型已继承租户基类
- [ ] 租户验证工具已创建
- [ ] 所有控制器已添加租户验证
- [ ] app.ts 已更新使用租户中间件
- [ ] 数据库迁移已运行
- [ ] 环境变量已配置
- [ ] 单元测试已通过
- [ ] 安全测试已通过
- [ ] 所有 API 端点已验证租户隔离

---

**修复时间估计**: 10-15 小时
**测试时间估计**: 5-8 小时
**总时间估计**: 15-23 小时
