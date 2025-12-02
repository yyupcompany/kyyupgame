# 登录流程代码级别详解

## 📍 关键代码位置

### 1️⃣ 前端登录页面
**文件**: `k.yyup.com/client/src/pages/Login/index.vue`

```typescript
// 用户点击登录按钮
const handleLogin = async () => {
  try {
    // 手机号登录 - 使用统一认证
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: loginForm.value.phone,        // 用户输入的手机号
        password: loginForm.value.password   // 用户输入的密码
      })
    });

    const data = await response.json();
    
    if (data.success) {
      // 保存 token 到 localStorage
      localStorage.setItem('kindergarten_token', data.data.token);
      localStorage.setItem('kindergarten_user_info', 
        JSON.stringify(data.data.user));
      
      // 跳转到首页
      router.push('/dashboard');
    }
  } catch (error) {
    console.error('登录失败:', error);
  }
};
```

---

### 2️⃣ 后端路由配置
**文件**: `k.yyup.com/server/src/routes/auth.routes.ts`

```typescript
// 登录路由
router.post('/api/auth/login', 
  tenantResolverMiddleware,           // 第1步: 租户识别
  authenticateWithUnifiedAuth,        // 第2步: 统一认证
  login                               // 第3步: 业务逻辑
);
```

---

### 3️⃣ 租户识别中间件
**文件**: `k.yyup.com/server/src/middlewares/tenant-resolver.middleware.ts`

```typescript
export const tenantResolverMiddleware = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    // 获取请求域名
    const domain = req.get('Host') || req.hostname;
    // 结果: "k.yyup.cc" 或 "k.yyup.cc:3000"
    
    // 提取租户代码
    const tenantCode = extractTenantCode(domain);
    // 使用正则: /^(k\d+)\.yyup\.cc$/
    // 结果: "k"
    
    // 验证租户存在
    const tenantInfo = await validateTenant(tenantCode);
    
    // 设置租户信息
    req.tenant = {
      code: tenantCode,                    // "k"
      domain: domain,                      // "k.yyup.cc"
      databaseName: `tenant_${tenantCode}` // "tenant_k"
    };
    
    // 获取共享数据库连接
    req.tenantDb = tenantDatabaseService.getGlobalConnection();
    
    logger.info('[租户识别] ✅ 租户识别成功', {
      tenantCode,
      databaseName: req.tenant.databaseName
    });
    
    next();
  } catch (error) {
    logger.error('[租户识别] 错误:', error);
    ApiResponse.error(res, '租户识别失败', 'TENANT_RESOLVER_ERROR');
  }
};

// 提取租户代码的函数
function extractTenantCode(domain: string): string | null {
  const cleanDomain = domain.split(':')[0]; // 移除端口号
  const match = cleanDomain.match(/^(k\d+)\.yyup\.cc$/);
  return match ? match[1] : null;
}
```

---

### 4️⃣ 认证中间件
**文件**: `k.yyup.com/server/src/middlewares/auth.middleware.ts`

