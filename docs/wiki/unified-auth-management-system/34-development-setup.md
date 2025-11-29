# 开发环境搭建

## 🚀 快速开始

本文档将指导您快速搭建统一认证管理系统的本地开发环境，包括后端、前端、数据库等完整开发栈的配置。

### 系统要求

| 环境 | 最低要求 | 推荐配置 |
|------|---------|----------|
| **操作系统** | Windows 10 / macOS 10.15 / Ubuntu 20.04 | Windows 11 / macOS 13 / Ubuntu 22.04 |
| **CPU** | 2核心 | 4核心或更多 |
| **内存** | 8GB | 16GB或更多 |
| **存储** | 20GB可用空间 | 50GB或更多 |
| **网络** | 稳定的互联网连接 | 稳定的互联网连接 |

## 🛠️ 必需软件安装

### 1. Node.js

```bash
# 使用nvm安装Node.js（推荐）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# 验证安装
node --version  # v18.x.x
npm --version   # 9.x.x
```

### 2. PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (使用Homebrew)
brew install postgresql
brew services start postgresql

# Windows
# 下载并安装 PostgreSQL 官方安装包

# 验证安装
psql --version
```

### 3. Redis

```bash
# Ubuntu/Debian
sudo apt install redis-server

# macOS (使用Homebrew)
brew install redis
brew services start redis

# Windows
# 下载并安装 Redis for Windows

# 验证安装
redis-cli ping  # 应该返回 PONG
```

### 4. Docker (可选)

```bash
# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

## 📁 项目克隆与初始化

### 1. 克隆项目

```bash
# 克隆项目仓库
git clone https://github.com/your-org/unified-auth-management.git
cd unified-auth-management

# 查看项目结构
ls -la
```

### 2. 项目结构概览

```
unified-auth-management/
├── k.yyup.com/                # 后端项目
├── client/                    # 前端项目
├── docker/                    # Docker配置
├── docs/                      # 项目文档
├── scripts/                   # 脚本文件
├── .env.example              # 环境变量示例
└── README.md                 # 项目说明
```

## 🔧 后端开发环境

### 1. 进入后端目录

```bash
cd k.yyup.com
```

### 2. 安装依赖

```bash
# 安装npm依赖
npm install

# 或使用yarn
yarn install
```

### 3. 环境配置

```bash
# 复制环境变量文件
cp .env.example .env

# 编辑环境变量
vim .env
```

#### .env 配置示例

```env
# 应用配置
NODE_ENV=development
PORT=8000
API_PREFIX=/api/v1

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=auth_system_dev

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT配置
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# 文件存储配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# 邮件配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# 日志配置
LOG_LEVEL=debug
LOG_FILE=./logs/app.log

# 开发配置
CORS_ORIGIN=http://localhost:3000
SWAGGER_ENABLED=true
```

### 4. 数据库初始化

```bash
# 创建数据库
sudo -u postgres createdb auth_system_dev

# 运行数据库迁移
npm run migration:run

# 填充初始数据
npm run seed:run
```

### 5. 启动后端服务

```bash
# 开发模式启动
npm run dev

# 或使用nodemon
npm run start:dev

# 验证服务启动
curl http://localhost:8000/api/v1/health
```

## 🎨 前端开发环境

### 1. 进入前端目录

```bash
cd ../client
```

### 2. 安装依赖

```bash
# 安装npm依赖
npm install

# 或使用yarn
yarn install
```

### 3. 环境配置

```bash
# 复制环境变量文件
cp .env.example .env.local

# 编辑环境变量
vim .env.local
```

#### .env.local 配置示例

```env
# API配置
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_TITLE=统一认证管理系统

# 上传配置
VITE_UPLOAD_URL=http://localhost:8000/api/v1/files/upload

# 第三方配置
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_WECHAT_APP_ID=your-wechat-app-id

# 功能开关
VITE_ENABLE_MOCK=false
VITE_ENABLE_PWA=true
VITE_ENABLE_I18N=true

# 开发配置
VITE_DEV_PROXY=true
VITE_DEV_TOOLS=true
```

### 4. 启动前端服务

```bash
# 开发模式启动
npm run dev

# 验证服务启动
# 浏览器访问 http://localhost:3000
```

## 🐳 Docker开发环境（推荐）

使用Docker Compose可以快速搭建完整的开发环境：

### 1. Docker Compose配置

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  # PostgreSQL数据库
  postgres:
    image: postgres:15
    container_name: auth_postgres_dev
    environment:
      POSTGRES_DB: auth_system_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - auth_network

  # Redis缓存
  redis:
    image: redis:7-alpine
    container_name: auth_redis_dev
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - auth_network

  # 后端服务
  backend:
    build:
      context: ./k.yyup.com
      dockerfile: Dockerfile.dev
    container_name: auth_backend_dev
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
      - REDIS_HOST=redis
    volumes:
      - ./k.yyup.com:/app
      - /app/node_modules
    depends_on:
      - postgres
      - redis
    networks:
      - auth_network

  # 前端服务
  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile.dev
    container_name: auth_frontend_dev
    ports:
      - "3000:3000"
    environment:
      - VITE_API_BASE_URL=http://localhost:8000/api/v1
    volumes:
      - ./client:/app
      - /app/node_modules
    depends_on:
      - backend
    networks:
      - auth_network

volumes:
  postgres_data:
  redis_data:

networks:
  auth_network:
    driver: bridge
```

### 2. 启动Docker环境

```bash
# 启动所有服务
docker-compose -f docker-compose.dev.yml up -d

# 查看服务状态
docker-compose -f docker-compose.dev.yml ps

