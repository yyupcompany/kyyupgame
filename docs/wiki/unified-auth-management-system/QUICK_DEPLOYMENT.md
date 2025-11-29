# 快速部署指南

## ⚡ 5分钟快速部署

本指南帮助您在5分钟内快速部署统一认证管理系统到本地或云服务器。

## 🚀 一键部署脚本

### Linux/macOS 快速部署

```bash
#!/bin/bash
# quick-deploy.sh - 统一认证管理系统快速部署脚本

set -e

echo "🚀 开始部署统一认证管理系统..."

# 检查系统要求
check_requirements() {
    echo "📋 检查系统要求..."

    # 检查Docker
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker未安装，请先安装Docker"
        exit 1
    fi

    # 检查Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi

    # 检查可用内存
    TOTAL_MEM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
    if [ "$TOTAL_MEM" -lt 4096 ]; then
        echo "⚠️  系统内存不足4GB，可能影响性能"
    fi

    echo "✅ 系统要求检查通过"
}

# 克隆项目
clone_project() {
    echo "📥 克隆项目代码..."

    if [ ! -d "unified-auth-management" ]; then
        git clone https://github.com/your-org/unified-auth-management.git
        cd unified-auth-management
    else
        cd unified-auth-management
        git pull origin main
    fi

    echo "✅ 项目代码准备完成"
}

# 配置环境变量
setup_environment() {
    echo "⚙️  配置环境变量..."

    # 生成随机密钥
    JWT_SECRET=$(openssl rand -base64 32)
    DB_PASSWORD=$(openssl rand -base64 16)
    REDIS_PASSWORD=$(openssl rand -base64 16)

    # 创建环境配置
    cat > .env.prod << EOF
# 应用配置
NODE_ENV=production
API_PREFIX=/api/v1

# 数据库配置
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=${DB_PASSWORD}
DB_DATABASE=auth_system

# Redis配置
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}

# JWT配置
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# 文件配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# 日志配置
LOG_LEVEL=info
LOG_FILE=./logs/app.log
EOF

    echo "✅ 环境变量配置完成"
}

# 创建Docker Compose配置
create_docker_compose() {
    echo "🐳 创建Docker配置..."

    cat > docker-compose.quick.yml << 'EOF'
version: '3.8'

services:
  nginx:
    image: nginx:1.24-alpine
    container_name: auth_nginx_quick
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.quick.conf:/etc/nginx/nginx.conf
      - static_files:/var/www/static
    depends_on:
      - backend
      - frontend
    networks:
      - auth_network
    restart: unless-stopped

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile.prod
    container_name: auth_frontend_quick
    environment:
      - NODE_ENV=production
      - VITE_API_BASE_URL=http://localhost/api/v1
    volumes:
      - static_files:/app/dist
    networks:
      - auth_network
    restart: unless-stopped

  backend:
    build:
      context: ./k.yyup.com
      dockerfile: Dockerfile.prod
    container_name: auth_backend_quick
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
    env_file:
      - .env.prod
    depends_on:
      - postgres
      - redis
    networks:
      - auth_network
    restart: unless-stopped
    ports:
      - "8000:8000"

  postgres:
    image: postgres:15
    container_name: auth_postgres_quick
    environment:
      POSTGRES_DB: ${DB_DATABASE}
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - auth_network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: auth_redis_quick
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - auth_network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  static_files:

networks:
  auth_network:
    driver: bridge
EOF

    # 创建Nginx配置
    mkdir -p nginx
    cat > nginx/nginx.quick.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    sendfile on;
    keepalive_timeout 65;
    client_max_body_size 50M;

    upstream backend {
        server backend:8000;
    }

    server {
        listen 80;
        server_name localhost;

        # 前端静态文件
        location / {
            root /var/www/static;
            try_files $uri $uri/ /index.html;
        }

        # API代理
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF

    echo "✅ Docker配置创建完成"
}

# 构建和启动服务
deploy_services() {
    echo "🔨 构建和启动服务..."

    # 构建镜像
    docker-compose -f docker-compose.quick.yml build

    # 启动服务
    docker-compose -f docker-compose.quick.yml up -d

    echo "✅ 服务启动完成"
}

# 初始化数据库
init_database() {
    echo "🗄️  初始化数据库..."

    # 等待数据库启动
    sleep 30

    # 运行迁移
    docker-compose -f docker-compose.quick.yml exec -T backend npm run migration:run

    # 创建管理员用户
    docker-compose -f docker-compose.quick.yml exec -T backend npm run seed:admin

    echo "✅ 数据库初始化完成"
}

# 验证部署
verify_deployment() {
    echo "🔍 验证部署状态..."

    # 检查服务状态
    echo "📊 服务状态:"
    docker-compose -f docker-compose.quick.yml ps

    # 检查服务健康状态
    echo "🏥 健康检查:"
    sleep 10
    if curl -f http://localhost/api/v1/health > /dev/null 2>&1; then
        echo "✅ 后端服务健康"
    else
        echo "❌ 后端服务异常"
    fi

    if curl -f http://localhost > /dev/null 2>&1; then
        echo "✅ 前端服务健康"
    else
        echo "❌ 前端服务异常"
    fi
}

# 显示访问信息
show_access_info() {
    echo ""
    echo "🎉 部署完成！"
    echo ""
    echo "📱 访问地址:"
    echo "   前端: http://localhost"
    echo "   API:  http://localhost/api/v1"
    echo ""
    echo "🔑 默认管理员账号:"
    echo "   用户名: admin"
    echo "   密码:   admin123"
    echo ""
    echo "🛠️  管理命令:"
    echo "   查看日志: docker-compose -f docker-compose.quick.yml logs -f"
    echo "   停止服务: docker-compose -f docker-compose.quick.yml down"
    echo "   重启服务: docker-compose -f docker-compose.quick.yml restart"
    echo ""
    echo "📁 重要文件:"
    echo "   环境配置: .env.prod"
    echo "   Docker配置: docker-compose.quick.yml"
    echo "   数据库数据: Docker卷 postgres_data"
    echo ""
}

# 主函数
main() {
    echo "🏗️  统一认证管理系统快速部署脚本"
    echo "=================================="
    echo ""

    check_requirements
    clone_project
    setup_environment
    create_docker_compose
    deploy_services
    init_database
    verify_deployment
    show_access_info
}

# 执行主函数
main
```

