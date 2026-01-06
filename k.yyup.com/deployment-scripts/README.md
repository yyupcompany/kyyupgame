# 🚀 部署脚本目录

这个目录包含所有用于部署到香港服务器的脚本和文档。

## 📁 目录结构

```
deployment-scripts/
├── README.md                           # 本文件
├── deploy-to-hong-kong.sh              # 主部署脚本
├── quick-deploy.sh                     # 快速启动脚本
├── deploy-config.json                  # 部署配置
├── DEPLOYMENT_README.md                # 快速导航
├── DEPLOYMENT_SUMMARY.md               # 部署总结
├── DEPLOYMENT_CHECKLIST.md             # 检查清单
├── DEPLOYMENT_COMPLETION_REPORT.md     # 完成报告
└── HONG_KONG_DEPLOYMENT_GUIDE.md       # 详细指南
```

## 🚀 快速开始

### 1. 配置SSH (5分钟)

```bash
# 生成SSH密钥
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ""

# 配置SSH
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

### 2. 执行部署 (5-10分钟)

```bash
# 进入部署脚本目录
cd deployment-scripts

# 完整部署（编译+上传+启动）
./deploy-to-hong-kong.sh --full
```

### 3. 验证部署 (2分钟)

```bash
# 检查服务状态
./deploy-to-hong-kong.sh --check-status

# 访问应用
# 前端: http://103.210.237.249:6000
# 后端: http://103.210.237.249:4000
```

## 📖 文档说明

| 文档 | 说明 |
|------|------|
| **DEPLOYMENT_README.md** | 快速入门指南 |
| **DEPLOYMENT_SUMMARY.md** | 部署完成总结 |
| **HONG_KONG_DEPLOYMENT_GUIDE.md** | 详细部署指南 |
| **DEPLOYMENT_CHECKLIST.md** | 部署检查清单 |
| **DEPLOYMENT_COMPLETION_REPORT.md** | 完成报告 |

## 🔧 脚本说明

### deploy-to-hong-kong.sh (主部署脚本)

**完整部署** (推荐)
```bash
./deploy-to-hong-kong.sh --full
```

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

### quick-deploy.sh (快速启动脚本)

交互式菜单选择部署方式：
```bash
./quick-deploy.sh
```

## 🎯 部署配置

### 服务器信息
```
IP: 103.210.237.249
用户: szblade
SSH端口: 22
SSH别名: yisu
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

## 🔗 访问地址

| 服务 | 地址 |
|------|------|
| 前端应用 | http://103.210.237.249:6000 |
| 后端API | http://103.210.237.249:4000 |
| API文档 | http://103.210.237.249:4000/api-docs |

## 🆘 常见问题

### Q: SSH连接失败怎么办?
A: 检查SSH密钥和配置
```bash
ssh -v yisu
ls -la ~/.ssh/id_ed25519
```

### Q: 编译失败怎么办?
A: 清理依赖并重新安装
```bash
rm -rf ../client/node_modules ../server/node_modules
cd .. && npm install
npm run build
```

### Q: 服务无法启动怎么办?
A: 检查端口和日志
```bash
./deploy-to-hong-kong.sh --check-status
./deploy-to-hong-kong.sh --view-logs
```

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

## 📝 使用流程

```
1. 配置SSH密钥
   ↓
2. 测试SSH连接
   ↓
3. 进入deployment-scripts目录
   ↓
4. 执行部署脚本
   ↓
5. 验证部署成功
   ↓
6. 访问应用
```

## 📞 技术支持

- 服务商: Yisu Cloud Computing Service
- 网站: www.yisu.com
- 电话: 400-100-2938
- 支持: 7×24小时

---

**最后更新**: 2025-10-26  
**版本**: v1.0  
**状态**: ✅ 完成

