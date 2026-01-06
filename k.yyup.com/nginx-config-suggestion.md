# Nginx 配置建议

## 问题诊断
当前 `https://localhost:5173/api/health` 返回的是前端HTML页面，而不是后端API响应，说明代理配置有问题。

## 建议的 Nginx 配置

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name localhost:5173;
    
    # SSL 配置（如果有）
    # ssl_certificate /path/to/cert.pem;
    # ssl_certificate_key /path/to/key.pem;
    
    # 静态文件根目录（前端构建产物）
    root /path/to/client/dist;
    index index.html;
    
    # API 请求代理到后端
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # 上传文件代理
    location /uploads/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 前端路由 - SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
}
```

## 关键配置说明

1. **API代理**: `location /api/` 将所有 `/api/*` 请求代理到 `http://localhost:3000`
2. **前端路由**: `location /` 使用 `try_files` 处理 Vue Router 的 history 模式
3. **静态资源**: 缓存优化，直接从文件系统提供

## 测试命令

配置完成后，使用以下命令测试：

```bash
# 测试前端页面
curl -I https://localhost:5173/

# 测试API代理
curl -I https://localhost:5173/api/health

# 测试登录API
curl -X POST https://localhost:5173/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 部署步骤

1. **构建前端**:
   ```bash
   cd /home/devbox/project/client
   npm run build:prod
   ```

2. **确保后端运行**:
   ```bash
   cd /home/devbox/project/server
   npm run dev
   ```

3. **更新 Nginx 配置**并重启服务

4. **测试完整流程**:
   - 访问 https://localhost:5173 应该显示前端页面
   - 登录功能应该正常工作
   - API调用应该成功