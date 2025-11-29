# 系统架构总结分析

## 📊 系统整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    统一租户管理系统 (Master)                      │
│              Unified Tenant Management System                    │
│                                                                  │
│  域名: rent.yyup.cc | 端口: 4001                                 │
│  数据库: admin_tenant_management (29表)                          │
│                                                                  │
│  职责:                                                           │
│  ✅ 全局用户认证 (global_users)                                  │
│  ✅ 租户管理 (tenants)                                           │
│  ✅ 用户-租户关联 (global_user_tenant_relations)                 │
│  ✅ AI服务网关 (AIBridge)                                        │
│  ✅ 资源分配 (OSS、DNS、数据库)                                  │
│  ✅ 计费管理 (billing_records)                                   │
└────────────────────┬────────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ↓                         ↓
┌──────────────────┐    ┌──────────────────────────────┐
│  认证服务        │    │  AI Bridge服务               │
│  (Auth)          │    │  (AIBridge)                  │
│                  │    │                              │
│ • 登录           │    │ • 模型管理                   │
│ • 注册           │    │ • Token计费                  │
│ • Token生成      │    │ • 调用日志                   │
│ • 租户查询       │    │ • 配额管理                   │
└──────────────────┘    └──────────────────────────────┘
        │                         │
        └────────────┬────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ↓                         ↓
┌──────────────────────────────────────────────────────────────────┐
│              幼儿园租户实例系统 (Tenant Instances)                 │
│           Kindergarten Tenant Instance System                    │
│                                                                  │
│  测试站点:                                                       │
│  ├─ 域名: k.yyup.cc | 端口: 3000                                 │
│  └─ 数据库: kargerdensales (85+表)                               │
│                                                                  │
│  租户实例 (k001, k002, ...):                                     │
│  ├─ 域名: k001.yyup.cc, k002.yyup.cc                             │
│  ├─ 数据库: rent001, rent002, ... (独立数据库)                   │
│  ├─ OSS: /{phone}/ (基于手机号隔离)                              │
│  └─ 职责: 幼儿园业务管理、招生、教学、活动                        │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ 数据库架构

### 1. admin_tenant_management (29表) - 全局管理库

**用户认证相关 (3表)**
```
global_users
├─ id: 全局用户ID
├─ phone: 登录凭证 (UNIQUE)
├─ password_hash: 密码哈希
├─ real_name: 真实姓名
└─ status: active/suspended/deleted

global_user_tenant_relations
├─ global_user_id: 关联global_users
├─ tenant_code: 关联tenants
├─ tenant_user_id: 租户内用户ID
├─ role_in_tenant: 租户内角色
└─ permissions: JSON权限

admin_users
├─ username: 系统管理员用户名
├─ password: 系统管理员密码
├─ role: super_admin/admin/operator
└─ 用途: 管理整个系统
```

**租户管理相关 (2表)**
```
tenants
├─ tenant_id: 租户代码 (k001, k002...)
├─ name: 租户名称
├─ domain: 子域名
├─ database_name: 数据库名 (rent001, rent002...)
├─ status: active/inactive/suspended/deleted
├─ plan_type: basic/standard/premium/enterprise
└─ max_users, max_storage: 资源限制

tenant_accounts
├─ tenant_id: 租户代码
├─ balance: 账户余额
├─ credit_limit: 信用额度
└─ payment_status: 支付状态
```

**AI服务相关 (5表)**
```
ai_model_config
├─ name: 模型名称 (gpt-3.5-turbo, claude-3等)
├─ provider: openai/anthropic/doubao
├─ endpoint_url: API端点
├─ api_key: API密钥
└─ is_default: 是否默认模型

tenant_ai_model_configs
├─ tenant_id: 租户ID
├─ model_id: 模型ID
├─ is_enabled: 是否启用
└─ priority: 优先级

ai_service_call_logs
├─ tenant_id: 租户ID
├─ user_id: 用户ID
├─ model_id: 模型ID
├─ input_tokens, output_tokens: Token数
├─ cost: 成本
└─ status: success/error/timeout

tenant_ai_usage_summary
├─ tenant_id: 租户ID
├─ date: 日期
├─ total_calls: 调用次数
├─ total_input_tokens: 输入Token总数
├─ total_output_tokens: 输出Token总数
├─ total_cost: 总成本
└─ success_rate: 成功率
```

