# 租户数据库访问的代码流程详解

## 🔍 关键代码片段分析

### **1. 租户识别中间件 - 建立数据库连接**

```typescript
// 文件：k.yyup.com/server/src/middlewares/tenant-resolver.middleware.ts

export const tenantResolverMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 第1步：获取请求域名
    const domain = req.get('Host') || req.hostname;
    // 例如：k001.yyup.cc:3000

    // 第2步：提取租户代码
    const tenantCode = extractTenantCode(domain);
    // 使用正则：/^(k\d+)\.yyup\.cc$/
    // 结果：k001

    if (!tenantCode) {
      // 无法识别租户，返回错误
      ApiResponse.error(res, '无法识别的租户域名', 'INVALID_TENANT_DOMAIN');
      return;
    }

    // 第3步：验证租户是否存在
    const tenantInfo = await validateTenant(tenantCode);
    if (!tenantInfo) {
      ApiResponse.error(res, '租户不存在或未激活', 'TENANT_NOT_FOUND');
      return;
    }

    // 第4步：设置租户信息到请求对象
    req.tenant = {
      code: tenantCode,                    // k001
      domain: domain,                      // k001.yyup.cc
      databaseName: `tenant_${tenantCode}` // tenant_k001
    };

    // 第5步：建立租户数据库连接
    req.tenantDb = await tenantDatabaseService.getTenantConnection(tenantCode);
    
    logger.info('租户解析成功', {
      tenantCode,
      domain,
      databaseName: req.tenant.databaseName
    });

    next();
  } catch (error) {
    logger.error('租户解析中间件错误', error);
    ApiResponse.error(res, '租户解析失败', 'TENANT_RESOLVER_ERROR');
  }
};

// 提取租户代码的函数
function extractTenantCode(domain: string): string | null {
  const cleanDomain = domain.split(':')[0]; // 移除端口号
  const match = cleanDomain.match(/^(k\d+)\.yyup\.cc$/);
  return match ? match[1] : null;
}
```

**关键点：**
- ✅ 从HTTP Host头自动识别租户
- ✅ 建立独立的数据库连接
- ✅ 连接信息存储在 `req.tenantDb` 中

---

### **2. 租户数据库服务 - 连接管理**

```typescript
// 文件：k.yyup.com/server/src/services/tenant-database.service.ts

export class TenantDatabaseService {
  private connections: Map<string, Sequelize> = new Map();
  private baseConfig: TenantDatabaseConfig;

  constructor() {
    this.baseConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      dialect: 'mysql',
      timezone: '+08:00',
      pool: {
        max: 10,
        min: 1,
        acquire: 30000,
        idle: 10000
      }
    };
  }

  /**
   * 获取租户数据库连接
   */
  async getTenantConnection(tenantCode: string): Promise<Sequelize> {
    const connectionKey = `tenant_${tenantCode}`;

    // 检查连接是否已存在
    if (this.connections.has(connectionKey)) {
      const connection = this.connections.get(connectionKey)!;
      
      // 验证连接是否有效
      try {
        await connection.authenticate();
        return connection;
      } catch (error) {
        logger.warn('租户数据库连接无效，重新创建', { tenantCode });
        this.connections.delete(connectionKey);
      }
    }

    // 创建新的数据库连接
    const connection = await this.createTenantConnection(tenantCode);
    this.connections.set(connectionKey, connection);
    return connection;
  }

  /**
   * 创建租户数据库连接
   */
  private async createTenantConnection(tenantCode: string): Promise<Sequelize> {
    const databaseName = `tenant_${tenantCode}`;

    const config = {
      ...this.baseConfig,
      database: databaseName,  // 关键：不同租户不同数据库
      logging: (msg: string) => {
        if (process.env.NODE_ENV === 'development') {
          logger.debug(`[${tenantCode}] ${msg}`);
        }
      }
    };

    const sequelize = new Sequelize(config);

    try {
      // 测试数据库连接
      await sequelize.authenticate();
      logger.info('租户数据库连接成功', { tenantCode, databaseName });
      return sequelize;
    } catch (error) {
      logger.error('租户数据库连接失败', { tenantCode, databaseName, error });
      throw new Error(`无法连接到租户数据库 ${databaseName}`);
    }
  }
}

// 全局实例
export const tenantDatabaseService = new TenantDatabaseService();
```

**关键点：**
- ✅ 连接池管理，避免重复创建
- ✅ 每个租户有独立的Sequelize实例
- ✅ 数据库名称与租户代码绑定

---

