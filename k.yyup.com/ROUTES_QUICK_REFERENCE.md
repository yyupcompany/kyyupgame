# 🚀 路由系统快速参考

## 文件位置速查

| 需求 | 位置 |
|------|------|
| 🤖 **AI 路由** | `server/src/routes/ai/` |
| 🔐 **认证权限** | `server/src/routes/auth/` |
| 👤 **用户管理** | `server/src/routes/users/` |
| 📚 **招生管理** | `server/src/routes/enrollment/` |
| 🎯 **活动管理** | `server/src/routes/activity/` |
| 🏫 **教学模块** | `server/src/routes/teaching/` |
| 🏢 **业务模块** | `server/src/routes/business/` |
| 🔧 **系统管理** | `server/src/routes/system/` |
| 🎨 **营销模块** | `server/src/routes/marketing/` |
| 📦 **内容模块** | `server/src/routes/content/` |
| 📊 **其他模块** | `server/src/routes/other/` |
| 📄 **主聚合** | `server/src/routes/index.ts` |

## 常见任务

### ➕ 添加新路由

1. **创建路由文件**
   ```bash
   server/src/routes/new-feature.routes.ts
   ```

2. **在对应模块中注册**
   ```typescript
   // server/src/routes/ai/index.ts
   import newFeatureRoutes from '../new-feature.routes';
   
   router.use('/new-feature', newFeatureRoutes);
   ```

3. **编译和测试**
   ```bash
   npm run build
   npm start
   ```

### 🔧 修改现有路由

1. 修改对应的 `.routes.ts` 文件
2. 如需更改路径，修改模块的 `index.ts`
3. 主 `index.ts` 无需改动

### 🐛 调试路由问题

1. 查看启动日志，确认模块已注册
2. 在模块 `index.ts` 中添加日志
3. 检查路由文件是否存在
4. 检查 import 路径是否正确

## 模块内容速览

### 🤖 AI 模块 (15+ 个)
```
ai-analysis, ai-billing, ai-conversation, ai-query,
ai-knowledge, ai-mock, ai-performance, ai-scoring,
ai-shortcuts, ai-smart-assign, ai-stats, ...
```

### 🔐 认证和权限 (8 个)
```
auth, permissions, roles, user-roles, 
role-permissions, page-permissions, ...
```

### 👤 用户管理 (12+ 个)
```
users, students, teachers, parents, admin,
user-roles, parent-student-relations, ...
```

### 📚 招生管理 (13+ 个)
```
enrollment, enrollment-plans, enrollment-applications,
enrollment-interviews, enrollment-quotas,
enrollment-center, admission-results, ...
```

### 🎯 活动管理 (11+ 个)
```
activities, activity-plans, activity-registrations,
activity-evaluations, activity-posters, progress, ...
```

### 🏫 教学模块 (8+ 个)
```
teaching-center, teacher-dashboard, teacher-customers,
teacher-checkin, interactive-curriculum, ...
```

### 🏢 业务模块 (13+ 个)
```
business-center, finance, customer-pool,
referral-rewards, referral-statistics, ...
```

### 🔧 系统管理 (15+ 个)
```
system, system-logs, security, system-backup,
database, notifications, schedules, ...
```

### 🎨 营销模块 (7+ 个)
```
marketing, marketing-campaigns, advertisements,
channel-tracking, conversion-tracking, ...
```

### 📦 内容模块 (16+ 个)
```
media-center, photo-album, poster-templates,
document-instances, video-creation, ...
```

### 📊 其他模块 (50+ 个)
```
kindergartens, classes, assessment, inspection,
performance, scripts, data-import, ...
```

## 关键数字

| 指标 | 数值 |
|------|------|
| 总路由模块 | 11 |
| 总路由文件 | 230+ |
| 主文件大小 | 14 KB |
| import 语句 | 11 |
| 代码行数 | ~350 |
| 性能提升 | 79% ⭐ |

## 文档位置

- 📖 **完整指南**: `ROUTES_REFACTOR_GUIDE.md`
- 📊 **完成报告**: `ROUTES_REFACTOR_COMPLETION_REPORT.md`
- 📋 **库存清单**: `ROUTES_INVENTORY.md`
- 📝 **文件列表**: `ALL_ROUTES_LIST.txt`

## 启动命令

```bash
# 构建
npm run build

# 启动开发服务器
npm start

# 生产构建
npm run build:prod
```

## 故障排查

| 问题 | 解决方案 |
|------|--------|
| 路由 404 | 检查模块 index.ts 中是否注册 |
| 导入错误 | 检查相对路径是否正确 |
| 编译失败 | 运行 `rm -rf dist && npm run build` |
| 模块未加载 | 查看启动日志中的模块注册信息 |

---

**需要更详细的信息?** 查看 `ROUTES_REFACTOR_GUIDE.md`

**想了解全过程?** 查看 `ROUTES_REFACTOR_COMPLETION_REPORT.md`

**需要完整列表?** 查看 `ALL_ROUTES_LIST.txt`

