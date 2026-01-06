# 教师权限修复方案（精简版）

## 🎯 修复目标

让教师角色的权限完全对应 `teacher-center/` 目录的页面，移除所有通用页面的权限。

---

## 📊 当前问题

### 教师角色当前有的权限（指向通用页面）

| 权限名称 | 当前Component | 问题 |
|---------|--------------|------|
| 主仪表板 | `pages/dashboard/index.vue` | ⚠️ 应该用 `pages/teacher-center/dashboard/index.vue` |
| 活动中心 | `pages/centers/ActivityCenter.vue` | ⚠️ 应该用 `pages/teacher-center/activities/index.vue` |
| 招生中心 | `pages/centers/EnrollmentCenter.vue` | ⚠️ 应该用 `pages/teacher-center/enrollment/index.vue` |
| 客户池中心 | `pages/centers/CustomerPoolCenter.vue` | ⚠️ 应该用 `pages/teacher-center/customer-tracking/index.vue` |
| 任务中心 | `pages/centers/TaskCenter.vue` | ⚠️ 应该用 `pages/teacher-center/tasks/index.vue` |
| 教学中心 | `pages/centers/TeachingCenter.vue` | ⚠️ 应该用 `pages/teacher-center/teaching/index.vue` |
| 人员中心 | `pages/centers/PersonnelCenter.vue` | ❌ 不需要，应该移除 |
| 分析中心 | `pages/centers/AnalyticsCenter.vue` | ❌ 不需要，应该移除 |

### 教师角色应该有的权限（teacher-center页面）

| # | 页面 | 标题 | 路径 |
|---|------|------|------|
| 1 | `dashboard/` | 教师工作台 | `/teacher-center/dashboard` |
| 2 | `activities/` | 活动中心 | `/teacher-center/activities` |
| 3 | `enrollment/` | 招生中心 | `/teacher-center/enrollment` |
| 4 | `customer-tracking/` | 客户跟踪 | `/teacher-center/customer-tracking` |
| 5 | `tasks/` | 任务中心 | `/teacher-center/tasks` |
| 6 | `teaching/` | 教学中心 | `/teacher-center/teaching` |

**总计**: 6个中心（移除人员中心和分析中心）

---

## 🔧 修复步骤

### 步骤1: 更新主仪表板权限

```sql
-- 将主仪表板改为教师工作台
UPDATE permissions 
SET component = 'pages/teacher-center/dashboard/index.vue',
    path = '/teacher-center/dashboard'
WHERE id = 1164;
```

### 步骤2: 更新5个中心权限的component路径

```sql
-- 1. 活动中心
UPDATE permissions 
SET component = 'pages/teacher-center/activities/index.vue',
    path = '/teacher-center/activities'
WHERE id = 3003;

-- 2. 招生中心
UPDATE permissions 
SET component = 'pages/teacher-center/enrollment/index.vue',
    path = '/teacher-center/enrollment'
WHERE id = 3004;

-- 3. 客户池中心
UPDATE permissions 
SET component = 'pages/teacher-center/customer-tracking/index.vue',
    path = '/teacher-center/customer-tracking'
WHERE id = 3054;

-- 4. 任务中心
UPDATE permissions 
SET component = 'pages/teacher-center/tasks/index.vue',
    path = '/teacher-center/tasks'
WHERE id = 3035;

-- 5. 教学中心
UPDATE permissions 
SET component = 'pages/teacher-center/teaching/index.vue',
    path = '/teacher-center/teaching'
WHERE id = 4059;
```

### 步骤3: 移除不需要的权限

```sql
-- 获取教师角色ID
SET @teacher_role_id = (SELECT id FROM roles WHERE code = 'teacher');

-- 移除人员中心权限
DELETE FROM role_permissions 
WHERE role_id = @teacher_role_id AND permission_id = 3002;

-- 移除分析中心权限
DELETE FROM role_permissions 
WHERE role_id = @teacher_role_id AND permission_id = 3073;

-- 移除其他不需要的dashboard权限
DELETE FROM role_permissions 
WHERE role_id = @teacher_role_id 
  AND permission_id IN (
    1152, -- 园区概览
    1155, -- 班级列表
    1156, -- 自定义布局
    1157, -- 数据统计
    1158, -- 重要通知
    1159, -- 绩效管理
    1160, -- 日程管理
    1162, -- FinancialAnalysis
    1205, -- 仪表板（园长）
    1212  -- Intelligent-dashboard
  );
```

### 步骤4: 更新前端路由配置

```typescript
// client/src/pages/Login/index.vue
// 教师登录后跳转到教师工作台
case 'teacher':
  redirectUrl = '/teacher-center/dashboard'
  console.log('👨‍🏫 教师角色，跳转到教师工作台')
  break
```

---

## 📊 修复后的效果

### 教师角色的6个中心