### **3. 统一认证中间件 - 登录处理**

```typescript
// 文件：k.yyup.com/server/src/middlewares/auth.middleware.ts

export const authenticateWithUnifiedAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { phone, password } = req.body;

    // 第1步：调用统一认证系统验证用户
    const authResult = await adminIntegrationService.authenticateUser(phone, password);
    // 调用：POST http://localhost:4001/api/auth/login
    // 返回：{ success: true, data: { user: {...}, token: "xxx" } }

    if (!authResult.success) {
      res.status(401).json({
        success: false,
        message: authResult.message || '手机号或密码错误',
        error: 'INVALID_CREDENTIALS'
      });
      return;
    }

    const { user: globalUser, token } = authResult.data;

    // 第2步：选择数据库连接
    // 关键：使用租户数据库，而不是默认数据库
    let sequelizeInstance: any = sequelize;  // 默认数据库
    if ((req as any).tenant && (req as any).tenantDb) {
      sequelizeInstance = (req as any).tenantDb;  // 使用租户数据库！
      console.log('[认证] 使用租户数据库:', (req as any).tenant.databaseName);
    }

    // 第3步：在租户数据库中查找用户
    const [userRows] = await sequelizeInstance.query(`
      SELECT u.id, u.username, u.email, u.real_name, u.phone, u.status, u.global_user_id
      FROM users u
      WHERE u.global_user_id = ? AND u.status = 'active'
      LIMIT 1
    `, {
      replacements: [globalUser.id]
    });

    let tenantUser: any;
    if (userRows.length > 0) {
      tenantUser = userRows[0];
      console.log('[认证] 找到现有租户用户:', tenantUser.id);
    } else {
      // 用户不存在，自动创建
      console.log('[认证] 创建新的租户用户:', globalUser.id);
      const [insertResult] = await sequelizeInstance.query(`
        INSERT INTO users (
          global_user_id, username, email, real_name, phone,
          auth_source, status, role, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 'unified', 'active', 'parent', NOW(), NOW())
      `, {
        replacements: [
          globalUser.id,
          globalUser.username || globalUser.phone,
          globalUser.email || '',
          globalUser.realName || '用户',
          globalUser.phone || ''
        ]
      });

      tenantUser = {
        id: insertResult.insertId,
        global_user_id: globalUser.id,
        username: globalUser.username || globalUser.phone,
        email: globalUser.email || '',
        real_name: globalUser.realName || '用户',
        phone: globalUser.phone || '',
        status: 'active',
        auth_source: 'unified'
      };
    }

    // 第4步：获取用户角色
    const [roleRows] = await sequelizeInstance.query(`
      SELECT r.code as role_code, r.name as role_name
      FROM user_roles ur
      INNER JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = ?
      LIMIT 1
    `, {
      replacements: [tenantUser.id]
    });

    const userRole = roleRows.length > 0 ? roleRows[0] : null;

    // 第5步：构建用户对象
    const userObject: any = {
      id: tenantUser.id,
      username: tenantUser.username,
      role: userRole?.role_code || 'parent',
      email: tenantUser.email || '',
      realName: tenantUser.real_name || '',
      phone: tenantUser.phone || '',
      status: tenantUser.status,
      globalUserId: tenantUser.global_user_id,
      authSource: 'unified'
    };

    // 添加租户信息
    if ((req as any).tenant) {
      userObject.tenantCode = (req as any).tenant.code;
      userObject.tenantDatabaseName = (req as any).tenant.databaseName;
    }

    req.user = userObject;

    // 第6步：返回登录响应
    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: userObject,
        tenantInfo: {
          tenantCode: (req as any).tenant?.code,
          tenantName: `租户${(req as any).tenant?.code}`
        }
      }
    });

  } catch (error) {
    console.error('[认证] 认证失败:', error);
    res.status(500).json({
      success: false,
      message: '认证失败',
      error: 'AUTHENTICATION_FAILED'
    });
  }
};
```

**关键点：**
- ✅ 统一认证系统验证全局用户
- ✅ 租户系统在租户数据库查询用户
- ✅ 自动创建租户用户（如果不存在）
- ✅ 用户对象包含租户信息

---

### **4. Token验证中间件 - 后续请求处理**

