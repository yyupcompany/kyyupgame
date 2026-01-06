# AI工具调用轮数统一配置

## 📋 概述

**配置日期**: 2025-10-05  
**分支**: AIupgrade  
**目标**: 统一AI工具调用轮数配置，从硬编码改为环境变量

---

## 🎯 配置目标

### 问题
- ❌ 工具调用轮数硬编码在多个文件中
- ❌ 不同服务使用不同的默认值（10、12、20）
- ❌ 难以统一调整和管理

### 解决方案
- ✅ 统一使用环境变量 `AI_MAX_ITERATIONS`
- ✅ 所有服务使用相同的默认值（12轮）
- ✅ 支持请求参数覆盖环境变量

---

## 🔧 环境变量配置

### 配置文件
**文件**: `server/.env`

```bash
# AI工具调用配置
AI_MAX_ITERATIONS=12
```

### 配置说明

| 变量名 | 默认值 | 说明 | 推荐范围 |
|--------|--------|------|----------|
| `AI_MAX_ITERATIONS` | 12 | AI工具调用最大轮数 | 5-20 |

**推荐值**:
- **开发环境**: 12轮（平衡性能和功能）
- **生产环境**: 15轮（更完整的任务处理）
- **测试环境**: 5轮（快速测试）

---

## 📁 修改文件列表

### 1. 环境变量配置
**文件**: `server/.env`

**修改内容**:
```bash
# 新增配置
AI_MAX_ITERATIONS=12
```

### 2. UnifiedIntelligenceService
**文件**: `server/src/services/ai-operator/unified-intelligence.service.ts`

**修改前**:
```typescript
const ENV_MAX_ITERS: number = 12; // 硬编码
```

**修改后**:
```typescript
const ENV_MAX_ITERS: number = Number(process.env.AI_MAX_ITERATIONS || process.env.VITE_AI_MAX_ITERATIONS || 12);
```

**状态**: ✅ 已经使用环境变量（无需修改）

### 3. FunctionToolsService 路由
**文件**: `server/src/routes/ai/function-tools.routes.ts`

**修改前**:
```typescript
const { messages, conversation_id, max_iterations = 20 } = req.body; // 硬编码20
```

**修改后**:
```typescript
// 🔧 使用环境变量配置工具调用轮数
const ENV_MAX_ITERATIONS = Number(process.env.AI_MAX_ITERATIONS || 12);
const { messages, conversation_id, max_iterations = ENV_MAX_ITERATIONS } = req.body;
```

**状态**: ✅ 已修改

### 4. 智能专家咨询路由
**文件**: `server/src/routes/ai/smart-expert.routes.ts`

**修改前**:
```typescript
const { query, maxRounds = 10 } = req.body; // 硬编码10
```

**修改后**:
```typescript
// 🔧 使用环境变量配置专家咨询轮数
const ENV_MAX_ITERATIONS = Number(process.env.AI_MAX_ITERATIONS || 12);
const { query, maxRounds = ENV_MAX_ITERATIONS } = req.body;
```

**状态**: ✅ 已修改

### 5. 智能专家咨询服务
**文件**: `server/src/services/ai/intelligent-expert-consultation.service.ts`

**修改前**:
```typescript
async startIntelligentConsultation(
  userId: number,
  query: string,
  maxRounds: number = 10 // 硬编码10
)
```

**修改后**:
```typescript
async startIntelligentConsultation(
  userId: number,
  query: string,
  maxRounds: number = Number(process.env.AI_MAX_ITERATIONS || 12)
)
```

**状态**: ✅ 已修改

### 6. 专家咨询服务
**文件**: `server/src/services/ai/expert-consultation.service.ts`

**修改前**:
```typescript
maxRounds: 5 // 硬编码5
```

**修改后**:
```typescript
maxRounds: Number(process.env.AI_MAX_ITERATIONS || 12)
```

**状态**: ✅ 已修改

---

## 📊 修改前后对比

### 修改前

| 服务/路由 | 默认轮数 | 配置方式 |
|-----------|----------|----------|
| UnifiedIntelligenceService | 12 | 硬编码 |
| FunctionToolsService 路由 | 20 | 硬编码 |
| 智能专家咨询路由 | 10 | 硬编码 |
| 智能专家咨询服务 | 10 | 硬编码 |
| 专家咨询服务 | 5 | 硬编码 |

**问题**:
- ❌ 5个不同的默认值
- ❌ 难以统一管理
- ❌ 修改需要改多个文件

### 修改后

| 服务/路由 | 默认轮数 | 配置方式 |
|-----------|----------|----------|
| UnifiedIntelligenceService | 12 | 环境变量 `AI_MAX_ITERATIONS` |
| FunctionToolsService 路由 | 12 | 环境变量 `AI_MAX_ITERATIONS` |
| 智能专家咨询路由 | 12 | 环境变量 `AI_MAX_ITERATIONS` |
| 智能专家咨询服务 | 12 | 环境变量 `AI_MAX_ITERATIONS` |
| 专家咨询服务 | 12 | 环境变量 `AI_MAX_ITERATIONS` |

