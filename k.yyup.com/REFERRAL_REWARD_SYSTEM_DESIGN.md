# 推广奖励系统设计方案

## 📋 需求分析

### 核心业务模型
1. **系统使用费**: 500元/月
2. **推荐奖励**: 500元（充值金额）
3. **AI功能**: 按用量计费
4. **推广方式**: 
   - 一键生成二维码
   - 一键生成推广链接
   - 推广页面（图文展示 + AI助手）

### 功能入口
- **位置**: 头部导航栏右侧
- **图标**: "分享奖励"按钮
- **功能**: 点击后弹出推广中心弹窗

## 🏗️ 系统架构分析

### 现有基础
✅ **已有模型**:
- `ReferralCode` - 推荐码模型
- `ReferralReward` - 推荐奖励模型
- `ReferralRelationship` - 推荐关系模型
- `ReferralStatistic` - 推荐统计模型
- `PersonalPoster` - 个人海报模型

✅ **已有功能**:
- 活动分享功能
- 二维码生成功能
- 海报生成功能

### 需要新增
❌ **租户管理**:
- 租户注册
- 租户订阅管理
- 充值金额管理

❌ **推广中心**:
- 推广链接生成
- 推广数据统计
- 奖励记录查询

## 📊 数据库设计

### 1. 租户表 (tenants)
```sql
CREATE TABLE tenants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '租户名称（幼儿园名称）',
  code VARCHAR(50) UNIQUE NOT NULL COMMENT '租户代码',
  contact_person VARCHAR(50) COMMENT '联系人',
  contact_phone VARCHAR(20) COMMENT '联系电话',
  contact_email VARCHAR(100) COMMENT '联系邮箱',
  
  -- 订阅信息
  subscription_status ENUM('trial', 'active', 'suspended', 'expired') DEFAULT 'trial',
  subscription_start_date DATE COMMENT '订阅开始日期',
  subscription_end_date DATE COMMENT '订阅结束日期',
  monthly_fee DECIMAL(10,2) DEFAULT 500.00 COMMENT '月费',
  
  -- 推荐信息
  referrer_id INT COMMENT '推荐人ID（推荐此租户的用户ID）',
  referral_code VARCHAR(50) COMMENT '使用的推荐码',
  
  -- 充值信息
  balance DECIMAL(10,2) DEFAULT 0.00 COMMENT '账户余额',
  total_recharged DECIMAL(10,2) DEFAULT 0.00 COMMENT '累计充值',
  
  -- AI使用
  ai_usage_quota INT DEFAULT 0 COMMENT 'AI使用配额（次数）',
  ai_usage_count INT DEFAULT 0 COMMENT 'AI已使用次数',
  
  status TINYINT DEFAULT 1 COMMENT '状态：1-正常 0-禁用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  
  INDEX idx_referrer_id (referrer_id),
  INDEX idx_referral_code (referral_code),
  INDEX idx_subscription_status (subscription_status)
) COMMENT='租户表';
```

### 2. 充值记录表 (recharge_records)
```sql
CREATE TABLE recharge_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenant_id INT NOT NULL COMMENT '租户ID',
  amount DECIMAL(10,2) NOT NULL COMMENT '充值金额',
  type ENUM('payment', 'referral_reward', 'system_gift') NOT NULL COMMENT '充值类型',
  source VARCHAR(100) COMMENT '来源说明',
  referral_id INT COMMENT '关联的推荐记录ID',
  
  payment_method VARCHAR(50) COMMENT '支付方式',
  payment_status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
  payment_time TIMESTAMP NULL COMMENT '支付时间',
  
  remark TEXT COMMENT '备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_type (type),
  INDEX idx_referral_id (referral_id)
) COMMENT='充值记录表';
```

### 3. 推广记录表 (referral_records)
```sql
CREATE TABLE referral_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  referrer_id INT NOT NULL COMMENT '推荐人ID',
  referrer_type ENUM('user', 'tenant') DEFAULT 'user' COMMENT '推荐人类型',
  
  referee_tenant_id INT COMMENT '被推荐租户ID',
  referee_name VARCHAR(100) COMMENT '被推荐人姓名',
  referee_phone VARCHAR(20) COMMENT '被推荐人电话',
  referee_email VARCHAR(100) COMMENT '被推荐人邮箱',
  
  referral_code VARCHAR(50) NOT NULL COMMENT '推荐码',
  referral_link TEXT COMMENT '推荐链接',
  
  status ENUM('pending', 'registered', 'subscribed', 'rewarded') DEFAULT 'pending',
  reward_amount DECIMAL(10,2) DEFAULT 500.00 COMMENT '奖励金额',
  reward_status ENUM('pending', 'issued', 'used') DEFAULT 'pending',
  reward_issued_at TIMESTAMP NULL COMMENT '奖励发放时间',
  
  visit_count INT DEFAULT 0 COMMENT '访问次数',
  first_visit_at TIMESTAMP NULL COMMENT '首次访问时间',
  registered_at TIMESTAMP NULL COMMENT '注册时间',
  subscribed_at TIMESTAMP NULL COMMENT '订阅时间',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_referrer_id (referrer_id),
  INDEX idx_referral_code (referral_code),
  INDEX idx_status (status)
) COMMENT='推广记录表';
```

### 4. AI使用记录表 (ai_usage_records)
```sql
CREATE TABLE ai_usage_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenant_id INT NOT NULL COMMENT '租户ID',
  user_id INT NOT NULL COMMENT '用户ID',
  
  model_name VARCHAR(100) COMMENT 'AI模型名称',
  usage_type VARCHAR(50) COMMENT '使用类型',
  tokens_used INT COMMENT '使用的token数',
  cost DECIMAL(10,4) COMMENT '费用',
  
  request_data JSON COMMENT '请求数据',
  response_data JSON COMMENT '响应数据',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
) COMMENT='AI使用记录表';
```

