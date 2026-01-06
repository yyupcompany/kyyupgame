# API端点配置文档

## 概述

本项目采用统一的API端点配置管理，确保前后端API调用的一致性和可维护性。所有API端点都通过配置文件进行统一管理，避免硬编码在组件中。

## 目录结构

```
src/api/endpoints/
├── index.ts              # 统一导出文件
├── base.ts               # 基础配置和类型定义
├── auth.ts               # 认证相关端点
├── user.ts               # 用户管理端点
├── system.ts             # 系统管理端点
├── dashboard.ts          # 仪表盘端点
├── business.ts           # 业务核心端点
├── statistics.ts         # 统计分析端点
├── ai.ts                 # AI功能端点
├── enrollment.ts         # 招生管理端点
├── activity.ts           # 活动管理端点
├── marketing.ts          # 营销管理端点
├── file.ts               # 文件管理端点
├── attendance.ts         # 考勤管理端点
├── utils.ts              # 通用工具端点
├── mobile.ts             # Mobile专用端点
└── README.md             # 本文档
```

## 使用方法

### 1. 导入端点配置

```typescript
// 导入所有端点
import {
  AUTH_ENDPOINTS,
  USER_ENDPOINTS,
  AI_ENDPOINTS,
  MOBILE_AI_ENDPOINTS
} from '@/api/endpoints'

// 或者单独导入特定模块
import { AUTH_ENDPOINTS } from '@/api/endpoints/auth'
import { MOBILE_AI_ENDPOINTS } from '@/api/endpoints/mobile'
```

### 2. 在组件中使用

```typescript
import { request } from '@/utils/request'
import { AI_ENDPOINTS } from '@/api/endpoints'

// 使用端点常量替代硬编码URL
const response = await request.get(AI_ENDPOINTS.CONVERSATIONS)
const response = await request.post(AI_ENDPOINTS.PARENT_ASSISTANT_ANSWER, data)
```

## Mobile端点配置

Mobile应用有专门的端点配置，包含mobile特定的API前缀和优化：

### Mobile专用端点前缀

```typescript
export const MOBILE_API_PREFIX = `${API_PREFIX}mobile`
// 结果: 'mobile'
```

### 主要Mobile端点类别

1. **MOBILE_AUTH_ENDPOINTS** - Mobile认证端点
2. **MOBILE_PARENT_ENDPOINTS** - 家长中心端点
3. **MOBILE_TEACHER_ENDPOINTS** - 教师中心端点
4. **MOBILE_CENTER_ENDPOINTS** - 管理中心端点
5. **MOBILE_UPLOAD_ENDPOINTS** - Mobile文件上传端点
6. **MOBILE_SYNC_ENDPOINTS** - 数据同步端点
7. **MOBILE_TODO_ENDPOINTS** - 待办事项端点
8. **MOBILE_AI_ENDPOINTS** - Mobile AI功能端点
9. **MOBILE_DEVICE_ENDPOINTS** - 设备管理端点
10. **MOBILE_PUSH_ENDPOINTS** - 推送通知端点
11. **MOBILE_OFFLINE_ENDPOINTS** - 离线缓存端点

### Mobile端点特性

- **统一的API前缀**: 所有mobile端点都使用 `/mobile` 前缀
- **设备标识**: 支持设备ID和平台信息
- **推送通知**: 集成推送token管理
- **离线支持**: 离线缓存和同步机制
- **移动优化**: 针对移动网络和设备优化的接口

## 已修复的硬编码API调用

以下文件中的硬编码API调用已被替换为端点常量：

### 1. `/parent-center/feedback/index.vue`
```typescript
// 修复前
const response = await request.get('/api/v1/ai/feedback')

// 修复后
const response = await request.get(AI_ENDPOINTS.AI_FEEDBACK)
```

### 2. `/parent-center/ai-assistant/index.vue`
```typescript
// 修复前
const response = await request.post('/api/parent-assistant/answer', data)

// 修复后
const response = await request.post(AI_ENDPOINTS.PARENT_ASSISTANT_ANSWER, data)
```

### 3. `/teacher-center/creative-curriculum/components/services/ai-curriculum.service.ts`
```typescript
// 修复前
const response = await fetch('/api/ai/curriculum/generate-stream', options)

// 修复后
const response = await fetch(AI_ENDPOINTS.CURRICULUM_GENERATE_STREAM, options)
```

### 4. `/centers/media-center/index.vue`
```typescript
// 修复前
const statsResponse = await fetch('/api/media-center/statistics')
const recentResponse = await fetch('/api/media-center/recent-creations?limit=4')

// 修复后
const statsResponse = await fetch(MOBILE_CENTER_ENDPOINTS.MEDIA_STATISTICS)
const recentResponse = await fetch(`${MOBILE_CENTER_ENDPOINTS.MEDIA_RECENT_CREATIONS}?limit=4`)
```

## AI端点扩展

新增了以下AI相关端点配置：

### 基础AI端点
```typescript
export const AI_ENDPOINTS = {
  // 原有端点...

  // 新增端点
  GENERATE_ACTIVITY_IMAGE: `${API_PREFIX}ai/generate-activity-image`,
  STATUS: `${API_PREFIX}ai/status`,
  UNIFIED_CAPABILITIES: `${API_PREFIX}ai/unified/capabilities`,

  // 课程生成相关
  CURRICULUM_GENERATE_STREAM: `${API_PREFIX}ai/curriculum/generate-stream`,
  CURRICULUM_GENERATE: `${API_PREFIX}ai/curriculum/generate`,

  // 家长助手
  PARENT_ASSISTANT_ANSWER: `${API_PREFIX}parent-assistant/answer`,

  // 反馈系统
  AI_FEEDBACK: `${API_PREFIX}v1/ai/feedback`,
}
```

