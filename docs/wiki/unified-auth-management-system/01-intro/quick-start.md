# 快速开始指南

## 🚀 快速部署统一认证管理系统

本指南将帮助您在15分钟内快速部署和启动统一认证管理系统。

## 📋 系统要求

### 最低要求
- **Node.js**: 18.0.0 或更高版本
- **MySQL**: 8.0 或更高版本
- **Redis**: 6.0 或更高版本
- **内存**: 8GB RAM
- **存储**: 20GB 可用空间

### 推荐配置
- **Node.js**: 20.x LTS
- **MySQL**: 8.0+
- **Redis**: 7.0+
- **内存**: 16GB RAM
- **存储**: 50GB SSD

## ⚡ 快速部署步骤

### 1. 环境准备

#### 安装 Node.js
```bash
# 使用 NodeSource 仓库（推荐）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version  # 应该显示 v20.x.x
npm --version   # 应该显示 10.x.x
```

#### 安装 MySQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# 安全配置
sudo mysql_secure_installation

# 启动服务
sudo systemctl start mysql
sudo systemctl enable mysql
```

#### 安装 Redis
```bash
# Ubuntu/Debian
sudo apt install redis-server

# 启动服务
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### 2. 获取项目代码

```bash
# 克隆项目
git clone https://github.com/your-repo/k.yyup.com.git
cd k.yyup.com

# 查看项目结构
ls -la
```

### 3. 数据库配置

```bash
# 登录 MySQL
sudo mysql -u root -p

# 创建数据库和用户
CREATE DATABASE kindergarten CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'kyyup_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON kindergarten.* TO 'kyyup_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# 验证数据库连接
mysql -u kyyup_user -p kindergarten -e "SELECT VERSION();"
```

### 4. 环境变量配置

```bash
# 复制环境变量模板
cp server/.env.example server/.env
cp client/.env.example client/.env

# 编辑后端环境变量
nano server/.env
```

**server/.env 配置示例**:
```bash
# 应用配置
NODE_ENV=development
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=kindergarten
DB_USER=kyyup_user
DB_PASSWORD=your_secure_password

# JWT 配置
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_REFRESH_EXPIRES_IN=7d

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379

# 其他配置保持默认即可
```

```bash
# 编辑前端环境变量
nano client/.env
```

**client/.env 配置示例**:
```bash
# API 配置
VITE_API_BASE_URL=http://localhost:3000/api

# 应用配置
VITE_APP_TITLE=统一认证管理系统
VITE_APP_VERSION=1.0.0
```

### 5. 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd client
npm install
cd ..

# 安装后端依赖
cd server
npm install
cd ..
```

### 6. 数据库初始化

```bash
# 进入后端目录
cd server

# 运行数据库迁移
npx sequelize-cli db:migrate

# 导入初始数据
npm run seed-data:complete

# 返回根目录
cd ..
```

### 7. 启动服务

#### 方法一：使用项目脚本（推荐）
```bash
# 同时启动前端和后端
npm run start:all

# 或者分别启动
npm run start:frontend  # 启动前端 (端口 5173)
npm run start:backend   # 启动后端 (端口 3000)
```

#### 方法二：手动启动
```bash
# 终端1：启动后端
cd server
npm run dev

# 终端2：启动前端
cd client
npm run dev
```

### 8. 验证部署

打开浏览器访问以下地址：

- **前端应用**: http://localhost:5173
- **后端API**: http://localhost:3000/api/health
- **API文档**: http://localhost:3000/api-docs

#### 默认登录账户
- **用户名**: admin
- **密码**: admin123

## 🐳 Docker 快速部署（可选）

如果您更熟悉 Docker，可以使用以下命令快速部署：

```bash
# 使用 Docker Compose
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

## 🧪 功能验证

### 1. 基础功能测试

#### 登录测试
1. 访问 http://localhost:5173
2. 使用默认账户登录：admin / admin123
3. 验证是否成功进入系统