**其他系统表 (19表)**
```
audit_logs, billing_records, billing_rules, data_access_logs,
data_backup_records, invitation_links, login_history,
notification_logs, permission_changes, scheduled_tasks,
security_events, sms_config, system_config, tenant_billing_rules,
tenant_cleanup_logs, tenant_init_progress, tenant_init_steps,
tenant_sub_accounts, unified_auth_logs
```

---

### 2. kargerdensales (85+表) - 模板库 + 测试站点

**三重角色**
```
1. 模板数据库
   └─ 新租户创建时复制此数据库结构和初始数据

2. 测试站点 (k.yyup.cc)
   └─ 用于功能测试和演示

3. Schema标准
   └─ 租户数据库的参考标准
```

**核心业务表分类**
```
用户权限系统 (7表)
├─ users (574条) - 租户内部用户
├─ roles - 角色定义
├─ permissions - 权限定义
├─ user_roles - 用户角色关联
├─ role_permissions - 角色权限关联
├─ user_profiles - 用户资料
└─ token_blacklist - Token黑名单

学生家长系统 (4表)
├─ students - 学生信息
├─ parents - 家长信息
├─ parent_student_relations - 家长学生关系
└─ classes - 班级信息

教师系统 (2表)
├─ teachers - 教师信息
└─ class_teachers - 班级教师关联

招生管理系统 (10表)
├─ enrollment_plans - 招生计划
├─ enrollment_applications - 报名申请
├─ enrollment_quotas - 招生配额
├─ enrollment_consultations - 招生咨询
├─ enrollment_consultation_followups - 咨询跟进
├─ enrollment_tasks - 招生任务
├─ admission_results - 录取结果
├─ admission_notifications - 录取通知
├─ enrollment_interviews - 面试记录
└─ channel_tracking - 渠道追踪

活动管理系统 (10表)
├─ activities - 活动信息
├─ activity_templates - 活动模板
├─ activity_registrations - 活动报名
├─ activity_evaluations - 活动评价
├─ activity_plans - 活动计划
├─ activity_arrangements - 活动安排
├─ activity_resources - 活动资源
├─ activity_staff - 活动人员
├─ activity_shares - 活动分享
└─ activity_posters - 活动海报

营销管理系统 (8表)
├─ marketing_campaigns - 营销活动
├─ advertisements - 广告管理
├─ channels - 渠道管理
├─ conversion_tracking - 转化追踪
├─ coupons - 优惠券
├─ referral_codes - 推荐码
├─ referral_relationships - 推荐关系
└─ referral_rewards - 推荐奖励

内容管理系统 (6表)
├─ poster_templates - 海报模板
├─ poster_elements - 海报元素
├─ poster_generations - 海报生成
├─ poster_categories - 海报分类
├─ personal_posters - 个人海报
└─ message_templates - 消息模板

AI助手系统 (12表)
├─ ai_model_config - AI模型配置
├─ ai_model_usage - AI使用记录
├─ ai_model_billing - AI计费
├─ ai_conversations - AI对话
├─ ai_messages - AI消息
├─ ai_memories - AI记忆
├─ ai_feedback - AI反馈
├─ ai_user_permissions - AI权限
├─ ai_user_relations - AI用户关系
├─ ai_query_logs - AI查询日志
├─ ai_query_cache - AI查询缓存
└─ ai_query_templates - AI查询模板

系统管理 (10表)
├─ system_config - 系统配置
├─ system_logs - 系统日志
├─ operation_logs - 操作日志
├─ notifications - 通知
├─ schedules - 日程
├─ todos - 待办事项
├─ file_storage - 文件存储
├─ kindergartens - 幼儿园信息
├─ page_guides - 页面指引
└─ scripts - 话术脚本
```

---

### 3. 租户独立数据库 (rent001, rent002, ...)

```
特点:
✅ 完全独立的Schema
✅ 数据完全隔离
✅ 可独立扩展表结构
✅ 从kargerdensales复制而来

命名规则:
├─ 租户代码 k001 → 数据库 rent001
├─ 租户代码 k002 → 数据库 rent002
└─ 租户代码 k022 → 数据库 rent022 (当前最新)
```

---

## 🔐 认证系统详解

### 认证流程

