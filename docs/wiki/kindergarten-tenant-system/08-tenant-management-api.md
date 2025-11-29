# 幼儿园租户管理API文档

## 📋 概述

本文档详细描述了基于**共享连接池架构**的幼儿园租户管理系统API。系统通过智能的租户识别和数据路由机制，为每个幼儿园提供独立、安全的API服务，同时实现高性能和低成本的多租户解决方案。

### 🎯 核心特性

- **智能租户识别**: 基于域名的自动租户识别
- **共享连接池**: 所有租户共享数据库连接池，提升资源利用率
- **透明数据隔离**: 对业务代码完全透明的数据隔离机制
- **统一认证**: JWT Token认证 + 租户验证
- **实时监控**: 完整的API调用和性能监控

## 🔧 API基础信息

- **基础URL**: `http://localhost:3000/api`
- **API版本**: v1
- **认证方式**: JWT Token + 租户识别
- **数据格式**: JSON
- **字符编码**: UTF-8
- **租户识别**: 通过HTTP Host头部自动识别

### 支持的域名格式

```
k001.yyup.cc      -> 租户代码: k001
k002.yyup.cc      -> 租户代码: k002
k001.kindergarten.com -> 租户代码: k001
```

## 🔐 认证机制

### 1. 租户识别中间件

系统通过`tenantResolverSharedPoolMiddleware`自动识别租户：

```http
# 请求示例 - 自动识别租户k001
GET /api/users
Host: k001.yyup.cc
Authorization: Bearer {token}
```

```typescript
// 租户识别流程
export const tenantResolverSharedPoolMiddleware = async (
  req: RequestWithTenant,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. 获取请求域名
    const domain = req.get('Host') || req.hostname;

    // 2. 提取租户代码
    const tenantCode = extractTenantCode(domain);

    if (!tenantCode) {
      return ApiResponse.error(res, '无法识别的租户域名', 'INVALID_TENANT_DOMAIN');
    }

    // 3. 验证租户
    const tenantInfo = await validateTenant(tenantCode);
    if (!tenantInfo) {
      return ApiResponse.error(res, '租户不存在或未激活', 'TENANT_NOT_FOUND');
    }

    // 4. 设置租户信息
    req.tenant = {
      code: tenantCode,
      domain: domain,
      databaseName: `tenant_${tenantCode}`
    };

    // 5. 获取共享数据库连接
    req.tenantDb = tenantDatabaseSharedPoolService.getGlobalConnection();

    next();
  } catch (error) {
    ApiResponse.error(res, '租户识别失败', 'TENANT_RESOLVER_ERROR');
  }
};
```

### 2. 用户认证API

#### 2.1 用户登录

```http
POST /api/auth/login
Host: k001.yyup.cc
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "expiresIn": 3600,
    "user": {
      "id": 1,
      "username": "admin",
      "realName": "系统管理员",
      "email": "admin@k001.yyup.cc",
      "avatar": "https://cdn.example.com/avatars/admin.png",
      "roles": ["admin"],
      "permissions": ["*"]
    },
    "tenant": {
      "code": "k001",
      "domain": "k001.yyup.cc",
      "databaseName": "tenant_k001"
    }
  },
  "message": "登录成功"
}
```

#### 2.2 刷新Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

### 3. JWT Token结构

```typescript
interface JWTPayload {
  sub: string;          // 用户ID
  tenantCode: string;   // 租户代码
  databaseName: string; // 租户数据库名
  role: string;         // 用户角色
  permissions: string[]; // 权限列表
  iat: number;          // 签发时间
  exp: number;          // 过期时间
}
```

### 4. API请求头规范

```http
GET /api/users
Host: k001.yyup.cc
Authorization: Bearer {jwt_token}
Content-Type: application/json
X-Requested-With: XMLHttpRequest
```

## 🏢 租户管理API

### 1. 租户健康检查

#### 1.1 租户识别状态检查

检查当前请求的租户识别状态。