### Windows 快速部署

```powershell
# quick-deploy.ps1 - Windows PowerShell部署脚本

Write-Host "🚀 开始部署统一认证管理系统..." -ForegroundColor Green

# 检查系统要求
function Check-Requirements {
    Write-Host "📋 检查系统要求..." -ForegroundColor Blue

    # 检查Docker
    if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Docker未安装，请先安装Docker Desktop" -ForegroundColor Red
        exit 1
    }

    # 检查Docker Compose
    if (!(Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Docker Compose未安装，请先安装Docker Compose" -ForegroundColor Red
        exit 1
    }

    Write-Host "✅ 系统要求检查通过" -ForegroundColor Green
}

# 克隆项目
function Clone-Project {
    Write-Host "📥 克隆项目代码..." -ForegroundColor Blue

    if (!(Test-Path "unified-auth-management")) {
        git clone https://github.com/your-org/unified-auth-management.git
        Set-Location unified-auth-management
    } else {
        Set-Location unified-auth-management
        git pull origin main
    }

    Write-Host "✅ 项目代码准备完成" -ForegroundColor Green
}

# 生成随机密码
function New-RandomPassword {
    $bytes = New-Object byte[] 16
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    $rng.Dispose()
    return [System.Convert]::ToBase64String($bytes)
}

# 配置环境变量
function Setup-Environment {
    Write-Host "⚙️  配置环境变量..." -ForegroundColor Blue

    $jwtSecret = New-RandomPassword
    $dbPassword = New-RandomPassword
    $redisPassword = New-RandomPassword

    $envContent = @"
# 应用配置
NODE_ENV=production
API_PREFIX=/api/v1

# 数据库配置
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=$dbPassword
DB_DATABASE=auth_system

# Redis配置
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=$redisPassword

# JWT配置
JWT_SECRET=$jwtSecret
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# 文件配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# 日志配置
LOG_LEVEL=info
LOG_FILE=./logs/app.log
"@

    $envContent | Out-File -FilePath ".env.prod" -Encoding UTF8

    Write-Host "✅ 环境变量配置完成" -ForegroundColor Green
}

# 创建Docker Compose配置
function Create-DockerCompose {
    Write-Host "🐳 创建Docker配置..." -ForegroundColor Blue

    $dockerComposeContent = @"
version: '3.8'

services:
  nginx:
    image: nginx:1.24-alpine
    container_name: auth_nginx_quick
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.quick.conf:/etc/nginx/nginx.conf
      - static_files:/var/www/static
    depends_on:
      - backend
      - frontend
    networks:
      - auth_network
    restart: unless-stopped

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile.prod
    container_name: auth_frontend_quick
    environment:
      - NODE_ENV=production
      - VITE_API_BASE_URL=http://localhost/api/v1
    volumes:
      - static_files:/app/dist
    networks:
      - auth_network
    restart: unless-stopped

  backend:
    build:
      context: ./k.yyup.com
      dockerfile: Dockerfile.prod
    container_name: auth_backend_quick
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
    env_file:
      - .env.prod
    depends_on:
      - postgres
      - redis
    networks:
      - auth_network
    restart: unless-stopped
    ports:
      - "8000:8000"

  postgres:
    image: postgres:15
    container_name: auth_postgres_quick
    environment:
      POSTGRES_DB: `${DB_DATABASE}
      POSTGRES_USER: `${DB_USERNAME}
      POSTGRES_PASSWORD: `${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - auth_network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: auth_redis_quick
    command: redis-server --appendonly yes --requirepass `${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - auth_network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  static_files:

networks:
  auth_network:
    driver: bridge
"@

    $dockerComposeContent | Out-File -FilePath "docker-compose.quick.yml" -Encoding UTF8

    # 创建Nginx目录和配置
    New-Item -ItemType Directory -Force -Path "nginx"

    $nginxContent = @"
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    sendfile on;
    keepalive_timeout 65;
    client_max_body_size 50M;

    upstream backend {
        server backend:8000;
    }

    server {
        listen 80;
        server_name localhost;

        location / {
            root /var/www/static;
            try_files `$uri `$uri/ /index.html;
        }

        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host `$host;
            proxy_set_header X-Real-IP `$remote_addr;
            proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto `$scheme;
        }
    }
}
"@

    $nginxContent | Out-File -FilePath "nginx/nginx.quick.conf" -Encoding UTF8

    Write-Host "✅ Docker配置创建完成" -ForegroundColor Green
}

