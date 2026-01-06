# 后端路由管理规范

## 🎯 目标
建立统一的路由命名、注册和文件组织规范，防止重复和混乱，提高代码可维护性。

## 📁 文件组织规范

### 1. 路由文件命名规范
```
✅ 正确命名：
- users.routes.ts          (复数形式，主要CRUD操作)
- auth.routes.ts           (功能模块名)
- dashboard.routes.ts      (单一功能)

❌ 错误命名：
- user.routes.ts           (避免单数形式)
- users-management.routes.ts (避免过长描述)
- userRoutes.ts            (避免驼峰命名)
```

### 2. 目录结构规范
```
src/routes/
├── index.ts                 # 主路由注册文件
├── auth/                    # 认证相关路由组
│   ├── index.ts
│   ├── login.routes.ts
│   └── permissions.routes.ts
├── system/                  # 系统管理路由组
│   ├── index.ts
│   ├── users.routes.ts
│   ├── roles.routes.ts
│   └── permissions.routes.ts
├── business/                # 业务功能路由组
│   ├── enrollment/
│   ├── activities/
│   └── statistics/
└── shared/                  # 共享路由
    ├── files.routes.ts
    └── notifications.routes.ts
```

## 🛣️ 路由注册规范

### 1. 路径命名规范
```typescript
// ✅ 正确的路径命名
router.use('/users', usersRoutes);           // 复数资源
router.use('/auth', authRoutes);             // 功能模块
router.use('/dashboard', dashboardRoutes);   // 单一功能

// ❌ 错误的路径命名
router.use('/user', userRoutes);             // 避免单数
router.use('/user-management', userRoutes);  // 避免过长
router.use('/api/users', usersRoutes);       // 避免重复前缀
```

### 2. 路由注册顺序
```typescript
// 按以下顺序注册路由：
// 1. 认证相关
router.use('/auth', authRoutes);

// 2. 系统管理
router.use('/users', usersRoutes);
router.use('/roles', rolesRoutes);

// 3. 核心业务
router.use('/enrollment', enrollmentRoutes);
router.use('/activities', activitiesRoutes);

// 4. 统计报表
router.use('/statistics', statisticsRoutes);

// 5. 工具功能
router.use('/files', filesRoutes);
```

### 3. 禁止重复注册
```typescript
// ❌ 禁止同一路径多次注册
router.use('/statistics', statisticsRoutes);
router.use('/statistics', unifiedStatisticsRoutes);  // 错误！

// ✅ 正确做法：合并到一个路由文件
router.use('/statistics', mergedStatisticsRoutes);
```

## 🔧 RESTful API 规范

### 1. HTTP 方法使用
```typescript
// 标准CRUD操作
router.get('/users', getUsers);           // 获取列表
router.get('/users/:id', getUserById);   // 获取单个
router.post('/users', createUser);       // 创建
router.put('/users/:id', updateUser);    // 更新
router.delete('/users/:id', deleteUser); // 删除
```

### 2. 路径参数规范
```typescript
// ✅ 正确的参数命名
router.get('/users/:id/roles', getUserRoles);
router.post('/users/:userId/roles/:roleId', assignRole);

// ❌ 错误的参数命名
router.get('/users/:user_id/roles', getUserRoles);  // 避免下划线
router.get('/users/:ID/roles', getUserRoles);       // 避免大写
```

### 3. 查询参数规范
```typescript
// 标准查询参数
interface QueryParams {
  page?: number;        // 页码
  pageSize?: number;    // 每页数量
  sort?: string;        // 排序字段
  order?: 'asc' | 'desc'; // 排序方向
  search?: string;      // 搜索关键词
  filter?: string;      // 过滤条件
}
```

## 📝 代码组织规范

### 1. 路由文件结构
```typescript
// users.routes.ts
import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';
import { validateUser } from '../middlewares/validation.middleware';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// 路由定义（按HTTP方法顺序）
router.get('/', requireAuth, UsersController.getUsers);
router.get('/:id', requireAuth, UsersController.getUserById);
router.post('/', requireAuth, validateUser, UsersController.createUser);
router.put('/:id', requireAuth, validateUser, UsersController.updateUser);
router.delete('/:id', requireAuth, UsersController.deleteUser);

export default router;
```

### 2. 控制器命名规范
```typescript
// ✅ 正确的控制器方法命名
class UsersController {
  static async getUsers(req, res) {}      // 获取列表
  static async getUserById(req, res) {}   // 获取单个
  static async createUser(req, res) {}    // 创建
  static async updateUser(req, res) {}    // 更新
  static async deleteUser(req, res) {}    // 删除
}
```

## 🚫 禁止事项

### 1. 禁止的路由模式
```typescript
// ❌ 禁止重复路径
router.use('/users', usersRoutes);
router.use('/users', userManagementRoutes);

// ❌ 禁止过度嵌套
router.use('/api/v1/system/user/management', userRoutes);

// ❌ 禁止不一致的命名
router.use('/user', userRoutes);      // 单数
router.use('/teachers', teacherRoutes); // 复数
```

### 2. 禁止的文件命名
```typescript
// ❌ 禁止的文件名
user.routes.ts              // 单数形式
users-management.routes.ts  // 过长描述
userRoutes.ts              // 驼峰命名
users.route.ts             // 错误后缀
```

## ✅ 检查清单

在创建或修改路由时，请检查：

- [ ] 文件命名符合规范（复数形式，kebab-case）
- [ ] 路径命名符合RESTful规范
- [ ] 没有重复的路由注册
- [ ] HTTP方法使用正确
- [ ] 参数命名一致（camelCase）
- [ ] 包含必要的中间件（认证、验证等）
- [ ] 控制器方法命名规范
- [ ] 添加了适当的注释和文档

## 🔄 迁移指南

对于现有的不规范路由：

1. **识别重复**：使用工具扫描重复的路由注册
2. **合并路由**：将功能相似的路由合并到一个文件
3. **重命名文件**：按照新规范重命名路由文件
4. **更新注册**：在主路由文件中更新注册逻辑
5. **测试验证**：确保所有API端点正常工作
