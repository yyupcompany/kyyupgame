# AI用量计费系统使用说明

## 📋 目录

1. [系统概述](#系统概述)
2. [计费规则](#计费规则)
3. [数据库表结构](#数据库表结构)
4. [使用方法](#使用方法)
5. [检查工具](#检查工具)
6. [API接口](#api接口)
7. [常见问题](#常见问题)

---

## 系统概述

AI用量计费系统用于统计和计费所有AI模型的使用情况，支持以下三种计费模式：

| 计费类型 | 适用场景 | 计量单位 | 说明 |
|---------|---------|---------|------|
| **Token计费** | 文本/语言模型、嵌入模型 | token | 按输入输出Token分别计价 |
| **字符计费** | TTS语音合成 | character | 按字符数计价 |
| **次数计费** | 图片生成 | count/image | 按生成图片数量计价 |
| **时长计费** | 视频生成 | second | 按视频时长(秒)计价 |

### 核心原则

1. **所有AI调用必须通过AIBridge服务**
2. **自动记录使用量到 `ai_model_usage` 表**
3. **自动创建计费记录到 `ai_billing_records` 表**
4. **支持独立的计费查询和统计**

---

## 计费规则

### 1. 文本/语言模型 (Token计费)

```typescript
// 计费方式
cost = inputTokens * inputPrice + outputTokens * outputPrice

// 示例
inputTokens = 1000
outputTokens = 500
inputPrice = 0.0000005  // 每input token价格
outputPrice = 0.0000015  // 每output token价格

cost = 1000 * 0.0000005 + 500 * 0.0000015 = 0.0005 + 0.00075 = 0.00125 USD
```

**存储字段：**
- `billing_type`: 'token'
- `input_tokens`: 输入Token数
- `output_tokens`: 输出Token数
- `quantity`: inputTokens + outputTokens
- `unit`: 'token'

### 2. TTS语音模型 (字符计费)

```typescript
// 计费方式
cost = characterCount * unitPrice

// 示例
characterCount = 500  // 文本字符数
unitPrice = 0.000001  // 每字符价格

cost = 500 * 0.000001 = 0.0005 USD
```

**存储字段：**
- `billing_type`: 'character'
- `character_count`: 字符数
- `quantity`: characterCount
- `unit`: 'character'

### 3. 图片生成 (次数计费)

```typescript
// 计费方式
cost = imageCount * unitPrice

// 示例
imageCount = 1  // 生成1张图片
unitPrice = 0.01  // 每张图片价格

cost = 1 * 0.01 = 0.01 USD
```

**存储字段：**
- `billing_type`: 'count'
- `image_count`: 图片数量
- `quantity`: imageCount
- `unit`: 'image'

### 4. 视频生成 (时长计费)

```typescript
// 计费方式
cost = durationSeconds * unitPrice

// 示例
durationSeconds = 30  // 30秒视频
unitPrice = 0.001  // 每秒价格

cost = 30 * 0.001 = 0.03 USD
```

**存储字段：**
- `billing_type`: 'second'
- `duration_seconds`: 视频时长(秒)
- `quantity`: durationSeconds
- `unit`: 'second'

---

## 数据库表结构

### 1. ai_model_usage (使用记录表)

记录每次AI调用的详细信息。

| 字段 | 类型 | 说明 |
|-----|------|------|
| `id` | INT | 主键 |
| `user_id` | INT | 用户ID |
| `model_id` | INT | 模型ID |
| `request_id` | VARCHAR | 唯一请求ID |
| `usage_type` | ENUM | 使用类型(text/image/audio/video) |
| `input_tokens` | INT | 输入Token |
| `output_tokens` | INT | 输出Token |
| `total_tokens` | INT | 总Token |
| `cost` | DECIMAL | 费用 |
| `status` | ENUM | 状态 |
| `created_at` | DATETIME | 创建时间 |

### 2. ai_billing_records (计费记录表) ⭐ 新增

独立的计费记录表，专门用于账单统计和导出。

| 字段 | 类型 | 说明 |
|-----|------|------|
| `id` | INT | 主键 |
| `user_id` | INT | 用户ID |
| `model_id` | INT | 模型ID |
| `usage_id` | INT | 关联的使用记录ID |
| `billing_type` | ENUM | 计费类型(token/character/count/second) |
| `quantity` | DECIMAL | 计量数量 |
| `unit` | VARCHAR | 计量单位 |
| `input_tokens` | INT | 输入Token (文本) |
| `output_tokens` | INT | 输出Token (文本) |
| `duration_seconds` | DECIMAL | 时长(秒) (视频/音频) |
| `image_count` | INT | 图片数量 (图片) |
| `character_count` | INT | 字符数 (TTS) |
| `input_price` | DECIMAL | 输入单价 |
| `output_price` | DECIMAL | 输出单价 |
| `unit_price` | DECIMAL | 统一单价 |
| `total_cost` | DECIMAL | 总费用 |
| `currency` | VARCHAR | 货币 |
| `billing_status` | ENUM | 计费状态 |
| `billing_time` | DATETIME | 计费时间 |
| `payment_time` | DATETIME | 支付时间 |
| `billing_cycle` | VARCHAR | 计费周期(如2025-01) |
| `created_at` | DATETIME | 创建时间 |

---

## 使用方法

### 1. 安装/迁移数据库

```bash
cd /home/zhgue/kyyupgame/k.yyup.com/server

# 运行迁移创建新表
npm run migrate

# 或使用sequelize-cli
npx sequelize-cli db:migrate
```

### 2. 在代码中使用AIBridge (推荐)

所有AI调用都应该通过AIBridge服务，它会自动处理用量统计和计费记录。

#### 文本生成 (自动Token计费)

```typescript
import { aiBridgeService } from '@/services/ai/bridge/ai-bridge.service';

const response = await aiBridgeService.generateChatCompletion(
  {
    model: 'doubao-seed-1-6',
    messages: [
      { role: 'user', content: '你好' }
    ],
    temperature: 0.7,
    max_tokens: 1000,
  },
  undefined, // customConfig
  userId     // 用户ID
);

// AIBridge会自动：
// ✅ 记录到 ai_model_usage 表
// ✅ 创建计费记录到 ai_billing_records 表
// ✅ 计算输入输出Token和成本
```

#### TTS语音 (自动字符计费)

```typescript
import { aiBridgeService } from '@/services/ai/bridge/ai-bridge.service';

const audioResult = await aiBridgeService.textToSpeech(
  {
    model: 'tts-1',
    input: '你好，欢迎使用',
    voice: 'nova',
  },
  undefined,
  userId
);

// 自动记录：
// - character_count: 7 (字符数)
// - billing_type: 'character'
// - quantity: 7
```

#### 图片生成 (自动次数计费)

```typescript
const imageResult = await aiBridgeService.generateImage(
  {
    model: 'dall-e-3',
    prompt: '一只可爱的熊猫',
    n: 1,
    size: '1024x1024',
  },
  undefined,
  userId
);

// 自动记录：
// - image_count: 1
// - billing_type: 'count'
// - quantity: 1
```

#### 视频生成 (自动时长计费)

```typescript
const videoResult = await aiBridgeService.generateVideo(
  {
    model: 'video-gen-1',
    prompt: '海边日落',
    duration: 30, // 30秒
  },
  undefined,
  userId
);

// 自动记录：
// - duration_seconds: 30
// - billing_type: 'second'
// - quantity: 30
```

### 3. 查询用户账单

```typescript
import { aiBillingRecordService } from '@/services/ai/ai-billing-record.service';

// 获取用户本月账单
const bill = await aiBillingRecordService.getUserBill(userId);

console.log(`用户${userId}的${bill.billingCycle}账单:`);
console.log(`总费用: ${bill.totalCost} ${bill.currency}`);
console.log(`明细:`);
for (const [type, data] of Object.entries(bill.breakdown)) {
  console.log(`  ${type}: ${data.count}次, ${data.quantity}单位, ${data.cost} USD`);
}
```

### 4. 导出账单CSV

```typescript
const csv = await aiBillingRecordService.exportUserBillCSV(userId, '2025-01');
fs.writeFileSync(`bill_${userId}_2025-01.csv`, csv);
```

### 5. 更新计费状态

```typescript
// 标记为已支付
await aiBillingRecordService.updateBillingStatus(
  billingId,
  BillingStatus.PAID,
  new Date()
);

// 批量标记
await aiBillingRecordService.batchUpdateBillingStatus(
  [1, 2, 3, 4, 5],
  BillingStatus.PAID
);
```

---

## 检查工具

### AI使用合规检查脚本

检查所有代码是否正确使用AIBridge服务。

```bash
cd /home/zhgue/kyyupgame/k.yyup.com/server

# 运行检查
npx ts-node scripts/check-ai-usage-compliance.ts

# 查看报告
cat reports/ai-compliance-report.txt
```

**检查项目：**
- ✅ 是否有直接fetch/axios调用AI API
- ✅ 是否有直接导入OpenAI库
- ✅ AIBridge是否有完整的用量计算
- ✅ 计费表结构是否支持三种计费模式
- ✅ 生成新计费表结构建议

**输出示例：**
```
═══════════════════════════════════════════════════════════════
                   AI使用合规检查报告                          
═══════════════════════════════════════════════════════════════

检查时间: 2025-01-21 10:00:00
检查目录: /home/zhgue/kyyupgame/k.yyup.com/server/src
总文件数: 150
已检查文件: 145

───────────────────────────────────────────────────────────────
                          问题统计                             
───────────────────────────────────────────────────────────────
🔴 高危问题: 0
🟡 中危问题: 0
🟢 低危问题: 0
📊 总计: 0

✅ 恭喜！未发现任何合规问题。所有AI调用都正确使用了AIBridge服务。
```

---

## API接口

### 1. 获取用户账单

**请求：**
```http
GET /api/ai/billing/user/:userId/bill?cycle=2025-01
Authorization: Bearer <token>
```

**响应：**
```json
{
  "success": true,
  "data": {
    "userId": 123,
    "billingCycle": "2025-01",
    "totalCost": 15.50,
    "currency": "USD",
    "breakdown": {
      "token": {
        "count": 100,
        "cost": 10.00,
        "quantity": 1000000
      },
      "second": {
        "count": 5,
        "cost": 5.00,
        "quantity": 150
      },
      "count": {
        "count": 50,
        "cost": 0.50,
        "quantity": 50
      }
    },
    "records": [...]
  }
}
```

### 2. 导出账单CSV

**请求：**
```http
GET /api/ai/billing/user/:userId/export?cycle=2025-01&format=csv
Authorization: Bearer <token>
```

**响应：**
```csv
日期,模型,类型,数量,单位,单价,总费用,状态
2025-01-21 10:00:00,doubao-seed-1-6,按Token计费,1000,token,0.0000005,0.0005,已支付
...
```

### 3. 获取计费统计

**请求：**
```http
GET /api/ai/billing/statistics?startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer <token>
```

**响应：**
```json
{
  "success": true,
  "data": {
    "totalRecords": 1000,
    "totalCost": 500.00,
    "byType": {
      "token": { "count": 800, "cost": 400.00, "quantity": 10000000 },
      "second": { "count": 100, "cost": 80.00, "quantity": 2000 },
      "count": { "count": 100, "cost": 20.00, "quantity": 100 }
    },
    "byStatus": {
      "paid": { "count": 900, "cost": 450.00 },
      "pending": { "count": 100, "cost": 50.00 }
    }
  }
}
```

---

## 常见问题

### Q1: 为什么需要两张表？

**A:** 
- `ai_model_usage` 表用于记录使用详情，支持性能监控、错误追踪
- `ai_billing_records` 表专门用于计费和账单，支持财务统计、支付状态管理

这样做的好处：
- 职责分离，易于维护
- 计费表可以独立优化查询性能
- 支持不同的查询场景（使用统计 vs 财务报表）

### Q2: 如何处理计费失败？

**A:** AIBridge的recordUsage方法会捕获计费错误，不会影响主流程：

```typescript
try {
  await aiBillingRecordService.createBillingRecord({...});
} catch (billingError) {
  console.error('[计费统计] 创建计费记录失败:', billingError);
  // 不抛出错误，避免影响主要功能
}
```

可以通过定时任务补录：
```typescript
// 查找没有计费记录的使用记录
const usageWithoutBilling = await AIModelUsage.findAll({
  include: [{
    model: AIBillingRecord,
    as: 'billingRecord',
    required: false,
    where: { id: null }
  }]
});

// 补录计费记录
for (const usage of usageWithoutBilling) {
  await aiBillingRecordService.createBillingRecord({...});
}
```

### Q3: 如何自定义价格？

**A:** 在 `ai_model_billing` 表中配置模型价格：

```sql
INSERT INTO ai_model_billing (model_id, billing_type, input_token_price, output_token_price, is_active)
VALUES (1, 'token_based', 0.0000005, 0.0000015, 1);
```

或使用管理界面/API配置价格。

### Q4: 如何处理退款？

**A:**
```typescript
await aiBillingRecordService.updateBillingStatus(
  billingId,
  BillingStatus.REFUNDED
);
```

### Q5: 如何统计某个用户的总消费？

**A:**
```typescript
import { AIBillingRecord } from '@/models/ai-billing-record.model';
import { Op } from 'sequelize';

const totalCost = await AIBillingRecord.sum('total_cost', {
  where: {
    userId: 123,
    billingStatus: BillingStatus.PAID,
    createdAt: {
      [Op.between]: [startDate, endDate]
    }
  }
});

console.log(`用户总消费: ${totalCost} USD`);
```

---

## 迁移指南

### 从旧系统迁移到新计费系统

1. **运行数据库迁移**
```bash
npm run migrate
```

2. **补录历史计费记录**
```typescript
// 查找所有没有计费记录的使用记录
const usageRecords = await AIModelUsage.findAll({
  where: {
    createdAt: {
      [Op.gte]: new Date('2025-01-01')
    }
  },
  include: [{
    model: AIBillingRecord,
    as: 'billingRecord',
    required: false
  }]
});

// 为每条使用记录创建计费记录
for (const usage of usageRecords) {
  if (!usage.billingRecord) {
    await aiBillingRecordService.createBillingRecord({
      userId: usage.userId,
      modelId: usage.modelId,
      usageId: usage.id,
      usageType: usage.usageType,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      // ... 其他字段
    });
  }
}
```

3. **验证数据一致性**
```bash
npx ts-node scripts/check-ai-usage-compliance.ts
```

---

## 性能优化建议

### 1. 定期归档历史数据

```sql
-- 归档3个月前的计费记录
CREATE TABLE ai_billing_records_archive LIKE ai_billing_records;

INSERT INTO ai_billing_records_archive
SELECT * FROM ai_billing_records
WHERE created_at < DATE_SUB(NOW(), INTERVAL 3 MONTH);

DELETE FROM ai_billing_records
WHERE created_at < DATE_SUB(NOW(), INTERVAL 3 MONTH);
```

### 2. 创建汇总表

```sql
-- 按月汇总表
CREATE TABLE ai_billing_monthly_summary (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  billing_cycle VARCHAR(20) NOT NULL,
  billing_type ENUM('token', 'second', 'count', 'character'),
  total_count INT DEFAULT 0,
  total_quantity DECIMAL(12, 2) DEFAULT 0,
  total_cost DECIMAL(10, 6) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_cycle (user_id, billing_cycle)
);
```

### 3. 使用缓存

```typescript
import { redisClient } from '@/config/redis';

async function getCachedUserBill(userId: number, cycle: string) {
  const cacheKey = `user_bill:${userId}:${cycle}`;
  
  // 先从缓存读取
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // 从数据库读取
  const bill = await aiBillingRecordService.getUserBill(userId, cycle);
  
  // 写入缓存（24小时过期）
  await redisClient.setex(cacheKey, 86400, JSON.stringify(bill));
  
  return bill;
}
```

---

## 联系支持

如有问题，请联系技术支持团队。

📧 Email: support@yyup.com
📞 Phone: 400-xxx-xxxx
💬 Slack: #ai-billing-support