# 主函数
function Main {
    Write-Host "🏗️  统一认证管理系统快速部署脚本" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""

    Check-Requirements
    Clone-Project
    Setup-Environment
    Create-DockerCompose

    Write-Host "🔨 构建和启动服务..." -ForegroundColor Blue
    docker-compose -f docker-compose.quick.yml build
    docker-compose -f docker-compose.quick.yml up -d

    Write-Host "🗄️  初始化数据库..." -ForegroundColor Blue
    Start-Sleep -Seconds 30
    docker-compose -f docker-compose.quick.yml exec -T backend npm run migration:run
    docker-compose -f docker-compose.quick.yml exec -T backend npm run seed:admin

    Write-Host "🔍 验证部署状态..." -ForegroundColor Blue
    Write-Host "📊 服务状态:" -ForegroundColor Yellow
    docker-compose -f docker-compose.quick.yml ps

    Write-Host ""
    Write-Host "🎉 部署完成！" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 访问地址:" -ForegroundColor Cyan
    Write-Host "   前端: http://localhost" -ForegroundColor White
    Write-Host "   API:  http://localhost/api/v1" -ForegroundColor White
    Write-Host ""
    Write-Host "🔑 默认管理员账号:" -ForegroundColor Cyan
    Write-Host "   用户名: admin" -ForegroundColor White
    Write-Host "   密码:   admin123" -ForegroundColor White
    Write-Host ""
}

# 执行主函数
Main
```

## 🚀 使用快速部署

### Linux/macOS

```bash
# 下载并执行部署脚本
curl -fsSL https://raw.githubusercontent.com/your-org/unified-auth-management/main/scripts/quick-deploy.sh | bash

