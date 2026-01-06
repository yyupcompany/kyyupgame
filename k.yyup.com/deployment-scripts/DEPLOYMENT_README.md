# 🚀 香港服务器部署指南

## 📌 快速导航

| 文档 | 说明 |
|------|------|
| **DEPLOYMENT_SUMMARY.md** | 📋 部署完成总结 - 从这里开始 |
| **HONG_KONG_DEPLOYMENT_GUIDE.md** | 📖 详细部署指南 |
| **DEPLOYMENT_CHECKLIST.md** | ✅ 部署检查清单 |
| **deploy-to-hong-kong.sh** | 🔧 主部署脚本 |
| **quick-deploy.sh** | ⚡ 快速启动脚本 |

---

## ⚡ 5分钟快速开始

### 1️⃣ 配置SSH

```bash
# 检查SSH密钥
ls -la ~/.ssh/id_ed25519

# 如果没有，生成新密钥
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ""

# 添加到SSH配置 (~/.ssh/config)
cat >> ~/.ssh/config << 'EOF'
Host yisu
    HostName 103.210.237.249
    User szblade
    IdentityFile ~/.ssh/id_ed25519
    Port 22
EOF

# 测试连接
ssh yisu "echo 'SSH连接成功'"
```

### 2️⃣ 执行部署

```bash
# 给脚本执行权限
chmod +x deploy-to-hong-kong.sh

# 完整部署（编译+上传+启动）
./deploy-to-hong-kong.sh --full
```

### 3️⃣ 验证部署

```bash
# 检查服务状态
./deploy-to-hong-kong.sh --check-status

# 访问应用
# 前端: http://103.210.237.249:6000
# 后端: http://103.210.237.249:4000
```

---

## 📚 详细文档

### 🎯 部署总结
**文件**: `DEPLOYMENT_SUMMARY.md`

包含:
- ✅ 已完成的工作
- 📊 部署配置总结
- 🔗 访问地址
- 📁 文件清单
- ✅ 验证清单

### 📖 部署指南
**文件**: `HONG_KONG_DEPLOYMENT_GUIDE.md`

包含:
- 🚀 快速开始
- 📦 部署脚本选项
- 🔧 手动部署步骤
- 🔍 故障排查
- 📝 环境变量配置

### ✅ 检查清单
**文件**: `DEPLOYMENT_CHECKLIST.md`

包含:
- 📋 部署前检查
- 🔨 部署过程检查
- ✅ 部署后检查
- 🔄 部署后维护
- 🆘 故障排查

---

## 🔧 部署脚本

### 主部署脚本: `deploy-to-hong-kong.sh`

**完整部署** (推荐)
```bash
./deploy-to-hong-kong.sh --full
```
执行: 编译 → 上传 → 启动

**仅编译**
```bash
./deploy-to-hong-kong.sh --build-only
```

**仅上传**
```bash
./deploy-to-hong-kong.sh --upload-only
```

**仅启动**
```bash
./deploy-to-hong-kong.sh --start-only
```

**仅部署前端**
```bash
./deploy-to-hong-kong.sh --frontend-only
```

**仅部署后端**
```bash
./deploy-to-hong-kong.sh --backend-only
```

**检查状态**
```bash
./deploy-to-hong-kong.sh --check-status
```

**查看日志**
```bash
./deploy-to-hong-kong.sh --view-logs
```

### 快速启动脚本: `quick-deploy.sh`

交互式菜单选择部署方式:
```bash
./quick-deploy.sh
```

---

## 📊 部署配置

### 服务器信息
```
IP: 103.210.237.249
用户: szblade
SSH端口: 22
SSH别名: yisu
操作系统: Ubuntu 22.04.2 LTS
```

### 端口配置
```
前端: 6000
后端: 4000
数据库: 43906
```

### 数据库配置
```
主机: dbconn.sealoshzh.site
端口: 43906
用户: root
密码: Yyup@2024
数据库: kyyup
```

### 部署目录
```
基目录: /home/szblade/yyup-deploy
前端: kyyup-client
后端: kyyup-server
```

---

## 🔗 访问地址

| 服务 | 地址 |
|------|------|
| 前端应用 | http://103.210.237.249:6000 |
| 后端API | http://103.210.237.249:4000 |
| API文档 | http://103.210.237.249:4000/api-docs |

---

## 📝 环境变量

### 前端 (.env.production)
```
VITE_DEV_PORT=6000
VITE_API_PROXY_TARGET=http://localhost:4000
VITE_APP_URL=http://103.210.237.249:6000
```

### 后端 (.env.production)
```
PORT=4000
NODE_ENV=production
DB_HOST=dbconn.sealoshzh.site
DB_PORT=43906
DB_USER=root
DB_PASSWORD=Yyup@2024
DB_NAME=kyyup
```

---

## 🆘 常见问题

### Q: SSH连接失败怎么办?
A: 检查SSH密钥和配置
```bash
ssh -v yisu
ls -la ~/.ssh/id_ed25519
cat ~/.ssh/config | grep -A 5 "Host yisu"
```

### Q: 编译失败怎么办?
A: 清理依赖并重新安装
```bash
rm -rf client/node_modules server/node_modules
npm install
npm run build
```

### Q: 服务无法启动怎么办?
A: 检查端口和日志
```bash
./deploy-to-hong-kong.sh --check-status
./deploy-to-hong-kong.sh --view-logs
```

### Q: 如何更新代码?
A: 重新编译并部署
```bash
./deploy-to-hong-kong.sh --full
```

### Q: 如何查看实时日志?
A: 使用SSH查看
```bash
ssh yisu "tail -f /home/szblade/yyup-deploy/kyyup-server/backend.log"
```

---

## 📋 部署检查清单

### 部署前
- [ ] SSH密钥已配置
- [ ] SSH连接测试成功
- [ ] 代码已提交
- [ ] 依赖已安装

### 部署中
- [ ] 前端编译成功
- [ ] 后端编译成功
- [ ] 文件上传成功
- [ ] 依赖安装成功

### 部署后
- [ ] 前端服务运行 (端口6000)
- [ ] 后端服务运行 (端口4000)
- [ ] 数据库连接正常
- [ ] API可访问
- [ ] 前端页面加载正常

---

## 📞 技术支持

### 服务商
- 名称: Yisu Cloud Computing Service
- 网站: www.yisu.com
- 电话: 400-100-2938
- 支持: 7×24小时

### 文档
- 部署总结: `DEPLOYMENT_SUMMARY.md`
- 详细指南: `HONG_KONG_DEPLOYMENT_GUIDE.md`
- 检查清单: `DEPLOYMENT_CHECKLIST.md`

---

## 🎯 下一步

1. ✅ 阅读 `DEPLOYMENT_SUMMARY.md`
2. ✅ 配置SSH密钥
3. ✅ 执行 `./deploy-to-hong-kong.sh --full`
4. ✅ 验证部署成功
5. ✅ 访问应用

---

## 📊 项目信息

| 项目 | 值 |
|------|-----|
| 项目名 | 幼儿园管理系统 (KYYUP) |
| 前端框架 | Vue 3 + TypeScript + Vite |
| 后端框架 | Express.js + TypeScript |
| 数据库 | MySQL |
| 部署方式 | 自动化脚本 |
| 部署时间 | 5-10分钟 |
| 系统状态 | 🟢 生产就绪 |

---

**最后更新**: 2025-10-26  
**版本**: v1.0  
**状态**: ✅ 完成

