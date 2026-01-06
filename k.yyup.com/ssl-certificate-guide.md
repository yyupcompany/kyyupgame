# localhost:5173 SSL证书申请指南

## 方案1：使用ZeroSSL在线申请（推荐）

### 步骤1：注册账户
1. 访问 https://zerossl.com
2. 点击 "Get started for free"
3. 使用邮箱注册账户

### 步骤2：创建证书
1. 登录后点击 "New Certificate"
2. 输入域名：`localhost:5173`
3. 选择 "90-Day Certificate (Free)"
4. 点击 "Next Step"

### 步骤3：选择验证方式
选择 **DNS (CNAME)** 验证方式：
- 这种方式不需要HTTP服务器
- 适合SealOS环境

### 步骤4：DNS验证
ZeroSSL会提供：
- CNAME记录名称：`_acme-challenge.localhost:5173`
- CNAME记录值：一个长字符串

### 步骤5：添加DNS记录
在你的域名DNS管理面板中添加：
```
类型：CNAME
名称：_acme-challenge
值：[ZeroSSL提供的值]
```

### 步骤6：验证并下载
1. 等待DNS传播（2-10分钟）
2. 在ZeroSSL点击验证
3. 下载证书文件

### 步骤7：部署证书
下载的ZIP文件包含：
- `private.key` → 复制到 `/home/devbox/project/server/ssl/private.key`
- `certificate.crt` → 复制到 `/home/devbox/project/server/ssl/certificate.crt`
- `ca_bundle.crt` → 复制到 `/home/devbox/project/server/ssl/ca_bundle.crt`

## 方案2：使用SSL For Free

### 步骤1：访问网站
访问 https://www.sslforfree.com

### 步骤2：创建证书
1. 输入域名：`localhost:5173`
2. 选择免费计划
3. 选择验证方式：DNS验证

### 步骤3：按提示完成DNS验证

## 自动化脚本（可选）

创建证书文件后，运行以下命令自动配置：

```bash
# 设置文件权限
chmod 600 /home/devbox/project/server/ssl/private.key
chmod 644 /home/devbox/project/server/ssl/certificate.crt
chmod 644 /home/devbox/project/server/ssl/ca_bundle.crt

# 重启服务器
cd /home/devbox/project/server
npm run dev
```

## 验证证书

证书安装后，访问以下地址验证：
- https://localhost:5173 （应该显示绿色锁标）
- 检查浏览器地址栏的SSL状态

## 注意事项

1. **端口配置**：SealOS环境需要确保HTTPS端口正确映射
2. **证书更新**：免费证书90天有效期，需要定期更新
3. **DNS传播**：DNS记录修改后需要等待传播生效

## 当前状态

✅ V2RAY代理配置已更新，支持访问证书申请网站
✅ 后端HTTPS支持已配置
✅ 前端API配置已更新
🔄 待完成：申请真实SSL证书并部署