# 或者手动下载执行
wget https://raw.githubusercontent.com/your-org/unified-auth-management/main/scripts/quick-deploy.sh
chmod +x quick-deploy.sh
./quick-deploy.sh
```

### Windows

```powershell
# 下载并执行部署脚本
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/your-org/unified-auth-management/main/scripts/quick-deploy.ps1" -OutFile "quick-deploy.ps1"
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\quick-deploy.ps1
```

## 🛠️ 部署后操作

### 1. 访问系统

部署完成后，可以通过以下地址访问：

- **前端界面**: http://localhost
- **API文档**: http://localhost/api/v1/docs
- **健康检查**: http://localhost/api/v1/health

### 2. 默认账号

系统会自动创建管理员账号：
- **用户名**: admin
- **密码**: admin123

⚠️ **安全提示**: 首次登录后请立即修改默认密码

### 3. 常用管理命令

```bash
# 查看服务状态
docker-compose -f docker-compose.quick.yml ps

# 查看日志
docker-compose -f docker-compose.quick.yml logs -f

# 停止服务
docker-compose -f docker-compose.quick.yml down

# 重启服务
docker-compose -f docker-compose.quick.yml restart

# 更新服务
docker-compose -f docker-compose.quick.yml pull
docker-compose -f docker-compose.quick.yml up -d
```

### 4. 数据备份

```bash
# 备份数据库
docker-compose -f docker-compose.quick.yml exec postgres pg_dump -U postgres auth_system > backup_$(date +%Y%m%d).sql

# 恢复数据库
docker-compose -f docker-compose.quick.yml exec -T postgres psql -U postgres auth_system < backup_20251129.sql
```

## 🔧 自定义配置

### 修改端口

编辑 `docker-compose.quick.yml` 文件：

```yaml
services:
  nginx:
    ports:
      - "8080:80"  # 修改为8080端口
```

### 修改域名

编辑 `nginx/nginx.quick.conf` 文件：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 修改为您的域名
    # ... 其他配置
}
```

### SSL配置

如果要启用HTTPS，需要：

1. 获取SSL证书
2. 修改Nginx配置添加SSL支持
3. 更新Docker Compose配置映射证书目录

## 🐛 故障排除

### 常见问题

#### 1. 端口被占用

```bash
# 查看端口占用
netstat -tulpn | grep :80
# 或
lsof -i :80

# 停止占用端口的进程
sudo kill -9 <PID>
```

#### 2. Docker服务异常

```bash
# 查看Docker状态
sudo systemctl status docker

# 重启Docker服务
sudo systemctl restart docker
```

#### 3. 数据库连接失败

```bash
# 检查数据库容器状态
docker-compose -f docker-compose.quick.yml logs postgres

# 重启数据库容器
docker-compose -f docker-compose.quick.yml restart postgres
```

#### 4. 前端页面无法访问

```bash
# 检查Nginx配置
docker-compose -f docker-compose.quick.yml exec nginx nginx -t

# 重启Nginx容器
docker-compose -f docker-compose.quick.yml restart nginx
```

### 日志查看

```bash
# 查看所有服务日志
docker-compose -f docker-compose.quick.yml logs

# 查看特定服务日志
docker-compose -f docker-compose.quick.yml logs backend
docker-compose -f docker-compose.quick.yml logs frontend
docker-compose -f docker-compose.quick.yml logs postgres
docker-compose -f docker-compose.quick.yml logs redis
```

## 📈 性能优化

### 1. 资源限制

编辑 `docker-compose.quick.yml` 添加资源限制：

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 2. 数据库优化

编辑PostgreSQL配置文件优化性能：

```bash
# 创建自定义配置
mkdir -p postgres
cat > postgres/postgresql.conf << EOF
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
EOF
```

## 🔄 升级更新

```bash
# 备份当前数据
./backup.sh

# 拉取最新代码
git pull origin main

# 重新构建和部署
docker-compose -f docker-compose.quick.yml down
docker-compose -f docker-compose.quick.yml build --no-cache
docker-compose -f docker-compose.quick.yml up -d

# 运行数据库迁移
docker-compose -f docker-compose.quick.yml exec backend npm run migration:run
```

## 🔗 相关链接

- [完整部署指南](./38-deployment-guide.md)
- [Docker文档](https://docs.docker.com/)
- [Docker Compose文档](https://docs.docker.com/compose/)
- [系统监控指南](./40-monitoring-alerting.md)

---

**最后更新**: 2025-11-29
**文档版本**: v1.0.0
**支持系统**: Linux, macOS, Windows