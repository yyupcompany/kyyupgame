# 登录流程重新设计分析报告

## 📋 用户需求总结

### 1. k.yyup.cc (Demo 演示系统)
| 特性 | 要求 |
|------|------|
| **认证方式** | ❌ 不走统一认证，使用本地校验 |
| **数据库** | kardersales (模版数据库) |
| **用途** | 演示系统，用于展示功能 |
| **用户** | 不能用于真实登录 |

### 2. k001.yyup.cc 等子域名 (租户系统)
| 特性 | 要求 |
|------|------|
| **认证方式** | ✅ 走统一认证登录 (rent.yyup.cc) |
| **数据库** | tenant_k001 等租户专属数据库 |
| **用户类型** | 园长、老师、家长 |
| **域名分配** | 由统一租户管理员开通时分配 |
| **OSS** | 每个租户有独立的子OSS |

### 3. 子域名登录流程 (k001.yyup.cc)
```
用户输入手机号+密码
    ↓
调用统一认证中心验证 (rent.yyup.cc)
    ↓
查询该租户是否有此用户
    ↓
├── 用户存在 → 直接登录
│   ├── 已认证 → 显示完整数据
│   └── 未认证 → 显示0数据（只能看功能列表）
│
└── 用户不存在 → 弹出注册交互
    ↓
    选择角色：园长/老师/家长
    ↓
    短信验证注册
    ↓
    注册成功 → 等待租户管理员审核
    ↓
    登录后显示0数据（无权限）
```

---

## 🔍 当前代码问题分析

### 问题1：租户识别逻辑错误

**当前代码** (`tenant-resolver.middleware.ts`):
```typescript
// 正则匹配: k001.yyup.cc -> k001
const match = cleanDomain.match(/^(k\d+)\.yyup\.cc$/);
```

**问题**: 
- ❌ `k.yyup.cc` 无法匹配 (因为正则要求 `k\d+`)
- ❌ 开发环境会使用默认配置，而不是正确区分Demo和租户

**应该**:
- ✅ `k.yyup.cc` → Demo系统，本地验证，使用 kardersales
- ✅ `k001.yyup.cc` → 租户系统，统一认证，使用 tenant_k001

---

### 问题2：登录逻辑统一使用统一认证

**当前代码** (`auth.middleware.ts`):
```typescript
export const authenticateWithUnifiedAuth = async (req, res, next) => {
  // 所有登录都调用统一认证中心
  const authResult = await adminIntegrationService.authenticateUser(phone, password);
  // ...
}
```

**问题**:
- ❌ k.yyup.cc 也在调用统一认证
- ❌ 没有区分 Demo 系统和租户系统

**应该**:
- ✅ k.yyup.cc → 本地验证 (kardersales 数据库)
- ✅ k001.yyup.cc → 统一认证 (rent.yyup.cc)

---

### 问题3：用户不存在时直接创建

**当前代码** (`auth.middleware.ts`):
```typescript
if (!tenantUser) {
  // 自动创建租户内用户
  tenantUser = await createTenantUser(globalUser.id, phone, ...);
}
```

**问题**:
- ❌ 自动创建用户，没有让用户选择角色
- ❌ 没有短信验证注册流程
- ❌ 没有前端交互提示

**应该**:
- ✅ 用户不存在时返回特定状态码
- ✅ 前端弹出注册弹窗
- ✅ 用户选择角色 (园长/老师/家长)
- ✅ 发送短信验证码注册
- ✅ 注册后状态为"待审核"

---

### 问题4：没有用户认证状态检查

**当前代码**: 
- ❌ 没有检查用户是否被租户管理员认证通过
- ❌ 登录后直接显示所有数据

**应该**:
- ✅ 检查用户的 `approval_status` 字段
- ✅ 未认证用户 → 显示空数据
- ✅ 已认证用户 → 显示完整数据

---

## 📊 现有代码中找到的相关实现

### ✅ 已有的注册功能
- **位置**: `k.yyup.com/server/src/controllers/auth-register.controller.ts`
- **功能**: 
  - 支持角色选择 (园长/老师/家长)
  - 调用统一租户API注册
  - 教师注册会创建审核申请

### ✅ 已有的短信验证
- **位置**: `k.yyup.com/server/VERIFICATION_CODE_LOGIN_IMPLEMENTATION_REPORT.md`
- **状态**: 模拟实现，需要接入真实短信服务

### ✅ 已有的教师审核系统
- **位置**: `TeacherApprovalService`
- **功能**: 教师注册后需要园长审核

