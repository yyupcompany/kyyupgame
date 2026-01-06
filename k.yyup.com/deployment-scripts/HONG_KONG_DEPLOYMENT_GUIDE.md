# 香港服务器部署指南

## 📋 概述

本指南说明如何将幼儿园管理系统部署到香港服务器。

**服务器信息**:
- IP: 103.210.237.249
- 用户: szblade
- SSH端口: 22
- 操作系统: Ubuntu 22.04.2 LTS

**部署配置**:
- 前端端口: 6000
- 后端端口: 4000
- 数据库: 远端 (dbconn.sealoshzh.site:43906)

---

## 🚀 快速开始

### 1. 前置条件

确保本地已安装:
- Node.js >= 18.0.0
- npm >= 8.0.0
- ssh 和 scp 工具
- Git

### 2. 配置SSH密钥

```bash
# 检查SSH密钥
ls -la ~/.ssh/id_ed25519

# 如果没有，生成新密钥
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ""

# 添加到SSH配置 (~/.ssh/config)
Host yisu
    HostName 103.210.237.249
    User szblade
    IdentityFile ~/.ssh/id_ed25519
    Port 22
```

### 3. 测试连接

```bash
# 测试SSH连接
ssh yisu "echo 'SSH连接成功'"

# 应该输出: SSH连接成功
```

### 4. 执行部署

```bash
# 给脚本执行权限
chmod +x deploy-to-hong-kong.sh

# 完整部署（编译+上传+启动）
./deploy-to-hong-kong.sh --full

# 或仅编译
./deploy-to-hong-kong.sh --build-only

# 或仅上传
./deploy-to-hong-kong.sh --upload-only

# 或仅启动
./deploy-to-hong-kong.sh --start-only
```

---

## 📦 部署脚本选项

### 完整部署
```bash
./deploy-to-hong-kong.sh --full
```
执行: 编译 → 上传 → 启动

### 仅编译
```bash
./deploy-to-hong-kong.sh --build-only
```
编译前端和后端，生成dist目录

### 仅上传
```bash
./deploy-to-hong-kong.sh --upload-only
```
上传已编译的文件到服务器

### 仅启动
```bash
./deploy-to-hong-kong.sh --start-only
```
启动远端服务

### 仅部署前端
```bash
./deploy-to-hong-kong.sh --frontend-only
```
编译、上传、启动前端

### 仅部署后端
```bash
./deploy-to-hong-kong.sh --backend-only
```
编译、上传、启动后端

### 检查状态
```bash
./deploy-to-hong-kong.sh --check-status
```
查看服务运行状态

### 查看日志
```bash
./deploy-to-hong-kong.sh --view-logs
```
查看远端服务日志

---

## 🔧 手动部署步骤

如果脚本出现问题，可以手动执行以下步骤:

### 1. 编译前端

```bash
cd client
export VITE_DEV_PORT=6000
export VITE_API_PROXY_TARGET=http://localhost:4000
npm install
npm run build
cd ..
```

### 2. 编译后端

```bash
cd server
export PORT=4000
export NODE_ENV=production
npm install
npm run build
cd ..
```

### 3. 上传文件

```bash
# 创建远程目录
ssh yisu "mkdir -p /home/szblade/yyup-deploy/kyyup-client"
ssh yisu "mkdir -p /home/szblade/yyup-deploy/kyyup-server"

# 上传前端
scp -r client/dist/* yisu:/home/szblade/yyup-deploy/kyyup-client/
scp client/package.json yisu:/home/szblade/yyup-deploy/kyyup-client/

# 上传后端
scp -r server/dist/* yisu:/home/szblade/yyup-deploy/kyyup-server/
scp server/package.json yisu:/home/szblade/yyup-deploy/kyyup-server/
scp server/.env.production yisu:/home/szblade/yyup-deploy/kyyup-server/.env
```

### 4. 启动服务

```bash
# 启动前端
ssh yisu << 'EOF'
cd /home/szblade/yyup-deploy/kyyup-client
npm install --production
nohup npm run preview -- --port 6000 > frontend.log 2>&1 &
EOF

# 启动后端
ssh yisu << 'EOF'
cd /home/szblade/yyup-deploy/kyyup-server
npm install --production
export PORT=4000
export NODE_ENV=production
export DB_HOST=dbconn.sealoshzh.site
export DB_PORT=43906
export DB_USER=root
export DB_PASSWORD=Yyup@2024
export DB_NAME=kyyup
nohup node dist/server.js > backend.log 2>&1 &
EOF
```

