# 登录链路快速参考（k001.yyup.cc）

## 🎯 核心流程（30秒版本）

```
用户点击登录
    ↓
POST /api/auth/unified-login (手机号 + 密码)
    ↓
【后端】识别租户：k001.yyup.cc → tenant_k001
    ↓
【后端】调用统一认证中心验证手机号
    ↓
分支：
  ├─ 用户已绑定租户 
  │   ↓
  │   返回 { token, user, tenantInfo }
  │   ↓
  │   前端保存 token
  │   ↓
  │   根据角色跳转仪表板
  │
  └─ 用户未绑定租户
      ↓
      返回 { needsRegistration: true, availableRoles }
      ↓
      前端显示角色选择
      ↓
      选择后调用 /api/auth/bind-tenant
      ↓
      成功后再次登录
```

---

## 📍 7个关键节点

| # | 位置 | 作用 | 输入 | 输出 |
|----|-----|------|------|------|
| 1 | **Login.vue** | 表单提交 | 手机号+密码 | POST 请求 |
| 2 | **tenantResolverMiddleware** | 识别租户 | Host: k001.yyup.cc | tenant_code: k001 |
| 3 | **tenantSecurityMiddleware** | 安全检查 | 域名+租户代码 | 验证通过/失败 |
| 4 | **authenticateWithUnifiedAuth** | 分支判断 | domain | Demo系统/租户系统 |
| 5 | **adminIntegrationService** | 调用认证中心 | 手机号+密码 | globalUserId + token |
| 6 | **数据库查询** | 检查用户绑定 | globalUserId | 已绑定/未绑定 |
| 7 | **前端路由** | 跳转页面 | 用户角色 | 仪表板页面 |

---

## 🔑 3个关键判断

### 判断 1️⃣：是否 Demo 系统？
```javascript
isDemoSystem("k001.yyup.cc") {
  if (domain === "localhost")        return true   // Demo
  if (domain === "127.0.0.1")        return true   // Demo
  if (domain === "k.yyup.cc")        return true   // Demo
  if (domain === "k.yyup.com")       return true   // Demo
  
  return false  // ✅ k001.yyup.cc 不是 Demo，进入统一认证
}
```

**结果**: false → 使用统一认证

---

### 判断 2️⃣：手机号格式是否正确？
```javascript
/^1[3-9]\d{9}$/.test(phone)

✓ 正确: 13800138000, 15612341234
✗ 错误: 18800138000 (1后面只能是3-9)
✗ 错误: 1380013800 (10位，需11位)
```

**结果**: true → 继续认证

---

### 判断 3️⃣：用户是否已绑定租户？
```sql
SELECT * FROM tenant_k001.users 
WHERE global_user_id = ? AND status = 'active'

✓ 有结果 → 返回 { token, user } → 正常登录
✗ 无结果 → 返回 { needsRegistration: true } → 角色选择
```

**结果**: 取决于数据库状态

---

## 🗺️ 后端调用链

```
authenticateWithUnifiedAuth
│
├─ isDemoSystem(domain)? 
│  └─ false → 进入统一认证
│
├─ 验证手机号格式
│  └─ /^1[3-9]\d{9}$/
│
├─ adminIntegrationService.authenticateUser(phone, password)
│  │
│  └─ HTTP POST 到 统一认证中心
│     ← 返回 { globalUserId, token }
│
└─ sequelize.query(`SELECT FROM tenant_k001.users WHERE global_user_id = ?`)
   │
   ├─ 有用户 → returnSuccess(...)
   │
   └─ 无用户 → returnNeedsRegistration(...)
```

---

## 💾 数据流

### 请求数据
```json
{
  "phone": "13800138000",
  "password": "密码",
  "tenantCode": null  // 如果用户没输入
}
```

