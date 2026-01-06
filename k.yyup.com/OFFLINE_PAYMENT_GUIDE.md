# 线下支付功能使用指南

## 🎯 功能概述

系统现在完全支持线下支付模式，允许客户选择线下支付方式进行活动报名、团购参团等业务。线下支付与线上支付（微信、支付宝、银行）完全兼容，可以混合使用。

## 🏗️ 技术架构

### 数据模型扩展
- **Order模型** 新增线下支付相关字段：
  - `paymentMethod`: 支持 `offline` 支付方式
  - `offlinePaymentContact`: 线下支付联系方式
  - `offlinePaymentLocation`: 线下支付地点
  - `offlinePaymentDeadline`: 线下支付截止时间
  - `offlineConfirmStaffId`: 线下确认员工ID

### API接口
- 创建订单时选择线下支付方式
- 获取线下支付信息（联系方式、地点、截止时间）
- 确认线下支付（管理员/财务人员操作）
- 取消线下支付订单
- 查询待确认的线下支付订单

## 📋 使用流程

### 1. 客户选择线下支付

**API调用示例**：
```bash
POST /api/payment/order
{
  "activityId": 1,
  "type": "registration",
  "originalAmount": 299.00,
  "paymentMethod": "offline",
  "offlinePaymentContact": "财务办公室电话：010-12345678",
  "offlinePaymentLocation": "幼儿园财务办公室（1号楼101室）",
  "offlinePaymentDeadline": "2024-08-31T18:00:00Z",
  "remark": "现金支付"
}
```

**响应示例**：
```json
{
  "success": true,
  "message": "创建订单成功",
  "data": {
    "id": 123,
    "orderNo": "ORDER20240715001",
    "status": "pending",
    "paymentMethod": "offline",
    "offlinePaymentInfo": {
      "contact": "财务办公室电话：010-12345678",
      "location": "幼儿园财务办公室（1号楼101室）",
      "deadline": "2024-08-31T18:00:00Z",
      "instructions": "请在线下支付截止时间前完成支付，支付完成后请联系工作人员确认"
    }
  }
}
```

### 2. 客户线下支付
客户根据支付信息到指定地点完成支付，保留支付凭证。

### 3. 管理员确认支付

**API调用示例**：
```bash
POST /api/payment/offline/confirm
{
  "orderId": 123,
  "paymentProof": "现金收据编号：CASH20240715001"
}
```

### 4. 系统自动处理
- 更新订单状态为 `paid`
- 发送支付成功通知给客户
- 触发后续业务逻辑（报名确认、团购进度更新等）

## 🔧 配置说明

### 活动配置
在活动管理中，可以配置是否支持线下支付：

```javascript
// 活动支付设置
{
  "paymentSettings": {
    "onlinePayment": true,
    "offlinePayment": true,
    "defaultOfflineInfo": {
      "contact": "财务办公室电话",
      "location": "财务办公室地址",
      "businessHours": "周一至周五 9:00-17:00"
    }
  }
}
```

### 系统设置
在系统设置中可以配置线下支付的全局设置：

```javascript
// 系统线下支付配置
{
  "offlinePayment": {
    "enabled": true,
    "defaultDeadlineHours": 72, // 默认72小时内支付
    "requirePaymentProof": true, // 是否需要支付凭证
    "autoCancelExpired": true, // 自动取消过期订单
    "notificationSettings": {
      "paymentReminder": true, // 支付提醒
      "expiredNotification": true // 过期通知
    }
  }
}
```

## 💼 业务场景

### 1. 幼儿园活动报名
- **场景**：家长选择活动，选择线下支付
- **流程**：线上报名 → 线下缴费 → 工作人员确认 → 报名成功
- **优势**：方便不熟悉线上支付的家长，提供多种支付选择

### 2. 团购活动
- **场景**：团长发起团购，团员可选择线下支付
- **流程**：加入团购 → 线下支付 → 团长/管理员确认 → 团购成功
- **优势**：适合团建、场地租赁等大额支付场景

### 3. 积攒奖励活动
- **场景**：积攒达成目标，可选择线下领取奖励
- **流程**：积攒完成 → 线下领取 → 工作人员确认 → 奖励发放
- **优势**：适合实物奖励的现场发放

## 🛡️ 安全机制

### 1. 权限控制
- 只有授权的管理员/财务人员可以确认线下支付
- 用户只能查看和操作自己的订单

### 2. 防重复确认
- 订单状态验证，防止重复确认
- 操作日志记录，便于审计追踪

### 3. 过期处理
- 自动检查支付截止时间
- 过期订单自动取消，释放资源

## 📊 数据统计

### 线下支付统计接口
```bash
GET /api/payment/statistics/offline?startDate=2024-07-01&endDate=2024-07-31
```

**统计维度**：
- 线下支付订单数量
- 线下支付总金额
- 平均支付时长
- 过期订单比例
- 各活动线下支付占比

## 🔔 通知机制

### 1. 客户通知
- **创建订单**：发送线下支付信息
- **支付提醒**：截止前24小时提醒
- **支付成功**：确认后通知
- **订单过期**：自动取消后通知

### 2. 管理员通知
- **新订单提醒**：有待确认的线下支付订单
- **异常提醒**：支付超时、异常情况

## 📱 前端集成

### Vue组件示例
```vue
<template>
  <el-dialog title="线下支付" v-model="showOfflinePayment">
    <div class="offline-payment-info">
      <h3>支付信息</h3>
      <p><strong>联系方式：</strong>{{ orderInfo.offlinePaymentContact }}</p>
      <p><strong>支付地点：</strong>{{ orderInfo.offlinePaymentLocation }}</p>
      <p><strong>截止时间：</strong>{{ formatDeadline(orderInfo.offlinePaymentDeadline) }}</p>
      <p><strong>支付金额：</strong>¥{{ orderInfo.finalAmount }}</p>

      <div class="instructions">
        <h4>支付说明</h4>
        <ol>
          <li>请携带有效身份证明</li>
          <li>支付完成后请保留收据</li>
          <li>如有问题请及时联系</li>
        </ol>
      </div>
    </div>
  </el-dialog>
</template>
```

## 🚀 部署注意事项

### 1. 数据库迁移
确保数据库包含新的线下支付字段：

```sql
-- 添加线下支付字段
ALTER TABLE orders
ADD COLUMN offlinePaymentContact VARCHAR(200) COMMENT '线下支付联系方式',
ADD COLUMN offlinePaymentLocation VARCHAR(500) COMMENT '线下支付地点',
ADD COLUMN offlinePaymentDeadline DATETIME COMMENT '线下支付截止时间',
ADD COLUMN offlineConfirmStaffId INT COMMENT '线下确认员工ID';
```

### 2. 权限配置
确保相关角色有线下支付操作的权限：

```javascript
// 权限配置示例
{
  "role": "finance",
  "permissions": [
    "payment.offline.confirm",
    "payment.offline.cancel",
    "payment.offline.view"
  ]
}
```

### 3. 环境变量
配置线下支付相关环境变量：

```bash
# 线下支付配置
OFFLINE_PAYMENT_ENABLED=true
OFFLINE_PAYMENT_DEFAULT_DEADLINE_HOURS=72
OFFLINE_PAYMENT_AUTO_CANCEL_EXPIRED=true
```

## 📞 技术支持

如有问题，请联系技术支持团队：
- 电话：技术支持热线
- 邮箱：tech-support@example.com
- 在线文档：完整API文档

---

**更新日期**：2024年7月15日
**版本**：v1.0.0
**维护团队**：幼儿园管理系统开发团队