# 香港服务器部署检查清单

## 📋 部署前检查

### 本地环境检查
- [ ] Node.js 版本 >= 18.0.0
  ```bash
  node --version
  ```
- [ ] npm 版本 >= 8.0.0
  ```bash
  npm --version
  ```
- [ ] Git 已安装
  ```bash
  git --version
  ```
- [ ] SSH 工具已安装
  ```bash
  ssh -V
  ```

### SSH密钥检查
- [ ] SSH密钥存在
  ```bash
  ls -la ~/.ssh/id_ed25519
  ```
- [ ] SSH密钥权限正确 (600)
  ```bash
  ls -la ~/.ssh/id_ed25519 | grep "rw-------"
  ```
- [ ] SSH配置文件存在
  ```bash
  cat ~/.ssh/config | grep -A 5 "Host yisu"
  ```
- [ ] SSH连接测试成功
  ```bash
  ssh yisu "echo 'SSH连接成功'"
  ```

### 代码检查
- [ ] 代码已提交到Git
  ```bash
  git status
  ```
- [ ] 没有未提交的重要更改
  ```bash
  git diff --stat
  ```
- [ ] 前端代码完整
  ```bash
  ls -la client/src
  ```
- [ ] 后端代码完整
  ```bash
  ls -la server/src
  ```

### 配置文件检查
- [ ] 前端环境配置存在
  ```bash
  cat client/.env.production
  ```
- [ ] 后端环境配置存在
  ```bash
  cat server/.env.production
  ```
- [ ] 部署脚本存在
  ```bash
  ls -la deploy-to-hong-kong.sh
  ```

---

## 🔨 部署过程检查

### 编译阶段
- [ ] 前端编译成功
  ```bash
  cd client && npm run build && cd ..
  ```
- [ ] 前端dist目录生成
  ```bash
  ls -la client/dist
  ```
- [ ] 后端编译成功
  ```bash
  cd server && npm run build && cd ..
  ```
- [ ] 后端dist目录生成
  ```bash
  ls -la server/dist
  ```

### 上传阶段
- [ ] 远程目录创建成功
  ```bash
  ssh yisu "ls -la /home/szblade/yyup-deploy"
  ```
- [ ] 前端文件上传成功
  ```bash
  ssh yisu "ls -la /home/szblade/yyup-deploy/kyyup-client"
  ```
- [ ] 后端文件上传成功
  ```bash
  ssh yisu "ls -la /home/szblade/yyup-deploy/kyyup-server"
  ```
- [ ] 环境配置文件上传成功
  ```bash
  ssh yisu "cat /home/szblade/yyup-deploy/kyyup-server/.env | head -5"
  ```

### 启动阶段
- [ ] 前端依赖安装成功
  ```bash
  ssh yisu "ls -la /home/szblade/yyup-deploy/kyyup-client/node_modules" | head -5
  ```
- [ ] 后端依赖安装成功
  ```bash
  ssh yisu "ls -la /home/szblade/yyup-deploy/kyyup-server/node_modules" | head -5
  ```
- [ ] 前端服务启动成功
  ```bash
  ssh yisu "ps aux | grep 'npm run preview' | grep -v grep"
  ```
- [ ] 后端服务启动成功
  ```bash
  ssh yisu "ps aux | grep 'node dist/server.js' | grep -v grep"
  ```

---

## ✅ 部署后检查

### 端口检查
- [ ] 前端端口 6000 监听
  ```bash
  ssh yisu "netstat -tlnp | grep 6000"
  ```
- [ ] 后端端口 4000 监听
  ```bash
  ssh yisu "netstat -tlnp | grep 4000"
  ```

### 服务检查
- [ ] 前端服务响应正常
  ```bash
  curl -I http://103.210.237.249:6000
  ```
- [ ] 后端API响应正常
  ```bash
  curl -I http://103.210.237.249:4000/api-docs
  ```

