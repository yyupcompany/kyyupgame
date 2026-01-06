# 后端API Swagger文档缺失清单报告

## 📊 总体统计

- **总API端点数**: 1,082
- **已有Swagger文档**: 312
- **缺少Swagger文档**: 770
- **文档覆盖率**: 28.8%

## 🚨 高优先级缺失文档文件

### 1. personnel-center.routes.ts (44个接口缺失)
**文件路径**: `/home/zhgue/localhost:5173/server/src/routes/personnel-center.routes.ts`

**缺失接口**:
- GET /overview
- GET /distribution  
- GET /trend
- GET /statistics
- GET /students, POST /students, GET /students/:id, PUT /students/:id, DELETE /students/:id
- PUT /students/batch, DELETE /students/batch, GET /students/export
- GET /parents, POST /parents, GET /parents/:id, PUT /parents/:id, DELETE /parents/:id
- PUT /parents/batch, DELETE /parents/batch, GET /parents/export
- GET /teachers, POST /teachers, GET /teachers/:id, PUT /teachers/:id, DELETE /teachers/:id
- PUT /teachers/batch, DELETE /teachers/batch, GET /teachers/export
- GET /classes, POST /classes, GET /classes/:id, PUT /classes/:id, DELETE /classes/:id
- PUT /classes/batch, DELETE /classes/batch, GET /classes/export
- POST /students/:studentId/assign-class
- POST /teachers/:teacherId/assign-class
- POST /parents/:parentId/add-child
- GET /search, GET /students/search, GET /parents/search, GET /teachers/search, GET /classes/search

### 2. dashboard.routes.ts (36个接口缺失)
**文件路径**: `/home/zhgue/localhost:5173/server/src/routes/dashboard.routes.ts`

**缺失接口**:
- GET /overview, GET /statistics, GET /real-time/system-status, GET /stats
- GET /todos, GET /schedule-data, GET /schedules
- GET /principal/stats, GET /principal/customer-pool/stats, GET /principal/customer-pool/list
- GET /notices/stats, GET /notices/important, POST /notices/:id/read
- POST /notices/mark-all-read, DELETE /notices/:id
- GET /schedule, GET /enrollment-trend, GET /classes
- POST /todos, PATCH /todos/:id/status, DELETE /todos/:id
- GET /enrollment-trends, GET /channel-analysis, GET /conversion-funnel
- GET /activities, GET /class-create, GET /class-detail/:id?
- GET /class-list, GET /custom-layout, GET /data-statistics, GET /charts
- GET /kindergarten, GET /campus-overview, GET /statistics/table
- GET /statistics/enrollment-trends, GET /statistics/activity-data

### 3. api.ts (29个接口缺失)
**文件路径**: `/home/zhgue/localhost:5173/server/src/routes/api.ts`

**缺失接口**:
- GET /system/logs, GET /system/logs/:id, DELETE /system/logs/:id
- DELETE /system/logs/batch, GET /system/logs/export
- GET /dashboard/stats, GET /dashboard/todos, POST /dashboard/todos
- PATCH /dashboard/todos/:id/status, DELETE /dashboard/todos/:id
- GET /dashboard/schedule, POST /dashboard/schedule, GET /dashboard/classes
- GET /campus/overview, GET /dashboard/class-detail/:id?, GET /dashboard/data-statistics
- GET /principal/dashboard-stats, GET /principal/activities
- GET /applications, POST /applications, PATCH /applications/:id/status, DELETE /applications/:id
- GET /quotas, POST /quotas, PUT /quotas/:id, DELETE /quotas/:id
- GET /marketing/analysis, GET /marketing/roi, POST /posters/upload

### 4. ai.ts (25个接口缺失)
**文件路径**: `/home/zhgue/localhost:5173/server/src/routes/ai.ts`

**缺失接口**:
- GET /, GET /models/stats, GET /models/default, GET /models, GET /models/:id
- POST /models, PATCH /models/:id, DELETE /models/:id, POST /models/default
- GET /models/:id/capabilities/:capability, GET /models/:id/billing, POST /models/:id/billing
- GET /conversations, POST /conversations, GET /conversations/:id, PUT /conversations/:id
- DELETE /conversations/:id, GET /conversations/:id/messages, POST /conversations/:id/messages
- GET /memories, POST /memories, GET /predictions, POST /agent/dispatch
- POST /generate-activity-image, GET /image-generation-status

## 🔍 中等优先级缺失文档文件

### 5. principal.routes.ts (21个接口缺失)
**文件路径**: `/home/zhgue/localhost:5173/server/src/routes/principal.routes.ts`

**主要缺失接口**:
- 园长仪表板相关: GET /dashboard, GET /campus/overview
- 审批流程: GET /approvals, POST /approvals/:id/:action
- 重要通知: GET /notices/important, POST /notices
- 日程管理: GET /schedule, POST /schedule
- 招生趋势: GET /enrollment/trend
- 客户池管理: GET /customer-pool/stats, GET /customer-pool/list, GET /customer-pool/:id
- 客户分配: POST /customer-pool/assign, POST /customer-pool/batch-assign
- 绩效统计: GET /performance/stats, GET /performance/rankings, GET /performance/details