```typescript
// 文件：k.yyup.com/server/src/middlewares/auth.middleware.ts

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 第1步：获取token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: '缺少认证令牌',
        error: 'MISSING_TOKEN'
      });
      return;
    }

    const token = authHeader.substring(7);

    // 第2步：调用统一认证系统验证token
    const verifyResult = await adminIntegrationService.verifyToken(token);
    // 调用：POST http://localhost:4001/api/v1/auth/verify-token
    // 返回：{ success: true, data: { user: { id, phone, ... } } }

    if (!verifyResult.success) {
      res.status(401).json({
        success: false,
        message: verifyResult.message || '认证令牌无效',
        error: 'INVALID_TOKEN'
      });
      return;
    }

    const { user: globalUser } = verifyResult.data;

    // 第3步：选择数据库连接
    let sequelizeInstance: any = sequelize;
    if ((req as any).tenant && (req as any).tenantDb) {
      sequelizeInstance = (req as any).tenantDb;  // 使用租户数据库！
      console.log('[认证] 使用租户数据库:', (req as any).tenant.databaseName);
    }

    // 第4步：在租户数据库中查找用户
    const [userRows] = await sequelizeInstance.query(`
      SELECT u.id, u.username, u.email, u.real_name, u.phone, u.status, u.global_user_id
      FROM users u
      WHERE u.global_user_id = ? AND u.status = 'active'
      LIMIT 1
    `, {
      replacements: [globalUser.id]
    });

    if (userRows.length === 0) {
      res.status(401).json({
        success: false,
        message: '用户不存在',
        error: 'USER_NOT_FOUND'
      });
      return;
    }

    const tenantUser = userRows[0];

    // 第5步：获取用户角色
    const [roleRows] = await sequelizeInstance.query(`
      SELECT r.code as role_code, r.name as role_name
      FROM user_roles ur
      INNER JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = ?
      LIMIT 1
    `, {
      replacements: [tenantUser.id]
    });

    const userRole = roleRows.length > 0 ? roleRows[0] : null;

    // 第6步：构建用户对象
    const userObject: any = {
      id: tenantUser.id,
      username: tenantUser.username,
      role: userRole?.role_code || 'parent',
      email: tenantUser.email || '',
      realName: tenantUser.real_name || '',
      phone: tenantUser.phone || '',
      status: tenantUser.status,
      globalUserId: tenantUser.global_user_id,
      authSource: 'unified'
    };

    if ((req as any).tenant) {
      userObject.tenantCode = (req as any).tenant.code;
      userObject.tenantDatabaseName = (req as any).tenant.databaseName;
    }

    req.user = userObject;

    console.log('[认证] Token验证成功:', {
      userId: tenantUser.id,
      tenantCode: (req as any).tenant?.code
    });

    next();

  } catch (error) {
    console.error('[认证] Token验证失败:', error);
    res.status(401).json({
      success: false,
      message: '认证失败',
      error: 'AUTHENTICATION_FAILED'
    });
  }
};
```

**关键点：**
- ✅ Token在统一认证系统验证
- ✅ 用户数据在租户数据库查询
- ✅ 每个请求都重新识别租户

---

## 🔑 核心机制总结

### **1. 请求到达时**
```
HTTP请求 → 租户识别中间件 → 提取租户代码 → 建立数据库连接 → req.tenantDb
```

### **2. 登录时**
```
登录请求 → 统一认证验证 → 租户数据库查询 → 自动创建用户 → 返回token
```

### **3. 后续请求时**
```
API请求 → Token验证 → 租户数据库查询 → 执行业务逻辑 → 返回数据
```

### **4. 数据隔离保障**
```
域名 → 租户代码 → 数据库连接 → 数据库名称 → 物理隔离
```

---

## ✅ 验证流程

| 步骤 | 验证内容 | 位置 |
|------|--------|------|
| 1 | 域名识别 | tenantResolverMiddleware |
| 2 | 租户存在性 | validateTenant() |
| 3 | 数据库连接 | getTenantConnection() |
| 4 | 用户身份 | 统一认证系统 |
| 5 | 租户用户 | 租户数据库查询 |
| 6 | 用户权限 | 角色权限查询 |

---

## 🛡️ 安全保障

1. **域名隔离** - 不同租户不同域名
2. **数据库隔离** - 不同租户不同数据库
3. **连接隔离** - 每个租户独立连接
4. **Token隔离** - 统一认证系统签发和验证
5. **用户隔离** - 用户与租户绑定关系

---

## 📝 关键代码位置

| 功能 | 文件 | 行号 |
|------|------|------|
| 租户识别 | tenant-resolver.middleware.ts | 21-99 |
| 数据库连接 | tenant-database.service.ts | 66-120 |
| 登录处理 | auth.middleware.ts | 825-975 |
| Token验证 | auth.middleware.ts | 142-375 |

