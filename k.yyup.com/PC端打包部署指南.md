# 幼儿园管理系统 PC端打包部署指南

## 📋 概述

本指南详细介绍如何将幼儿园管理系统打包为PC端可部署应用，包含前端Vue.js应用和后端Node.js服务的完整部署方案。

## 🏗️ 系统架构

```
幼儿园管理系统 (PC端)
├── 前端 (Vue.js + Vite)     → 端口: 6000
├── 后端 (Node.js + Express)  → 端口: 3000
├── 数据库 (MySQL 8.0)       → 端口: 3306
└── 静态文件服务               → 自动代理
```

## 💻 系统要求

### 硬件要求
- **CPU**: 双核 2.0GHz 或更高
- **内存**: 4GB RAM (推荐 8GB)
- **存储**: 2GB 可用空间
- **网络**: 稳定的互联网连接

### 软件要求
- **操作系统**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **Node.js**: >= 18.0.0
- **MySQL**: >= 8.0
- **浏览器**: Chrome 90+, Firefox 88+, Safari 14+

## 🚀 快速开始

### 1. 环境验证

```bash
# 检查 Node.js 版本
node --version  # 应显示 v18.0.0 或更高

# 检查 npm 版本
npm --version   # 应显示 8.0.0 或更高

# 检查 MySQL 服务
mysql --version  # 应显示 MySQL 8.0 或更高
```

### 2. 一键打包构建

```bash
# 克隆项目
git clone <项目地址>
cd k.yyup.com

# 安装依赖
npm run install:all

# 执行 PC 端打包
npm run build:pc
```

构建完成后，`package-pc/` 目录包含完整的部署包。

### 3. 数据库配置

#### 3.1 创建数据库
```sql
-- 连接到 MySQL
mysql -u root -p

-- 创建数据库
CREATE DATABASE kindergarten_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建专用用户（可选）
CREATE USER 'kindergarten_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON kindergarten_management.* TO 'kindergarten_user'@'localhost';
FLUSH PRIVILEGES;

-- 验证数据库
SHOW DATABASES;
```

#### 3.2 配置数据库连接
编辑 `package-pc/package.json` 中的环境变量：
```json
{
  "name": "kindergarten-server",
  "environment": {
    "DB_HOST": "localhost",
    "DB_PORT": "3306",
    "DB_NAME": "kindergarten_management",
    "DB_USER": "kindergarten_user",
    "DB_PASSWORD": "your_password"
  }
}
```

### 4. 启动服务

#### 4.1 Linux/macOS 用户
```bash
cd package-pc

# 赋予执行权限
chmod +x start.sh

# 启动服务
./start.sh
```

#### 4.2 Windows 用户
```cmd
cd package-pc

# 启动服务
start.bat
```

### 5. 访问系统

服务启动成功后，可以通过以下地址访问：

- **前端界面**: http://localhost:6000
- **后端API**: http://localhost:3000/api
- **API文档**: http://localhost:3000/api-docs

默认管理员账号：
- 用户名: `admin`
- 密码: `123456`

## 📦 打包命令详解

### 主要打包命令

```bash
# 完整 PC 端打包（推荐）
npm run build:pc

# 仅构建前端
npm run build:pc:frontend

# 仅构建后端
npm run build:pc:backend

# 创建部署包
npm run package:pc

# 启动 PC 端服务（开发模式）
npm run start:pc:dev
```

### 分步构建流程

```bash
# 1. 清理旧文件
npm run clean

# 2. 构建前端
cd client && npm run build:pc

# 3. 构建后端
cd ../server && npm run build:production

# 4. 创建启动脚本
cd .. && node scripts/build-pc-package.cjs
```

## 📁 部署包结构

```
package-pc/                    # PC端部署包根目录
├── frontend/                   # 前端静态文件
│   ├── index.html             # 入口页面
│   ├── static/                # 静态资源
│   │   ├── js/                # JavaScript 文件
│   │   ├── css/               # 样式文件
│   │   ├── images/            # 图片资源
│   │   └── fonts/             # 字体文件
│   └── favicon.ico            # 网站图标
├── backend/                    # 后端服务文件
│   ├── server.js              # 服务入口
│   ├── dist/                  # 编译后的代码
│   └── controllers/           # 控制器
├── uploads/                    # 文件上传目录
├── package.json               # 后端依赖配置
├── package-lock.json          # 依赖锁定文件
├── start.sh                   # Linux/macOS 启动脚本
├── start.bat                  # Windows 启动脚本
├── README.md                  # 部署说明
└── build-report.json          # 构建报告
```

## ⚙️ 配置说明

### 1. 环境变量配置

主要配置项在 `package-pc/package.json` 中：

```json
{
  "name": "kindergarten-server",
  "environment": {
    "NODE_ENV": "production",
    "PORT": "3000",
    "DB_HOST": "localhost",
    "DB_PORT": "3306",
    "DB_NAME": "kindergarten_management",
    "DB_USER": "root",
    "DB_PASSWORD": "your_password",
    "JWT_SECRET": "your_jwt_secret_key_here",
    "JWT_EXPIRES_IN": "24h",
    "UPLOAD_PATH": "./uploads",
    "MAX_FILE_SIZE": "10485760",
    "LOG_LEVEL": "error",
    "LOG_FILE": "./logs/app.log",
    "CORS_ORIGIN": "http://localhost:6000",
    "API_PREFIX": "/api",
    "REDIS_HOST": "localhost",
    "REDIS_PORT": "6379",
    "BCRYPT_SALT_ROUNDS": "12",
    "RATE_LIMIT_WINDOW": "15",
    "RATE_LIMIT_MAX": "100",
    "TIMEZONE": "Asia/Shanghai",
    "DEFAULT_PAGE_SIZE": "10",
    "MAX_PAGE_SIZE": "100"
  }
}
```

