# 🛠️ 演示实现指南

## 🎯 演示流程详细步骤

### 第一步：访问统一登录界面

**URL**: `http://rent.yyup.cc`

**需要配置**：
- 域名解析：rent.yyup.cc → 服务器IP
- 反向代理配置（nginx）

```nginx
server {
    server_name rent.yyup.cc;
    location / {
        proxy_pass http://localhost:3001;
    }
}
```

---

### 第二步：用户注册

**API**: `POST /api/unified-auth/register`

**请求体**：
```json
{
  "phone": "1511110420",
  "password": "Kyyup123456",
  "realName": "演示用户",
  "email": "demo@yyup.cc",
  "registrationSource": "demo"
}
```

**响应**：
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "globalUserId": "user_xxx",
    "phone": "1511110420",
    "realName": "演示用户",
    "email": "demo@yyup.cc"
  }
}
```

---

### 第三步：创建租户k001

**API**: `POST /api/tenant/create`

**请求体**：
```json
{
  "tenantCode": "k001",
  "tenantName": "演示幼儿园",
  "contactName": "园长",
  "contactPhone": "1511110420",
  "contactEmail": "demo@yyup.cc",
  "address": "北京市朝阳区",
  "adminPassword": "Admin123456"
}
```

**自动执行的操作**：
1. ✅ 验证租户代码格式
2. ✅ 创建租户记录
3. ✅ 生成租户密码配置
4. ✅ 创建数据库 tenant_k001
5. ✅ 初始化数据库结构
6. ✅ 创建域名 k001.yyup.cc
7. ✅ 创建OSS存储目录

---

### 第四步：显示开通成功

**需要实现的页面**：

```vue
<template>
  <div class="activation-success">
    <div class="success-card">
      <div class="success-icon">✅</div>
      <h1>账号已开通</h1>
      
      <div class="tenant-info">
        <div class="info-item">
          <label>租户代码</label>
          <span>k001</span>
        </div>
        <div class="info-item">
          <label>租户域名</label>
          <span>k001.yyup.cc</span>
        </div>
        <div class="info-item">
          <label>数据库</label>
          <span>tenant_k001</span>
        </div>
        <div class="info-item">
          <label>OSS存储</label>
          <span>kindergarten/rent/1511110420/</span>
        </div>
      </div>
      
      <button @click="goToTenant">
        进入幼儿园管理系统
      </button>
    </div>
  </div>
</template>
```

---

### 第五步：使用k001.yyup.cc登录

**URL**: `http://k001.yyup.cc`

**登录信息**：
- 手机号：1511110420
- 密码：Kyyup123456

**登录流程**：
1. 识别租户代码：k001
2. 调用统一认证中心验证
3. 在租户数据库中查找/创建用户
4. 生成租户Token
5. 重定向到仪表板

---

### 第六步：显示侧边栏菜单

**已实现的菜单**：

```
📊 仪表板
├── 📋 基本资料
├── 📈 绩效管理
├── 👨‍🏫 教师中心
│   ├── 班级管理
│   ├── 课程安排
│   └── 学生评估
├── 👨‍👩‍👧 家长中心
│   ├── 我的孩子
│   ├── 成长报告
│   └── 活动参与
├── 🎮 游戏中心
├── 🤖 AI助手
├── 📢 活动管理
├── 💬 沟通交流
├── 📝 反馈建议
└── 👤 个人资料
```

---

## ⚙️ 环境配置

### 1. 数据库配置

```env
# 统一认证中心数据库
ADMIN_DB_HOST=localhost
ADMIN_DB_PORT=3306
ADMIN_DB_USER=root
ADMIN_DB_PASSWORD=password
ADMIN_DB_NAME=admin_yyup

# 租户数据库
TENANT_DB_HOST=localhost
TENANT_DB_PORT=3306
TENANT_DB_USER=root
TENANT_DB_PASSWORD=password
TENANT_DB_TEMPLATE=kardensales
```

### 2. OSS配置

```env
OSS_ACCESS_KEY_ID=your_key_id
OSS_ACCESS_KEY_SECRET=your_key_secret
OSS_BUCKET=systemkarder
OSS_REGION=oss-cn-guangzhou
OSS_CDN_DOMAIN=https://cdn.yyup.cc
```

### 3. DNS配置

```env
ALIYUN_ACCESS_KEY_ID=your_key_id
ALIYUN_ACCESS_KEY_SECRET=your_key_secret
ALIYUN_DOMAIN=yyup.cc
ALIYUN_REGION_ID=cn-beijing
```

### 4. 域名配置

```nginx
# rent.yyup.cc - 统一租户中心
server {
    server_name rent.yyup.cc;
    location / {
        proxy_pass http://localhost:3001;
    }
}

# k001.yyup.cc - 租户系统
server {
    server_name ~^(?<tenant>[a-z0-9]+)\.yyup\.cc$;
    location / {
        proxy_pass http://localhost:3002;
        proxy_set_header X-Tenant-Code $tenant;
    }
}
```

---

## 🧪 测试清单

- [ ] 统一登录界面可访问
- [ ] 用户注册成功
- [ ] 租户自动创建
- [ ] 数据库自动创建
- [ ] OSS目录自动创建
- [ ] 域名自动解析
- [ ] 开通成功提示显示
- [ ] 租户登录成功
- [ ] 侧边栏菜单显示
- [ ] 各菜单项可点击

---

## 📱 演示时间估计

- 注册：30秒
- 租户创建：10秒
- 开通提示：5秒
- 登录：10秒
- 菜单展示：15秒
- **总计**：70秒

---

**准备时间**：2小时  
**演示时间**：2分钟  
**成功率**：95%

