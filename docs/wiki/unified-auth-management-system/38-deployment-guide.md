# 部署指南

## 🚀 部署概述

本指南详细说明如何在不同环境中部署统一认证管理系统，包括开发、测试、预生产和生产环境的完整部署方案。

## 📋 部署架构

### 部署环境对比

| 环境 | 用途 | 服务器配置 | 数据库 | 缓存 | 监控 |
|------|------|------------|--------|------|------|
| **开发环境** | 开发调试 | 2核4GB | SQLite | Memory | 基础 |
| **测试环境** | 功能测试 | 4核8GB | PostgreSQL | Redis | 标准 |
| **预生产环境** | 上线前验证 | 8核16GB | PostgreSQL集群 | Redis集群 | 完整 |
| **生产环境** | 正式运行 | 16核32GB+ | PostgreSQL主从 | Redis集群 | 完整+ |

## 🐳 Docker部署（推荐）

### 1. 环境准备

```bash
# 安装Docker和Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

### 2. 生产环境Docker Compose配置

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # Nginx反向代理
  nginx:
    image: nginx:1.24-alpine
    container_name: auth_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - static_files:/var/www/static
    depends_on:
      - backend
      - frontend
    networks:
      - auth_network
    restart: unless-stopped

  # 前端服务
  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile.prod
    container_name: auth_frontend
    environment:
      - NODE_ENV=production
    volumes:
      - static_files:/app/dist
    networks:
      - auth_network
    restart: unless-stopped

  # 后端服务
  backend:
    build:
      context: ./k.yyup.com
      dockerfile: Dockerfile.prod
    container_name: auth_backend
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
    env_file:
      - ./k.yyup.com/.env.prod
    depends_on:
      - postgres
      - redis
    networks:
      - auth_network
    restart: unless-stopped
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

  # PostgreSQL主数据库
  postgres:
    image: postgres:15
    container_name: auth_postgres
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - auth_network
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G

  # Redis缓存
  redis:
    image: redis:7-alpine
    container_name: auth_redis
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - auth_network
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 1G

  # Prometheus监控
  prometheus:
    image: prom/prometheus:latest
    container_name: auth_prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
    networks:
      - auth_network
    restart: unless-stopped

  # Grafana可视化
  grafana:
    image: grafana/grafana:latest
    container_name: auth_grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources
    depends_on:
      - prometheus
    networks:
      - auth_network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:
  static_files:

networks:
  auth_network:
    driver: bridge
```

### 3. Nginx配置

```nginx
# nginx/nginx.conf
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

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # 基础配置
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50M;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # 上游服务器
    upstream backend {
        server backend:8000;
    }

    # HTTP重定向到HTTPS
    server {
        listen 80;
        server_name k.yyup.com www.k.yyup.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS服务器
    server {
        listen 443 ssl http2;
        server_name k.yyup.com www.k.yyup.com;

        # SSL配置
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # 安全头
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # 前端静态文件
        location / {
            root /var/www/static;
            try_files $uri $uri/ /index.html;

            # 缓存配置
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }

        # API代理
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # 超时配置
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # WebSocket支持
        location /socket.io/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### 4. 部署步骤

```bash
# 1. 克隆项目
git clone https://github.com/your-org/unified-auth-management.git
cd unified-auth-management

# 2. 配置环境变量
cp .env.example .env.prod
vim .env.prod

# 3. 生成SSL证书
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/key.pem \
    -out nginx/ssl/cert.pem

# 4. 构建和启动服务
docker-compose -f docker-compose.prod.yml up -d --build

# 5. 运行数据库迁移
docker-compose -f docker-compose.prod.yml exec backend npm run migration:run

# 6. 检查服务状态
docker-compose -f docker-compose.prod.yml ps

# 7. 查看日志
docker-compose -f docker-compose.prod.yml logs -f
```

## ☸️ Kubernetes部署

### 1. 命名空间配置

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: auth-system
  labels:
    name: auth-system
```

### 2. ConfigMap配置

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: auth-config
  namespace: auth-system
data:
  NODE_ENV: "production"
  API_PREFIX: "/api/v1"
  REDIS_HOST: "redis-service"
  REDIS_PORT: "6379"
  DB_HOST: "postgres-service"
  DB_PORT: "5432"
  LOG_LEVEL: "info"
