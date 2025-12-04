# 幼儿园管理系统部署进度文档

## 📋 项目概述

**项目名称**: 幼儿园管理系统 (KYYUP)  
**部署服务器**: 47.94.82.59 (SSH root 用户)  
**部署日期**: 2025-12-02  
**系统架构**: 多租户 SaaS 系统

### 核心系统
1. **k.yyup.cc** - 幼儿园租户系统 (Demo系统 + 业务系统)
   - 前端端口: 443 (HTTPS)
   - 后端端口: 3000
   - 数据库: kargerdensales

2. **rent.yyup.cc** - 统一认证中心
   - 前端端口: 443 (HTTPS)
   - 后端端口: 4001
   - 数据库: admin_tenant_management

---

## ✅ 已完成的工作

### 1. DNS 配置更新
- ✅ 更新 `k.yyup.cc` A 记录: 192.168.1.243 → **47.94.82.59**
- ✅ 更新 `rent.yyup.cc` A 记录: 192.168.1.103 → **47.94.82.59**
- ✅ DNS 解析验证成功

### 2. 环境变量配置 (HTTPS 化)
已更新以下文件为 HTTPS:

**统一认证系统** (`unified-tenant-system/`)
- ✅ `server/.env`: SERVER_URL, FRONTEND_URL, TENANT_BUSINESS_URL → HTTPS
- ✅ `client/.env`: VITE_APP_URL, VITE_TENANT_BUSINESS_URL → HTTPS
- ✅ `.env`: UNIFIED_AUTH_CENTER_BASE_URL, TENANT_BUSINESS_URL → HTTPS
- ✅ `.env.example`: 添加生产环境 HTTPS 示例

**幼儿园租户系统** (`k.yyup.com/`)
- ✅ `server/.env`: SERVER_URL, FRONTEND_URL, UNIFIED_AUTH_CENTER_URL → HTTPS
- ✅ `client/.env`: VITE_APP_URL, VITE_UNIFIED_AUTH_CENTER_URL → HTTPS
- ✅ `client/.env.production`: API 地址更新为 HTTPS
- ✅ `.env.example`: 添加生产环境 HTTPS 示例

### 3. 部署配置更新
- ✅ `ecosystem.config.js` (PM2): 
  - 后端服务环境变量更新为 HTTPS
  - 添加 TARGET_IP, SERVER_IP 配置
  - 添加 UNIFIED_AUTH_URL 为 HTTPS

- ✅ `nginx-kyyup.conf`:
  - HTTP 重定向到 HTTPS
  - SSL 证书配置 (使用 yyup.cc 通配符证书)
  - API 代理配置正确

### 4. 新租户 DNS 配置
- ✅ `unified-tenant-system/server/.env`: TARGET_IP=47.94.82.59, SERVER_IP=47.94.82.59
- ✅ `unified-tenant-system/.env`: 更新为部署服务器 IP
- ✅ 新租户开通时自动指向部署服务器

### 5. OpenAI 配置移除
- ✅ `unified-tenant-system/server/.env`: 移除 OPENAI_* 配置
- ✅ `k.yyup.com/server/.env`: 移除 OPENAI_* 配置
- ✅ `.env.example` 文件: 更新为 AIBridge 配置说明
- ✅ 所有系统现在使用 AIBridge 桥接从 aimodel 部署获取

### 6. 前端构建修复
- ✅ 修复 `PerformanceRulesList.vue`: 移除重复 class 属性
- ✅ 修复 Vant 4 组件兼容性问题
- ✅ 修复 SCSS 导入路径
- ✅ 修复组件导入路径
- ✅ 修复 SCSS 过时函数 (`map-get`/`map-has-key` → `map.get`/`map.has-key`)
- ✅ 修复 Vue 3 scoped CSS `:deep()` 选择器语法问题
- ✅ 修复 Vant API 弃用警告 (`showAlertDialog` → `showDialog`, `showShareSheet` 移除)
- ✅ 修复重复键错误
- ✅ 完成 `k.yyup.com/client` 构建

---

## 🔄 进行中的工作

### 前端构建
- ✅ `k.yyup.com/client`: npm run build (已完成)
- ✅ `unified-tenant-system/client`: npm run build (已完成 - 2025-12-02)