```http
GET /api/health/tenant
Host: k001.yyup.cc
Authorization: Bearer {token}
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "tenant": {
      "code": "k001",
      "domain": "k001.yyup.cc",
      "databaseName": "tenant_k001",
      "status": "active"
    },
    "database": {
      "connected": true,
      "poolStats": {
        "activeConnections": 5,
        "idleConnections": 10,
        "totalConnections": 15
      }
    },
    "timestamp": "2025-11-29T04:20:00.000Z"
  }
}
```

#### 1.2 共享连接池状态

获取全局数据库连接池的状态。

```http
GET /api/health/connection-pool
Authorization: Bearer {admin_token}
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "poolSize": {
      "max": 30,
      "min": 5
    },
    "activeConnections": 12,
    "idleConnections": 8,
    "utilization": 40.0,
    "health": "healthy",
    "tenantConnections": [
      {
        "tenantCode": "k001",
        "queries": 145,
        "avgResponseTime": 25
      },
      {
        "tenantCode": "k002",
        "queries": 98,
        "avgResponseTime": 18
      }
    ]
  }
}
```

### 2. 租户配置管理

#### 2.1 获取租户信息

获取当前租户的详细信息。

```http
GET /api/tenant/info
Host: k001.yyup.cc
Authorization: Bearer {token}
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "tenant": {
      "code": "k001",
      "name": "阳光幼儿园",
      "domain": "k001.yyup.cc",
      "databaseName": "tenant_k001",
      "status": "active",
      "createdAt": "2024-01-15T10:00:00.000Z"
    },
    "features": {
      "aiAssistant": true,
      "advancedReports": true,
      "parentPortal": true,
      "onlinePayment": false
    },
    "limits": {
      "maxUsers": 500,
      "maxStudents": 300,
      "storageQuota": "10GB"
    },
    "usage": {
      "currentUsers": 125,
      "currentStudents": 180,
      "storageUsed": "3.2GB"
    }
  }
}
```

#### 2.2 更新租户配置

更新租户的功能配置。

```http
PUT /api/tenant/config
Host: k001.yyup.cc
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "features": {
    "onlinePayment": true,
    "aiAssistant": false
  },
  "ui": {
    "theme": "modern",
    "primaryColor": "#1890ff"
  }
}
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "updatedFields": ["features.onlinePayment", "features.aiAssistant", "ui.theme"],
    "updatedAt": "2025-11-29T04:25:00.000Z"
  },
  "message": "租户配置更新成功"
}
```

## 👥 业务API

### 1. 用户管理

#### 1.1 获取用户列表

获取当前租户的用户列表（自动应用数据隔离）。

```http
GET /api/users?page=1&limit=20&role=teacher&status=active
Host: k001.yyup.cc
Authorization: Bearer {token}
```

**查询参数**：
- `page` (number): 页码，默认1
- `limit` (number): 每页数量，默认20
- `role` (string): 角色筛选
- `status` (string): 状态筛选
- `search` (string): 搜索关键词

**响应示例**：
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "username": "teacher001",
        "realName": "张老师",
        "email": "zhang@k001.yyup.cc",
        "phone": "13800138001",
        "avatar": "https://cdn.example.com/avatars/teacher001.png",
        "roles": ["teacher"],
        "status": "active",
        "lastLoginAt": "2025-11-29T08:30:00.000Z",
        "createdAt": "2024-09-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 125,
      "totalPages": 7
    }
  }
}
```

#### 1.2 创建用户

在当前租户下创建新用户。

```http
POST /api/users
Host: k001.yyup.cc
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "username": "teacher002",
  "password": "password123",
  "realName": "李老师",
  "email": "li@k001.yyup.cc",
  "phone": "13800138002",
  "roles": ["teacher"]
}
```

**自动SQL转换示例**：
```sql
-- 原始SQL
INSERT INTO users (username, password_hash, real_name, email, phone)
VALUES (?, ?, ?, ?, ?)

