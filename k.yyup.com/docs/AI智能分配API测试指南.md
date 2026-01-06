# AI智能分配API测试指南

## 📋 API端点列表

### 1. AI智能分配
**端点**: `POST /api/ai/smart-assign`  
**描述**: 基于教师能力和工作负载的智能客户分配  
**认证**: 需要Bearer Token

#### 请求示例
```bash
curl -X POST http://localhost:3000/api/ai/smart-assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "customerIds": [1, 2, 3],
    "options": {
      "considerWorkload": true,
      "considerConversionRate": true,
      "considerLocation": true
    }
  }'
```

#### 请求参数
```typescript
{
  customerIds: number[];  // 客户ID列表
  options?: {
    considerWorkload?: boolean;      // 考虑工作负载
    considerConversionRate?: boolean; // 考虑成交率
    considerLocation?: boolean;       // 考虑地域匹配
  }
}
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    "assignments": [
      {
        "customerId": 1,
        "customerName": "张三",
        "customerInfo": {
          "id": 1,
          "name": "张三",
          "phone": "138xxxx1234",
          "childAge": 3,
          "intentionLevel": "HIGH",
          "location": "北京市朝阳区",
          "specialNeeds": "无"
        },
        "recommendedTeacher": {
          "id": 5,
          "name": "李老师",
          "matchScore": 95,
          "reasons": [
            "成交率85%，高于平均水平30%",
            "当前负责15个客户，工作负载适中",
            "擅长3-4岁儿童教育，与客户需求匹配",
            "负责区域与客户位置接近"
          ],
          "currentStats": {
            "totalCustomers": 15,
            "conversionRate": 85,
            "classSize": 25
          }
        },
        "alternatives": [
          {
            "id": 8,
            "name": "王老师",
            "matchScore": 88,
            "reason": "成交率高但工作负载较重"
          },
          {
            "id": 12,
            "name": "赵老师",
            "matchScore": 82,
            "reason": "工作负载轻但经验稍欠"
          }
        ]
      }
    ]
  },
  "message": "AI分配建议生成成功"
}
```

---

### 2. 执行批量分配
**端点**: `POST /api/ai/batch-assign`  
**描述**: 执行批量客户分配  
**认证**: 需要Bearer Token

#### 请求示例
```bash
curl -X POST http://localhost:3000/api/ai/batch-assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "assignments": [
      { "customerId": 1, "teacherId": 5 },
      { "customerId": 2, "teacherId": 8 }
    ],
    "note": "AI智能分配"
  }'
```

#### 请求参数
```typescript
{
  assignments: Array<{
    customerId: number;
    teacherId: number;
  }>;
  note?: string;  // 分配备注
}
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    "successCount": 2,
    "failedCount": 0
  },
  "message": "分配完成: 成功2个，失败0个"
}
```

---

### 3. 获取教师能力分析
**端点**: `GET /api/ai/teacher-capacity`  
**描述**: 获取所有在职教师的能力和工作负载分析  
**认证**: 需要Bearer Token

#### 请求示例
```bash
curl -X GET http://localhost:3000/api/ai/teacher-capacity \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 响应示例
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "name": "李老师",
      "totalCustomers": 15,
      "conversionRate": 85.0,
      "classSize": 25,
      "workloadScore": 45,
      "expertise": "3-4岁儿童教育",
      "area": "朝阳区"
    },
    {
      "id": 8,
      "name": "王老师",
      "totalCustomers": 22,
      "conversionRate": 78.5,
      "classSize": 30,
      "workloadScore": 62,
      "expertise": "艺术教育",
      "area": "海淀区"
    }
  ],
  "message": "教师能力分析完成"
}
```

---

## 🧪 测试流程

### 步骤1：获取教师能力分析
```bash
# 查看当前所有教师的能力数据
curl -X GET http://localhost:3000/api/ai/teacher-capacity \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 步骤2：AI智能分配
```bash
# 为客户推荐最合适的教师
curl -X POST http://localhost:3000/api/ai/smart-assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "customerIds": [1, 2],
    "options": {
      "considerWorkload": true,
      "considerConversionRate": true,
      "considerLocation": true
    }
  }'
```

### 步骤3：执行分配
```bash
# 根据AI推荐结果执行分配
curl -X POST http://localhost:3000/api/ai/batch-assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "assignments": [
      { "customerId": 1, "teacherId": 5 },
      { "customerId": 2, "teacherId": 8 }
    ],
    "note": "AI智能分配 - 2025-01-04"
  }'
```

---

## 🔧 前置条件

### 1. 数据库准备
确保数据库中有以下数据：
- ✅ 在职教师（teachers表，status=1）
- ✅ 未分配客户（parents表，assignedTeacherId=null）
- ✅ 豆包模型配置（ai_model_configs表）

### 2. 豆包模型配置
确保数据库中有豆包模型配置：
```sql
SELECT * FROM ai_model_configs 
WHERE type = 'CHAT' 
  AND status = 'ACTIVE' 
  AND name LIKE '%doubao%';
```

如果没有，需要添加：
```sql
INSERT INTO ai_model_configs (
  name, type, provider, endpointUrl, apiKey, status, 
  modelParameters, createdAt, updatedAt
) VALUES (
  'doubao-pro-32k',
  'CHAT',
  'DOUBAO',
  'https://ark.cn-beijing.volces.com/api/v3',
  'YOUR_API_KEY',
  'ACTIVE',
  '{"temperature":0.7,"maxTokens":2000}',
  NOW(),
  NOW()
);
```

### 3. 获取认证Token
```bash
# 登录获取token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "your_password"
  }'
```

---

## 📊 测试数据准备

### 创建测试客户
```sql
-- 插入测试客户（未分配）
INSERT INTO parents (
  userId, studentId, relationship, isPrimaryContact, 
  isLegalGuardian, followStatus, priority, 
  createdAt, updatedAt
) VALUES 
  (1, 1, '父亲', 1, 1, '待跟进', 5, NOW(), NOW()),
  (2, 2, '母亲', 1, 1, '待跟进', 4, NOW(), NOW()),
  (3, 3, '父亲', 1, 1, '待跟进', 3, NOW(), NOW());
```

### 查看未分配客户
```sql
SELECT p.id, u.realName, p.followStatus, p.priority
FROM parents p
LEFT JOIN users u ON u.id = p.userId
WHERE p.assignedTeacherId IS NULL
LIMIT 10;
```

---

## ⚠️ 注意事项

1. **AI调用限制**: 豆包API有调用频率限制，建议测试时不要一次分配太多客户
2. **Token过期**: 如果返回401错误，需要重新登录获取token
3. **数据一致性**: 执行分配后，客户的followStatus会自动更新为"跟进中"
4. **错误处理**: 如果AI分析失败，会返回500错误，检查豆包模型配置是否正确

---

## 🐛 常见问题

### Q1: 返回"未找到可用的豆包模型配置"
**解决方案**: 检查数据库中是否有豆包模型配置，参考"前置条件"部分添加配置

### Q2: AI响应格式不正确
**解决方案**: 豆包模型可能返回了非JSON格式，检查模型配置的temperature参数，建议设置为0.7

### Q3: 分配失败
**解决方案**: 检查客户ID和教师ID是否存在，教师状态是否为在职

---

**文档版本**: v1.0  
**创建日期**: 2025-01-04  
**最后更新**: 2025-01-04

