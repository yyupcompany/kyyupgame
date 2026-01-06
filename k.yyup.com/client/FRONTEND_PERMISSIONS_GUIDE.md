# 前端权限使用指南

> 🎯 **简化设计理念**: 前端开发者不需要了解后端的4层权限架构，只需要使用简单的权限代码即可。

## 📋 核心概念

### 权限代码
前端只需要知道权限代码，例如：
- `EDIT_STUDENT` - 编辑学生权限
- `DELETE_TEACHER` - 删除教师权限  
- `ADMIN_ACCESS` - 管理员权限

### 权限验证方式
1. **Vue指令** - 用于模板中的元素显示/隐藏
2. **编程式调用** - 用于JavaScript逻辑中的权限检查

## 🔧 使用方法

### 1. Vue指令使用

```vue
<template>
  <!-- 单个权限验证 -->
  <el-button v-permission="'EDIT_STUDENT'">编辑学生</el-button>
  
  <!-- 多权限验证（有任意一个即可） -->
  <el-button v-permissions="['EDIT_STUDENT', 'VIEW_STUDENT']">学生管理</el-button>
  
  <!-- 禁用模式（无权限时禁用而非隐藏） -->
  <el-button v-permission:disable="'DELETE_STUDENT'">删除学生</el-button>
</template>
```

### 2. 编程式权限检查

```typescript
import { usePermissionsStore } from '@/stores/permissions-simple'

const permissionsStore = usePermissionsStore()

// 检查单个权限
const canEdit = await permissionsStore.hasPermission('EDIT_STUDENT')

// 批量检查权限
const permissions = await permissionsStore.hasPermissions([
  'EDIT_STUDENT', 
  'DELETE_STUDENT'
])

// 检查角色
const isAdmin = permissionsStore.hasRole('admin')

// 同步权限检查（基于缓存，用于指令）
const canEditSync = permissionsStore.hasPermissionSync('EDIT_STUDENT')
```

### 3. 权限初始化

```typescript
// 在应用启动时或路由守卫中
await permissionsStore.initializePermissions()
```

## 📚 常用权限代码

### 学生管理
- `EDIT_STUDENT` - 编辑学生信息
- `DELETE_STUDENT` - 删除学生
- `VIEW_STUDENT` - 查看学生详情
- `EXPORT_STUDENT` - 导出学生数据

### 教师管理  
- `EDIT_TEACHER` - 编辑教师信息
- `DELETE_TEACHER` - 删除教师
- `VIEW_TEACHER` - 查看教师详情
- `MANAGE_PERFORMANCE` - 管理教师绩效

### 班级管理
- `EDIT_CLASS` - 编辑班级信息
- `DELETE_CLASS` - 删除班级
- `VIEW_CLASS` - 查看班级详情
- `MANAGE_STUDENTS` - 管理班级学生

### 活动管理
- `EDIT_ACTIVITY` - 编辑活动
- `DELETE_ACTIVITY` - 删除活动
- `VIEW_ACTIVITY` - 查看活动详情
- `MANAGE_REGISTRATION` - 管理活动报名

### 系统管理
- `ADMIN_ACCESS` - 管理员权限
- `SYSTEM_CONFIG` - 系统配置
- `USER_MANAGEMENT` - 用户管理
- `BACKUP_DATA` - 数据备份
- `VIEW_LOGS` - 查看系统日志

## 🎯 最佳实践

### 1. 权限命名规范
- 使用动词+名词的格式：`EDIT_STUDENT`, `DELETE_TEACHER`
- 使用大写字母和下划线：`ADMIN_ACCESS`, `SYSTEM_CONFIG`
- 保持语义清晰：`VIEW_REPORT` 而不是 `REPORT`

### 2. 权限粒度控制
- **页面级权限**: 控制整个页面的访问
- **功能级权限**: 控制页面内的按钮和操作
- **数据级权限**: 控制特定数据的访问

### 3. 性能优化
```typescript
// ✅ 好的做法：批量检查权限
const permissions = await permissionsStore.hasPermissions([
  'EDIT_STUDENT', 'DELETE_STUDENT', 'VIEW_STUDENT'
])

// ❌ 避免的做法：多次单独检查
const canEdit = await permissionsStore.hasPermission('EDIT_STUDENT')
const canDelete = await permissionsStore.hasPermission('DELETE_STUDENT')
const canView = await permissionsStore.hasPermission('VIEW_STUDENT')
```

### 4. 错误处理
```typescript
try {
  const hasPermission = await permissionsStore.hasPermission('EDIT_STUDENT')
  if (hasPermission) {
    // 执行操作
  } else {
    ElMessage.warning('您没有编辑学生的权限')
  }
} catch (error) {
  ElMessage.error('权限检查失败')
}
```

## 🔧 指令修饰符

### .disable
无权限时禁用元素而不是隐藏：
```vue
<el-button v-permission:disable="'DELETE_STUDENT'">
  删除学生
</el-button>
```

### 默认行为
无权限时隐藏元素：
```vue
<el-button v-permission="'DELETE_STUDENT'">
  删除学生
</el-button>
```

## 🚀 迁移指南

如果你之前使用的是复杂的权限系统，迁移到简化版本：

### 旧的方式（复杂）
```typescript
// 需要了解Level 1, 2, 3, 4的概念
const pagePermissions = usePagePermissions('pageId', '/path')
await pagePermissions.loadPagePermissions()
const hasPermission = pagePermissions.hasPermission('EDIT_STUDENT')
```

### 新的方式（简化）
```typescript
// 只需要权限代码
const permissionsStore = usePermissionsStore()
const hasPermission = await permissionsStore.hasPermission('EDIT_STUDENT')
```

## 📝 注意事项

1. **权限代码**: 确保使用正确的权限代码，区分大小写
2. **异步调用**: 权限检查是异步的，需要使用 `await`
3. **缓存机制**: 权限结果会自动缓存5分钟，无需担心性能问题
4. **管理员权限**: 管理员自动拥有所有权限
5. **错误降级**: 权限检查失败时默认返回 `false`

## 🔍 调试技巧

在浏览器控制台中查看权限状态：
```javascript
// 查看当前用户角色
console.log('用户角色:', permissionsStore.userRoles)

// 查看是否为管理员
console.log('是否为管理员:', permissionsStore.isAdmin)

// 清除权限缓存
permissionsStore.clearPermissionCache()
```

这样，前端开发者就可以专注于业务逻辑，而不需要了解后端复杂的权限架构实现。