### 数据库检查
- [ ] 数据库连接成功
  ```bash
  ssh yisu "mysql -h dbconn.sealoshzh.site -P 43906 -u root -p'Yyup@2024' -e 'SELECT 1'"
  ```
- [ ] 数据库表存在
  ```bash
  ssh yisu "mysql -h dbconn.sealoshzh.site -P 43906 -u root -p'Yyup@2024' kyyup -e 'SHOW TABLES' | head -10"
  ```

### 日志检查
- [ ] 前端日志无错误
  ```bash
  ssh yisu "tail -50 /home/szblade/yyup-deploy/kyyup-client/frontend.log | grep -i error"
  ```
- [ ] 后端日志无错误
  ```bash
  ssh yisu "tail -50 /home/szblade/yyup-deploy/kyyup-server/backend.log | grep -i error"
  ```

### 功能检查
- [ ] 前端页面加载正常
  - 访问 http://103.210.237.249:6000
  - 检查页面是否完整加载
  - 检查控制台是否有错误

- [ ] 后端API可访问
  - 访问 http://103.210.237.249:4000/api-docs
  - 检查Swagger文档是否加载
  - 尝试调用一个API端点

- [ ] 登录功能正常
  - 尝试登录
  - 检查Token是否正确生成
  - 检查权限是否正确

- [ ] 数据库操作正常
  - 查询用户列表
  - 创建新用户
  - 更新用户信息
  - 删除用户

---

## 🔄 部署后维护

### 日常检查
- [ ] 每天检查服务状态
  ```bash
  ./deploy-to-hong-kong.sh --check-status
  ```
- [ ] 每周检查日志
  ```bash
  ./deploy-to-hong-kong.sh --view-logs
  ```
- [ ] 每月检查磁盘使用
  ```bash
  ssh yisu "df -h"
  ```

### 备份
- [ ] 数据库备份
  ```bash
  ssh yisu "mysqldump -h dbconn.sealoshzh.site -P 43906 -u root -p'Yyup@2024' kyyup > kyyup-backup-$(date +%Y%m%d).sql"
  ```
- [ ] 配置文件备份
  ```bash
  ssh yisu "tar -czf config-backup-$(date +%Y%m%d).tar.gz /home/szblade/yyup-deploy"
  ```

### 更新
- [ ] 代码更新后重新编译
  ```bash
  ./deploy-to-hong-kong.sh --build-only
  ```
- [ ] 上传新版本
  ```bash
  ./deploy-to-hong-kong.sh --upload-only
  ```
- [ ] 重启服务
  ```bash
  ./deploy-to-hong-kong.sh --start-only
  ```

---

## 🆘 故障排查

### 如果部署失败

1. **检查日志**
   ```bash
   ./deploy-to-hong-kong.sh --view-logs
   ```

2. **检查服务状态**
   ```bash
   ./deploy-to-hong-kong.sh --check-status
   ```

3. **手动启动服务**
   ```bash
   ssh yisu "cd /home/szblade/yyup-deploy/kyyup-server && node dist/server.js"
   ```

4. **查看详细错误**
   ```bash
   ssh yisu "tail -100 /home/szblade/yyup-deploy/kyyup-server/backend.log"
   ```

### 常见问题

| 问题 | 解决方案 |
|------|--------|
| SSH连接失败 | 检查SSH密钥和配置 |
| 编译失败 | 清理node_modules，重新安装依赖 |
| 上传失败 | 检查网络连接和磁盘空间 |
| 服务无法启动 | 检查端口是否被占用 |
| 数据库连接失败 | 检查数据库配置和网络连接 |

---

## 📊 部署统计

| 项目 | 值 |
|------|-----|
| 前端端口 | 6000 |
| 后端端口 | 4000 |
| 数据库主机 | dbconn.sealoshzh.site |
| 数据库端口 | 43906 |
| 部署目录 | /home/szblade/yyup-deploy |
| 前端目录 | kyyup-client |
| 后端目录 | kyyup-server |

---

**最后更新**: 2025-10-25  
**版本**: v1.0  
**状态**: 生产就绪