# 查看日志
docker-compose -f docker-compose.dev.yml logs -f

# 停止服务
docker-compose -f docker-compose.dev.yml down
```

## 🔧 开发工具配置

### 1. VS Code配置

#### 推荐扩展

```json
// .vscode/extensions.json
{
  "recommendations": [
    "vue.volar",
    "vue.vscode-typescript-vue-plugin",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

#### 工作区设置

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "vue": "html"
  },
  "files.associations": {
    "*.vue": "vue"
  },
  "eslint.workingDirectories": [
    "./k.yyup.com",
    "./client"
  ]
}
```

### 2. Git配置

```bash
# 配置Git用户信息
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 配置Git换行符
git config --global core.autocrlf input  # Linux/macOS
git config --global core.autocrlf true   # Windows

# 配置默认分支名
git config --global init.defaultBranch main
```

### 3. 代码格式化配置

#### Prettier配置

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "none",
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

#### ESLint配置

```json
// .eslintrc.json
{
  "extends": [
    "@vue/typescript/recommended",
    "plugin:vue/vue3-recommended",
    "prettier"
  ],
  "rules": {
    "vue/multi-word-component-names": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "no-console": "warn"
  }
}
```

## 🧪 测试环境配置

### 1. 后端测试配置

```bash
# 进入后端目录
cd k.yyup.com

# 安装测试依赖
npm install --save-dev @nestjs/testing jest supertest

# 配置测试数据库
export DB_DATABASE=auth_system_test

# 运行测试
npm run test

# 运行测试覆盖率
npm run test:cov
```

### 2. 前端测试配置

```bash
# 进入前端目录
cd client

# 安装测试依赖
npm install --save-dev vitest @vue/test-utils jsdom

# 运行测试
npm run test

# 运行测试覆盖率
npm run test:coverage
```

## 📝 开发工作流

### 1. 创建功能分支

```bash
# 创建并切换到功能分支
git checkout -b feature/user-management

# 提交代码
git add .
git commit -m "feat: add user management module"

# 推送分支
git push origin feature/user-management
```

### 2. 代码提交规范

```bash
# 提交消息格式
<type>(<scope>): <description>

# 示例
feat(auth): add OAuth login functionality
fix(user): resolve password validation issue
docs(api): update authentication endpoints
style(ui): improve button component styling
refactor(db): optimize user query performance
test(auth): add unit tests for login service
chore(deps): update dependencies
```

### 3. 代码审查流程

1. 创建Pull Request
2. 代码审查
3. 自动化测试
4. 合并到主分支

## 🔍 常用开发命令

### 后端命令

```bash
# 开发
npm run dev                    # 启动开发服务器
npm run start:prod            # 启动生产服务器
npm run build                 # 构建应用

# 数据库
npm run migration:run         # 运行迁移
npm run migration:revert      # 回滚迁移
npm run migration:generate    # 生成迁移文件
npm run seed:run              # 填充测试数据

# 测试
npm run test                  # 运行测试
npm run test:e2e             # 运行端到端测试
npm run test:cov             # 生成测试覆盖率报告

# 代码质量
npm run lint                  # 代码检查
npm run lint:fix              # 自动修复代码问题
npm run format                # 格式化代码
```

### 前端命令

```bash
# 开发
npm run dev                   # 启动开发服务器
npm run build                 # 构建生产版本
npm run preview               # 预览生产构建

# 测试
npm run test                  # 运行单元测试
npm run test:e2e             # 运行端到端测试
npm run test:coverage        # 生成测试覆盖率报告

# 代码质量
npm run lint                  # 代码检查
npm run lint:fix              # 自动修复代码问题
npm run type-check           # TypeScript类型检查

# 构建
npm run analyze               # 分析打包大小
npm run build:report         # 生成构建报告
```

## 🐛 常见问题排查

### 1. 端口冲突

```bash
# 查看端口占用
lsof -i :8000
lsof -i :3000

# 杀死进程
kill -9 <PID>

# 修改端口配置
# 编辑 .env 文件中的 PORT 配置
```

### 2. 数据库连接失败

```bash
# 检查PostgreSQL服务状态
sudo systemctl status postgresql

# 启动PostgreSQL服务
sudo systemctl start postgresql

# 测试数据库连接
psql -h localhost -U postgres -d auth_system_dev
```

### 3. Redis连接失败

```bash
# 检查Redis服务状态
sudo systemctl status redis

# 启动Redis服务
sudo systemctl start redis

# 测试Redis连接
redis-cli ping
```

### 4. 依赖安装失败

```bash
# 清理npm缓存
npm cache clean --force

# 删除node_modules重新安装
rm -rf node_modules package-lock.json
npm install

# 使用国内镜像
npm config set registry https://registry.npmmirror.com
```

### 5. 前端热重载不工作

```bash
# 检查文件监听数量限制
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# 重启开发服务器
npm run dev
```

## 📚 学习资源

### 官方文档
- [NestJS Documentation](https://docs.nestjs.com/)
- [Vue.js Documentation](https://vuejs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### 社区资源
- [Stack Overflow](https://stackoverflow.com/)
- [GitHub Discussions](https://github.com/features/discussions)
- [掘金](https://juejin.cn/)
- [思否](https://segmentfault.com/)

## 🔗 相关文档

- [代码规范](./35-coding-standards.md)
- [测试指南](./36-testing-guide.md)
- [调试技巧](./37-debugging-tips.md)
- [部署指南](./38-deployment-guide.md)

---

**最后更新**: 2025-11-29
**文档版本**: v1.0.0
**Node.js版本**: 18.x LTS
**PostgreSQL版本**: 15.x
**Vue.js版本**: 3.3+