-- 自动转换后（添加租户数据库名前缀）
INSERT INTO tenant_k001.users (username, password_hash, real_name, email, phone)
VALUES (?, ?, ?, ?, ?)
```

### 2. 学生管理

#### 2.1 获取学生列表

```http
GET /api/students?classId=1&gradeLevel=middle&page=1&limit=20
Host: k001.yyup.cc
Authorization: Bearer {token}
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": 1,
        "studentId": "S2024001",
        "name": "张小明",
        "gender": "male",
        "birthday": "2019-03-15",
        "class": {
          "id": 1,
          "name": "中班A班",
          "gradeLevel": "middle"
        },
        "parents": [
          {
            "name": "张爸爸",
            "phone": "13800138001",
            "relationship": "father"
          }
        ],
        "status": "active",
        "enrollmentDate": "2024-09-01"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 180,
      "totalPages": 9
    }
  }
}
```

### 3. 班级管理

#### 3.1 获取班级列表

```http
GET /api/classes?kindergartenId=1&gradeLevel=small
Host: k001.yyup.cc
Authorization: Bearer {token}
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "classes": [
      {
        "id": 1,
        "name": "小班A班",
        "code": "SA001",
        "gradeLevel": "small",
        "capacity": 25,
        "currentStudents": 22,
        "headTeacher": {
          "id": 1,
          "name": "王老师"
        },
        "status": "active",
        "createdAt": "2024-08-01T10:00:00.000Z"
      }
    ]
  }
}
```

## 🛡️ 数据隔离机制

### 1. 自动数据隔离

所有业务API都会自动应用租户数据隔离：

```typescript
// 数据访问层示例
class UserService {
  async getUsers(filters: UserFilters): Promise<User[]> {
    const sql = `
      SELECT u.*, r.name as role_name
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.status = :status
    `;

    // 自动应用租户隔离 - SQL会被转换为：
    // SELECT u.*, r.name as role_name
    // FROM tenant_k001.users u
    // LEFT JOIN tenant_k001.user_roles ur ON u.id = ur.user_id
    // LEFT JOIN tenant_k001.roles r ON ur.role_id = r.id
    // WHERE u.status = :status

    return await tenantDatabaseSharedPoolService.queryTenantDatabase(
      req.tenant.code, sql, { replacements: filters }
    );
  }
}
```

### 2. 跨表查询隔离

复杂的JOIN查询也会自动处理：

```sql
-- 原始查询
SELECT s.name, c.name as class_name, u.real_name as teacher_name
FROM students s
JOIN classes c ON s.class_id = c.id
JOIN users u ON c.head_teacher_id = u.id
WHERE s.status = 'active'

