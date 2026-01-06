# PC端与移动端功能对齐对比报告

## 报告概览

**分析时间**: 2026-01-03
**分析范围**: PC端 (`/pages/`) 与 移动端 (`/mobile/`) 功能对齐分析
**分析重点**: 认证方式、集团隔离、AI调用统一认证

---

## 一、认证方式对比分析

### 1.1 PC端认证方式实现

#### 统一认证系统
**文件**: `client/src/api/modules/unified-auth.ts`

```typescript
// PC端支持两种认证方式
export interface UnifiedAuthParams {
  phone: string;
  password: string;
  tenantCode?: string;  // ✅ 支持租户代码
}

export interface TraditionalAuthParams {
  username: string;
  password: string;
}

// API端点
export const UNIFIED_AUTH_ENDPOINTS = {
  LOGIN_WITH_CODE: `${API_PREFIX}/auth/login-with-code`,  // 统一认证
  LOGIN: `${API_PREFIX}/auth/login`,                      // 传统登录
  SEND_CODE: `${API_PREFIX}/auth/send-code`,
  REFRESH: `${API_PREFIX}/auth/refresh`,
  LOGOUT: `${API_PREFIX}/auth/logout`
}
```

#### 登录页面租户支持
**文件**: `client/src/pages/Login/index.vue`

```typescript
// ✅ PC端登录页面支持租户代码输入
const loginForm = ref({
  username: '',
  password: '',
  tenantCode: ''  // 租户代码（可选）
})

// ✅ 支持租户选择功能
const showTenantSelection = ref(false)
const availableTenants = ref<any[]>([])

// ✅ 租户代码验证
if (loginForm.value.tenantCode.trim() && !/^[a-zA-Z0-9]{3,10}$/.test(loginForm.value.tenantCode.trim())) {
  errors.value.tenantCode = '租户代码格式不正确'
}
```

#### 环境检测
**文件**: `client/src/utils/request.ts`

```typescript
// ✅ PC端支持环境检测
const getApiBaseURL = (): string => {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isSealos = window.location.hostname.includes('sealoshzh.site');

  // 开发环境使用vite代理
  if (env.isDevelopment) {
    return '/api';
  }

  // localhost环境使用本地后端服务
  if (isLocalhost) {
    return '/api';
  }

  // 生产环境检查当前域名
  return `https://shlxlyzagqnc.sealoshzh.site/api`;
};
```

#### 用户信息存储
**文件**: `client/src/stores/user.ts`

```typescript
interface UserInfo {
  id?: number
  username: string
  role: string
  roles?: string[]
  permissions: string[]
  email?: string
  realName?: string
  phone?: string
  status?: string
  isAdmin?: boolean
  kindergartenId?: number  // ✅ 支持幼儿园ID（集团隔离）
  teacherId?: number
}
```

---

### 1.2 移动端认证方式实现

#### 移动端API端点
**文件**: `client/src/api/endpoints/mobile.ts`

```typescript
// ✅ 移动端有独立的认证端点
export const MOBILE_AUTH_ENDPOINTS = {
  BASE: `${MOBILE_API_PREFIX}/auth`,
  LOGIN: `${MOBILE_API_PREFIX}/auth/login`,          // ✅ 登录端点
  LOGOUT: `${MOBILE_API_PREFIX}/auth/logout`,
  REFRESH_TOKEN: `${MOBILE_API_PREFIX}/auth/refresh-token`,
  VERIFY_CODE: `${MOBILE_API_PREFIX}/auth/verify-code`,
  SEND_CODE: `${MOBILE_API_PREFIX}/auth/send-code`,
  DEVICE_REGISTER: `${MOBILE_API_PREFIX}/auth/device-register`,
  BIOMETRIC_LOGIN: `${MOBILE_API_PREFIX}/auth/biometric-login`,  // ✅ 生物识别
  QUICK_LOGIN: `${MOBILE_API_PREFIX}/auth/quick-login`,           // ✅ 快捷登录
  SOCIAL_LOGIN: `${MOBILE_API_PREFIX}/auth/social-login`,         // ✅ 社交登录
}
```

#### 移动端登录特点
- ✅ 支持生物识别登录
- ✅ 支持快捷登录
- ✅ 支持社交登录
- ✅ 设备注册和管理
- ❌ **未发现独立的租户代码输入界面**

#### 移动端用户状态
- ❌ **移动端没有独立的用户状态管理**
- ✅ **使用PC端同样的 stores/user.ts**

---

### 1.3 认证方式对比总结

| 功能 | PC端 | 移动端 | 对齐状态 |
|------|------|--------|----------|
| 租户代码输入 | ✅ 支持 | ❌ 未发现 | 🔴 未对齐 |
| 租户选择 | ✅ 支持 | ❌ 未发现 | 🔴 未对齐 |
| 统一认证API | ✅ 支持 | ✅ 支持 | 🟢 已对齐 |
| 生物识别登录 | ❌ 不支持 | ✅ 支持 | ⚠️ 移动端独有 |
| 快捷登录 | ✅ 支持 | ✅ 支持 | 🟢 已对齐 |
| 环境检测 | ✅ 支持 | ⚠️ 共享PC端 | 🟡 部分对齐 |
| kindergartenId | ✅ 支持 | ✅ 支持 | 🟢 已对齐 |

**关键发现**:
1. 🔴 **移动端缺少租户代码输入界面**
2. 🔴 **移动端缺少租户选择功能**
3. ⚠️ **移动端依赖PC端的登录页面**

---

## 二、集团隔离对比分析

### 2.1 PC端集团隔离实现

#### 数据库模型层
**文件**: `server/src/models/kindergarten.model.ts`

```typescript
export class Kindergarten extends Model {
  // 基本字段
  declare id: CreationOptional<number>;
  declare name: string;
  declare code: string;

