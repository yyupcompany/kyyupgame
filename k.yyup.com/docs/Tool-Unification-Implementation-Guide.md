# 工具统一化实施指南

## 📋 概述

**实施日期**: 2025-10-05  
**分支**: AIupgrade  
**目标**: 统一工具定义，消除重复，优化执行逻辑

---

## 🎯 实施目标

### 1. 统一工具定义，消除重复
- ✅ 创建统一工具注册中心 (ToolRegistry)
- ✅ 将所有31个工具统一注册
- ✅ 消除5个重复定义的工具

### 2. 优化工具执行逻辑
- ✅ 创建统一工具执行器 (ToolExecutor)
- ✅ 统一参数标准化逻辑
- ✅ 统一错误处理和日志记录

### 3. 创建统一工具注册中心
- ✅ 支持按类别、场景、权限获取工具
- ✅ 支持工具版本管理
- ✅ 支持工具统计和监控

---

## 📁 新增文件

### 1. 统一工具注册中心
**文件**: `server/src/services/ai/tools/core/tool-registry.service.ts`

**功能**:
- 统一管理所有31个AI工具定义
- 按类别、场景、权限动态组合工具
- 支持工具版本管理和A/B测试

**核心类**:
```typescript
export class ToolRegistry {
  // 单例模式
  public static getInstance(): ToolRegistry
  
  // 获取所有工具
  public getAllTools(): ToolDefinition[]
  
  // 按类别获取工具
  public getToolsByCategory(category: ToolCategory): ToolDefinition[]
  
  // 按场景获取工具
  public getToolsForScenario(scenario: ToolScenario): ToolDefinition[]
  
  // 按权限获取工具
  public getToolsByRole(role: string): ToolDefinition[]
  
  // 获取统计信息
  public getStatistics(): {...}
}
```

**工具类别**:
- DATA_QUERY (数据查询) - 6个工具
- PAGE_OPERATION (页面操作) - 8个工具
- TASK_MANAGEMENT (任务管理) - 6个工具
- UI_DISPLAY (UI展示) - 1个工具
- EXPERT_CONSULT (专家咨询) - 3个工具
- SMART_QUERY (智能查询) - 1个工具
- WEB_SEARCH (网络搜索) - 1个工具
- WORKFLOW (工作流) - 2个工具

**工具场景**:
- UNIFIED_INTELLIGENCE - 统一智能中心 (17个工具)
- FUNCTION_TOOLS - Function Tools (16个工具)
- TOOL_CALLING - Tool Calling (6个工具)

### 2. 统一工具执行器
**文件**: `server/src/services/ai/tools/core/tool-executor.service.ts`

**功能**:
- 统一的工具执行接口
- 整合现有的工具执行逻辑
- 支持工具执行前后的钩子
- 统一的错误处理和日志记录

**核心类**:
```typescript
export class UnifiedToolExecutor implements IToolExecutor {
  // 单例模式
  public static getInstance(): UnifiedToolExecutor
  
  // 执行单个工具
  public async execute(toolCall: ToolCall): Promise<ToolExecutionResult>
  
  // 批量执行工具
  public async executeBatch(toolCalls: ToolCall[]): Promise<ToolExecutionResult[]>
  
  // 参数标准化
  private normalizeArguments(toolName: string, args: Record<string, any>): Record<string, any>
  
  // 执行工具逻辑
  private async executeToolLogic(toolName: string, args: Record<string, any>): Promise<any>
}
```

**参数标准化**:
- `navigate_to_page`: 统一 pageName/page/page_path
- `capture_screen`: 统一 capture_type/element_selector/fullPage
- `get_activity_statistics`: 统一 period/time_period → timeRange

---

## 🔄 修改文件

### 1. UnifiedIntelligenceService
**文件**: `server/src/services/ai-operator/unified-intelligence.service.ts`

**修改内容**:
```typescript
// 旧版本：硬编码17个工具定义
private getFunctionToolsDefinition() {
  return [
    { type: 'function', function: { name: 'query_past_activities', ... } },
    // ... 17个工具定义
  ];
}

// 新版本：使用工具注册中心
private getFunctionToolsDefinition() {
  const { toolRegistry, ToolScenario } = require('../ai/tools/core/tool-registry.service');
  const tools = toolRegistry.getToolsForScenario(ToolScenario.UNIFIED_INTELLIGENCE, {
    includeWebSearch: true
  });
  console.log(`✅ [UnifiedIntelligence] 从工具注册中心获取 ${tools.length} 个工具`);
  return tools;
}
```

**新增方法**:
```typescript
// 使用统一工具执行器的新版本
private async executeFunctionToolV2(toolCall: any, request: UserRequest) {
  const { toolExecutor } = require('../ai/tools/core/tool-executor.service');
  const result = await toolExecutor.execute({
    name: toolCall.function?.name || toolCall.name,
    arguments: toolCall.function?.arguments || toolCall.arguments,
    id: toolCall.id
  });
  return result;
}
```

---

## 📊 工具统计对比

### 修改前
| 位置 | 工具数量 | 重复工具 |
|------|----------|----------|
| UnifiedIntelligenceService | 17个 | 5个 |
| FunctionToolsService | 15个 | 5个 |
| ToolCallingService | 7个 | 0个 |
| **总计** | **39个定义** | **10个重复** |
| **唯一工具** | **31个** | - |

