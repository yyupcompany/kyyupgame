# 统一租户认证管理系统架构规则

## 系统总览

本项目采用**统一租户管理 + 多租户实例**的SaaS架构，包含两个核心系统：

### 1. 统一租户管理系统 (Unified Tenant Management System)
- **路径**: `/home/zhgue/kyyupgame/unified-tenant-system`
- **域名**: `rent.yyup.cc`
- **端口**: `4001`
- **数据库**: `admin_tenant_management`
- **职责**: 
  - 统一认证中心 (Unified Authentication)
  - 租户生命周期管理
  - AI模型统一管理
  - AIBridge服务提供
  - 子域名分配
  - 子数据库分配
  - OSS目录分配

### 2. 幼儿园租户实例系统 (Kindergarten Tenant Instance)
- **路径**: `/home/zhgue/kyyupgame/k.yyup.com`
- **域名**: `k.yyup.cc` (测试站点/模板)
- **租户子域名**: `{tenant_id}.yyup.cc` (如: k001.yyup.cc)
- **端口**: `3000`
- **数据库**: `kargerdensales` (模板数据库) / `{tenant_id}` (租户专用数据库)
- **职责**:
  - 幼儿园业务管理
  - 招生管理
  - 学生/教师/家长管理
  - 活动管理
  - AI助手功能

## 数据库架构

### admin_tenant_management 数据库 (29张表)
**用途**: 统一租户管理和认证

**核心表**:
- `admin_users` - 系统管理员账号 (username + password)
- `global_users` - 租户用户全局认证表 (phone + password_hash)
- `tenants` - 租户信息表
- `global_user_tenant_relations` - 用户租户关联表
- `tenant_accounts` - 租户账户信息
- `unified_auth_logs` - 统一认证日志
- `ai_model_config` - AI模型配置
- `tenant_ai_model_configs` - 租户AI模型配置
- `ai_service_call_logs` - AI服务调用日志

### kargerdensales 数据库 (作为模板)
**用途**: 租户业务模板和测试站点

**核心表** (85+张):
- `users` - 租户内部用户表 (574条记录)
- `students` - 学生信息
- `teachers` - 教师信息
- `parents` - 家长信息
- `classes` - 班级信息
- `activities` - 活动信息
- `enrollment_plans` - 招生计划
- `enrollment_applications` - 报名申请
- ... 其他业务表

## 认证架构

### 统一认证流程 (Global Authentication)

```
用户 → 手机号+密码 → global_users表认证 → 返回global_user_id + token
   ↓
查询用户可访问的租户列表 (global_user_tenant_relations)
   ↓
选择目标租户 (tenant_id)
   ↓
租户系统验证token + 切换到租户数据库
   ↓
访问租户内资源
```

**关键点**:
1. 使用 `global_users.phone` 进行登录 (NOT username)
2. 密码字段名为 `password_hash` (NOT password)
3. 一个用户可以属于多个租户
4. 租户系统使用 `global_user_id` 关联全局用户

### 系统管理员认证 (Admin Authentication)
```
管理员 → username+password → admin_users表认证 → 管理整个系统
```

**权限**:
- `super_admin` - 超级管理员
- `admin` - 系统管理员
- `operator` - 运维人员

## AI服务架构

### AIBridge 统一服务

**提供方**: unified-tenant-system
**使用方**: k.yyup.com (及所有租户实例)

**核心服务**:
1. **AI模型管理**
   - 统一模型配置 (`ai_model_config`)
   - 模型参数管理
   - 默认模型设置

2. **AI调用统计**
   - Token使用量统计
   - 成本计算
   - 调用日志 (`ai_service_call_logs`)

3. **AI能力提供**
   - 文本生成
   - 对话管理
   - 向量嵌入
   - 函数调用 (Tool Calling)

**API路由**:
```
POST /api/v1/ai/bridge/chat          - AI对话
POST /api/v1/ai/bridge/embedding     - 文本嵌入
GET  /api/v1/ai/bridge/models        - 模型列表
POST /api/v1/ai/bridge/completion    - 文本补全
```

## 租户开通流程

### 1. 创建租户

**API**: `POST /api/tenant/create`

