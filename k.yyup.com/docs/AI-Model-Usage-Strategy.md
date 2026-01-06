# 🎯 AI模型使用策略说明

> 时间：2025-11-06
> 原则：**不同场景用不同模型，优化成本和速度**

---

## 📊 模型分工策略

### 🧠 Think模型 - 复杂分析场景

**模型**：`doubao-seed-1-6-thinking-250615`

**使用场景**：
- ✅ 主AI对话（理解用户意图）
- ✅ 复杂推理和分析
- ✅ 工具选择决策
- ✅ 多步骤任务规划

**特点**：
- 深度思考能力强
- 推理准确度高
- 成本：~0.01元/次

**代码位置**：
- `unified-intelligence.service.ts` - 主AI调用
- 生成 `reasoning_content` 和 `tool_calls`

---

### ⚡ Flash模型 - 快速响应场景

**模型**：`doubao-seed-1-6-flash-250715`

**使用场景**：
- ✅ 工具调用解说（简单说明）
- ✅ 数据格式转换
- ✅ 简单的文本生成
- ✅ 快速查询

**特点**：
- 响应速度快（<2秒）
- 成本低（~0.002元/次）
- 适合简单任务

**代码位置**：
- `tool-narrator.service.ts` - 工具解说
- `any-query.tool.ts` - 简单查询

---

## 🔧 工具解说双优化

### 调用前说明（0成本）

```typescript
// ✅ 策略1：从think模型的reasoning中提取
if (reasoningContent) {
  return reasoningContent.split('。')[0];  // 提取第一句话
}

// ✅ 策略2：使用预设模板
return '让我查询一下数据库...';
```

**成本**：**0元**（复用已有数据或使用模板）

---

### 调用后解说（低成本）

```typescript
// ✅ 策略1：简单工具用模板（80%的情况）
if (isSimpleTool(toolName)) {
  return `✅ 查询成功，找到 ${count} 条记录`;  // 模板
}

// ✅ 策略2：复杂工具用flash模型（20%的情况）
return await generateAINarration(...);  // flash模型
```

**成本**：
- 简单工具：**0元**（模板）
- 复杂工具：**0.002元**（flash模型）

---

## 📈 成本对比表

| 场景 | 原方案 | 新方案（双解说） | 增加成本 |
|------|--------|-----------------|---------|
| 简单查询 | 0.01元 | 0.01元 | **0%** ✅ |
| 复杂查询 | 0.01元 | 0.012元 | **20%** ✅ |
| 平均成本 | 0.01元 | 0.01元 | **<5%** ✅ |

---

## 🎯 模型选择规则

### 主AI调用（think）

```typescript
// unified-intelligence.service.ts
const aiModelConfig = {
  name: 'doubao-seed-1-6-thinking-250615',  // ← think模型
  temperature: 0.7,
  max_tokens: 9000
};

// 用于：
// - 理解用户意图
// - 选择合适的工具
// - 生成reasoning_content
```

### 工具解说（flash）

```typescript
// tool-narrator.service.ts
private readonly LITE_MODEL = 'doubao-seed-1-6-flash-250715';  // ← flash模型
private readonly MAX_NARRATION_TOKENS = 100;

// 用于：
// - 解释工具执行结果
// - 生成1-2句简短说明
```

---

## ✅ 优化效果

### 速度提升
- think模型：5-10秒（主AI）
- flash模型：1-2秒（工具解说）✅
- **总体速度更快**

### 成本优化
- 调用前：0成本（从reasoning提取）
- 调用后：
  - 80%场景：0成本（模板）
  - 20%场景：低成本（flash模型）
- **平均成本增加<5%**

---

## 📝 代码修改

### 修改前（错误）
```typescript
private readonly LITE_MODEL = 'doubao-seed-1-6-thinking-250615';  // ❌ 用错模型
```

### 修改后（正确）
```typescript
private readonly LITE_MODEL = 'doubao-seed-1-6-flash-250715';  // ✅ flash模型
```

---

## 🎊 总结

**模型分工明确**：
- 🧠 Think模型 → 复杂分析（主AI）
- ⚡ Flash模型 → 工具解说（辅助）

**成本几乎不增加，但用户体验大幅提升**！✅