-- 自动转换为租户查询
SELECT s.name, c.name as class_name, u.real_name as teacher_name
FROM tenant_k001.students s
JOIN tenant_k001.classes c ON s.class_id = c.id
JOIN tenant_k001.users u ON c.head_teacher_id = u.id
WHERE s.status = 'active'
```

### 3. 事务隔离

```typescript
class StudentService {
  async enrollStudent(studentData: StudentData): Promise<void> {
    const connection = tenantDatabaseSharedPoolService.getGlobalConnection();
    const transaction = await connection.transaction();

    try {
      // 所有操作都在同一个租户的事务中
      await connection.query(
        'INSERT INTO tenant_k001.students (...) VALUES (...)',
        { transaction }
      );

      await connection.query(
        'UPDATE tenant_k001.classes SET current_students = current_students + 1 WHERE id = ?',
        { replacements: [studentData.classId], transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
```

## 📊 错误处理

### 1. 标准错误响应格式

```json
{
  "success": false,
  "error": {
    "code": "TENANT_NOT_FOUND",
    "message": "租户不存在",
    "details": {
      "tenantCode": "k999",
      "domain": "k999.yyup.cc",
      "timestamp": "2025-11-29T04:45:00.000Z"
    }
  },
  "timestamp": "2025-11-29T04:45:00.000Z"
}
```

### 2. 租户相关错误代码

| 错误代码 | HTTP状态码 | 描述 |
|---------|-----------|------|
| `INVALID_TENANT_DOMAIN` | 400 | 无法识别的租户域名 |
| `TENANT_NOT_FOUND` | 404 | 租户不存在 |
| `TENANT_SUSPENDED` | 403 | 租户已被暂停 |
| `TENANT_RESOLVER_ERROR` | 500 | 租户识别失败 |
| `DB_CONNECTION_FAILED` | 500 | 数据库连接失败 |
| `SHARED_POOL_ERROR` | 500 | 共享连接池错误 |

### 3. 租户识别中间件错误处理

```typescript
export const tenantResolverSharedPoolMiddleware = async (
  req: RequestWithTenant,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const domain = req.get('Host') || req.hostname;
    const tenantCode = extractTenantCode(domain);

    if (!tenantCode) {
      logger.warn('[租户识别] 无法解析租户代码', { domain });
      if (process.env.NODE_ENV === 'production') {
        ApiResponse.error(res, '无法识别的租户域名', 'INVALID_TENANT_DOMAIN');
        return;
      }
    }

    const tenantInfo = await validateTenant(tenantCode);
    if (!tenantInfo) {
      logger.warn('[租户识别] 租户不存在或未激活', { tenantCode, domain });
      ApiResponse.error(res, '租户不存在或未激活', 'TENANT_NOT_FOUND');
      return;
    }

    // 设置租户信息
    req.tenant = {
      code: tenantCode,
      domain: domain,
      databaseName: `tenant_${tenantCode}`
    };

    // 获取共享数据库连接
    req.tenantDb = tenantDatabaseSharedPoolService.getGlobalConnection();

    next();
  } catch (error) {
    logger.error('[租户识别] 中间件错误', error);
    ApiResponse.error(res, '租户识别失败', 'TENANT_RESOLVER_ERROR');
  }
};
```

## 🚀 性能优化

### 1. 共享连接池性能

```typescript
// 连接池性能监控
class PerformanceMonitor {
  async getDetailedPoolStats(): Promise<PoolStats> {
    const stats = await tenantDatabaseSharedPoolService.getPoolStats();

    return {
      ...stats,
      efficiency: {
        connectionUtilization: (stats.activeConnections / stats.poolSize.max) * 100,
        avgWaitTime: this.calculateAverageWaitTime(),
        throughput: this.calculateThroughput()
      },
      tenants: await this.getTenantPerformanceMetrics()
    };
  }

  private async getTenantPerformanceMetrics(): Promise<TenantMetrics[]> {
    const tenantCodes = ['k001', 'k002', 'k003'];
    const metrics: TenantMetrics[] = [];

    for (const code of tenantCodes) {
      metrics.push({
        tenantCode: code,
        queryCount: await this.getQueryCount(code),
        avgResponseTime: await this.getAvgResponseTime(code),
        errorRate: await this.getErrorRate(code)
      });
    }

    return metrics;
  }
}
```

### 2. 查询缓存策略

```typescript
class QueryCacheManager {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟

  async cachedQuery(tenantCode: string, sql: string): Promise<any> {
    const cacheKey = `${tenantCode}:${sql}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const result = await tenantDatabaseSharedPoolService.queryTenantDatabase(
      tenantCode, sql
    );

    this.cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  }

  // 定期清理过期缓存
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }
}
```

## 📈 监控与日志

### 1. 租户API监控

```typescript
class TenantApiMonitor {
  async logApiCall(req: Request, res: Response, duration: number) {
    const log = {
      tenantCode: req.tenant?.code,
      databaseName: req.tenant?.databaseName,
      userId: req.user?.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      connectionPool: await this.getConnectionPoolInfo()
    };

    await this.logger.info('TENANT_API_CALL', log);

    // 性能告警
    if (duration > 1000) {
      await this.logger.warn('SLOW_API_CALL', {
        ...log,
        alert: 'API响应时间超过1秒'
      });
    }
  }

  private async getConnectionPoolInfo() {
    const stats = await tenantDatabaseSharedPoolService.getPoolStats();
    return {
      activeConnections: stats.activeConnections,
      idleConnections: stats.idleConnections,
      utilization: `${(stats.activeConnections / stats.poolSize.max * 100).toFixed(2)}%`
    };
  }
}
```

### 2. 连接池健康检查

```typescript
class HealthCheckService {
  async performHealthCheck(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkConnectionPool(),
      this.checkTenantDatabases(),
      this.checkCacheSystem()
    ]);

    return {
      overall: this.calculateOverallHealth(checks),
      checks: {
        connectionPool: checks[0].status === 'fulfilled' ? checks[0].value : null,
        tenantDatabases: checks[1].status === 'fulfilled' ? checks[1].value : null,
        cacheSystem: checks[2].status === 'fulfilled' ? checks[2].value : null
      },
      timestamp: new Date().toISOString()
    };
  }

  private async checkConnectionPool(): Promise<PoolHealth> {
    try {
      const stats = await tenantDatabaseSharedPoolService.getPoolStats();
      const health = await tenantDatabaseSharedPoolService.healthCheck();

      return {
        status: health ? 'healthy' : 'unhealthy',
        activeConnections: stats.activeConnections,
        utilization: (stats.activeConnections / stats.poolSize.max) * 100
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }
}
```

## 🧪 API测试

### 1. 基础测试命令

```bash
# 1. 租户识别测试
curl -v -H "Host: k001.yyup.cc" http://localhost:3000/api/health/tenant

# 2. 用户登录测试
curl -X POST \
  -H "Host: k001.yyup.cc" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}' \
  http://localhost:3000/api/auth/login

# 3. 获取用户列表测试
TOKEN="your_jwt_token_here"
curl -X GET \
  -H "Host: k001.yyup.cc" \
  -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/users?page=1&limit=10"

# 4. 连接池状态测试
curl -X GET \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/health/connection-pool
```

### 2. 性能测试脚本

```bash
#!/bin/bash
# performance-test.sh

TENANT_CODES=("k001" "k002" "k003")
BASE_URL="http://localhost:3000"

echo "开始API性能测试..."

# 租户识别性能测试
echo "测试租户识别性能..."
time for i in {1..100}; do
  for tenant in "${TENANT_CODES[@]}"; do
    curl -s -H "Host: ${tenant}.yyup.cc" \
      "${BASE_URL}/api/health/tenant" > /dev/null
  done
done

# 数据库查询性能测试
echo "测试数据库查询性能..."
TOKEN=$(curl -s -X POST \
  -H "Host: k001.yyup.cc" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}' \
  "${BASE_URL}/api/auth/login" | jq -r '.data.token')

time for i in {1..50}; do
  curl -s -H "Host: k001.yyup.cc" \
    -H "Authorization: Bearer $TOKEN" \
    "${BASE_URL}/api/users" > /dev/null
done

echo "性能测试完成"
```

### 3. Postman测试集合

提供完整的Postman集合，包含：

- 租户识别和认证测试
- 业务API数据隔离测试
- 连接池性能监控测试
- 错误处理测试
- 跨租户访问测试

## ✅ 总结

### 核心优势

1. **智能租户识别**: 基于域名的自动租户识别，无需手动配置
2. **共享连接池**: 大幅减少数据库连接数，提升资源利用率
3. **透明数据隔离**: 对业务代码完全透明的数据隔离机制
4. **高性能访问**: 优化的连接池管理和查询缓存
5. **完整监控**: 实时的API调用和连接池监控

### 技术特性

- **多域名支持**: 支持 `k001.yyup.cc` 和 `k001.kindergarten.com` 等格式
- **自动SQL转换**: 智能的表名路由和SQL转换
- **事务安全**: 租户级别的事务一致性保证
- **缓存优化**: 多层缓存提升响应速度
- **故障恢复**: 健康检查和自动恢复机制

### 最佳实践

1. **域名规范**: 使用统一的域名格式便于租户识别
2. **连接池配置**: 根据实际负载调整连接池大小
3. **缓存策略**: 合理设置缓存TTL，平衡性能和数据一致性
4. **监控告警**: 设置关键指标的监控和告警
5. **错误处理**: 完善的错误处理和日志记录

通过这套基于共享连接池架构的API系统，实现了高性能、低成本、易维护的多租户幼儿园管理解决方案，为大规模SaaS应用提供了坚实的技术基础。