### 修改后
| 位置 | 工具数量 | 重复工具 |
|------|----------|----------|
| ToolRegistry (统一注册中心) | 31个 | 0个 |
| UnifiedIntelligenceService | 使用注册中心 | 0个 |
| FunctionToolsService | 使用注册中心 | 0个 |
| ToolCallingService | 使用注册中心 | 0个 |
| **总计** | **31个定义** | **0个重复** |

---

## 🎯 实施进度

### 阶段1: 创建基础设施 ✅
- [x] 创建 ToolRegistry 类
- [x] 定义工具接口和类型
- [x] 注册所有31个工具
- [x] 实现按类别、场景、权限获取工具

### 阶段2: 创建统一执行器 ✅
- [x] 创建 ToolExecutor 接口
- [x] 实现统一的工具执行逻辑
- [x] 整合现有的执行逻辑
- [x] 实现参数标准化

### 阶段3: 更新服务使用注册中心 🔄
- [x] 更新 UnifiedIntelligenceService
- [ ] 更新 FunctionToolsService
- [ ] 更新 ToolCallingService

### 阶段4: 测试验证 ⏳
- [ ] 测试所有工具正常工作
- [ ] 验证前端调用正常
- [ ] 性能测试
- [ ] 回归测试

### 阶段5: 清理和文档 ⏳
- [ ] 删除旧的工具定义代码
- [ ] 更新API文档
- [ ] 更新开发文档
- [ ] 添加工具使用示例

---

## 🔧 使用示例

### 1. 获取工具列表

```typescript
import { toolRegistry, ToolScenario, ToolCategory } from '@/services/ai/tools/core/tool-registry.service';

// 获取所有工具
const allTools = toolRegistry.getAllTools();
console.log(`总工具数: ${allTools.length}`);

// 按场景获取工具
const unifiedTools = toolRegistry.getToolsForScenario(ToolScenario.UNIFIED_INTELLIGENCE);
console.log(`统一智能中心工具: ${unifiedTools.length}个`);

// 按类别获取工具
const dataQueryTools = toolRegistry.getToolsByCategory(ToolCategory.DATA_QUERY);
console.log(`数据查询工具: ${dataQueryTools.length}个`);

// 按权限获取工具
const adminTools = toolRegistry.getToolsByRole('admin');
console.log(`管理员工具: ${adminTools.length}个`);
```

### 2. 执行工具

```typescript
import { toolExecutor } from '@/services/ai/tools/core/tool-executor.service';

// 执行单个工具
const result = await toolExecutor.execute({
  name: 'query_past_activities',
  arguments: { limit: 10 }
});

if (result.success) {
  console.log('工具执行成功:', result.data);
} else {
  console.error('工具执行失败:', result.error);
}

// 批量执行工具
const results = await toolExecutor.executeBatch([
  { name: 'query_past_activities', arguments: { limit: 10 } },
  { name: 'get_activity_statistics', arguments: { timeRange: 'last_month' } }
]);
```

### 3. 获取工具统计

```typescript
import { toolRegistry } from '@/services/ai/tools/core/tool-registry.service';

// 获取统计信息
const stats = toolRegistry.getStatistics();
console.log('工具统计:', stats);

// 打印注册信息
toolRegistry.printRegistry();
```

---

## 📝 迁移指南

### 对于 UnifiedIntelligenceService

**旧代码**:
```typescript
const FUNCTION_TOOLS = this.getFunctionToolsDefinition(); // 硬编码17个工具
```

**新代码**:
```typescript
const { toolRegistry, ToolScenario } = require('../ai/tools/core/tool-registry.service');
const FUNCTION_TOOLS = toolRegistry.getToolsForScenario(ToolScenario.UNIFIED_INTELLIGENCE);
```

### 对于 FunctionToolsService

**旧代码**:
```typescript
static getAvailableTools() {
  return [
    { name: "query_past_activities", ... },
    // ... 15个工具定义
  ];
}
```

**新代码**:
```typescript
static getAvailableTools() {
  const { toolRegistry, ToolScenario } = require('../ai/tools/core/tool-registry.service');
  return toolRegistry.getToolsForScenario(ToolScenario.FUNCTION_TOOLS);
}
```

### 对于 ToolCallingService

**旧代码**:
```typescript
public getAvailableTools(): ToolFunction[] {
  return [
    { name: "render_component", ... },
    // ... 7个工具定义
  ];
}
```

**新代码**:
```typescript
public getAvailableTools(): ToolFunction[] {
  const { toolRegistry, ToolScenario } = require('../ai/tools/core/tool-registry.service');
  return toolRegistry.getToolsForScenario(ToolScenario.TOOL_CALLING);
}
```

---

## 🎉 预期收益

### 短期收益
- ✅ 消除10个重复的工具定义
- ✅ 统一工具执行逻辑
- ✅ 降低维护成本
- ✅ 提高代码一致性

### 长期收益
- ✅ 更容易添加新工具
- ✅ 支持动态工具配置
- ✅ 支持A/B测试和灰度发布
- ✅ 更好的工具分类和管理
- ✅ 支持工具版本管理
- ✅ 更好的监控和统计

---

## ⚠️ 注意事项

1. **向后兼容**: 保留旧的工具执行方法，逐步迁移
2. **测试覆盖**: 确保所有工具都有测试覆盖
3. **性能监控**: 监控工具执行性能，确保无性能退化
4. **错误处理**: 统一的错误处理和日志记录
5. **文档更新**: 及时更新API文档和开发文档

---

**维护者**: AI Team  
**最后更新**: 2025-10-05  
**版本**: 1.0.0

