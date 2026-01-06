# SIP UDP集成说明

## 概述

已成功将Python测试脚本的UDP SIP方式集成到后端服务中，实现了：
- ✅ UDP协议发送SIP INVITE消息
- ✅ 与Kamailio服务器 (47.94.82.59:5060) 通信
- ✅ 集成豆包实时语音大模型
- ✅ 完整的呼叫管理API

## 架构说明

### 技术栈
- **传输协议**: UDP (dgram模块)
- **SIP服务器**: Kamailio (47.94.82.59:5060)
- **AI语音**: 豆包实时语音大模型
- **后端框架**: Express.js + TypeScript

### 数据流程

```
前端发起呼叫
    ↓
后端API (/api/call-center/call/udp/make)
    ↓
SIP UDP Service (发送UDP SIP INVITE)
    ↓
Kamailio服务器 (47.94.82.59:5060)
    ↓
呼叫网关 (拨打电话)
    ↓
客户接听
    ↓
豆包实时语音大模型 (ASR + LLM + TTS)
    ↓
语音回传给客户
```

## 文件结构

### 新增文件
```
server/src/
├── services/
│   └── sip-udp.service.ts          # UDP SIP客户端服务（核心）
├── controllers/
│   └── call-center.controller.ts   # 呼叫中心控制器（已启用）
└── routes/
    └── call-center.routes.ts       # 呼叫中心路由（已启用）

server/tests/
├── sip-udp-test.ts                 # SIP UDP服务测试
└── call-center-api-test.sh         # API测试脚本

docs/呼叫中心/
└── SIP_UDP集成说明.md              # 本文档
```

### 修改文件
```
server/src/routes/index.ts          # 注册呼叫中心路由
server/.env                         # 添加SIP配置
```

## 配置说明

### 数据库配置（主要）

SIP配置存储在数据库中的 `sip_configs` 表：

```sql
-- 查看当前配置
SELECT * FROM sip_configs WHERE is_active = TRUE;
```

**当前配置**：
- 服务器: `47.94.82.59:5060`
- 用户名: `kanderadmin`
- 密码: `Szblade3944`
- 协议: `UDP`
- 注册间隔: `3600秒`

**初始化配置**：
```bash
cd server
node scripts/init-sip-config.js
```

### 环境变量配置（降级）

如果数据库中没有配置，系统会降级使用 `server/.env` 中的配置：

```env
# SIP服务器配置（呼叫中心）
SIP_LOCAL_HOST=192.168.1.100
SIP_LOCAL_PORT=5060
SIP_DISPLAY_NAME=幼儿园招生顾问
```

**说明**：
- `SIP_LOCAL_HOST`: 本地IP地址（用于SIP消息中的Via和Contact字段）
- `SIP_LOCAL_PORT`: 本地端口（默认5060）
- `SIP_DISPLAY_NAME`: 显示名称（在通话中显示）

**优先级**：数据库配置 > 环境变量配置

## API接口

### 1. 发起UDP呼叫

**请求**：
```http
POST /api/call-center/call/udp/make
Content-Type: application/json
Authorization: Bearer {token}

{
  "phoneNumber": "18611141133",
  "customerId": 1,
  "systemPrompt": "你是一位专业的幼儿园招生顾问"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "callId": "call_1234567890_abc123",
    "phoneNumber": "18611141133",
    "status": "connecting",
    "message": "呼叫已发起，等待接通"
  },
  "message": "UDP呼叫发起成功"
}
```

### 2. 获取通话状态

**请求**：
```http
GET /api/call-center/call/udp/{callId}/status
Authorization: Bearer {token}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "callId": "call_1234567890_abc123",
    "phoneNumber": "18611141133",
    "status": "answered",
    "startTime": "2025-01-14T10:30:00.000Z",
    "duration": 45
  },
  "message": "获取通话状态成功"
}
```

**状态说明**：
- `connecting`: 连接中
- `ringing`: 振铃中
- `answered`: 已接通
- `ended`: 已结束
- `failed`: 失败

### 3. 挂断通话

**请求**：
```http
POST /api/call-center/call/udp/hangup
Content-Type: application/json
Authorization: Bearer {token}

{
  "callId": "call_1234567890_abc123"
}
```

**响应**：
```json
{
  "success": true,
  "data": null,
  "message": "通话已挂断"
}
```

### 4. 获取活跃通话列表

**请求**：
```http
GET /api/call-center/calls/udp/active
Authorization: Bearer {token}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "total": 2,
    "calls": [
      {
        "callId": "call_1234567890_abc123",
        "phoneNumber": "18611141133",
        "status": "answered",
        "startTime": "2025-01-14T10:30:00.000Z",
        "duration": 120
      }
    ]
  },
  "message": "获取活跃通话成功"
}
```

## 测试方法

### 方法1: 使用TypeScript测试脚本

```bash
cd server
npx ts-node tests/sip-udp-test.ts
```

