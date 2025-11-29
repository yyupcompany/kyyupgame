# 环境配置指南

## 🎯 环境准备概述

统一认证管理系统需要准备开发、测试、生产等多种环境。本指南将详细介绍各类环境的配置要求、依赖安装、以及环境变量配置等内容。

## 💻 系统要求

### 最低硬件要求

| 环境 | CPU | 内存 | 存储 | 网络 |
|------|-----|------|------|------|
| **开发环境** | 2核 | 8GB | 20GB SSD | 100Mbps |
| **测试环境** | 4核 | 16GB | 50GB SSD | 1Gbps |
| **生产环境** | 8核 | 32GB | 200GB SSD | 1Gbps |

### 操作系统要求

| 系统 | 版本要求 | 说明 |
|------|----------|------|
| **Linux** | Ubuntu 20.04+ / CentOS 8+ / RHEL 8+ | 推荐 Ubuntu 22.04 LTS |
| **macOS** | 12.0+ | Monterey 及以上版本 |
| **Windows** | Windows 10/11 | 推荐 Windows 11 Pro |

### 软件依赖版本

| 软件 | 最低版本 | 推荐版本 | 说明 |
|------|----------|----------|------|
| **Node.js** | 18.0.0 | 20.x LTS | JavaScript运行时 |
| **npm** | 8.0.0 | 10.x | 包管理器 |
| **MySQL** | 8.0 | 8.0+ | 关系型数据库 |
| **Redis** | 6.0 | 7.0+ | 缓存数据库 |
| **Nginx** | 1.18 | 1.20+ | 反向代理服务器 |
| **Docker** | 20.0 | 24.0+ | 容器化部署（可选） |

## 🔧 开发环境配置

### 1. Node.js 安装

#### Windows 环境
```bash
# 下载并安装 Node.js LTS 版本
# 访问 https://nodejs.org/ 下载安装包

# 验证安装
node --version
npm --version

# 配置 npm 淘宝镜像
npm config set registry https://registry.npmmirror.com
```

#### macOS 环境
```bash
# 使用 Homebrew 安装
brew install node@20

# 验证安装
node --version
npm --version

# 配置环境变量
echo 'export PATH="/usr/local/opt/node@20/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### Linux 环境
```bash
# 使用 NodeSource 仓库安装
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version

# 配置 npm 全局目录
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### 2. 数据库安装配置

#### MySQL 安装

**Windows:**
```bash
# 下载 MySQL Community Server
# https://dev.mysql.com/downloads/mysql/

# 安装时设置 root 密码
# 启用 MySQL 服务
net start mysql
```

**macOS:**
```bash
# 使用 Homebrew 安装
brew install mysql

# 启动 MySQL 服务
brew services start mysql

# 安全配置
mysql_secure_installation
```

**Linux (Ubuntu):**
```bash
# 安装 MySQL
sudo apt update
sudo apt install mysql-server mysql-client

# 安全配置
sudo mysql_secure_installation

# 启动服务
sudo systemctl start mysql
sudo systemctl enable mysql
```

**数据库配置:**
```sql
-- 创建数据库
CREATE DATABASE kindergarten CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户
CREATE USER 'kyyup_user'@'localhost' IDENTIFIED BY 'your_secure_password';

-- 授权
GRANT ALL PRIVILEGES ON kindergarten.* TO 'kyyup_user'@'localhost';
FLUSH PRIVILEGES;

-- 验证连接
mysql -u kyyup_user -p kindergarten
```

#### Redis 安装

**Windows:**
```bash
# 使用 WSL 或 Docker 安装
# 或者下载 Windows 版本
# https://github.com/microsoftarchive/redis/releases
```

**macOS:**
```bash
# 使用 Homebrew 安装
brew install redis

# 启动服务
brew services start redis
```

**Linux:**
```bash
# 安装 Redis
sudo apt install redis-server

# 启动服务
sudo systemctl start redis-server
sudo systemctl enable redis-server

# 测试连接
redis-cli ping
```

### 3. 项目依赖安装

