# AGENTS.md

This file provides guidance to Qoder (qoder.com) when working with code in this repository.

**请使用中文回复。Please respond in Chinese.**

## 项目概览

幼儿园管理系统，Vue 3 + Express.js全栈架构，支持多租户、动态权限系统、AI集成。

**规模**: 80+Vue组件，162+页面，155+API端点，73+数据模型，95+权限记录，~150k行代码
**域名**: `http://localhost:5173` (前端)，`http://localhost:3000` (后端API)

## 系统架构

### 统一租户管理架构

项目采用**统一租户管理架构**，包含两个独立系统：

1. **统一租户管理中心** (`/home/zhgue/kyyupgame/unified-tenant-system/`)
   - 功能：租户账号创建、查看、删除、统计
   - 管理对象：租户账号、OSS空间分配、域名绑定
   - 域名：`rent.yyup.cc`

2. **租户业务系统** (`/home/zhgue/kyyupgame/k.yyup.com/`) - **当前项目**
   - 功能：独立的幼儿园管理系统
   - 管理对象：文本、图片、多媒体文件、业务数据
   - 域名：`k.yyup.cc`

### 技术栈

**前端** (`client/`): Vue 3 + TypeScript + Vite + Element Plus + Pinia
- 动态权限路由、RBAC访问控制、响应式设计
- 测试：Vitest + Playwright (必须使用无头模式)

**后端** (`server/`): Express.js + TypeScript + Sequelize + MySQL
- JWT认证、RBAC权限、API验证
- Controller-Service-Model模式
- API文档：http://localhost:3000/api-docs (Swagger)

## 常用命令

### 项目启动

```bash
# 推荐：并发启动前后端（推荐）
npm run start:all

# 分别启动
npm run start:frontend      # 前端 (5173端口)
npm run start:backend       # 后端 (3000端口)

# 快速启动（绕过初始化）
npm run dev:quick

# 检查服务状态
npm run status

# 停止所有服务
npm run stop
```

### 数据库管理

```bash
# 完整初始化数据库和测试数据
npm run seed-data:complete

# 运行所有种子数据脚本
npm run seed-data:all

# 数据库迁移（在server目录下）
cd server && npx sequelize-cli db:migrate

# 数据库性能诊断
npm run db:diagnose

# 数据库性能优化
npm run db:optimize

# 监控慢查询
npm run db:slow-queries
```

### 测试

```bash
# 运行所有测试
npm test

# 单元测试
npm run test:unit              # 前端+后端单元测试
npm run test:unit:backend      # 后端单元测试
npm run test:unit:frontend     # 前端单元测试

# 集成测试
npm run test:integration

# E2E测试（必须无头模式）
npm run test:e2e

# API测试
npm run test:api
npm run test:apitest

# 测试覆盖率
npm run test:coverage
npm run coverage:monitor

# AI助手测试
npm run test:ai-assistant
npm run test:smart-agent
```

### 构建和验证

```bash
# 生产构建
npm run build

# 代码验证（TypeScript + ESLint + 单元测试）
npm run validate

# 完整质量检查
npm run quality:check

# TypeScript类型检查
npm run typecheck

# 代码风格检查
npm run lint
```

### 清理

```bash
# 清理构建文件
npm run clean

# 清理所有依赖和构建文件
npm run clean:all
```

## 核心架构说明

### 动态路由权限系统

**三级权限层次**: 一级类目(9个) → 二级页面(74个) → 三级组件(2个)

**核心文件**:
- `client/src/router/index.ts` - 路由入口
- `client/src/router/dynamic-routes.ts` - 1300+行核心路由生成器
- `client/src/router/optimized-routes.ts` - 优化路由

**权限API**:
```typescript
GET /api/dynamic-permissions/dynamic-routes
GET /api/dynamic-permissions/user-permissions
POST /api/dynamic-permissions/check-permission
```