**输出示例**：
```
🧪 开始测试SIP UDP服务...

📞 测试呼叫: 18611141133
-----------------------------------

📤 发送SIP INVITE:
INVITE sip:18611141133@47.94.82.59 SIP/2.0
Via: SIP/2.0/UDP 192.168.1.100:5060;branch=z9hG4bK-call_xxx
...

✅ SIP INVITE已发送
✅ 事件: 呼叫已发起
   Call ID: call_1234567890_abc123
   电话: 18611141133

📥 收到SIP响应 (47.94.82.59:5060):
SIP/2.0 100 Trying
...

📞 事件: 呼叫尝试中...
```

### 方法2: 使用API测试脚本

```bash
cd server/tests
./call-center-api-test.sh
```

按提示输入JWT Token后，脚本会自动测试所有API接口。

### 方法3: 使用curl命令

```bash
# 1. 先登录获取token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.data.token')

# 2. 发起呼叫
curl -X POST http://localhost:3000/api/call-center/call/udp/make \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "phoneNumber": "18611141133",
    "customerId": 1
  }'
```

## 豆包实时语音集成

### 工作原理

当通话接通后（收到SIP 200 OK响应），系统会自动：

1. **启动豆包实时语音会话**
   ```typescript
   await callCenterRealtimeService.startCall(
     callId,
     customerId,
     systemPrompt
   );
   ```

2. **处理音频流**
   - SIP音频流 → 豆包实时语音大模型
   - 豆包自动完成：语音识别(ASR) + AI对话(LLM) + 语音合成(TTS)
   - 合成语音 → SIP音频流 → 客户

3. **事件监听**
   - `user-speech`: 用户说话内容
   - `ai-response`: AI回复内容和语音
   - `user-interrupted`: 用户打断
   - `call-error`: 错误事件

### 系统提示词

默认系统提示词（可通过API参数自定义）：

```
你是一位专业的幼儿园招生顾问，负责通过电话与家长沟通。

你的任务是：
1. 礼貌、热情地与家长交流
2. 了解家长的需求和孩子的情况
3. 介绍幼儿园的特色和优势
4. 回答家长的疑问
5. 引导家长预约参观或报名

注意事项：
- 保持专业和友好的语气
- 回答要简洁明了，每次回复控制在50字以内
- 不要做绝对化承诺
- 尊重家长的选择
- 如果家长表示不感兴趣，礼貌结束通话
```

## 事件系统

SIP UDP服务提供了完整的事件系统：

```typescript
import { sipUDPService } from './services/sip-udp.service';

// 呼叫已发起
sipUDPService.on('call-initiated', (data) => {
  console.log('呼叫已发起:', data.callId, data.phoneNumber);
});

// 呼叫尝试中
sipUDPService.on('call-trying', (data) => {
  console.log('呼叫尝试中:', data.callId);
});

// 对方振铃
sipUDPService.on('call-ringing', (data) => {
  console.log('对方振铃:', data.callId);
});

// 通话已接通
sipUDPService.on('call-answered', (data) => {
  console.log('通话已接通:', data.callId);
});

// 呼叫失败
sipUDPService.on('call-failed', (data) => {
  console.error('呼叫失败:', data.callId, data.error);
});

// 呼叫超时
sipUDPService.on('call-timeout', (data) => {
  console.warn('呼叫超时:', data.callId);
});

// 通话结束
sipUDPService.on('call-ended', (data) => {
  console.log('通话结束:', data.callId, '时长:', data.duration);
});
```

## 故障排查

### 问题1: 发送SIP INVITE后无响应

**可能原因**：
- 网络防火墙阻止UDP 5060端口
- SIP服务器地址或端口配置错误
- 本地IP地址配置错误

**解决方法**：
```bash
# 检查UDP端口是否可达
nc -u -v 47.94.82.59 5060

# 检查环境变量配置
cat server/.env | grep SIP_
```

### 问题2: 呼叫超时

**可能原因**：
- 被叫号码不存在或无法接通
- SIP服务器未正确路由呼叫
- 超时时间设置过短

**解决方法**：
- 检查被叫号码是否正确
- 查看SIP服务器日志
- 调整超时时间（默认30秒）

### 问题3: 豆包实时语音未启动

**可能原因**：
- 豆包API配置未正确设置
- WebSocket连接失败
- 系统提示词格式错误

**解决方法**：
```bash
# 检查豆包配置
SELECT * FROM volcengine_asr_configs WHERE is_active = TRUE;

# 查看服务日志
tail -f server/logs/app.log | grep "豆包"
```

## 下一步计划

- [ ] 添加通话录音功能
- [ ] 实现通话记录数据库存储
- [ ] 添加通话质量监控
- [ ] 实现批量外呼功能
- [ ] 添加通话统计报表
- [ ] 集成前端呼叫中心界面

## 参考资料

- [SIP协议RFC 3261](https://tools.ietf.org/html/rfc3261)
- [Kamailio文档](https://www.kamailio.org/docs/)
- [豆包实时语音API文档](https://www.volcengine.com/docs/6561/1221931)
- [Node.js dgram模块](https://nodejs.org/api/dgram.html)

---

**最后更新**: 2025-01-14
**版本**: v1.0