---

## 📊 访问应用

部署完成后，可以通过以下地址访问:

- **前端应用**: http://103.210.237.249:6000
- **后端API**: http://103.210.237.249:4000
- **API文档**: http://103.210.237.249:4000/api-docs

---

## 🔍 故障排查

### 1. SSH连接失败

```bash
# 测试连接
ssh -v yisu

# 检查密钥权限
ls -la ~/.ssh/id_ed25519
# 应该是: -r-------- (600)

# 修复权限
chmod 600 ~/.ssh/id_ed25519
chmod 700 ~/.ssh
```

### 2. 编译失败

```bash
# 清理依赖
rm -rf client/node_modules server/node_modules
rm -rf client/dist server/dist

# 重新安装
cd client && npm install && cd ..
cd server && npm install && cd ..

# 重新编译
npm run build
```

### 3. 服务无法启动

```bash
# 检查端口是否被占用
ssh yisu "netstat -tlnp | grep -E ':6000|:4000'"

# 查看服务日志
ssh yisu "tail -100 /home/szblade/yyup-deploy/kyyup-client/frontend.log"
ssh yisu "tail -100 /home/szblade/yyup-deploy/kyyup-server/backend.log"

# 手动启动并查看错误
ssh yisu "cd /home/szblade/yyup-deploy/kyyup-server && node dist/server.js"
```

### 4. 数据库连接失败

```bash
# 检查数据库配置
ssh yisu "cat /home/szblade/yyup-deploy/kyyup-server/.env | grep DB_"

# 测试数据库连接
ssh yisu "mysql -h dbconn.sealoshzh.site -P 43906 -u root -p'Yyup@2024' -e 'SELECT 1'"
```

---

## 📝 环境变量配置

### 后端环境变量 (.env.production)

```
PORT=4000
NODE_ENV=production
DB_HOST=dbconn.sealoshzh.site
DB_PORT=43906
DB_USER=root
DB_PASSWORD=Yyup@2024
DB_NAME=kyyup
```

### 前端环境变量 (.env.production)

```
VITE_DEV_PORT=6000
VITE_API_PROXY_TARGET=http://localhost:4000
VITE_APP_URL=http://103.210.237.249:6000
```

---

## 🔄 更新部署

### 更新前端

```bash
./deploy-to-hong-kong.sh --frontend-only
```

### 更新后端

```bash
./deploy-to-hong-kong.sh --backend-only
```

### 完整更新

```bash
./deploy-to-hong-kong.sh --full
```

---

## 📊 监控和维护

### 检查服务状态

```bash
./deploy-to-hong-kong.sh --check-status
```

### 查看日志

```bash
./deploy-to-hong-kong.sh --view-logs
```

### 手动检查

```bash
# 检查进程
ssh yisu "ps aux | grep -E 'npm|node' | grep -v grep"

# 检查端口
ssh yisu "netstat -tlnp | grep -E ':6000|:4000'"

# 检查磁盘
ssh yisu "df -h"

# 检查内存
ssh yisu "free -h"
```

---

## 🆘 技术支持

### 常见问题

**Q: 如何重启服务?**
A: 
```bash
ssh yisu "pkill -f 'npm run preview'"
ssh yisu "pkill -f 'node dist/server.js'"
./deploy-to-hong-kong.sh --start-only
```

**Q: 如何查看实时日志?**
A:
```bash
ssh yisu "tail -f /home/szblade/yyup-deploy/kyyup-server/backend.log"
```

**Q: 如何清理旧文件?**
A:
```bash
ssh yisu "rm -rf /home/szblade/yyup-deploy/kyyup-client/dist"
ssh yisu "rm -rf /home/szblade/yyup-deploy/kyyup-server/dist"
```

---

## 📞 联系方式

- 服务商: Yisu Cloud Computing Service
- 网站: www.yisu.com
- 电话: 400-100-2938
- 服务: 7×24小时技术支持

---

**最后更新**: 2025-10-25  
**版本**: v1.0  
**状态**: 生产就绪

