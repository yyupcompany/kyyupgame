# 幼儿园管理系统 - 快速启动指南

本指南帮助新开发者快速搭建开发环境并启动项目。

---

## 📋 目录

- [系统要求](#系统要求)
- [快速安装](#快速安装)
- [启动项目](#启动项目)
- [验证安装](#验证安装)
- [常见问题](#常见问题)
- [下一步](#下一步)

---

## 💻 系统要求

### 必需软件
- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **MySQL**: >= 8.0
- **Git**: 最新版本

### 推荐软件
- **VS Code**: 推荐的IDE
- **Postman**: API测试工具
- **MySQL Workbench**: 数据库管理工具

### 操作系统
- Linux (推荐)
- macOS
- Windows (需要WSL2)

---

## 🚀 快速安装

### 1. 克隆项目

```bash
# 克隆仓库
git clone https://github.com/yyupcompany/k.yyup.com.git
cd k.yyup.com

# 切换到开发分支
git checkout AIupgrade
```

### 2. 配置环境变量

#### 后端环境变量

```bash
# 复制环境变量模板
cd server
cp .env.example .env

# 编辑 .env 文件
nano .env
```

**必需配置**:
```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=kindergarten_db
DB_USER=root
DB_PASSWORD=your_password

# JWT配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=3000
NODE_ENV=development
```

#### 前端环境变量

```bash
# 复制环境变量模板
cd ../client
cp .env.example .env

# 编辑 .env 文件
nano .env
```

**必需配置**:
```env
# API地址
VITE_API_BASE_URL=http://localhost:3000/api

# 应用配置
VITE_APP_TITLE=幼儿园管理系统
```

### 3. 安装依赖

```bash
# 返回项目根目录
cd ..

# 安装所有依赖（前端+后端）
npm run install:all

# 或者分别安装
cd client && npm install
cd ../server && npm install
```

### 4. 初始化数据库

```bash
# 进入后端目录
cd server

# 运行数据库迁移
npx sequelize-cli db:migrate

# 运行种子数据（可选）
npm run seed-data:complete
```

---

## 🎯 启动项目

### 方式1: 同时启动前后端（推荐）

```bash
# 在项目根目录
npm run start:all
```

这将同时启动：
- 前端开发服务器 (http://localhost:5173:5173)
- 后端API服务器 (http://localhost:3000)

### 方式2: 分别启动

**启动后端**:
```bash
cd server
npm run dev
```

**启动前端**（新终端）:
```bash
cd client
npm run dev
```

### 方式3: 使用根目录命令

```bash
# 启动前端
npm run start:frontend

# 启动后端
npm run start:backend
```

---

## ✅ 验证安装

### 1. 检查服务状态

```bash
# 检查所有服务状态
npm run status
```

**预期输出**:
```
✅ 前端服务运行中 (PID: xxxxx)
✅ 后端服务运行中 (PID: xxxxx)
```

### 2. 访问应用

**前端应用**:
- URL: http://localhost:5173:5173
- 或: http://localhost:5173

**后端API**:
- URL: http://localhost:3000
- Swagger文档: http://localhost:3000/api-docs

### 3. 测试登录

**默认管理员账号**:
```
用户名: admin
密码: admin123
```

### 4. 运行测试

```bash
# 运行所有测试
npm test

# 运行前端测试
cd client && npm test

# 运行后端测试
cd server && npm test
```

---

## 🔧 常见问题

### 问题1: 端口被占用

**错误信息**:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案**:
```bash
# 查找占用端口的进程
lsof -i :3000
lsof -i :5173

# 杀死进程
kill -9 <PID>

# 或使用项目命令
npm run stop
```

### 问题2: 数据库连接失败

**错误信息**:
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**解决方案**:
1. 检查MySQL是否运行
```bash
# Linux/Mac
sudo systemctl status mysql

# 启动MySQL
sudo systemctl start mysql
```

2. 检查数据库配置
```bash
# 编辑 server/.env
nano server/.env

# 确认以下配置正确
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
```

3. 测试数据库连接
```bash
mysql -u root -p
```

### 问题3: 依赖安装失败

**错误信息**:
```
npm ERR! code ERESOLVE
```

**解决方案**:
```bash
# 清理缓存
npm run clean:all

# 重新安装
npm run install:all

# 如果还是失败，使用强制安装
cd client && npm install --legacy-peer-deps
cd ../server && npm install --legacy-peer-deps
```

### 问题4: 前端无法访问后端API

**错误信息**:
```
Network Error
```

**解决方案**:
1. 检查后端是否运行
```bash
curl http://localhost:3000/api/health
```

2. 检查前端API配置
```bash
# 编辑 client/.env
nano client/.env

# 确认配置正确
VITE_API_BASE_URL=http://localhost:3000/api
```

3. 检查CORS配置
```bash
# 编辑 server/src/app.ts
# 确认CORS配置允许前端域名
```

### 问题5: 热重载不工作

**解决方案**:
```bash
# 重启开发服务器
npm run stop
npm run start:all

# 或清理缓存后重启
npm run clean
npm run start:all
```

---

## 📚 下一步

### 1. 阅读文档

**核心文档**:
- [项目最终总结](./Project-Final-Summary.md)
- [AI Operator README](../server/src/services/ai-operator/README.md)
- [AI Operator 使用示例](../server/src/services/ai-operator/EXAMPLES.md)

**Phase文档**:
- [Phase 1 完成报告](./Phase1-Complete-Report.md)
- [Phase 2 完成报告](./Phase2-Final-Completion-Report.md)
- [Phase 3 规划提案](./Phase3-Planning-Proposal.md)

### 2. 了解架构

**前端架构**:
- Vue 3 + TypeScript + Vite
- Element Plus UI组件库
- Pinia状态管理
- 动态路由权限系统

**后端架构**:
- Express.js + TypeScript
- Sequelize ORM + MySQL
- JWT认证
- RBAC权限系统

**AI服务架构**:
- 10个独立服务
- 完整监控体系
- 统一错误处理
- 性能优化

### 3. 开发工作流

```bash
# 1. 创建新分支
git checkout -b feature/your-feature

# 2. 开发功能
# 编辑代码...

# 3. 运行测试
npm test

# 4. 提交代码
git add .
git commit -m "feat: your feature description"

# 5. 推送到远程
git push origin feature/your-feature

# 6. 创建Pull Request
```

### 4. 常用命令

```bash
# 开发
npm run start:all          # 启动所有服务
npm run dev                # 开发模式
npm run status             # 检查服务状态
npm run stop               # 停止所有服务

# 测试
npm test                   # 运行所有测试
npm run test:unit          # 单元测试
npm run test:integration   # 集成测试
npm run test:e2e          # E2E测试

# 构建
npm run build              # 生产构建
npm run validate           # 代码验证

# 数据库
npm run seed-data:complete # 初始化数据
npm run db:diagnose        # 数据库诊断
npm run db:optimize        # 数据库优化

# 清理
npm run clean              # 清理构建文件
npm run clean:all          # 清理所有
```

### 5. 推荐工具

**VS Code扩展**:
- Vue Language Features (Volar)
- TypeScript Vue Plugin (Volar)
- ESLint
- Prettier
- GitLens

**Chrome扩展**:
- Vue.js devtools
- React Developer Tools

---

## 🆘 获取帮助

### 文档资源
- [项目README](../README.md)
- [API文档](http://localhost:3000/api-docs)
- [技术白皮书](./技术白皮书.md)

### 联系方式
- GitHub Issues: https://github.com/yyupcompany/k.yyup.com/issues
- 项目Wiki: https://github.com/yyupcompany/k.yyup.com/wiki

---

## 📝 检查清单

安装完成后，请确认以下项目：

- [ ] Node.js版本 >= 18.0.0
- [ ] MySQL已安装并运行
- [ ] 环境变量已配置
- [ ] 依赖已安装
- [ ] 数据库已初始化
- [ ] 前端服务可访问 (http://localhost:5173:5173)
- [ ] 后端服务可访问 (http://localhost:3000)
- [ ] 可以登录系统
- [ ] 测试通过

---

**最后更新**: 2025-10-05  
**版本**: 2.0.0  
**状态**: ✅ 生产就绪