### ⚠️ 缺失的功能
- 家长审核系统
- 园长审核系统
- 用户不存在时的前端交互
- 未审核用户的数据隔离

---

## 🔑 关键代码位置

| 功能 | 文件位置 |
|------|---------|
| 租户识别 | `k.yyup.com/server/src/middlewares/tenant-resolver.middleware.ts` |
| 登录认证 | `k.yyup.com/server/src/middlewares/auth.middleware.ts` |
| 用户注册 | `k.yyup.com/server/src/controllers/auth-register.controller.ts` |
| 前端登录 | `k.yyup.com/client/src/pages/Login/index.vue` |
| 前端注册 | `k.yyup.com/client/src/pages/Register.vue` |
| 统一认证服务 | `unified-tenant-system/server/src/services/unified-auth.service.ts` |

---

## 🎯 新的登录流程架构设计

### 架构概述

```
                     用户访问
                        │
                        ▼
                ┌───────────────┐
                │  域名识别     │
                └───────┬───────┘
                        │
          ┌─────────────┴─────────────┐
          │                           │
          ▼                           ▼
    ┌───────────────┐         ┌───────────────┐
    │ k.yyup.cc     │         │ k001.yyup.cc  │
    │ (Demo系统)    │         │ (租户系统)    │
    └───────┬───────┘         └───────┬───────┘
            │                         │
            ▼                         ▼
    ┌───────────────┐         ┌───────────────┐
    │ 本地认证       │         │ 统一认证      │
    │ kardersales   │         │ rent.yyup.cc  │
    └───────┬───────┘         └───────┬───────┘
            │                         │
            ▼                         ▼
    ┌───────────────┐         ┌───────────────┐
    │ 演示数据展示   │         │ 用户存在检查  │
    └───────────────┘         └───────┬───────┘
                                      │
                        ┌─────────────┴─────────────┐
                        │                           │
                        ▼                           ▼
                  ┌───────────┐             ┌───────────┐
                  │ 用户存在   │             │ 用户不存在 │
                  └─────┬─────┘             └─────┬─────┘
                        │                         │
                        ▼                         ▼
                  ┌───────────┐             ┌───────────┐
                  │ 检查审核   │             │ 注册流程   │
                  │ 状态       │             │ (选择角色) │
                  └─────┬─────┘             └─────┬─────┘
                        │                         │
              ┌─────────┴─────────┐               ▼
              │                   │         ┌───────────┐
              ▼                   ▼         │ 短信验证   │
        ┌───────────┐       ┌───────────┐   │ 注册      │
        │ 已审核     │       │ 未审核     │   └─────┬─────┘
        │ 完整数据   │       │ 0数据     │         │
        └───────────┘       └───────────┘         ▼
                                            ┌───────────┐
                                            │ 待审核状态 │
                                            │ 0数据     │
                                            └───────────┘
```

---

### Demo系统流程 (k.yyup.cc)

```
1. 用户访问 k.yyup.cc
2. 域名识别：isDemoSystem = true
3. 本地认证（不调用统一认证中心）
4. 使用数据库：kardersales
5. 支持演示账号：admin/principal/teacher/parent
6. 显示演示数据
```

**特点**：
- ❌ 不调用 rent.yyup.cc
- ✅ 本地用户名+密码验证
- ✅ 使用模版数据库
- ✅ 用于功能演示

---

### 租户系统流程 (k001.yyup.cc)

```
1. 用户访问 k001.yyup.cc
2. 域名识别：提取租户代码 k001
3. 用户输入手机号+密码
4. 调用统一认证中心验证 (rent.yyup.cc)
5. 认证成功后，查询租户用户表 (tenant_k001.users)
6. 检查用户是否存在
7. 如果存在：检查审核状态
   - 已审核 → 显示完整数据
   - 未审核 → 显示0数据
8. 如果不存在：触发注册流程
```

---

### 注册流程 (用户不存在时)

```
1. 后端返回：{ needsRegistration: true, globalUserId: xxx }
2. 前端弹出注册弹窗
3. 用户选择角色：园长/老师/家长
4. 用户输入姓名等信息
5. 发送短信验证码
6. 用户验证码验证
7. 创建用户（状态：待审核）
8. 通知租户管理员有新用户待审核
9. 用户可以登录，但显示0数据
```

---

## 📝 实现规划

### 阶段1：后端修改

#### 1.1 修改租户识别中间件 (`tenant-resolver.middleware.ts`)

**文件**: `k.yyup.com/server/src/middlewares/tenant-resolver.middleware.ts`

