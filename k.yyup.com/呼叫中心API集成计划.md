# 呼叫中心API集成计划

**状态**: 进行中  
**优先级**: 🔴 高  
**预计完成时间**: 2-3天

---

## 📋 集成清单

### 第一阶段：核心API集成 (优先级：🔴 高)

#### 1. 概览数据 API
- **端点**: `GET /api/call-center/overview`
- **功能**: 获取VOS配置状态、服务器信息
- **前端集成**: 页面加载时调用
- **状态**: ⏳ 待集成

#### 2. 发起通话 API
- **端点**: `POST /api/call-center/call/make`
- **功能**: 发起VOS呼叫
- **参数**: `phoneNumber`, `customerId`, `systemPrompt`
- **前端集成**: "发起通话"按钮
- **状态**: ⏳ 待集成

#### 3. 挂断通话 API
- **端点**: `POST /api/call-center/call/hangup`
- **功能**: 挂断通话
- **参数**: `callId`
- **前端集成**: "挂断"按钮
- **状态**: ⏳ 待集成

#### 4. 获取通话状态 API
- **端点**: `GET /api/call-center/call/:callId/status`
- **功能**: 获取通话状态
- **前端集成**: 实时状态更新
- **状态**: ⏳ 待集成

#### 5. 获取活跃通话 API
- **端点**: `GET /api/call-center/calls/active`
- **功能**: 获取所有活跃通话
- **前端集成**: 通话列表
- **状态**: ⏳ 待集成

### 第二阶段：通话记录 API (优先级：🟡 中)

#### 6. 获取通话记录 API
- **端点**: `GET /api/call-center/recordings`
- **功能**: 获取通话记录列表
- **参数**: `page`, `pageSize`, `phoneNumber`, `dateRange`
- **前端集成**: 通话记录标签页
- **状态**: ⏳ 待集成

#### 7. 获取通话转写 API
- **端点**: `GET /api/call-center/recordings/:id/transcript`
- **功能**: 获取通话转写内容
- **前端集成**: 实时转写显示
- **状态**: ⏳ 待集成

#### 8. 播放录音 API
- **端点**: `GET /api/call-center/recordings/:id/download`
- **功能**: 下载/播放录音
- **前端集成**: 播放按钮
- **状态**: ⏳ 待集成

### 第三阶段：AI分析 API (优先级：🟡 中)

#### 9. 分析通话 API
- **端点**: `POST /api/call-center/ai/analyze/:callId`
- **功能**: AI分析通话内容
- **前端集成**: 分析按钮
- **状态**: ⏳ 待集成

#### 10. 生成AI话术 API
- **端点**: `POST /api/call-center/ai/generate-script`
- **功能**: AI生成优化话术
- **前端集成**: 话术优化
- **状态**: ⏳ 待集成

#### 11. 语音识别 API
- **端点**: `POST /api/call-center/ai/speech-to-text`
- **功能**: 语音转文字
- **前端集成**: 实时转写
- **状态**: ⏳ 待集成

#### 12. 合规审查 API
- **端点**: `POST /api/call-center/ai/check-compliance`
- **功能**: 检查话术合规性
- **前端集成**: 话术审查
- **状态**: ⏳ 待集成

### 第四阶段：联系人和分机 API (优先级：🟢 低)

#### 13. 获取联系人 API
- **端点**: `GET /api/call-center/contacts`
- **功能**: 获取联系人列表
- **前端集成**: 联系人选择器
- **状态**: ⏳ 待集成

#### 14. 获取分机 API
- **端点**: `GET /api/call-center/extensions`
- **功能**: 获取分机列表
- **前端集成**: 分机管理
- **状态**: ⏳ 待集成

#### 15. 获取实时状态 API
- **端点**: `GET /api/call-center/realtime/status`
- **功能**: 获取系统实时状态
- **前端集成**: 状态面板
- **状态**: ⏳ 待集成

---

## 🔧 集成步骤

### 步骤1: 更新API模块 (client/src/api/modules/call-center.ts)
- [ ] 添加缺失的API方法
- [ ] 完善类型定义
- [ ] 添加错误处理

### 步骤2: 更新前端页面 (client/src/pages/centers/CallCenter.vue)
- [ ] 集成概览API
- [ ] 集成发起通话API
- [ ] 集成通话记录API
- [ ] 集成AI分析API
- [ ] 集成联系人API

### 步骤3: 测试集成
- [ ] 单元测试
- [ ] 集成测试
- [ ] E2E测试

### 步骤4: 性能优化
- [ ] 缓存优化
- [ ] 请求优化
- [ ] 渲染优化

---

## 📊 集成进度

| 阶段 | 任务数 | 完成 | 进度 |
|------|--------|------|------|
| 第一阶段 | 5 | 0 | 0% |
| 第二阶段 | 3 | 0 | 0% |
| 第三阶段 | 4 | 0 | 0% |
| 第四阶段 | 3 | 0 | 0% |
| **总计** | **15** | **0** | **0%** |

---

## 🎯 下一步

1. ✅ 更新 `client/src/api/modules/call-center.ts` - 添加所有API方法
2. ✅ 更新 `client/src/pages/centers/CallCenter.vue` - 集成API调用
3. ✅ 测试所有功能
4. ✅ 性能优化