### 响应数据（正常登录）
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "id": 123,
      "username": "teacher001",
      "role": "teacher",
      "phone": "13800138000"
    },
    "tenantInfo": {
      "tenantCode": "k001",
      "tenantName": "某某幼儿园"
    },
    "isUnifiedAuth": true
  }
}
```

### 响应数据（需要注册）
```json
{
  "success": true,
  "message": "您尚未在本园所注册，请选择角色完成注册",
  "data": {
    "needsRegistration": true,
    "globalUserId": "user-123",
    "tenantCode": "k001",
    "availableRoles": ["principal", "teacher", "parent"],
    "token": "临时token用于后续绑定"
  }
}
```

---

## ⚠️ 可能的错误

| 错误 | 原因 | 返回 |
|------|------|------|
| 手机号格式不正确 | 不是 11 位或格式不符 | error: INVALID_PHONE |
| 手机号或密码错误 | 统一认证中心验证失败 | error: INVALID_CREDENTIALS |
| 租户不存在或未激活 | 租户识别失败 | error: TENANT_NOT_FOUND |
| 域名租户代码不匹配 | 安全检查失败 | error: DOMAIN_TENANT_MISMATCH |
| 用户不存在或已禁用 | 数据库中状态不是 active | error: USER_NOT_FOUND |

---

## 📄 相关文件

| 文件 | 功能 |
|-----|------|
| `client/src/pages/Login/index.vue` | 登录表单UI + 提交逻辑 |
| `client/src/store/modules/auth.ts` | 认证状态管理 + API调用 |
| `client/src/api/auth.ts` | API 请求定义 |
| `server/src/middlewares/tenant-resolver.middleware.ts` | 租户识别 |
| `server/src/middlewares/tenant-security.middleware.ts` | 租户安全检查 |
| `server/src/middlewares/auth.middleware.ts` | 认证逻辑（包含 isDemoSystem 和 authenticateWithUnifiedAuth） |

---

## 🎯 用户看到的流程

```
1️⃣  登录页面
     ↓ 输入手机号+密码
     
2️⃣  点击登录
     ↓ 显示加载圈
     
3️⃣a 已绑定用户
     ↓ 显示系统入场动画
     ↓ 
4️⃣a 跳转到仪表板
     
     OR
     
3️⃣b 未绑定用户
     ↓ 显示角色选择对话框
     ↓ 用户选择角色
     ↓ 关闭对话框
     ↓ 
4️⃣b 跳转到仪表板
```

---

## 🔄 环境差异

### localhost / 127.0.0.1
```
isDemoSystem() → true
└─ 使用本地 JWT 认证
└─ 使用 kargerdensales 数据库
└─ 支持用户名/手机号登录
```

### k.yyup.cc / k.yyup.com
```
isDemoSystem() → true
└─ 同上（Demo系统）
```

### k001.yyup.cc / k213.yyup.cc 等
```
isDemoSystem() → false
└─ 使用统一认证中心
└─ 必须提供手机号
└─ 可选提供租户代码
└─ 使用 tenant_k001 等数据库
```

---

## 📊 租户代码提取规则

```javascript
domain: "k001.yyup.cc"
       ↓
正则: /^(k\d+)\.yyup\.cc$/
       ↓
匹配: 是
       ↓
提取: k001 ← 这就是租户代码
       ↓
数据库名: tenant_k001
```

其他支持格式：
- `tenant1.kindergarten.com` → `tenant1`
- `k213.kyyup.com` → `k213`

---

## 🎓 学习路径

想了解更多细节？按这个顺序查看文件：

1. **前端入口**: `client/src/pages/Login/index.vue` - 整个UI流程
2. **状态管理**: `client/src/store/modules/auth.ts` - 数据如何保存
3. **后端识别**: `server/src/middlewares/tenant-resolver.middleware.ts` - 租户如何识别
4. **认证逻辑**: `server/src/middlewares/auth.middleware.ts` - 核心认证逻辑
5. **安全检查**: `server/src/middlewares/tenant-security.middleware.ts` - 安全保障

详细分析见：`LOGIN_FLOW_ANALYSIS_k001.md`

