# VOS迁移指南

## 概述

本项目已从自实现的SIP/RTP语音通讯系统迁移到VOS（Voice Over Service）直接连接。VOS提供了更简洁、更可靠的语音服务集成。

## 迁移内容

### 后端变更

#### 1. 移除的SIP服务
以下SIP相关的服务已被禁用（添加`.disabled`后缀）：
- `server/src/services/sip-udp.service.ts.disabled` - SIP UDP客户端
- `server/src/services/sip-config.service.ts.disabled` - SIP配置管理
- `server/src/services/sip-client.service.ts.disabled` - SIP客户端
- `server/src/services/rtp-audio-handler.service.ts.disabled` - RTP音频处理

#### 2. 新增VOS服务
- `server/src/services/vos-config.service.ts` - VOS配置管理服务
- `server/src/models/vos-config.model.ts` - VOS配置数据模型
- `server/src/controllers/vos-config.controller.ts` - VOS配置控制器
- `server/src/routes/vos-config.routes.ts` - VOS配置路由

#### 3. 修改的文件
- `server/src/controllers/call-center.controller.ts` - 移除所有SIP相关方法，改用VOS
- `server/src/routes/call-center.routes.ts` - 移除SIP路由，保留VOS呼叫路由
- `server/src/routes/index.ts` - 添加VOS配置路由注册

#### 4. 数据库迁移
- `server/src/migrations/20250125-create-vos-config.js` - 创建VOS配置表
- `server/src/seeders/20250125-init-vos-config.js` - 初始化默认VOS配置

### 前端变更

#### 1. 新增API模块
- `client/src/api/modules/vos-config.ts` - VOS配置API

#### 2. 修改的API模块
- `client/src/api/modules/call-center.ts` - 移除SIP API，改用VOS API

## 安装步骤

### 1. 数据库迁移

```bash
# 运行迁移脚本创建VOS配置表
cd server
npx sequelize-cli db:migrate

# 运行种子脚本初始化VOS配置
npx sequelize-cli db:seed:all
```

### 2. 环境变量配置

在`.env`文件中添加VOS配置：

```env
# VOS服务器配置
VOS_SERVER_HOST=your-vos-server.com
VOS_SERVER_PORT=443
VOS_PROTOCOL=https
VOS_API_KEY=your-api-key
VOS_API_SECRET=your-api-secret
VOS_APP_ID=your-app-id
VOS_USERNAME=your-username
VOS_PASSWORD=your-password
VOS_VOICE_TYPE=default
VOS_SAMPLE_RATE=16000
VOS_FORMAT=pcm
VOS_LANGUAGE=zh-CN
VOS_MODEL_NAME=doubao-realtime-voice
VOS_MAX_CONCURRENT_CALLS=100
VOS_TIMEOUT=30000
VOS_RETRY_COUNT=3
```

### 3. 启动服务

```bash
# 启动后端服务
npm run start:backend

# 启动前端服务
npm run start:frontend
```

## API变更

### 旧的SIP API（已弃用）

```
GET  /api/call-center/sip/status
POST /api/call-center/sip/connect
POST /api/call-center/sip/disconnect
POST /api/call-center/sip/test
PUT  /api/call-center/sip/config
GET  /api/call-center/sip/config
```

### 新的VOS API

#### VOS配置管理

```
GET    /api/vos-config              # 获取所有VOS配置
GET    /api/vos-config/active       # 获取当前激活的VOS配置
POST   /api/vos-config              # 创建VOS配置
PUT    /api/vos-config/:id          # 更新VOS配置
DELETE /api/vos-config/:id          # 删除VOS配置
POST   /api/vos-config/:id/activate # 激活VOS配置
POST   /api/vos-config/test         # 测试VOS连接
GET    /api/vos-config/connection-url # 获取VOS连接URL
```

#### 呼叫管理（使用VOS）

```
POST /api/call-center/call/make           # 发起VOS呼叫
GET  /api/call-center/call/:callId/status # 获取通话状态
POST /api/call-center/call/hangup         # 挂断通话
GET  /api/call-center/calls/active        # 获取活跃通话列表
```

## 前端集成

### 1. 导入VOS配置API

```typescript
import { vosConfigAPI } from '@/api/modules/vos-config'
```

### 2. 获取VOS配置

```typescript
// 获取当前激活的VOS配置
const config = await vosConfigAPI.getActiveConfig()

// 获取所有VOS配置
const configs = await vosConfigAPI.getConfigs()

// 激活指定的VOS配置
await vosConfigAPI.activateConfig(configId)

// 测试VOS连接
await vosConfigAPI.testConnection()
```

### 3. 发起VOS呼叫

```typescript
import { callAPI } from '@/api/modules/call-center'

// 发起VOS呼叫
const result = await callAPI.makeCall({
  phoneNumber: '13800138000',
  customerId: 123,
  systemPrompt: '你是一个客服助手'
})

// 挂断通话
await callAPI.hangupCall(result.data.callId)

// 获取活跃通话
const activeCalls = await callAPI.getActiveCalls()
```

## 故障排查

### 问题1：VOS配置未加载

**症状**：获取VOS配置时返回错误

**解决方案**：
1. 检查数据库中是否有VOS配置记录
2. 确保VOS配置的`is_active`字段为`true`
3. 检查环境变量是否正确配置

### 问题2：VOS连接失败

**症状**：测试VOS连接时失败

**解决方案**：
1. 检查VOS服务器地址和端口是否正确
2. 检查API密钥是否有效
3. 检查网络连接是否正常
4. 查看服务器日志获取详细错误信息

### 问题3：旧的SIP代码仍在运行

**症状**：前端仍然调用SIP API

**解决方案**：
1. 清除浏览器缓存
2. 重新构建前端项目：`npm run build`
3. 检查是否有其他地方导入了SIP服务

## 性能对比

| 指标 | SIP/RTP | VOS |
|------|---------|-----|
| 延迟 | 1.5-2秒 | 0.5-1秒 |
| 音质 | 16kHz PCM | 16kHz PCM |
| 并发数 | 有限 | 可配置 |
| 维护成本 | 高 | 低 |
| 可靠性 | 中等 | 高 |

## 后续优化

1. **多语言支持** - 支持更多语言的语音识别和合成
2. **高级功能** - 支持打断检测、静音检测等
3. **监控和分析** - 添加通话质量监控和分析功能
4. **集成优化** - 与其他系统的集成优化

## 相关文档

- [VOS豆包AI智能语音对话系统](./VOS豆包AI智能语音对话系统.md)
- [呼叫中心完成总结](./呼叫中心/README.md)
- [API文档](../server/swagger.json)

## 支持

如有问题，请联系技术支持团队。