```bash
# 克隆项目
git clone https://github.com/your-repo/k.yyup.com.git
cd k.yyup.com

# 安装根目录依赖
npm install

# 安装前端依赖
cd client
npm install

# 安装后端依赖
cd ../server
npm install

# 返回根目录
cd ..
```

### 4. 环境变量配置

#### 前端环境变量 (`client/.env`)
```bash
# 应用配置
VITE_APP_TITLE=统一认证管理系统
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=幼儿园管理平台

# API 配置
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000

# 功能开关
VITE_ENABLE_MOCK=false
VITE_ENABLE_DEVTOOLS=true
VITE_ENABLE_PWA=true

# 第三方服务
VITE_OSS_ENDPOINT=https://oss-cn-beijing.aliyuncs.com
VITE_OSS_BUCKET=kyyup-assets

# 调试配置
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

#### 后端环境变量 (`server/.env`)
```bash
# 应用配置
NODE_ENV=development
PORT=3000
APP_NAME=统一认证管理系统
APP_VERSION=1.0.0

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=kindergarten
DB_USER=kyyup_user
DB_PASSWORD=your_secure_password
DB_CHARSET=utf8mb4
DB_TIMEZONE=+08:00

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT 配置
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_REFRESH_EXPIRES_IN=7d

# 文件上传配置
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=jpg,jpeg,png,gif,pdf,doc,docx
UPLOAD_PATH=uploads

# 邮件配置
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@example.com
SMTP_PASS=your_email_password

# 短信配置
SMS_PROVIDER=aliyun
SMS_ACCESS_KEY=your_sms_access_key
SMS_SECRET_KEY=your_sms_secret_key

# OSS 配置
OSS_ACCESS_KEY_ID=your_oss_access_key_id
OSS_ACCESS_KEY_SECRET=your_oss_access_key_secret
OSS_BUCKET=kyyup-assets
OSS_REGION=oss-cn-beijing

# AI 服务配置
AI_API_URL=https://ai.example.com/api
AI_API_KEY=your_ai_api_key
AI_MODEL=gpt-3.5-turbo

# 日志配置
LOG_LEVEL=debug
LOG_FILE=logs/app.log
LOG_MAX_SIZE=10m
LOG_MAX_FILES=5

# 安全配置
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
CORS_ORIGIN=http://localhost:5173

# 监控配置
ENABLE_METRICS=true
METRICS_PORT=9090
HEALTH_CHECK_INTERVAL=30000
```

## 🐳 Docker 环境配置

### 1. Docker 安装

#### 安装 Docker Engine
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 将用户添加到 docker 组
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Docker Compose 配置

创建 `docker-compose.yml` 文件：
```yaml
version: '3.8'

services:
  # 前端服务
  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    environment:
      - VITE_API_BASE_URL=http://localhost:3000/api
    volumes:
      - ./client:/app
      - /app/node_modules
    depends_on:
      - backend
    networks:
      - kyyup-network

  # 后端服务
  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DB_HOST=mysql
      - REDIS_HOST=redis
    volumes:
      - ./server:/app
      - /app/node_modules
      - ./uploads:/app/uploads
    depends_on:
      - mysql
      - redis
    networks:
      - kyyup-network

  # 数据库服务
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: kindergarten
      MYSQL_USER: kyyup_user
      MYSQL_PASSWORD: user_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - kyyup-network

  # Redis 服务
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - kyyup-network

  # Nginx 服务
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
      - ./uploads:/var/www/uploads
    depends_on:
      - frontend
      - backend
    networks:
      - kyyup-network

volumes:
  mysql_data:
  redis_data:

networks:
  kyyup-network:
    driver: bridge
```

### 3. Dockerfile 配置

#### 前端 Dockerfile (`client/Dockerfile`)
```dockerfile
FROM node:20-alpine

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 5173

# 启动命令
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

#### 后端 Dockerfile (`server/Dockerfile`)
```dockerfile
FROM node:20-alpine

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 创建上传目录
RUN mkdir -p uploads logs

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "run", "dev"]
```

## 🚀 快速启动指南

### 1. 本地开发启动

