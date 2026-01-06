# 🔍 AI调用路径静态分析报告

## 📋 分析目标

分析当用户通过 **k001.yyup.cc** 域名调用 AI 大模型时，是否会调用统一认证系统的 `/api/v1/ai/bridge` 端点。

---

## 🎯 核心结论

### ❌ **不会调用统一认证的 AI Bridge**

当用户通过 k001.yyup.cc 域名调用 AI 时，**不会经过统一认证系统**，而是：

```
k001.yyup.cc
  ↓
互动课程服务 (interactive-curriculum.service.ts)
  ↓
aiBridgeService (ai/bridge/ai-bridge.service.ts)
  ↓
从本地数据库读取配置 (kargerdensales.ai_model_configs)
  ↓
直接调用豆包 API
```

---

## 📂 代码路径分析

### 1. 互动课程服务的 AI Bridge 导入

**文件**: `/server/src/services/curriculum/interactive-curriculum.service.ts`

```typescript
import { aiBridgeService } from '../ai/bridge/ai-bridge.service';
```

**分析**: 使用的是 **本地 AI Bridge 服务**，不是统一认证客户端。

---

### 2. 本地 AI Bridge 服务实现

**文件**: `/server/src/services/ai/bridge/ai-bridge.service.ts`

#### generateImage 方法 (第1097-1156行)

```typescript
public async generateImage(
  params: AiBridgeImageGenerationParams,
  customConfig?: { endpointUrl: string; apiKey: string }
): Promise<AiBridgeImageGenerationResponse> {
  try {
    // 🔧 从数据库读取模型配置
    if (!customConfig && params.model) {
      const AIModelConfigModule = await import('../../../models/ai-model-config.model');
      const AIModelConfig = AIModelConfigModule.default;
      const modelConfig = await AIModelConfig.findOne({
        where: { name: params.model, status: 'active' }
      });

      if (modelConfig) {
        customConfig = {
          endpointUrl: modelConfig.endpointUrl,
          apiKey: modelConfig.apiKey || ''
        };
      }
    }

    // 直接调用豆包API
    const response = await httpClient.post<AiBridgeImageGenerationResponse>(endpoint, params);
    return response.data;
  }
}
```

**关键点**:
- ✅ 从 `ai-model-config.model` 读取配置（本地数据库 `kargerdensales`）
- ✅ 使用 `customConfig` 创建 HTTP 客户端
- ✅ **直接调用豆包 API**，不经过统一认证
- ❌ **没有域名判断逻辑**
- ❌ **没有调用统一认证的 `/api/v1/ai/bridge`**

---

### 3. 统一认证 AI 客户端服务

**文件**: `/server/src/services/unified-tenant-ai-client.service.ts`

```typescript
// 统一租户系统API基础URL
const UNIFIED_TENANT_API_URL = process.env.UNIFIED_TENANT_API_URL || 'http://localhost:3001';

async chat(request: ChatRequest, authToken?: string): Promise<ChatResponse> {
  const response = await this.httpClient.post('/chat', request, { headers });
  return response.data;
}
```

**关键点**:
- ✅ 这个服务才会调用统一认证系统
- ❌ **但互动课程服务没有使用这个服务**

---

### 4. 另一个 AIBridge 服务

**文件**: `/server/src/services/aibridge.service.ts`

```typescript
import { unifiedTenantAIClient } from './unified-tenant-ai-client.service';

async analyze(prompt: string, options: AIAnalyzeOptions = {}): Promise<string> {
  const response = await unifiedTenantAIClient.chat({
    model,
    messages: [{ role: 'user', content: prompt }],
  }, authToken);
  return result;
}
```

**关键点**:
- ✅ 这个服务使用 `unifiedTenantAIClient`
- ✅ 会调用统一认证系统
- ❌ **但互动课程服务没有使用这个服务**

---

## 🔍 域名判断逻辑分析

### 搜索结果

```bash
grep -rn "k001\|租户\|localhost\|domain" /server/src/services --include="*.ts" | grep -i "ai\|bridge"
```

**发现**:
- ❌ **没有找到任何基于域名判断使用哪个 AI Bridge 的逻辑**
- ❌ **没有找到根据租户域名切换到统一认证的代码**

---

## 📊 架构对比

### 当前实际架构（k001.yyup.cc）

```
┌─────────────────┐
│ k001.yyup.cc    │
│  (前端)         │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ interactive-curriculum.service │
│  import: ai/bridge/ai-bridge   │
└────────┬────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ aiBridgeService                  │
│ (ai/bridge/ai-bridge.service.ts) │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ 本地数据库                        │
│ kargerdensales                   │
│ ai_model_configs 表              │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ 豆包 API                         │
│ ark.cn-beijing.volces.com       │
└──────────────────────────────────┘
```