### 6. six-dimension-memory.routes.ts (20个接口缺失)
**文件路径**: `/home/zhgue/localhost:5173/server/src/routes/six-dimension-memory.routes.ts`

**主要缺失接口**:
- 记忆检索: POST /retrieve, POST /conversation
- 核心记忆: GET /core/:userId?, PUT /core/:userId?
- 情景记忆: GET /episodic, POST /episodic
- 语义记忆: GET /semantic/search, POST /semantic, GET /semantic/:conceptId/related
- 程序记忆: GET /procedural/:procedureName, POST /procedural
- 资源管理: GET /resource/search, POST /resource, PUT /resource/:resourceId/access
- 知识库: GET /knowledge/search, POST /knowledge, PUT /knowledge/:entryId/validate
- 上下文管理: GET /context, POST /compress, GET /stats

### 7. system.routes.ts (20个接口缺失)
**文件路径**: `/home/zhgue/localhost:5173/server/src/routes/system.routes.ts`

**主要缺失接口**:
- 系统信息: GET /, GET /health, GET /docs, GET /info, GET /stats, GET /detail-info
- 测试功能: GET /test/database, GET /test/email, POST /test/email, POST /test/sms
- 文件上传: POST /upload
- 缓存管理: DELETE /cache/clear, POST /cache/clear
- 系统配置: GET /version, GET /logs, GET /configs, POST /configs, PUT /configs/:id
- 用户管理: GET /users, POST /users

## 📋 完整缺失文档清单

按文件路径和缺失数量排序的完整清单：

