# 园长仪表板页面404修复方案

## 问题分析
访问 `/principal/PrincipalDashboard` 出现404错误，经过检查发现：

### ✅ 已存在的组件
1. **服务层**: `server/src/services/principal.service.ts` - 包含 `getDashboardStats()` 方法
2. **控制层**: `server/src/controllers/principal.controller.ts` - 包含 `getDashboardStats` 控制器
3. **路由层**: `server/src/routes/principal.routes.ts` - 包含 `/dashboard` 路由
4. **前端页面**: `client/src/pages/principal/Dashboard.vue` - 页面组件存在
5. **前端路由**: `client/src/router/dynamic-routes.ts` - 组件映射存在

### ❌ 缺失的配置
- **数据库权限配置**: 缺少 `/principal/PrincipalDashboard` 路径的权限记录

## 修复步骤

### 步骤1: 手动执行SQL添加权限

```sql
-- 1. 添加园长仪表板权限
INSERT IGNORE INTO permissions (
    name, 
    code, 
    type, 
    parent_id, 
    path, 
    component, 
    permission, 
    icon, 
    sort, 
    status,
    created_at,
    updated_at
) VALUES (
    '园长仪表板', 
    'principal-dashboard', 
    'menu', 
    NULL, 
    '/principal/PrincipalDashboard', 
    'pages/principal/Dashboard.vue', 
    'PRINCIPAL_DASHBOARD_VIEW', 
    'Monitor', 
    10, 
    1,
    NOW(),
    NOW()
);

-- 2. 为admin角色分配权限
INSERT IGNORE INTO role_permissions (
    role_id, 
    permission_id, 
    created_at, 
    updated_at
) 
SELECT 
    r.id as role_id,
    p.id as permission_id,
    NOW() as created_at,
    NOW() as updated_at
FROM roles r, permissions p 
WHERE r.code = 'admin' 
AND p.code = 'principal-dashboard';
```

### 步骤2: 验证修复结果

```sql
-- 验证权限是否添加成功
SELECT 
    p.id,
    p.name,
    p.code,
    p.path,
    p.component
FROM permissions p 
WHERE p.code = 'principal-dashboard';

-- 验证角色权限分配
SELECT 
    r.name as role_name,
    p.name as permission_name,
    p.path as permission_path
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE p.code = 'principal-dashboard';
```

### 步骤3: 重启应用验证

1. 重启后端服务
2. 清除浏览器缓存
3. 重新访问 `http://localhost:5173/principal/PrincipalDashboard`

## 预期结果

修复完成后，访问 `/principal/PrincipalDashboard` 应该：
1. 正常加载园长仪表板页面
2. 显示统计数据卡片
3. 显示图表和功能模块
4. 动态路由日志显示路由匹配成功

## 备注

- 此修复方案遵循标准404修复流程
- 只添加必要的权限记录，不进行批量修改
- 所有SQL语句使用 `INSERT IGNORE` 避免重复插入
- 权限配置完成后需要重启应用生效