### 理论架构（如果使用统一认证）

```
┌─────────────────┐
│ k001.yyup.cc    │
│  (前端)         │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ 统一认证 API                     │
│ /api/v1/ai/bridge/image-generate│
└────────┬────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ 统一认证数据库                    │
│ admin_tenant_management          │
│ ai_model_config 表               │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ 豆包 API                         │
│ ark.cn-beijing.volces.com       │
└──────────────────────────────────┘
```

---

## ⚠️ 问题总结

### 1. 数据重复配置

**问题**: 豆包 Seedream 4.5 模型在两个数据库都有配置：
- `kargerdensales.ai_model_configs` (租户业务数据库)
- `admin_tenant_management.ai_model_config` (统一认证数据库)

**影响**:
- ✅ 本地调用：使用 kargerdensales 的配置
- ❌ 租户调用：**还是使用 kargerdensales 的配置**（不会用统一认证的配置）

### 2. 配置不一致风险

如果两个数据库的配置不同：
- API Key 不同
- endpointUrl 不同
- 模型参数不同

**可能导致**: 不同环境的 AI 调用结果不一致。

### 3. 统一认证的 AI Bridge API 无效

**问题**: 我们在统一认证系统创建了 `/api/v1/ai/bridge` API，但是：

```typescript
// ❌ 租户系统不会调用这个 API
router.use('/v1/ai/bridge', aiBridgeRoutes)
```

**原因**: 互动课程服务直接调用本地 AI Bridge，不会经过统一认证。

---

## 💡 解决方案建议

### 方案1: 修改互动课程服务使用统一认证

```typescript
// 修改前
import { aiBridgeService } from '../ai/bridge/ai-bridge.service';

// 修改后
import { unifiedTenantAIClient } from '../unified-tenant-ai-client.service';

async generateImages(imagePrompts: ImagePrompt[], taskId: string) {
  // 调用统一认证的图片生成API
  const response = await unifiedTenantAIClient.imageGenerate({
    model: this.IMAGE_MODEL,
    prompt: prompt.detailedPrompt,
    n: 1,
    size: '1920x1920',
    logo_info: { add_logo: false }
  }, authToken);
}
```

### 方案2: 在本地 AI Bridge 中添加域名判断

```typescript
// ai/bridge/ai-bridge.service.ts

async generateImage(params, customConfig?) {
  // 检查是否为租户域名
  const hostname = process.env.HOSTNAME || 'localhost';
  const isTenantDomain = /^k\d{3}\.yyup\.cc$/.test(hostname);

  if (isTenantDomain) {
    // 调用统一认证系统
    return await unifiedTenantAIClient.imageGenerate(params, authToken);
  } else {
    // 使用本地数据库配置
    // ... 现有逻辑
  }
}
```

### 方案3: 使用环境变量控制

```typescript
const USE_UNIFIED_AUTH = process.env.USE_UNIFIED_AUTH === 'true';

async generateImage(params, customConfig?) {
  if (USE_UNIFIED_AUTH) {
    return await unifiedTenantAIClient.imageGenerate(params, authToken);
  } else {
    // 使用本地数据库配置
  }
}
```

---

## 🎯 建议

### 短期方案

**保持当前架构**，但需要：
1. ✅ 确保两个数据库的模型配置保持同步
2. ✅ 定期检查配置一致性
3. ✅ 删除统一认证系统中未使用的 AI Bridge API（或者保留供将来使用）

### 长期方案

**实现真正的统一认证**：
1. 修改互动课程服务，使用 `unifiedTenantAIClient`
2. 添加域名判断逻辑
3. 所有 AI 调用都经过统一认证系统
4. 实现统一的计费和监控

---

## 📝 结论

### 当前状态
- ❌ k001.yyup.cc **不会调用** 统一认证的 `/api/v1/ai/bridge` 端点
- ✅ k001.yyup.cc 使用本地 AI Bridge + 本地数据库配置
- ✅ 直接调用豆包 API

### 我们的工作
- ✅ 统一认证数据库已配置豆包 Seedream 4.5
- ✅ 创建了统一认证的 AI Bridge API
- ❌ **但这个 API 目前不会被租户系统调用**

### 下一步
需要决定：是否要修改租户系统，让它使用统一认证的 AI Bridge？

---

**生成时间**: 2026-01-02
**分析人员**: Claude Code
**版本**: v1.0
