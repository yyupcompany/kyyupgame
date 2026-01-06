# 教师角色侧边栏菜单显示修复

## 问题描述

教师角色登录后，侧边栏菜单为空或显示不正确，无法看到应该分配的菜单内容。

## 根本原因

后端 `auth-permissions.controller.ts` 中的菜单过滤逻辑有问题：

**原始逻辑**：
```typescript
if (userRoleCode === 'teacher') {
  // 教师：只显示TEACHER_开头的权限
  whereCondition.code = { [Op.like]: 'TEACHER_%' };
}
```

**问题**：
- 教师角色被分配了29个权限，包括各种中心权限（如 `BUSINESS_CENTER`、`TEACHING_CENTER` 等）
- 但这些权限中只有2个是 `TEACHER_` 开头的
- 过滤逻辑导致其他27个权限被过滤掉，菜单为空

## 修复方案

修改 `server/src/controllers/auth-permissions.controller.ts` 中的过滤逻辑：

**修复后的逻辑**：
```typescript
if (userRoleCode === 'parent') {
  // 家长：排除TEACHER_开头的权限
  whereCondition.code = { [Op.notLike]: 'TEACHER_%' };
} else if (userRoleCode === 'teacher') {
  // 教师：排除PARENT_开头的权限
  whereCondition.code = { [Op.notLike]: 'PARENT_%' };
} else {
  // Admin/园长：排除TEACHER_和PARENT_开头的权限
  whereCondition.code = {
    [Op.and]: [
      { [Op.notLike]: 'TEACHER_%' },
      { [Op.notLike]: 'PARENT_%' }
    ]
  };
}
```

## 修复效果

修复后，教师角色可以看到所有29个分配的权限：
- 7个 Category 权限（菜单分类）
- 22个 Menu 权限（具体菜单项）

包括：
- 教师工作台
- 业务中心
- 教学中心
- 招生中心
- 活动中心
- 任务中心
- 等等...

## 修改文件

- `server/src/controllers/auth-permissions.controller.ts` (第114-147行)

## 验证脚本

已创建验证脚本确认修复效果：
- `server/src/scripts/verify-teacher-menu-fix.ts` - 验证修复后的菜单权限

## 不影响其他角色

- ✅ 家长角色：排除TEACHER_权限，保持不变
- ✅ Admin/园长角色：排除TEACHER_和PARENT_权限，保持不变

## 测试结果

已验证所有角色的菜单权限显示正确：

| 角色 | 权限总数 | 过滤后权限数 | 状态 |
|------|---------|------------|------|
| 教师 | 39 | 39 | ✅ 正常 |
| 家长 | 43 | 43 | ✅ 正常 |
| 园长 | 28 | 28 | ✅ 正常 |
| Admin | 42 | 42 | ✅ 正常 |

教师角色现在可以看到所有分配的权限，包括：
- TEACHER_DASHBOARD_PAGE
- TEACHER_CENTER_DIRECTORY
- TEACHER_CENTER
- TEACHER_INTERACTIVE_CURRICULUM
- TEACHER_TEACHING
- TEACHER_ACTIVITIES
- TEACHER_ATTENDANCE
- TEACHER_TASKS
- TEACHER_NOTIFICATIONS
- TEACHER_ENROLLMENT
- 等等...