---

## ⏳ 待完成的工作

### 1. 前端构建完成
- ✅ 完成 k.yyup.com/client 构建
- ✅ 完成 unified-tenant-system/client 构建 (2025-12-02)
- ✅ 验证构建输出 (dist 目录)

### 2. 后端构建
- [ ] 构建 k.yyup.com/server
- [ ] 构建 unified-tenant-system/server

### 3. 服务器部署
- [ ] 创建 SSH 密钥文件 (/tmp/server_key)
- [ ] 同步前端文件到 `/var/www/kyyup/k.yyup.com/client/`
- [ ] 同步前端文件到 `/var/www/kyyup/rent.yyup.com/client/`
- [ ] 同步后端文件到 `/var/www/kyyup/k.yyup.com/server/`
- [ ] 同步后端文件到 `/var/www/kyyup/rent.yyup.com/server/`

### 4. 服务器配置
- [ ] 安装 Node.js 依赖 (npm install --production)
- [ ] 配置 Nginx
- [ ] 申请/配置 SSL 证书
- [ ] 启动 PM2 进程

### 5. 服务验证
- [ ] 验证 k.yyup.cc 前端访问
- [ ] 验证 rent.yyup.cc 前端访问
- [ ] 验证 API 健康检查
- [ ] 验证登录功能
- [ ] 验证租户系统功能

---

## 📁 部署目录结构

```
/var/www/kyyup/
├── k.yyup.com/
│   ├── client/          # 前端构建输出 (dist)
│   └── server/          # 后端源代码
├── rent.yyup.com/
│   ├── client/          # 前端构建输出 (dist)
│   └── server/          # 后端源代码
└── shared/
    └── logs/            # 共享日志目录
        ├── k-yyup-error.log
        ├── k-yyup-out.log
        ├── rent-yyup-error.log
        └── rent-yyup-out.log
```

---

## 🔑 关键配置信息

### 数据库
- **主机**: dbconn.sealoshzh.site:43906
- **用户**: root
- **密码**: pwk5ls7j
- **数据库**:
  - kargerdensales (幼儿园系统)
  - admin_tenant_management (认证系统)

### 服务端口
- **k.yyup.cc 后端**: 3000
- **rent.yyup.cc 后端**: 4001
- **Nginx**: 80 (HTTP重定向), 443 (HTTPS)

### SSL 证书
- **证书路径**: /etc/letsencrypt/live/yyup.cc/
- **证书类型**: 通配符证书 (*.yyup.cc)

### PM2 应用名称
- `k-yyup-backend` - 幼儿园系统后端
- `rent-yyup-backend` - 统一认证系统后端

---

## 📝 部署脚本

**主部署脚本**: `k.yyup.com/deploy.sh`

使用方法:
```bash
# 部署所有系统
./deploy.sh all

# 只部署幼儿园系统
./deploy.sh k

# 只部署认证系统
./deploy.sh rent

# 只配置 Nginx
./deploy.sh nginx

# 只申请 SSL 证书
./deploy.sh ssl
```

---

## 🚀 下一步行动

1. **完成前端构建** - 验证 dist 目录生成
2. **执行部署脚本** - `./deploy.sh all`
3. **验证服务** - 访问 https://k.yyup.cc 和 https://rent.yyup.cc
4. **测试功能** - 登录、租户管理等

---

## � SSH 配置

### 服务器信息
- **IP 地址**: 47.94.82.59
- **SSH 端口**: 22
- **SSH 用户**: root
- **认证方式**: RSA 私钥