**优势**:
- ✅ 统一的默认值（12轮）
- ✅ 集中管理（只需修改 `.env` 文件）
- ✅ 支持请求参数覆盖

---

## 🎯 使用方式

### 1. 全局配置（推荐）

**修改 `.env` 文件**:
```bash
# 设置全局默认轮数
AI_MAX_ITERATIONS=15
```

**重启服务**:
```bash
cd server && npm run dev
```

### 2. 请求参数覆盖

**统一智能中心**:
```typescript
// POST /api/ai/unified/stream-chat
{
  "content": "帮我分析招生数据",
  "maxIterations": 20  // 覆盖环境变量
}
```

**Function Tools**:
```typescript
// POST /api/ai/function-tools/smart-chat
{
  "messages": [...],
  "max_iterations": 20  // 覆盖环境变量
}
```

**智能专家咨询**:
```typescript
// POST /api/ai/smart-expert/start
{
  "query": "如何提高招生转化率",
  "maxRounds": 20  // 覆盖环境变量
}
```

---

## 📈 优先级规则

配置优先级（从高到低）:

1. **请求参数** - 最高优先级
   ```typescript
   { max_iterations: 20 }  // 使用20轮
   ```

2. **环境变量** - 中等优先级
   ```bash
   AI_MAX_ITERATIONS=15  # 使用15轮
   ```

3. **默认值** - 最低优先级
   ```typescript
   Number(process.env.AI_MAX_ITERATIONS || 12)  // 使用12轮
   ```

---

## 🎉 核心收益

### 短期收益
1. ✅ **统一配置** - 所有服务使用相同的默认值
2. ✅ **集中管理** - 只需修改一个文件
3. ✅ **降低维护成本** - 不需要修改多个代码文件

### 长期收益
1. ✅ **灵活调整** - 根据环境快速调整轮数
2. ✅ **更好的控制** - 统一的配置策略
3. ✅ **易于监控** - 统一的配置便于监控和分析

---

## 🔍 验证方法

### 1. 检查环境变量
```bash
cd server
cat .env | grep AI_MAX_ITERATIONS
```

**预期输出**:
```
AI_MAX_ITERATIONS=12
```

### 2. 测试API调用

**测试统一智能中心**:
```bash
curl -X POST http://localhost:3000/api/ai/unified/stream-chat \
  -H "Content-Type: application/json" \
  -d '{
    "content": "测试工具调用",
    "userId": "1",
    "conversationId": "test-123"
  }'
```

**检查日志**:
```
🔄 开始第 1 轮对话...
🔄 开始第 2 轮对话...
...
⚠️ 达到最大迭代次数 12，停止处理
```

### 3. 测试参数覆盖

**使用自定义轮数**:
```bash
curl -X POST http://localhost:3000/api/ai/function-tools/smart-chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [...],
    "max_iterations": 5
  }'
```

**检查日志**:
```
⚠️ 达到最大迭代次数 5，停止处理
```

---

## ⚠️ 注意事项

### 1. 轮数设置建议

| 场景 | 推荐轮数 | 说明 |
|------|----------|------|
| 简单查询 | 3-5轮 | 快速响应 |
| 中等复杂度 | 8-12轮 | 平衡性能和功能 |
| 复杂任务 | 15-20轮 | 完整的任务处理 |
| 测试环境 | 3-5轮 | 快速测试 |

### 2. 性能影响

- **轮数越多** → 任务完成度越高，但响应时间越长
- **轮数越少** → 响应速度越快，但可能无法完成复杂任务

### 3. 成本考虑

- 每轮调用都会消耗AI API额度
- 建议根据实际需求合理设置轮数
- 生产环境建议监控API调用成本

---

## 📝 相关文档

1. **工具统一化报告**: `docs/Tool-Unification-Complete-Report.md`
2. **工具注册中心**: `server/src/services/ai/tools/core/tool-registry.service.ts`
3. **环境变量配置**: `server/.env`

---

## ✅ 总结

本次配置统一成功实现了：

1. ✅ **统一配置** - 所有服务使用 `AI_MAX_ITERATIONS` 环境变量
2. ✅ **消除硬编码** - 从5个不同的硬编码值统一为1个环境变量
3. ✅ **灵活调整** - 支持环境变量和请求参数两种配置方式
4. ✅ **降低维护成本** - 只需修改 `.env` 文件即可全局调整

这是一次成功的配置优化，提高了系统的可维护性和灵活性！

---

**维护者**: AI Team  
**完成日期**: 2025-10-05  
**版本**: 1.0.0  
**状态**: ✅ 完成