| # | 中心名称 | Component路径 | 路由路径 |
|---|---------|--------------|---------|
| 1 | 教师工作台 | `pages/teacher-center/dashboard/index.vue` | `/teacher-center/dashboard` |
| 2 | 活动中心 | `pages/teacher-center/activities/index.vue` | `/teacher-center/activities` |
| 3 | 招生中心 | `pages/teacher-center/enrollment/index.vue` | `/teacher-center/enrollment` |
| 4 | 客户池中心 | `pages/teacher-center/customer-tracking/index.vue` | `/teacher-center/customer-tracking` |
| 5 | 任务中心 | `pages/teacher-center/tasks/index.vue` | `/teacher-center/tasks` |
| 6 | 教学中心 | `pages/teacher-center/teaching/index.vue` | `/teacher-center/teaching` |

**移除的权限**:
- ❌ 人员中心（Personnel Center）
- ❌ 分析中心（Analytics Center）
- ❌ 其他通用dashboard页面

---

## ✅ 优势

1. ✅ **完全匹配**: 教师权限完全对应teacher-center目录
2. ✅ **执行导向**: 所有页面都是为教师日常工作设计的
3. ✅ **简化界面**: 移除了不必要的管理功能
4. ✅ **清晰架构**: 权限-页面一一对应
5. ✅ **易于维护**: 教师相关功能集中在teacher-center目录

---

## 🚀 执行脚本

### 完整SQL脚本

```sql
-- ============================================
-- 教师权限修复脚本
-- 目的：让教师权限完全对应teacher-center目录
-- ============================================

-- 获取教师角色ID
SET @teacher_role_id = (SELECT id FROM roles WHERE code = 'teacher');

-- 步骤1: 更新主仪表板权限
UPDATE permissions 
SET component = 'pages/teacher-center/dashboard/index.vue',
    path = '/teacher-center/dashboard',
    updated_at = NOW()
WHERE id = 1164;

-- 步骤2: 更新5个中心权限
UPDATE permissions 
SET component = 'pages/teacher-center/activities/index.vue',
    path = '/teacher-center/activities',
    updated_at = NOW()
WHERE id = 3003;

UPDATE permissions 
SET component = 'pages/teacher-center/enrollment/index.vue',
    path = '/teacher-center/enrollment',
    updated_at = NOW()
WHERE id = 3004;

UPDATE permissions 
SET component = 'pages/teacher-center/customer-tracking/index.vue',
    path = '/teacher-center/customer-tracking',
    updated_at = NOW()
WHERE id = 3054;

UPDATE permissions 
SET component = 'pages/teacher-center/tasks/index.vue',
    path = '/teacher-center/tasks',
    updated_at = NOW()
WHERE id = 3035;

UPDATE permissions 
SET component = 'pages/teacher-center/teaching/index.vue',
    path = '/teacher-center/teaching',
    updated_at = NOW()
WHERE id = 4059;

-- 步骤3: 移除不需要的权限
DELETE FROM role_permissions 
WHERE role_id = @teacher_role_id 
  AND permission_id IN (
    3002, -- 人员中心
    3073, -- 分析中心
    1152, -- 园区概览
    1155, -- 班级列表
    1156, -- 自定义布局
    1157, -- 数据统计
    1158, -- 重要通知
    1159, -- 绩效管理
    1160, -- 日程管理
    1162, -- FinancialAnalysis
    1205, -- 仪表板（园长）
    1212  -- Intelligent-dashboard
  );

-- 验证结果
SELECT '✅ 教师权限修复完成！' AS result;

-- 查看教师角色的中心权限
SELECT p.id, p.name, p.code, p.path, p.component
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
JOIN roles r ON rp.role_id = r.id
WHERE r.code = 'teacher' 
  AND p.type IN ('category', 'menu')
  AND (p.path LIKE '/teacher-center/%' OR p.path LIKE '/centers/%')
ORDER BY p.id;
```

---

## 📝 实施清单

- [ ] 备份数据库
- [ ] 执行SQL脚本更新权限
- [ ] 更新前端路由配置（教师登录跳转）
- [ ] 重启后端服务
- [ ] 清除前端缓存
- [ ] 测试教师登录
- [ ] 验证侧边栏菜单（应该只显示6个中心）
- [ ] 测试每个中心页面的访问
- [ ] 验证页面功能正常

---

## 🧪 测试验证

### 测试1: 教师登录
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "teacher", "password": "teacher123"}'
```

### 测试2: 获取教师菜单
```bash
curl -X GET http://localhost:3000/api/auth-permissions/menu \
  -H "Authorization: Bearer <token>"
```

**预期结果**:
- ✅ 返回6个中心权限
- ✅ 所有路径都是 `/teacher-center/` 开头
- ✅ 不包含人员中心和分析中心
- ✅ 不包含通用dashboard页面

---

**创建时间**: 2025-01-05  
**状态**: 待执行