```

### 3. Secret配置

```yaml
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: auth-secret
  namespace: auth-system
type: Opaque
data:
  DB_USERNAME: cG9zdGdyZXM=  # postgres (base64 encoded)
  DB_PASSWORD: cG9zdGdyZXMxMjM=  # postgres123 (base64 encoded)
  JWT_SECRET: eW91ci1zdXBlci1zZWNyZXQtand0LWtleQ==  # your-super-secret-jwt-key
  REDIS_PASSWORD: cmVkaXNwYXNzd29yZA==  # redispassword
```

### 4. 后端部署

```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-deployment
  namespace: auth-system
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: your-registry/auth-backend:latest
        ports:
        - containerPort: 8000
        envFrom:
        - configMapRef:
            name: auth-config
        - secretRef:
            name: auth-secret
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/v1/health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: auth-system
spec:
  selector:
    app: backend
  ports:
  - protocol: TCP
    port: 8000
    targetPort: 8000
  type: ClusterIP
```

### 5. 前端部署

```yaml
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-deployment
  namespace: auth-system
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: your-registry/auth-frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: auth-system
spec:
  selector:
    app: frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: ClusterIP
```

### 6. Ingress配置

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: auth-ingress
  namespace: auth-system
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
spec:
  tls:
  - hosts:
    - k.yyup.com
    secretName: auth-tls
  rules:
  - host: k.yyup.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 8000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

### 7. 数据库部署

```yaml
# k8s/postgres-deployment.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: auth-system
spec:
  serviceName: postgres-service
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15
        env:
        - name: POSTGRES_DB
          value: "auth_system"
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: auth-secret
              key: DB_USERNAME
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: auth-secret
              key: DB_PASSWORD
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "4Gi"
            cpu: "1000m"
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 20Gi
---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: auth-system
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
  type: ClusterIP
```

### 8. 部署到Kubernetes

```bash
# 1. 创建命名空间
kubectl apply -f k8s/namespace.yaml

# 2. 创建配置
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# 3. 部署数据库
kubectl apply -f k8s/postgres-deployment.yaml

# 4. 等待数据库就绪
kubectl wait --for=condition=ready pod -l app=postgres -n auth-system --timeout=300s

# 5. 运行数据库迁移
kubectl run migration --image=your-registry/auth-backend:latest \
  --rm -i --restart=Never \
  -n auth-system \
  --env="NODE_ENV=production" \
  --env="DB_HOST=postgres-service" \
  -- npm run migration:run

# 6. 部署应用
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# 7. 配置Ingress
kubectl apply -f k8s/ingress.yaml

# 8. 检查部署状态
kubectl get pods -n auth-system
kubectl get services -n auth-system
kubectl get ingress -n auth-system
```

## 🚀 CI/CD自动化部署

### 1. GitHub Actions配置

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: |
        cd k.yyup.com && npm install
        cd ../client && npm install

    - name: Run tests
      run: |
        cd k.yyup.com && npm run test
        cd ../client && npm run test

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2

    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}

    - name: Build and push backend image
      uses: docker/build-push-action@v4
      with:
        context: ./k.yyup.com
        file: ./k.yyup.com/Dockerfile.prod
        push: true
        tags: ${{ secrets.DOCKER_USERNAME }}/auth-backend:latest

    - name: Build and push frontend image
      uses: docker/build-push-action@v4
      with:
        context: ./client
        file: ./client/Dockerfile.prod
        push: true
        tags: ${{ secrets.DOCKER_USERNAME }}/auth-frontend:latest

    - name: Deploy to production
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /opt/unified-auth-management
          docker-compose -f docker-compose.prod.yml pull
          docker-compose -f docker-compose.prod.yml up -d
          docker system prune -f
```

### 2. GitLab CI配置

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  DOCKER_REGISTRY: registry.gitlab.com/your-group/auth-system
  DOCKER_DRIVER: overlay2

test:
  stage: test
  image: node:18-alpine
  services:
    - postgres:15
    - redis:7-alpine
  variables:
    POSTGRES_DB: test_db
    POSTGRES_USER: test_user
    POSTGRES_PASSWORD: test_pass
    REDIS_URL: redis://redis:6379
  script:
    - cd k.yyup.com
    - npm install
    - npm run test
    - cd ../client
    - npm install
    - npm run test

