# 幼儿园管理系统项目上下文

## 项目概述

这是一个功能完整的幼儿园管理系统，采用前后端分离架构，包含前端Vue3应用和后端Express服务。系统支持招生管理、学生管理、教师管理、活动管理等核心功能，并集成了AI智能助手功能。

### 核心技术栈

- **前端**: Vue 3 + TypeScript + Vite + Pinia + Element Plus + Vant
- **后端**: Node.js + Express + TypeScript + Sequelize + MySQL
- **数据库**: MySQL 8.0+ (主数据库) + Redis (缓存)
- **测试**: Vitest + Playwright + Jest
- **构建工具**: Vite + TypeScript
- **部署**: PM2 + Docker + Nginx

### 项目结构

```
幼儿园管理系统/
├── client/                 # 前端Vue3应用
│   ├── src/
│   │   ├── components/     # 可复用组件
│   │   ├── pages/         # 页面组件
│   │   ├── stores/        # Pinia状态管理
│   │   ├── api/           # API接口
│   │   ├── utils/         # 工具函数
│   │   └── router/        # 路由配置
│   ├── tests/             # 前端测试
│   └── package.json
├── server/                # 后端Express服务
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由配置
│   │   ├── services/      # 业务逻辑
│   │   ├── middlewares/   # 中间件
│   │   └── config/        # 配置文件
│   ├── APItest/           # API测试套件
│   └── package.json
├── tests/                 # E2E测试
├── docs/                  # 项目文档
├── docker-compose.yml     # Docker部署配置
├── ecosystem.config.js    # PM2生产环境配置
├── ecosystem.dev.config.cjs # PM2开发环境配置
└── package.json           # 根项目配置
```

## 构建和运行

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0
- MySQL >= 8.0
- Redis (可选，用于缓存)

### 快速开始

1. **安装依赖**
```bash
npm run install:all
```

2. **配置环境变量**
```bash
cp server/.env.example server/.env
```

3. **数据库初始化**
```bash
npm run db:migrate
npm run seed-data:complete
```

4. **启动开发环境**
```bash
npm run dev
```

### PM2部署

- **开发环境**: `npm run start:pm2`
- **生产环境**: `pm2 start ecosystem.config.js`

## 核心功能

### 管理功能
- 用户管理 (管理员、园长、教师、家长多角色)
- 基于角色的访问控制(RBAC)
- 学生管理 (信息、成长记录、班级分配)
- 教师管理 (档案、课程安排、绩效评估)
- 班级管理 (信息、学生分配、教师安排)

### 招生系统
- 招生计划制定和管理
- 在线报名功能
- 面试安排管理
- 自动化录取通知
- 缴费状态跟踪

### 活动管理
- 活动策划和审批流程
- 报名和参与统计
- 活动效果评估
- 资源分配和使用

### AI智能功能
- AI驱动的管理助手
- 智能数据分析和报告
- 个性化推荐
- 自动化业务流程

### 数据统计
- 招生数据分析和趋势
- 学生成长数据分析
- 财务统计和报表
- 活动参与度分析

## 开发约定

### 代码规范
- 使用TypeScript进行类型安全开发
- 遵循ESLint和Prettier代码规范
- 使用语义化提交信息

### 测试策略
- 单元测试 (Vitest/Jest)
- 集成测试 (Supertest)
- E2E测试 (Playwright)
- API测试 (Swagger集成)

### 数据库管理
- 使用Sequelize ORM进行数据库操作
- 支持多租户数据库架构
- 提供数据迁移和种子脚本

## 部署配置

### 生产环境配置
- 使用PM2进行进程管理
- Nginx作为反向代理
- 支持Docker容器化部署
- 配置了生产环境的环境变量

### 环境变量
- 数据库连接配置
- JWT密钥配置
- API端点配置
- 第三方服务集成配置

## 特殊说明

该项目包含大量测试文件、自动化脚本和多种部署配置，支持多环境部署（开发、测试、生产）。系统具有完整的权限管理、多租户支持和AI集成功能。