```
┌─────────────┐
│   用户登录   │
│ (手机号密码) │
└──────┬──────┘
       │
       ↓
┌──────────────────────────────────────┐
│  统一租户系统 (rent.yyup.cc:4001)     │
│  POST /api/auth/login                │
│                                      │
│  1. 查询 global_users 表             │
│     WHERE phone = ?                  │
│  2. bcrypt验证 password_hash         │
│  3. 生成JWT Token                    │
│  4. 返回 global_user_id + token      │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  查询用户可访问的租户列表             │
│  SELECT * FROM                       │
│    global_user_tenant_relations      │
│  WHERE global_user_id = ?            │
│  JOIN tenants                        │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  用户选择目标租户                     │
│  tenant_id: k001                     │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  租户系统 (k001.yyup.cc:3000)         │
│                                      │
│  1. 验证Token                        │
│  2. 从Token提取 global_user_id       │
│  3. 切换到租户数据库 (rent001)        │
│  4. 查询租户内用户信息                │
│  5. 加载用户权限                     │
│  6. 允许访问租户资源                  │
└──────────────────────────────────────┘
```

### 认证系统存在的问题 🔴

| # | 问题 | 位置 | 严重程度 | 影响 |
|---|------|------|--------|------|
| 1 | 两个认证中间件 | unified-tenant-system | 🔴 高 | 代码混乱 |
| 2 | 查询表不一致 | auth.controller vs auth.middleware | 🔴 高 | 数据不同步 |
| 3 | 响应格式不统一 | 两个系统 | 🟡 中 | 前端困惑 |
| 4 | 认证逻辑位置不统一 | k.yyup.com | 🟡 中 | 违反MVC |
| 5 | 错误处理不一致 | 两个系统 | 🟡 中 | 难以维护 |

### 修复方案

**第一阶段：统一租户系统清理（1小时）**
```
1. 删除 auth.ts 文件（模拟中间件）
2. 清理 auth.middleware.ts（删除注释代码）
3. 统一 auth.controller.ts（确保查询global_users表）
```

**第二阶段：幼儿园租户系统优化（1小时）**
```
1. 补充 auth.controller.ts login 方法
2. 优化 auth.middleware.ts（统一错误处理）
```

**第三阶段：统一规范（2小时）**
```
1. 统一响应格式：{ success, message, data, error }
2. 统一日志记录：使用 [认证] 前缀
3. 编写集成测试
```

---

## 🤖 AI服务架构

### AIBridge统一服务

```
所有租户 → AIBridge (rent.yyup.cc:4001) → AI提供商
                    ↓
            ┌───────┴───────┐
            ↓               ↓
        OpenAI          Anthropic
        (GPT-3.5)       (Claude)
            ↓               ↓
        Doubao          其他提供商
        (豆包)
```

### AI调用流程

```
1. 租户系统调用 AIBridge API
   POST /api/v1/ai/bridge/chat
   Headers: Authorization: Bearer {token}
            X-Tenant-Code: k001

2. AIBridge验证租户Token

3. AIBridge选择合适的AI模型

4. 调用AI提供商API

5. 记录调用日志到 ai_service_call_logs

6. 计算Token使用量和成本

7. 更新 tenant_ai_usage_summary

8. 返回AI响应
```

### AI使用统计

```
自动统计维度:
├─ 按租户统计
├─ 按模型统计
├─ 按日期统计
├─ 按用户统计
└─ 按成本统计

查询示例:
SELECT 
  date,
  model_id,
  total_calls,
  total_input_tokens,
  total_output_tokens,
  total_cost,
  average_response_time,
  success_rate
FROM tenant_ai_usage_summary
WHERE tenant_id = (SELECT id FROM tenants WHERE tenant_id = 'k001')
  AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
ORDER BY date DESC;
```

---

## 🚀 租户开通流程

```
1. 参数验证
   ├─ 租户代码格式: /^k\d{3,}$/
   ├─ 手机号格式: /^1[3-9]\d{9}$/
   └─ 邮箱格式验证

2. 短信验证
   └─ 验证 contactPhone + smsVerificationCode

3. 唯一性检查
   ├─ 检查 tenant_id 是否已存在
   └─ 检查 domain 是否已被使用

4. 创建子域名
   ├─ 域名: k003.yyup.cc
   ├─ DNS A记录指向服务器IP
   └─ 记录域名配置

5. 创建租户数据库
   ├─ 数据库名: rent003
   ├─ 从 kargerdensales 复制结构
   ├─ 复制初始数据
   └─ 创建数据库用户权限

6. 分配OSS目录
   ├─ 目录: /{phone}/ (基于手机号)
   ├─ 创建子目录结构
   └─ 设置访问权限

7. 创建租户记录
   └─ INSERT INTO tenants

8. 初始化数据库
   ├─ 运行初始化脚本
   ├─ 创建系统配置
   └─ 创建默认数据

9. 创建管理员账户
   ├─ global_users 表添加记录
   ├─ tenant.users 表添加记录
   └─ global_user_tenant_relations 关联

10. 配置AI模型
    └─ 从 ai_model_config 复制默认配置

11. 返回租户信息
    └─ 域名、数据库、密码等
```