build:
  stage: build
  image: docker:20.10.16
  services:
    - docker:20.10.16-dind
  script:
    - cd k.yyup.com
    - docker build -t $DOCKER_REGISTRY/backend:$CI_COMMIT_SHA -f Dockerfile.prod .
    - docker push $DOCKER_REGISTRY/backend:$CI_COMMIT_SHA
    - cd ../client
    - docker build -t $DOCKER_REGISTRY/frontend:$CI_COMMIT_SHA -f Dockerfile.prod .
    - docker push $DOCKER_REGISTRY/frontend:$CI_COMMIT_SHA
  only:
    - main

deploy:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
    - ssh-keyscan $DEPLOY_HOST >> ~/.ssh/known_hosts
    - chmod 644 ~/.ssh/known_hosts
  script:
    - |
      ssh $DEPLOY_USER@$DEPLOY_HOST << EOF
        cd /opt/unified-auth-management
        docker-compose -f docker-compose.prod.yml pull
        docker-compose -f docker-compose.prod.yml up -d
        docker system prune -f
      EOF
  only:
    - main
```

## 🔧 环境配置管理

### 1. 生产环境变量

```env
# .env.prod
# 应用配置
NODE_ENV=production
PORT=8000
API_PREFIX=/api/v1

# 数据库配置
DB_HOST=postgres-service
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password
DB_DATABASE=auth_system
DB_SSL=true

# Redis配置
REDIS_HOST=redis-service
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT配置
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# 文件存储配置
UPLOAD_PROVIDER=aws-s3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-west-2
AWS_S3_BUCKET=auth-system-files

# 邮件配置
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key

# 日志配置
LOG_LEVEL=info
LOG_FORMAT=json

# 监控配置
PROMETHEUS_ENABLED=true
METRICS_PORT=9464

# 安全配置
CORS_ORIGIN=https://k.yyup.com
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### 2. 安全配置

```bash
# 设置文件权限
chmod 600 .env.prod
chmod 600 ssl/*
chmod 755 scripts/*

# 配置防火墙
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 禁用root登录
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd
```

## 📊 监控和日志

### 1. Prometheus配置

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'auth-backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: '/api/v1/metrics'
    scrape_interval: 30s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

### 2. Grafana仪表板

```json
{
  "dashboard": {
    "title": "Auth System Monitoring",
    "panels": [
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Active Users",
        "type": "stat",
        "targets": [
          {
            "expr": "active_users_total",
            "legendFormat": "Active Users"
          }
        ]
      }
    ]
  }
}
```

## 🔍 健康检查

### 1. 应用健康检查端点

```typescript
// k.yyup.com/src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common'
import { HealthCheckService, HealthCheck, TypeOrmHealthIndicator, RedisHealthIndicator } from '@nestjs/terminus'

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redis: RedisHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redis.pingCheck('redis'),
    ])
  }
}
```

### 2. Kubernetes健康检查

```yaml
# liveness和readiness探针配置
livenessProbe:
  httpGet:
    path: /api/v1/health
    port: 8000
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /api/v1/health
    port: 8000
  initialDelaySeconds: 5
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3
```

## 🔄 滚动更新策略

### 1. Kubernetes滚动更新

```yaml
# 部署策略配置
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
```

### 2. Docker Compose滚动更新

```bash
# 零停机更新脚本
#!/bin/bash
# rolling-update.sh

# 更新后端服务
docker-compose -f docker-compose.prod.yml pull backend
docker-compose -f docker-compose.prod.yml up -d --no-deps backend

# 等待服务就绪
sleep 30

# 更新前端服务
docker-compose -f docker-compose.prod.yml pull frontend
docker-compose -f docker-compose.prod.yml up -d --no-deps frontend

# 清理旧镜像
docker image prune -f
```

## 🔗 相关文档

- [容器化部署详解](./39-containerization.md)
- [监控告警配置](./40-monitoring-alerting.md)
- [备份恢复策略](./41-backup-recovery.md)
- [性能优化指南](./42-performance-optimization.md)

---

**最后更新**: 2025-11-29
**文档版本**: v1.0.0
**部署环境**: Docker + Kubernetes