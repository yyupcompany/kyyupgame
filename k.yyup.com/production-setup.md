# localhost:5173 生产环境部署指南

## 问题解决方案

### 原问题
1. 访问 localhost:5173 时出现无限重定向循环
2. 登录页面直接访问 localhost:3000，外网无法访问
3. 后端服务器对外网公开，存在安全隐患

### 解决方案

#### 1. 架构调整
```
用户访问： https://localhost:5173
        ↓
      Nginx 反向代理
        ↓
 静态文件（前端） + API代理
        ↓
   内网后端服务： localhost:3000
```

#### 2. 配置修改

**前端配置修改：**
- `vite.config.ts`: 开发环境代理指向 localhost:3000
- `src/env.ts`: 生产环境使用域名 API
- `.env`: 配置环境变量

**后端配置修改：**
- `app.ts`: 修复重定向循环，添加代理检测
- CORS 设置支持域名访问

**Nginx 配置：**
- `nginx.conf`: 反向代理配置文件

## 部署步骤

### 1. 安装 Nginx
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

### 2. 配置 Nginx
```bash
# 复制配置文件
sudo cp nginx.conf /etc/nginx/sites-available/localhost:5173
sudo ln -s /etc/nginx/sites-available/localhost:5173 /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

### 3. 构建前端
```bash
cd client
npm install

# 使用生产环境配置构建（禁用WebSocket/HMR）
npm run build:prod

# 复制构建文件到 Nginx 目录
sudo mkdir -p /var/www/kindergarten
sudo cp -r dist/* /var/www/kindergarten/
sudo chown -R www-data:www-data /var/www/kindergarten
```

### 4. 启动后端服务
```bash
cd server
npm install
npm run build

# 使用 PM2 管理进程
npm install -g pm2
pm2 start dist/app.js --name kindergarten-api
```

### 5. 配置 SSL 证书
```bash
# 使用 Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d localhost:5173
```

## 验证步骤

1. 访问 `https://localhost:5173` 确认页面正常加载
2. 检查浏览器开发者工具网络标签，确认 API 请求指向 `https://localhost:5173/api`
3. **重要**：确认浏览器控制台没有 WebSocket 连接错误（如 `ws://localhost:24678` 连接失败）
4. 测试登录功能是否正常
5. 查看后端日志确认请求正常转发
6. 确认页面没有尝试连接 HMR WebSocket 服务

### WebSocket/HMR 禁用验证
- 打开浏览器开发者工具 → Network 标签
- 过滤显示 `WS`（WebSocket）连接
- 确认没有指向 `localhost:24678` 或其他开发环境 WebSocket 的连接尝试
- 控制台应显示 "阻止 WebSocket 连接" 的消息（如果有尝试连接）

## 安全注意事项

1. **后端服务器安全：**
   - 仅在 localhost:3000 监听，不对外网暴露
   - 使用防火墙限制对 3000 端口的直接访问

2. **Nginx 安全：**
   - 启用 SSL/TLS 加密
   - 设置合适的安全头
   - 限制上传文件大小

3. **访问控制：**
   - 配置 CORS 仅允许正当域名
   - 设置限流防止滥用

## 监控和日志

1. **Nginx 日志：**
   - 访问日志：`/var/log/nginx/localhost:5173.access.log`
   - 错误日志：`/var/log/nginx/localhost:5173.error.log`

2. **后端服务日志：**
   - PM2 日志：`pm2 logs kindergarten-api`
   - 应用日志：按照后端配置的日志路径

3. **性能监控：**
   - 使用 `pm2 monit` 监控进程状态
   - 配置监控告警通知

## 常见问题排查

1. **重定向循环：**
   - 检查 Nginx 配置是否正确
   - 确认后端服务没有与 Nginx 冲突的重定向逻辑

2. **API 请求失败：**
   - 检查后端服务是否正常运行
   - 查看 Nginx 错误日志
   - 确认网络连接正常

3. **静态文件加载失败：**
   - 检查文件路径和权限
   - 确认构建文件是否正确复制到 Nginx 目录