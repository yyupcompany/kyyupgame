# 转介绍系统API文档

## 📋 概述

转介绍系统是一个B2B推广系统，用于推广AI智能幼儿园管理系统本身。

**核心逻辑**：
- 每个用户有唯一的推广码（基于用户ID）
- 用户生成推广海报（带二维码）
- 分享推广链接/海报
- 记录访问和转化数据
- 推广中心显示转介绍记录

---

## 🔧 需要实现的后端API

### 1. 获取我的推广码

```
GET /api/marketing/referrals/my-code
```

**响应**：
```json
{
  "success": true,
  "data": {
    "referral_code": "USER001",
    "referral_link": "http://localhost:5173/register?ref=USER001",
    "qr_code_url": "https://...",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

---

### 2. 获取我的推广统计

```
GET /api/marketing/referrals/my-stats
```

**响应**：
```json
{
  "success": true,
  "data": {
    "visitCount": 150,
    "visitorCount": 80,
    "enrolledCount": 25,
    "totalReward": 5000
  }
}
```

---

### 3. 获取我的转介绍记录

```
GET /api/marketing/referrals/my-records
```

**查询参数**：
- `page`: 页码
- `pageSize`: 每页数量
- `visitorName`: 访客姓名（筛选）
- `visitorPhone`: 访客手机（筛选）
- `status`: 状态（visited/registered/enrolled/paid）
- `source`: 来源（qrcode/link）
- `startDate`: 开始日期
- `endDate`: 结束日期

**响应**：
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "record-001",
        "visitor_name": "张三",
        "visitor_phone": "13800138000",
        "visit_time": "2025-01-10T10:00:00Z",
        "source": "qrcode",
        "status": "enrolled",
        "enrolled_activity": "春季招生活动",
        "enrolled_time": "2025-01-11T14:00:00Z",
        "reward": 200
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 4. 生成推广海报（模板方式）

```
POST /api/marketing/referrals/generate-poster
```

**请求体**：
```json
{
  "referral_code": "USER001",
  "qr_code_url": "https://...",
  "kindergartenName": "阳光幼儿园",
  "referrerName": "张园长",
  "mainTitle": "我已经用上了AI智能幼儿园管理系统",
  "subTitle": "给你也分享一个，你可以测试用用很智能",
  "contactPhone": "13800138000",
  "features": ["AI智能招生", "智能排课管理", "家长沟通助手", "数据分析报表"],
  "style": "professional"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "poster_url": "https://..."
  }
}
```

---

### 5. AI生成推广海报

```
POST /api/ai/generate-referral-poster
```

**请求体**：
```json
{
  "prompt": "我想要一个温馨的海报，突出AI智能特点",
  "referral_code": "USER001",
  "chat_history": [
    {
      "role": "user",
      "content": "生成一个专业的海报"
    }
  ],
  "poster_context": {
    "main_title": "我已经用上了AI智能幼儿园管理系统",
    "sub_title": "给你也分享一个，你可以测试用用很智能",
    "features": ["AI智能招生", "智能排课管理", "家长沟通助手", "数据分析报表"]
  }
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "poster_url": "https://...",
    "ai_response": "我为您生成了一个温馨风格的海报，突出了AI智能特点..."
  }
}
```

---

### 6. 记录访问（公开接口）

```
POST /api/marketing/referrals/track-visit
```

**请求体**：
```json
{
  "referral_code": "USER001",
  "source": "qrcode",
  "visitor_ip": "192.168.1.1",
  "visitor_ua": "Mozilla/5.0..."
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "visit_id": "visit-001"
  }
}
```

---

### 7. 记录转化

```
POST /api/marketing/referrals/track-conversion
```

**请求体**：
```json
{
  "referral_code": "USER001",
  "visitor_name": "张三",
  "visitor_phone": "13800138000",
  "visitor_id": "user-002",
  "status": "enrolled",
  "enrolled_activity_id": "activity-001",
  "enrolled_activity_name": "春季招生活动",
  "reward": 200
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "conversion_id": "conversion-001"
  }
}
```

---

## 🗄️ 数据库表结构

### 用户推广码表

```sql
CREATE TABLE user_referral_codes (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  referral_code VARCHAR(50) NOT NULL UNIQUE,
  qr_code_url VARCHAR(500),
  poster_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_referral_code (referral_code)
);
```

### 转介绍访问记录表

```sql
CREATE TABLE referral_visits (
  id VARCHAR(36) PRIMARY KEY,
  referral_code VARCHAR(50) NOT NULL,
  referrer_id VARCHAR(36) NOT NULL,
  visitor_ip VARCHAR(50),
  visitor_ua TEXT,
  source VARCHAR(20), -- 'qrcode', 'link'
  visit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (referrer_id) REFERENCES users(id),
  INDEX idx_referral_code (referral_code),
  INDEX idx_referrer_id (referrer_id),
  INDEX idx_visit_time (visit_time)
);
```

### 转介绍转化记录表

```sql
CREATE TABLE referral_conversions (
  id VARCHAR(36) PRIMARY KEY,
  referral_code VARCHAR(50) NOT NULL,
  referrer_id VARCHAR(36) NOT NULL,
  visitor_name VARCHAR(100),
  visitor_phone VARCHAR(20),
  visitor_id VARCHAR(36), -- 如果注册了
  status VARCHAR(20), -- 'visited', 'registered', 'enrolled', 'paid'
  enrolled_activity_id VARCHAR(36),
  enrolled_activity_name VARCHAR(200),
  enrolled_time TIMESTAMP,
  reward DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (referrer_id) REFERENCES users(id),
  FOREIGN KEY (visitor_id) REFERENCES users(id),
  INDEX idx_referral_code (referral_code),
  INDEX idx_referrer_id (referrer_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

---

## 📊 海报内容模板

### 默认海报内容

```
┌─────────────────────────────────┐
│  🎓 AI智能幼儿园管理系统        │
│                                 │
│  ✨ 我已经用上了！              │
│                                 │
│  [推荐人幼儿园Logo/照片]        │
│  XX幼儿园 - 张园长              │
│                                 │
│  💡 核心功能：                  │
│  ✅ AI智能招生                  │
│  ✅ 智能排课管理                │
│  ✅ 家长沟通助手                │
│  ✅ 数据分析报表                │
│                                 │
│  🎁 给你也分享一个              │
│  扫码免费试用，很智能！         │
│                                 │
│  [二维码]                       │
│  推广码: USER001                │
│                                 │
│  📞 联系方式: 138xxxx           │
└─────────────────────────────────┘
```

---

## 🎯 业务流程

### 推广流程

1. 用户登录系统
2. 点击"我的推广码"按钮
3. 系统自动生成/显示用户的推广码
4. 用户编辑推广海报（AI生成或模板生成）
5. 下载海报和二维码
6. 分享推广链接/海报给其他幼儿园

### 访问流程

1. 访客扫描二维码或点击推广链接
2. 系统记录访问（referral_visits表）
3. 访客浏览系统介绍页面
4. 访客注册账号（可选）
5. 访客报名试用/购买服务
6. 系统记录转化（referral_conversions表）
7. 推荐人获得奖励

---

## 💡 实现建议

### 推广码生成规则

```typescript
// 基于用户ID生成推广码
function generateReferralCode(userId: string): string {
  return `USER${userId.padStart(6, '0')}`
  // 例如: USER000001, USER000123
}
```

### 奖励计算规则

```typescript
// 根据转化状态计算奖励
function calculateReward(status: string): number {
  const rewardMap = {
    'visited': 0,
    'registered': 50,
    'enrolled': 200,
    'paid': 500
  }
  return rewardMap[status] || 0
}
```

### 海报生成

- 使用Canvas API或图片处理库（如sharp）
- 将二维码叠加到海报模板上
- 支持自定义文字、颜色、布局
- AI生成可以调用AI服务生成海报设计

---

## 🔒 安全考虑

1. **推广码唯一性** - 确保每个用户只有一个推广码
2. **访问记录防刷** - 同一IP短时间内多次访问只记录一次
3. **奖励防作弊** - 验证转化的真实性
4. **数据隐私** - 访客信息加密存储

---

## 📈 统计指标

- **访问次数** - 推广链接被点击的总次数
- **访客人数** - 去重后的访客数量
- **成功报名** - 完成报名的访客数量
- **累计奖励** - 推荐人获得的总奖励金额
- **转化率** - 成功报名 / 访客人数

---

**最后更新**: 2025-10-13
**状态**: 待实现