| 文件名 | 缺失数量 | 主要功能模块 |
|--------|----------|-------------|
| personnel-center.routes.ts | 44 | 人事中心管理 |
| dashboard.routes.ts | 36 | 仪表板统计 |
| api.ts | 29 | 核心API接口 |
| ai.ts | 25 | AI功能模块 |
| principal.routes.ts | 21 | 园长功能 |
| six-dimension-memory.routes.ts | 20 | 六维记忆系统 |
| system.routes.ts | 20 | 系统管理 |
| teacher-dashboard.routes.ts | 20 | 教师仪表板 |
| marketing.routes.ts | 17 | 营销管理 |
| statistics.routes.ts | 16 | 统计分析 |
| student.routes.ts | 16 | 学生管理 |
| websiteAutomation.ts | 16 | 网站自动化 |
| customer-pool.routes.ts | 15 | 客户池管理 |
| teaching-center.routes.ts | 15 | 教学中心 |
| inspection.routes.ts | 14 | 检查管理 |
| admin.routes.ts | 12 | 管理员功能 |
| system-backup.routes.ts | 11 | 系统备份 |
| auth.routes.ts | 10 | 认证授权 |
| files.routes.ts | 10 | 文件管理 |
| notifications.routes.ts | 10 | 通知管理 |
| parent.routes.ts | 10 | 家长管理 |
| permission.routes.ts | 10 | 权限管理 |
| activities.routes.ts | 9 | 活动管理 |
| ai-function-tools.routes.ts | 9 | AI功能工具 |
| ai-unified-intelligence.routes.ts | 9 | AI统一智能 |
| ai-analysis.routes.ts | 9 | AI分析 |
| expert-consultation.ts | 9 | 专家咨询 |
| system-logs.routes.ts | 9 | 系统日志 |
| todos.routes.ts | 9 | 待办事项 |
| activity-evaluation.routes.ts | 8 | 活动评估 |
| ai-analytics.routes.ts | 8 | AI分析统计 |
| ai-smart-expert.routes.ts | 8 | AI智能专家 |
| ai-shortcuts.routes.ts | 8 | AI快捷方式 |
| script-category.routes.ts | 8 | 脚本分类 |
| data-import.routes.ts | 7 | 数据导入 |
| page-guide.routes.ts | 7 | 页面引导 |
| role.routes.ts | 7 | 角色管理 |
| script.routes.ts | 7 | 脚本管理 |
| system-ai-models.routes.ts | 7 | 系统AI模型 |
| task.routes.ts | 7 | 任务管理 |
| activity-template.routes.ts | 6 | 活动模板 |
| ai-assistant-optimized.routes.ts | 6 | AI助手优化 |
| enrollment-statistics.routes.ts | 6 | 招生统计 |
| enrollment.routes.ts | 6 | 招生管理 |
| parent-student-relation.routes.ts | 6 | 家长学生关系 |
| principal-performance.routes.ts | 6 | 园长绩效 |
| role-permission.routes.ts | 6 | 角色权限 |
| schedules.routes.ts | 6 | 日程管理 |
| security.routes.ts | 6 | 安全管理 |
| statistics-adapter.routes.ts | 6 | 统计适配器 |
| teacher-customers.routes.ts | 6 | 教师客户 |
| user-role.routes.ts | 6 | 用户角色 |
| chat.routes.ts | 5 | 聊天功能 |
| document-import.routes.ts | 5 | 文档导入 |
| enrollment-tasks.routes.ts | 5 | 招生任务 |
| kindergarten.routes.ts | 5 | 幼儿园管理 |
| message-templates.routes.ts | 5 | 消息模板 |
| operation-logs.routes.ts | 5 | 操作日志 |
| performance-evaluations.routes.ts | 5 | 绩效评估 |
| performance.routes.ts | 5 | 绩效管理 |
| ai-memory.routes.ts | 4 | AI记忆 |
| ai-model-management.routes.ts | 4 | AI模型管理 |
| ai-user.routes.ts | 4 | AI用户 |
| ai-video.routes.ts | 4 | AI视频 |
| ai-performance.routes.ts | 4 | AI性能 |
| ai-query.routes.ts | 4 | AI查询 |
| ai-stats.routes.ts | 4 | AI统计 |
| auth-permissions.routes.ts | 4 | 认证权限 |
| customer-follow-enhanced.routes.ts | 4 | 客户跟进增强 |
| enrollment-center.routes.ts | 4 | 招生中心 |
| errors.routes.ts | 4 | 错误处理 |
| kindergarten-basic-info.routes.ts | 4 | 幼儿园基本信息 |
| migration.routes.ts | 4 | 数据迁移 |
| page-guide-section.routes.ts | 4 | 页面引导段落 |
| performance-reports.routes.ts | 4 | 绩效报告 |
| permissions.routes.ts | 4 | 权限管理 |
| activity-planner.ts | 3 | 活动策划 |
| ai-knowledge.routes.ts | 3 | AI知识库 |
| ai-smart-assign.routes.ts | 3 | AI智能分配 |
| enrollment-finance.routes.ts | 3 | 招生财务 |
| finance.routes.ts | 3 | 财务管理 |
| followup-analysis.routes.ts | 3 | 跟进分析 |
| marketing-center.routes.ts | 3 | 营销中心 |
| performance-evaluation.routes.ts | 3 | 绩效评估 |
| performance-report.routes.ts | 3 | 绩效报告 |
| setup-permissions.routes.ts | 3 | 权限设置 |
| text-to-speech.routes.ts | 3 | 文本转语音 |
| ai-unified-stream.routes.ts | 2 | AI统一流 |
| business-center.routes.ts | 1 | 商业中心 |
| centers-finance-center.routes.ts | 1 | 财务中心 |
| conversion-tracking.routes.ts | 1 | 转化跟踪 |
| coupons.routes.ts | 1 | 优惠券 |
| customers.routes.ts | 1 | 客户管理 |
| enrollment-ai.routes.ts | 1 | 招生AI |
| enrollment-application.routes.ts | 1 | 招生申请 |
| like-collect-config.routes.ts | 1 | 点赞收集配置 |
| like-collect-records.routes.ts | 1 | 点赞收集记录 |
| page-permissions.routes.ts | 1 | 页面权限 |
| personal-posters.routes.ts | 1 | 个人海报 |
| quick-query-groups.routes.ts | 1 | 快速查询组 |
| referral-codes.routes.ts | 1 | 推荐码 |
| referral-relationships.routes.ts | 1 | 推荐关系 |
| referral-rewards.routes.ts | 1 | 推荐奖励 |
| referral-statistics.routes.ts | 1 | 推荐统计 |
| unified-statistics.routes.ts | 1 | 统一统计 |

## 🎯 建议的修复优先级

### 🔥 紧急修复 (1-2周)
1. **personnel-center.routes.ts** - 人事管理核心功能
2. **dashboard.routes.ts** - 仪表板核心统计
3. **api.ts** - 核心API接口
4. **auth.routes.ts** - 认证授权功能

### ⚡ 高优先级 (2-4周)
5. **ai.ts** - AI功能模块
6. **principal.routes.ts** - 园长功能
7. **system.routes.ts** - 系统管理
8. **student.routes.ts** - 学生管理
9. **teacher-dashboard.routes.ts** - 教师仪表板

### 📈 中等优先级 (1-2个月)
10. **marketing.routes.ts** - 营销管理
11. **statistics.routes.ts** - 统计分析
12. **customer-pool.routes.ts** - 客户池管理
13. **activities.routes.ts** - 活动管理
14. **enrollment.routes.ts** - 招生管理

## 📝 修复建议

1. **按照现有Swagger文档标准格式进行补充**
2. **优先处理核心业务模块的接口**
3. **确保文档包含完整的请求参数、响应格式和错误码**
4. **添加适当的示例和说明**
5. **保持文档风格一致性**

## 📁 相关文件

- **详细JSON报告**: `/home/zhgue/localhost:5173/swagger-missing-report.json`
- **分析脚本**: `/home/zhgue/localhost:5173/analyze-swagger-coverage.js`

---

*报告生成时间: 2025年10月5日*
*扫描文件总数: 184个路由文件*
*分析API端点总数: 1,082个*