**工作流程**:
1. 调用权限API获取用户权限
2. 转换为路由树结构
3. 组件映射（160+预定义映射）
4. 动态注册路由
5. 导航守卫验证权限

### 数据库模型系统

**模型总数**: 73+数据模型，覆盖所有业务领域

**关键关系**:
- 用户: User ↔ Role ↔ Permission (多对多)
- 教育: Student ↔ Class ↔ Teacher
- 招生: Application → Interview → Admission
- 活动: Activity → Registration → Evaluation

**模型管理**:
- 模型定义：`server/src/models/`
- 关联管理：`server/src/models/index.ts` 统一管理模型和关联
- 迁移文件：`server/src/migrations/`
- Sequelize ORM：完整的迁移和种子数据系统

### API架构

**端点分类** (`client/src/api/endpoints/`):
- `auth.ts` - 认证 (login/logout/refresh)
- `user.ts` - 用户管理
- `teacher.ts` - 教师管理
- `student.ts` - 学生管理
- `class.ts` - 班级管理
- `activity.ts` - 活动管理
- `enrollment.ts` - 招生管理
- `dashboard.ts` - 仪表板统计

**API客户端**: `@/utils/request` - 统一HTTP客户端
**响应格式**: `ApiResponse<T>` - 统一接口模式
**错误处理**: `ErrorHandler` 类集中处理

### AI集成架构

**记忆系统**: 六维记忆模型，向量相似性搜索
**模型管理**: 可配置AI模型，支持多提供商
**服务层**: `/api/ai`, `/api/ai-query`
**MCP集成**: 支持Model Context Protocol，配置Playwright浏览器自动化
**智能代理**: 工具链执行，支持活动方案生成和工作流执行

## 开发工作流

### 添加新功能

1. **数据库**: 创建模型和迁移文件
   - 模型：`server/src/models/`
   - 迁移：`server/src/migrations/`

2. **后端**: 添加控制器、服务、路由
   - 控制器：`server/src/controllers/`
   - 服务：`server/src/services/`
   - 路由：`server/src/routes/`

3. **前端**: 创建页面组件和API调用
   - 页面：`client/src/pages/`
   - API：`client/src/api/`

4. **权限**: 在动态权限系统中配置权限
   - 配置：`server/src/controllers/dynamic-permissions.ts`

5. **测试**: 编写单元测试和集成测试

6. **验证**: 运行 `npm run validate` 确保代码质量

### 调试权限问题

1. 检查 `/api/dynamic-permissions/user-permissions` 接口
2. 验证路由权限配置
3. 查看 `client/src/router/dynamic-routes.ts` 中的组件映射
4. 使用浏览器开发者工具检查路由生成过程

### 数据库初始化问题

**重要提示**:
- ⚠️ 数据初始化使用**静态导入**方式
- ⚠️ 修改初始化代码时要谨慎，避免引起新的错误
- ✅ 遇到数据初始化问题时，先运行 `npm run seed-data:complete`

## 测试规范

### 测试覆盖率要求

| 组件 | 语句覆盖率 | 分支覆盖率 | 函数覆盖率 | 行覆盖率 |
|------|------------|------------|------------|----------|
| 客户端 | ≥85% | ≥80% | ≥85% | ≥85% |
| 服务端 | ≥95% | ≥90% | ≥95% | ≥95% |
| 全局 | ≥90% | ≥85% | ≥90% | ≥90% |

### Playwright无头浏览器配置

**重要**: 所有Playwright测试必须使用无头浏览器模式

**配置文件**:
- `client/playwright.config.ts` - 主配置文件
- `client/playwright.config.chromium.ts` - Chromium配置

**强制要求**:
```typescript
// ✅ 正确
const browser = await chromium.launch({
  headless: true,
  devtools: false
});

// ❌ 错误
const browser = await chromium.launch({
  headless: false,  // 不允许
  devtools: true    // 不允许
});
```

### 严格测试验证规则

