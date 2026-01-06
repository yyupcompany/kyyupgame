# 教师角色侧边栏菜单显示问题 - 详细修复说明

## 问题分析

### 症状
- 教师角色登录后，侧边栏菜单为空或显示不完整
- 无法看到应该分配的菜单项

### 根本原因
后端权限API (`/api/auth-permissions/menu`) 中的菜单过滤逻辑错误。

**原始代码问题**：
```typescript
// 错误的过滤逻辑
if (userRoleCode === 'teacher') {
  whereCondition.code = { [Op.like]: 'TEACHER_%' };  // ❌ 只返回TEACHER_开头的权限
}
```

**为什么这是错误的**：
1. 教师角色被分配了39个权限
2. 其中只有10个权限是 `TEACHER_` 开头的
3. 其他29个权限是通用的中心权限（如 `BUSINESS_CENTER`、`TEACHING_CENTER` 等）
4. 过滤逻辑导致这29个权限被过滤掉，菜单显示不完整

## 修复方案

### 修改文件
`server/src/controllers/auth-permissions.controller.ts` (第114-147行)

### 修复逻辑
改为**排除**不应该显示的权限，而不是**只显示**特定前缀的权限：

```typescript
// 修复后的逻辑
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

### 教师角色现在可以看到
- ✅ 39个权限（之前只能看到10个）
- ✅ 所有TEACHER_开头的权限
- ✅ 所有分配的中心权限
- ✅ 完整的侧边栏菜单

### 其他角色不受影响
- ✅ 家长角色：仍然排除TEACHER_权限
- ✅ 园长角色：仍然排除TEACHER_和PARENT_权限
- ✅ Admin角色：仍然排除TEACHER_和PARENT_权限

## 验证方式

### 方式1：查看后端日志
启动后端后，教师登录时会看到日志：
```
🔐 教师角色：排除PARENT_菜单，返回其他权限
📊 从数据库获取并过滤菜单权限: 39 条
```

### 方式2：运行验证脚本
```bash
cd server
npx ts-node src/scripts/verify-teacher-menu-fix.ts
```

### 方式3：运行测试脚本
```bash
cd server
npx ts-node src/scripts/test-all-roles-menu.ts
```

## 部署步骤

1. 代码已修改并编译
2. 重启后端服务
3. 教师角色登录验证菜单显示正常
4. 验证其他角色（家长、园长、Admin）菜单显示正常

