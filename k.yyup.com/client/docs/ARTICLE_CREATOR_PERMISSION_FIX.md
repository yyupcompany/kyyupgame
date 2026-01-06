# 图文创作功能权限问题修复报告

## 📋 问题总结

### 问题描述
用户在新媒体中心的"图文创作"功能中点击"生成图文"按钮时，出现以下错误：

```
❌ 403 Forbidden
Error: 权限不足 (INSUFFICIENT_PERMISSION)
```

### 问题原因

1. **认证问题已修复** ✅
   - 原代码使用原生 `fetch` 调用AI API，没有包含认证token
   - 已修改为使用 `request` 工具，自动添加认证token

2. **权限问题** ❌ **当前问题**
   - 后端路由配置：`router.use('/ai', verifyToken, checkPermission('/ai'), newAiRoutes)`
   - `checkPermission('/ai')` 中间件要求用户必须有 `code = '/ai'` 的权限
   - 当前用户（principal/园长）没有被分配 `/ai` 权限

### 错误日志

```javascript
// 控制台错误
[ERROR] Failed to load resource: the server responded with a status of 403 (Forbidden)
[ERROR] AI Response error: AxiosError
[ERROR] Error details: {code: INSUFFICIENT_PERMISSION, message: 权限不足, detail: Object, statusCode: 403}
[ERROR] ❌ AI专家调用失败: AxiosError
[ERROR] ❌ 图文生成失败: AxiosError
[LOG] 🔄 回退到模拟内容生成...
```

---

## 🔧 已完成的修复

### 修复1: 认证Token问题

**文件**: `client/src/pages/principal/media-center/ArticleCreator.vue`

**修改前**:
```typescript
// 使用原生fetch，没有认证token
const response = await fetch('/api/ai/expert/smart-chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: messages
  })
})
```

**修改后**:
```typescript
// 导入request工具
import { request } from '@/utils/request'

// 使用request工具，自动添加认证token
const result = await request.post('/ai/expert/smart-chat', {
  messages: messages
})
```

**结果**: ✅ 认证token现在正确添加到请求头中

---

## 🚨 待解决的问题

### 权限配置问题

**问题**: 园长角色没有 `/ai` 路径的访问权限

**后端权限检查逻辑** (`server/src/middlewares/auth.middleware.ts`):
```typescript
export const checkPermission = (permissionCode: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 查询用户是否有指定权限
    const [permissionRows] = await sequelizeInstance.query(`
      SELECT COUNT(*) as count
      FROM role_permissions rp
      INNER JOIN permissions p ON rp.permission_id = p.id
      INNER JOIN user_roles ur ON rp.role_id = ur.role_id
      WHERE ur.user_id = ? AND p.code = ? AND p.status = 1
    `, {
      replacements: [req.user.id, permissionCode]  // permissionCode = '/ai'
    });

    hasPermission = (permissionRows[0] as any)?.count > 0;
    
    if (!hasPermission) {
      res.status(403).json({
        success: false,
        message: '权限不足'
      });
      return;
    }
  };
};
```

---

## 💡 解决方案

### 方案1: 数据库添加权限（推荐）

需要在数据库中执行以下操作：

#### 步骤1: 检查是否存在 `/ai` 权限
```sql
SELECT * FROM permissions WHERE code = '/ai' AND status = 1;
```

#### 步骤2: 如果不存在，创建权限
```sql
INSERT INTO permissions (name, chinese_name, code, type, path, status, sort, created_at, updated_at)
VALUES ('AI Center', 'AI中心', '/ai', 'menu', '/centers/ai', 1, 100, NOW(), NOW());
```

#### 步骤3: 获取权限ID和园长角色ID
```sql
-- 获取权限ID
SELECT id FROM permissions WHERE code = '/ai';

-- 获取园长角色ID
SELECT id FROM roles WHERE code = 'principal' OR name LIKE '%园长%';
```

#### 步骤4: 为园长角色分配权限
```sql
-- 假设权限ID为123，园长角色ID为2
INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
VALUES (2, 123, NOW(), NOW());
```

### 方案2: 临时移除权限检查（不推荐）

**文件**: `server/src/routes/index.ts`

**修改前**:
```typescript
router.use('/ai', verifyToken, checkPermission('/ai'), newAiRoutes);
```

**修改后**:
```typescript
// 临时移除权限检查，只保留认证
router.use('/ai', verifyToken, newAiRoutes);
```

**注意**: 此方案会降低安全性，不推荐用于生产环境

---

## 📊 权限系统架构