---

## 📁 OSS存储架构

### 目录结构

```
/{phone}/                 # 以联系人手机号为根目录
  ├─ uploads/             # 用户上传文件
  │   ├─ images/          # 图片
  │   ├─ videos/          # 视频
  │   └─ files/           # 其他文件
  ├─ generated/           # AI生成内容
  │   ├─ posters/         # AI生成海报
  │   └─ documents/       # AI生成文档
  ├─ posters/             # 海报素材
  │   ├─ templates/       # 海报模板
  │   └─ user_created/    # 用户创建
  ├─ documents/           # 文档资料
  │   ├─ enrollment/      # 招生资料
  │   └─ activities/      # 活动资料
  └─ temp/                # 临时文件（自动清理）

示例:
├─ 租户k001 (联系人: 13800138000) → /13800138000/
├─ 租户k002 (联系人: 15900159000) → /15900159000/
└─ 租户k003 (联系人: 13900139000) → /13900139000/
```

### 为什么使用手机号作为OSS目录名？

```
1. 唯一性保证
   └─ 手机号全局唯一，不会发生冲突

2. 数据关联
   └─ 通过手机号快速定位用户的OSS目录

3. 权限隔离
   └─ 每个租户只能访问自己手机号对应的目录

4. 用户迁移
   └─ 用户更换租户代码时，OSS目录不变
```

---

## 🔑 关键设计决策

### 1. 为什么采用双系统架构？

```
✅ 职责分离
   ├─ Master系统：全局管理、认证、AI服务
   └─ Tenant系统：业务管理、数据隔离

✅ 可扩展性
   ├─ 新租户只需复制Tenant系统
   └─ Master系统保持稳定

✅ 安全性
   ├─ 数据完全隔离
   ├─ 权限细粒度控制
   └─ 审计日志完整

✅ 性能
   ├─ 租户数据库独立
   ├─ 查询性能不受其他租户影响
   └─ 可独立扩展
```

### 2. 为什么使用phone作为登录凭证？

```
✅ 用户友好
   └─ 手机号易记，不需要记住username

✅ 全局唯一
   └─ 一个手机号对应一个全局用户

✅ 多租户支持
   └─ 同一用户可以属于多个租户

✅ 与OSS集成
   └─ 手机号作为OSS目录名，权限隔离
```

### 3. 为什么使用kargerdensales作为模板库？

```
✅ 新租户快速开通
   └─ 复制现成的Schema和初始数据

✅ Schema标准化
   └─ 所有租户使用相同的表结构

✅ 测试站点
   └─ k.yyup.cc用于功能测试

✅ 版本管理
   └─ 新功能先在模板库测试，再推广到各租户
```

### 4. 为什么使用AIBridge统一服务？

```
✅ 成本控制
   └─ 统一管理API密钥，避免重复计费

✅ 模型管理
   └─ 集中配置和切换AI模型

✅ 使用统计
   └─ 准确计算每个租户的AI成本

✅ 故障隔离
   └─ 一个AI提供商故障不影响其他租户
```

---

## 📊 系统规模

```
当前状态:
├─ 活跃租户: 13个
├─ 全局用户: 23个
├─ 用户-租户关联: 19条
├─ 系统管理员: 2个
├─ 租户数据库: 22个 (rent001 ~ rent022)
└─ 业务表: 85+个

容量规划:
├─ 支持租户数: 无限制
├─ 支持用户数: 无限制
├─ 支持存储: 基于OSS容量
└─ 支持并发: 基于服务器配置
```

---

## 🎯 核心要点总结

| 要点 | 说明 |
|------|------|
| **架构模式** | SaaS多租户系统 |
| **系统数量** | 2个（Master + Tenant） |
| **数据库数量** | 3类（全局库 + 模板库 + 租户库） |
| **认证方式** | 全局phone + 租户Token |
| **数据隔离** | 数据库隔离 + 权限隔离 + 存储隔离 |
| **AI服务** | 统一AIBridge网关 |
| **存储隔离** | 基于手机号的目录隔离 |
| **租户开通** | 自动化流程（11步） |
| **认证问题** | 需要修复（5个问题） |
| **修复时间** | 4小时 |