```bash
# 1. 启动数据库服务
sudo systemctl start mysql
sudo systemctl start redis

# 2. 初始化数据库
cd server
npm run db:migrate
npm run db:seed

# 3. 启动后端服务
npm run dev &

# 4. 启动前端服务
cd ../client
npm run dev
```

### 2. Docker 快速启动

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止所有服务
docker-compose down
```

### 3. 生产环境启动

```bash
# 1. 构建前端
cd client
npm run build

# 2. 构建后端
cd ../server
npm run build

# 3. 启动生产服务
npm start

# 4. 配置 Nginx 反向代理
sudo nginx -t && sudo nginx -s reload
```

## 🔧 开发工具配置

### 1. VS Code 配置

#### 推荐插件 (.vscode/extensions.json)
```json
{
  "recommendations": [
    "vue.volar",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "christian-kohler.path-intellisense",
    "formulahendry.auto-rename-tag",
    "redhat.vscode-yaml",
    "ms-vscode-remote.remote-containers"
  ]
}
```

#### 工作区配置 (.vscode/settings.json)
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
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
  "eslint.workingDirectories": ["client", "server"],
  "prettier.configPath": ".prettierrc"
}
```

### 2. Git 配置

#### Git Hooks
```bash
# 安装 husky
npm install --save-dev husky

# 初始化 husky
npx husky install

# 添加 pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run test"

# 添加 commit-msg hook
npx husky add .husky/commit-msg "npx commitlint --edit $1"
```

#### 提交规范配置 (`commitlint.config.js`)
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复 bug
        'docs',     // 文档更新
        'style',    // 代码格式化
        'refactor', // 重构
        'perf',     // 性能优化
        'test',     // 测试
        'chore',    // 构建过程或辅助工具的变动
        'revert'    // 回滚
      ]
    ]
  }
};
```

## 🔍 环境验证

### 1. 数据库连接验证
```bash
# 测试 MySQL 连接
mysql -u kyyup_user -p -e "SELECT VERSION();"

# 测试 Redis 连接
redis-cli ping
```

### 2. API 服务验证
```bash
# 测试后端健康检查
curl http://localhost:3000/api/health

# 测试前端访问
curl http://localhost:5173
```

### 3. 环境变量验证
```bash
# 检查前端环境变量
cd client && npm run env:check

# 检查后端环境变量
cd server && npm run env:check
```

## 📋 环境检查清单

### 开发环境检查清单

- [ ] Node.js 18+ 已安装
- [ ] MySQL 8.0+ 已安装并运行
- [ ] Redis 6.0+ 已安装并运行
- [ ] 项目依赖已安装
- [ ] 环境变量已配置
- [ ] 数据库已初始化
- [ ] 前端服务可正常启动
- [ ] 后端服务可正常启动
- [ ] API 接口可正常访问
- [ ] 开发工具已配置

### 生产环境检查清单

- [ ] 服务器资源满足要求
- [ ] SSL 证书已配置
- [ ] 防火墙规则已设置
- [ ] 数据库已备份
- [ ] 环境变量已配置
- [ ] 日志轮转已配置
- [ ] 监控系统已部署
- [ ] 备份策略已制定
- [ ] 安全加固已完成
- [ ] 性能优化已实施

## 🚨 常见问题

### 1. Node.js 版本问题
```bash
# 使用 nvm 管理版本
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
nvm alias default 20
```

### 2. 端口占用问题
```bash
# 查找占用端口的进程
lsof -i :3000
lsof -i :5173

# 杀死进程
kill -9 <PID>

# 或者使用项目脚本
npm run clean:ports
```

### 3. 数据库连接问题
```bash
# 检查 MySQL 状态
sudo systemctl status mysql

# 重启 MySQL
sudo systemctl restart mysql

# 检查连接
mysql -u root -p -e "SHOW PROCESSLIST;"
```

### 4. 依赖安装问题
```bash
# 清理 npm 缓存
npm cache clean --force

# 删除 node_modules 重新安装
rm -rf node_modules package-lock.json
npm install

# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com
```

---

**最后更新**: 2025-11-29
**文档版本**: v1.0.0
**维护团队**: 统一认证管理系统开发团队