#### 用户管理测试
1. 点击"用户管理"菜单
2. 查看用户列表
3. 尝试创建新用户

#### API 测试
```bash
# 测试健康检查
curl http://localhost:3000/api/health

# 测试API文档
curl http://localhost:3000/api-docs
```

### 2. 数据库验证

```bash
# 连接数据库验证表结构
mysql -u kyyup_user -p kindergarten

# 查看表列表
SHOW TABLES;

# 查看用户数据
SELECT id, username, email, status FROM users LIMIT 5;
```

## 🔧 常见问题解决

### 端口被占用
```bash
# 查看端口占用
lsof -i :3000
lsof -i :5173

# 杀死进程
kill -9 <PID>

# 或使用项目清理脚本
npm run clean
```

### 数据库连接失败
```bash
# 检查 MySQL 状态
sudo systemctl status mysql

# 重启 MySQL
sudo systemctl restart mysql

# 检查用户权限
mysql -u kyyup_user -p -e "SHOW GRANTS FOR CURRENT_USER();"
```

### 依赖安装失败
```bash
# 清理 npm 缓存
npm cache clean --force

# 删除 node_modules 重新安装
rm -rf node_modules package-lock.json
npm install

# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com
```

### 前端编译错误
```bash
# 检查 Node.js 版本
node --version  # 应该是 18.x 或更高

# 重新安装前端依赖
cd client
rm -rf node_modules package-lock.json
npm install
```

## 📊 性能测试

### 简单压力测试
```bash
# 安装压测工具
npm install -g loadtest

# 测试登录接口
loadtest -c 10 -n 100 -k http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -P '{"username":"admin","password":"admin123"}'

# 测试用户列表接口
loadtest -c 10 -n 100 -k http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔒 安全配置

### 1. 修改默认密码
```bash
# 登录系统后立即修改管理员密码
# 或者直接在数据库中修改
mysql -u kyyup_user -p kindergarten
UPDATE users SET password = '$2b$12$NEW_HASHED_PASSWORD' WHERE username = 'admin';
```

### 2. 配置 HTTPS（生产环境）
```bash
# 使用 Let's Encrypt 获取免费 SSL 证书
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 3. 环境变量安全
```bash
# 设置适当的文件权限
chmod 600 server/.env
chmod 600 client/.env

# 不要将 .env 文件提交到版本控制
echo ".env" >> .gitignore
```

## 📈 监控和维护

### 1. 日志查看
```bash
# 查看应用日志
tail -f server/logs/app.log

# 查看 Nginx 日志（如果使用）
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. 数据备份
```bash
# 创建数据库备份
mysqldump -u kyyup_user -p kindergarten > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢复数据库
mysql -u kyyup_user -p kindergarten < backup_file.sql
```

### 3. 服务监控
```bash
# 检查服务状态
pm2 status

# 重启服务
pm2 restart all

# 查看详细日志
pm2 logs
```

## 📚 下一步

部署成功后，您可以：

1. **阅读完整文档**: 查看 `/docs/wiki/unified-auth-management-system/` 目录下的详细文档
2. **配置生产环境**: 参考 [部署指南](../04-deployment/deployment-guide.md)
3. **自定义配置**: 根据需要调整系统配置
4. **开发新功能**: 参考 [开发指南](../05-development/development-workflow.md)

## 🆘 获取帮助

如果遇到问题，可以通过以下方式获取帮助：

- 📧 **邮件支持**: support@yyup.com
- 💬 **在线文档**: 查看完整技术文档
- 🐛 **问题反馈**: 在 GitHub 上提交 Issue
- 📱 **技术热线**: 400-xxx-xxxx

---

**🎉 恭喜！您已成功部署统一认证管理系统！**

现在可以开始使用系统的各项功能了。建议您先熟悉基本操作，然后根据实际需求进行个性化配置。

**最后更新**: 2025-11-29
**文档版本**: v1.0.0