### SSH 私钥
```
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAsfJ1OpROvfABCrcNryiNjw9Rya+4ZMZCfTshlM+cs5K/uVMK
a4EpH72g2GASjsIgdfpQyTOdzjLfSUAu88ZZjxFMw+0177YW+xMDnriLA7Xao6MH
saP6qwhRdoYPOse0C9n9uywHBS9mTwLUn6DoOxFnarui9j/n3m0pgUFXFvn5Q6Qf
/6cyYqmBs0jXnn06LJX4Wlz6bdPjbxcCA9tD6AuWMYfrh9NJYVM1MdR8oWKZ7fRl
Hg7y/yefVapyBl86SVlSGPE/wU/P+ADKyUMkypU6fB//AyaqayEnBBYSJqeeRUHb
XV17x92KSCMFhHMi5mtcPbjqe3m4vZ/TrXS0hQIDAQABAoIBAFid0u16QABszkgE
wybQfjaZPXTAMobVCPWOhfmyrmnrEdl71juVVeJ9r+Uxaux3F...cIT2PXcK18ra4+ehyYwqIXa3qWTwkHd7UxRKT/H
SpjiQd5V68Yk7j6NU7ODLguH5sllXF9OuzCOJ1NA+qTBX9O+c21UB4r8NNsdj0WW
E3J4OQKBgAJoW0WfvP0K/OKwgZCGx7xHIUC0z9D4hzRlvpyghr9i8zowJ0IlnkSm
KQCr+8cHOyF1S4Rox9fMtVpDdxmzLbCXCqz4FKrCnfMTrOAGs6efq2rQtXeDO8me
U+YXTre89Sr+kNVdIPMKw8y/gOuamHtcm+ClKIq7KFqK3iZMUo5L
-----END RSA PRIVATE KEY-----
```

### SSH 连接方式

**方式1: 使用私钥文件**
```bash
# 保存私钥到本地
cat > ~/.ssh/kyyup_server_key << 'EOF'
[粘贴上面的私钥内容]
EOF

# 设置权限
chmod 600 ~/.ssh/kyyup_server_key

# 连接服务器
ssh -i ~/.ssh/kyyup_server_key root@47.94.82.59
```

**方式2: 使用部署脚本 (推荐)**
```bash
# 脚本会自动使用 /tmp/server_key
# 确保私钥已保存到 /tmp/server_key
cat > /tmp/server_key << 'EOF'
[粘贴上面的私钥内容]
EOF

chmod 600 /tmp/server_key

# 执行部署
./k.yyup.com/deploy.sh all
```

### SSH 常用命令

```bash
# 查看服务器信息
ssh -i ~/.ssh/kyyup_server_key root@47.94.82.59 "uname -a"

# 查看磁盘使用
ssh -i ~/.ssh/kyyup_server_key root@47.94.82.59 "df -h"

# 查看进程
ssh -i ~/.ssh/kyyup_server_key root@47.94.82.59 "pm2 list"

# 查看日志
ssh -i ~/.ssh/kyyup_server_key root@47.94.82.59 "tail -f /var/www/kyyup/shared/logs/k-yyup-error.log"

# 重启服务
ssh -i ~/.ssh/kyyup_server_key root@47.94.82.59 "pm2 restart k-yyup-backend"
```

### 服务器目录结构

```
/var/www/kyyup/
├── k.yyup.com/
│   ├── client/          # 前端构建输出
│   └── server/          # 后端源代码
├── rent.yyup.com/
│   ├── client/          # 前端构建输出
│   └── server/          # 后端源代码
└── shared/
    └── logs/            # 日志目录

/etc/nginx/
├── sites-available/
│   └── kyyup.cc         # Nginx 配置文件
└── sites-enabled/
    └── kyyup.cc         # Nginx 配置软链接

/etc/letsencrypt/live/yyup.cc/
├── fullchain.pem        # SSL 证书链
└── privkey.pem          # SSL 私钥
```

### 服务管理

**PM2 命令**
```bash
# 查看所有进程
pm2 list

# 查看特定进程日志
pm2 logs k-yyup-backend
pm2 logs rent-yyup-backend

# 重启进程
pm2 restart k-yyup-backend
pm2 restart rent-yyup-backend

# 停止进程
pm2 stop k-yyup-backend
pm2 stop rent-yyup-backend

# 启动进程
pm2 start ecosystem.config.js
```

**Nginx 命令**
```bash
# 测试配置
nginx -t

# 重载配置
systemctl reload nginx

# 重启 Nginx
systemctl restart nginx

# 查看状态
systemctl status nginx
```

---

## �📞 联系信息

**部署服务器**: 47.94.82.59
**SSH 用户**: root
**SSH 端口**: 22
**SSH 密钥**: /tmp/server_key (部署脚本使用)