## 类型定义

### 基础类型
```typescript
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  code?: number;
  items?: T[];
  total?: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}
```

### Mobile特定类型
```typescript
export interface MobileApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  code?: number;
  timestamp?: number;
  requestId?: string;
  mobileVersion?: string;
  requiresUpdate?: boolean;
  updateUrl?: string;
}

export interface MobileDeviceInfo {
  deviceId: string;
  platform: 'ios' | 'android';
  appVersion: string;
  osVersion: string;
  model: string;
  pushToken?: string;
  lastActiveTime: string;
  isOnline: boolean;
}
```

## 命名规范

### 端点命名规范

1. **使用大写蛇形命名法**: `AUTH_ENDPOINTS`, `USER_ENDPOINTS`
2. **路径使用小写和连字符**: `/auth/login`, `/user-management`
3. **RESTful风格**:
   - GET: `/api/resource` (列表)
   - GET: `/api/resource/:id` (详情)
   - POST: `/api/resource` (创建)
   - PUT: `/api/resource/:id` (更新)
   - DELETE: `/api/resource/:id` (删除)

### Mobile端点命名规范

1. **前缀统一**: 所有mobile端点以 `MOBILE_` 开头
2. **功能分类**: `MOBILE_PARENT_ENDPOINTS`, `MOBILE_TEACHER_ENDPOINTS`
3. **路径标准化**: 使用 `/mobile` 作为统一前缀
4. **版本控制**: 通过路径版本控制 `/mobile/v1/...`

## 最佳实践

### 1. 使用端点常量
```typescript
// ✅ 正确 - 使用端点常量
const response = await request.get(AI_ENDPOINTS.CONVERSATIONS)

// ❌ 错误 - 硬编码URL
const response = await request.get('/api/ai/conversations')
```

### 2. 统一导入方式
```typescript
// ✅ 推荐 - 从统一入口导入
import { AI_ENDPOINTS, AUTH_ENDPOINTS } from '@/api/endpoints'

// ✅ 可接受 - 从具体模块导入
import { AI_ENDPOINTS } from '@/api/endpoints/ai'
```

### 3. 错误处理
```typescript
try {
  const response = await request.get(AI_ENDPOINTS.CONVERSATIONS)
  if (response.success) {
    // 处理成功响应
  }
} catch (error) {
  // 处理错误
  console.error('API调用失败:', error)
}
```

### 4. 类型安全
```typescript
interface ConversationData {
  id: string;
  title: string;
  messages: Message[];
}

const response = await request.get<ConversationData>(AI_ENDPOINTS.CONVERSATIONS)
```

## 测试建议

### 1. 端点配置测试
```typescript
import { AI_ENDPOINTS } from '@/api/endpoints'

describe('API端点配置', () => {
  it('AI端点应该包含必要的路径', () => {
    expect(AI_ENDPOINTS.CONVERSATIONS).toBe('ai/conversations')
    expect(AI_ENDPOINTS.GENERATE_ACTIVITY_IMAGE).toBe('ai/generate-activity-image')
  })
})
```

### 2. Mock数据测试
```typescript
jest.mock('@/utils/request', () => ({
  request: jest.fn()
}))

test('应该调用正确的API端点', async () => {
  await request.get(AI_ENDPOINTS.CONVERSATIONS)
  expect(request).toHaveBeenCalledWith('ai/conversations')
})
```

## 迁移指南

如果你在代码中发现了硬编码的API调用，请按以下步骤进行迁移：

### 1. 识别硬编码API
搜索项目中类似以下的模式：
```typescript
'/api/auth/login'
'/api/ai/conversation'
'/api/users'
```

### 2. 查找或创建端点配置
- 检查 `src/api/endpoints/` 目录中是否已有对应的端点配置
- 如果没有，创建新的端点配置

### 3. 更新导入语句
```typescript
import { AI_ENDPOINTS } from '@/api/endpoints'
```

### 4. 替换硬编码URL
```typescript
// 修复前
const response = await request.get('/api/ai/conversation')

// 修复后
const response = await request.get(AI_ENDPOINTS.CONVERSATION)
```

## 注意事项

1. **不要修改 `API_PREFIX`**: 它已经在 `base.ts` 中正确配置
2. **保持一致性**: 新的端点配置应遵循现有的命名规范
3. **文档更新**: 添加新的端点配置时，请更新相关文档
4. **测试覆盖**: 确保新的端点配置有相应的测试用例
5. **版本兼容**: 考虑API版本兼容性，必要时在路径中包含版本号

## 总结

通过使用统一的端点配置管理，我们实现了：

- ✅ **消除硬编码**: 所有API调用都使用配置的端点常量
- ✅ **提高可维护性**: API变更只需修改配置文件
- ✅ **类型安全**: TypeScript支持提供完整的类型检查
- ✅ **移动优化**: 为mobile应用提供专门的端点配置
- ✅ **开发效率**: 智能提示和自动补全支持
- ✅ **测试友好**: 便于单元测试和集成测试