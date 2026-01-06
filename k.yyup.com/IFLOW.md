# 幼儿园管理系统 - iFlow上下文

## 项目概述

这是一个功能完整的幼儿园管理系统，采用前后端分离架构，包含前端Vue3应用和后端Express服务。系统支持招生管理、学生管理、教师管理、活动管理等核心功能，并集成了AI智能助手功能。

### 技术栈

**前端技术**
- Vue 3 (渐进式JavaScript框架)
- TypeScript (类型安全的JavaScript)
- Vite (快速的前端构建工具)
- Pinia (Vue状态管理)
- Vue Router (前端路由)
- Element Plus (UI组件库)
- Vitest (前端测试框架)
- Playwright (E2E测试)

**后端技术**
- Node.js (JavaScript运行时)
- Express (Web应用框架)
- TypeScript (类型安全的JavaScript)
- Sequelize (ORM数据库工具)
- MySQL (关系型数据库)
- JWT (身份验证)
- Jest (后端测试框架)
- Swagger (API文档)

## 项目结构

```
幼儿园管理系统/
├── client/                 # 前端Vue3应用
│   ├── src/
│   │   ├── components/     # 可复用组件
│   │   ├── pages/          # 页面组件
│   │   ├── stores/         # Pinia状态管理
│   │   ├── api/            # API接口
│   │   ├── utils/          # 工具函数
│   │   └── router/         # 路由配置
│   ├── tests/              # 前端测试
│   └── package.json
├── server/                 # 后端Express服务
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # 路由配置
│   │   ├── services/       # 业务逻辑
│   │   ├── middlewares/    # 中间件
│   │   └── config/         # 配置文件
│   ├── APItest/            # API测试套件
│   └── package.json
├── tests/                  # E2E测试
├── docs/                   # 项目文档
├── .github/
│   └── workflows/          # CI/CD配置
└── package.json            # 根项目配置
```

## 构建和运行

### 系统要求
- Node.js: >= 18.0.0
- npm: >= 8.0.0
- MySQL: >= 8.0
- 操作系统: Linux, macOS, Windows

### 环境准备
1. 克隆项目
   ```bash
   git clone https://github.com/szblade3944/lazy-ai-substitute-project.git
   cd lazy-ai-substitute-project
   ```

2. 安装依赖
   ```bash
   # 安装所有依赖
   npm run install:all

   # 或者分别安装
   npm run install:server
   npm run install:client
   ```

3. 配置环境变量
   ```bash
   # 复制环境变量模板
   cp server/.env.example server/.env

   # 编辑环境变量文件
   nano server/.env
   ```

4. 数据库初始化
   ```bash
   # 运行数据库迁移
   npm run db:migrate

   # 填充测试数据
   npm run seed-data:complete
   ```

### 运行项目

#### 开发模式
```bash
# 同时启动前端和后端
npm run dev

# 分别启动
npm run dev:backend    # 后端服务 - http://localhost:3000
npm run dev:frontend   # 前端服务 - http://localhost:5173

# 快速启动模式 (绕过复杂初始化)
npm run dev:quick
```

#### 生产模式
```bash
# 构建项目
npm run build

# 启动生产服务
npm start
```

## 测试

### 运行所有测试
```bash
npm test                   # 运行所有测试
npm run test:unit          # 单元测试
npm run test:integration   # 集成测试
npm run test:e2e           # E2E测试
npm run test:coverage      # 测试覆盖率
```

### API测试
```bash
npm run test:api                    # 运行所有API测试
npm run test:api:unit              # API单元测试
npm run test:api:integration       # API集成测试
npm run test:api:comprehensive     # 全面API测试
npm run test:api:coverage         # API测试覆盖率
```

### 前端测试
```bash
cd client
npm run test                # Vitest测试
npm run test:e2e           # Playwright E2E测试
npm run test:e2e:headed    # 带界面的E2E测试
npm run test:coverage      # 测试覆盖率
```

### 后端测试
```bash
cd server
npm test                   # Jest测试
npm run test:unit         # 单元测试
npm run test:integration  # 集成测试
npm run test:coverage     # 测试覆盖率
```

## 核心功能

### 管理功能
- 用户管理: 支持管理员、园长、教师、家长等多角色
- 权限控制: 基于角色的访问控制(RBAC)
- 学生管理: 学生信息、成长记录、班级分配
- 教师管理: 教师档案、课程安排、绩效评估
- 班级管理: 班级信息、学生分配、教师安排

### 招生系统
- 招生计划: 年度招生计划制定和管理
- 在线报名: 家长在线填写报名信息
- 面试安排: 面试时间安排和管理
- 录取通知: 自动化录取通知发送
- 缴费管理: 学费缴费状态跟踪

### 活动管理
- 活动策划: 活动创建、审批流程
- 报名管理: 活动报名和参与统计
- 活动评估: 活动效果评估和反馈
- 资源管理: 活动资源分配和使用

### AI智能功能
- 智能助手: AI驱动的管理助手
- 数据分析: 智能数据分析和报告
- 个性化推荐: 基于数据的个性化建议
- 自动化流程: 智能化的业务流程

### 数据统计
- 招生统计: 招生数据分析和趋势
- 学生统计: 学生成长数据分析
- 财务统计: 收支统计和财务报表
- 活动统计: 活动参与度和效果分析

## API文档

启动后端服务后，可以访问以下地址查看API文档：

- Swagger UI: http://localhost:3000/api-docs
- API JSON: http://localhost:3000/api-docs.json

### 主要API端点

#### 认证相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/profile` - 获取用户信息

#### 用户管理
- `GET /api/users` - 获取用户列表
- `POST /api/users` - 创建用户
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户

#### 学生管理
- `GET /api/students` - 获取学生列表
- `POST /api/students` - 添加学生
- `GET /api/students/:id` - 获取学生详情
- `PUT /api/students/:id` - 更新学生信息

#### 教师管理
- `GET /api/teachers` - 获取教师列表
- `POST /api/teachers` - 添加教师
- `GET /api/teachers/:id` - 获取教师详情

#### 活动管理
- `GET /api/activities` - 获取活动列表
- `POST /api/activities` - 创建活动
- `GET /api/activities/:id` - 获取活动详情

## 开发约定

### 代码质量
- 使用TypeScript进行类型检查
- 遵循ESLint代码规范
- 使用Prettier进行代码格式化
- 编写单元测试和集成测试

### Git工作流
- 使用语义化提交信息
- 通过GitHub Actions进行CI/CD
- Pull Request审查机制

### 前端开发
- 使用Vue 3 Composition API
- 状态管理采用Pinia
- 路由使用Vue Router
- UI组件使用Element Plus

### 后端开发
- 使用Express框架
- 数据库操作采用Sequelize ORM
- 身份验证使用JWT
- API文档使用Swagger

## 故障排除

### 常见问题

#### 1. 数据库连接失败
```bash
# 检查数据库配置
cat server/.env

# 测试数据库连接
cd server && npm run db:migrate
```

#### 2. 端口占用
```bash
# 检查端口占用
lsof -i :3000
lsof -i :5173

# 杀死占用进程
npm run clean
```

#### 3. 依赖安装失败
```bash
# 清理并重新安装
npm run clean:all
npm run install:all
```

#### 4. 服务启动失败
```bash
# 使用快速启动模式
cd server && npm run quick-start

# 查看详细错误日志
cd server && npm run dev
```