### 2. 前端配置

前端配置在 `frontend/static/config.js` 中：
```javascript
window.APP_CONFIG = {
  API_BASE_URL: '/api',
  APP_TITLE: '幼儿园管理系统',
  VERSION: '1.0.0',
  UPLOAD_SIZE_LIMIT: 10485760,
  TOKEN_EXPIRE_TIME: 86400
};
```

### 3. 数据库配置

修改数据库连接信息：
- `DB_HOST`: 数据库服务器地址
- `DB_PORT`: 数据库端口（默认 3306）
- `DB_NAME`: 数据库名称
- `DB_USER`: 数据库用户名
- `DB_PASSWORD`: 数据库密码

## 🔧 高级配置

### 1. 反向代理配置 (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/package-pc/frontend;
        try_files $uri $uri/ /index.html;

        # 缓存配置
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 文件上传限制
    client_max_body_size 10M;
}
```

### 2. PM2 进程管理

```bash
# 安装 PM2
npm install -g pm2

# 创建 PM2 配置文件
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'kindergarten-backend',
      script: './backend/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'kindergarten-frontend',
      script: 'serve',
      args: '-s frontend -l 6000',
      instances: 1,
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      time: true
    }
  ]
};
EOF

# 启动应用
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs

# 重启应用
pm2 restart all

# 停止应用
pm2 stop all
```

### 3. Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制后端文件
COPY backend/ ./backend/
COPY package.json ./

# 安装依赖
RUN npm install --production

# 复制前端文件
COPY frontend/ ./frontend/

# 创建必要目录
RUN mkdir -p uploads logs

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "run", "start:production"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - DB_USER=root
      - DB_PASSWORD=rootpassword
      - DB_NAME=kindergarten_management
    depends_on:
      - mysql
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: kindergarten_management
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

## 🛠️ 故障排除

### 1. 常见问题

#### 问题: 端口占用
```bash
# 查看端口占用
lsof -i :3000
lsof -i :6000

# 杀死进程
kill -9 <PID>

# 或者修改端口配置
export PORT=3001
```

#### 问题: 数据库连接失败
```bash
# 检查 MySQL 服务状态
sudo systemctl status mysql

# 启动 MySQL 服务
sudo systemctl start mysql

# 测试连接
mysql -u root -p -h localhost
```

#### 问题: 前端空白页面
```bash
# 检查控制台错误
# 打开浏览器开发者工具查看

# 检查 API 连接
curl http://localhost:3000/api/health

# 检查静态文件
ls -la frontend/static/
```

#### 问题: 权限错误
```bash
# Linux/macOS
chmod +x start.sh
sudo chown -R $USER:$USER package-pc/

# Windows
# 以管理员身份运行命令提示符
```

### 2. 日志查看

```bash
# 查看后端日志
tail -f logs/app.log

# 查看 PM2 日志
pm2 logs kindergarten-backend

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/error.log
```

### 3. 性能优化

#### 3.1 数据库优化
```sql
-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_activities_status ON activities(status);

-- 查看慢查询
SHOW VARIABLES LIKE 'slow_query_log';
SHOW VARIABLES LIKE 'long_query_time';
```

#### 3.2 内存优化
```bash
# 增加 Node.js 内存限制
export NODE_OPTIONS="--max-old-space-size=4096"

# 启用 gzip 压缩
npm install compression
```

#### 3.3 缓存优化
```bash
# 启用 Redis 缓存
npm install redis

# 配置 CDN
# 将静态文件上传到 CDN
```

## 📊 监控和维护

### 1. 系统监控

```bash
# 安装监控工具
npm install -g clinic

# 性能分析
clinic doctor -- node backend/server.js

# 内存泄漏检测
clinic heapprofiler -- node backend/server.js
```

### 2. 备份策略

```bash
# 数据库备份
mysqldump -u root -p kindergarten_management > backup_$(date +%Y%m%d).sql

# 文件备份
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/

# 配置文件备份
cp package.json package.json.backup
```

### 3. 更新部署

```bash
# 1. 备份当前版本
cp -r package-pc package-pc_backup

# 2. 停止服务
pm2 stop all

# 3. 更新文件
# 上传新版本的文件

# 4. 安装依赖
npm install

# 5. 运行数据库迁移（如果有）
npm run db:migrate

# 6. 重启服务
pm2 start all

# 7. 验证更新
curl http://localhost:3000/api/health
```

## 📞 技术支持

如遇到问题，请联系技术支持团队：

- **邮箱**: support@example.com
- **电话**: 400-xxx-xxxx
- **在线文档**: https://docs.example.com
- **GitHub Issues**: https://github.com/your-repo/issues

---

**版本**: 1.0.0
**更新时间**: 2025年1月
**文档维护**: 开发团队

> 💡 **提示**: 建议在生产环境中使用 HTTPS、配置防火墙、定期备份数据，以确保系统安全和数据完整性。