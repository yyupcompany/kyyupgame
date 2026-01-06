# 后端系统修复指南

## 概述

本文档提供了修复Teacher角色后端系统关键问题的完整方案，包括权限系统错误、数据库字段缺失和API端点实现。

## 问题分析

### 1. 权限系统错误（403 Forbidden）
- **问题**: `/api/activities` 权限不足
- **根因**: 数据库中Teacher角色缺少Activity相关权限
- **影响**: Teacher角色无法访问活动管理功能

### 2. 数据库字段缺失（500 Error）
- **问题**: `Unknown column 'all_day' in 'field list'`
- **根因**: schedules表缺少all_day字段
- **影响**: 日程相关功能报错

### 3. API端点缺失（404 Error）
- **问题**: `/api/dashboard/charts` 端点不存在
- **根因**: 路由配置中没有charts端点
- **影响**: 仪表板图表数据无法加载

## 修复方案

### 方案1: 快速修复（推荐）

```bash
# 进入服务器目录
cd /home/devbox/project/server

# 运行综合修复脚本
node fix-all-backend-issues.js
```

### 方案2: 分步修复

#### 步骤1: 修复数据库Schema
```bash
node fix-database-schema.js
```

#### 步骤2: 修复Teacher权限
```bash
node fix-teacher-permissions.js
```

#### 步骤3: 重启服务器
```bash
# 重启后端服务以应用更改
npm restart
# 或
pm2 restart all
```

## 修复内容详细说明

### 1. 权限系统修复

#### 创建/验证Teacher角色
- 确保数据库中存在Teacher角色
- 角色code: `teacher`
- 角色ID: 3

#### 添加Activity权限
修复脚本会自动添加以下权限：
- `ACTIVITY_VIEW` - 查看活动
- `ACTIVITY_MANAGE` - 管理活动  
- `ACTIVITY_CREATE` - 创建活动
- `ACTIVITY_UPDATE` - 更新活动

#### 权限分配
- 将Activity权限分配给Teacher角色
- 确保test_teacher用户具有Teacher角色

### 2. 数据库Schema修复

#### schedules表字段补全
```sql
-- 添加缺失的all_day字段
ALTER TABLE schedules 
ADD COLUMN all_day BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否全天';

-- 其他必需字段也会被检查和添加
```

#### 表结构验证
检查并修复以下表的完整性：
- schedules (日程表)
- users (用户表)
- roles (角色表)
- permissions (权限表)
- user_roles (用户角色表)
- role_permissions (角色权限表)

### 3. API端点实现

#### 新增charts端点
在 `/src/routes/dashboard.routes.ts` 中添加：
```typescript
// 图表数据API
router.get('/charts', async (req, res) => {
  // 返回学生趋势、活动参与度、招生趋势、出勤统计等数据
});
```

#### 权限中间件优化
- 增加详细的调试日志
- 开发环境下显示权限检查详情
- 优化错误处理和响应格式

## 验证修复效果

### 1. 检查权限修复
```bash
# 查询test_teacher用户的权限
node -e "
const { Sequelize, QueryTypes } = require('sequelize');
// 权限查询脚本...
"
```

### 2. 测试API端点
```bash
# 测试活动API
curl -H 'Authorization: Bearer <token>' http://localhost:3000/api/activities

# 测试图表API  
curl -H 'Authorization: Bearer <token>' http://localhost:3000/api/dashboard/charts
```

### 3. 检查数据库字段
```sql
-- 验证schedules表结构
DESCRIBE schedules;

-- 确认all_day字段存在
SELECT COLUMN_NAME FROM information_schema.COLUMNS 
WHERE TABLE_NAME = 'schedules' AND COLUMN_NAME = 'all_day';
```

## 故障排除

### 权限相关问题
- 确认用户表中test_teacher用户存在
- 检查user_roles表中的角色分配
- 验证role_permissions表中的权限映射

### 数据库连接问题
- 检查数据库配置文件 `src/config/database.js`
- 确认数据库服务正在运行
- 验证连接参数正确

### API响应问题
- 检查服务器启动日志
- 查看路由注册是否成功
- 验证中间件加载顺序

## 监控和维护

### 1. 日志监控
关键日志位置：
- 权限检查: `[权限检查]` 前缀
- API调试: `[API调试]` 前缀
- 数据库操作: `logs/database.log`

### 2. 性能监控
- 监控权限查询的响应时间
- 检查数据库连接池状态
- 观察API端点的调用频率

### 3. 定期维护
- 定期清理过期的权限数据
- 优化数据库索引
- 更新权限配置以匹配业务需求

## 相关文件

### 修复脚本
- `fix-all-backend-issues.js` - 综合修复脚本
- `fix-teacher-permissions.js` - 权限修复脚本
- `fix-database-schema.js` - 数据库修复脚本

### 核心文件
- `src/middlewares/auth.middleware.ts` - 认证中间件
- `src/routes/dashboard.routes.ts` - 仪表板路由
- `src/config/role-mapping.ts` - 角色权限配置
- `src/models/schedule.model.ts` - 日程模型

## 注意事项

1. **备份数据库**: 运行修复脚本前建议备份数据库
2. **测试环境验证**: 在生产环境运行前先在测试环境验证
3. **权限敏感**: 权限修改可能影响系统安全，请仔细验证
4. **版本控制**: 确保代码修改已提交到版本控制系统

## 联系支持

如果遇到问题，请：
1. 检查服务器日志文件
2. 运行诊断脚本
3. 收集错误信息和环境详情
4. 提供重现步骤