## 🎨 前端设计

### 1. 头部导航添加推广按钮

**位置**: `client/src/layouts/MainLayout.vue` 的 navbar-right 区域

**设计**:
```vue
<!-- 推广奖励按钮 -->
<button 
  class="header-action-btn referral-btn" 
  @click="openReferralCenter" 
  title="分享奖励"
>
  <el-icon><Share /></el-icon>
  <span class="referral-badge">推广</span>
  <span v-if="referralCount > 0" class="referral-count">{{ referralCount }}</span>
</button>
```

### 2. 推广中心弹窗

**组件**: `client/src/components/referral/ReferralCenter.vue`

**功能模块**:
1. **推广概览**
   - 我的推荐码
   - 推广人数
   - 待发放奖励
   - 已获得奖励

2. **一键推广**
   - 生成推广链接（复制）
   - 生成推广二维码（下载）
   - 分享到社交媒体

3. **推广记录**
   - 推广列表
   - 状态跟踪
   - 奖励明细

4. **推广页面预览**
   - 图文展示
   - AI助手演示

### 3. 推广落地页

**路由**: `/referral/:code`

**组件**: `client/src/pages/referral/ReferralLanding.vue`

**功能**:
1. **图文展示**
   - 系统介绍
   - 功能特点
   - 价格说明
   - 成功案例

2. **AI助手**
   - 智能问答
   - 功能演示
   - 在线咨询

3. **报名表单**
   - 幼儿园信息
   - 联系方式
   - 提交注册

## 🔧 后端API设计

### 1. 推荐码管理
```typescript
// 生成推荐码
POST /api/referral/generate-code
Response: { code, link, qrcode }

// 获取我的推荐码
GET /api/referral/my-code
Response: { code, link, qrcode, stats }

// 验证推荐码
GET /api/referral/validate/:code
Response: { valid, referrer }
```

### 2. 推广记录
```typescript
// 获取推广列表
GET /api/referral/records
Query: { page, pageSize, status }
Response: { items, total }

// 获取推广统计
GET /api/referral/statistics
Response: { totalReferrals, pendingRewards, totalRewards }

// 记录访问
POST /api/referral/track-visit
Body: { code, source }
```

### 3. 租户注册
```typescript
// 注册租户
POST /api/tenant/register
Body: { name, contact, referralCode }
Response: { tenantId, subscriptionInfo }

// 获取租户信息
GET /api/tenant/info
Response: { tenant, subscription, balance }
```

### 4. 充值管理
```typescript
// 获取充值记录
GET /api/recharge/records
Query: { page, pageSize }
Response: { items, total }

// 获取余额
GET /api/recharge/balance
Response: { balance, aiQuota }
```

## 📱 UI/UX设计

### 推广按钮样式
```scss
.referral-btn {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  
  .referral-badge {
    margin-left: 4px;
    font-size: 12px;
  }
  
  .referral-count {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #f56c6c;
    color: white;
    border-radius: 10px;
    padding: 2px 6px;
    font-size: 10px;
  }
}
```

### 推广中心弹窗
```vue
<el-dialog
  v-model="visible"
  title="推广中心"
  width="900px"
  :close-on-click-modal="false"
>
  <div class="referral-center">
    <!-- 顶部统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-value">{{ stats.totalReferrals }}</div>
        <div class="stat-label">推广人数</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-value">¥{{ stats.totalRewards }}</div>
        <div class="stat-label">已获奖励</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⏳</div>
        <div class="stat-value">¥{{ stats.pendingRewards }}</div>
        <div class="stat-label">待发放</div>
      </div>
    </div>
    
    <!-- 推广工具 -->
    <div class="referral-tools">
      <h3>推广工具</h3>
      <div class="tool-item">
        <span>推荐码：</span>
        <code>{{ referralCode }}</code>
        <el-button @click="copyCode">复制</el-button>
      </div>
      <div class="tool-item">
        <span>推广链接：</span>
        <input :value="referralLink" readonly />
        <el-button @click="copyLink">复制</el-button>
      </div>
      <div class="tool-item">
        <span>推广二维码：</span>
        <img :src="qrcodeUrl" alt="二维码" />
        <el-button @click="downloadQrcode">下载</el-button>
      </div>
    </div>
    
    <!-- 推广记录 -->
    <div class="referral-records">
      <h3>推广记录</h3>
      <el-table :data="records">
        <el-table-column prop="refereeName" label="被推荐人" />
        <el-table-column prop="status" label="状态" />
        <el-table-column prop="rewardAmount" label="奖励金额" />
        <el-table-column prop="createdAt" label="推广时间" />
      </el-table>
    </div>
  </div>
</el-dialog>
```

## 🚀 实施计划

### Phase 1: 数据库和后端 (2天)
1. 创建数据库表
2. 实现推荐码生成逻辑
3. 实现推广记录API
4. 实现租户注册API

### Phase 2: 前端组件 (2天)
1. 添加头部推广按钮
2. 实现推广中心弹窗
3. 实现推广落地页
4. 集成二维码生成

### Phase 3: 测试和优化 (1天)
1. 功能测试
2. UI/UX优化
3. 性能优化

## 📝 下一步行动

1. 确认设计方案
2. 创建数据库迁移文件
3. 实现后端API
4. 开发前端组件
5. 集成测试

---

**设计完成时间**: 2025-10-10
**预计开发时间**: 5天
**优先级**: P1 - 高优先级