**修改内容**:
```typescript
// 新增：识别Demo系统
function extractTenantInfo(domain: string): {
  tenantCode: string | null;
  isDemoSystem: boolean;
  databaseName: string;
} {
  const cleanDomain = domain.split(':')[0];

  // 1. 检查是否是Demo系统 (k.yyup.cc)
  if (cleanDomain === 'k.yyup.cc') {
    return {
      tenantCode: null,
      isDemoSystem: true,
      databaseName: 'kardersales'  // 模版数据库
    };
  }

  // 2. 检查是否是租户子域名 (k001.yyup.cc)
  const match = cleanDomain.match(/^(k\d+)\.yyup\.cc$/);
  if (match) {
    return {
      tenantCode: match[1],
      isDemoSystem: false,
      databaseName: `tenant_${match[1]}`
    };
  }

  // 3. 其他情况
  return {
    tenantCode: null,
    isDemoSystem: false,
    databaseName: ''
  };
}
```

**新增请求属性**:
```typescript
interface RequestWithTenant extends Request {
  tenant?: {
    code: string | null;
    domain: string;
    databaseName: string;
    isDemoSystem: boolean;  // 新增
  };
  tenantDb?: any;
}
```

---

#### 1.2 修改认证中间件 (`auth.middleware.ts`)

**文件**: `k.yyup.com/server/src/middlewares/auth.middleware.ts`

**修改内容**:

**A. 新增Demo系统本地认证函数**:
```typescript
export const authenticateLocalDemo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { username, password } = req.body;

  // 使用kardersales数据库进行本地验证
  const user = await User.findOne({
    where: {
      [Op.or]: [
        { username },
        { phone: username }
      ]
    }
  });

  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({
      success: false,
      message: '用户名或密码错误',
      error: 'INVALID_CREDENTIALS'
    });
  }

  // 生成本地token
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);

  res.json({
    success: true,
    data: { token, user: formatUserResponse(user) }
  });
};
```

**B. 修改统一认证函数，处理用户不存在情况**:
```typescript
export const authenticateWithUnifiedAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // ... 现有验证逻辑 ...

  // 在租户中查找用户
  let tenantUser = await findTenantUserByGlobalId(globalUser.id);

  if (!tenantUser) {
    // ❌ 不再自动创建用户
    // ✅ 返回需要注册的状态
    return res.json({
      success: true,
      message: '用户未在此租户注册',
      data: {
        needsRegistration: true,
        globalUserId: globalUser.id,
        phone: phone,
        tenantCode: tenantCode,
        availableRoles: ['principal', 'teacher', 'parent']
      }
    });
  }

  // 检查用户审核状态
  const approvalStatus = await checkUserApprovalStatus(tenantUser);

  res.json({
    success: true,
    data: {
      token,
      user: formatUserResponse(tenantUser),
      approvalStatus: approvalStatus,  // 新增
      hasFullAccess: approvalStatus === 'approved'  // 新增
    }
  });
};
```

---

#### 1.3 新增用户审核状态检查函数

**文件**: `k.yyup.com/server/src/services/user-approval.service.ts` (新建)

```typescript
export class UserApprovalService {
  /**
   * 检查用户审核状态
   */
  static async checkUserApprovalStatus(user: User): Promise<{
    status: 'approved' | 'pending' | 'rejected';
    hasFullAccess: boolean;
    reason?: string;
  }> {
    // 管理员和园长默认已审核
    if (['admin', 'principal'].includes(user.role)) {
      return { status: 'approved', hasFullAccess: true };
    }

    // 教师检查TeacherApproval表
    if (user.role === 'teacher') {
      const approval = await TeacherApproval.findOne({
        where: {
          teacherId: user.id,
          status: TeacherApprovalStatus.APPROVED
        }
      });

      if (approval) {
        return { status: 'approved', hasFullAccess: true };
      }
      return {
        status: 'pending',
        hasFullAccess: false,
        reason: '等待园长审核您的教师资格'
      };
    }

    // 家长检查ParentApproval表（需要新建）
    if (user.role === 'parent') {
      // TODO: 实现家长审核逻辑
      return { status: 'pending', hasFullAccess: false };
    }

    return { status: 'pending', hasFullAccess: false };
  }
}
```

---

### 阶段2：前端修改

#### 2.1 修改登录页面 (`Login/index.vue`)

**文件**: `k.yyup.com/client/src/pages/Login/index.vue`

**新增功能**:

