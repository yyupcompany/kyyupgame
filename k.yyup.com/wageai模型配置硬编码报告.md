# WageAI模型配置硬编码报告

## 检查概述

本报告针对幼儿园管理系统中WageAI相关的模型配置硬编码问题进行了检查。虽然系统中没有明确名为"wageai"的服务，但发现了大量与豆包(Doubao)模型相关的硬编码配置，这些配置应该通过aibrage服务进行管理。

## 发现的硬编码问题

### 1. AI模型缓存服务中的硬编码 (server/src/services/ai-model-cache.service.ts)

**问题描述**: 在`loadFallbackModels()`方法中硬编码了豆包模型的配置信息。

**具体硬编码内容**:
```typescript
// 豆包1.6 Thinking模型（聊天和工具调用）
{
  id: 45,
  name: 'doubao-seed-1-6-thinking-250615',
  displayName: 'Doubao 1.6 Thinking (推理增强版)',
  provider: 'bytedance_doubao',
  modelType: 'text',
  endpointUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
  apiKey: '1c155dc7-0cec-441b-9b00-0fb8ccc16089',
  modelParameters: {
    temperature: 0.7,
    maxTokens: 4096,
    topP: 0.9
  },
  status: 'active',
  isDefault: true,
  isActive: true,
  capabilities: ['text', 'tool_calling']
},
// 豆包文生图模型
{
  id: 46,
  name: 'doubao-seedream-3-0-t2i-250415',
  displayName: 'Doubao SeedDream 3.0 (文生图)',
  provider: 'bytedance_doubao',
  modelType: 'image',
  endpointUrl: 'https://ark.cn-beijing.volces.com/api/v3/images/generations',
  apiKey: 'ffb6e528-e8a3-4d2b-9c7f-1a2b3c4d5e6f',
  modelParameters: {
    size: '1024x768',
    quality: 'standard'
  },
  status: 'active',
  isDefault: false,
  isActive: true,
  capabilities: ['image_generation']
}
```

**风险**: API密钥直接硬编码在代码中，存在安全风险。模型配置无法动态更新。

### 2. AI控制器中的硬编码响应 (server/src/controllers/ai.controller.ts)

**问题描述**: 在`generateModelResponse()`方法中硬编码了不同AI提供商的响应风格。

**具体硬编码内容**:
```typescript
switch (model.provider?.toLowerCase()) {
  case 'doubao':
  case 'bytedance':
    providerStyle = '我是字节跳动的豆包AI，专注于为幼儿园管理提供智能化解决方案。';
    break;
  case 'openai':
    providerStyle = '我是OpenAI助手，致力于帮助您优化幼儿园管理工作。';
    break;
  case 'anthropic':
    providerStyle = '我是Claude助手，很高兴为您的幼儿园管理提供帮助。';
    break;
  default:
    providerStyle = '我是AI助手，专为幼儿园管理系统设计。';
    break;
}
```

**风险**: 响应风格无法动态配置，新增提供商需要修改代码。

### 3. 模型分类逻辑硬编码

**问题描述**: 在模型缓存服务中硬编码了豆包模型的分类逻辑。

**具体硬编码内容**:
```typescript
// 豆包模型作为通用模型
if (model.name.includes('doubao')) {
  if (!this.modelCache.has('DB_QUERY_MODEL')) {
    this.modelCache.set('DB_QUERY_MODEL', model);
  }
  if (!this.modelCache.has('INTENT_MODEL')) {
    this.modelCache.set('INTENT_MODEL', model);
  }
  if (!this.modelCache.has('QA_MODEL')) {
    this.modelCache.set('QA_MODEL', model);
  }
}
```

**风险**: 模型功能分类基于名称模糊匹配，不够精确。

## aibrage服务使用情况

### 当前实现
系统已经实现了AIBridgeService (server/src/services/ai/bridge/ai-bridge.service.ts)，作为统一的AI服务调用接口，但部分模块仍在使用硬编码配置。

### AIBridgeService的优势
1. 统一的HTTP客户端配置
2. 统一的错误处理机制
3. 统一的使用量统计
4. 支持流式和非流式响应
5. 支持多种AI功能（文本、图像、音频、视频等）

## 修复建议

### 高优先级
1. **移除硬编码的API密钥**: 将所有API密钥移至环境变量或数据库配置表
2. **模型配置数据库化**: 将fallback模型配置移至数据库，通过aibrage服务统一管理
3. **响应风格配置化**: 将AI响应风格移至配置表，支持动态调整

### 中优先级
1. **模型分类规则优化**: 基于模型类型和能力而非名称进行分类
2. **统一使用AIBridgeService**: 确保所有AI调用都通过AIBridgeService

### 实施步骤
1. 创建模型配置管理表，存储所有模型配置信息
2. 修改AIModelCacheService，从数据库加载fallback配置
3. 将API密钥移至环境变量或加密存储
4. 创建AI响应风格配置表
5. 重构模型分类逻辑，基于明确的类型字段

## 安全建议

1. **API密钥管理**: 使用环境变量或加密存储，避免硬编码
2. **访问控制**: 对模型配置管理接口添加权限控制
3. **审计日志**: 记录模型配置变更和使用情况
4. **密钥轮换**: 支持API密钥的定期轮换

## 结论

虽然系统已经实现了AIBridgeService作为统一的AI服务接口，但仍存在多处硬编码配置，特别是豆包模型的配置信息。建议优先处理API密钥硬编码问题，然后逐步将其他配置数据库化，最终实现所有模型配置通过aibrage服务统一管理。