**强制执行**: 编写或修复API测试用例时，必须遵循严格验证标准

详见：`.augment/rules/STRICT_TEST_VALIDATION.md`

**核心要求**:
1. ✅ 数据结构验证 - 验证API返回的数据格式
2. ✅ 字段类型验证 - 验证所有字段的数据类型
3. ✅ 必填字段验证 - 验证所有必填字段存在
4. ✅ 控制台错误检测 - 捕获所有控制台错误

**禁止**: 只使用 `expect(result).toEqual(mockResponse)` 的浅层验证

**必须**: 使用 `validateRequiredFields`, `validateFieldTypes` 等工具进行严格验证

## 已知问题

### API端点重复问题

项目存在API端点重复定义问题，已检测出221个潜在冲突，其中42个严重重复。

**检测工具**:
```bash
node scripts/api-endpoint-duplicate-scanner.js
```

**重复端点**:
- `/tasks` - 任务相关API
- `/classes` - 班级管理API
- `/activities` - 活动相关API
- `/system/settings` - 系统设置API

**详细报告**:
- `API_ENDPOINT_DUPLICATE_REPORT.md` - 详细检测报告
- `API_DUPLICATE_ANALYSIS_SUMMARY.md` - 问题分析和修复建议

## 命名约定

- **组件**: PascalCase - `StudentEditDialog.vue`
- **页面**: kebab-case - `student-management.vue`
- **API**: `/api/resource` (集合), `/api/resource/:id` (单项)
- **数据库**: snake_case表名, camelCase属性

## 开发原则

### API开发
- 使用 `@/utils/request` 进行调用
- 遵循 `ApiResponse<T>` 模式
- `ErrorHandler` 类集中错误处理

### 数据库
- Sequelize ORM管理架构变更
- TypeScript接口强类型
- 开发前运行 `npm run seed-data:complete` 初始化数据
- 模型关联在 `server/src/models/index.ts` 中统一管理

### 权限
- 导航守卫权限验证
- 中间件权限检查
- 数据库驱动路由生成

### 性能
- 前端: 代码分割、懒加载
- 后端: 连接池、索引优化
- 监控: `npm run db:diagnose` 数据库性能诊断

## 故障排除

### 数据库连接失败
```bash
cat server/.env
cd server && npm run db:migrate
```

### 端口占用问题
```bash
lsof -i :3000
lsof -i :5173
npm run clean
```

### 依赖安装失败
```bash
npm run clean:all
npm run install:all
```

### 服务启动失败
```bash
npm run status
npm run stop
npm run start:all
cd client && npm run dev:cross  # 跨平台端口清理
```

### Playwright测试失败
```bash
# 检查是否使用了有头浏览器
grep -r "headless.*false" client/

# 确保所有配置都是 headless: true
grep -r "headless:" client/playwright.config.ts
grep -r "headless:" client/tests/

# 运行E2E测试
npm run test:e2e
```

## 系统要求

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **MySQL**: >= 8.0
- **操作系统**: Linux, macOS, Windows
- **浏览器**: Chrome, Firefox, Safari (用于E2E测试)
- **内存**: 建议 >= 8GB (用于AI功能和大型数据集)

## Git工作流程

- **主分支**: `master` - 用于创建PR和生产部署
- **开发分支**: 基于功能创建分支，完成后向master提交PR
- **提交规范**: 使用语义化提交信息

## CI/CD配置

**工作流文件**:
- `.github/workflows/ci-cd.yml` - 主要CI/CD流水线
- `.github/workflows/test.yml` - 测试流水线

**质量门控**:
- ✅ TypeScript类型检查
- ✅ ESLint代码检查
- ✅ 所有测试通过
- ✅ 测试覆盖率达到阈值
- ✅ 安全漏洞扫描
- ✅ 构建成功

**完整CI脚本**:
```bash
npm run ci:full  # 安装+验证+测试+构建
```