### 数据库表关系

```
users (用户表)
  ↓
user_roles (用户角色关联表)
  ↓
roles (角色表)
  ↓
role_permissions (角色权限关联表)
  ↓
permissions (权限表)
```

### 权限检查流程

1. 用户发起请求 → 携带JWT token
2. `verifyToken` 中间件 → 验证token，解析用户信息
3. `checkPermission('/ai')` 中间件 → 查询数据库
   - 查询用户的角色
   - 查询角色的权限
   - 检查是否有 `code = '/ai'` 的权限
4. 如果有权限 → 继续处理请求
5. 如果没有权限 → 返回403错误

---

## 🎯 推荐操作步骤

### 立即执行（推荐方案1）

1. **检查数据库中的权限配置**
   ```bash
   # 连接到MySQL数据库
   mysql -u root -p kindergarten_db
   
   # 查询权限
   SELECT * FROM permissions WHERE code = '/ai' OR path LIKE '%/ai%';
   
   # 查询园长角色
   SELECT * FROM roles WHERE code = 'principal';
   
   # 查询园长的所有权限
   SELECT p.* FROM permissions p
   INNER JOIN role_permissions rp ON p.id = rp.permission_id
   INNER JOIN roles r ON rp.role_id = r.id
   WHERE r.code = 'principal';
   ```

2. **如果没有 `/ai` 权限，创建并分配**
   - 执行上述SQL语句创建权限
   - 为园长角色分配权限

3. **重新测试图文创作功能**
   - 刷新页面
   - 填写表单
   - 点击"生成图文"
   - 验证是否成功

---

## 📝 测试验证

### 测试步骤

1. ✅ 登录为园长账号
2. ✅ 进入新媒体中心
3. ✅ 点击"图文创作"标签
4. ✅ 填写表单：
   - 发布平台：微信公众号
   - 内容类型：招生宣传
   - 文章标题：春季招生火热进行中
   - 核心内容：介绍幼儿园的优质教育资源、师资力量、课程特色和招生优惠政策
5. ✅ 点击"生成图文"按钮
6. ❌ **当前结果**: 403权限不足错误
7. ⏳ **期望结果**: 成功调用AI生成图文内容

### 验证权限修复

执行权限修复后，应该看到：
- ✅ 控制台显示：`AI请求头中的认证token: eyJhbGciOiJIUzI1NiIs...`
- ✅ 控制台显示：`发送AI请求: POST /ai/expert/smart-chat`
- ✅ 控制台显示：`✅ AI专家响应: {...}`
- ✅ 页面显示：生成的图文内容
- ❌ 不应该出现：403错误或权限不足提示

---

## 🔍 调试信息

### 当前用户信息
- 用户名: principal
- 角色: 园长 (principal)
- 认证状态: ✅ 已认证（token有效）
- 权限状态: ❌ 缺少 `/ai` 权限

### API调用信息
- 端点: `POST /api/ai/expert/smart-chat`
- 认证: ✅ Bearer Token已添加
- 权限检查: ❌ 失败（403 Forbidden）

### 错误详情
```json
{
  "code": "INSUFFICIENT_PERMISSION",
  "message": "权限不足",
  "statusCode": 403,
  "detail": {
    "requiredPermission": "/ai",
    "userId": 1,
    "username": "principal"
  }
}
```

---

## 📚 相关文件

### 前端文件
- `client/src/pages/principal/media-center/ArticleCreator.vue` - 图文创作组件（已修复认证）
- `client/src/utils/request.ts` - HTTP请求工具（自动添加token）

### 后端文件
- `server/src/routes/index.ts` - 主路由配置（包含权限检查）
- `server/src/routes/ai/index.ts` - AI路由配置
- `server/src/routes/ai/smart-expert.routes.ts` - 智能专家路由
- `server/src/middlewares/auth.middleware.ts` - 认证和权限中间件

### 数据库表
- `permissions` - 权限表
- `roles` - 角色表
- `role_permissions` - 角色权限关联表
- `user_roles` - 用户角色关联表

---

## ✅ 总结

### 已修复
1. ✅ 认证token问题 - 使用request工具自动添加token

### 待修复
1. ❌ 权限配置问题 - 需要为园长角色添加 `/ai` 权限

### 推荐操作
1. 执行SQL语句为园长角色添加 `/ai` 权限
2. 重新测试图文创作功能
3. 验证AI调用成功

---

**最后更新**: 当前会话  
**状态**: 认证问题已修复，权限问题待解决  
**优先级**: 高 - 影响核心功能使用