**A. 处理"需要注册"响应**:
```typescript
const handleLoginResponse = async (response) => {
  if (response.data.needsRegistration) {
    // 显示注册弹窗
    showRegistrationModal.value = true;
    registrationData.value = {
      globalUserId: response.data.globalUserId,
      phone: response.data.phone,
      tenantCode: response.data.tenantCode,
      availableRoles: response.data.availableRoles
    };
    return;
  }

  // 正常登录流程
  // ...
};
```

**B. 新增注册弹窗组件**:
```vue
<el-dialog v-model="showRegistrationModal" title="完成注册">
  <div class="registration-prompt">
    <p>您的手机号已在统一认证中心注册，但尚未在此幼儿园注册。</p>
    <p>请选择您的身份完成注册：</p>

    <div class="role-selection">
      <el-radio-group v-model="selectedRole">
        <el-radio label="principal">👨‍💼 园长</el-radio>
        <el-radio label="teacher">👩‍🏫 教师</el-radio>
        <el-radio label="parent">👨‍👩‍👧 家长</el-radio>
      </el-radio-group>
    </div>

    <el-button @click="proceedToRegistration">
      继续注册
    </el-button>
  </div>
</el-dialog>
```

**C. 处理审核状态**:
```typescript
const handleApprovalStatus = (approvalStatus) => {
  if (!approvalStatus.hasFullAccess) {
    // 存储审核状态到store
    userStore.setApprovalStatus(approvalStatus);

    // 显示提示
    ElMessage.warning(approvalStatus.reason || '您的账户正在审核中，部分功能暂时不可用');
  }
};
```

---

#### 2.2 修改数据展示组件

**全局数据过滤**:
```typescript
// 在需要显示数据的组件中
const filteredData = computed(() => {
  if (!userStore.hasFullAccess) {
    return []; // 返回空数据
  }
  return originalData.value;
});
```

**显示提示信息**:
```vue
<template>
  <div v-if="!userStore.hasFullAccess" class="pending-approval-notice">
    <el-alert type="warning" :closable="false">
      <template #title>
        <span>⏳ 账户审核中</span>
      </template>
      <template #default>
        您的账户正在等待管理员审核，审核通过后即可查看完整数据。
      </template>
    </el-alert>
  </div>

  <div v-else>
    <!-- 正常数据展示 -->
  </div>
</template>
```

---

### 阶段3：数据库修改

#### 3.1 新增家长审核表 (可选)

```sql
CREATE TABLE parent_approvals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  child_id INT NOT NULL,
  kindergarten_id INT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  approved_at DATETIME,
  approved_by INT,
  reject_reason VARCHAR(500),
  FOREIGN KEY (parent_id) REFERENCES users(id),
  FOREIGN KEY (child_id) REFERENCES children(id),
  FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id)
);
```

---

### 阶段4：路由配置

#### 4.1 修改登录路由

**文件**: `k.yyup.com/server/src/routes/auth.routes.ts`

```typescript
// Demo系统登录路由
router.post('/login/demo', authenticateLocalDemo);

// 租户系统登录路由
router.post('/login/tenant', authenticateWithUnifiedAuth);

// 或者使用中间件自动判断
router.post('/login', (req, res, next) => {
  if (req.tenant?.isDemoSystem) {
    return authenticateLocalDemo(req, res, next);
  }
  return authenticateWithUnifiedAuth(req, res, next);
});
```

---

## 📊 实现优先级

| 优先级 | 任务 | 预估工时 |
|--------|------|---------|
| P0 | 修改tenant-resolver识别Demo系统 | 2h |
| P0 | 新增本地认证函数 | 2h |
| P0 | 修改统一认证返回"需要注册"状态 | 2h |
| P1 | 前端处理"需要注册"响应 | 4h |
| P1 | 前端注册弹窗组件 | 3h |
| P2 | 用户审核状态检查服务 | 3h |
| P2 | 前端数据过滤和提示 | 4h |
| P3 | 家长审核表和服务 | 4h |

**总预估工时**: 24小时

---

## ✅ 验收标准

1. **Demo系统 (k.yyup.cc)**
   - [ ] 使用本地认证，不调用统一认证中心
   - [ ] 使用kardersales数据库
   - [ ] 支持演示账号登录

2. **租户系统 (k001.yyup.cc)**
   - [ ] 使用统一认证中心验证
   - [ ] 用户不存在时返回"需要注册"状态
   - [ ] 前端显示角色选择弹窗
   - [ ] 注册后状态为"待审核"
   - [ ] 未审核用户显示0数据

3. **审核流程**
   - [ ] 教师注册后等待园长审核
   - [ ] 家长注册后等待管理员审核
   - [ ] 审核通过后显示完整数据