  // ✅ 集团管理扩展字段
  declare groupId: number | null;           // 集团ID
  declare isGroupHeadquarters: CreationOptional<number>;  // 是否集团总部
  declare groupRole: number | null;         // 集团角色
  declare joinGroupDate: Date | null;       // 加入集团日期
  declare leaveGroupDate: Date | null;      // 离开集团日期

  // ✅ 统一租户系统关联字段
  declare tenantPhoneNumber: string | null;  // 租户手机号
  declare tenantId: string | null;          // 租户ID
  declare isPrimaryBranch: CreationOptional<number>;  // 是否主分园
}
```

#### 租户解析中间件
**文件**: `server/src/middlewares/tenant-resolver.middleware.ts`

```typescript
// ✅ 支持租户域名解析
function extractTenantCode(domain: string): string | null {
  // 移除端口号
  const cleanDomain = domain.split(':')[0];

  // 匹配格式: k001.yyup.cc
  const match = cleanDomain.match(/^(k\d+)\.yyup\.cc$/);

  if (match) {
    return match[1]; // 返回 k001
  }

  // 支持其他格式
  const altMatch = cleanDomain.match(/^([a-zA-Z0-9]+)\.(kindergarten|kyyup)\.com$/);

  if (altMatch) {
    return altMatch[1];
  }

  return null;
}
```

#### 租户验证
```typescript
// ✅ 支持租户验证
async function validateTenant(tenantCode: string): Promise<boolean> {
  // 开发环境：直接支持k001租户用于测试
  if (process.env.NODE_ENV !== 'production' && tenantCode === 'k001') {
    logger.info('开发环境：k001租户验证通过（模拟）');
    return true;
  }

  // 调用统一租户中心的API验证租户
  const response = await fetch(`${process.env.UNIFIED_TENANT_API_URL}/api/tenants/${tenantCode}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Service-Name': 'kindergarten-system'
    }
  });

  if (response.ok) {
    const data = await response.json();
    return data.success && data.data.status === 'active';
  }

  return false;
}
```

#### 租户识别流程
```typescript
// ✅ 设置租户信息到请求对象
req.tenant = {
  code: tenantCode,
  domain: domain,
  databaseName: `tenant_${tenantCode}`  // 数据库名称
};

// ✅ 获取共享的全局数据库连接
req.tenantDb = tenantDatabaseService.getGlobalConnection();
```

---

### 2.2 移动端集团隔离实现

#### 移动端数据隔离
**检查结果**:
- ✅ 移动端使用PC端同样的API端点
- ✅ 移动端使用PC端同样的用户状态管理 (`stores/user.ts`)
- ✅ 移动端拥有 `kindergartenId` 字段

#### 移动端集团隔离特点
```typescript
// 移动端API端点都包含 /api/mobile 前缀
export const MOBILE_CENTER_ENDPOINTS = {
  BASE: `${MOBILE_API_PREFIX}/center`,
  AI_BILLING: `${MOBILE_API_PREFIX}/center/ai-billing`,
  // ... 其他端点
}
```

**关键发现**:
- ✅ 移动端通过PC端的后端中间件进行租户识别
- ✅ 移动端数据通过 `kindergartenId` 进行隔离
- ⚠️ **移动端没有独立的租户识别逻辑**

---

### 2.3 集团隔离对比总结

| 功能 | PC端 | 移动端 | 对齐状态 |
|------|------|--------|----------|
| kindergartenId字段 | ✅ 支持 | ✅ 支持 | 🟢 已对齐 |
| tenantId字段 | ✅ 支持 | ✅ 支持（共享） | 🟢 已对齐 |
| 租户域名解析 | ✅ 支持 | ✅ 支持（共享） | 🟢 已对齐 |
| 数据库隔离 | ✅ 支持 | ✅ 支持（共享） | 🟢 已对齐 |
| 权限隔离 | ✅ 支持 | ✅ 支持（共享） | 🟢 已对齐 |

**关键发现**:
1. 🟢 **移动端通过共享PC端的后端中间件实现集团隔离**
2. 🟢 **数据隔离机制已对齐**

---

## 三、AI调用统一认证对比分析

### 3.1 PC端AI调用统一认证实现

#### 统一AI Bridge服务
**文件**: `server/src/services/unified-ai-bridge.service.ts`

```typescript
/**
 * 统一AI Bridge服务
 *
 * 功能：
 * 1. 自动检测运行环境（本地/租户）
 * 2. 根据环境路由AI调用（本地AI Bridge / 统一认证AI Bridge）
 * 3. 提供统一的接口规范
 *
 * 环境规则：
 * - localhost / 127.0.0.1 / k.yyup.cc → 本地AI Bridge (开发/Demo)
 * - k001.yyup.cc / k002.yyup.cc → 统一认证AI Bridge (租户)
 */

import { aiBridgeService as localFullAIBridge } from './ai/bridge/ai-bridge.service';
import { unifiedTenantAIClient } from './unified-tenant-ai-client.service';

// ✅ 环境检测
function detectEnvironment(): 'local' | 'tenant' {
  const hostname = window?.location?.hostname || '';

  // 本地环境
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === 'k.yyup.cc' || hostname === 'k.yyup.com') {
    return 'local';
  }

  // 租户环境
  const tenantMatch = hostname.match(/^k\d+\.yyup\.cc$/);
  if (tenantMatch) {
    return 'tenant';
  }

  // 默认本地
  return 'local';
}

// ✅ 根据环境路由AI调用
export async function unifiedChat(request: UnifiedChatRequest): Promise<UnifiedChatResponse> {
  const env = detectEnvironment();

  if (env === 'local') {
    // 本地环境：使用本地AI Bridge
    return await localFullAIBridge.chat(request);
  } else {
    // 租户环境：使用统一认证AI Bridge
    return await unifiedTenantAIClient.chat(request);
  }
}
```

#### 环境识别规则
```typescript
/**
 * 环境规则：
 * - localhost / 127.0.0.1 / k.yyup.cc → 本地AI Bridge
 * - k001.yyup.cc / k002.yyup.cc → 统一认证AI Bridge
 */
```

---

### 3.2 移动端AI调用统一认证实现

#### 移动端AI端点
**文件**: `client/src/api/endpoints/mobile.ts`

```typescript
// ✅ 移动端有独立的AI端点
export const MOBILE_AI_ENDPOINTS = {
  BASE: `${MOBILE_API_PREFIX}/ai`,
  CHAT: `${MOBILE_API_PREFIX}/ai/chat`,
  CHAT_STREAM: `${MOBILE_API_PREFIX}/ai/chat/stream`,
  VOICE_CHAT: `${MOBILE_API_PREFIX}/ai/voice-chat`,
  IMAGE_GENERATION: `${MOBILE_API_PREFIX}/ai/generate-image`,
  ACTIVITY_IMAGE_GENERATION: `${MOBILE_API_PREFIX}/ai/generate-activity-image`,
  CURRICULUM_GENERATE: `${MOBILE_API_PREFIX}/ai/curriculum/generate`,
  CURRICULUM_GENERATE_STREAM: `${MOBILE_API_PREFIX}/ai/curriculum/generate-stream`,
  SMART_ASSISTANT: `${MOBILE_API_PREFIX}/ai/smart-assistant`,
  PARENT_ASSISTANT: `${MOBILE_API_PREFIX}/ai/parent-assistant`,
  TEACHER_ASSISTANT: `${MOBILE_API_PREFIX}/ai/teacher-assistant`,
  // ... 更多AI端点
}
```

#### 移动端AI调用实现
**文件**: `client/src/pages/mobile/teacher-center/creative-curriculum/components/services/ai-curriculum.service.ts`

```typescript
class AICurriculumService {
  private modelName = 'doubao-seed-1-6-thinking-250615';
  private maxTokens = 16384;

  async generateCurriculumCode(request: AICurriculumRequest): Promise<AICurriculumResponse> {
    // ✅ 使用 aiRequest 调用后端AI接口
    const response = await aiRequest.post(
      `/ai/curriculum/generate`,  // ❌ 注意：直接使用路径，没有环境检测
      {
        model: this.modelName,
        messages: [ /* ... */ ],
        temperature: 0.7,
        max_tokens: this.maxTokens,
      },
      {
        timeout: 90000
      }
    );

    return this.parseResponse(response.data);
  }
}
```

#### 移动端AI助手
**文件**: `client/src/pages/mobile/parent-center/ai-assistant/index.vue`

```typescript
// ✅ 移动端AI助手使用 request 工具
import request from '@/utils/request'

// ❌ 未发现环境检测逻辑
// ❌ 未发现租户识别逻辑
```

---

### 3.3 AI调用统一认证对比总结

| 功能 | PC端 | 移动端 | 对齐状态 |
|------|------|--------|----------|
| 环境自动检测 | ✅ 支持 | ❌ 未发现 | 🔴 未对齐 |
| 本地AI Bridge | ✅ 支持 | ⚠️ 间接使用 | 🟡 部分对齐 |
| 统一认证AI Bridge | ✅ 支持 | ⚠️ 间接使用 | 🟡 部分对齐 |
| 租户域名识别 | ✅ 支持 | ❌ 未发现 | 🔴 未对齐 |
| AI接口调用 | ✅ 统一Bridge | ⚠️ 直接调用后端 | 🟡 部分对齐 |

**关键发现**:
1. 🔴 **移动端AI调用缺少环境自动检测逻辑**
2. 🔴 **移动端AI调用没有实现统一的AI Bridge路由**
3. ⚠️ **移动端直接调用后端AI接口，绕过了统一AI Bridge服务**

---

## 四、详细问题分析

### 4.1 认证方式问题

#### 问题1: 移动端缺少租户代码输入界面
**影响**: 用户无法在移动端直接输入租户代码登录

**PC端实现**:
```typescript
// client/src/pages/Login/index.vue
<input v-model="loginForm.tenantCode" placeholder="租户代码（可选）" />
```

**移动端状态**: ❌ 未找到类似界面

#### 问题2: 移动端缺少租户选择功能
**影响**: 当用户关联多个租户时，无法选择要登录的租户

**PC端实现**:
```typescript
// client/src/pages/Login/index.vue
const showTenantSelection = ref(false)
const availableTenants = ref<any[]>([])

const selectTenant = async (tenant: any) => {
  authStore.selectTenant(tenant)
  // ...
}
```

**移动端状态**: ❌ 未找到类似功能

---

### 4.2 集团隔离问题

#### ✅ 良好对齐
移动端通过共享PC端的后端中间件实现了集团隔离：
- 租户域名解析
- 数据库连接隔离
- kindergartenId 字段隔离

---

### 4.3 AI调用统一认证问题

#### 问题1: 移动端AI调用缺少环境检测
**影响**: 无法根据访问域名自动选择本地或租户AI Bridge

**PC端实现**:
```typescript
// server/src/services/unified-ai-bridge.service.ts
function detectEnvironment(): 'local' | 'tenant' {
  const hostname = window?.location?.hostname || '';

  if (hostname === 'localhost' || hostname === 'k.yyup.cc') {
    return 'local';
  }

  if (hostname.match(/^k\d+\.yyup\.cc$/)) {
    return 'tenant';
  }

  return 'local';
}
```

**移动端状态**: ❌ 未找到类似逻辑

#### 问题2: 移动端AI直接调用后端接口
**影响**: 绕过了统一AI Bridge，无法实现环境自动路由

**PC端实现**:
```typescript
// 通过统一AI Bridge服务路由
export async function unifiedChat(request: UnifiedChatRequest) {
  const env = detectEnvironment();

  if (env === 'local') {
    return await localFullAIBridge.chat(request);
  } else {
    return await unifiedTenantAIClient.chat(request);
  }
}
```

**移动端实现**:
```typescript
// 直接调用后端接口
const response = await aiRequest.post(`/ai/curriculum/generate`, { ... });
```

---

## 五、修复建议

### 5.1 认证方式修复建议

#### 建议1: 添加移动端租户代码输入功能
**优先级**: 🔴 高

**实现方案**:
1. 创建移动端登录页面 `client/src/pages/mobile/login/index.vue`
2. 添加租户代码输入框
3. 集成统一认证API

```typescript
// client/src/pages/mobile/login/index.vue
<template>
  <van-form>
    <van-field
      v-model="loginForm.tenantCode"
      label="租户代码"
      placeholder="请输入租户代码（可选）"
    />
    <van-field
      v-model="loginForm.username"
      label="用户名"
    />
    <van-field
      v-model="loginForm.password"
      type="password"
      label="密码"
    />
    <van-button type="primary" @click="handleLogin">登录</van-button>
  </van-form>
</template>
```

#### 建议2: 添加移动端租户选择功能
**优先级**: 🟡 中

**实现方案**:
1. 添加租户选择弹窗
2. 调用统一认证API获取可用租户列表
3. 支持租户切换

---

### 5.2 AI调用统一认证修复建议

#### 建议1: 创建移动端统一AI Bridge客户端
**优先级**: 🔴 高

**实现方案**:
```typescript
// client/src/utils/mobile-ai-bridge.ts
export class MobileAIBridge {
  private detectEnvironment(): 'local' | 'tenant' {
    const hostname = window.location.hostname;

    // 本地环境
    if (hostname === 'localhost' || hostname === '127.0.0.1' ||
        hostname === 'k.yyup.cc' || hostname === 'k.yyup.com') {
      return 'local';
    }

    // 租户环境
    if (hostname.match(/^k\d+\.yyup\.cc$/)) {
      return 'tenant';
    }

    return 'local';
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const env = this.detectEnvironment();

    if (env === 'local') {
      // 本地环境：调用本地AI Bridge
      return await request.post('/api/ai/chat', request);
    } else {
      // 租户环境：调用统一认证AI Bridge
      return await request.post('/api/ai-bridge/chat', request);
    }
  }
}
```

#### 建议2: 更新移动端AI调用逻辑
**优先级**: 🔴 高

**修改文件**:
- `client/src/pages/mobile/parent-center/ai-assistant/index.vue`
- `client/src/pages/mobile/teacher-center/creative-curriculum/components/services/ai-curriculum.service.ts`

**修改方案**:
```typescript
// 替换直接调用
import { MobileAIBridge } from '@/utils/mobile-ai-bridge';

const aiBridge = new MobileAIBridge();
const response = await aiBridge.chat({ ... });
```

---

## 六、总结

### 6.1 对齐状态总结

| 类别 | PC端 | 移动端 | 对齐状态 | 优先级 |
|------|------|--------|----------|--------|
| **认证方式** |
| 租户代码输入 | ✅ | ❌ | 🔴 未对齐 | 高 |
| 租户选择 | ✅ | ❌ | 🔴 未对齐 | 中 |
| 统一认证API | ✅ | ✅ | 🟢 已对齐 | - |
| **集团隔离** |
| kindergartenId | ✅ | ✅ | 🟢 已对齐 | - |
| 租户域名解析 | ✅ | ✅ | 🟢 已对齐 | - |
| 数据库隔离 | ✅ | ✅ | 🟢 已对齐 | - |
| **AI调用** |
| 环境自动检测 | ✅ | ❌ | 🔴 未对齐 | 高 |
| 统一AI Bridge | ✅ | ❌ | 🔴 未对齐 | 高 |
| 租户域名识别 | ✅ | ❌ | 🔴 未对齐 | 高 |

### 6.2 整体评估

- **认证方式对齐度**: 50% (部分功能对齐)
- **集团隔离对齐度**: 100% (完全对齐)
- **AI调用对齐度**: 25% (严重不对齐)

**总体对齐度**: 约58%

### 6.3 核心问题

1. 🔴 **移动端缺少租户代码输入和选择功能**
2. 🔴 **移动端AI调用没有实现统一AI Bridge路由**
3. 🔴 **移动端AI调用缺少环境自动检测**

### 6.4 修复优先级

**高优先级 (必须修复)**:
1. 创建移动端统一AI Bridge客户端
2. 添加移动端租户代码输入功能
3. 更新移动端AI调用逻辑使用统一Bridge

**中优先级 (建议修复)**:
1. 添加移动端租户选择功能
2. 完善移动端登录界面

**低优先级 (可选优化)**:
1. 移动端AI调用性能优化
2. 移动端错误处理优化

---

**报告生成时间**: 2026-01-03
**报告版本**: v1.0
**分析状态**: ✅ 已完成