**步骤**:
1. 验证租户代码格式 (`k\d{3,}$`)
2. 验证手机验证码
3. 检查租户代码和域名唯一性
4. 生成租户密码配置
5. 创建动态子域名 (`{tenant_id}.yyup.cc`)
6. 从模板复制创建租户数据库
7. 创建OSS存储目录 (`/{phone}/`)
8. 初始化租户数据库结构
9. 创建租户管理员账户
10. 记录到 `tenants` 表

### 2. 资源分配

**子域名**: `{tenant_id}.yyup.cc`
- 格式: k001.yyup.cc, k002.yyup.cc
- DNS A记录指向服务器IP

**数据库**: `{tenant_id}` 或 `rent{number}`
- 从 `kargerdensales` 模板复制
- 独立Schema
- 独立连接配置

**OSS目录**: `/{phone}/`
- 基于联系人手机号
- 独立存储空间
- 权限隔离

## 开发规范

### 数据库查询规范

1. **统一认证相关查询** - 使用 `admin_tenant_management` 数据库
```typescript
// ✅ 正确
SELECT * FROM global_users WHERE phone = ?

// ❌ 错误 - 旧表，已废弃
SELECT * FROM users WHERE username = ?
```

2. **租户业务查询** - 使用租户专用数据库
```typescript
// ✅ 正确 - 动态切换到租户数据库
await databaseSwitchService.switchToTenant(tenantId);
SELECT * FROM users WHERE phone = ?
```

### API路由规范

**统一租户系统** (`http://rent.yyup.cc:4001`):
```
/api/auth/*              - 统一认证
/api/tenant/*            - 租户管理
/api/v1/ai/bridge/*      - AI Bridge服务
/api/admin/*             - 系统管理
```

**租户实例系统** (`http://k.yyup.cc:3000` 或 `http://{tenant_id}.yyup.cc`):
```
/api/auth/*              - 租户内认证(集成统一认证)
/api/students/*          - 学生管理
/api/teachers/*          - 教师管理
/api/activities/*        - 活动管理
/api/enrollment/*        - 招生管理
/api/ai/*                - AI功能(调用AIBridge)
```

### 环境变量配置

**unified-tenant-system/server/.env**:
```env
DB_HOST=dbconn.sealoshzh.site
DB_PORT=43906
DB_USER=root
DB_PASSWORD=pwk5ls7j
DB_NAME=admin_tenant_management  # 关键配置
PORT=4001
```

**k.yyup.com/server/.env**:
```env
DB_HOST=dbconn.sealoshzh.site
DB_PORT=43906
DB_USER=root
DB_PASSWORD=pwk5ls7j
DB_NAME=kargerdensales  # 模板数据库
PORT=3000

# 统一租户中心配置
UNIFIED_TENANT_CENTER_URL=http://rent.yyup.cc
UNIFIED_TENANT_API_URL=http://localhost:4001
```

## kargerdensales 数据库的三重角色

1. **测试站点** - k.yyup.cc 使用此数据库进行开发测试
2. **模板数据库** - 新租户创建时复制此数据库结构和初始数据
3. **开发参考** - 作为租户数据库Schema的标准参考

## 注意事项

1. **禁止混淆两个 users 表**:
   - `admin_tenant_management.users` - 已删除，废弃表
   - `kargerdensales.users` (及租户DB.users) - 租户内部用户表，正在使用

2. **认证表的正确使用**:
   - `admin_users` - 系统管理员 (username登录)
   - `global_users` - 租户用户 (phone登录)
   - 租户DB.users - 租户内部用户管理

3. **数据隔离原则**:
   - 每个租户拥有独立数据库
   - 全局认证数据在 `admin_tenant_management`
   - 租户业务数据在各自的租户数据库

4. **AI服务调用**:
   - 租户系统通过AIBridge调用AI
   - 所有AI调用都记录在 `ai_service_call_logs`
   - Token使用量统计在 `tenant_ai_usage_summary`

## 文档位置

- 系统架构说明: `/home/zhgue/kyyupgame/docs/统一系统架构说明/`
- API接口文档: `系统架构-API接口.md`
- 租户开通说明: `租户开通流程.md`
- 数据库配置: `数据库配置说明.md`