```typescript
export const authenticateWithUnifiedAuth = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const { phone, password } = req.body;
    
    // 1. 调用统一认证中心验证
    const authResult = await adminIntegrationService.authenticateUser(
      phone, 
      password, 
      'web'
    );
    
    if (!authResult.success) {
      res.status(401).json({
        success: false,
        message: authResult.message || '手机号或密码错误',
        error: 'INVALID_CREDENTIALS'
      });
      return;
    }
    
    const { user: globalUser, token } = authResult.data;
    
    // 2. 在租户数据库查询用户
    const sequelizeInstance = req.tenantDb;
    const [userRows] = await sequelizeInstance.query(`
      SELECT u.id, u.username, u.email, u.real_name, u.phone, 
             u.status, u.global_user_id
      FROM users u
      WHERE u.global_user_id = ? AND u.status = 'active'
      LIMIT 1
    `, {
      replacements: [globalUser.id]
    });
    
    let tenantUser: any;
    if (userRows.length > 0) {
      tenantUser = userRows[0];
    } else {
      // 3. 自动创建租户用户
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
    
    // 4. 获取用户角色
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
    
    // 5. 构建用户对象
    const userObject: any = {
      id: tenantUser.id,
      username: tenantUser.username,
      role: userRole?.role_code || 'parent',
      email: tenantUser.email || '',
      realName: tenantUser.real_name || '',
      phone: tenantUser.phone || '',
      status: tenantUser.status,
      globalUserId: tenantUser.global_user_id,
      authSource: 'unified',
      tenantCode: req.tenant?.code,
      tenantDatabaseName: req.tenant?.databaseName
    };
    
    req.user = userObject;
    
    // 6. 返回登录响应
    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: userObject,
        tenantInfo: {
          tenantCode: req.tenant?.code,
          tenantName: `租户${req.tenant?.code}`
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

---

### 5️⃣ 统一认证中心集成
**文件**: `k.yyup.com/server/src/middlewares/auth.middleware.ts`

```typescript
const adminIntegrationService = {
  /**
   * 统一认证中心验证用户
   */
  authenticateUser: async (
    phone: string, 
    password: string, 
    clientType: string = 'web'
  ) => {
    try {
      // 调用统一认证中心 API
      const response = await axios.post(
        `${UNIFIED_TENANT_API_URL}/api/auth/login`,
        { phone, password },
        {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      return response.data;
      // 返回格式:
      // {
      //   success: true,
      //   data: {
      //     user: { id, phone, realName, email },
      //     token: "jwt_token_xxx"
      //   }
      // }
    } catch (error: any) {
      console.error('[认证] 认证失败:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || '认证失败'
      };
    }
  }
};

// 统一认证中心 API 地址
const UNIFIED_TENANT_API_URL = 
  process.env.UNIFIED_AUTH_CENTER_API_URL || 'http://localhost:4001';
```

---

## 🔄 数据流转

```
用户输入 (phone, password)
    ↓
前端 POST /api/auth/login
    ↓
后端接收请求
    ↓
tenantResolverMiddleware
  ├─ 提取域名: k.yyup.cc
  ├─ 提取租户代码: k
  └─ 建立数据库连接: tenant_k
    ↓
authenticateWithUnifiedAuth
  ├─ 调用 rent.yyup.cc:4001/api/auth/login
  ├─ 获取 globalUser + token
  ├─ 在 tenant_k 查询用户
  ├─ 创建用户 (如果不存在)
  ├─ 查询角色和权限
  └─ 构建用户对象
    ↓
返回登录响应
  ├─ token
  ├─ user (包含租户信息)
  └─ tenantInfo
    ↓
前端保存 token 到 localStorage
    ↓
前端跳转到 /dashboard
```

---

## 🔑 环境变量

```env
# k.yyup.com/server/.env

# 统一认证中心配置
UNIFIED_AUTH_CENTER_URL=http://rent.yyup.cc
UNIFIED_AUTH_CENTER_API_URL=http://localhost:4001
UNIFIED_AUTH_CENTER_API_KEY=your_api_key_here

# 租户配置
TENANT_CODE=k_tenant
TENANT_DOMAIN=k.yyup.cc

# 数据库配置
DB_HOST=dbconn.sealoshzh.site
DB_PORT=43906
DB_USER=root
DB_PASSWORD=pwk5ls7j
DB_NAME=kargerdensales
```

---

## 📊 数据库表结构

### 租户数据库 (tenant_k)

```sql
-- 用户表
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  global_user_id INT NOT NULL,      -- 统一认证中心的用户ID
  username VARCHAR(255),
  email VARCHAR(255),
  real_name VARCHAR(255),
  phone VARCHAR(20),
  auth_source VARCHAR(50),          -- 'unified' 表示统一认证
  status VARCHAR(50),               -- 'active', 'inactive'
  role VARCHAR(50),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- 用户角色关联表
CREATE TABLE user_roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  is_primary TINYINT(1),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- 角色表
CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50),                 -- 'admin', 'parent', 'teacher'
  name VARCHAR(255),
  status INT
);
```

---

## ✅ 关键检查点

1. **域名识别**: ✅ k.yyup.cc → 租户代码 k
2. **数据库连接**: ✅ 连接到 tenant_k
3. **统一认证**: ✅ 调用 rent.yyup.cc:4001
4. **用户同步**: ✅ 自动创建租户用户
5. **权限查询**: ✅ 获取用户角色
6. **Token 返回**: ✅ 前端保存
7. **页面跳转**: ✅ 跳转到 /dashboard

